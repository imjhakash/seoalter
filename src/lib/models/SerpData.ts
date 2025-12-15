import mongoose from 'mongoose';

const SerpDataSchema = new mongoose.Schema({
    query: { type: String, required: true },
    queryNormalized: { type: String, required: true },
    source: { type: String, required: true },
    engine: { type: String },
    apiKeyAlias: { type: String },
    requestParams: { type: Object },
    data: { type: Object },
    fetchedAt: { type: Date, default: Date.now }
});

export default mongoose.models.SerpData || mongoose.model('SerpData', SerpDataSchema, 'serp_data');
