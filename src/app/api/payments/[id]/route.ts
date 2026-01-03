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

    // Get the original payment to check if amount changed
    const originalPayment = await Payment.findById(id);
    if (!originalPayment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Start a transaction for data consistency
    session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update the payment
      const updatedPayment = await Payment.findByIdAndUpdate(
        id,
        data,
        { new: true, session }
      );

      if (!updatedPayment) {
        throw new Error('Failed to update payment');
      }

      // Recalculate asset payment status if this payment is linked to an asset
      if (updatedPayment.assetId) {
        await updateAssetPaymentStatus(updatedPayment.assetId.toString(), session);
      }

      // Update vendor balance if amount changed and payment is linked to a vendor
      if (originalPayment.amount !== updatedPayment.amount && updatedPayment.partyId && updatedPayment.partyType === 'vendor') {
        const amountDiff = updatedPayment.amount - originalPayment.amount;
        await Vendor.findByIdAndUpdate(
          updatedPayment.partyId,
          { $inc: { outstandingPayable: -amountDiff } },
          { session }
        );
      }

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
    } catch (transactionError: any) {
      await session.abortTransaction();
      throw transactionError;
    }
  } catch (error: any) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update payment' },
      { status: 500 }
    );
  } finally {
    if (session) {
      session.endSession();
    }
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  let session: mongoose.ClientSession | null = null;

  try {
    await connectToDatabase();
    const { id } = await params;

    // Get payment before deletion
    const payment = await Payment.findById(id);
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Store references before deletion
    const assetId = payment.assetId;
    const partyId = payment.partyId;
    const partyType = payment.partyType;
    const amount = payment.amount;

    // Start a transaction for data consistency
    session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete the payment
      await Payment.findByIdAndDelete(id).session(session);

      // Recalculate asset payment status if this payment was linked to an asset
      if (assetId) {
        await updateAssetPaymentStatus(assetId.toString(), session);
      }

      // Update vendor balance - add back the payment amount to outstanding
      if (partyId && partyType === 'vendor') {
        await Vendor.findByIdAndUpdate(
          partyId,
          { $inc: { outstandingPayable: amount } },
          { session }
        );
      }

      await session.commitTransaction();

      // Revalidate affected paths
      revalidatePath('/payments');
      revalidatePath('/assets');
      revalidatePath('/vendors');

      return NextResponse.json({
        success: true,
        message: 'Payment deleted successfully'
      });
    } catch (transactionError: any) {
      await session.abortTransaction();
      throw transactionError;
    }
  } catch (error: any) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete payment' },
      { status: 500 }
    );
  } finally {
    if (session) {
      session.endSession();
    }
  }
}
