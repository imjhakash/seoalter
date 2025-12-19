import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String,
    },
    verificationCodeExpires: {
        type: Date,
    },
    usageCount: {
        type: Number,
        default: 0,
    },
    maxUsage: {
        type: Number,
        default: 3,
    },
    resetToken: {
        type: String,
    },
    resetTokenExpires: {
        type: Date,
    },
    keywordResearchAccess: {
        type: String,
        enum: ['none', 'requested', 'approved', 'rejected'],
        default: 'none'
    },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
