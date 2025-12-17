"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { LogIn, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function LoginForm({ dict }: { dict: any }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await axios.post("/api/auth/login", { email, password });

            // Check for redirect param
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get('redirect') || '/dashboard';

            router.push(redirect);
            router.refresh();
        } catch (err: any) {
            if (err.response?.status === 403 && err.response?.data?.isVerified === false) {
                setError("Email not verified. Redirecting...");
                setTimeout(() => router.push(`/verify?email=${encodeURIComponent(email)}`), 1500);
            } else {
                setError(err.response?.data?.message || dict?.auth?.login?.error_generic || "Login failed");
            }
        } finally {
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
            <AnimatedBackground />
            <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0a0c] to-[#0a0a0c] pointer-events-none"></div>
            <div className="fixed -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
            <div className="fixed top-40 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000 pointer-events-none"></div>

            <div className="w-full max-w-6xl flex flex-col md:flex-row shadow-2xl rounded-2xl overflow-hidden z-10">
                {/* Marketing Side */}
                <div className="md:w-1/2 bg-zinc-900/80 backdrop-blur-xl p-10 flex flex-col justify-center relative border border-white/10 text-center md:text-left">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 to-purple-800/20 blur-xl"></div>
                    <div className="relative z-10 space-y-6">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto md:mx-0 backdrop-blur-md border border-white/20">
                            <span className="text-3xl">🚀</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">{dict?.auth?.marketing?.title || "Advanced AI SEO"}</h2>
                        <p className="text-zinc-400 text-lg leading-relaxed">
                            {dict?.auth?.marketing?.subtitle || "We don’t just analyze keywords with basic ChatGPT! We use the most advanced data scraping and perform deep analysis using AI for the best accuracy."}
                        </p>
                        <ul className="space-y-3 pt-4 text-zinc-300 text-sm hidden md:block">
                            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div> Real-time SERP Scraping</li>
                            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div> Deep Competitor Analysis</li>
                            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div> AI-Driven Content Strategy</li>
                        </ul>
                    </div>
                </div>

                {/* Login Form Side */}
                <div className="md:w-1/2 p-8 md:p-12 bg-black/80 backdrop-blur-md border-l border-white/5">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 mb-2">{dict?.auth?.login?.title || "Welcome Back"}</h2>
                        <p className="text-zinc-500 text-sm">{dict?.auth?.login?.subtitle || "Sign in to continue your SEO journey."}</p>
                    </div>

                    {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">⚠️ {error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">{dict?.auth?.login?.email || "Email"}</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 text-white placeholder-zinc-700 transition-all font-medium"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{dict?.auth?.login?.password || "Password"}</label>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder-zinc-700 transition-all font-medium"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-zinc-300 transition">
                                <input type="checkbox" className="rounded bg-zinc-800 border-zinc-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0" />
                                {dict?.auth?.remember_me || "Remember Me"}
                            </label>
                            <Link href="/forgot-password" className="text-indigo-400 hover:text-indigo-300 transition-colors">{dict?.auth?.login?.forgot || "Forgot Password?"}</Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <span>Logging in...</span>
                            ) : (
                                <>
                                    <span>{dict?.auth?.login?.button || "Sign In"}</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-zinc-500 text-sm">
                            {dict?.auth?.login?.no_account || "Don't have an account?"}{" "}
                            <Link href="/register" className="text-white hover:text-indigo-400 font-medium transition-colors">
                                {dict?.auth?.login?.signup || "Create Account"}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
