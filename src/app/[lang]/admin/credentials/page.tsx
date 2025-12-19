"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Key, Lock, Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function AdminCredentialsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [keys, setKeys] = useState({ openaiKey: '', serpKey: '' });
    const [showOpenAI, setShowOpenAI] = useState(false);
    const [showSerp, setShowSerp] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchCredentials();
    }, []);

    const fetchCredentials = async () => {
        try {
            const res = await axios.get('/api/admin/credentials');
            setKeys({
                openaiKey: res.data.openaiKey || '',
                serpKey: res.data.serpKey || ''
            });
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch credentials', error);
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            await axios.post('/api/admin/credentials', {
                openaiKey: keys.openaiKey,
                serpKey: keys.serpKey
            });
            setMessage({ text: 'Credentials updated successfully!', type: 'success' });
            // Refresh to get masked versions if backend returns them, though here we just keep what user typed or masked
            // Re-fetching might be good to verify persistence but might overwrite user input with masked version immediately.
            // Let's just leave it as is for user feedback.
        } catch (error) {
            setMessage({ text: 'Failed to update credentials. Please try again.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0a0c] text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white font-sans p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <Link href="/en/admin" className="inline-flex items-center text-zinc-500 hover:text-emerald-400 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>

                <header className="mb-12">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300 flex items-center gap-3">
                        <Lock className="w-8 h-8 text-emerald-400" />
                        API Credentials
                    </h1>
                    <p className="text-zinc-400 mt-2">Manage integration keys for OpenAI and SerpAPI. These keys will override environment variables.</p>
                </header>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <form onSubmit={handleSave} className="space-y-8">
                        {/* OpenAI Key */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                <Key className="w-4 h-4 text-emerald-500" />
                                OpenAI API Key
                            </label>
                            <div className="relative">
                                <input
                                    type={showOpenAI ? "text" : "password"}
                                    value={keys.openaiKey}
                                    onChange={(e) => setKeys({ ...keys, openaiKey: e.target.value })}
                                    placeholder="sk-..."
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-emerald-500/50 transition-colors text-white placeholder-zinc-700"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOpenAI(!showOpenAI)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                >
                                    {showOpenAI ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-zinc-500">Used for generating analysis and chat responses.</p>
                        </div>

                        {/* SerpAPI Key */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                <Key className="w-4 h-4 text-blue-500" />
                                SerpAPI Key
                            </label>
                            <div className="relative">
                                <input
                                    type={showSerp ? "text" : "password"}
                                    value={keys.serpKey}
                                    onChange={(e) => setKeys({ ...keys, serpKey: e.target.value })}
                                    placeholder="Enter SerpAPI key..."
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-emerald-500/50 transition-colors text-white placeholder-zinc-700"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSerp(!showSerp)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                >
                                    {showSerp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-zinc-500">Used for fetching search results and ranking data.</p>
                        </div>

                        {message.text && (
                            <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="pt-4 border-t border-white/10 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold py-3 px-8 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {saving ? 'Saving...' : 'Save Credentials'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
