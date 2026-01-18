import mongoose, { Schema, Document, Model } from 'mongoose';

export enum AuditAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    STATUS_CHANGE = 'STATUS_CHANGE',
    PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
    STOCK_ADJUSTMENT = 'STOCK_ADJUSTMENT'
}

export interface IAuditLog extends Document {
    action: AuditAction;
    entityType: string;
    entityId: string;
    performedBy?: string;
    details?: string;
    oldValue?: any;
    newValue?: any;
    createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        action: {
            type: String,
            required: true,
            enum: Object.values(AuditAction)
        },
        entityType: {
            type: String,
            required: true,
            trim: true
        },
        entityId: {
            type: String,
            required: true
        },
        performedBy: {
            type: String,
            trim: true
        },
        details: {
            type: String
        },
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ createdAt: -1 });

const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
