"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Users, Database, ArrowLeft, Loader2, MapPin, Building, Globe } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Lead {
    email: string | null;
    firstname: string | null;
    lastname: string | null;
    Address1: string | null;
    Address2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    CompanyName: string | null;
    language_desc: string | null;
}

export default function LeadsSearchPage() {
    const params = useParams();
    const headers = { lang: params.lang as string };

    const [searchTerm, setSearchTerm] = useState('');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchLeads(debouncedTerm);
    }, [debouncedTerm]);

    const fetchLeads = async (term: string) => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`/api/leads/search?q=${encodeURIComponent(term)}`);
            setLeads(res.data.data || []);
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.error) {
                const apiError = err.response.data;
                if (apiError.code === 'PGRST205') {
                    setError(
                        `Access Denied: ${apiError.details} \n\n` +
                        `ACTION REQUIRED: Please run the SQL in SUPABASE_INSTRUCTIONS.sql in your Supabase Dashboard SQL Editor.`
                    );
                } else {
                    setError(apiError.error + (apiError.details ? `: ${apiError.details}` : ''));
                }
            } else {
                setError('Failed to fetch leads. Please check the database connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white font-sans p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <Link href={`/${params?.lang || 'en'}/admin`} className="inline-flex items-center text-zinc-500 hover:text-emerald-400 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>

                <header className="mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300 flex items-center gap-3">
                        <Database className="w-8 h-8 text-emerald-400" />
                        Leads Search Database
                    </h1>
                    <p className="text-zinc-400 mt-2">
                        Real-time search across {leads.length > 0 ? leads.length : ''} leads records.
                    </p>
                </header>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by email, name, company, city..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:border-emerald-500/50 transition-colors text-white text-lg placeholder-zinc-600"
                        />
                        {loading && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-zinc-400">
                            <thead className="bg-black/20 text-xs uppercase font-semibold text-zinc-500">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Company</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4">Language</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {leads.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                            No leads found matching your search.
                                        </td>
                                    </tr>
                                )}
                                {leads.map((lead, index) => (
                                    <tr key={index} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold shrink-0">
                                                    {(lead.firstname?.[0] || lead.lastname?.[0] || '?').toUpperCase()}
                                                </div>
                                                <div className="font-medium text-white">
                                                    {lead.firstname} {lead.lastname}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-300">
                                            {lead.email || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {lead.CompanyName ? (
                                                <div className="flex items-center gap-2 text-zinc-300">
                                                    <Building className="w-3 h-3 text-zinc-500" />
                                                    {lead.CompanyName}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <div className="flex items-center gap-1 text-zinc-300">
                                                    <MapPin className="w-3 h-3 text-zinc-500" />
                                                    {lead.city}, {lead.state} {lead.postal_code}
                                                </div>
                                                <span className="text-zinc-500 pl-4">{lead.Address1}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-3 h-3 text-zinc-500" />
                                                {lead.language_desc || 'Unknown'}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
