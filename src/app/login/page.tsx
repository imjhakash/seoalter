"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await axios.post("/api/auth/login", { email, password });
            router.push("/");
            router.refresh(); // Refresh to update server components/middleware checking cookies
        } catch (err: any) {
            if (err.response?.status === 403 && err.response?.data?.isVerified === false) {
                setError("Email not verified. Redirecting...");
                setTimeout(() => router.push(`/verify?email=${encodeURIComponent(email)}`), 1500);
            } else {
                setError(err.response?.data?.message || "Login failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                <h2 className="text-3xl font-bold text-center text-purple-400">Login</h2>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 mt-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 mt-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <p className="text-center text-gray-400">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-purple-400 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}
