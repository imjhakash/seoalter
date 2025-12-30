'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Globe, Loader2, AlertCircle, Settings, ChevronDown, ChevronUp, Layers, List, Lock, CheckCircle2, TrendingUp, BarChart2, Rocket } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface KeywordResult {
    keyword: string;
    search_volume: number;
    cpc: number;
    competition: number;
    difficulty?: number; // SEO Difficulty 0-100
    low_bid?: number;
    high_bid?: number;
    trends: { month: number; year: number; count: number }[];
    intent?: string;
}

export default function KeywordResearchPage() {
    const [mode, setMode] = useState<'related' | 'volume'>('related');
    const [accessStatus, setAccessStatus] = useState<'loading' | 'none' | 'superadmin'>('loading');

    // Inputs
    const [keyword, setKeyword] = useState('');
    const [bulkKeywords, setBulkKeywords] = useState('');
    const [location, setLocation] = useState(2840);
    const [language, setLanguage] = useState('en');

    const [results, setResults] = useState<KeywordResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Advanced Params
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [depth, setDepth] = useState(2);
    const [limit, setLimit] = useState(50);
    const [includeSeed, setIncludeSeed] = useState(true);
    const [ignoreSynonyms, setIgnoreSynonyms] = useState(false);
    const [exactMatch, setExactMatch] = useState(false);

    useEffect(() => {
        checkAccess();
    }, []);

    const checkAccess = async () => {
        try {
            const res = await axios.get('/api/auth/me');
            if (res.data.email) {
                setAccessStatus('superadmin'); // Treat all authenticated as superadmin for UI access for now
            } else {
                setAccessStatus('none');
            }
        } catch (error) {
            setAccessStatus('none');
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
                payload.replace_with_core_keyword = exactMatch;
            } else {
                const kws = bulkKeywords.split(/[\n,]+/).map(k => k.trim()).filter(k => k);
                payload.keywords = kws;
            }

            const res = await axios.post('/api/tools/keyword-research', payload);

            if (res.data.error) {
                setError(res.data.error);
            } else {
                setResults(res.data.items || []);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch keyword data.');
        } finally {
            setLoading(false);
        }
    };

    if (accessStatus === 'loading') {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-emerald-500 w-8 h-8" /></div>;
    }

    if (accessStatus === 'none') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-lg mx-auto relative overflow-hidden">
                {/* Visual Background Element */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-purple-500/5 blur-3xl pointer-events-none" />

                <div className="w-24 h-24 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl origin-center rotate-6">
                    <Rocket className="w-10 h-10 text-emerald-500" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 mb-4">Feature Coming Soon</h2>
                    <p className="text-zinc-400 text-lg leading-relaxed">
                        We are putting the finishing touches on our advanced <strong>Keyword Intelligence Engine</strong>.
                        Get ready for deeper insights, accurate SEO difficulty scores, and competitive analysis.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-sm text-zinc-500">
                    <Settings className="w-4 h-4 animate-spin-slow" />
                    <span>In Active Development</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Keyword Intelligence <span className="text-emerald-500 text-sm align-top px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">BETA</span></h1>
                    <p className="text-zinc-400">
                        Advanced SEO Metrics & Search Volume Analysis
                    </p>
                </div>
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
                                    placeholder="Enter keywords (one per line)&#10;seo tools&#10;backlink checker"
                                    rows={5}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder-zinc-600 resize-none font-mono text-sm"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                <select value={location} onChange={(e) => setLocation(Number(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer">
                                    <option value={2840} className="bg-zinc-900">United States</option>
                                    <option value={2826} className="bg-zinc-900">United Kingdom</option>
                                    <option value={2036} className="bg-zinc-900">Australia</option>
                                    <option value={2124} className="bg-zinc-900">Canada</option>
                                    <option value={2356} className="bg-zinc-900">India</option>
                                </select>
                            </div>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer">
                                    <option value="en" className="bg-zinc-900">English</option>
                                    <option value="es" className="bg-zinc-900">Spanish</option>
                                    <option value="fr" className="bg-zinc-900">French</option>
                                    <option value="de" className="bg-zinc-900">German</option>
                                </select>
                            </div>
                        </div>

                        {mode === 'related' && (
                            <div className="border border-white/5 rounded-xl bg-zinc-900/20">
                                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex items-center justify-between p-4 text-zinc-400 hover:text-white transition-colors">
                                    <div className="flex items-center gap-2"><Settings className="w-4 h-4" /><span className="text-sm font-medium">Advanced Parameters</span></div>
                                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                {showAdvanced && (
                                    <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs mb-1"><span className="text-zinc-400">Search Depth (1-4)</span><span className="text-emerald-400 font-bold">{depth}</span></div>
                                            <input type="range" min="1" max="4" step="1" value={depth} onChange={(e) => setDepth(Number(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs mb-1"><span className="text-zinc-400">Result Limit (10-100)</span><span className="text-emerald-400 font-bold">{limit}</span></div>
                                            <input type="range" min="10" max="100" step="10" value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                                        </div>
                                        <div className="flex items-center gap-2"><input type="checkbox" checked={includeSeed} onChange={(e) => setIncludeSeed(e.target.checked)} className="accent-emerald-500 w-4 h-4" /><span className="text-sm text-zinc-300">Include Seed</span></div>
                                    </div>
                                )}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold h-12 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze Keywords'}
                        </button>
                    </form>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 animate-in fade-in">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {results.length > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl">
                            <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">AVG Volume</p>
                            <p className="text-xl font-bold text-white">{Math.round(results.reduce((acc, curr) => acc + (curr.search_volume || 0), 0) / results.length).toLocaleString()}</p>
                        </div>
                        <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl">
                            <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">AVG Difficulty</p>
                            <p className={`text-xl font-bold ${(results.reduce((acc, curr) => acc + (curr.difficulty || 0), 0) / results.length) > 70 ? 'text-red-400' :
                                (results.reduce((acc, curr) => acc + (curr.difficulty || 0), 0) / results.length) > 30 ? 'text-yellow-400' : 'text-emerald-400'
                                }`}>
                                {Math.round(results.reduce((acc, curr) => acc + (curr.difficulty || 0), 0) / results.length)}
                            </p>
                        </div>
                        <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl">
                            <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">AVG CPC</p>
                            <p className="text-xl font-bold text-blue-400">${(results.reduce((acc, curr) => acc + (curr.cpc || 0), 0) / results.length).toFixed(2)}</p>
                        </div>
                        <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl">
                            <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">Keywords</p>
                            <p className="text-xl font-bold text-white">{results.length}</p>
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 bg-zinc-900/50">
                                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Keyword</th>
                                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-32">Trend</th>
                                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">KD %</th>
                                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Volume</th>
                                        <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">CPC (Min-Max)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {results.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4 font-medium text-white group-hover:text-emerald-400 transition-colors">{item.keyword}</td>
                                            <td className="p-4 w-32">
                                                {item.trends && item.trends.length > 0 ? (
                                                    <div className="h-8 w-24">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={item.trends}>
                                                                <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={1} fillOpacity={0.1} fill="#10b981" />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                ) : <span className="text-xs text-zinc-700">-</span>}
                                            </td>
                                            <td className="p-4 text-right">
                                                {item.difficulty !== undefined ? (
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.difficulty > 70 ? 'bg-red-500/10 text-red-500' :
                                                        item.difficulty > 30 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-emerald-500/10 text-emerald-500'
                                                        }`}>
                                                        {item.difficulty}
                                                    </span>
                                                ) : <span className="text-zinc-600">-</span>}
                                            </td>
                                            <td className="p-4 text-right text-zinc-300">{item.search_volume?.toLocaleString()}</td>
                                            <td className="p-4 text-right text-zinc-400 text-xs">
                                                ${item.low_bid?.toFixed(2) || '0'} - ${item.high_bid?.toFixed(2) || '0'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {results.length === 0 && !loading && !error && (
                <div className="py-20 flex flex-col items-center text-center space-y-4 bg-zinc-900/20 border border-dashed border-white/5 rounded-3xl">
                    <Rocket className="w-12 h-12 text-zinc-800" />
                    <div className="max-w-xs">
                        <p className="text-zinc-500 font-medium">Ready to discover keywords?</p>
                        <p className="text-zinc-600 text-sm mt-1">Enter a seed keyword or bulk list above to generate deep SEO intelligence.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
