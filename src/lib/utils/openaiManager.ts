import axios from 'axios';
import { SerpBundle } from './serpManager';

// Language name mapping for natural language instruction
const languageNames: Record<string, string> = {
    'en': 'English', 'de': 'German', 'nl': 'Dutch', 'es': 'Spanish', 'it': 'Italian',
    'fr': 'French', 'pt': 'Portuguese', 'ru': 'Russian', 'ja': 'Japanese', 'ko': 'Korean',
    'zh': 'Chinese', 'ar': 'Arabic', 'hi': 'Hindi', 'tr': 'Turkish', 'pl': 'Polish',
    'sv': 'Swedish', 'da': 'Danish', 'no': 'Norwegian', 'fi': 'Finnish', 'cs': 'Czech',
    'el': 'Greek', 'hu': 'Hungarian', 'ro': 'Romanian', 'th': 'Thai', 'vi': 'Vietnamese',
    'id': 'Indonesian', 'ms': 'Malay', 'he': 'Hebrew', 'uk': 'Ukrainian', 'bn': 'Bengali/Bangla'
};

export interface AnalysisResult {
    overallSummary: string;
    scores: { difficulty: number; opportunity: number };
    sectionInsights: Record<string, string>;
    discussionInsights?: { summary: string; sentiment: string; keyTopics: string[] };
    intent: { type: string; description: string; grade: string };
    keywords: { primary: string[]; secondary: string[]; longtail: string[] };
    clusters: { name: string; keywords: string[] }[];
    questions: string[];
    competitors: { name: string; score: number; strength: string }[];
    contentRequirements: string[];
    contentIdeas: { title: string; description: string; impact: string }[];
    strategy: string;
    citations: { title: string; url: string; snippet: string }[];
    trend: number[];
    organicResults?: unknown[];
    discussions?: unknown[];
    peopleAlsoAsk?: unknown[];
    relatedSearches?: unknown[];
    autocomplete?: unknown[];
    isError?: boolean;
}

