/**
 * Asset Stats API Route
 */

import { NextResponse } from 'next/server';
import { Asset } from '@/models';
import { connectToDatabase, errorResponse } from '@/lib/api-helpers';
import { AssetStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectToDatabase();

        const [
            totalAssets,
            activeAssets,
            inRepairAssets,
            retiredAssets,
            disposedAssets,
            financialStats
        ] = await Promise.all([
            Asset.countDocuments(),
            Asset.countDocuments({ status: AssetStatus.ACTIVE }),
            Asset.countDocuments({ status: AssetStatus.REPAIR }),
            Asset.countDocuments({ status: AssetStatus.RETIRED }),
            Asset.countDocuments({ status: AssetStatus.DISPOSED }),
            Asset.aggregate([
                {
                    $group: {
                        _id: null,
                        totalInvestment: { $sum: '$purchasePrice' },
                        currentValue: { $sum: '$currentValue' },
                        totalPaid: { $sum: '$totalPaid' },
                        totalRemaining: { $sum: '$remainingAmount' }
                    }
                }
            ])
        ]);

        const financial = financialStats[0] || {
            totalInvestment: 0,
            currentValue: 0,
            totalPaid: 0,
            totalRemaining: 0
        };

        const depreciation = financial.totalInvestment - financial.currentValue;

        const stats = {
            totalAssets,
            activeAssets,
            inRepairAssets,
            retiredAssets,
            disposedAssets,
            totalInvestment: financial.totalInvestment,
            currentValue: financial.currentValue,
            totalPaid: financial.totalPaid,
            totalRemaining: financial.totalRemaining,
            depreciation: Math.max(0, depreciation)
        };

        return NextResponse.json({
            success: true,
            data: stats
        });

    } catch (error: any) {
        console.error('Asset Stats Error:', error);
        return errorResponse(error.message || 'Failed to fetch asset statistics', 500);
    }
}