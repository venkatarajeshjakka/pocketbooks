import mongoose from 'mongoose';
import { RawMaterial, TradingGood } from '@/models';

export class InventoryIntegrationService {
    /**
     * Update inventory stock levels and cost prices from a procurement
     */
    static async updateInventoryFromProcurement(
        items: any[],
        type: 'raw_material' | 'trading_good',
        procurementDate: Date,
        session?: mongoose.ClientSession
    ): Promise<void> {
        const Model = type === 'raw_material' ? RawMaterial : TradingGood;
        const itemField = type === 'raw_material' ? 'rawMaterialId' : 'tradingGoodId';

        for (const item of items) {
            const dbItem = await (Model as any).findById(item[itemField]).session(session || null);
            if (!dbItem) continue;

            // Calculate new weighted average cost
            const currentStock = dbItem.currentStock || 0;
            const currentCost = dbItem.costPrice || 0;
            const newQuantity = item.quantity;
            const newUnitCost = item.unitPrice;

            const totalQuantity = currentStock + newQuantity;
            if (totalQuantity > 0) {
                dbItem.costPrice = ((currentStock * currentCost) + (newQuantity * newUnitCost)) / totalQuantity;
            } else {
                dbItem.costPrice = newUnitCost;
            }

            // Update stock level
            dbItem.currentStock = totalQuantity;
            dbItem.lastProcurementDate = procurementDate;

            await dbItem.save({ session });
        }
    }

    /**
     * Reverse inventory updates from a procurement (e.g. on cancellation or deletion)
     */
    static async reverseInventoryUpdate(
        items: any[],
        type: 'raw_material' | 'trading_good',
        session?: mongoose.ClientSession
    ): Promise<void> {
        const Model = type === 'raw_material' ? RawMaterial : TradingGood;
        const itemField = type === 'raw_material' ? 'rawMaterialId' : 'tradingGoodId';

        for (const item of items) {
            const dbItem = await (Model as any).findById(item[itemField]).session(session || null);
            if (!dbItem) continue;

            // This is tricky. Reversing weighted average cost perfectly is hard without historical snapshots.
            // For now, we'll just reverse the stock level.
            // If we want accurate cost reversal, we'd need to track cost history.

            const currentStock = dbItem.currentStock || 0;
            const newQuantity = item.quantity;

            dbItem.currentStock = Math.max(0, currentStock - newQuantity);

            // Note: We don't easily know what the previous cost was unless we store it.
            // Requirement 4.5 says maintain price history, which we might need to implement properly later.
            // For now, we just reverse the quantity.

            await dbItem.save({ session });
        }
    }
}
