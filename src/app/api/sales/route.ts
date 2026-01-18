/**
 * Sales API Route
 *
 * Handles sales transactions with inventory updates
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Sale from '@/models/Sale';
import Client from '@/models/Client';
import RawMaterial from '@/models/RawMaterial';
import TradingGood from '@/models/TradingGood';
import FinishedGood from '@/models/FinishedGood';
import { handleGetAll, successResponse, errorResponse } from '@/lib/api-helpers';
import { ISaleInput, InventoryItemType } from '@/types';
import { generateInvoiceNumber } from '@/lib/utils';

export async function GET(request: NextRequest) {
  return handleGetAll(request, Sale, ['invoiceNumber']);
}

/**
 * POST /api/sales
 * Create a new sale with inventory updates in a transaction
 */
export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectToDatabase();

    const body: ISaleInput = await request.json();

    // Validate client exists
    const client = await Client.findById(body.clientId).session(session);
    if (!client) {
      await session.abortTransaction();
      return errorResponse('Client not found', 404);
    }

    // Validate stock availability and get item details
    for (const item of body.items) {
      let inventoryItem: any;

      switch (item.itemType) {
        case InventoryItemType.RAW_MATERIAL:
          inventoryItem = await RawMaterial.findById(item.itemId).session(session);
          break;
        case InventoryItemType.TRADING_GOOD:
          inventoryItem = await TradingGood.findById(item.itemId).session(session);
          break;
        case InventoryItemType.FINISHED_GOOD:
          inventoryItem = await FinishedGood.findById(item.itemId).session(session);
          break;
        default:
          await session.abortTransaction();
          return errorResponse(`Invalid item type: ${item.itemType}`, 400);
      }

      if (!inventoryItem) {
        await session.abortTransaction();
        return errorResponse(`Item not found: ${item.itemId}`, 404);
      }

      if (inventoryItem.currentStock < item.quantity) {
        await session.abortTransaction();
        return errorResponse(
          `Insufficient stock for ${inventoryItem.name}. Available: ${inventoryItem.currentStock}, Requested: ${item.quantity}`,
          400
        );
      }
    }

    // Generate invoice number if not provided
    const invoiceNumber = generateInvoiceNumber('INV');

    // Calculate amounts (logic consistent with Sale model, but re-calculated here for Client update)
    const items = body.items.map((item) => ({
      ...item,
      amount: item.quantity * item.unitPrice,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const discount = body.discount || 0;
    const gstPercentage = body.gstPercentage || 0;

    // Calculate derived amounts
    const originalPrice = subtotal - discount;
    const gstAmount = (originalPrice * gstPercentage) / 100;
    const grandTotal = originalPrice + gstAmount;

    // Create sale
    const sale = await Sale.create(
      [
        {
          ...body,
          items,
          subtotal,
          discount,
          gstPercentage,
          originalPrice,
          gstAmount,
          gstBillPrice: grandTotal,
          grandTotal,
          balanceAmount: grandTotal, // Initial balance is full amount
          invoiceNumber,
          paymentTerms: body.paymentTerms,
          // New date fields if provided
          expectedDeliveryDate: body.expectedDeliveryDate,
          actualDeliveryDate: body.actualDeliveryDate,
        },
      ],
      { session }
    );

    // Update inventory stock
    for (const item of body.items) {
      switch (item.itemType) {
        case InventoryItemType.RAW_MATERIAL:
          await RawMaterial.findByIdAndUpdate(
            item.itemId,
            { $inc: { currentStock: -item.quantity } },
            { session }
          );
          break;
        case InventoryItemType.TRADING_GOOD:
          await TradingGood.findByIdAndUpdate(
            item.itemId,
            { $inc: { currentStock: -item.quantity } },
            { session }
          );
          break;
        case InventoryItemType.FINISHED_GOOD:
          await FinishedGood.findByIdAndUpdate(
            item.itemId,
            { $inc: { currentStock: -item.quantity } },
            { session }
          );
          break;
      }
    }

    // Update client outstanding balance
    await Client.findByIdAndUpdate(
      body.clientId,
      { $inc: { outstandingBalance: grandTotal } },
      { session }
    );

    await session.commitTransaction();

    return successResponse(sale[0], 'Sale created successfully', 201);
  } catch (error: any) {
    await session.abortTransaction();
    console.error('POST /api/sales error:', error);

    if (error.name === 'ValidationError') {
      return errorResponse(error.message, 400);
    }

    return errorResponse(error.message || 'Failed to create sale', 500);
  } finally {
    session.endSession();
  }
}
