/**
 * Payments API Route
 */

import { NextRequest } from 'next/server';
import Payment from '@/models/Payment';
import { Client, Vendor, Asset, Sale } from '@/models';
import { connectToDatabase, errorResponse } from '@/lib/api-helpers';
import { revalidatePath } from 'next/cache';
import { updateAssetPaymentStatus } from '@/lib/utils/asset-payment-utils';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    
    // Additional filters for payments
    const transactionType = searchParams.get('transactionType') || '';
    const partyType = searchParams.get('partyType') || '';
    const assetId = searchParams.get('assetId') || '';
    const saleId = searchParams.get('saleId') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { notes: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } }
      ];
    }
    if (transactionType) {
      query.transactionType = transactionType;
    }
    if (partyType) {
      query.partyType = partyType;
    }
    if (assetId) {
      query.assetId = assetId;
    }
    if (saleId) {
      query.saleId = saleId;
    }
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) {
        query.paymentDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.paymentDate.$lte = new Date(endDate);
      }
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [payments, total] = await Promise.all([
      Payment.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('assetId')
        .populate('saleId')
        .lean(),
      Payment.countDocuments(query),
    ]);

    // Manually populate partyId based on partyType
    const populatedPayments = await Promise.all(
      payments.map(async (payment: any) => {
        if (payment.partyId && payment.partyType) {
          if (payment.partyType === 'client') {
            const client = await Client.findById(payment.partyId).lean();
            payment.partyId = client;
          } else if (payment.partyType === 'vendor') {
            const vendor = await Vendor.findById(payment.partyId).lean();
            payment.partyId = vendor;
          }
        }
        return payment;
      })
    );

    return Response.json({
      success: true,
      data: populatedPayments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('API GET error:', error);
    return errorResponse(error.message || 'Failed to fetch payments', 500);
  }
}

export async function POST(request: NextRequest) {
  let session: mongoose.ClientSession | null = null;
  
  try {
    await connectToDatabase();
    const body = await request.json();

    // Validate required fields
    if (!body.amount || !body.paymentMethod || !body.transactionType || !body.partyId || !body.partyType) {
      return errorResponse('Missing required payment fields', 400);
    }

    session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create the payment
      const payment = new Payment(body);
      await payment.save({ session });

      // If this is an asset payment, update the asset's payment tracking
      if (body.assetId) {
        await updateAssetPaymentStatus(body.assetId, session);

        // Update vendor outstanding balance if it's a vendor payment
        if (body.partyType === 'vendor' && body.transactionType === 'purchase') {
          const vendor = await Vendor.findById(body.partyId).session(session);
          if (vendor) {
            vendor.outstandingPayable = Math.max(0, vendor.outstandingPayable - body.amount);
            await vendor.save({ session });
          }
        }
      }

      await session.commitTransaction();
      
      revalidatePath('/payments');
      revalidatePath('/assets');

      return Response.json({
        success: true,
        data: payment,
        message: 'Payment created successfully'
      }, { status: 201 });

    } catch (transactionError: any) {
      await session.abortTransaction();
      throw transactionError;
    }
  } catch (error: any) {
    console.error('Payment Creation Error:', error);
    return errorResponse(error.message || 'Failed to create payment', 500);
  } finally {
    if (session) {
      session.endSession();
    }
  }
}
