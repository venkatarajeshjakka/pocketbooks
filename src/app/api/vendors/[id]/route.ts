/**
 * Individual Vendor API Route
 */

import { NextRequest } from 'next/server';
import Vendor from '@/models/Vendor';
import { handleGetById, handleUpdate, handleDelete } from '@/lib/api-helpers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleGetById(id, Vendor);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleUpdate(id, request, Vendor, 'email');
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleDelete(id, Vendor);
}
