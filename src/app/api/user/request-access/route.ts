import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { JwtPayload } from 'jsonwebtoken';

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token) as JwtPayload | null;
        if (!decoded || !decoded.userId) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        await connectDB();

        await User.findByIdAndUpdate(decoded.userId, {
            keywordResearchAccess: 'requested'
        });

        return NextResponse.json({ success: true, message: 'Access requested successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
