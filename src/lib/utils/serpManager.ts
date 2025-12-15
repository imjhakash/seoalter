import axios from 'axios';

export const normalizeQuery = (q: string): string => (q || '').trim().toLowerCase();

interface SerpApiResponse {
    engine: string;
    apiKeyAlias: string;
    requestParams: Record<string, string>;
    data: Record<string, unknown>;
}

const fetchFromSerpApi = async (
    apiKey: string,
    engine: string,
    params: Record<string, string>
): Promise<SerpApiResponse> => {
    const response = await axios.get('https://serpapi.com/search', {
        params: {
            ...params,
            engine,
            api_key: apiKey
        }
    });

    return {
        engine,
        apiKeyAlias: 'primary',
        requestParams: params,
        data: response.data
    };
};

export interface SerpBundle {
    query: string;
    queryNormalized: string;
    region: string;
    language: string;
    sources: Record<string, SerpApiResponse | { data: Record<string, unknown> }>;
}

export const fetchSerpBundle = async (
    query: string,
    apiKey: string,
    region: string = 'us',
    language: string = 'en'
): Promise<SerpBundle> => {
    const q = (query || '').trim();
    if (!q) {
        throw new Error('Query required');
    }

    if (!apiKey) {
        throw new Error('SERP API Key is missing');
    }

    // Handle worldwide region - use 'us' as default for API calls but don't restrict geo
    const gl = region === 'ww' ? 'us' : region;
    const geo = region === 'ww' ? '' : region.toUpperCase();
    const hl = language || 'en';

    // 1. Primary Google Search (Organic, Discussions, People Also Ask, etc.)
    const baseGoogle = await fetchFromSerpApi(apiKey, 'google', {
        q,
        gl,
        hl
    });

    const results: SerpBundle = {
        query: q,
        queryNormalized: normalizeQuery(q),
        region,
        language,
        sources: {
            google: baseGoogle
        }
    };

    const googleData = baseGoogle.data || {};

    // Extract useful nested data from the main search result to keep structure consistent
    if (Array.isArray((googleData as Record<string, unknown>).related_searches) && ((googleData as Record<string, unknown>).related_searches as unknown[]).length) {
        results.sources.related_searches = { data: { related_searches: (googleData as Record<string, unknown>).related_searches } };
    }
    if (Array.isArray((googleData as Record<string, unknown>).discussions_and_forums) && ((googleData as Record<string, unknown>).discussions_and_forums as unknown[]).length) {
        results.sources.discussions_and_forums = { data: { discussions_and_forums: (googleData as Record<string, unknown>).discussions_and_forums } };
    }
    if (Array.isArray((googleData as Record<string, unknown>).related_questions) && ((googleData as Record<string, unknown>).related_questions as unknown[]).length) {
        results.sources.people_also_ask = { data: { related_questions: (googleData as Record<string, unknown>).related_questions } };
    }

    // 2. Google Trends (Timeseries only)
    try {
        const trendsParams: Record<string, string> = {
            q,
            hl,
            data_type: 'TIMESERIES',
            date: 'today 12-m'
        };
        // Only add geo if not worldwide
        if (geo) {
            trendsParams.geo = geo;
        }
        results.sources.google_trends_timeseries = await fetchFromSerpApi(apiKey, 'google_trends', trendsParams);
    } catch (error) {
        console.error("Google Trends API failed:", (error as Error).message);
    }

    // 3. Google Autocomplete (for keyword ideas)
    try {
        results.sources.google_autocomplete = await fetchFromSerpApi(apiKey, 'google_autocomplete', {
            q,
            hl,
            gl
        });
    } catch (error) {
        console.error("Autocomplete API failed:", (error as Error).message);
    }

    // 4. Google Forums (dedicated discussion search)
    try {
        results.sources.google_forums = await fetchFromSerpApi(apiKey, 'google_forums', {
            q,
            hl,
            gl
        });
    } catch (error) {
        console.error("Forums API failed:", (error as Error).message);
    }

    return results;
};
