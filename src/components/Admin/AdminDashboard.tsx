"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users,
    Search,
    Trash2,
    PlusCircle,
    Activity,
    Settings,
    ChevronDown,
    ChevronRight,
    Search as SearchIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface User {
    _id: string;
    email: string;
    usageCount: number;
    maxUsage: number;
    createdAt: string;
    keywordResearchAccess?: string;
}

interface Stats {
    totalUsers: number;
    totalSearches: number;
    searchesToday: number;
}

interface SearchLog {
    _id: string;
    query: string;
    userId: { email: string } | null;
    createdAt: string;
}

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'requests'>('users');
    const [logs, setLogs] = useState<SearchLog[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, statsRes] = await Promise.all([
                axios.get('/api/admin/users'),
                axios.get('/api/admin/stats')
            ]);
            setUsers(usersRes.data);
            setStats(statsRes.data);
            setLoading(false);
        } catch (error: any) {
            console.error("Failed to fetch admin data", error);
            if (error.response && error.response.status === 401) {
                // Determine current lang from URL or default to 'en'
                const pathParts = window.location.pathname.split('/');
                const lang = ['en', 'nl', 'it'].includes(pathParts[1]) ? pathParts[1] : 'en';
                window.location.href = `/${lang}/login?redirect=${encodeURIComponent(window.location.pathname)}`;
            } else {
                setLoading(false);
            }
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await axios.get('/api/admin/history?limit=100');
            setLogs(res.data);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
        try {
            await axios.delete(`/api/admin/users?userId=${userId}`);
            fetchData();
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    const handleAddCredits = async (userId: string, currentMax: number) => {
        const amount = prompt('Enter new total credit limit:', (currentMax + 3).toString());
        if (!amount) return;

        try {
            await axios.patch('/api/admin/users', { userId, credits: parseInt(amount) });
            fetchData();
        } catch (error) {
            alert('Failed to add credits');
        }
    };

    // Filter users
    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0a0c] text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white font-sans p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
                            Superadmin Panel
                        </h1>
                        <p className="text-zinc-400 mt-2">Manage users, credits, and view system logs.</p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Link href={`/${typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'en'}/admin/credentials`}>
                            <button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-xl p-4 flex items-center gap-4 group">
                                <div className="p-3 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                                    <Settings className="w-6 h-6 text-purple-400" />
                                </div>
                                <div className="text-left">
                                    <div className="text-lg font-bold">System Settings</div>
                                    <div className="text-xs text-zinc-500 uppercase font-bold">Global Credentials & Config</div>
                                </div>
                            </button>
                        </Link>
                        {/* Stats Cards */}
                        <div className="flex gap-4">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 flex-1">
                                <div className="p-3 bg-indigo-500/20 rounded-lg">
                                    <Users className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{stats?.totalUsers}</div>
                                    <div className="text-xs text-zinc-500 uppercase font-bold">Total Users</div>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 flex-1">
                                <div className="p-3 bg-emerald-500/20 rounded-lg">
                                    <Activity className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{stats?.searchesToday}</div>
                                    <div className="text-xs text-zinc-500 uppercase font-bold">Searches Today</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-white/10 mb-8">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'users' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        User Management
                        {activeTab === 'users' && (
                            <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                        )}
                    </button>
                    <button
                        onClick={() => { setActiveTab('logs'); fetchLogs(); }}
                        className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'logs' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        Search Logs
                        {activeTab === 'logs' && (
                            <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'requests' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        Access Requests
                        {activeTab === 'requests' && (
                            <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                        )}
                    </button>
                </div>

                {activeTab === 'users' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-white/10 flex items-center gap-4">
                            <div className="relative flex-1 max-w-md">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-zinc-400 text-xs uppercase tracking-wider">
                                        <th className="p-6 font-medium">User</th>
                                        <th className="p-6 font-medium">Credits Used</th>
                                        <th className="p-6 font-medium">Max Limit</th>
                                        <th className="p-6 font-medium">Joined</th>
                                        <th className="p-6 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredUsers.map(user => (
                                        <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-6 font-medium text-zinc-200">
                                                {user.email}
                                                {user.email === 'helloatjh@gmail.com' && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
                                                        Superadmin
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-6 text-zinc-400">{user.usageCount}</td>
                                            <td className="p-6 text-zinc-400">{user.maxUsage}</td>
                                            <td className="p-6 text-zinc-500 text-sm">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-6 text-right space-x-2">
                                                <button
                                                    onClick={() => handleAddCredits(user._id, user.maxUsage)}
                                                    className="inline-flex items-center p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                                    title="Add Credits"
                                                >
                                                    <PlusCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="inline-flex items-center p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'logs' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 text-zinc-400 text-xs uppercase tracking-wider">
                                        <th className="p-6 font-medium">Time</th>
                                        <th className="p-6 font-medium">User</th>
                                        <th className="p-6 font-medium">Query</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {logs.map(log => (
                                        <tr key={log._id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-6 text-zinc-500 text-sm whitespace-nowrap">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                            <td className="p-6 text-zinc-300">
                                                {log.userId?.email || <span className="text-zinc-600 italic">Unknown</span>}
                                            </td>
                                            <td className="p-6 text-zinc-200 font-medium break-all">
                                                {log.query}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
