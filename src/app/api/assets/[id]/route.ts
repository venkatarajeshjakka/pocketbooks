/**
 * Asset by ID API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { Asset, Vendor, Payment } from '@/models';
import { handleGetById, handleUpdate, handleDelete, connectToDatabase } from '@/lib/api-helpers';
import { TransactionType, AccountType, PartyType } from '@/types';
import { updateAssetPaymentStatus } from '@/lib/utils/asset-payment-utils';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import { AuditService } from '@/lib/services/audit-service';
import { AuditAction } from '@/models/AuditLog';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return handleGetById(id, Asset, ['vendorId']);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    let session: mongoose.ClientSession | null = null;

    try {
        await connectToDatabase();
        const { id } = await params;
        const body = await request.json();
        const { paymentDetails, ...updateData } = body;

        // If no payment details, use simple update
        if (!paymentDetails) {
            const assetBefore = await Asset.findById(id);
            if (!assetBefore) return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 });

            const doc = await Asset.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
            });

            if (!doc) return NextResponse.json({ success: false, error: 'Asset not found during update' }, { status: 404 });

            // Log update
            await AuditService.log({
                action: AuditAction.UPDATE,
                entityType: 'Asset',
                entityId: id,
                details: 'Updated asset (simple update)',
                oldValue: assetBefore.toObject(),
                newValue: doc.toObject()
            });

            revalidatePath('/assets');
            return NextResponse.json({
                success: true,
                data: doc,
                message: 'Updated successfully'
            });
        }

        // Handle payment updates with transaction
        session = await mongoose.startSession();
        session.startTransaction();

        try {
            const asset = await Asset.findById(id).session(session);
            if (!asset) {
                throw new Error('Asset not found');
            }

            const assetBefore = asset.toObject();

            // Update asset fields
            Object.assign(asset, updateData);

            // Handle payment details update
            if (paymentDetails.amount) {
                // Validate payment amount
                if (paymentDetails.amount < 0) {
                    throw new Error('Payment amount cannot be negative');
                }

                if (paymentDetails.amount > asset.purchasePrice) {
                    throw new Error('Payment amount cannot exceed purchase price');
                }

                // Update payment tracking
                asset.totalPaid = paymentDetails.amount;
                asset.paymentDetails = paymentDetails;

                // Update or create payment record
                if (asset.paymentId) {
                    await Payment.findByIdAndUpdate(
                        asset.paymentId,
                        {
                            amount: paymentDetails.amount,
                            paymentMethod: paymentDetails.paymentMethod,
                            paymentDate: paymentDetails.paymentDate || new Date(),
                            notes: paymentDetails.notes || `Updated payment for asset: ${asset.name}`
                        },
                        { session }
                    );
                } else {
                    const payment = new Payment({
                        paymentDate: paymentDetails.paymentDate || new Date(),
                        amount: paymentDetails.amount,
                        paymentMethod: paymentDetails.paymentMethod,
                        transactionType: TransactionType.PURCHASE,
                        accountType: AccountType.PAYABLE,
                        partyId: asset.vendorId,
                        partyType: PartyType.VENDOR,
                        assetId: asset._id,
                        notes: paymentDetails.notes || `Payment for asset: ${asset.name}`
                    });
                    await payment.save({ session });
                    asset.paymentId = payment._id;
                }

                // Update vendor balance if vendor changed
                if (asset.vendorId && updateData.vendorId && asset.vendorId.toString() !== updateData.vendorId) {
                    // Remove from old vendor
                    const oldVendor = await Vendor.findById(asset.vendorId).session(session);
                    if (oldVendor) {
                        oldVendor.outstandingPayable -= asset.remainingAmount;
                        await oldVendor.save({ session });
                    }

                    // Add to new vendor
                    const newVendor = await Vendor.findById(updateData.vendorId).session(session);
                    if (newVendor) {
                        newVendor.outstandingPayable += (asset.purchasePrice - paymentDetails.amount);
                        await newVendor.save({ session });
                    }
                }
            }

            await asset.save({ session });

            // Log update with payment
            await AuditService.log({
                action: AuditAction.UPDATE,
                entityType: 'Asset',
                entityId: id,
                details: 'Updated asset with payment adjustments',
                oldValue: assetBefore,
                newValue: asset.toObject()
            }, session);

            // Recalculate payment status based on all payments
            await updateAssetPaymentStatus(id, session);

            await session.commitTransaction();

            revalidatePath('/assets');
            revalidatePath('/payments');

            return NextResponse.json({
                success: true,
                data: asset,
                message: 'Asset updated successfully'
            });

        } catch (transactionError: any) {
            await session.abortTransaction();
            throw transactionError;
        }
    } catch (error: any) {
        console.error('Asset Update Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to update asset'
        }, { status: 500 });
    } finally {
        if (session) {
            session.endSession();
        }
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    let session: mongoose.ClientSession | null = null;

    try {
        const { id } = await params;
        await connectToDatabase();

        // Find the asset first to get vendor and payment info
        const asset = await Asset.findById(id);
        if (!asset) {
            return NextResponse.json(
                { success: false, error: 'Asset not found' },
                { status: 404 }
            );
        }

        // Start a transaction for data consistency
        session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find all payments associated with this asset
            const payments = await Payment.find({ assetId: id }).session(session);
            const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

            // Delete all payments associated with this asset
            await Payment.deleteMany({ assetId: id }).session(session);

            // Update vendor outstanding balance if vendor exists
            if (asset.vendorId) {
                // The outstanding amount that was owed = purchasePrice - totalPaid
                // When we delete the asset, we need to reduce the vendor's outstanding payable
                // by the remaining amount (what was still owed)
                const remainingAmount = (asset.purchasePrice || 0) - totalPayments;
                if (remainingAmount > 0) {
                    await Vendor.findByIdAndUpdate(
                        asset.vendorId,
                        { $inc: { outstandingPayable: -remainingAmount } },
                        { session }
                    );
                }
            }

            // Delete the asset
            await Asset.findByIdAndDelete(id).session(session);

            // Log deletion
            await AuditService.log({
                action: AuditAction.DELETE,
                entityType: 'Asset',
                entityId: id,
                details: `Deleted asset: ${asset.name}`,
                oldValue: asset.toObject()
            }, session);

            await session.commitTransaction();

            // Revalidate all affected paths
            revalidatePath('/assets');
            revalidatePath('/payments');
            revalidatePath('/vendors');

            return NextResponse.json({
                success: true,
                message: 'Asset and associated payments deleted successfully'
            });
        } catch (transactionError: any) {
            await session.abortTransaction();
            throw transactionError;
        }
    } catch (error: any) {
        console.error('Error deleting asset:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete asset' },
            { status: 500 }
        );
    } finally {
        if (session) {
            session.endSession();
        }
    }
}
