"use client";

import { useState, Suspense } from "react"; // Fix for useSearchParams
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

function VerifyContent() {
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
            setMessage("Verification successful! Redirecting to login...");
            setTimeout(() => router.push("/login"), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Verification failed");
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                <h2 className="text-3xl font-bold text-center text-green-400">Verify Email</h2>
                {message && <p className="text-green-500 text-center">{message}</p>}
                {error && <p className="text-red-500 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 mt-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400">Verification Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            placeholder="123456"
                            className="w-full px-4 py-2 mt-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : "Verify"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function Verify() {
    return (
        <Suspense fallback={<div className="text-white text-center mt-10">Loading...</div>}>
            <VerifyContent />
        </Suspense>
    );
}
