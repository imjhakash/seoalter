"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Search, BrainCircuit, BarChart, Users } from "lucide-react";

const AnalysisProgress = ({ query }: { query: string }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        { icon: Search, label: "Scanning Google SERP...", duration: 2000 },
        { icon: Users, label: "Analyzing Competitors...", duration: 2500 },
        { icon: BarChart, label: "Fetching Trend Data...", duration: 2000 },
        { icon: BrainCircuit, label: "Applying AI Strategy...", duration: 3000 } // Longest step
    ];

    useEffect(() => {
        let stepIndex = 0;

        const interval = setInterval(() => {
            stepIndex++;
            if (stepIndex < steps.length) {
                setCurrentStep(stepIndex);
            } else {
                clearInterval(interval);
            }
        }, 1500); // Simulate progress every 1.5s, independent of backend for UX smoothing

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="relative mb-12">
                {/* Central Pulse */}
                <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse"></div>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 relative z-10 flex items-center justify-center p-2"
                >
                    <div className="w-full h-full bg-indigo-900/40 rounded-full flex items-center justify-center backdrop-blur-md">
                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                    </div>
                </motion.div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 text-center">
                Analyzing <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">"{query}"</span>
            </h2>
            <p className="text-zinc-500 text-sm mb-10 text-center">Please wait while we gather intelligence...</p>

            <div className="w-full max-w-md space-y-4">
                {steps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${isActive
                                    ? "bg-zinc-800/80 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                                    : isCompleted
                                        ? "bg-zinc-900/50 border-emerald-500/20"
                                        : "bg-zinc-900/30 border-white/5 opacity-50"
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isActive
                                    ? "bg-indigo-500/20 text-indigo-400"
                                    : isCompleted
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : "bg-zinc-800 text-zinc-500"
                                }`}>
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${isActive || isCompleted ? "text-white" : "text-zinc-500"}`}>
                                    {isCompleted ? step.label.replace("...", "") + " Connected" : step.label}
                                </p>
                            </div>
                            {isActive && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default AnalysisProgress;
