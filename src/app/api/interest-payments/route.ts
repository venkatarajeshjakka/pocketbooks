/**
 * Interest Payments API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { InterestPayment, LoanAccount, Expense, Payment } from '@/models';
import { handleGetAll, connectToDatabase, errorResponse } from '@/lib/api-helpers';
import { ExpenseCategory, TransactionType, AccountType, PartyType } from '@/types';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleGetAll(request, InterestPayment, ['notes'], ['loanAccountId']);
}

export async function POST(request: NextRequest) {
  let session: mongoose.ClientSession | null = null;

  try {
    await connectToDatabase();
    const body = await request.json();

    const {
      loanAccountId,
      date,
      principalAmount,
      interestAmount,
      paymentMethod,
      notes
    } = body;

    // Validate input
    if (!loanAccountId || interestAmount === undefined || !paymentMethod) {
      return errorResponse('Missing required fields for interest payment', 400);
    }

    // Start transaction
    session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Verify loan account exists
      const loanAccount = await LoanAccount.findById(loanAccountId).session(session);
      if (!loanAccount) {
        throw new Error('Loan account not found');
      }

      // 2. Create Interest Payment record
      const interestPaymentData = {
        loanAccountId,
        date: date || new Date(),
        principalAmount: principalAmount || 0,
        interestAmount,
        paymentMethod,
        notes
      };
      const interestPayment = new InterestPayment(interestPaymentData);
      await interestPayment.save({ session });

      // 3. Create Expense entry
      const expense = new Expense({
        date: date || new Date(),
        category: ExpenseCategory.INTEREST,
        description: `Interest payment for Loan: ${loanAccount.bankName} (${loanAccount.accountNumber})`,
        amount: principalAmount + interestAmount,
        paymentMethod: paymentMethod,
        notes: notes || `Interest: ${interestAmount}, Principal: ${principalAmount}`
      });
      await expense.save({ session });

      // 4. Create Payment entry
      const payment = new Payment({
        paymentDate: date || new Date(),
        amount: principalAmount + interestAmount,
        paymentMethod: paymentMethod,
        transactionType: TransactionType.EXPENSE,
        accountType: AccountType.PAYABLE,
        expenseId: expense._id,
        notes: notes || `Payment for interest/principal on loan ${loanAccount.accountNumber}`
      });
      await payment.save({ session });

      // Link payment to expense and vice versa if needed
      expense.paymentId = payment._id;
      await expense.save({ session });

      interestPayment.expenseId = expense._id;
      interestPayment.paymentId = payment._id;
      await interestPayment.save({ session });

      // 5. Update Loan Account balance
      loanAccount.totalInterestPaid += interestAmount;
      loanAccount.totalPrincipalPaid += (principalAmount || 0);
      loanAccount.outstandingAmount -= (principalAmount || 0);

      // Safety check: outstanding amount shouldn't go below 0
      if (loanAccount.outstandingAmount < 0) {
        loanAccount.outstandingAmount = 0;
      }

      await loanAccount.save({ session });

      await session.commitTransaction();

      // Revalidate relevant paths
      revalidatePath('/loan-accounts');
      revalidatePath('/interest-payments');
      revalidatePath('/expenses');
      revalidatePath('/payments');

      return NextResponse.json({
        success: true,
        data: interestPayment,
        message: 'Interest payment recorded successfully'
      }, { status: 201 });

    } catch (transactionError: any) {
      await session.abortTransaction();
      throw transactionError;
    }
  } catch (error: any) {
    console.error('Interest Payment Registration Error:', error);
    return errorResponse(error.message || 'Failed to record interest payment', 500);
  } finally {
    if (session) {
      session.endSession();
    }
  }
}
