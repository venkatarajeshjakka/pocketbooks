/**
 * Payment Stats API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api-helpers';
import Payment from '@/models/Payment';
import { errorResponse } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        // Aggregations to get useful statistics
        const stats = await Payment.aggregate([
            {
                $facet: {
                    totalStats: [
                        {
                            $group: {
                                _id: null,
                                totalAmount: { $sum: '$amount' },
                                totalCount: { $sum: 1 },
                                avgAmount: { $avg: '$amount' }
                            }
                        }
                    ],
                    byTransactionType: [
                        {
                            $group: {
                                _id: '$transactionType',
                                totalAmount: { $sum: '$amount' },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    byPaymentMethod: [
                        {
                            $group: {
                                _id: '$paymentMethod',
                                totalAmount: { $sum: '$amount' },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    recentTrend: [
                        {
                            $match: {
                                paymentDate: {
                                    $gte: new Date(new Date().setDate(new Date().getDate() - 30))
                                }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' }
                                },
                                amount: { $sum: '$amount' }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ]
                }
            }
        ]);

        // Format the stats
        const result = stats[0];
        const formattedStats = {
            totalAmount: result.totalStats[0]?.totalAmount || 0,
            totalCount: result.totalStats[0]?.totalCount || 0,
            avgAmount: result.totalStats[0]?.avgAmount || 0,
            byTransactionType: result.byTransactionType.reduce((acc: any, item: any) => {
                acc[item._id] = { amount: item.totalAmount, count: item.count };
                return acc;
            }, {}),
            byPaymentMethod: result.byPaymentMethod.reduce((acc: any, item: any) => {
                acc[item._id] = { amount: item.totalAmount, count: item.count };
                return acc;
            }, {}),
            recentTrend: result.recentTrend
        };

        return NextResponse.json({
            success: true,
            data: formattedStats
        });

    } catch (error: any) {
        console.error('Error fetching payment stats:', error);
        return errorResponse(error.message || 'Failed to fetch payment stats', 500);
    }
}
