import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import connectDB from '@/lib/db';
import SearchHistory from '@/lib/models/SearchHistory';
import ChatInteraction from '@/lib/models/ChatInteraction';
import { normalizeQuery } from '@/lib/utils/serpManager';

export async function POST(request: NextRequest) {
    try {
        const { message, contextId, query, language = 'en' } = await request.json();

        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) {
            return NextResponse.json(
                { error: 'OpenAI API Key not configured in environment variables.' },
                { status: 500 }
            );
        }

        await connectDB();

        let dataset = null;
        let searchId = contextId;

        if (contextId) {
            const history = await SearchHistory.findById(contextId);
            if (history) {
                dataset = history.analyzedData;
            }
        } else if (query) {
            const qn = normalizeQuery(query);
            const history = await SearchHistory.findOne({ queryNormalized: qn });
            if (history) {
                dataset = history.analyzedData;
                searchId = history._id;
            }
        }

        // Map lang code to full language name
        const langMap: Record<string, string> = {
            'en': 'English',
            'nl': 'Dutch',
            'it': 'Italian'
        };
        const targetLang = langMap[language] || 'English';

        const systemPrompt = dataset
            ? `You are a helpful SEO assistant. Use the following analyzed dataset as the source of truth. Keep your response concise (3-10 lines). Only fallback to general knowledge if necessary. Reply in ${targetLang}. Dataset JSON: ${JSON.stringify(dataset).slice(0, 25000)}`
            : `You are a helpful SEO assistant. Keep your response concise (3-10 lines). If no dataset is provided, ask the user to run an analysis first. Reply in ${targetLang}.`;

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const reply = response.data.choices[0].message.content;

        if (searchId) {
            await ChatInteraction.create({
                searchId,
                userMessage: message,
                assistantReply: reply
            });
        }

        return NextResponse.json({ reply, searchId: searchId || null });
    } catch (error) {
        console.error("Chat Error:", (error as Error).message);
        return NextResponse.json(
            { reply: "I'm having trouble connecting to the AI. Please check your API key." },
            { status: 500 }
        );
    }
}
