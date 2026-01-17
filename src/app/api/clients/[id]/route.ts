/**
 * Individual Client API Route
 */

import { NextRequest } from 'next/server';
import Client from '@/models/Client';
import Sale from '@/models/Sale';
import Payment from '@/models/Payment';
import { handleGetById, handleUpdate, handleDelete, errorResponse } from '@/lib/api-helpers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleGetById(id, Client);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleUpdate(id, request, Client, 'email');
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Check for associated sales
  const hasSales = await Sale.exists({ clientId: id });
  if (hasSales) {
    return errorResponse('Cannot delete client with existing sales records. Delete sales first.', 400);
  }

  // Check for associated payments
  const hasPayments = await Payment.exists({ partyId: id });
  if (hasPayments) {
    return errorResponse('Cannot delete client with existing payment history. Delete payments first.', 400);
  }

  return handleDelete(id, Client);
}
