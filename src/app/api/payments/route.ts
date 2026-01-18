/**
 * Payments API Route
 */

import { NextRequest } from 'next/server';
import Payment from '@/models/Payment';
import { Client, Vendor, Asset, Sale } from '@/models';
import { connectToDatabase, errorResponse } from '@/lib/api-helpers';
import { revalidatePath } from 'next/cache';
import { updateAssetPaymentStatus } from '@/lib/utils/asset-payment-utils';
import { ProcurementService } from '@/lib/services/procurement-service';
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
    const procurementId = searchParams.get('procurementId') || '';
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
    if (procurementId && mongoose.Types.ObjectId.isValid(procurementId)) {
      query.procurementId = new mongoose.Types.ObjectId(procurementId);
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
      // Lookup Procurement (Raw Material)
      {
        $lookup: {
          from: 'rawmaterialprocurements',
          localField: 'procurementId',
          foreignField: '_id',
          as: 'rawMaterialProcData'
        }
      },
      // Lookup Procurement (Trading Goods)
      {
        $lookup: {
          from: 'tradinggoodsprocurements',
          localField: 'procurementId',
          foreignField: '_id',
          as: 'tradingGoodProcData'
        }
      },
      // Transform and populate fields
      {
        $addFields: {
          assetId: { $arrayElemAt: ['$assetData', 0] },
          saleId: { $arrayElemAt: ['$saleData', 0] },
          procurementId: {
            $cond: {
              if: { $eq: ['$procurementType', 'raw_material'] },
              then: { $arrayElemAt: ['$rawMaterialProcData', 0] },
              else: { $arrayElemAt: ['$tradingGoodProcData', 0] }
            }
          },
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
          clientData: 0,
          rawMaterialProcData: 0,
          tradingGoodProcData: 0
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
    // partyId and partyType are not required for expense transactions
    if (!body.amount || !body.paymentMethod || !body.transactionType) {
      return errorResponse('Missing required payment fields', 400);
    }

    // For non-expense transactions, partyId and partyType are required
    if (body.transactionType !== 'expense' && (!body.partyId || !body.partyType)) {
      return errorResponse('Party ID and Party Type are required for non-expense transactions', 400);
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
      }

      // If this is a procurement payment, sync the procurement status
      if (body.procurementId && body.procurementType) {
        await ProcurementService.syncProcurementPaymentStatus(
          body.procurementId,
          body.procurementType,
          session
        );
      }

      // If this is a sale payment, sync the sale payment status and client balance
      if (body.saleId) {
        const sale = await Sale.findById(body.saleId).session(session);
        if (sale) {
          // Calculate total paid from all payments for this sale
          const salePayments = await Payment.find({ saleId: body.saleId }).session(session);
          const totalPaid = salePayments.reduce((sum, p) => sum + (p.amount || 0), 0);

          // Get previous remaining amount to calculate balance adjustment
          const previousRemaining = sale.remainingAmount || (sale.grandTotal - (sale.totalPaid || 0));

          // Update sale's totalPaid - the pre-save hook will recalculate payment status
          sale.totalPaid = totalPaid;
          await sale.save({ session });

          // Calculate new remaining amount after save
          const newRemaining = sale.remainingAmount || 0;

          // Adjust client outstanding balance by the difference
          const balanceDiff = newRemaining - previousRemaining;
          if (balanceDiff !== 0 && sale.clientId) {
            await Client.findByIdAndUpdate(
              sale.clientId,
              { $inc: { outstandingBalance: balanceDiff } },
              { session }
            );
          }
        }
      }

      await session.commitTransaction();

      revalidatePath('/payments');
      revalidatePath('/assets');
      revalidatePath('/sales');

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
