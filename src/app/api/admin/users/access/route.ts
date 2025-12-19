import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
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

export async function POST(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { userId, status } = await req.json();

        if (!['approved', 'rejected', 'none'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        await connectDB();
        await User.findByIdAndUpdate(userId, { keywordResearchAccess: status });

        return NextResponse.json({ success: true, message: `User access ${status}` });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
