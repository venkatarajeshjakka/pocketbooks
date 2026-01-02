/**
 * Assets API Route
 */

import { NextRequest } from 'next/server';
import { Asset } from '@/models';
import { handleGetAll, handleCreate } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
    return handleGetAll(request, Asset, ['name', 'category', 'location']);
}

export async function POST(request: NextRequest) {
    return handleCreate(request, Asset);
}
