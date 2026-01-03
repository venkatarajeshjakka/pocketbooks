/**
 * Assets API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { Asset, Vendor, Payment } from '@/models';
import { handleGetAll, connectToDatabase, errorResponse } from '@/lib/api-helpers';
import { TransactionType, AccountType, PartyType } from '@/types';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    return handleGetAll(request, Asset, ['name', 'category', 'location']);
}

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const body = await request.json();
        const { paymentDetails, ...assetData } = body;

        // If no payment details or no vendor, create asset directly
        if (!paymentDetails || !paymentDetails.amount || !assetData.vendorId) {
            const asset = new Asset(assetData);
            await asset.save();
            revalidatePath('/assets');
            return NextResponse.json({
                success: true,
                data: asset,
                message: 'Asset created successfully'
            }, { status: 201 });
        }

        // Start a session for transaction when payment is involved
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Create Asset
            const asset = new Asset(assetData);
            await asset.save({ session });

            // 2. Update Vendor Outstanding Balance
            const vendor = await Vendor.findById(assetData.vendorId).session(session);
            if (vendor) {
                vendor.outstandingPayable += assetData.purchasePrice;
                await vendor.save({ session });
            }

            // 3. Record Payment
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

            // 3.5 Link payment to asset
            asset.paymentId = payment._id;
            asset.paymentDetails = paymentDetails;
            await asset.save({ session });

            // 4. Update vendor balance for payment
            if (vendor) {
                vendor.outstandingPayable -= paymentDetails.amount;
                await vendor.save({ session });
            }

            await session.commitTransaction();
            session.endSession();

            revalidatePath('/assets');
            return NextResponse.json({
                success: true,
                data: asset,
                message: 'Asset created with payment recorded successfully'
            }, { status: 201 });

        } catch (error: any) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (error: any) {
        console.error('Asset Creation Error:', error);
        return errorResponse(error.message || 'Failed to create asset', 500);
    }
}
