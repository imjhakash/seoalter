"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    CheckCircle2,
    BarChart2,
    Globe,
    Sparkles,
    ShieldCheck,
    Zap,
    Search,
    ChevronDown,
    Database,
    BrainCircuit
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import AnimatedBackground from "./AnimatedBackground";
import HowItWorks from "./HowItWorks";

const LandingPage = ({ dict, lang, isLoggedIn }: { dict: any; lang: string; isLoggedIn: boolean }) => {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const faqs = [
        {
            question: dict?.landing?.faq?.questions?.q1?.q || "Is the analysis really free?",
            answer: dict?.landing?.faq?.questions?.q1?.a || "Yes! Every new account gets 3 free credits to perform comprehensive SEO analysis. No credit card required to start."
        },
        {
            question: dict?.landing?.faq?.questions?.q2?.q || "Where do you get the data?",
            answer: dict?.landing?.faq?.questions?.q2?.a || "We use official Google SERP APIs combined with real-time scraping of Reddit, Quora, and competitor sites. Our AI then synthesizes this raw data into actionable insights."
        },
        {
            question: dict?.landing?.faq?.questions?.q3?.q || "How accurate is the difficulty score?",
            answer: dict?.landing?.faq?.questions?.q3?.a || "Our Difficulty Score is calculated based on backlink profiles, domain authority, and content depth of the current top-ranking pages."
        },
        {
            question: dict?.landing?.faq?.questions?.q4?.q || "Can I target specific countries?",
            answer: dict?.landing?.faq?.questions?.q4?.a || "Absolutely. We support over 40+ regions and languages, allowing you to get localized insights for any market."
        }
    ];

    const toggleFaq = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white font-sans overflow-x-hidden selection:bg-emerald-500/30">
            {/* Background */}
            <AnimatedBackground />
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0a0c] to-[#0a0a0c] pointer-events-none -z-10"></div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-20"></div>
                            <Sparkles className="w-8 h-8 text-emerald-400 relative z-10" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300 tracking-tight">
                            SEOAlter
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
                            <a href="#how-it-works" className="hover:text-white transition">{dict?.landing?.nav?.how_it_works || "How it Works"}</a>
                            <a href="#features" className="hover:text-white transition">{dict?.landing?.nav?.features || "Features"}</a>
                            <a href="#faq" className="hover:text-white transition">{dict?.landing?.nav?.faq || "FAQ"}</a>
                        </div>
                        <LanguageSwitcher />
                        <Link
                            href={`/${lang}/login`}
                            className="hidden md:block px-5 py-2 text-sm font-semibold text-zinc-300 hover:text-white transition"
                        >
                            {dict?.landing?.nav?.login || "Log In"}
                        </Link>
                        <Link
                            href={isLoggedIn ? `/${lang}/dashboard` : `/${lang}/register`}
                            className="px-5 py-2 rounded-full bg-white text-black font-bold text-sm hover:bg-emerald-50 transition shadow-lg shadow-white/10"
                        >
                            {isLoggedIn ? (dict?.landing?.nav?.dashboard || "Dashboard") : (dict?.landing?.nav?.get_started || "Get Started")}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm shadow-2xl shadow-emerald-500/10 hover:border-emerald-500/30 transition-colors cursor-default">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-sm font-medium text-emerald-300 tracking-wide">{dict?.landing?.hero?.badge || "AI-Powered SERP Intelligence"}</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
                            {dict?.landing?.hero?.title || "Dominate Search with"} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 drop-shadow-sm">
                                {dict?.landing?.hero?.title_highlight || "Real-Time Data"}
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                            {dict?.landing?.hero?.subtitle || "Stop guessing. Get deep insights from live Google results, Reddit discussions, and competitor gaps instantly."}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href={isLoggedIn ? `/${lang}/dashboard` : `/${lang}/register`}
                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 group"
                            >
                                <Zap className="w-5 h-5 fill-white" />
                                <span>{isLoggedIn ? (dict?.landing?.nav?.dashboard || "Go to Dashboard") : (dict?.landing?.hero?.cta_primary || "Get 3 Free Credits")}</span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a
                                href="#how-it-works"
                                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-lg hover:bg-white/10 transition backdrop-blur-sm"
                            >
                                {dict?.landing?.hero?.cta_secondary || "How It Works"}
                            </a>
                        </div>

                        <p className="mt-6 text-sm text-zinc-500">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 inline mr-1.5" /> {dict?.landing?.hero?.no_card || "No credit card required"}
                            <span className="mx-3 text-zinc-700">|</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 inline mr-1.5" /> {dict?.landing?.hero?.free_searches || "3 free searches"}
                        </p>
                    </motion.div>
                </div>

                {/* Decorative 3D Elements */}
                <div className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse animation-delay-2000 pointer-events-none"></div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 relative box-border">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">{dict?.landing?.how_it_works?.title || "How It Works"}</h2>
                        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                            {dict?.landing?.how_it_works?.subtitle || "We don't just use static databases. We scan the live web the moment you search."}
                        </p>
                    </div>

                    <div className="bg-white/5 rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl backdrop-blur-sm">
                        <HowItWorks dict={dict} />
                    </div>
                </div>
            </section>

            {/* Transparency / Data Section */}
            <section id="features" className="py-24 bg-[#0d0d10] border-y border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-block p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                                <Database className="w-8 h-8 text-indigo-400" />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                                {dict?.landing?.transparency?.title || "Transparent"} <br />
                                <span className="text-indigo-400">{dict?.landing?.transparency?.title_highlight || "Data Sources"}</span>
                            </h2>
                            <p className="text-zinc-400 text-lg leading-relaxed">
                                {dict?.landing?.transparency?.subtitle || "Most SEO tools rely on outdated databases. We believe in freshness. When you run a report, we trigger:"}
                            </p>

                            <ul className="space-y-4">
                                {[
                                    { text: dict?.landing?.transparency?.list?.google_serp || "Live Google SERP Scraping", icon: Search },
                                    { text: dict?.landing?.transparency?.list?.google_trends || "Real-time Google Trends Analysis", icon: BarChart2 },
                                    { text: dict?.landing?.transparency?.list?.reddit_quora || "Reddit & Quora Discussion Mining", icon: Globe },
                                    { text: dict?.landing?.transparency?.list?.competitor_gap || "AI Competitor Gap Detection", icon: BrainCircuit },
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-colors">
                                        <div className="p-2 bg-black/50 rounded-lg">
                                            <item.icon className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <span className="font-semibold text-zinc-200">{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-[80px] opacity-20"></div>
                            <div className="relative bg-zinc-900 rounded-2xl border border-white/10 p-1 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                                <div className="bg-[#0a0a0c] rounded-xl overflow-hidden aspect-square flex items-center justify-center relative">
                                    {/* Abstract Data Visualization */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-3/4 h-3/4 border border-dashed border-zinc-700/50 rounded-full animate-spin-slow"></div>
                                        <div className="w-1/2 h-1/2 border border-dashed border-zinc-700/50 rounded-full animate-reverse-spin absolute"></div>
                                    </div>
                                    <div className="text-center relative z-10">
                                        <div className="text-5xl font-bold text-white mb-2">100%</div>
                                        <div className="text-zinc-500 uppercase tracking-widest text-sm font-bold">{dict?.landing?.transparency?.live_data_badge || "Live Data"}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* FAQ Section */}
            <section id="faq" className="py-24 relative">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">{dict?.landing?.faq?.title || "Frequently Asked Questions"}</h2>
                        <p className="text-zinc-400">{dict?.landing?.faq?.subtitle || "Everything you need to know about SEOAlter."}</p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`rounded-xl border transition-all duration-300 ${activeFaq === index
                                    ? "bg-zinc-900 border-white/20"
                                    : "bg-white/5 border-white/5 hover:bg-white/10"
                                    }`}
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex items-center justify-between p-6 text-left"
                                >
                                    <span className="font-semibold text-lg">{faq.question}</span>
                                    <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${activeFaq === index ? "rotate-180" : ""}`} />
                                </button>
                                <AnimatePresence>
                                    {activeFaq === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-6 pt-0 text-zinc-400 leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 bg-[#050507]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-500" />
                        <span className="font-bold text-lg">SEOAlter</span>
                    </div>
                    <div className="text-sm text-zinc-500">
                        {dict?.dashboard?.footer?.developed_by || "Developed by team"} <a href="https://codemypixel.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-emerald-400 font-medium transition-colors">Codemypixel.com</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
