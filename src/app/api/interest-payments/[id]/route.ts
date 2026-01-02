/**
 * Individual Interest Payment API Route
 */

import { NextRequest } from 'next/server';
import InterestPayment from '@/models/InterestPayment';
import { handleGetById, handleUpdate, handleDelete } from '@/lib/api-helpers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleGetById(id, InterestPayment);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleUpdate(id, request, InterestPayment);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleDelete(id, InterestPayment);
}
