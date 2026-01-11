import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, handleGetAll, errorResponse } from '@/lib/api-helpers';
import { ProcurementService } from '@/lib/services/procurement-service';
import {
    RawMaterialProcurement,
    TradingGoodsProcurement
} from '@/models';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

/**
 * GET /api/procurement/[type]
 * List procurements of a specific type
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ type: string }> }
) {
    const { type } = await params;

    if (type !== 'raw-material' && type !== 'trading-good') {
        return errorResponse('Invalid procurement type', 400);
    }

    const normalizedType = type === 'raw-material' ? 'raw_material' : 'trading_good';
    const Model = normalizedType === 'raw_material' ? RawMaterialProcurement : TradingGoodsProcurement;

    // Use handleGetAll helper for listing
    return handleGetAll(request, Model as any, ['invoiceNumber', 'notes'], ['vendorId']);
}

/**
 * POST /api/procurement/[type]
 * Create a new procurement
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ type: string }> }
) {
    const { type } = await params;

    if (type !== 'raw-material' && type !== 'trading-good') {
        return errorResponse('Invalid procurement type', 400);
    }

    const normalizedType = type === 'raw-material' ? 'raw_material' : 'trading_good';
    const body = await request.json();
    const { initialPayment, ...procurementData } = body;

    let session: mongoose.ClientSession | null = null;

    try {
        await connectToDatabase();
        session = await mongoose.startSession();
        session.startTransaction();

        const procurement = await ProcurementService.createProcurement(
            normalizedType,
            procurementData,
            initialPayment,
            session
        );

        await session.commitTransaction();

        revalidatePath(`/procurement/${type}`);
        revalidatePath('/inventory');
        revalidatePath('/vendors');
        if (initialPayment) revalidatePath('/payments');

        return NextResponse.json({
            success: true,
            data: procurement,
            message: 'Procurement created successfully'
        }, { status: 201 });

    } catch (error: any) {
        if (session) await session.abortTransaction();
        console.error('Procurement Creation Error:', error);
        return errorResponse(error.message || 'Failed to create procurement', 500);
    } finally {
        if (session) session.endSession();
    }
}
