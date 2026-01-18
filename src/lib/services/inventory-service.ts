import mongoose from 'mongoose';
import { FinishedGood, RawMaterial } from '@/models';
import { InventoryItemType } from '@/types';

export class InventoryService {
    /**
     * Produce finished goods by consuming raw materials from BOM
     */
    static async produceFinishedGood(
        finishedGoodId: string,
        quantity: number,
        session?: mongoose.ClientSession
    ) {
        // 1. Fetch finished good with BOM
        const fg = await FinishedGood.findById(finishedGoodId).session(session || null);
        if (!fg) throw new Error('Finished Good not found');

        // 2. Validate raw material availability
        for (const bomItem of fg.bom) {
            const material = await RawMaterial.findById(bomItem.rawMaterialId).session(session || null);
            if (!material) {
                throw new Error(`Raw material not found for BOM: ${bomItem.rawMaterialId}`);
            }

            const requiredQuantity = bomItem.quantity * quantity;
            if (material.currentStock < requiredQuantity) {
                throw new Error(
                    `Insufficient stock for ${material.name}. Required: ${requiredQuantity}, Available: ${material.currentStock}`
                );
            }
        }

        // 3. Deduct raw materials
        for (const bomItem of fg.bom) {
            const requiredQuantity = bomItem.quantity * quantity;
            await RawMaterial.findByIdAndUpdate(
                bomItem.rawMaterialId,
                { $inc: { currentStock: -requiredQuantity } },
                { session }
            );
        }

        // 4. Increase finished good stock
        fg.currentStock += quantity;
        await fg.save({ session });

        return fg;
    }
}
