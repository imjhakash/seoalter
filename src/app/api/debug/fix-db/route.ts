import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SearchHistory from '@/lib/models/SearchHistory';

export async function GET() {
    try {
        await connectDB();

        try {
            const indexes = await SearchHistory.collection.indexes();
            await SearchHistory.collection.dropIndex('queryNormalized_1');
            const indexesAfter = await SearchHistory.collection.indexes();

            return NextResponse.json({
                message: 'Attempted to drop index.',
                before: indexes,
                after: indexesAfter
            });
        } catch (error: any) {
            return NextResponse.json({
                message: 'Error managing indexes',
                error: error.message,
                indexes: await SearchHistory.collection.indexes().catch(() => 'Could not list')
            });
        }

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
