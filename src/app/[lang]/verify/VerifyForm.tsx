"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

import LanguageSwitcher from "@/components/LanguageSwitcher";

function VerifyContent({ dict }: { dict: any }) {
    const searchParams = useSearchParams();
    const emailParam = searchParams.get("email");
    const [email, setEmail] = useState(emailParam || "");
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            await axios.post("/api/auth/verify", { email, code });
            setMessage(dict?.auth?.verify?.success || "Verification successful! Redirecting...");
            setTimeout(() => router.push("/login"), 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || dict?.auth?.verify?.error_generic || "Verification failed");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c] relative overflow-hidden">
            {/* Language Switcher */}
            <div className="absolute top-4 right-4 z-50">
                <LanguageSwitcher />
            </div>

            {/* Background Gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-md p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative z-10 transition-all duration-300 hover:shadow-green-500/10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center border border-white/5 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                        <ShieldCheck className="w-8 h-8 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">{dict?.auth?.verify?.title || "Verify Email"}</h2>
                    <p className="text-zinc-400 text-sm">{dict?.auth?.verify?.subtitle || "We've sent a code to"} <span className="text-white">{email || "your email"}</span></p>
                </div>

                {message && <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> {message}</div>}
                {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center flex items-center justify-center gap-2">⚠️ {error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">{dict?.auth?.verify?.email || "Email Address"}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 text-white placeholder-zinc-700 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">{dict?.auth?.verify?.code || "Verification Code"}</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            placeholder="123456"
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 text-white placeholder-zinc-700 transition-all font-medium tracking-widest text-center text-lg"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                        {loading ? (dict?.auth?.verify?.loading || "Verifying...") : (dict?.auth?.verify?.button || "Verify & Continue")} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function Verify({ dict }: { dict: any }) {
    return (
        <Suspense fallback={<div className="text-white text-center mt-10">Loading...</div>}>
            <VerifyContent dict={dict} />
        </Suspense>
    );
}
