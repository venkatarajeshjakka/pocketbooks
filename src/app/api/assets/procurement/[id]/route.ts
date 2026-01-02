/**
 * Asset Procurement by ID API Route
 */

import { NextRequest } from 'next/server';
import { AssetProcurement } from '@/models';
import { handleGetById, handleUpdate, handleDelete } from '@/lib/api-helpers';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return handleGetById(id, AssetProcurement, ['vendorId']);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return handleUpdate(id, request, AssetProcurement);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return handleDelete(id, AssetProcurement);
}
