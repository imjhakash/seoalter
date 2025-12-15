import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { JwtPayload } from 'jsonwebtoken';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        const decoded = verifyToken(token) as JwtPayload | null;
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error('Me API error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
