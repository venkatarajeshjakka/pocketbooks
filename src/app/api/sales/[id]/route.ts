
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Sale from '@/models/Sale';
import Client from '@/models/Client';
import TradingGood from '@/models/TradingGood';
import FinishedGood from '@/models/FinishedGood';
import { InventoryItemType, SaleStatus } from '@/types';
import { successResponse, errorResponse } from '@/lib/api-helpers';

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

    const sale = await Sale.findById(id).populate('clientId', 'name email phone');

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
 * Update a sale
 * NOTE: Complex logic needed for inventory adjustment if items change
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    const existingSale = await Sale.findById(id).session(session);
    if (!existingSale) {
      await session.abortTransaction();
      return errorResponse('Sale not found', 404);
    }

    // 1. Revert Inventory changes from existing sale
    for (const item of existingSale.items) {
      if (item.itemType === InventoryItemType.TRADING_GOOD) {
        await TradingGood.findByIdAndUpdate(
          item.itemId,
          { $inc: { currentStock: item.quantity } },
          { session }
        );
      } else if (item.itemType === InventoryItemType.FINISHED_GOOD) {
        await FinishedGood.findByIdAndUpdate(
          item.itemId,
          { $inc: { currentStock: item.quantity } },
          { session }
        );
      }
    }

    // 2. Revert Client Balance (Old Total)
    await Client.findByIdAndUpdate(
      existingSale.clientId,
      { $inc: { outstandingBalance: -existingSale.grandTotal } },
      { session }
    );

    // 3. Process New Items (Validate & Deduct Inventory)
    // Note: If body.items is not provided, we use existingSale.items, effectively just updating other fields but logic runs same
    const newItems = body.items || existingSale.items;

    // Additional logic needed: If body provides items, we need to map them to calculate new totals here or let mongoose do it.
    // If we let mongoose do it via pre-save, we don't know the new grandTotal yet to update Client balance properly unless we 
    // manually calc it here or save first. The safe bet is to manually set fields or save then update client.

    // Let's validate stock availability for NEW items
    for (const item of newItems) {
      let currentStock = 0;
      if (item.itemType === InventoryItemType.TRADING_GOOD) {
        const good = await TradingGood.findById(item.itemId).session(session);
        if (!good) throw new Error(`Trading Good not found: ${item.itemId}`);
        currentStock = good.currentStock;

        // Note: currentStock here includes the reverted amount from step 1 because we are in transaction and step 1 ran.
        // So we are checking against full availability.

        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${good.name}. Available: ${currentStock}, Requested: ${item.quantity}`);
        }

        await TradingGood.findByIdAndUpdate(item.itemId, { $inc: { currentStock: -item.quantity } }, { session });

      } else if (item.itemType === InventoryItemType.FINISHED_GOOD) {
        const good = await FinishedGood.findById(item.itemId).session(session);
        if (!good) throw new Error(`Finished Good not found: ${item.itemId}`);
        currentStock = good.currentStock;

        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${good.name}. Available: ${currentStock}, Requested: ${item.quantity}`);
        }

        await FinishedGood.findByIdAndUpdate(item.itemId, { $inc: { currentStock: -item.quantity } }, { session });
      }
    }

    // 4. Update Sale Fields
    // We update fields on the document. Mongoose set() or assign.
    // Ensure we handle the nested objects correctly if needed.

    if (body.items) {
      // Recalculate amounts manually to be passed if pre-save logic expects them or just set items and let pre-save handle totals.
      // My pre-save hook calculates totals from items. So just setting items is enough.
      existingSale.items = body.items;
    }

    if (body.gstPercentage !== undefined) existingSale.gstPercentage = body.gstPercentage;
    if (body.discount !== undefined) existingSale.discount = body.discount;
    if (body.clientId) existingSale.clientId = body.clientId;
    if (body.paymentTerms) existingSale.paymentTerms = body.paymentTerms;
    if (body.notes) existingSale.notes = body.notes;
    // ... map other fields

    // Save to trigger pre-save hook and get new totals
    await existingSale.save({ session });

    // 5. Update Client Balance with NEW total
    // existingSale.grandTotal is now updated because save() was called
    await Client.findByIdAndUpdate(
      existingSale.clientId,
      { $inc: { outstandingBalance: existingSale.grandTotal } },
      { session }
    );

    await session.commitTransaction();
    return successResponse(existingSale, 'Sale updated successfully');

  } catch (error: any) {
    await session.abortTransaction();
    console.error('PUT /api/sales/[id] error:', error);
    return errorResponse(error.message || 'Failed to update sale', 500);
  } finally {
    session.endSession();
  }
}

/**
 * DELETE /api/sales/[id]
 * Cancel/Delete a sale
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectToDatabase();
    const { id } = await params;

    const sale = await Sale.findById(id).session(session);
    if (!sale) {
      await session.abortTransaction();
      return errorResponse('Sale not found', 404);
    }

    // 1. Restore Inventory
    for (const item of sale.items) {
      if (item.itemType === InventoryItemType.TRADING_GOOD) {
        await TradingGood.findByIdAndUpdate(
          item.itemId,
          { $inc: { currentStock: item.quantity } },
          { session }
        );
      } else if (item.itemType === InventoryItemType.FINISHED_GOOD) {
        await FinishedGood.findByIdAndUpdate(
          item.itemId,
          { $inc: { currentStock: item.quantity } },
          { session }
        );
      }
    }

    // 2. Revert Client Balance
    await Client.findByIdAndUpdate(
      sale.clientId,
      { $inc: { outstandingBalance: -sale.grandTotal } },
      { session }
    );

    // 3. Delete Sale
    await Sale.findByIdAndDelete(id, { session });

    await session.commitTransaction();
    return successResponse({ id }, 'Sale deleted successfully');
  } catch (error: any) {
    await session.abortTransaction();
    return errorResponse(error.message || 'Failed to delete sale', 500);
  } finally {
    session.endSession();
  }
}
