import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(req: Request) {
    try {
        const { email, code } = await req.json();

        await connectDB();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (user.isVerified) {
            return NextResponse.json({ message: 'User already verified' }, { status: 200 });
        }

        if (user.verificationCode !== code) {
            return NextResponse.json({ message: 'Invalid code' }, { status: 400 });
        }

        if (user.verificationCodeExpires < new Date()) {
            return NextResponse.json({ message: 'Code expired' }, { status: 400 });
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
