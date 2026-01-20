import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Sale from '@/models/Sale';
import { successResponse, errorResponse } from '@/lib/api-helpers';
import { SaleService } from '@/lib/services/sale-service';
import { revalidatePath } from 'next/cache';

/**
 * GET /api/sales/[id]
 * Fetch a single sale by ID with payment summary
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
      .populate('items.itemId')
      .populate('payments');

    if (!sale) {
      return errorResponse('Sale not found', 404);
    }

    // Add payment summary to response
    const saleObj = sale.toObject();
    const payments = (saleObj as unknown as { payments?: Array<unknown> }).payments || [];
    const responseData = {
      ...saleObj,
      paymentSummary: {
        totalPayments: payments.length,
        totalPaid: sale.totalPaid || 0,
        remainingAmount: sale.remainingAmount || 0,
        paymentStatus: sale.paymentStatus
      }
    };

    return successResponse(responseData, 'Sale fetched successfully');
  } catch (error) {
    console.error('GET /api/sales/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch sale';
    return errorResponse(message, 500);
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

    // Revalidate related paths
    revalidatePath('/sales');
    revalidatePath(`/sales/${id}`);
    revalidatePath('/payments');
    revalidatePath('/clients');
    revalidatePath('/inventory');

    return successResponse(sale, 'Sale updated successfully');

  } catch (error) {
    if (session) await session.abortTransaction();
    console.error('PUT /api/sales/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update sale';
    return errorResponse(message, 500);
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

    // Revalidate related paths
    revalidatePath('/sales');
    revalidatePath('/payments');
    revalidatePath('/clients');
    revalidatePath('/inventory');

    return successResponse({ id }, 'Sale deleted successfully');
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error('DELETE /api/sales/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete sale';
    return errorResponse(message, 500);
  } finally {
    if (session) session.endSession();
  }
}
