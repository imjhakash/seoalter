import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SearchHistory from '@/lib/models/SearchHistory';
import { normalizeQuery } from '@/lib/utils/serpManager';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const contextId = searchParams.get('contextId');
        const query = searchParams.get('query');

        await connectDB();

        let dataset = null;
        
        if (contextId) {
            const history = await SearchHistory.findById(contextId);
            dataset = history?.analyzedData || null;
        } else if (query) {
            const qn = normalizeQuery(query);
            const history = await SearchHistory.findOne({ queryNormalized: qn });
            dataset = history?.analyzedData || null;
        }

        const buttons = Array.isArray(dataset?.smartButtons) && dataset.smartButtons.length
            ? dataset.smartButtons.map((b: { label?: string; prompt?: string }) => ({
                label: b?.label,
                prompt: b?.prompt || b?.label
            }))
            : [
                { label: 'Show top SEO keywords and topic clusters', prompt: 'Show top SEO keywords and topic clusters' },
                { label: 'Show most asked questions by users', prompt: 'Show most asked questions by users' },
                { label: 'Suggest blog ideas based on latest trends & forums', prompt: 'Suggest blog ideas based on latest trends & forums' }
            ];

        return NextResponse.json({ buttons });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
