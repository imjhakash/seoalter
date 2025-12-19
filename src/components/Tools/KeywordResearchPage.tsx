'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Globe, Loader2, AlertCircle, Settings, ChevronDown, ChevronUp, Layers, List, Lock, CheckCircle2, TrendingUp, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface KeywordResult {
    keyword: string;
    search_volume: number;
    cpc: number;
    competition: number;
    trends: { month: number; year: number; count: number }[];
}

export default function KeywordResearchPage() {
    // Mode: 'related' or 'volume'
    const [mode, setMode] = useState<'related' | 'volume'>('related');

    // Auth & Access State
    const [accessStatus, setAccessStatus] = useState<'loading' | 'none' | 'requested' | 'approved' | 'superadmin'>('loading');

    // Common State
    const [keyword, setKeyword] = useState(''); // For Related
    const [bulkKeywords, setBulkKeywords] = useState(''); // For Volume
    const [location, setLocation] = useState(2840); // US Default
    const [language, setLanguage] = useState('en');
    const [results, setResults] = useState<KeywordResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Advanced State for Related
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [depth, setDepth] = useState(2);
    const [limit, setLimit] = useState(50);
    const [includeSeed, setIncludeSeed] = useState(true);
    const [ignoreSynonyms, setIgnoreSynonyms] = useState(false);
    const [includeSerp, setIncludeSerp] = useState(false);
    const [includeClickstream, setIncludeClickstream] = useState(false);
    const [exactMatch, setExactMatch] = useState(false);

    useEffect(() => {
        checkAccess();
    }, []);

    const checkAccess = async () => {
        try {
            const res = await axios.get('/api/auth/me'); // Assuming endpoint returns user info
            const user = res.data;
            if (user.email === 'helloatjh@gmail.com') {
                setAccessStatus('superadmin');
            } else {
                setAccessStatus(user.keywordResearchAccess || 'none');
            }
        } catch (error) {
            setAccessStatus('none');
        }
    };

    const handleRequestAccess = async () => {
        try {
            setLoading(true);
            await axios.post('/api/user/request-access');
            setAccessStatus('requested');
            setLoading(false);
        } catch (error) {
            setLoading(false);
            alert('Failed to request access.');
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'related' && !keyword) return;
        if (mode === 'volume' && !bulkKeywords) return;

        setLoading(true);
        setError('');
        setResults([]);

        try {
            const payload: any = {
                mode,
                location_code: location,
                language_code: language
            };

            if (mode === 'related') {
                payload.keyword = keyword;
                payload.depth = depth;
                payload.limit = limit;
                payload.include_seed_keyword = includeSeed;
                payload.ignore_synonyms = ignoreSynonyms;
                payload.include_serp_info = includeSerp;
                payload.include_clickstream_data = includeClickstream;
                payload.replace_with_core_keyword = exactMatch; // Mapping exact match concept slightly loosely here, or add param to API
            } else {
                const kws = bulkKeywords.split(/[\n,]+/).map(k => k.trim()).filter(k => k);
                payload.keywords = kws;
            }

            const res = await axios.post('/api/tools/keyword-research', payload);

            if (res.data.error) {
                if (res.data.accessStatus) {
                    setAccessStatus(res.data.accessStatus);
                } else {
                    setError(res.data.error);
                }
            } else {
                setResults(res.data.items || []);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch keyword data.');
            if (err.response?.status === 403) {
                checkAccess(); // Refresh status
            }
        } finally {
            setLoading(false);
        }
    };

    const locations = [
        { code: 2840, name: 'United States' },
        { code: 2826, name: 'United Kingdom' },
        { code: 2124, name: 'Canada' },
        { code: 2036, name: 'Australia' },
        { code: 2276, name: 'Germany' },
        { code: 2250, name: 'France' },
        { code: 2356, name: 'India' },
    ];

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
    ];

    if (accessStatus === 'loading') {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-emerald-500 w-8 h-8" /></div>;
    }

    if (accessStatus === 'none' || accessStatus === 'rejected') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-lg mx-auto">
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10">
                    <Lock className="w-10 h-10 text-zinc-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Restricted Access</h2>
                    <p className="text-zinc-400">The Keyword Intelligence tool requires specific authorization to use. Request access to unlock this premium feature.</p>
                </div>
                <button
                    onClick={handleRequestAccess}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
                >
                    {loading ? 'Requesting...' : 'Request Access'}
                </button>
            </div>
        );
    }

    if (accessStatus === 'requested') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-lg mx-auto">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Request Pending</h2>
                    <p className="text-zinc-400">Your access request has been sent to the administrator. You will be notified once approved.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Keyword Intelligence</h1>
                <p className="text-zinc-400">
                    {mode === 'related'
                        ? 'Deep dive into keyword opportunities with advanced AI analysis.'
                        : 'Accurate search volume data for your keyword lists.'}
                </p>
            </div>

            {/* Main Control Panel */}
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

                {/* Mode Tabs */}
                <div className="flex border-b border-white/5">
                    <button
                        onClick={() => { setMode('related'); setResults([]); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors
                            ${mode === 'related' ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Layers className="w-4 h-4" />
                        Related Keywords
                    </button>
                    <button
                        onClick={() => { setMode('volume'); setResults([]); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors
                            ${mode === 'volume' ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <List className="w-4 h-4" />
                        Bulk Search Volume
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSearch} className="space-y-6">

                        {/* Keyword Input Area */}
                        {mode === 'related' ? (
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="Enter a seed keyword (e.g. 'vegan recipes')"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder-zinc-600"
                                />
                            </div>
                        ) : (
                            <div>
                                <textarea
                                    value={bulkKeywords}
                                    onChange={(e) => setBulkKeywords(e.target.value)}
                                    placeholder="Enter keywords (one per line)&#10;digital marketing&#10;seo tools&#10;content strategy"
                                    rows={5}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder-zinc-600 resize-none font-mono text-sm"
                                />
                                <p className="text-right text-xs text-zinc-500 mt-2">Enter up to 100 keywords</p>
                            </div>
                        )}

                        {/* Common Filters: Location & Language */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(Number(e.target.value))}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none cursor-pointer"
                                >
                                    {locations.map(loc => (
                                        <option key={loc.code} value={loc.code} className='bg-zinc-900'>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none cursor-pointer"
                                >
                                    {languages.map(lang => (
                                        <option key={lang.code} value={lang.code} className="bg-zinc-900">{lang.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Advanced Settings (Related Mode Only) */}
                        {mode === 'related' && (
                            <div className="border border-white/5 rounded-xl bg-zinc-900/20">
                                <button
                                    type="button"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="w-full flex items-center justify-between p-4 text-zinc-400 hover:text-white transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Settings className="w-4 h-4" />
                                        <span className="text-sm font-medium">Advanced Parameters</span>
                                    </div>
                                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>

                                {showAdvanced && (
                                    <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2">

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-zinc-400">Search Depth (1-4)</span>
                                                <span className="text-emerald-400 font-bold">{depth}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="4"
                                                step="1"
                                                value={depth}
                                                onChange={(e) => setDepth(Number(e.target.value))}
                                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-zinc-400">Result Limit (10-100)</span>
                                                <span className="text-emerald-400 font-bold">{limit}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="10"
                                                max="100"
                                                step="10"
                                                value={limit}
                                                onChange={(e) => setLimit(Number(e.target.value))}
                                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={includeSeed} onChange={(e) => setIncludeSeed(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                                                <span className="text-sm text-zinc-300">Include Seed Keyword</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={ignoreSynonyms} onChange={(e) => setIgnoreSynonyms(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                                                <span className="text-sm text-zinc-300">Ignore Synonyms</span>
                                            </label>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={includeSerp} onChange={(e) => setIncludeSerp(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                                                <span className="text-sm text-zinc-300">Include SERP Info</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={includeClickstream} onChange={(e) => setIncludeClickstream(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                                                <span className="text-sm text-zinc-300">Include Clickstream Data</span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold h-12 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze Keywords'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-zinc-900/30 border border-white/5 p-5 rounded-2xl">
                            <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">Total Keywords</p>
                            <p className="text-3xl font-bold text-white">{results.length}</p>
                        </div>
                        <div className="bg-zinc-900/30 border border-white/5 p-5 rounded-2xl">
                            <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">Avg Search Volume</p>
                            <p className="text-3xl font-bold text-emerald-400">
                                {Math.round(results.reduce((acc, curr) => acc + (curr.search_volume || 0), 0) / results.length).toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-zinc-900/30 border border-white/5 p-5 rounded-2xl">
                            <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">Avg CPC</p>
                            <p className="text-3xl font-bold text-blue-400">
                                ${(results.reduce((acc, curr) => acc + (curr.cpc || 0), 0) / results.length).toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 bg-zinc-900/50">
                                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Keyword</th>
                                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-32">Trend</th>
                                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Volume</th>
                                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">CPC</th>
                                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Competition</th>
                                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Difficulty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {results.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4 font-medium text-white group-hover:text-emerald-400 transition-colors">{item.keyword}</td>
                                            <td className="p-4 w-32">
                                                {item.trends && item.trends.length > 0 ? (
                                                    <div className="h-10 w-24">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={item.trends}>
                                                                <defs>
                                                                    <linearGradient id={`grad${idx}`} x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                                    </linearGradient>
                                                                </defs>
                                                                <Area
                                                                    type="monotone"
                                                                    dataKey="count"
                                                                    stroke="#10b981"
                                                                    strokeWidth={2}
                                                                    fill={`url(#grad${idx})`}
                                                                />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-zinc-600">No data</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right text-zinc-300">{item.search_volume?.toLocaleString() || '-'}</td>
                                            <td className="p-4 text-right text-zinc-300">${item.cpc?.toFixed(2) || '0.00'}</td>
                                            <td className="p-4 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <span className="text-zinc-300">{(item.competition * 100).toFixed(0)}</span>
                                                    <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${item.competition > 0.7 ? 'bg-red-500' : item.competition > 0.3 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${item.competition * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium 
                                                    ${item.competition > 0.8 ? 'bg-red-500/10 text-red-400'
                                                        : item.competition > 0.4 ? 'bg-yellow-500/10 text-yellow-400'
                                                            : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                    {item.competition > 0.8 ? 'Hard' : item.competition > 0.4 ? 'Medium' : 'Easy'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
