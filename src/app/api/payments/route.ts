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
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) {
        query.paymentDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.paymentDate.$lte = new Date(endDate);
      }
    }

    // Fix: Cast ObjectId fields for aggregation matches
    if (assetId && mongoose.Types.ObjectId.isValid(assetId)) {
      query.assetId = new mongoose.Types.ObjectId(assetId);
    }
    if (saleId && mongoose.Types.ObjectId.isValid(saleId)) {
      query.saleId = new mongoose.Types.ObjectId(saleId);
    }

    // Execute query with pagination using aggregation for better performance
    const MAX_LIMIT = 100;
    const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
    const skip = (page - 1) * safeLimit;

    // Get total count first
    const total = await Payment.countDocuments(query);

    // Use aggregation pipeline for efficient data fetching and population
    const payments = await Payment.aggregate([
      { $match: query },
      { $sort: { [sortBy]: sortOrder } },
      { $skip: skip },
      { $limit: safeLimit },
      // Lookup Asset
      {
        $lookup: {
          from: 'assets',
          localField: 'assetId',
          foreignField: '_id',
          as: 'assetData'
        }
      },
      // Lookup Sale
      {
        $lookup: {
          from: 'sales',
          localField: 'saleId',
          foreignField: '_id',
          as: 'saleData'
        }
      },
      // Lookup Vendor
      {
        $lookup: {
          from: 'vendors',
          localField: 'partyId',
          foreignField: '_id',
          as: 'vendorData'
        }
      },
      // Lookup Client
      {
        $lookup: {
          from: 'clients',
          localField: 'partyId',
          foreignField: '_id',
          as: 'clientData'
        }
      },
      // Transform and populate fields
      {
        $addFields: {
          assetId: { $arrayElemAt: ['$assetData', 0] },
          saleId: { $arrayElemAt: ['$saleData', 0] },
          partyId: {
            $cond: {
              if: { $or: [{ $eq: ['$partyType', 'vendor'] }, { $eq: ['$partyType', 'Vendor'] }] },
              then: { $arrayElemAt: ['$vendorData', 0] },
              else: { $arrayElemAt: ['$clientData', 0] }
            }
          }
        }
      },
      // Remove temporary lookup arrays
      {
        $project: {
          assetData: 0,
          saleData: 0,
          vendorData: 0,
          clientData: 0
        }
      }
    ]);

    return Response.json({
      success: true,
      data: payments,
      pagination: {
        page,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
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
