import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SearchHistory from '@/lib/models/SearchHistory';
import SerpData from '@/lib/models/SerpData';
import Visualization from '@/lib/models/Visualization';
import { fetchSerpBundle, normalizeQuery } from '@/lib/utils/serpManager';
import { analyzeWithGPT } from '@/lib/utils/openaiManager';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import User from '@/lib/models/User';
import { sendAnalysisResultEmail } from '@/lib/email';
import { getDictionary } from '@/lib/get-dictionary';
import { JwtPayload } from 'jsonwebtoken';

export async function POST(request: NextRequest) {
    try {
        const { query, region, language = 'en' } = await request.json();

        if (!query) {
            return NextResponse.json({ error: 'Query required' }, { status: 400 });
        }

        // --- AUTH & QUOTA CHECK ---
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const decoded = verifyToken(token) as JwtPayload | null;
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.usageCount >= user.maxUsage && user.email !== 'helloatjh@gmail.com') {
            return NextResponse.json({ error: 'Usage limit exceeded (3/3). Please contact support.' }, { status: 403 });
        }
        // ---------------------------

        // ---------------------------

        // Fetch System Settings for Keys
        const settings = await import('@/lib/models/SystemSettings').then(m => m.default.findOne({}).select('+openaiKey +serpKey'));

        const serpKey = settings?.serpKey || process.env.SERP_API_KEY;
        const openaiKey = settings?.openaiKey || process.env.OPENAI_API_KEY;

        if (!serpKey || !openaiKey) {
            return NextResponse.json(
                { error: 'API Keys not configured. Please set them in Admin Panel or environment variables.' },
                { status: 500 }
            );
        }


        const queryNormalized = normalizeQuery(query);

        // 1. Check History (User Specific) - REMOVED to allow fresh searches
        // Previously checked for existing history and returned it. 
        // Now we always proceed to fetch new data and create a new history entry.


        // ... (FETCH SERP - Skipped for brevity) ...


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
        const history = new SearchHistory({
            query: serpBundle.query,
            queryNormalized: serpBundle.queryNormalized,
            analyzedData: analysis,
            visualizationId: visualizationDoc?._id,
            userId: user._id // Link to User
        });
        await history.save();

        // --- UPDATE QUOTA & SEND EMAIL ---
        if (user.email !== 'helloatjh@gmail.com') {
            user.usageCount += 1;
            await user.save();
        }

        try {
            const dict = await getDictionary(language);
            // We construct a simple message content. The wrapper body is in email.ts
            // We can localize "Analysis Complete for..." using dict if we add a key, or just format it generically.
            // For now let's assume english hardcoded title but pass language to email.ts so wrapper is localized.
            // Better: use dict for the inner content too if possible, or just send the query.
            // Let's use a generic string we can construct or add to dict.
            // I'll add a generic localized string "Analysis for {query} is complete." to the dict later or just use English inner content for now but localized wrapper.
            // Actually, I can use a simple string construction.
            await sendAnalysisResultEmail(user.email, `<h3>${query}</h3>`, language);
        } catch (e) {
            console.error("Failed to send analysis email", e);
        }
        // ---------------------------------

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

