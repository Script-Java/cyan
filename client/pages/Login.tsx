import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
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
      
      // Dispatch auth change event to update Header navigation
      window.dispatchEvent(new Event("auth-change"));
      
      // Redirect to home
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <main className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-md mx-auto px-4 py-12 sm:py-20">
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
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F63049] focus:border-transparent transition-all"
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
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F63049] focus:border-transparent transition-all"
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
                  to="/forgot-password"
                  className="text-sm text-[#F63049] hover:text-[#d62a3f] transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#F63049] text-white rounded-lg font-bold hover:bg-[#d62a3f] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#F63049]/30"
              >
                {isLoading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-[#F63049] hover:text-[#d62a3f] font-semibold transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mt-8">
            By logging in, you agree to our{" "}
            <a
              href="#"
              className="text-[#F63049] hover:text-[#d62a3f] transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-[#F63049] hover:text-[#d62a3f] transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </main>
    </>
  );
}
