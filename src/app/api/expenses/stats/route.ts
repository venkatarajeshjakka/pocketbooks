/**
 * Expense Stats API Route
 */

import { NextResponse } from 'next/server';
import Expense from '@/models/Expense';
import { connectToDatabase, errorResponse } from '@/lib/api-helpers';

export async function GET() {
    try {
        await connectToDatabase();

        // Get current date info for month calculations
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Aggregate stats
        const [
            totalStats,
            byCategory,
            thisMonthTotal,
            lastMonthTotal
        ] = await Promise.all([
            // Total amount and count
            Expense.aggregate([
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                        totalCount: { $sum: 1 },
                        avgAmount: { $avg: '$amount' }
                    }
                }
            ]),
            // By category
            Expense.aggregate([
                {
                    $group: {
                        _id: '$category',
                        amount: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                }
            ]),
            // This month
            Expense.aggregate([
                {
                    $match: {
                        date: { $gte: startOfThisMonth }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' }
                    }
                }
            ]),
            // Last month
            Expense.aggregate([
                {
                    $match: {
                        date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' }
                    }
                }
            ])
        ]);

        // Format category stats
        const categoryStats: Record<string, { amount: number; count: number }> = {};
        byCategory.forEach((cat: { _id: string; amount: number; count: number }) => {
            categoryStats[cat._id] = {
                amount: cat.amount,
                count: cat.count
            };
        });

        const stats = {
            totalAmount: totalStats[0]?.totalAmount || 0,
            totalCount: totalStats[0]?.totalCount || 0,
            avgAmount: totalStats[0]?.avgAmount || 0,
            byCategory: categoryStats,
            thisMonth: thisMonthTotal[0]?.total || 0,
            lastMonth: lastMonthTotal[0]?.total || 0
        };

        return NextResponse.json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        console.error('Expense Stats API Error:', error);
        return errorResponse(error.message || 'Failed to fetch expense stats', 500);
    }
}
