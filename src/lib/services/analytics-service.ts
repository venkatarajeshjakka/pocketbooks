import { Sale, Client, Vendor, Asset, LoanAccount, Payment, RawMaterial, TradingGood, FinishedGood, RawMaterialProcurement, TradingGoodsProcurement } from '@/models';
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

        // 6. Calculate Real COGS for Net Profit
        const allSales = await Sale.find({ status: { $ne: SaleStatus.CANCELLED } }).lean();
        let totalCOGS = 0;

        // Cache for item costs to avoid redundant BOM traversals
        const costCache: Record<string, number> = {};

        const getItemCost = async (itemId: string, itemType: string): Promise<number> => {
            const cacheKey = `${itemType}:${itemId}`;
            if (costCache[cacheKey] !== undefined) return costCache[cacheKey];

            let cost = 0;
            if (itemType === 'trading_good') {
                const item = await TradingGood.findById(itemId).select('costPrice').lean();
                cost = item?.costPrice || 0;
            } else if (itemType === 'raw_material') {
                const item = await RawMaterial.findById(itemId).select('costPrice').lean();
                cost = item?.costPrice || 0;
            } else if (itemType === 'finished_good') {
                const fg = await FinishedGood.findById(itemId).select('bom').lean();
                if (fg?.bom) {
                    for (const bomItem of fg.bom) {
                        const componentCost = await getItemCost(String(bomItem.rawMaterialId), 'raw_material');
                        cost += componentCost * bomItem.quantity;
                    }
                }
            }

            costCache[cacheKey] = cost;
            return cost;
        };

        for (const sale of allSales) {
            for (const item of sale.items) {
                const itemCost = await getItemCost(String(item.itemId), item.itemType);
                totalCOGS += itemCost * item.quantity;
            }
        }

        const metrics = {
            totalSales: salesStats[0]?.totalSales || 0,
            pendingReceivables: salesStats[0]?.remaining || 0,
            pendingPayables: (rmProcStats[0]?.remaining || 0) + (tgProcStats[0]?.remaining || 0),
            netProfit: (salesStats[0]?.totalSales || 0) - totalCOGS,
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
