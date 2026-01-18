/**
 * Finished Goods API Route
 */

import { NextRequest } from 'next/server';
import FinishedGood from '@/models/FinishedGood';
import { handleGetAll, handleCreate } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  return handleGetAll(request, FinishedGood, ['name', 'sku'], ['bom.rawMaterialId']);
}

import { InventoryService } from '@/lib/services/inventory-service';
import mongoose from 'mongoose';
import { successResponse, errorResponse, connectToDatabase } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  let session: mongoose.ClientSession | null = null;

  try {
    await connectToDatabase();
    session = await mongoose.startSession();
    session.startTransaction();

    const body = await request.json();
    const initialStock = body.currentStock || 0;

    // 1. Create the definition
    const fg = new FinishedGood({
      ...body,
      currentStock: 0 // Reset to 0 for production step
    });
    await fg.save({ session });

    // 2. If initial stock is provided, "produce" it
    if (initialStock > 0) {
      await InventoryService.produceFinishedGood(fg._id.toString(), initialStock, session);
    }

    await session.commitTransaction();

    // Re-fetch to get updated stock
    const updatedFg = await FinishedGood.findById(fg._id);

    return successResponse(updatedFg, 'Finished good created and produced successfully', 201);
  } catch (error: any) {
    if (session) await session.abortTransaction();
    console.error('POST /api/inventory/finished-goods error:', error);
    return errorResponse(error.message || 'Failed to create finished good', 500);
  } finally {
    if (session) session.endSession();
  }
}
