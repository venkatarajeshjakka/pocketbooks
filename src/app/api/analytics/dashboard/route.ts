import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { connectToDatabase } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();
        const metrics = await AnalyticsService.getDashboardMetrics();

        return NextResponse.json({
            success: true,
            data: metrics
        });
    } catch (error: any) {
        console.error('API GET /api/analytics/dashboard error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
