import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/db';
import SystemSettings from '@/lib/models/SystemSettings';
import axios from 'axios';
import { JwtPayload } from 'jsonwebtoken';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            mode = 'related',
            keyword,
            keywords = [],
            location_code = 2840,
            language_code = 'en',
            // Advanced params for 'related'
            depth = 1,
            limit = 50,
            include_seed_keyword = true,
            ignore_synonyms = false,
            include_clickstream_data = false,
            include_serp_info = false
        } = body;

        // Auth Check
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
        const settings = await SystemSettings.findOne({}).select('+dataForSeoLogin +dataForSeoPassword');

        if (!settings?.dataForSeoLogin || !settings?.dataForSeoPassword) {
            return NextResponse.json({ error: 'Keyword Research Tool is not configured. Please contact support.' }, { status: 503 });
        }

        const auth = {
            username: settings.dataForSeoLogin,
            password: settings.dataForSeoPassword
        };
        const headers = { 'content-type': 'application/json' };

        if (mode === 'volume') {
            // SEARCH VOLUME API
            // Endpoint: https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live
            // Payload: [{"keywords":["weather forecast"], "location_code": 2840, "language_code": "en", "sort_by":"relevance"}]

            // Check if keywords provided
            const targetKeywords = keywords.length > 0 ? keywords : (keyword ? [keyword] : []);
            if (targetKeywords.length === 0) {
                return NextResponse.json({ error: 'No keywords provided' }, { status: 400 });
            }

            // Split into chunks of 700 (API limit is usually high but safer to batch if needed, though implementing simple here)
            // Limit for live endpoint is often smaller, let's assume < 100 for now based on user use case.

            const post_array = [{
                keywords: targetKeywords,
                location_code: location_code,
                language_code: language_code,
                sort_by: "relevance"
            }];

            const response = await axios.post(
                'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live',
                post_array,
                { auth, headers }
            );

            const tasks = response.data.tasks;
            if (!tasks || tasks.length === 0 || !tasks[0].result) {
                return NextResponse.json({ items: [] });
            }

            // Result structure is slightly different for search_volume
            const items = tasks[0].result || [];
            // items is an array of keyword objects directly in some endpoints, or inside an 'items' array.
            // For search_volume/live, it returns a list of objects like { keyword: "foo", search_volume: 123, ... }

            // Let's format it to match our frontend expectation
            const formattedItems = items.map((item: any) => ({
                keyword: item.keyword,
                search_volume: item.search_volume,
                cpc: item.cpc,
                competition: item.competition, // usually 0 to 1
                trends: item.monthly_searches ? item.monthly_searches.map((m: any) => m.search_volume) : []
            }));

            return NextResponse.json({ items: formattedItems });

        } else {
            // RELATED KEYWORDS API (Default)
            // Endpoint: https://api.dataforseo.com/v3/dataforseo_labs/google/related_keywords/live

            const post_array = [{
                keyword: keyword,
                location_code: location_code,
                language_code: language_code,
                depth: depth,
                limit: limit,
                include_seed_keyword: include_seed_keyword,
                ignore_synonyms: ignore_synonyms,
                include_clickstream_data: include_clickstream_data,
                include_serp_info: include_serp_info,
                // replace_with_core_keyword: false // defaulting
            }];

            const response = await axios.post(
                'https://api.dataforseo.com/v3/dataforseo_labs/google/related_keywords/live',
                post_array,
                { auth, headers }
            );

            const tasks = response.data.tasks;
            if (!tasks || tasks.length === 0 || !tasks[0].result) {
                return NextResponse.json({ items: [] });
            }

            const items = tasks[0].result[0].items || [];
            const formattedItems = items.map((item: any) => ({
                keyword: item.keyword_data.keyword,
                search_volume: item.keyword_data.keyword_info.search_volume,
                cpc: item.keyword_data.keyword_info.cpc,
                competition: item.keyword_data.keyword_info.competition_level,
                trends: item.keyword_data.keyword_info.monthly_searches ? item.keyword_data.keyword_info.monthly_searches.map((m: any) => m.search_volume) : []
            }));

            return NextResponse.json({ items: formattedItems });
        }

    } catch (error: any) {
        console.error("DataForSEO Error:", error.response?.data || error.message);
        const errMsg = error.response?.data?.tasks?.[0]?.status_message || error.message || 'Failed to fetch keywords';
        return NextResponse.json({ error: errMsg }, { status: 500 });
    }
}
