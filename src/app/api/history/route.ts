import { NextRequest, NextResponse } from 'next/server'; // Updated import
import connectDB from '@/lib/db';
import SearchHistory from '@/lib/models/SearchHistory';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { JwtPayload } from 'jsonwebtoken';

export async function GET() {
    try {
        await connectDB();

        // Auth Check
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token) as JwtPayload | null;
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const history = await SearchHistory.find({ userId: decoded.userId })
            .select('query queryNormalized createdAt scores')
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json(history);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
