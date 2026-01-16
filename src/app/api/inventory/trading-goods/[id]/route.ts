/**
 * Individual Trading Good API Route
 */

import { NextRequest } from 'next/server';
import TradingGood from '@/models/TradingGood';
import TradingGoodsProcurement from '@/models/TradingGoodsProcurement';
import Sale from '@/models/Sale';
import { handleGetById, handleUpdate, handleDelete, errorResponse } from '@/lib/api-helpers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleGetById(id, TradingGood);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleUpdate(id, request, TradingGood, 'sku');
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Check for associated procurements
  const hasProcurements = await TradingGoodsProcurement.exists({ 'items.tradingGoodId': id });
  if (hasProcurements) {
    return errorResponse('Cannot delete trading good with associated procurement records.', 400);
  }

  // Check for associated sales
  const hasSales = await Sale.exists({ 'items.itemId': id, 'items.itemType': 'trading_good' });
  if (hasSales) {
    return errorResponse('Cannot delete trading good with existing sales records. Delete sales first.', 400);
  }

  return handleDelete(id, TradingGood);
}
