import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SearchHistory from '@/lib/models/SearchHistory';
import User from '@/lib/models/User';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { JwtPayload } from 'jsonwebtoken';

async function isAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return false;
    const decoded = verifyToken(token) as JwtPayload | null;
    if (!decoded || !decoded.userId) return false;
    await connectDB();
    const user = await User.findById(decoded.userId);
    return user && user.email === 'helloatjh@gmail.com';
}

export async function GET(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    await connectDB();

    let query = {};
    if (userId) {
        query = { userId };
    }

    const history = await SearchHistory.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('userId', 'email'); // Populate user email if available

    return NextResponse.json(history);
}
