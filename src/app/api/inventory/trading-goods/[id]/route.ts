/**
 * Individual Trading Good API Route
 */

import { NextRequest } from 'next/server';
import TradingGood from '@/models/TradingGood';
import { handleGetById, handleUpdate, handleDelete } from '@/lib/api-helpers';

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
  return handleDelete(id, TradingGood);
}
