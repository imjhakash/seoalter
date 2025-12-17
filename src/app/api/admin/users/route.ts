import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
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
    const users = await User.find({}).sort({ createdAt: -1 });
    return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { userId, credits } = await req.json();
    await connectDB();
    const user = await User.findByIdAndUpdate(userId, { maxUsage: credits }, { new: true });
    return NextResponse.json(user);
}

export async function DELETE(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    await connectDB();
    await User.findByIdAndDelete(userId);
    return NextResponse.json({ success: true });
}
