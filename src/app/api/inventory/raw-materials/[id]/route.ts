/**
 * Individual Raw Material API Route
 */

import { NextRequest } from 'next/server';
import RawMaterial from '@/models/RawMaterial';
import RawMaterialProcurement from '@/models/RawMaterialProcurement';
import FinishedGood from '@/models/FinishedGood';
import { handleGetById, handleUpdate, handleDelete, errorResponse } from '@/lib/api-helpers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleGetById(id, RawMaterial, ['intendedFor']);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleUpdate(id, request, RawMaterial);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Check if used in any Finished Good BOM
  const isUsedInBOM = await FinishedGood.exists({ 'bom.rawMaterialId': id });
  if (isUsedInBOM) {
    return errorResponse('Cannot delete raw material used in a Finished Good Bill of Materials.', 400);
  }

  // Check if has associated procurements
  const hasProcurements = await RawMaterialProcurement.exists({ 'items.rawMaterialId': id });
  if (hasProcurements) {
    return errorResponse('Cannot delete raw material with associated procurement records.', 400);
  }

  return handleDelete(id, RawMaterial);
}
