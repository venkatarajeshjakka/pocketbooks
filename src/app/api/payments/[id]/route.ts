/**
 * Individual Payment API Route
 */

import { NextRequest } from 'next/server';
import Payment from '@/models/Payment';
import { Client, Vendor, Asset, Sale } from '@/models';
import { handleUpdate, handleDelete, connectToDatabase } from '@/lib/api-helpers';

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
  const { id } = await params;
  return handleUpdate(id, request, Payment);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return handleDelete(id, Payment);
}
