import mongoose from 'mongoose';
import { RawMaterial, TradingGood } from '@/models';

/**
 * Represents a snapshot of inventory state before an update
 */
interface InventorySnapshot {
    itemId: string;
    previousStock: number;
    previousCostPrice: number;
}

export class InventoryIntegrationService {
    /**
     * Update inventory stock levels and cost prices from a procurement
     * Returns snapshots of previous state for potential reversal
     */
    static async updateInventoryFromProcurement(
        items: any[],
        type: 'raw_material' | 'trading_good',
        procurementDate: Date,
        session?: mongoose.ClientSession
    ): Promise<InventorySnapshot[]> {
        const Model = type === 'raw_material' ? RawMaterial : TradingGood;
        const itemField = type === 'raw_material' ? 'rawMaterialId' : 'tradingGoodId';
        const snapshots: InventorySnapshot[] = [];

        for (const item of items) {
            const id = item[itemField];
            const dbItem = await (Model as any).findById(id).session(session || null);

            if (!dbItem) {
                console.warn(`[InventoryIntegrationService] Item not found: ${id} for type ${type}`);
                continue;
            }

            // Capture snapshot before update for potential reversal
            const previousStock = dbItem.currentStock || 0;
            const previousCostPrice = dbItem.costPrice || 0;
            snapshots.push({
                itemId: id.toString(),
                previousStock,
                previousCostPrice
            });

            // Calculate new weighted average cost
            const newQuantity = item.quantity;
            const newUnitCost = item.unitPrice;

            const totalQuantity = previousStock + newQuantity;
            if (totalQuantity > 0) {
                dbItem.costPrice = ((previousStock * previousCostPrice) + (newQuantity * newUnitCost)) / totalQuantity;
            } else {
                dbItem.costPrice = newUnitCost;
            }

            // Update stock level
            dbItem.currentStock = totalQuantity;
            dbItem.lastProcurementDate = procurementDate;

            console.log(`[InventoryIntegrationService] Updated ${type}: ${dbItem.name}. Stock: ${previousStock} -> ${totalQuantity}, Cost: ${previousCostPrice.toFixed(2)} -> ${dbItem.costPrice.toFixed(2)}`);

            await dbItem.save({ session });
        }

        return snapshots;
    }

    /**
     * Reverse inventory updates from a procurement (e.g. on cancellation or deletion)
     * Uses reverse weighted average calculation to restore approximate previous cost
     *
     * The formula to reverse weighted average:
     * If current_cost = (old_stock * old_cost + new_qty * new_cost) / total_stock
     * Then: old_cost = (current_cost * total_stock - new_qty * new_cost) / old_stock
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

            const currentStock = dbItem.currentStock || 0;
            const currentCost = dbItem.costPrice || 0;
            const procuredQuantity = item.quantity;
            const procuredUnitCost = item.unitPrice;

            // Calculate what the stock was before this procurement
            const previousStock = currentStock - procuredQuantity;

            // Reverse the stock level
            dbItem.currentStock = Math.max(0, previousStock);

            // Reverse the weighted average cost calculation
            // old_cost = (current_cost * total_stock - new_qty * new_cost) / old_stock
            if (previousStock > 0) {
                const totalValue = currentCost * currentStock;
                const procuredValue = procuredQuantity * procuredUnitCost;
                const previousValue = totalValue - procuredValue;

                // Calculate the previous cost price
                const previousCostPrice = previousValue / previousStock;

                // Ensure we don't get negative or unreasonable costs
                if (previousCostPrice > 0 && isFinite(previousCostPrice)) {
                    dbItem.costPrice = previousCostPrice;
                    console.log(`[InventoryIntegrationService] Reversed ${type}: ${dbItem.name}. Stock: ${currentStock} -> ${previousStock}, Cost: ${currentCost.toFixed(2)} -> ${previousCostPrice.toFixed(2)}`);
                } else {
                    // If calculation results in invalid cost, keep current cost
                    console.warn(`[InventoryIntegrationService] Could not reverse cost for ${dbItem.name}. Keeping current cost.`);
                }
            } else {
                // If reverting to zero stock, reset cost to the last known unit cost or keep current
                console.log(`[InventoryIntegrationService] Reversed ${type}: ${dbItem.name}. Stock: ${currentStock} -> 0. Cost unchanged.`);
            }

            await dbItem.save({ session });
        }
    }

    /**
     * Reverse inventory using previously captured snapshots (most accurate)
     * Use this when snapshots are available from the original update
     */
    static async reverseInventoryWithSnapshots(
        snapshots: InventorySnapshot[],
        type: 'raw_material' | 'trading_good',
        session?: mongoose.ClientSession
    ): Promise<void> {
        const Model = type === 'raw_material' ? RawMaterial : TradingGood;

        for (const snapshot of snapshots) {
            const dbItem = await (Model as any).findById(snapshot.itemId).session(session || null);
            if (!dbItem) continue;

            console.log(`[InventoryIntegrationService] Restoring ${type}: ${dbItem.name} from snapshot. Stock: ${dbItem.currentStock} -> ${snapshot.previousStock}, Cost: ${dbItem.costPrice?.toFixed(2)} -> ${snapshot.previousCostPrice.toFixed(2)}`);

            dbItem.currentStock = snapshot.previousStock;
            dbItem.costPrice = snapshot.previousCostPrice;

            await dbItem.save({ session });
        }
    }
}
