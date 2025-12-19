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
            include_serp_info = false,
            replace_with_core_keyword = false,
            sort_by = "relevance"
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

        // Access Check
        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isSuperadmin = user.email === SUPERADMIN_EMAIL;
        const accessStatus = user.keywordResearchAccess || 'none';

        if (!isSuperadmin && accessStatus !== 'approved') {
            return NextResponse.json({
                error: 'Access Denied',
                accessStatus: accessStatus
            }, { status: 403 });
        }

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
            // SEARCH VOLUME
            const targetKeywords = keywords.length > 0 ? keywords : (keyword ? [keyword] : []);
            if (targetKeywords.length === 0) {
                return NextResponse.json({ error: 'No keywords provided' }, { status: 400 });
            }

            const post_array = [{
                keywords: targetKeywords,
                location_code: location_code,
                language_code: language_code,
                sort_by: sort_by
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

            const items = tasks[0].result || [];
            const formattedItems = items.map((item: any) => ({
                keyword: item.keyword,
                search_volume: item.search_volume,
                cpc: item.cpc,
                competition: item.competition,
                trends: item.monthly_searches ? item.monthly_searches.map((m: any) => ({
                    month: m.month,
                    year: m.year,
                    count: m.search_volume
                })) : []
            }));

            return NextResponse.json({ items: formattedItems });

        } else {
            // RELATED KEYWORDS
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
                search_volume: item.keyword_data.keyword_info.search_volume,
                cpc: item.keyword_data.keyword_info.cpc,
                competition: item.keyword_data.keyword_info.competition_level,
                trends: item.keyword_data.keyword_info.monthly_searches ? item.keyword_data.keyword_info.monthly_searches.map((m: any) => ({
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
        const errMsg = error.response?.data?.tasks?.[0]?.status_message || error.message || 'Failed to fetch keywords';
        return NextResponse.json({ error: errMsg }, { status: 500 });
    }
}
