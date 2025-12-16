'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, Target, Users, FileText, Globe, Sparkles, HelpCircle, ExternalLink, Layers, MessageCircle, Menu } from 'lucide-react';
import axios from 'axios';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import ChatAssistant from './ChatAssistant';
import Sidebar from './Sidebar';
import LanguageSwitcher from './LanguageSwitcher';
import HowItWorks from './HowItWorks';
import AnalysisProgress from './AnalysisProgress';

interface HistoryItem {
    _id: string;
    query: string;
    queryNormalized: string;
    createdAt: string;
}

interface AnalysisData {
    overallSummary?: string;
    scores?: { difficulty?: number; opportunity?: number };
    sectionInsights?: Record<string, string>;
    discussionInsights?: { summary?: string; sentiment?: string; keyTopics?: string[] };
    intent?: { type?: string; description?: string; grade?: string };
    keywords?: { primary?: string[]; secondary?: string[]; longtail?: string[] };
    clusters?: { name: string; keywords: string[] }[];
    questions?: string[];
    competitors?: { name: string; score: number; strength: string }[];
    contentRequirements?: string[];
    contentIdeas?: { title: string; description: string; impact: string }[];
    strategy?: string;
    citations?: { title: string; url: string; snippet: string }[];
    trend?: number[];
    organicResults?: { position?: number; title?: string; link?: string; snippet?: string; displayed_link?: string; favicon?: string; rich_snippet?: { top?: { extensions?: string[] } } }[];
    discussions?: { title?: string; link?: string; source?: string; snippet?: string; date?: string }[];
    peopleAlsoAsk?: { question?: string }[];
    relatedSearches?: { query?: string }[];
    autocomplete?: { value?: string }[];
}

interface VizData {
    trends?: {
        timeseries?: {
            timeline_data?: { date?: string; values?: { value?: string }[] }[];
        };
    };
}

