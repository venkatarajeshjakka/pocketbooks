/**
 * Individual Payment API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import Payment from '@/models/Payment';
import { Client, Vendor, Asset, Sale } from '@/models';
import { connectToDatabase } from '@/lib/api-helpers';
import { updateAssetPaymentStatus } from '@/lib/utils/asset-payment-utils';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { TransactionType } from '@/types';
import { PaymentService } from '@/lib/services/payment-service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const payment = await Payment.findById(id)
      .populate('assetId')
      .populate('saleId')
      .lean();

    if (!payment) {
      return Response.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Manually populate partyId based on partyType
    if (payment.partyId && payment.partyType) {
      if (payment.partyType === 'client') {
        const client = await Client.findById(payment.partyId).lean();
        (payment as any).partyId = client;
      } else if (payment.partyType === 'vendor') {
        const vendor = await Vendor.findById(payment.partyId).lean();
        (payment as any).partyId = vendor;
      }
    }

    return Response.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    console.error('API GET by ID error:', error);
    return Response.json(
      { success: false, error: error.message || 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  let session: mongoose.ClientSession | null = null;

  try {
    await connectToDatabase();
    const { id } = await params;
    const data = await request.json();

    // Start a transaction for data consistency
    session = await mongoose.startSession();
    session.startTransaction();

    const updatedPayment = await PaymentService.updatePayment(id, data, session);

    await session.commitTransaction();

    // Revalidate affected paths
    revalidatePath('/payments');
    revalidatePath('/assets');
    revalidatePath('/vendors');

    return NextResponse.json({
      success: true,
      data: updatedPayment,
      message: 'Payment updated successfully'
    });
  } catch (error: any) {
    if (session) await session.abortTransaction();
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update payment' },
      { status: 500 }
    );
  } finally {
    if (session) session.endSession();
  }
}


export async function DELETE(request: NextRequest, { params }: RouteParams) {
  let session: mongoose.ClientSession | null = null;

  try {
    await connectToDatabase();
    const { id } = await params;

    // Start a transaction for data consistency
    session = await mongoose.startSession();
    session.startTransaction();

    await PaymentService.deletePayment(id, session);

    await session.commitTransaction();

    // Revalidate affected paths
    revalidatePath('/payments');
    revalidatePath('/assets');
    revalidatePath('/vendors');

    return NextResponse.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error: any) {
    if (session) await session.abortTransaction();
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete payment' },
      { status: 500 }
    );
  } finally {
    if (session) session.endSession();
  }
}
