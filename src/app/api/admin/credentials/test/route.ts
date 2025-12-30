import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import SystemSettings from '@/lib/models/SystemSettings';
import { JwtPayload } from 'jsonwebtoken';
import axios from 'axios';

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;

    try {
        const decoded = verifyToken(token) as JwtPayload | null;
        if (!decoded || !decoded.userId) return null;

        await connectDB();
        const user = await User.findById(decoded.userId);
        if (user && user.email === 'helloatjh@gmail.com') return user;
        return null;
    } catch (error) {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { type, value, value2, isMasked, isMasked2 } = await request.json();

        // Fetch current settings if we need to use saved keys for testing
        let settings: any = null;
        if (isMasked || isMasked2) {
            settings = await SystemSettings.findOne({}).select('+openaiKey +serpKey +dataForSeoLogin +dataForSeoPassword');
        }

        if (type === 'openai') {
            const finalValue = isMasked ? settings?.openaiKey : value;
            try {
                await axios.get('https://api.openai.com/v1/models', {
                    headers: { 'Authorization': `Bearer ${finalValue}` }
                });
                return NextResponse.json({ success: true, message: 'OpenAI Connection Successful' });
            } catch (err: any) {
                const msg = err.response?.data?.error?.message || err.message;
                return NextResponse.json({ success: false, error: msg }, { status: 400 });
            }
        }

        if (type === 'serp') {
            const finalValue = isMasked ? settings?.serpKey : value;
            try {
                await axios.get('https://serpapi.com/search', {
                    params: { q: 'test', engine: 'google', api_key: finalValue }
                });
                return NextResponse.json({ success: true, message: 'SerpApi Connection Successful' });
            } catch (err: any) {
                const msg = err.response?.data?.error || err.message;
                return NextResponse.json({ success: false, error: msg }, { status: 400 });
            }
        }

        if (type === 'dataforseo') {
            const finalLogin = isMasked ? settings?.dataForSeoLogin : value;
            const finalPass = isMasked2 ? settings?.dataForSeoPassword : value2;
            try {
                // Test with a lightweight endpoint: Locations
                await axios.get('https://api.dataforseo.com/v3/keywords_data/google/locations', {
                    auth: { username: finalLogin, password: finalPass }
                });
                return NextResponse.json({ success: true, message: 'DataForSEO Connection Successful' });
            } catch (err: any) {
                const msg = err.response?.data?.tasks?.[0]?.status_message || err.message;
                return NextResponse.json({ success: false, error: msg }, { status: 400 });
            }
        }

        return NextResponse.json({ error: 'Invalid test type' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
