import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await connectDB();
        const collection = mongoose.connection.collection('users');
        const historyCollection = mongoose.connection.collection('search_history'); // Access history collection

        // Drop 'username_1' from users if exists
        try { await collection.dropIndex('username_1'); } catch (e) { }

        // Drop 'queryNormalized_1' from search_history so we can have duplicates for different users
        try { await historyCollection.dropIndex('queryNormalized_1'); } catch (e) { }

        return NextResponse.json({ message: 'Indexes dropped successfully (username_1, queryNormalized_1)' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({
            message: 'Failed to drop index',
            error: error.message
        }, { status: 500 });
    }
}