const Dashboard = ({ lang, dict }: { lang: string; dict: any }) => {
    const [region, setRegion] = useState('us');
    const [language, setLanguage] = useState(lang || 'en');
    const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
    const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<AnalysisData | null>(null);
    const [vizData, setVizData] = useState<VizData | null>(null);
    const [dashboardTab, setDashboardTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [user, setUser] = useState<{ email: string; usageCount: number; maxUsage: number; } | null>(null);
    const router = useRouter();

    // Sync language state with prop if needed, or primarily use prop for UI
    useEffect(() => {
        if (lang) {
            setLanguage(lang);
        }
    }, [lang]);


    // Modify chartData to depend on user state if needed (not strict, but good practice)
    const chartData = useMemo(() => {
        if (vizData?.trends?.timeseries?.timeline_data) {
            return vizData.trends.timeseries.timeline_data.map(item => ({
                date: item.date,
                value: parseInt(item.values?.[0]?.value || '0') || 0
            }));
        }
        if (data?.trend) {
            return data.trend.map((v, i) => ({
                date: new Date(new Date().setMonth(new Date().getMonth() - (11 - i))).toLocaleDateString('en-US', { month: 'short' }),
                value: v
            }));
        }
        return [];
    }, [vizData, data]);

    useEffect(() => {
        const init = async () => {
            try {
                const userRes = await axios.get('/api/auth/me');
                setUser(userRes.data.user);

                fetchHistory();
                const lastId = typeof window !== 'undefined' ? localStorage.getItem('lastSearchId') : null;
                if (lastId) {
                    fetchSearchById(lastId);
                }
            } catch (error) {
                // If not authenticated, redirect to login
                // We should check the error status preferably
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    // Use window.location for full reload to clear any stale state if needed, or router
                    window.location.href = '/login';
                    return;
                }
                console.error("Failed to init dashboard:", error);
            }
        };

        init();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('/api/history');
            setHistoryList(res.data);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
    };

    const fetchSearchById = async (id: string) => {
        setLoading(true);
        setCurrentSearchId(id);
        try {
            const res = await axios.get(`/api/search/${id}`);
            setData(res.data.data);
            setVizData(res.data.visualization);
            setQuery(res.data.data.keywords?.primary?.[0] || '');
            setDashboardTab('overview');
            fetchHistory();
        } catch (error) {
            console.error("Failed to restore session:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewAnalysis = () => {
        setData(null);
        setQuery('');
        setVizData(null);
        setCurrentSearchId(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('lastSearchId');
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        if (user && user.usageCount >= user.maxUsage) {
            alert("You have reached your free limit of 3 analyses.");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post('/api/search', { query, region, language });
            setData(res.data.data);
            setVizData(res.data.visualization);
            if (res.data.searchId) {
                localStorage.setItem('lastSearchId', res.data.searchId);
                setCurrentSearchId(res.data.searchId);
            }
            // Update user quota locally to reflect change immediately
            if (user) {
                setUser({ ...user, usageCount: user.usageCount + 1 });
            }
            fetchHistory();
        } catch (error) {
            console.error(error);
            const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || (error as Error).message || 'Unknown error occurred';
            alert(`Search failed: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const regions = [
        { code: 'ww', name: 'Worldwide', flag: '🌍' },
        { code: 'us', name: 'United States', flag: '🇺🇸' },
        { code: 'ca', name: 'Canada', flag: '🇨🇦' },
        { code: 'mx', name: 'Mexico', flag: '🇲🇽' },
        { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
        { code: 'de', name: 'Germany', flag: '🇩🇪' },
        { code: 'fr', name: 'France', flag: '🇫🇷' },
        { code: 'es', name: 'Spain', flag: '🇪🇸' },
        { code: 'it', name: 'Italy', flag: '🇮🇹' },
        { code: 'nl', name: 'Netherlands', flag: '🇳🇱' },
        { code: 'be', name: 'Belgium', flag: '🇧🇪' },
        { code: 'pt', name: 'Portugal', flag: '🇵🇹' },
        { code: 'pl', name: 'Poland', flag: '🇵🇱' },
        { code: 'at', name: 'Austria', flag: '🇦🇹' },
        { code: 'ch', name: 'Switzerland', flag: '🇨🇭' },
        { code: 'se', name: 'Sweden', flag: '🇸🇪' },
        { code: 'no', name: 'Norway', flag: '🇳🇴' },
        { code: 'dk', name: 'Denmark', flag: '🇩🇰' },
        { code: 'fi', name: 'Finland', flag: '🇫🇮' },
        { code: 'ie', name: 'Ireland', flag: '🇮🇪' },
        { code: 'in', name: 'India', flag: '🇮🇳' },
        { code: 'cn', name: 'China', flag: '🇨🇳' },
        { code: 'jp', name: 'Japan', flag: '🇯🇵' },
        { code: 'kr', name: 'South Korea', flag: '🇰🇷' },
        { code: 'sg', name: 'Singapore', flag: '🇸🇬' },
        { code: 'hk', name: 'Hong Kong', flag: '🇭🇰' },
        { code: 'tw', name: 'Taiwan', flag: '🇹🇼' },
        { code: 'th', name: 'Thailand', flag: '🇹🇭' },
        { code: 'vn', name: 'Vietnam', flag: '🇻🇳' },
        { code: 'my', name: 'Malaysia', flag: '🇲🇾' },
        { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
        { code: 'ph', name: 'Philippines', flag: '🇵🇭' },
        { code: 'pk', name: 'Pakistan', flag: '🇵🇰' },
        { code: 'bd', name: 'Bangladesh', flag: '🇧🇩' },
        { code: 'ae', name: 'UAE', flag: '🇦🇪' },
        { code: 'sa', name: 'Saudi Arabia', flag: '🇸🇦' },
        { code: 'il', name: 'Israel', flag: '🇮🇱' },
        { code: 'tr', name: 'Turkey', flag: '🇹🇷' },
        { code: 'eg', name: 'Egypt', flag: '🇪🇬' },
        { code: 'au', name: 'Australia', flag: '🇦🇺' },
        { code: 'nz', name: 'New Zealand', flag: '🇳🇿' },
        { code: 'za', name: 'South Africa', flag: '🇿🇦' },
        { code: 'ng', name: 'Nigeria', flag: '🇳🇬' },
        { code: 'ke', name: 'Kenya', flag: '🇰🇪' },
        { code: 'br', name: 'Brazil', flag: '🇧🇷' },
        { code: 'ar', name: 'Argentina', flag: '🇦🇷' },
        { code: 'cl', name: 'Chile', flag: '🇨🇱' },
        { code: 'co', name: 'Colombia', flag: '🇨🇴' },
        { code: 'pe', name: 'Peru', flag: '🇵🇪' },
        { code: 'ru', name: 'Russia', flag: '🇷🇺' },
        { code: 'ua', name: 'Ukraine', flag: '🇺🇦' },
    ];

    const languages = [
        { code: 'en', name: 'English', native: 'English' },
        { code: 'de', name: 'German', native: 'Deutsch' },
        { code: 'nl', name: 'Dutch', native: 'Nederlands' },
        { code: 'es', name: 'Spanish', native: 'Español' },
        { code: 'it', name: 'Italian', native: 'Italiano' },
        { code: 'fr', name: 'French', native: 'Français' },
        { code: 'pt', name: 'Portuguese', native: 'Português' },
        { code: 'ru', name: 'Russian', native: 'Русский' },
        { code: 'ja', name: 'Japanese', native: '日本語' },
        { code: 'ko', name: 'Korean', native: '한국어' },
        { code: 'zh', name: 'Chinese', native: '中文' },
        { code: 'ar', name: 'Arabic', native: 'العربية' },
        { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
        { code: 'tr', name: 'Turkish', native: 'Türkçe' },
        { code: 'pl', name: 'Polish', native: 'Polski' },
        { code: 'sv', name: 'Swedish', native: 'Svenska' },
        { code: 'da', name: 'Danish', native: 'Dansk' },
        { code: 'no', name: 'Norwegian', native: 'Norsk' },
        { code: 'fi', name: 'Finnish', native: 'Suomi' },
        { code: 'cs', name: 'Czech', native: 'Čeština' },
        { code: 'el', name: 'Greek', native: 'Ελληνικά' },
        { code: 'hu', name: 'Hungarian', native: 'Magyar' },
        { code: 'ro', name: 'Romanian', native: 'Română' },
        { code: 'th', name: 'Thai', native: 'ไทย' },
        { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
        { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
        { code: 'ms', name: 'Malay', native: 'Bahasa Melayu' },
        { code: 'he', name: 'Hebrew', native: 'עברית' },
        { code: 'uk', name: 'Ukrainian', native: 'Українська' },
        { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    ];

    const renderLoading = () => (
        <AnalysisProgress query={query} />
    );

    const renderOverview = () => (
        <div className="space-y-6 pb-20">
            {/* Overall Summary */}
            <div className="glass-card p-6 border-l-4 border-amber-500 bg-gradient-to-r from-amber-900/10 to-transparent">
                <h3 className="text-lg font-bold text-amber-300 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" /> {dict?.dashboard?.overview?.title || "Complete Analysis Overview"}
                </h3>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-line">{data?.overallSummary}</p>

                {data?.citations && data.citations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <h4 className="text-sm font-bold text-amber-200 mb-2">{dict?.dashboard?.overview?.sources || "Sources"}</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.citations.map((cite, i) => (
                                <a key={i} href={cite.url} target="_blank" rel="noreferrer" className="text-xs bg-white/5 px-3 py-1 rounded-full hover:bg-white/10 flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3" /> {cite.title}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Difficulty */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-zinc-500 text-xs uppercase font-bold">{dict?.dashboard?.overview?.difficulty || "Difficulty Score"}</p>
                            <p className="text-3xl font-bold">{data?.scores?.difficulty || 50}</p>
                        </div>
                        <div className="w-16 h-16">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <PieChart>
                                    <Pie
                                        data={[{ v: data?.scores?.difficulty || 50 }, { v: 100 - (data?.scores?.difficulty || 50) }]}
                                        innerRadius={18} outerRadius={28} dataKey="v" startAngle={90} endAngle={-270}
                                    >
                                        <Cell fill={(data?.scores?.difficulty || 50) > 70 ? '#ef4444' : (data?.scores?.difficulty || 50) > 40 ? '#f59e0b' : '#22c55e'} />
                                        <Cell fill="#27272a" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <p className="text-xs text-zinc-400 bg-zinc-800/50 p-2 rounded">{data?.sectionInsights?.difficulty}</p>
                </div>

                {/* Opportunity */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-zinc-500 text-xs uppercase font-bold">{dict?.dashboard?.overview?.opportunity || "Opportunity Score"}</p>
                            <p className="text-3xl font-bold">{data?.scores?.opportunity || 50}</p>
                        </div>
                        <div className="w-16 h-16">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <PieChart>
                                    <Pie
                                        data={[{ v: data?.scores?.opportunity || 50 }, { v: 100 - (data?.scores?.opportunity || 50) }]}
                                        innerRadius={18} outerRadius={28} dataKey="v" startAngle={90} endAngle={-270}
                                    >
                                        <Cell fill="#8b5cf6" />
                                        <Cell fill="#27272a" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <p className="text-xs text-zinc-400 bg-zinc-800/50 p-2 rounded">{data?.sectionInsights?.opportunity}</p>
                </div>

                {/* Intent */}
                <div className="glass-card p-5">
                    <p className="text-zinc-500 text-xs uppercase font-bold mb-2">{dict?.dashboard?.overview?.intent || "Search Intent"}</p>
                    <p className="text-2xl font-bold mb-1">{data?.intent?.type || 'Unknown'}</p>
                    <span className={`text-xs px-2 py-1 rounded ${data?.intent?.grade === 'A' ? 'bg-green-500/20 text-green-400' : data?.intent?.grade === 'B' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                        {dict?.dashboard?.overview?.grade || "Grade"}: {data?.intent?.grade || 'C'}
                    </span>
                    <p className="text-xs text-zinc-400 mt-3">{data?.intent?.description}</p>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Competitors */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-bold text-zinc-400 uppercase mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" /> {dict?.dashboard?.competitors?.title || "Top Competitors"}
                        </h3>
                        <p className="text-sm text-zinc-500 mb-4 bg-purple-900/20 p-2 rounded border-l-2 border-purple-500">{data?.sectionInsights?.competitors}</p>

                        <div className="h-48 mb-6">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart data={data?.competitors || []}>
                                    <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#18181b', border: 'none', borderRadius: '8px' }}
                                        formatter={(value) => [value, 'Score']}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">{dict?.dashboard?.competitors?.leaders || "SERP Leaders (Top 5)"}</h4>
                            <div className="space-y-2">
                                {data?.organicResults?.slice(0, 5).map((result, i) => (
                                    <a key={i} href={result.link} target="_blank" rel="noreferrer" className="block bg-zinc-800/50 p-3 rounded-lg hover:bg-zinc-800 transition flex items-center gap-3 group">
                                        <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-xs font-bold text-zinc-500 group-hover:bg-indigo-500 group-hover:text-white transition">{result.position}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate group-hover:text-indigo-300 transition">{result.title}</p>
                                            <p className="text-xs text-zinc-500 truncate">{result.displayed_link}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data?.relatedSearches?.map((item, i) => (
                            <span key={i} className="px-3 py-1 bg-white/5 text-zinc-400 rounded-full text-sm hover:bg-white/10 transition cursor-default">
                                {item.query}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* This column is now empty as Trend and Questions moved */}
                </div>
            </div>

            {/* Trends & Forums */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Google Trends */}
                <div className="glass-card p-6">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase mb-1 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> {dict?.dashboard?.trend_analysis?.title || "Trend Analysis"}
                    </h3>
                    <p className="text-xs text-zinc-500 mb-6">{dict?.dashboard?.trend_analysis?.subtitle || "12-month Google Trends"}</p>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#18181b', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ stroke: '#52525b', strokeDasharray: '4 4' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Forum Insights */}
                <div className="glass-card p-6">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase mb-1 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" /> {dict?.dashboard?.forum_insights?.title || "Forum Insights"}
                    </h3>
                    <p className="text-xs text-zinc-500 mb-6">{dict?.dashboard?.forum_insights?.subtitle || "Reddit & Quora analysis"}</p>
                    {data?.discussionInsights?.summary ? (
                        <div className="space-y-4">
                            <p className="text-sm text-zinc-300">{data.discussionInsights.summary}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-zinc-500 uppercase">{dict?.dashboard?.discussion_insights?.sentiment || "Sentiment"}:</span>
                                <span className={`text-xs px-2 py-1 rounded font-bold ${data.discussionInsights.sentiment === 'Positive' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {data.discussionInsights.sentiment}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-zinc-500">No discussion insights available.</div>
                    )}
                </div>
            </div>

            {/* Strategy & Content Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-400" /> {dict?.dashboard?.strategy?.title || "Action Strategy"}
                    </h3>
                    <p className="text-sm text-zinc-500 mb-4 bg-emerald-900/20 p-3 rounded border-l-2 border-emerald-500">{data?.sectionInsights?.results}</p>
                    <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line bg-zinc-900/50 p-4 rounded-lg">
                        {data?.strategy}
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-rose-400" /> {dict?.dashboard?.essential_content_elements?.title || "Essential Content Elements"}
                    </h3>
                    <div className="space-y-3">
                        {data?.contentRequirements?.map((req, i) => (
                            <div key={i} className="flex items-start gap-3 bg-zinc-900/50 p-3 rounded-lg border border-white/5">
                                <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 text-xs font-bold shrink-0">
                                    {i + 1}
                                </div>
                                <p className="text-sm text-zinc-300">{req}</p>
                            </div>
                        )) || <p className="text-sm text-zinc-500">No specific content requirements identified.</p>}
                    </div>
                </div>
            </div>

            {/* Content Ideas */}
            <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-yellow-400" /> {dict?.dashboard?.content_ideas?.title || "Content Ideas"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {data?.contentIdeas?.map((idea, i) => (
                        <div key={i} className="glass-card p-5 hover:bg-white/5 transition group">
                            <span className={`text-xs px-2 py-1 rounded mb-3 inline-block ${idea.impact === 'High' ? 'bg-green-500/20 text-green-400' : idea.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-zinc-700 text-zinc-400'}`}>
                                {idea.impact} Impact
                            </span>
                            <h4 className="font-bold text-white mb-2 group-hover:text-indigo-300 transition">{idea.title}</h4>
                            <p className="text-sm text-zinc-400 line-clamp-3">{idea.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderOrganic = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" /> Organic Search Results
            </h3>
            <div className="grid gap-4">
                {data?.organicResults && data.organicResults.length > 0 ? (
                    data.organicResults.map((result, i) => (
                        <div key={i} className="glass-card p-5 hover:bg-white/5 transition">
                            <div className="flex items-start gap-4">
                                <div className="text-zinc-500 font-mono text-sm">#{result.position}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {result.favicon && <img src={result.favicon} alt="" className="w-4 h-4 rounded-full" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />}
                                        <span className="text-sm text-zinc-400 truncate max-w-[200px]">{result.displayed_link}</span>
                                    </div>
                                    <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-blue-400 hover:underline block mb-2">
                                        {result.title}
                                    </a>
                                    <p className="text-sm text-zinc-300 leading-relaxed">{result.snippet}</p>
                                    {result.rich_snippet && (
                                        <div className="mt-3 text-sm bg-white/5 p-2 rounded text-zinc-400 border-l-2 border-indigo-500">
                                            {result.rich_snippet?.top?.extensions?.join(' • ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 text-zinc-500">No organic results found in the data bundle.</div>
                )}
            </div>
        </div>
    );

    const renderDiscussions = () => (
        <div className="space-y-6">
            {data?.discussionInsights && (
                <div className="glass-card p-6 border-l-4 border-orange-500 bg-gradient-to-r from-orange-900/10 to-transparent">
                    <h3 className="text-lg font-bold text-orange-300 mb-3 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" /> Discussion Insights
                    </h3>
                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line mb-3">
                        {data.discussionInsights.summary}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase text-zinc-500">Sentiment:</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${data.discussionInsights.sentiment === 'Positive' ? 'bg-green-500/20 text-green-400' :
                            data.discussionInsights.sentiment === 'Negative' ? 'bg-red-500/20 text-red-400' :
                                'bg-zinc-700 text-zinc-300'
                            }`}>
                            {data.discussionInsights.sentiment}
                        </span>
                    </div>
                </div>
            )}

            <h3 className="text-xl font-bold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-orange-400" /> Discussions & Forums
            </h3>
            <div className="grid gap-4">
                {data?.discussions && data.discussions.length > 0 ? (
                    data.discussions.map((item, i) => (
                        <div key={i} className="glass-card p-5 hover:bg-white/5 transition">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300">
                                            {item.source || 'Forum'}
                                        </span>
                                        <span className="text-xs text-zinc-500">{item.date}</span>
                                    </div>
                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-white hover:text-orange-400 transition block mb-1">
                                        {item.title}
                                    </a>
                                    <p className="text-sm text-zinc-400">{item.snippet}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-zinc-600" />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 text-zinc-500">No discussion data available for this query.</div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans overflow-hidden">
            <Sidebar
                history={historyList}
                onSelectHistory={fetchSearchById}
                onNewAnalysis={handleNewAnalysis}
                activeSearchId={currentSearchId}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                user={user}
                dict={dict}
            /><main className="flex-1 ml-0 md:ml-64 h-screen overflow-y-auto">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center gap-3 p-4 border-b border-white/5 bg-zinc-950/80 backdrop-blur sticky top-0 z-30">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-zinc-400 hover:text-white">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">SEOPataka</span>
                </div>

                <div className="p-4 md:p-10 pb-20">
                    {loading ? (
                        renderLoading()
                    ) : (
                        <>
                            <div className="flex justify-end mb-4">
                                <LanguageSwitcher />
                            </div>
                            {!data && (
                                <div className="space-y-8 md:space-y-12 pb-10">
                                    <div className="text-center space-y-4 pt-4 md:pt-8 px-2">
                                        <div className="relative inline-block">
                                            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-20 blur-3xl rounded-full"></div>
                                            <h1 className="relative text-3xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 tracking-tight">
                                                SEOAlter
                                            </h1>
                                        </div>
                                        <p className="text-xs text-zinc-600">
                                            {dict?.dashboard?.footer?.developed_by || "Developed by team"} <a href="https://codemypixel.com" target="_blank" rel="noopener noreferrer" className="text-emerald-500 font-semibold hover:underline">Codemypixel.com</a>
                                        </p>
                                    </div>

                                    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto relative group z-10 px-2 sm:px-4">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl opacity-30 blur-lg group-focus-within:opacity-50 transition duration-500"></div>
                                        <div className="relative bg-zinc-900/95 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-emerald-500/20 shadow-2xl backdrop-blur-xl">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="flex-1 relative">
                                                    <Search className="w-5 h-5 text-emerald-500/50 absolute left-3 top-1/2 -translate-y-1/2" />
                                                    <input
                                                        type="text"
                                                        value={query}
                                                        onChange={(e) => setQuery(e.target.value)}
                                                        placeholder={dict.dashboard.placeholder || "Enter a keyword..."}
                                                        className="w-full bg-zinc-800/50 border border-emerald-500/20 focus:border-emerald-500/50 rounded-lg text-base sm:text-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none transition"
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 sm:px-6 py-3 rounded-lg font-bold hover:from-emerald-600 hover:to-teal-700 transition flex items-center gap-2 hover:scale-105 active:scale-95 duration-200 shadow-lg shadow-emerald-500/25"
                                                >
                                                    <Sparkles className="w-5 h-5" />
                                                    <span className="hidden sm:inline">Analyze</span>
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <div className="relative flex-1 min-w-[140px]">
                                                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Region</label>
                                                    <select
                                                        value={region}
                                                        onChange={(e) => setRegion(e.target.value)}
                                                        className="w-full bg-zinc-800/50 text-sm text-zinc-300 py-2.5 pl-3 pr-8 rounded-lg border border-white/10 appearance-none focus:outline-none focus:border-emerald-500/50 cursor-pointer hover:bg-zinc-800 transition"
                                                    >
                                                        {regions.map(r => (
                                                            <option key={r.code} value={r.code} className="bg-zinc-900">{r.flag} {r.name}</option>
                                                        ))}
                                                    </select>
                                                    <Globe className="w-3.5 h-3.5 text-zinc-500 absolute right-3 bottom-3 pointer-events-none" />
                                                </div>

                                                <div className="relative flex-1 min-w-[140px]">
                                                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Language</label>
                                                    <select
                                                        value={language}
                                                        onChange={(e) => setLanguage(e.target.value)}
                                                        className="w-full bg-zinc-800/50 text-sm text-zinc-300 py-2.5 pl-3 pr-8 rounded-lg border border-white/10 appearance-none focus:outline-none focus:border-emerald-500/50 cursor-pointer hover:bg-zinc-800 transition"
                                                    >
                                                        {languages.map(l => (
                                                            <option key={l.code} value={l.code} className="bg-zinc-900">{l.native}</option>
                                                        ))}
                                                    </select>
                                                    <FileText className="w-3.5 h-3.5 text-zinc-500 absolute right-3 bottom-3 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </form>



                                    {/* How it works */}
                                    <HowItWorks dict={dict} />
                                </div>
                            )}

                            {data && (
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 gap-4">
                                        <div>
                                            <p className="text-zinc-500 text-sm">{dict?.dashboard?.analysis_for || 'Analysis for'}</p>
                                            <h2 className="text-3xl font-bold">{query}</h2>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                                            <div className="flex bg-zinc-900 rounded-lg p-1 border border-white/5 w-full sm:w-auto overflow-x-auto no-scrollbar">
                                                {['overview', 'organic', 'discussions'].map((tab) => (
                                                    <button
                                                        key={tab}
                                                        onClick={() => setDashboardTab(tab)}
                                                        className={`px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap flex-1 sm:flex-none ${dashboardTab === tab
                                                            ? 'bg-zinc-800 text-white shadow-sm'
                                                            : 'text-zinc-400 hover:text-white'
                                                            }`}
                                                    >
                                                        {dict?.dashboard?.tabs?.[tab] || tab.charAt(0).toUpperCase() + tab.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                            <button onClick={() => { setData(null); setQuery(''); }} className="w-full sm:w-auto px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm flex items-center justify-center gap-2 whitespace-nowrap">
                                                <Search className="w-4 h-4" /> {dict?.dashboard?.new_analysis || 'New'}
                                            </button>
                                        </div>
                                    </div>

                                    {dashboardTab === 'overview' && renderOverview()}
                                    {dashboardTab === 'organic' && renderOrganic()}
                                    {dashboardTab === 'discussions' && renderDiscussions()}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {data && <ChatAssistant contextData={data} contextId={currentSearchId} lang={language} dict={dict} />}
        </div>
    );
};

export default Dashboard;
