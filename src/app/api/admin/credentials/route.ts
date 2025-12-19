import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import SystemSettings from '@/lib/models/SystemSettings';
import { JwtPayload } from 'jsonwebtoken';

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        const decoded = verifyToken(token) as JwtPayload | null;
        if (!decoded || !decoded.userId) return null;

        await connectDB();
        const user = await User.findById(decoded.userId);

        // Hardcoded superadmin check as used elsewhere
        if (user && user.email === 'helloatjh@gmail.com') {
            return user;
        }
        return null;
    } catch (error) {
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const admin = await checkAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const settings = await SystemSettings.findOne({}).select('+openaiKey +serpKey');

        // Mask keys for display
        const mask = (key: string) => key ? `${key.substring(0, 3)}...${key.substring(key.length - 4)}` : '';

        return NextResponse.json({
            openaiKey: settings?.openaiKey ? mask(settings.openaiKey) : '',
            serpKey: settings?.serpKey ? mask(settings.serpKey) : '',
            hasOpenaiKey: !!settings?.openaiKey,
            hasSerpKey: !!settings?.serpKey
        });

    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const admin = await checkAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { openaiKey, serpKey } = await request.json();

        await connectDB();

        let settings = await SystemSettings.findOne({});
        if (!settings) {
            settings = new SystemSettings({});
        }

        if (openaiKey) settings.openaiKey = openaiKey;
        if (serpKey) settings.serpKey = serpKey;
        settings.updatedAt = new Date();

        await settings.save();

        return NextResponse.json({ success: true, message: 'Credentials updated successfully' });

    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
