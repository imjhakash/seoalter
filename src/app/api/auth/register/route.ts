import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { hashPassword } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
        }

        await connectDB();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        const newUser = await User.create({
            email,
            password: hashedPassword,
            verificationCode,
            verificationCodeExpires,
        });

        try {
            await sendVerificationEmail(email, verificationCode);
        } catch (error) {
            console.error('Email send error:', error);
            // Could delete user if email fails, but let's just return success for now and allow resend later logic if needed
        }

        return NextResponse.json({ message: 'User created. Please check your email for verification code.' }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
