/**
 * Individual Sale API Route
 */

import { NextRequest } from 'next/server';
import Sale from '@/models/Sale';
import { handleGetById, handleDelete } from '@/lib/api-helpers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleGetById(id, Sale, ['clientId']);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleDelete(id, Sale);
}
