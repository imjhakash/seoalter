import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SearchHistory from '@/lib/models/SearchHistory';

export async function GET() {
    try {
        await connectDB();
        
        const history = await SearchHistory.find()
            .select('query queryNormalized createdAt scores')
            .sort({ createdAt: -1 })
            .limit(50);
        
        return NextResponse.json(history);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
