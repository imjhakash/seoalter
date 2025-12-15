import mongoose from 'mongoose';

const ChatInteractionSchema = new mongoose.Schema({
    searchId: { type: mongoose.Schema.Types.ObjectId, ref: 'SearchHistory', required: true },
    userMessage: { type: String, required: true },
    assistantReply: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.ChatInteraction || mongoose.model('ChatInteraction', ChatInteractionSchema, 'chat_interactions');
