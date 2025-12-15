import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { email, token, newPassword } = await req.json();

        if (!email || !token || !newPassword) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({
            email,
            resetToken: token,
            resetTokenExpires: { $gt: new Date() }
        });

        if (!user) {
            return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(newPassword);

        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;
        await user.save();

        return NextResponse.json({ message: 'Password reset successful. You can now login.' }, { status: 200 });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
