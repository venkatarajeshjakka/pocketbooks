/**
 * Asset Payment Utilities
 * Helper functions for managing asset payment status
 */

import { Asset, Payment } from '@/models';
import mongoose from 'mongoose';
import { calculatePaymentStatus } from './payment-status-calculator';

/**
 * Update asset payment status based on all associated payments
 * Uses the shared calculatePaymentStatus function for consistency
 */
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

        // Calculate totals using aggregation
        const totalPaidFromPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);

        // Use shared payment status calculator for consistency (G3 fix)
        const statusResult = calculatePaymentStatus(asset.purchasePrice, totalPaidFromPayments);

        // Update asset with calculated values
        asset.totalPaid = statusResult.totalPaid;
        asset.remainingAmount = statusResult.remainingAmount;
        asset.paymentStatus = statusResult.paymentStatus;

        await asset.save({ session });

        return statusResult;
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