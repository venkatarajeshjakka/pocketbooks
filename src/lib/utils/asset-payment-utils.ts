/**
 * Asset Payment Utilities
 * Helper functions for managing asset payment status
 */

import { Asset, Payment } from '@/models';
import mongoose from 'mongoose';

export async function updateAssetPaymentStatus(assetId: string, session?: mongoose.ClientSession) {
    try {
        // Find the asset
        const asset = session 
            ? await Asset.findById(assetId).session(session)
            : await Asset.findById(assetId);
            
        if (!asset) {
            throw new Error('Asset not found');
        }

        // Find all payments for this asset
        const payments = session
            ? await Payment.find({ assetId }).session(session)
            : await Payment.find({ assetId });

        // Calculate totals
        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const remainingAmount = Math.max(0, asset.purchasePrice - totalPaid);

        // Determine payment status
        let paymentStatus: 'unpaid' | 'partially_paid' | 'fully_paid' = 'unpaid';
        if (totalPaid >= asset.purchasePrice) {
            paymentStatus = 'fully_paid';
        } else if (totalPaid > 0) {
            paymentStatus = 'partially_paid';
        }

        // Update asset
        asset.totalPaid = totalPaid;
        asset.remainingAmount = Math.max(0, remainingAmount);
        asset.paymentStatus = paymentStatus;

        await asset.save({ session });

        return {
            totalPaid,
            remainingAmount,
            paymentStatus
        };
    } catch (error) {
        console.error('Error updating asset payment status:', error);
        throw error;
    }
}

export async function recalculateAllAssetPayments() {
    try {
        const assets = await Asset.find({});
        let updatedCount = 0;

        for (const asset of assets) {
            try {
                await updateAssetPaymentStatus(asset._id.toString());
                updatedCount++;
            } catch (error) {
                console.error(`Failed to update asset ${asset._id}:`, error);
            }
        }

        return {
            totalAssets: assets.length,
            updatedCount
        };
    } catch (error) {
        console.error('Error recalculating asset payments:', error);
        throw error;
    }
}