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
import { SaleService } from '@/lib/services/sale-service';

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

    return successResponse(sale, 'Sale created successfully', 201);
  } catch (error: any) {
    if (session) await session.abortTransaction();
    console.error('POST /api/sales error:', error);

    if (error.name === 'ValidationError') {
      return errorResponse(error.message, 400);
    }

    return errorResponse(error.message || 'Failed to create sale', 500);
  } finally {
    if (session) session.endSession();
  }
}
