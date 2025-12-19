import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/db';
import SystemSettings from '@/lib/models/SystemSettings';
import axios from 'axios';
import { JwtPayload } from 'jsonwebtoken';

export async function POST(request: NextRequest) {
    try {
        const { keyword, location_code, language_code } = await request.json();

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

        const post_array = [{
            keyword: keyword,
            location_code: location_code || 2840, // Default to US
            language_code: language_code || 'en',
            depth: 1,
            include_seed_keyword: true,
            include_serp_info: false,
            limit: 50
        }];

        const response = await axios.post('https://api.dataforseo.com/v3/dataforseo_labs/google/related_keywords/live', post_array, {
            auth: {
                username: settings.dataForSeoLogin,
                password: settings.dataForSeoPassword
            },
            headers: {
                'content-type': 'application/json'
            }
        });

        // Extract relevant data to simplify frontend processing
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
            trends: item.keyword_data.keyword_info.monthly_searches
        }));

        return NextResponse.json({ items: formattedItems });

    } catch (error: any) {
        console.error("DataForSEO Error:", error.response?.data || error.message);
        return NextResponse.json({ error: 'Failed to fetch keywords' }, { status: 500 });
    }
}
