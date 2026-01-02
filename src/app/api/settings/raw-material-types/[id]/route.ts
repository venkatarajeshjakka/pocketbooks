/**
 * Raw Material Type Individual ID API Route
 * 
 * Handles fetching, updating, and deleting a specific type
 */

import { NextRequest } from 'next/server';
import { RawMaterialType } from '@/models';
import { handleGetById, handleUpdate, handleDelete } from '@/lib/api-helpers';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(
    _request: NextRequest,
    { params }: RouteParams
) {
    const { id } = await params;
    return handleGetById(id, RawMaterialType);
}

export async function PUT(
    request: NextRequest,
    { params }: RouteParams
) {
    const { id } = await params;
    return handleUpdate(id, request, RawMaterialType, 'name');
}

export async function DELETE(
    _request: NextRequest,
    { params }: RouteParams
) {
    const { id } = await params;
    return handleDelete(id, RawMaterialType);
}
