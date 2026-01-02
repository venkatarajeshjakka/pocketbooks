/**
 * Individual Expense API Route
 */

import { NextRequest } from 'next/server';
import Expense from '@/models/Expense';
import { handleGetById, handleUpdate, handleDelete } from '@/lib/api-helpers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleGetById(id, Expense);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleUpdate(id, request, Expense);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleDelete(id, Expense);
}
