"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Login failed. Please check your credentials.",
                );
            }

            // Store auth token, customer ID, and admin status
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("customerId", data.customer.id.toString());
            localStorage.setItem("isAdmin", String(data.customer.isAdmin || false));
            // Redirect to home
            router.push("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 sm:py-20">
            <div className="w-full max-w-md px-4">
                <div className="bg-[#fafafa] rounded-2xl shadow-xl p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[#030140] mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-gray-600">
                            Log in to your Stickerland account
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6 mb-8">
                        <div>
                            <label className="block text-sm font-semibold text-[#030140] mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD713] focus:border-transparent transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#030140] mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD713] focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                                />
                                <span className="text-sm text-gray-600">Remember me</span>
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-[#FFD713] hover:text-[#FFA500] transition-colors font-medium"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-[#FFD713] text-[#030140] rounded-lg font-bold hover:bg-[#FFD713]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FFD713]/30"
                        >
                            {isLoading ? "Logging in..." : "Log In"}
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-gray-600">
                            Don't have an account?{" "}
                            <Link
                                href="/signup"
                                className="text-[#FFD713] hover:text-[#FFA500] font-semibold transition-colors"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-sm text-gray-600 mt-8">
                    By logging in, you agree to our{" "}
                    <Link
                        href="/terms"
                        className="text-[#FFD713] hover:text-[#FFA500] transition-colors"
                    >
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                        href="/privacy"
                        className="text-[#FFD713] hover:text-[#FFA500] transition-colors"
                    >
                        Privacy Policy
                    </Link>
                </p>
            </div>
        </div>
    );
}
