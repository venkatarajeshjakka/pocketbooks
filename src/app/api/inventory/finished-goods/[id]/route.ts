/**
 * Individual Finished Good API Route
 */

import { NextRequest } from 'next/server';
import FinishedGood from '@/models/FinishedGood';
import { handleGetById, handleUpdate, handleDelete } from '@/lib/api-helpers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleGetById(id, FinishedGood, ['rawMaterialsUsed.rawMaterialId']);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleUpdate(id, request, FinishedGood, 'sku');
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleDelete(id, FinishedGood);
}
