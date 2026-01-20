/**
 * Sales Status API Route
 *
 * Handles status changes for sales with proper inventory and balance management
 */

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Sale from '@/models/Sale';
import { SaleService } from '@/lib/services/sale-service';
import { SaleStatus } from '@/types';
import { revalidatePath } from 'next/cache';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/sales/[id]/status
 * Get current status of a sale
 */
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        await connectToDatabase();
        const { id } = await params;

        const sale = await Sale.findById(id).select('status paymentStatus invoiceNumber');

        if (!sale) {
            return NextResponse.json(
                { success: false, error: 'Sale not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id: sale._id,
                invoiceNumber: sale.invoiceNumber,
                status: sale.status,
                paymentStatus: sale.paymentStatus
            }
        });
    } catch (error) {
        console.error('GET /api/sales/[id]/status error:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch sale status';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/sales/[id]/status
 * Update sale status with proper side effects
 */
export async function PUT(
    request: NextRequest,
    { params }: RouteParams
) {
    let session: mongoose.ClientSession | null = null;

    try {
        await connectToDatabase();
        session = await mongoose.startSession();
        session.startTransaction();

        const { id } = await params;
        const body = await request.json();

        // Validate status
        if (!body.status) {
            return NextResponse.json(
                { success: false, error: 'Status is required' },
                { status: 400 }
            );
        }

        if (!Object.values(SaleStatus).includes(body.status)) {
            return NextResponse.json(
                { success: false, error: `Invalid status. Must be one of: ${Object.values(SaleStatus).join(', ')}` },
                { status: 400 }
            );
        }

        // Use SaleService to handle status change with side effects
        const sale = await SaleService.updateSaleStatus(id, body.status, session);

        await session.commitTransaction();

        // Revalidate related paths
        revalidatePath('/sales');
        revalidatePath(`/sales/${id}`);
        revalidatePath('/clients');
        revalidatePath('/inventory');

        return NextResponse.json({
            success: true,
            data: sale,
            message: `Sale status updated to ${body.status}`
        });

    } catch (error) {
        if (session) await session.abortTransaction();
        console.error('PUT /api/sales/[id]/status error:', error);
        const message = error instanceof Error ? error.message : 'Failed to update sale status';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    } finally {
        if (session) session.endSession();
    }
}
