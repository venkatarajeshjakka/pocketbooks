import mongoose from 'mongoose';
import AuditLog, { AuditAction } from '@/models/AuditLog';

export class AuditService {
    /**
     * Log a business action
     */
    static async log(params: {
        action: AuditAction;
        entityType: string;
        entityId: string;
        details?: string;
        oldValue?: any;
        newValue?: any;
        performedBy?: string;
    }, session?: mongoose.ClientSession) {
        try {
            const entry = new AuditLog(params);
            await entry.save({ session });
            return entry;
        } catch (error) {
            console.error('Audit Log Error:', error);
            // We usually don't want to crash the main transaction for a log failure
            // but in high-compliance apps we might. 
            // Here we'll just log to console.
        }
    }
}
