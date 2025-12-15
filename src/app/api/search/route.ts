import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SearchHistory from '@/lib/models/SearchHistory';
import SerpData from '@/lib/models/SerpData';
import Visualization from '@/lib/models/Visualization';
import { fetchSerpBundle, normalizeQuery } from '@/lib/utils/serpManager';
import { analyzeWithGPT } from '@/lib/utils/openaiManager';

export async function POST(request: NextRequest) {
    try {
        const { query, region, language } = await request.json();
        
        if (!query) {
            return NextResponse.json({ error: 'Query required' }, { status: 400 });
        }

        const serpKey = process.env.SERP_API_KEY;
        const openaiKey = process.env.OPENAI_API_KEY;

        if (!serpKey || !openaiKey) {
            return NextResponse.json(
                { error: 'API Keys not configured. Please set SERP_API_KEY and OPENAI_API_KEY in environment variables.' },
                { status: 500 }
            );
        }

        await connectDB();

        const queryNormalized = normalizeQuery(query);

        // 1. Check History (no duplicate SERP + GPT cost)
        let history = await SearchHistory.findOne({ queryNormalized });
        if (history) {
            // Update timestamp to move to top of history
            history.createdAt = new Date();
            await history.save();

            const visualization = history.visualizationId
                ? await Visualization.findById(history.visualizationId)
                : await Visualization.findOne({ queryNormalized });
            
            return NextResponse.json({
                source: 'cache',
                data: history.analyzedData,
                searchId: history._id,
                visualization: visualization ? visualization.data : null
            });
        }

        // 2. Fetch SERP Data
        const serpBundle = await fetchSerpBundle(query, serpKey, region || 'us', language || 'en');

        // 3. Store raw data per source
        const sourcesEntries = Object.entries(serpBundle.sources || {});
        if (sourcesEntries.length) {
            await SerpData.insertMany(
                sourcesEntries.map(([source, payload]) => ({
                    query: serpBundle.query,
                    queryNormalized: serpBundle.queryNormalized,
                    source,
                    engine: (payload as { engine?: string })?.engine,
                    apiKeyAlias: (payload as { apiKeyAlias?: string })?.apiKeyAlias,
                    requestParams: (payload as { requestParams?: object })?.requestParams,
                    data: (payload as { data?: object })?.data
                })),
                { ordered: false }
            );
        }

        // 4. Create visualization-ready dataset
        const trends = {
            timeseries: (serpBundle?.sources?.google_trends_timeseries as { data?: { interest_over_time?: unknown } })?.data?.interest_over_time || null,
            region: (serpBundle?.sources?.google_trends_geo as { data?: { interest_by_region?: unknown } })?.data?.interest_by_region || null,
            relatedTopics: (serpBundle?.sources?.google_trends_related_topics as { data?: { related_topics?: unknown } })?.data?.related_topics || null,
            relatedQueries: (serpBundle?.sources?.google_trends_related_queries as { data?: { related_queries?: unknown } })?.data?.related_queries || null
        };
        
        const visualizationDoc = await Visualization.findOneAndUpdate(
            { queryNormalized: serpBundle.queryNormalized },
            {
                $set: {
                    query: serpBundle.query,
                    queryNormalized: serpBundle.queryNormalized,
                    data: { trends }
                }
            },
            { upsert: true, new: true }
        );

        // 5. Analyze with GPT
        let rawTrendValues: number[] = [];
        try {
            const timeline = (serpBundle?.sources?.google_trends_timeseries as { data?: { interest_over_time?: { timeline_data?: { values?: { value?: string }[] }[] } } })?.data?.interest_over_time?.timeline_data;
            if (Array.isArray(timeline)) {
                rawTrendValues = timeline.map((t: { values?: { value?: string }[] }) => parseInt(t.values?.[0]?.value || '0') || 0);
            }
        } catch (e) {
            console.log("Error parsing raw trends for AI:", (e as Error).message);
        }

        const analysis = await analyzeWithGPT(serpBundle.query, serpBundle, openaiKey, language || 'en');

        // OVERRIDE AI generated trend with ACTUAL raw trend if available
        if (rawTrendValues.length > 0) {
            analysis.trend = rawTrendValues;
        }

        // Attach Raw Organic & Discussions Data for Frontend
        analysis.organicResults = (serpBundle.sources.google as { data?: { organic_results?: unknown[] } })?.data?.organic_results || [];
        analysis.discussions = (serpBundle.sources.discussions_and_forums as { data?: { discussions_and_forums?: unknown[] } })?.data?.discussions_and_forums || 
            (serpBundle.sources.google_forums as { data?: { organic_results?: unknown[] } })?.data?.organic_results || [];

        // Attach Raw Lists (PAA, Related, Autocomplete)
        analysis.peopleAlsoAsk = (serpBundle.sources.people_also_ask as { data?: { related_questions?: unknown[] } })?.data?.related_questions || [];
        analysis.relatedSearches = (serpBundle.sources.related_searches as { data?: { related_searches?: unknown[] } })?.data?.related_searches || [];
        analysis.autocomplete = (serpBundle.sources.google_autocomplete as { data?: { suggestions?: unknown[] } })?.data?.suggestions || [];

        // 6. Save to History
        history = new SearchHistory({
            query: serpBundle.query,
            queryNormalized: serpBundle.queryNormalized,
            analyzedData: analysis,
            visualizationId: visualizationDoc?._id
        });
        await history.save();

        return NextResponse.json({
            source: 'live',
            data: analysis,
            searchId: history._id,
            visualization: visualizationDoc ? visualizationDoc.data : null
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
