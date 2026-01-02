/**
 * Asset Procurement API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { AssetProcurement, Asset, Vendor, Payment } from '@/models';
import { handleGetAll, connectToDatabase, errorResponse } from '@/lib/api-helpers';
import { ProcurementStatus, TransactionType, AccountType, PartyType } from '@/types';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
    return handleGetAll(request, AssetProcurement, ['invoiceNumber']);
}

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const body = await request.json();
        const {
            vendorId,
            procurementDate,
            items,
            gstAmount,
            invoiceNumber,
            notes,
            paymentDetails // Optional payment details to record payment immediately
        } = body;

        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Create Asset Procurement
            const procurement = new AssetProcurement({
                vendorId,
                procurementDate,
                items,
                gstAmount,
                invoiceNumber,
                notes,
                status: ProcurementStatus.RECEIVED
            });
            await procurement.save({ session });

            // 2. Create individual Asset records for each item
            for (const item of items) {
                const quantity = item.quantity || 1;
                for (let i = 0; i < quantity; i++) {
                    const asset = new Asset({
                        name: `${item.assetName}${quantity > 1 ? ` (${i + 1})` : ''}`,
                        description: item.description,
                        category: item.category,
                        purchaseDate: procurementDate,
                        purchasePrice: item.unitPrice,
                        currentValue: item.unitPrice,
                        vendorId: vendorId,
                        status: 'active'
                    });
                    await asset.save({ session });
                }
            }

            // 3. Update Vendor Outstanding Balance
            const vendor = await Vendor.findById(vendorId).session(session);
            if (vendor) {
                vendor.outstandingPayable += procurement.grandTotal;
                await vendor.save({ session });
            }

            // 4. Record Payment if provided
            if (paymentDetails && paymentDetails.amount > 0) {
                const payment = new Payment({
                    paymentDate: paymentDetails.paymentDate || new Date(),
                    amount: paymentDetails.amount,
                    paymentMethod: paymentDetails.paymentMethod,
                    transactionType: TransactionType.PURCHASE,
                    accountType: AccountType.PAYABLE,
                    partyId: vendorId,
                    partyType: PartyType.VENDOR,
                    procurementId: procurement._id,
                    notes: paymentDetails.notes || `Payment for asset purchase ${invoiceNumber || ''}`
                });
                await payment.save({ session });

                // Update vendor balance for payment
                if (vendor) {
                    vendor.outstandingPayable -= paymentDetails.amount;
                    await vendor.save({ session });
                }
            }

            await session.commitTransaction();
            session.endSession();

            return NextResponse.json({
                success: true,
                data: procurement,
                message: 'Asset purchase recorded successfully'
            }, { status: 201 });

        } catch (error: any) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (error: any) {
        console.error('Asset Procurement Error:', error);
        return errorResponse(error.message || 'Failed to record asset purchase', 500);
    }
}
