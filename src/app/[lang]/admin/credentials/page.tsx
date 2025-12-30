"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Save, Key, Eye, EyeOff, CheckCircle, XCircle, Settings } from 'lucide-react';
import Link from 'next/link';

import { useParams } from 'next/navigation';

export default function AdminCredentialsPage() {
    const params = useParams();
    const lang = (params?.lang as string) || 'en';
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState<{ [key: string]: boolean }>({});
    const [testResult, setTestResult] = useState<{ [key: string]: { success: boolean, message: string } }>({});
    const [modified, setModified] = useState<{ [key: string]: boolean }>({});
    const [keys, setKeys] = useState({
        openaiKey: '',
        serpKey: '',
        dataForSeoLogin: '',
        dataForSeoPassword: ''
    });
    const [showOpenAI, setShowOpenAI] = useState(false);
    const [showSerp, setShowSerp] = useState(false);
    const [showDfs, setShowDfs] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        console.log('[CredentialsPage] Mounted, lang:', lang);
        fetchCredentials();
    }, [lang]);

    const fetchCredentials = async () => {
        try {
            console.log('[CredentialsPage] Fetching credentials via /api/admin/credentials...');
            const res = await axios.get('/api/admin/credentials', { timeout: 10000 });
            console.log('[CredentialsPage] Fetch successful:', res.data ? 'data received' : 'no data');
            setKeys({
                openaiKey: res.data.openaiKey || '',
                serpKey: res.data.serpKey || '',
                dataForSeoLogin: res.data.dataForSeoLogin || '',
                dataForSeoPassword: res.data.dataForSeoPassword || ''
            });
            setModified({});
        } catch (error: any) {
            console.error('[CredentialsPage] Fetch Error:', error.message, error.response?.status);
            if (error.response && error.response.status === 401) {
                console.warn('[CredentialsPage] 401 Unauthorized - Redirecting...');
                window.location.href = `/${lang}/login?redirect=${encodeURIComponent(window.location.pathname)}`;
            }
        } finally {
            console.log('[CredentialsPage] Setting loading to false');
            setLoading(false);
        }
    };

    const handleTest = async (type: string) => {
        setTesting({ ...testing, [type]: true });
        setTestResult({ ...testResult, [type]: { success: false, message: '' } });
        try {
            const payload: any = { type };
            if (type === 'openai') {
                payload.value = keys.openaiKey;
                payload.isMasked = !modified.openaiKey && !!keys.openaiKey;
            }
            if (type === 'serp') {
                payload.value = keys.serpKey;
                payload.isMasked = !modified.serpKey && !!keys.serpKey;
            }
            if (type === 'dataforseo') {
                payload.value = keys.dataForSeoLogin;
                payload.value2 = keys.dataForSeoPassword;
                payload.isMasked = !modified.dataForSeoLogin && !!keys.dataForSeoLogin;
                payload.isMasked2 = !modified.dataForSeoPassword && !!keys.dataForSeoPassword;
            }

            const res = await axios.post('/api/admin/credentials/test', payload);
            setTestResult({ ...testResult, [type]: { success: true, message: res.data.message } });
        } catch (error: any) {
            const msg = error.response?.data?.error || error.message || 'Test failed';
            setTestResult({ ...testResult, [type]: { success: false, message: msg } });
        } finally {
            setTesting({ ...testing, [type]: false });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            const payload: any = {};
            if (modified.openaiKey) payload.openaiKey = keys.openaiKey;
            if (modified.serpKey) payload.serpKey = keys.serpKey;
            if (modified.dataForSeoLogin) payload.dataForSeoLogin = keys.dataForSeoLogin;
            if (modified.dataForSeoPassword) payload.dataForSeoPassword = keys.dataForSeoPassword;

            if (Object.keys(payload).length === 0) {
                setMessage({ text: 'No changes to save.', type: 'success' });
                setSaving(false);
                return;
            }

            await axios.post('/api/admin/credentials', payload);
            setMessage({ text: 'Credentials updated successfully!', type: 'success' });
            fetchCredentials(); // Re-fetch to mask
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
                <Link href={`/${lang}/admin`} className="inline-flex items-center text-zinc-500 hover:text-emerald-400 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>

                <header className="mb-12">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300 flex items-center gap-3">
                        <Settings className="w-8 h-8 text-emerald-400" />
                        System Settings
                    </h1>
                    <p className="text-zinc-400 mt-2">Centralized management for API integrations and global configurations.</p>
                </header>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <form onSubmit={handleSave} className="space-y-8">
                        {/* OpenAI Key */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                    <Key className="w-4 h-4 text-emerald-500" />
                                    OpenAI API Key
                                </label>
                                <button
                                    type="button"
                                    onClick={() => handleTest('openai')}
                                    disabled={testing['openai'] || !keys.openaiKey}
                                    className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 transition disabled:opacity-50"
                                >
                                    {testing['openai'] ? 'Testing...' : 'Test Connection'}
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showOpenAI ? "text" : "password"}
                                    value={keys.openaiKey}
                                    onChange={(e) => {
                                        setKeys({ ...keys, openaiKey: e.target.value });
                                        setModified({ ...modified, openaiKey: true });
                                    }}
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
                            {testResult['openai'] && (
                                <p className={`text-[10px] font-medium ${testResult['openai'].success ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {testResult['openai'].message}
                                </p>
                            )}
                            <p className="text-xs text-zinc-500">Powering AI analysis and conversational assistant features.</p>
                        </div>

                        {/* SerpAPI Key */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                    <Key className="w-4 h-4 text-blue-500" />
                                    SerpAPI Search Key
                                </label>
                                <button
                                    type="button"
                                    onClick={() => handleTest('serp')}
                                    disabled={testing['serp'] || !keys.serpKey}
                                    className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 transition disabled:opacity-50"
                                >
                                    {testing['serp'] ? 'Testing...' : 'Test Connection'}
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showSerp ? "text" : "password"}
                                    value={keys.serpKey}
                                    onChange={(e) => {
                                        setKeys({ ...keys, serpKey: e.target.value });
                                        setModified({ ...modified, serpKey: true });
                                    }}
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
                            {testResult['serp'] && (
                                <p className={`text-[10px] font-medium ${testResult['serp'].success ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {testResult['serp'].message}
                                </p>
                            )}
                            <p className="text-xs text-zinc-500">Provides live SERP data and Google Trends integration.</p>
                        </div>

                        {/* DataForSEO Credentials */}
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-emerald-400">DataForSEO Credentials</h3>
                                <button
                                    type="button"
                                    onClick={() => handleTest('dataforseo')}
                                    disabled={testing['dataforseo'] || !keys.dataForSeoLogin || !keys.dataForSeoPassword}
                                    className="text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20 transition disabled:opacity-50"
                                >
                                    {testing['dataforseo'] ? 'Testing...' : 'Test Connection'}
                                </button>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                    <Key className="w-4 h-4 text-purple-500" />
                                    API Login
                                </label>
                                <input
                                    type="text"
                                    value={keys.dataForSeoLogin}
                                    onChange={(e) => {
                                        setKeys({ ...keys, dataForSeoLogin: e.target.value });
                                        setModified({ ...modified, dataForSeoLogin: true });
                                    }}
                                    placeholder="DataForSEO Login Email"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors text-white placeholder-zinc-700"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                    <Key className="w-4 h-4 text-purple-500" />
                                    API Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showDfs ? "text" : "password"}
                                        value={keys.dataForSeoPassword}
                                        onChange={(e) => {
                                            setKeys({ ...keys, dataForSeoPassword: e.target.value });
                                            setModified({ ...modified, dataForSeoPassword: true });
                                        }}
                                        placeholder="DataForSEO API Password"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-emerald-500/50 transition-colors text-white placeholder-zinc-700"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowDfs(!showDfs)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                    >
                                        {showDfs ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            {testResult['dataforseo'] && (
                                <p className={`text-[10px] font-medium ${testResult['dataforseo'].success ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {testResult['dataforseo'].message}
                                </p>
                            )}
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
