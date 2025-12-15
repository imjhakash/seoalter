import mongoose from 'mongoose';

const SearchHistorySchema = new mongoose.Schema({
    query: { type: String, required: true },
    queryNormalized: { type: String, required: true, unique: true },
    analyzedData: { type: Object },
    visualizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visualization' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.SearchHistory || mongoose.model('SearchHistory', SearchHistorySchema, 'search_history');
