import mongoose from 'mongoose';

const SearchHistorySchema = new mongoose.Schema({
    query: { type: String, required: true },
    queryNormalized: { type: String, required: true, unique: true },
    analyzedData: { type: Object },
    visualizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visualization' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.SearchHistory || mongoose.model('SearchHistory', SearchHistorySchema, 'search_history');
