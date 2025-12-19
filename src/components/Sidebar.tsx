'use client';

import React from 'react';
import { Plus, Settings, Search, BarChart3, X, LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface HistoryItem {
    _id: string;
    query: string;
}

interface User {
    email: string;
    usageCount: number;
    maxUsage: number;
}

interface SidebarProps {
    history: HistoryItem[];
    onSelectHistory: (id: string) => void;
    onNewAnalysis: () => void;
    activeSearchId: string | null;
    isOpen: boolean;
    onClose: () => void;
    user: { email: string; usageCount: number; maxUsage: number; } | null;
    dict: any;
}

const Sidebar: React.FC<SidebarProps> = ({
    history = [],
    onSelectHistory,
    onNewAnalysis,
    activeSearchId,
    isOpen,
    onClose,
    user,
    dict
}) => {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            // document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            await axios.post('/api/auth/logout');
            window.location.href = '/login';
        } catch (error) {
            console.error(error);
            window.location.href = '/login';
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
                />
            )}

            <aside className={`
                fixed left-0 top-0 h-screen bg-zinc-950/90 backdrop-blur-xl border-r border-white/5 flex flex-col z-50 transition-all duration-300
                w-72 md:w-64
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Header / Logo */}
                <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300 tracking-tight">
                            SEOPataka
                        </span>
                    </div>
                    {/* Close Button Mobile */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Profile / Quota */}
                {user && (
                    <div className="px-4 py-3 bg-zinc-900/50 mx-3 rounded-xl border border-white/5 mb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <UserIcon className="w-4 h-4" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs text-zinc-400 truncate w-32">{user.email}</p>
                                <p className="text-xs font-bold text-white">Free Plan</p>
                            </div>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-1.5 overflow-hidden">
                            <div
                                className={`h-full rounded-full ${user.usageCount >= user.maxUsage ? 'bg-red-500' : 'bg-emerald-500'}`}
                                style={{ width: `${(user.usageCount / user.maxUsage) * 100}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                            <span>{dict?.sidebar?.quota || 'Usage'}</span>
                            <span>{user.usageCount} / {user.maxUsage}</span>
                        </div>
                    </div>
                )}

                <div className="px-3 mb-2 space-y-1">
                    <button
                        onClick={() => {
                            if (user && user.usageCount >= user.maxUsage) {
                                alert("You have reached your free limit of 3 analyses.");
                                return;
                            }
                            onNewAnalysis();
                            if (typeof window !== 'undefined' && window.innerWidth < 768) onClose?.();
                        }}
                        disabled={user ? user.usageCount >= user.maxUsage : true}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group shadow-sm
                            ${user && user.usageCount >= user.maxUsage
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-white hover:shadow-emerald-500/10'
                            }`}
                    >
                        <Plus className={`w-5 h-5 ${user && user.usageCount >= user.maxUsage ? 'text-zinc-600' : 'text-emerald-400 group-hover:text-white'} transition-colors`} />
                        <span className="font-medium text-sm">{dict?.sidebar?.new_analysis || 'New Analysis'}</span>
                    </button>

                    <button
                        onClick={() => {
                            router.push('/dashboard/keyword-research');
                            if (typeof window !== 'undefined' && window.innerWidth < 768) onClose?.();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group hover:bg-white/5 text-zinc-400 hover:text-white"
                    >
                        <Search className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                        <span className="font-medium text-sm">Keyword Research</span>
                    </button>
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-1">
                    <p className="px-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 mt-2">{dict?.sidebar?.history || 'History'}</p>
                    {history.map((item) => (
                        <button
                            key={item._id}
                            onClick={() => {
                                onSelectHistory(item._id);
                                if (typeof window !== 'undefined' && window.innerWidth < 768) onClose?.();
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all group relative
                                ${activeSearchId === item._id
                                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }
                            `}
                        >
                            <Search className={`w-4 h-4 shrink-0 ${activeSearchId === item._id ? 'text-emerald-400' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                            <span className="text-sm truncate pr-2">{item.query}</span>
                        </button>
                    ))}
                    {history.length === 0 && (
                        <div className="text-center py-10 text-zinc-600 text-xs">
                            No history yet.
                        </div>
                    )}
                </div>

                {/* Footer / Settings */}
                <div className="p-4 mt-auto border-t border-white/5 bg-zinc-900/50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all group"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">{dict?.sidebar?.logout || 'Logout'}</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
