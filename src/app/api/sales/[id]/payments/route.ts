
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Sale from '@/models/Sale';
import Payment from '@/models/Payment';
import { TransactionType, AccountType, PartyType, PaymentStatus, IPayment } from '@/types';
import { successResponse, errorResponse } from '@/lib/api-helpers';

/**
 * GET /api/sales/[id]/payments
 * Get all payments for a sale
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;

        const payments = await Payment.find({ saleId: id }).sort({ paymentDate: -1 });

        return successResponse(payments, 'Payments fetched successfully');
    } catch (error: any) {
        return errorResponse(error.message || 'Failed to fetch payments', 500);
    }
}

/**
 * POST /api/sales/[id]/payments
 * Record a new payment for a sale
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await connectToDatabase();
        const { id } = await params;
        const body = await request.json();

        const sale = await Sale.findById(id).session(session);
        if (!sale) {
            await session.abortTransaction();
            return errorResponse('Sale not found', 404);
        }

        // Determine current tranche number
        const existingPaymentsCount = await Payment.countDocuments({ saleId: id }).session(session);
        const trancheNumber = existingPaymentsCount + 1;

        // Note: totalTranches might be passed in body if we want to set it, or it stays as is.

        const paymentData = {
            ...body,
            saleId: id,
            partyId: sale.clientId, // Link to Client
            partyType: PartyType.CLIENT,
            transactionType: TransactionType.SALE,
            accountType: AccountType.RECEIVABLE, // Incoming money
            trancheNumber,
            // totalTranches can be updated if passed
        };

        const payment = await Payment.create([paymentData], { session });

        // Update Sale totalPaid and Status
        // We can rely on `Sale` model or logic here. The Sale model doesn't automatically listen to Payment streams.
        // So we must update Sale explicitly.

        const newTotalPaid = (sale.totalPaid || 0) + body.amount;

        let newPaymentStatus = PaymentStatus.PARTIALLY_PAID;
        if (newTotalPaid >= sale.grandTotal) {
            newPaymentStatus = PaymentStatus.FULLY_PAID;
        } else if (newTotalPaid === 0) { // Unlikely here since we just added amount > 0 check usually
            newPaymentStatus = PaymentStatus.UNPAID;
        }

        await Sale.findByIdAndUpdate(
            id,
            {
                $set: {
                    totalPaid: newTotalPaid,
                    paymentStatus: newPaymentStatus,
                    // recalculate remaining
                    remainingAmount: Math.max(0, sale.grandTotal - newTotalPaid)
                }
            },
            { session }
        );

        // Also need to decrease Client Outstanding Balance?
        // When a Sale is made, Client Balance increases (Receivable).
        // When Payment is made, Client Balance should decrease (We received money).
        // Note: In Sale creation we inc outstandingBalance.

        // Need to verify Client model: outstandingBalance usually means "Amount they owe us".
        // So Payment should reduce it.

        // Wait, Client model has `outstandingBalance`.
        // Sale POST: $inc outstandingBalance by grandTotal. Correct.
        // Payment POST: $inc outstandingBalance by -amount. Correct.

        // But check if Payment model triggers this? Payment model logic is minimal in the provided file.
        // So we do it here manually to be safe.

        await import('@/models/Client').then(async ({ default: Client }) => {
            await Client.findByIdAndUpdate(
                sale.clientId,
                { $inc: { outstandingBalance: -body.amount } },
                { session }
            );
        });

        await session.commitTransaction();
        return successResponse(payment[0], 'Payment recorded successfully', 201);

    } catch (error: any) {
        await session.abortTransaction();
        console.error('POST /api/sales/[id]/payments error:', error);
        return errorResponse(error.message || 'Failed to record payment', 500);
    } finally {
        session.endSession();
    }
}
