import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { comparePassword, signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { email, password, rememberMe } = await req.json();

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

        // Let's do it in one go if I knew line 9 content exactly.
        // Max Age: 1 week default, 30 days if rememberMe? Or session if not? 
        // Typically: Session (undefined maxAge) if not rememberMe, but JWT needs expiration.
        // Let's say 1 day vs 30 days. Or 7 days vs 30 days.
        const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;

        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: maxAge,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
