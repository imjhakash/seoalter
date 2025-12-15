import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: 'Missing email' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ email });
        if (!user) {
            // For security, do not reveal if user exists.
            return NextResponse.json({ message: 'If that email is registered, we have sent a reset link.' }, { status: 200 });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        user.resetToken = resetToken;
        user.resetTokenExpires = resetTokenExpires;
        await user.save();

        try {
            await sendPasswordResetEmail(email, resetToken);
        } catch (error) {
            console.error("Email send error:", error);
            return NextResponse.json({ message: 'Error sending email' }, { status: 500 });
        }

        return NextResponse.json({ message: 'If that email is registered, we have sent a reset link.' }, { status: 200 });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
