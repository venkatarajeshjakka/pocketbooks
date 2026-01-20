/**
 * Sales Payment API Route
 *
 * Handles payment operations for sales
 */

import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Payment from '@/models/Payment';
import { successResponse, errorResponse } from '@/lib/api-helpers';
import { SaleService } from '@/lib/services/sale-service';
import { revalidatePath } from 'next/cache';

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
    } catch (error) {
        console.error('GET /api/sales/[id]/payments error:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch payments';
        return errorResponse(message, 500);
    }
}

/**
 * POST /api/sales/[id]/payments
 * Record a new payment for a sale using SaleService
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    let session: mongoose.ClientSession | null = null;

    try {
        await connectToDatabase();
        session = await mongoose.startSession();
        session.startTransaction();

        const { id } = await params;
        const body = await request.json();

        // Validate required fields
        if (!body.amount || body.amount <= 0) {
            return errorResponse('Payment amount must be greater than 0', 400);
        }

        if (!body.paymentMethod) {
            return errorResponse('Payment method is required', 400);
        }

        // Determine tranche number
        const existingPaymentsCount = await Payment.countDocuments({ saleId: id }).session(session);
        const trancheNumber = existingPaymentsCount + 1;

        // Use SaleService.addPayment which handles validation and all side effects
        const payment = await SaleService.addPayment(
            id,
            {
                amount: body.amount,
                paymentMethod: body.paymentMethod,
                paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
                notes: body.notes,
                trancheNumber,
                totalTranches: body.totalTranches
            },
            session
        );

        await session.commitTransaction();

        // Revalidate related paths
        revalidatePath('/sales');
        revalidatePath(`/sales/${id}`);
        revalidatePath('/payments');
        revalidatePath('/clients');

        return successResponse(payment, 'Payment recorded successfully', 201);

    } catch (error) {
        if (session) await session.abortTransaction();
        console.error('POST /api/sales/[id]/payments error:', error);
        const message = error instanceof Error ? error.message : 'Failed to record payment';
        return errorResponse(message, 500);
    } finally {
        if (session) session.endSession();
    }
}
