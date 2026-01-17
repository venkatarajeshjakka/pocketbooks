/**
 * Individual Vendor API Route
 */

import { NextRequest } from 'next/server';
import Vendor from '@/models/Vendor';
import Asset from '@/models/Asset';
import RawMaterialProcurement from '@/models/RawMaterialProcurement';
import TradingGoodsProcurement from '@/models/TradingGoodsProcurement';
import Payment from '@/models/Payment';
import { handleGetById, handleUpdate, handleDelete, errorResponse } from '@/lib/api-helpers';

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

  // Check for associated assets
  const hasAssets = await Asset.exists({ vendorId: id });
  if (hasAssets) {
    return errorResponse('Cannot delete vendor with existing asset records. Delete assets first.', 400);
  }

  // Check for associated raw material procurements
  const hasRMProcurements = await RawMaterialProcurement.exists({ vendorId: id });
  if (hasRMProcurements) {
    return errorResponse('Cannot delete vendor with associated raw material procurements.', 400);
  }

  // Check for associated trading goods procurements
  const hasTGProcurements = await TradingGoodsProcurement.exists({ vendorId: id });
  if (hasTGProcurements) {
    return errorResponse('Cannot delete vendor with associated trading goods procurements.', 400);
  }

  // Check for associated payments
  const hasPayments = await Payment.exists({ partyId: id });
  if (hasPayments) {
    return errorResponse('Cannot delete vendor with existing payment history. Delete payments first.', 400);
  }

  return handleDelete(id, Vendor);
}
