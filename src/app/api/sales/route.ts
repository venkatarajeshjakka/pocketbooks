/**
 * Sales API Route
 *
 * Handles sales transactions with inventory updates
 */

import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Sale from '@/models/Sale';
import { handleGetAll, successResponse, errorResponse } from '@/lib/api-helpers';
import { generateInvoiceNumber } from '@/lib/utils';
import { SaleService } from '@/lib/services/sale-service';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  return handleGetAll(request, Sale, ['invoiceNumber']);
}

/**
 * POST /api/sales
 * Create a new sale with inventory updates using SaleService
 */
export async function POST(request: NextRequest) {
  let session: mongoose.ClientSession | null = null;

  try {
    await connectToDatabase();
    session = await mongoose.startSession();
    session.startTransaction();

    const body = await request.json();
    const { initialPayment, ...saleData } = body;

    // Validate required fields
    if (!saleData.clientId) {
      return errorResponse('Client is required', 400);
    }

    if (!saleData.items || !Array.isArray(saleData.items) || saleData.items.length === 0) {
      return errorResponse('At least one item is required', 400);
    }

    // Validate each item
    for (const item of saleData.items) {
      if (!item.itemId || !item.itemType) {
        return errorResponse('Each item must have itemId and itemType', 400);
      }
      if (!item.quantity || item.quantity <= 0) {
        return errorResponse('Each item must have a positive quantity', 400);
      }
      if (item.unitPrice === undefined || item.unitPrice < 0) {
        return errorResponse('Each item must have a non-negative unit price', 400);
      }
    }

    // Add invoice number if missing
    if (!saleData.invoiceNumber) {
      saleData.invoiceNumber = generateInvoiceNumber('INV');
    }

    const sale = await SaleService.createSale(
      saleData,
      initialPayment,
      session
    );

    await session.commitTransaction();

    // Revalidate related paths
    revalidatePath('/sales');
    revalidatePath('/payments');
    revalidatePath('/clients');
    revalidatePath('/inventory');

    return successResponse(sale, 'Sale created successfully', 201);
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error('POST /api/sales error:', error);

    if (error instanceof Error && error.name === 'ValidationError') {
      return errorResponse(error.message, 400);
    }

    const message = error instanceof Error ? error.message : 'Failed to create sale';
    return errorResponse(message, 500);
  } finally {
    if (session) session.endSession();
  }
}
