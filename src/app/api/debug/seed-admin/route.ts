import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { hashPassword } from '@/lib/auth';

export async function GET() {
    try {
        await connectDB();

        const email = 'helloatjh@gmail.com';
        const password = '20001118@Su';
        const hashedPassword = await hashPassword(password);

        const updatedUser = await User.findOneAndUpdate(
            { email },
            {
                email,
                password: hashedPassword,
                isVerified: true,
                maxUsage: 9999, // Visual only, logic bypasses anyway
                usageCount: 0
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ message: 'Admin seeded successfully', user: updatedUser.email });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to seed admin' }, { status: 500 });
    }
}
