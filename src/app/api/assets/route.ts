/**
 * Assets API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { Asset, Vendor, Payment } from '@/models';
import { handleGetAll, connectToDatabase, errorResponse } from '@/lib/api-helpers';
import { TransactionType, AccountType, PartyType } from '@/types';
import { calculatePaymentStatus } from '@/lib/utils/payment-status-calculator';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    return handleGetAll(request, Asset, ['name', 'category', 'location']);
}

export async function POST(request: NextRequest) {
    let session: mongoose.ClientSession | null = null;
    
    try {
        await connectToDatabase();
        const body = await request.json();
        const { paymentDetails, ...assetData } = body;

        // Validate input data
        if (!assetData.name || !assetData.category || !assetData.purchasePrice) {
            return errorResponse('Missing required asset fields', 400);
        }

        // Set default values
        assetData.currentValue = assetData.currentValue || assetData.purchasePrice;

        // If no payment details or no vendor, create asset directly with default payment tracking
        if (!paymentDetails || !paymentDetails.amount || !assetData.vendorId) {
            assetData.totalPaid = 0;
            assetData.paymentStatus = 'unpaid';
            assetData.remainingAmount = assetData.purchasePrice;
            
            const asset = new Asset(assetData);
            await asset.save();
            revalidatePath('/assets');
            return NextResponse.json({
                success: true,
                data: asset,
                message: 'Asset created successfully'
            }, { status: 201 });
        }

        // Validate payment details
        if (paymentDetails.amount <= 0) {
            return errorResponse('Payment amount must be greater than 0', 400);
        }

        if (paymentDetails.amount > assetData.purchasePrice) {
            return errorResponse('Payment amount cannot exceed purchase price', 400);
        }

        // Start transaction for asset with payment
        session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Verify vendor exists
            const vendor = await Vendor.findById(assetData.vendorId).session(session);
            if (!vendor) {
                throw new Error('Vendor not found');
            }

            // 2. Calculate payment status using shared utility (G3 fix - single source of truth)
            const statusResult = calculatePaymentStatus(assetData.purchasePrice, paymentDetails.amount);
            assetData.totalPaid = statusResult.totalPaid;
            assetData.remainingAmount = statusResult.remainingAmount;
            assetData.paymentStatus = statusResult.paymentStatus;

            // 3. Create Asset
            const asset = new Asset(assetData);
            await asset.save({ session });

            // 4. Update Vendor Outstanding Balance (only for unpaid amount)
            vendor.outstandingPayable += assetData.remainingAmount;
            await vendor.save({ session });

            // 5. Record Payment
            const payment = new Payment({
                paymentDate: paymentDetails.paymentDate || new Date(),
                amount: paymentDetails.amount,
                paymentMethod: paymentDetails.paymentMethod,
                transactionType: TransactionType.PURCHASE,
                accountType: AccountType.PAYABLE,
                partyId: assetData.vendorId,
                partyType: PartyType.VENDOR,
                assetId: asset._id,
                notes: paymentDetails.notes || `Payment for asset: ${assetData.name}`
            });
            await payment.save({ session });

            // 6. Link payment to asset
            asset.paymentId = payment._id;
            asset.paymentDetails = paymentDetails;
            await asset.save({ session });

            await session.commitTransaction();
            
            revalidatePath('/assets');
            revalidatePath('/payments');
            
            return NextResponse.json({
                success: true,
                data: asset,
                message: 'Asset created with payment recorded successfully'
            }, { status: 201 });

        } catch (transactionError: any) {
            await session.abortTransaction();
            throw transactionError;
        }
    } catch (error: any) {
        console.error('Asset Creation Error:', error);
        return errorResponse(error.message || 'Failed to create asset', 500);
    } finally {
        if (session) {
            session.endSession();
        }
    }
}
