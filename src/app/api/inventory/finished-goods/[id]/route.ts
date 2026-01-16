/**
 * Individual Finished Good API Route
 */

import { NextRequest } from 'next/server';
import FinishedGood from '@/models/FinishedGood';
import Sale from '@/models/Sale';
import { handleGetById, handleUpdate, handleDelete, errorResponse } from '@/lib/api-helpers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleGetById(id, FinishedGood, ['bom.rawMaterialId']);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleUpdate(id, request, FinishedGood, 'sku');
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Check for associated sales
  const hasSales = await Sale.exists({ 'items.itemId': id, 'items.itemType': 'finished_good' });
  if (hasSales) {
    return errorResponse('Cannot delete finished good with existing sales records. Delete sales first.', 400);
  }

  return handleDelete(id, FinishedGood);
}
