
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Sale from '@/models/Sale';
import Client from '@/models/Client';
import RawMaterial from '@/models/RawMaterial';
import TradingGood from '@/models/TradingGood';
import FinishedGood from '@/models/FinishedGood';
import Payment from '@/models/Payment';
import { InventoryItemType } from '@/types';
import { successResponse, errorResponse } from '@/lib/api-helpers';
import { SaleService } from '@/lib/services/sale-service';

/**
 * GET /api/sales/[id]
 * Fetch a single sale by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const sale = await Sale.findById(id)
      .populate('clientId', 'name email phone')
      .populate('items.itemId');

    if (!sale) {
      return errorResponse('Sale not found', 404);
    }

    return successResponse(sale, 'Sale fetched successfully');
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch sale', 500);
  }
}

/**
 * PUT /api/sales/[id]
 * Update a sale using SaleService
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let session: mongoose.ClientSession | null = null;

  try {
    await connectToDatabase();
    session = await mongoose.startSession();
    session.startTransaction();

    const { id } = await params;
    const body = await request.json();

    const sale = await SaleService.updateSale(id, body, session);

    await session.commitTransaction();
    return successResponse(sale, 'Sale updated successfully');

  } catch (error: any) {
    if (session) await session.abortTransaction();
    console.error('PUT /api/sales/[id] error:', error);
    return errorResponse(error.message || 'Failed to update sale', 500);
  } finally {
    if (session) session.endSession();
  }
}

/**
 * DELETE /api/sales/[id]
 * Cancel/Delete a sale using SaleService
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let session: mongoose.ClientSession | null = null;

  try {
    await connectToDatabase();
    session = await mongoose.startSession();
    session.startTransaction();

    const { id } = await params;

    await SaleService.deleteSale(id, session);

    await session.commitTransaction();
    return successResponse({ id }, 'Sale deleted successfully');
  } catch (error: any) {
    if (session) await session.abortTransaction();
    console.error('DELETE /api/sales/[id] error:', error);
    return errorResponse(error.message || 'Failed to delete sale', 500);
  } finally {
    if (session) session.endSession();
  }
}
