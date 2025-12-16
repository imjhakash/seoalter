import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await connectDB();
        const result = await mongoose.connection.collection('users').dropIndex('username_1');
        return NextResponse.json({ message: 'Index dropped successfully', result }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({
            message: 'Failed to drop index',
            error: error.message
        }, { status: 500 });
    }
}
