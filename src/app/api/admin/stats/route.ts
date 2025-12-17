import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import SearchHistory from '@/lib/models/SearchHistory';
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
    await connectDB();

    const totalUsers = await User.countDocuments();
    const totalSearches = await SearchHistory.countDocuments();

    // Simple mock stats for today (could be more complex)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const searchesToday = await SearchHistory.countDocuments({ createdAt: { $gte: today } });

    return NextResponse.json({
        totalUsers,
        totalSearches,
        searchesToday
    });
}
