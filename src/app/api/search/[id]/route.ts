import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SearchHistory from '@/lib/models/SearchHistory';
import Visualization from '@/lib/models/Visualization';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        
        const { id } = await params;
        const history = await SearchHistory.findById(id);
        
        if (!history) {
            return NextResponse.json({ error: 'Search not found' }, { status: 404 });
        }

        const visualization = history.visualizationId
            ? await Visualization.findById(history.visualizationId)
            : await Visualization.findOne({ queryNormalized: history.queryNormalized });

        return NextResponse.json({
            source: 'history',
            data: history.analyzedData,
            searchId: history._id,
            visualization: visualization ? visualization.data : null
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
