import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, handleGetById, errorResponse } from '@/lib/api-helpers';
import { ProcurementService } from '@/lib/services/procurement-service';
import {
    RawMaterialProcurement,
    TradingGoodsProcurement
} from '@/models';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import { ProcurementStatus } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/procurement/[type]/[id]
 * Get a single procurement by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await params;
    console.log(`[API] GET Procurement: type=${type}, id=${id}`);

    if (!['raw-material', 'raw-materials', 'trading-good', 'trading-goods'].includes(type)) {
        return errorResponse('Invalid procurement type', 400);
    }

    const normalizedType = (type === 'raw-material' || type === 'raw-materials') ? 'raw_material' : 'trading_good';
    const Model = normalizedType === 'raw_material' ? RawMaterialProcurement : TradingGoodsProcurement;
    const populatePaths = ['vendorId', normalizedType === 'raw_material' ? 'items.rawMaterialId' : 'items.tradingGoodId'];

    return handleGetById(id, Model as any, populatePaths);
}

/**
 * PUT /api/procurement/[type]/[id]
 * Update procurement details or status
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await params;

    if (!['raw-material', 'raw-materials', 'trading-good', 'trading-goods'].includes(type)) {
        return errorResponse('Invalid procurement type', 400);
    }

    const normalizedType = (type === 'raw-material' || type === 'raw-materials') ? 'raw_material' : 'trading_good';
    const Model = normalizedType === 'raw_material' ? RawMaterialProcurement : TradingGoodsProcurement;
    const body = await request.json();

    let session: mongoose.ClientSession | null = null;

    try {
        await connectToDatabase();
        session = await mongoose.startSession();
        session.startTransaction();

        let doc;

        // Use ProcurementService for all updates to ensure side effects (inventory, vendor balance) are handled
        doc = await ProcurementService.updateProcurement(
            id,
            normalizedType,
            body,
            session
        );

        await session.commitTransaction();

        revalidatePath(`/procurement/${type}`);
        revalidatePath(`/procurement/${type}/${id}`);
        revalidatePath('/inventory/raw-materials');
        revalidatePath('/inventory/trading-goods');
        revalidatePath('/inventory');
        revalidatePath('/vendors');

        return NextResponse.json({
            success: true,
            data: doc,
            message: 'Procurement updated successfully'
        });

    } catch (error: any) {
        if (session) await session.abortTransaction();
        console.error('Procurement Update Error:', error);
        return errorResponse(error.message || 'Failed to update procurement', 500);
    } finally {
        if (session) session.endSession();
    }
}

/**
 * DELETE /api/procurement/[type]/[id]
 * Delete a procurement
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    const { type, id } = await params;

    if (!['raw-material', 'raw-materials', 'trading-good', 'trading-goods'].includes(type)) {
        return errorResponse('Invalid procurement type', 400);
    }

    const normalizedType = (type === 'raw-material' || type === 'raw-materials') ? 'raw_material' : 'trading_good';
    let session: mongoose.ClientSession | null = null;

    try {
        await connectToDatabase();
        session = await mongoose.startSession();
        session.startTransaction();

        await ProcurementService.deleteProcurement(id, normalizedType, session);

        await session.commitTransaction();

        revalidatePath(`/procurement/${type}`);
        revalidatePath('/inventory/raw-materials');
        revalidatePath('/inventory/trading-goods');
        revalidatePath('/inventory');
        revalidatePath('/vendors');
        revalidatePath('/payments');

        return NextResponse.json({
            success: true,
            message: 'Procurement deleted successfully'
        });

    } catch (error: any) {
        if (session) await session.abortTransaction();
        console.error('Procurement Deletion Error:', error);
        return errorResponse(error.message || 'Failed to delete procurement', 500);
    } finally {
        if (session) session.endSession();
    }
}
