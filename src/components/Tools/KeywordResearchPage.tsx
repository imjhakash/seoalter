'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Search, MapPin, Globe, Loader2, DollarSign, BarChart2, TrendingUp, AlertCircle, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface KeywordResult {
    keyword: string;
    search_volume: number;
    cpc: number;
    competition: number;
    trends?: number[]; // Optional trend data if available
}

export default function KeywordResearchPage() {
    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState(2840); // US Default
    const [language, setLanguage] = useState('en');
    const [results, setResults] = useState<KeywordResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword) return;

        setLoading(true);
        setError('');
        setResults([]);

        try {
            const res = await axios.post('/api/tools/keyword-research', {
                keyword,
                location_code: location,
                language_code: language
            });

            if (res.data.error) {
                setError(res.data.error);
            } else {
                setResults(res.data.items || []);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Keyword Intelligence</h1>
                <p className="text-zinc-400">Discover high-value keywords with real-time data from Google.</p>
            </div>

            {/* Search Bar */}
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-5 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Enter a seed keyword (e.g. 'vegan recipes')"
                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder-zinc-600"
                        />
                    </div>

                    <div className="md:col-span-3 relative">
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

                    <div className="md:col-span-2 relative">
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

                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={loading || !keyword}
                            className="w-full h-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
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
                                {Math.round(results.reduce((acc, curr) => acc + curr.search_volume, 0) / results.length).toLocaleString()}
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
