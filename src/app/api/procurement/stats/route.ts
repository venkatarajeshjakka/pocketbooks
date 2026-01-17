/**
 * Procurement Stats API Route
 */

import { NextResponse } from 'next/server';
import RawMaterialProcurement from '@/models/RawMaterialProcurement';
import TradingGoodsProcurement from '@/models/TradingGoodsProcurement';
import { connectToDatabase, errorResponse } from '@/lib/api-helpers';
import { ProcurementStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectToDatabase();

        const [
            rawMaterialStats,
            tradingGoodsStats,
            rawMaterialCounts,
            tradingGoodsCounts
        ] = await Promise.all([
            RawMaterialProcurement.aggregate([
                {
                    $group: {
                        _id: null,
                        totalValue: { $sum: '$gstBillPrice' },
                        totalPaid: { $sum: '$totalPaid' },
                        totalRemaining: { $sum: '$remainingAmount' }
                    }
                }
            ]),
            TradingGoodsProcurement.aggregate([
                {
                    $group: {
                        _id: null,
                        totalValue: { $sum: '$gstBillPrice' },
                        totalPaid: { $sum: '$totalPaid' },
                        totalRemaining: { $sum: '$remainingAmount' }
                    }
                }
            ]),
            RawMaterialProcurement.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),
            TradingGoodsProcurement.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        const rm = rawMaterialStats[0] || { totalValue: 0, totalPaid: 0, totalRemaining: 0 };
        const tg = tradingGoodsStats[0] || { totalValue: 0, totalPaid: 0, totalRemaining: 0 };

        const stats = {
            totalValue: rm.totalValue + tg.totalValue,
            totalPaid: rm.totalPaid + tg.totalPaid,
            totalRemaining: rm.totalRemaining + tg.totalRemaining,
            counts: {
                rawMaterials: rawMaterialCounts.reduce((acc: any, curr: any) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {}),
                tradingGoods: tradingGoodsCounts.reduce((acc: any, curr: any) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {})
            }
        };

        return NextResponse.json({
            success: true,
            data: stats
        });

    } catch (error: any) {
        console.error('Procurement Stats Error:', error);
        return errorResponse(error.message || 'Failed to fetch procurement statistics', 500);
    }
}
