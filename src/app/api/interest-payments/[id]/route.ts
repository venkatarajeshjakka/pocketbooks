/**
 * Interest Payment Individual Resource API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { InterestPayment, LoanAccount, Expense, Payment } from '@/models';
import { handleGetById, connectToDatabase, errorResponse, successResponse } from '@/lib/api-helpers';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetById(id, InterestPayment, ['loanAccountId', 'expenseId', 'paymentId']);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let session: mongoose.ClientSession | null = null;

  try {
    await connectToDatabase();
    session = await mongoose.startSession();
    session.startTransaction();

    const body = await request.json();
    const { principalAmount, interestAmount, date, paymentMethod, notes } = body;

    // 1. Find the old interest payment
    const oldPayment = await InterestPayment.findById(id).session(session);
    if (!oldPayment) {
      await session.abortTransaction();
      return errorResponse('Interest payment not found', 404);
    }

    // 2. Find and Revert old impact on Loan Account
    const loanAccount = await LoanAccount.findById(oldPayment.loanAccountId).session(session);
    if (loanAccount) {
      loanAccount.totalInterestPaid -= oldPayment.interestAmount;
      loanAccount.totalPrincipalPaid -= oldPayment.principalAmount;
      loanAccount.outstandingAmount += oldPayment.principalAmount;

      // Adjust to new values
      loanAccount.totalInterestPaid += interestAmount;
      loanAccount.totalPrincipalPaid += principalAmount;
      loanAccount.outstandingAmount -= principalAmount;

      // Ensure outstanding doesn't exceed principal
      if (loanAccount.outstandingAmount > loanAccount.principalAmount) {
        loanAccount.outstandingAmount = loanAccount.principalAmount;
      }

      await loanAccount.save({ session });
    }

    // 3. Update associated Expense
    if (oldPayment.expenseId) {
      await Expense.findByIdAndUpdate(oldPayment.expenseId, {
        amount: principalAmount + interestAmount,
        date,
        notes: `Interest payment for ${loanAccount?.bankName || 'Loan'}: ${notes || ''}`
      }).session(session);
    }

    // 4. Update associated Payment
    if (oldPayment.paymentId) {
      await Payment.findByIdAndUpdate(oldPayment.paymentId, {
        amount: principalAmount + interestAmount,
        date,
        paymentMethod,
        notes: `Interest payment for ${loanAccount?.bankName || 'Loan'}: ${notes || ''}`
      }).session(session);
    }

    // 5. Update the Interest Payment itself
    const updatedPayment = await InterestPayment.findByIdAndUpdate(id, {
      principalAmount,
      interestAmount,
      totalAmount: principalAmount + interestAmount,
      date,
      paymentMethod,
      notes
    }, { new: true }).session(session);

    await session.commitTransaction();

    // Revalidate paths
    revalidatePath('/loan-accounts');
    revalidatePath('/interest-payments');
    revalidatePath('/expenses');
    revalidatePath('/payments');

    return successResponse(updatedPayment, 'Interest payment updated successfully');

  } catch (error: any) {
    if (session) await session.abortTransaction();
    console.error('Interest Payment Update Error:', error);
    return errorResponse(error.message || 'Failed to update interest payment', 500);
  } finally {
    if (session) session.endSession();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let session: mongoose.ClientSession | null = null;

  try {
    await connectToDatabase();
    session = await mongoose.startSession();
    session.startTransaction();

    // 1. Find the interest payment
    const payment = await InterestPayment.findById(id).session(session);
    if (!payment) {
      await session.abortTransaction();
      return errorResponse('Interest payment not found', 404);
    }

    // 2. Update Loan Account (Reverse the amounts)
    const loanAccount = await LoanAccount.findById(payment.loanAccountId).session(session);
    if (loanAccount) {
      loanAccount.totalInterestPaid -= payment.interestAmount;
      loanAccount.totalPrincipalPaid -= payment.principalAmount;
      loanAccount.outstandingAmount += payment.principalAmount;

      // Ensure outstanding doesn't exceed principal
      if (loanAccount.outstandingAmount > loanAccount.principalAmount) {
        loanAccount.outstandingAmount = loanAccount.principalAmount;
      }

      await loanAccount.save({ session });
    }

    // 3. Delete associated Expense
    if (payment.expenseId) {
      await Expense.findByIdAndDelete(payment.expenseId).session(session);
    }

    // 4. Delete associated Payment
    if (payment.paymentId) {
      await Payment.findByIdAndDelete(payment.paymentId).session(session);
    }

    // 5. Delete the Interest Payment itself
    await InterestPayment.findByIdAndDelete(id).session(session);

    await session.commitTransaction();

    // Revalidate paths
    revalidatePath('/loan-accounts');
    revalidatePath('/interest-payments');
    revalidatePath('/expenses');
    revalidatePath('/payments');

    return successResponse(null, 'Interest payment and associated records deleted successfully');

  } catch (error: any) {
    if (session) await session.abortTransaction();
    console.error('Interest Payment Deletion Error:', error);
    return errorResponse(error.message || 'Failed to delete interest payment', 500);
  } finally {
    if (session) {
      session.endSession();
    }
  }
}
