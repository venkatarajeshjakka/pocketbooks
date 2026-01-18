import { Sale, Client, Vendor, Asset, LoanAccount, Payment, RawMaterial, TradingGood, RawMaterialProcurement, TradingGoodsProcurement } from '@/models';
import { SaleStatus, ProcurementStatus, PaymentStatus } from '@/types';
import mongoose from 'mongoose';

export class AnalyticsService {
    /**
     * Get summary metrics for the dashboard
     */
    static async getDashboardMetrics() {
        // 1. Total Sales (Settled/Completed)
        const salesStats = (await Sale.aggregate([
            { $match: { status: { $ne: SaleStatus.CANCELLED } } },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$grandTotal' },
                    totalPaid: { $sum: '$totalPaid' },
                    remaining: { $sum: '$remainingAmount' }
                }
            }
        ])) as any[];

        // 2. Pending Payables (Procurements)
        // We need to aggregate across both procurement types if they are separate collections
        const rmProcStats = (await RawMaterialProcurement.aggregate([
            { $match: { status: { $ne: ProcurementStatus.CANCELLED } } },
            { $group: { _id: null, remaining: { $sum: '$remainingAmount' } } }
        ])) as any[];

        const tgProcStats = (await TradingGoodsProcurement.aggregate([
            { $match: { status: { $ne: ProcurementStatus.CANCELLED } } },
            { $group: { _id: null, remaining: { $sum: '$remainingAmount' } } }
        ])) as any[];

        // 3. Assets and Loans
        const totalAssets = await Asset.aggregate([
            { $group: { _id: null, total: { $sum: '$purchasePrice' } } }
        ]);

        const totalLoans = await LoanAccount.aggregate([
            { $group: { _id: null, total: { $sum: '$outstandingBalance' } } }
        ]);

        // 4. Low Stock Alerts
        const lowStockRaw = await RawMaterial.find({
            $expr: { $lt: ['$currentStock', '$reorderLevel'] }
        }).limit(5).lean();

        const lowStockTrading = await TradingGood.find({
            $expr: { $lt: ['$currentStock', '$reorderLevel'] }
        }).limit(5).lean();

        // 5. Recent Transactions (Sales)
        const recentSales = await Sale.find({ status: { $ne: SaleStatus.CANCELLED } })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('clientId', 'name')
            .lean();

        const metrics = {
            totalSales: salesStats[0]?.totalSales || 0,
            pendingReceivables: salesStats[0]?.remaining || 0,
            pendingPayables: (rmProcStats[0]?.remaining || 0) + (tgProcStats[0]?.remaining || 0),
            netProfit: (salesStats[0]?.totalSales || 0) * 0.2, // Placeholder logic for profit margin
            totalAssets: totalAssets[0]?.total || 0,
            outstandingLoans: totalLoans[0]?.total || 0,
            recentSales: recentSales.map(s => ({
                id: s.invoiceNumber,
                client: (s.clientId as any)?.name || 'Unknown',
                amount: s.grandTotal,
                date: (s as any).createdAt,
                status: s.paymentStatus === 'fully_paid' ? 'Paid' : 'Pending'
            })),
            lowStockItems: [
                ...lowStockRaw.map(i => ({ name: i.name, quantity: i.currentStock, unit: i.unit })),
                ...lowStockTrading.map(i => ({ name: i.name, quantity: i.currentStock, unit: i.unit }))
            ]
        };

        return metrics;
    }
}
