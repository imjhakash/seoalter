import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { comparePassword, signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        await connectDB();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        if (!user.isVerified) {
            return NextResponse.json({ message: 'Please verify your email first', isVerified: false }, { status: 403 });
        }

        const token = signToken({ userId: user._id, email: user.email });

        const response = NextResponse.json({ message: 'Login successful', user: { email: user.email, usageCount: user.usageCount, maxUsage: user.maxUsage } }, { status: 200 });

        // Set HTTP-only cookie
        const cookieStore = await cookies();
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
