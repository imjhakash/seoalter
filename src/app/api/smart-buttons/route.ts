import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SearchHistory from '@/lib/models/SearchHistory';
import { normalizeQuery } from '@/lib/utils/serpManager';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const contextId = searchParams.get('contextId');
        const query = searchParams.get('query');
        const language = searchParams.get('language') || 'en';

        await connectDB();

        let dataset = null;

        if (contextId) {
            const history = await SearchHistory.findById(contextId);
            dataset = history?.analyzedData || null;
        } else if (query) {
            const qn = normalizeQuery(query);
            const history = await SearchHistory.findOne({ queryNormalized: qn });
            dataset = history?.analyzedData || null;
        }

        let buttons = Array.isArray(dataset?.smartButtons) && dataset.smartButtons.length
            ? dataset.smartButtons.map((b: { label?: string; prompt?: string }) => ({
                label: b?.label,
                prompt: b?.prompt || b?.label
            }))
            : null;

        if (!buttons) {
            const fallbacks: Record<string, { label: string; prompt: string }[]> = {
                'nl': [
                    { label: 'Toon top SEO zoekwoorden', prompt: 'Toon top SEO zoekwoorden en onderwerp clusters' },
                    { label: 'Toon veelgestelde vragen', prompt: 'Toon vragen die het meest gesteld worden door gebruikers' },
                    { label: 'Suggesties voor blog ideeën', prompt: 'Suggereer blog ideeën gebaseerd op laatste trends' }
                ],
                'it': [
                    { label: 'Mostra parole chiave SEO', prompt: 'Mostra le migliori parole chiave SEO e i cluster di argomenti' },
                    { label: 'Mostra domande frequenti', prompt: 'Mostra le domande più poste dagli utenti' },
                    { label: 'Suggerisci idee per blog', prompt: 'Suggerisci idee per blog basate sulle ultime tendenze' }
                ],
                'en': [
                    { label: 'Show top SEO keywords', prompt: 'Show top SEO keywords and topic clusters' },
                    { label: 'Show most asked questions', prompt: 'Show most asked questions by users' },
                    { label: 'Suggest blog ideas', prompt: 'Suggest blog ideas based on latest trends & forums' }
                ]
            };
            buttons = fallbacks[language] || fallbacks['en'];
        }

        return NextResponse.json({ buttons });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
