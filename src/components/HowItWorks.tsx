"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Globe, Sparkles, Database, BarChart2, Share2 } from "lucide-react";

const HowItWorks = ({ dict }: { dict: any }) => {
    const steps = [
        {
            id: 1,
            icon: Search,
            title: dict?.dashboard?.how_it_works?.step1 || "1. Enter Keyword",
            description: "Start by entering your target keyword.",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            id: 2,
            icon: Globe,
            title: dict?.dashboard?.how_it_works?.step2 || "2. SERP Scraping",
            description: "We scrape Google results in real-time.",
            color: "text-teal-400",
            bg: "bg-teal-500/10",
            border: "border-teal-500/20"
        },
        {
            id: 3,
            icon: Sparkles,
            title: dict?.dashboard?.how_it_works?.step3 || "3. AI Analysis",
            description: "AI analyzes trends, intent & gaps.",
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
            border: "border-cyan-500/20"
        }
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-16 px-4">
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
            >
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-cyan-500/30 -z-10"></div>

                {steps.map((step, index) => (
                    <motion.div
                        key={step.id}
                        variants={item}
                        className="flex flex-col items-center text-center group"
                    >
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className={`w-24 h-24 rounded-2xl ${step.bg} ${step.border} border flex items-center justify-center mb-6 relative z-10 backdrop-blur-sm transition-all duration-300 shadow-lg shadow-black/50`}
                        >
                            <step.icon className={`w-10 h-10 ${step.color}`} />

                            {/* Orbiting particles */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-2xl border border-dashed border-white/10"
                            />
                        </motion.div>

                        <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                        <p className="text-sm text-zinc-500 max-w-[200px]">{step.description}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Bottom Features Flow */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="mt-16 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                {[
                    { icon: Database, label: "Live Data" },
                    { icon: BarChart2, label: "Trend Graph" },
                    { icon: Share2, label: "Social Signals" },
                    { icon: Search, label: "Related Keys" } // Using Search as generic icon for keys
                ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                        <feat.icon className="w-4 h-4 text-zinc-500" />
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{feat.label}</span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default HowItWorks;
