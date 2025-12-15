'use client';

import React from 'react';
import { Plus, Settings, Search, BarChart3, X } from 'lucide-react';

interface HistoryItem {
    _id: string;
    query: string;
}

interface SidebarProps {
    history?: HistoryItem[];
    onSelectHistory: (id: string) => void;
    onNewAnalysis: () => void;
    activeSearchId?: string | null;
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    history = [], 
    onSelectHistory, 
    onNewAnalysis, 
    activeSearchId, 
    isOpen, 
    onClose 
}) => {
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

                {/* New Analysis Button */}
                <div className="px-3 mb-2">
                    <button
                        onClick={() => {
                            onNewAnalysis();
                            if (typeof window !== 'undefined' && window.innerWidth < 768) onClose?.();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-white transition-all group shadow-sm hover:shadow-emerald-500/10"
                    >
                        <Plus className="w-5 h-5 text-emerald-400 group-hover:text-white transition-colors" />
                        <span className="font-medium text-sm">New Analysis</span>
                    </button>
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-1">
                    <p className="px-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 mt-2">Recent Searches</p>
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
                <div className="p-4 mt-auto border-t border-white/5">
                    <button
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all group"
                    >
                        <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
                        <span className="font-medium text-sm">Settings</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
