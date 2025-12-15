import mongoose from 'mongoose';

const VisualizationSchema = new mongoose.Schema({
    query: { type: String, required: true },
    queryNormalized: { type: String, required: true, unique: true },
    data: { type: Object },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Visualization || mongoose.model('Visualization', VisualizationSchema, 'visualizations');
