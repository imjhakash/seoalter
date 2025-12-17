import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SearchHistory from '@/lib/models/SearchHistory';

export async function GET() {
    try {
        await connectDB();

        // Attempt to drop the unique index
        try {
            await SearchHistory.collection.dropIndex('queryNormalized_1');
            return NextResponse.json({ message: 'Index queryNormalized_1 dropped successfully.' });
        } catch (idxError: any) {
            if (idxError.codeName === 'IndexNotFound') {
                return NextResponse.json({ message: 'Index not found, maybe already dropped.' });
            }
            throw idxError;
        }

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
