import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import SystemSettings from '@/lib/models/SystemSettings';
import axios from 'axios';
import { JwtPayload } from 'jsonwebtoken';

const SUPERADMIN_EMAIL = 'helloatjh@gmail.com';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            mode = 'related',
            keyword,
            keywords = [],
            location_code = 2840,
            language_code = 'en',
            // Advanced params
            depth = 2,
            limit = 50,
            include_seed_keyword = true,
            ignore_synonyms = false,
            include_clickstream_data = false,
            include_serp_info = true, // Defaulting to true for rich data
            replace_with_core_keyword = false
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
        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Superadmin status is no longer required for basic keyword research, but we could add usage limits here if needed.
        const isSuperadmin = user.email === SUPERADMIN_EMAIL;

        const settings = await SystemSettings.findOne({}).select('+dataForSeoLogin +dataForSeoPassword');

        if (!settings?.dataForSeoLogin || !settings?.dataForSeoPassword) {
            return NextResponse.json({ error: 'Tool configuration missing. Contact support.' }, { status: 503 });
        }

        const auth = {
            username: settings.dataForSeoLogin,
            password: settings.dataForSeoPassword
        };
        const headers = { 'content-type': 'application/json' };

        if (mode === 'volume') {
            // SEARCH VOLUME (LABS API for SEO Data)
            // Endpoint: https://api.dataforseo.com/v3/dataforseo_labs/google/historical_search_volume/live
            // This provides keyword difficulty and SEO metrics unlike Google Ads API.

            const targetKeywords = keywords.length > 0 ? keywords : (keyword ? [keyword] : []);
            if (targetKeywords.length === 0) {
                return NextResponse.json({ error: 'No keywords provided' }, { status: 400 });
            }

            const post_array = [{
                keywords: targetKeywords,
                location_code: location_code,
                language_code: language_code,
                include_serp_info: include_serp_info
            }];

            const response = await axios.post(
                'https://api.dataforseo.com/v3/dataforseo_labs/google/historical_search_volume/live',
                post_array,
                { auth, headers }
            );

            const tasks = response.data.tasks;
            if (!tasks || tasks.length === 0 || !tasks[0].result) {
                return NextResponse.json({ items: [] });
            }

            const items = tasks[0].result[0].items || [];
            const formattedItems = items.map((item: any) => ({
                keyword: item.keyword,
                search_volume: item.keyword_info?.search_volume,
                cpc: item.keyword_info?.cpc,
                competition: item.keyword_info?.competition_level, // Ad competition
                difficulty: item.keyword_properties?.keyword_difficulty, // SEO Difficulty (0-100)
                low_bid: item.keyword_info?.low_top_of_page_bid,
                high_bid: item.keyword_info?.high_top_of_page_bid,
                trends: item.keyword_info?.monthly_searches ? item.keyword_info.monthly_searches.map((m: any) => ({
                    month: m.month,
                    year: m.year,
                    count: m.search_volume
                })) : [],
                intent: item.keyword_properties?.search_intent_info?.main_intent_label || 'unknown' // infer if available or default
            }));

            return NextResponse.json({ items: formattedItems });

        } else {
            // RELATED KEYWORDS
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
                replace_with_core_keyword: replace_with_core_keyword
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
                search_volume: item.keyword_data.keyword_info?.search_volume,
                cpc: item.keyword_data.keyword_info?.cpc,
                competition: item.keyword_data.keyword_info?.competition_level,
                difficulty: item.keyword_data.keyword_properties?.keyword_difficulty, // SEO Difficulty
                low_bid: item.keyword_data.keyword_info?.low_top_of_page_bid,
                high_bid: item.keyword_data.keyword_info?.high_top_of_page_bid,
                trends: item.keyword_data.keyword_info?.monthly_searches ? item.keyword_data.keyword_info.monthly_searches.map((m: any) => ({
                    month: m.month,
                    year: m.year,
                    count: m.search_volume
                })) : [],
                clickstream: item.clickstream_keyword_info || null
            }));

            return NextResponse.json({ items: formattedItems });
        }

    } catch (error: any) {
        console.error("DataForSEO Error:", error.response?.data || error.message);
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
            return NextResponse.json(
                { error: 'Configuration Error: Invalid DataForSEO Credentials. Please check settings in Admin Panel.' },
                { status: 500 }
            );
        }
        const errMsg = error.response?.data?.tasks?.[0]?.status_message || error.message || 'Failed to fetch keywords';
        return NextResponse.json({ error: errMsg }, { status: 500 });
    }
}
