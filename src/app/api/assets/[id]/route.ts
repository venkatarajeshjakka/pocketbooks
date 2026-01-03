/**
 * Asset by ID API Route
 */

import { NextRequest } from 'next/server';
import { Asset } from '@/models';
import { handleGetById, handleUpdate, handleDelete } from '@/lib/api-helpers';
import { revalidatePath } from 'next/cache';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return handleGetById(id, Asset, ['vendorId']);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const response = await handleUpdate(id, request, Asset);
    if (response.status === 200) {
        revalidatePath('/assets');
    }
    return response;
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const response = await handleDelete(id, Asset);
    if (response.status === 200) {
        revalidatePath('/assets');
    }
    return response;
}