export const analyzeWithGPT = async (
    query: string,
    serpData: SerpBundle,
    openaiApiKey: string,
    language: string = 'en'
): Promise<AnalysisResult> => {
    // Get language name for prompt
    const outputLanguage = languageNames[language] || 'English';

    // Extract key data from serpData for better context
    const organicResults = (serpData?.sources?.google as { data?: { organic_results?: unknown[] } })?.data?.organic_results || [];
    const discussions = (serpData?.sources?.discussions_and_forums as { data?: { discussions_and_forums?: unknown[] } })?.data?.discussions_and_forums ||
        (serpData?.sources?.google_forums as { data?: { organic_results?: unknown[] } })?.data?.organic_results || [];
    const relatedSearches = (serpData?.sources?.related_searches as { data?: { related_searches?: unknown[] } })?.data?.related_searches || [];
    const peopleAlsoAsk = (serpData?.sources?.people_also_ask as { data?: { related_questions?: unknown[] } })?.data?.related_questions || [];
    const autocomplete = (serpData?.sources?.google_autocomplete as { data?: { suggestions?: unknown[] } })?.data?.suggestions || [];

    // Format organic results for analysis
    const topResults = (organicResults as { title?: string; link?: string; snippet?: string; displayed_link?: string }[]).slice(0, 10).map((r, i) => ({
        position: i + 1,
        title: r.title,
        link: r.link,
        snippet: r.snippet,
        domain: r.displayed_link || r.link
    }));

    // Format discussions for analysis
    const discussionData = (discussions as { title?: string; source?: string; displayed_link?: string; snippet?: string; date?: string }[]).slice(0, 15).map(d => ({
        title: d.title,
        source: d.source || d.displayed_link,
        snippet: d.snippet,
        date: d.date
    }));

    const prompt = `You are SEOPataka, an expert SEO Analyst by Codemypixel. Analyze the Google Search data for: "${query}"

IMPORTANT: Write ALL your analysis and output in ${outputLanguage} language. Every text field must be in ${outputLanguage}.

=== TOP 10 ORGANIC SEARCH RESULTS ===
${JSON.stringify(topResults, null, 2)}

=== FORUM DISCUSSIONS & COMMUNITY POSTS ===
${JSON.stringify(discussionData, null, 2)}

=== RELATED SEARCHES ===
${JSON.stringify((relatedSearches as unknown[]).slice(0, 10), null, 2)}

=== PEOPLE ALSO ASK QUESTIONS ===
${JSON.stringify((peopleAlsoAsk as unknown[]).slice(0, 8), null, 2)}

=== AUTOCOMPLETE SUGGESTIONS ===
${JSON.stringify((autocomplete as unknown[]).slice(0, 10), null, 2)}

Based on this REAL data, provide a comprehensive SEO analysis. Be specific and reference actual data you see above.

CRITICAL: All text content MUST be written in ${outputLanguage}. This is mandatory.

Return a valid JSON object with this EXACT structure:
{
    "overallSummary": "Write 3-4 detailed paragraphs in ${outputLanguage}: 1) What this keyword is about based on the search results you see, 2) Who are the main competitors and why they rank (mention specific domains from results), 3) What content gaps and opportunities exist based on the data, 4) Specific strategy recommendations. Reference actual data from the results.",
    
    "scores": {
        "difficulty": 0-100,
        "opportunity": 0-100
    },
    
    "sectionInsights": {
        "difficulty": "In ${outputLanguage}: Explain difficulty based on actual competitors seen in results. Mention specific domains.",
        "opportunity": "In ${outputLanguage}: What opportunities exist based on content gaps in the results?",
        "competitors": "In ${outputLanguage}: Analyze the top 5 ranking sites. Their strengths and how to compete.",
        "keywords": "In ${outputLanguage}: Which related keywords and autocomplete suggestions are valuable?",
        "trends": "In ${outputLanguage}: Observations about search patterns and seasonality.",
        "questions": "In ${outputLanguage}: What do users really want based on People Also Ask questions?",
        "results": "In ${outputLanguage}: What content type dominates (guides, lists, videos)? What quality level is needed?"
    },

    "discussionInsights": {
        "summary": "In ${outputLanguage}: Write 3-4 paragraphs analyzing the ACTUAL forum discussions and community posts above. What are people really discussing? What problems do they have? What solutions are they seeking? What complaints or praises do they mention? Be specific and reference actual discussion topics you see in the data.",
        "sentiment": "Positive/Neutral/Negative",
        "keyTopics": ["topic1", "topic2", "topic3"]
    },
    
    "intent": {
        "type": "Informational/Commercial/Transactional/Navigational",
        "description": "In ${outputLanguage}: Why people search this based on the results",
        "grade": "A/B/C"
    },
    
    "keywords": {
        "primary": ["main keywords from data"],
        "secondary": ["related keywords from autocomplete/related searches"],
        "longtail": ["longer phrases from data"]
    },
    
    "clusters": [
        {"name": "Topic Group Name", "keywords": ["kw1", "kw2", "kw3"]}
    ],
    
    "questions": ["Extract real questions from People Also Ask and discussions"],
    
    "competitors": [
        {"name": "Actual domain from results", "score": 0-100, "strength": "In ${outputLanguage}: Why they rank"}
    ],

    "contentRequirements": [
        "In ${outputLanguage}: Specific requirements based on what top pages have"
    ],
    
    "contentIdeas": [
        {"title": "In ${outputLanguage}", "description": "In ${outputLanguage}: Based on gaps in current results", "impact": "High/Medium/Low"}
    ],
    
    "strategy": "In ${outputLanguage}: Step-by-step action plan based on the competitive landscape seen in results.",
    
    "citations": [
        {"title": "From actual results", "url": "Real URL", "snippet": "Key info"}
    ],
    
    "trend": [50, 55, 60, 58, 65, 70, 72, 68, 75, 80, 78, 82]
}`;

    try {
        const systemMessage = language === 'en'
            ? "You are an SEO expert. Return only valid JSON. Be helpful and use simple language."
            : `You are an SEO expert. Return only valid JSON. CRITICAL: Write ALL text content in ${outputLanguage} language. Every string value in your JSON response must be in ${outputLanguage}.`;

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`
            }
        });

        const content = response.data.choices[0].message.content;
        return JSON.parse(content);

    } catch (error) {
        console.error("OpenAI Error:", (error as { response?: { data?: unknown }; message?: string }).response?.data || (error as Error).message);
        return {
            overallSummary: "Analysis failed. Please check your OpenAI API key and try again.",
            scores: { difficulty: 50, opportunity: 50 },
            sectionInsights: {
                difficulty: "Unable to analyze. Please try again.",
                opportunity: "Unable to analyze. Please try again.",
                competitors: "Unable to analyze. Please try again.",
                keywords: "Unable to analyze. Please try again.",
                trends: "Unable to analyze. Please try again.",
                questions: "Unable to analyze. Please try again.",
                results: "Unable to analyze. Please try again."
            },
            intent: { type: "Unknown", description: "Analysis failed", grade: "C" },
            keywords: { primary: [], secondary: [], longtail: [] },
            clusters: [],
            questions: ["Analysis failed"],
            competitors: [],
            contentRequirements: [],
            contentIdeas: [{ title: "Try Again", description: "Please check your API keys", impact: "High" }],
            strategy: "Please check your API keys and try again.",
            citations: [],
            trend: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
            isError: true
        };
    }
};
