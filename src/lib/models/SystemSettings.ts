import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
    openaiKey?: string;
    serpKey?: string;
    dataForSeoLogin?: string;
    dataForSeoPassword?: string;
    updatedAt: Date;
}

const SystemSettingsSchema = new Schema<ISystemSettings>({
    openaiKey: { type: String, select: false }, // Hide by default for security
    serpKey: { type: String, select: false },
    dataForSeoLogin: { type: String, select: false },
    dataForSeoPassword: { type: String, select: false },
    updatedAt: { type: Date, default: Date.now }
});

// Singleton pattern: Ensure only one document exists usually, but schema doesn't enforce it strictly without logic
// We'll handle the "only one" logic in the controller/service layer or just always fetch the first one.

export default mongoose.models.SystemSettings || mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);
