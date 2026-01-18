/**
 * Sales Stats API Route
 *
 * Aggregates statistics for sales transactions
 */

import { NextResponse } from 'next/server';
import Sale from '@/models/Sale';
import { connectToDatabase, errorResponse } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectToDatabase();

        const [statsResult, statusCounts] = await Promise.all([
            Sale.aggregate([
                {
                    $group: {
                        _id: null,
                        totalValue: { $sum: '$grandTotal' },
                        totalPaid: { $sum: '$totalPaid' },
                        totalRemaining: { $sum: '$remainingAmount' },
                        count: { $sum: 1 },
                    },
                },
            ]),
            Sale.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                    },
                },
            ]),
        ]);

        const stats = statsResult[0] || {
            totalValue: 0,
            totalPaid: 0,
            totalRemaining: 0,
            count: 0,
        };

        const counts = statusCounts.reduce((acc: any, curr: any) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        return NextResponse.json({
            success: true,
            data: {
                totalValue: stats.totalValue,
                totalPaid: stats.totalPaid,
                totalRemaining: stats.totalRemaining,
                totalCount: stats.count,
                counts,
            },
        });
    } catch (error: any) {
        console.error('Sales Stats Error:', error);
        return errorResponse(error.message || 'Failed to fetch sales statistics', 500);
    }
}
