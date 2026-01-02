/**
 * Raw Material Types API Route
 * 
 * Handles fetching all types and creating new ones
 */

import { NextRequest } from 'next/server';
import { RawMaterialType } from '@/models';
import { handleGetAll, handleCreate } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
    return handleGetAll(request, RawMaterialType, ['name', 'description']);
}

export async function POST(request: NextRequest) {
    return handleCreate(request, RawMaterialType, 'name');
}
