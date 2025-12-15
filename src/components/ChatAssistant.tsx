'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import axios from 'axios';

interface ChatAssistantProps {
    contextData?: Record<string, unknown> | object | null;
    contextId?: string | null;
}

interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface SmartButton {
    label: string;
    prompt: string;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ contextData, contextId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'system', content: 'Hello! I am your SEO Assistant. Ask me anything about the data or general SEO strategy.' }
    ]);
    const [quickQuestions, setQuickQuestions] = useState<SmartButton[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contextId || contextData) {
            fetchSmartButtons();
        }
    }, [contextId, contextData]);

    const fetchSmartButtons = async () => {
        try {
            const res = await axios.get('/api/smart-buttons', {
                params: { contextId, query: (contextData as Record<string, unknown>)?.query }
            });
            setQuickQuestions(res.data.buttons || []);
        } catch (error) {
            console.error("Failed to fetch smart buttons", error);
        }
    };

    const handleQuickReply = (prompt: string) => {
        setInput(prompt);
        handleSend(null, prompt);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent | null, manualInput: string | null = null) => {
        if (e) e.preventDefault();
        const msgText = manualInput || input;
        if (!msgText.trim()) return;

        const userMsg: Message = { role: 'user', content: msgText };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post('/api/chat', {
                message: msgText,
                contextId: contextId,
                query: (contextData as Record<string, unknown>)?.query
            });
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
        } catch (error) {
            const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || "Ensure API keys are set.";
            setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I encountered an error: ${errorMessage}` }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-600/30 hover:scale-110 transition-all z-[90] animate-bounce-subtle flex items-center gap-2 group"
            >
                <MessageSquare className="w-6 h-6" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-bold">Ask AI</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 md:inset-auto md:w-96 md:h-[600px] md:bottom-8 md:right-8 glass-card flex flex-col z-[100] animate-in slide-in-from-bottom-5 zoom-in-95 duration-200 border-0 md:border md:border-white/10 shadow-2xl md:rounded-2xl bg-zinc-950 md:bg-zinc-900/90 backdrop-blur-xl">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-white/5 bg-white/5 md:rounded-t-2xl backdrop-blur-md">
                <h3 className="font-bold flex items-center gap-3 text-white">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500 blur-sm rounded-full opacity-50"></div>
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full relative z-10"></div>
                    </div>
                    AI Assistant
                </h3>
                <div className="flex gap-2">
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
                {/* Welcome & Quick Questions */}
                {messages.length === 1 && quickQuestions.length > 0 && (
                    <div className="mb-6 space-y-2">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">Quick Actions</p>
                        <div className="flex flex-wrap gap-2">
                            {quickQuestions.map((btn, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleQuickReply(btn.prompt)}
                                    className="text-left text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-3 py-2 rounded-lg transition-all active:scale-95"
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-900/20'
                            : 'bg-zinc-800/80 text-zinc-100 rounded-tl-none border border-white/5'
                            }`}>
                            {msg.role === 'system' && <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-2">System</span>}
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-800/50 p-4 rounded-2xl rounded-tl-none flex gap-1">
                            <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={(e) => handleSend(e)} className="p-3 md:p-4 border-t border-white/5 bg-zinc-900/50 md:rounded-b-2xl backdrop-blur-md pb-safe">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask follow-up questions..."
                        className="w-full bg-zinc-800/50 border border-white/5 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white focus:outline-none focus:bg-zinc-800 transition shadow-inner placeholder:text-zinc-600"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/20"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatAssistant;
