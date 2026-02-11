import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send password reset email");
      }

      setSuccess(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send password reset email";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <main className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-md mx-auto px-4 py-12 sm:py-20">
            <div className="bg-[#fafafa] rounded-2xl shadow-xl p-8 sm:p-10">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 rounded-full p-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-center text-[#030140] mb-2">
                Email Sent!
              </h1>
              <p className="text-gray-600 text-center mb-6">
                We've sent a password reset link to <strong>{email}</strong>. 
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Check your spam folder if you don't see the email in your inbox. The link will expire in 1 hour.
                </p>
              </div>

              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 bg-[#FFD713] text-[#030140] rounded-lg font-bold hover:bg-[#FFD713]/90 transition-all shadow-lg shadow-[#FFD713]/30"
              >
                Back to Login
              </button>

              <p className="text-center text-sm text-gray-600 mt-6">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-[#FFD713] hover:text-[#FFA500] font-semibold transition-colors"
                >
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-md mx-auto px-4 py-12 sm:py-20">
          <div className="bg-[#fafafa] rounded-2xl shadow-xl p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={() => navigate("/login")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-[#030140]">
                Reset Password
              </h1>
            </div>

            <p className="text-gray-600 mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD713] focus:border-transparent transition-all disabled:bg-gray-100"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#FFD713] text-[#030140] rounded-lg font-bold hover:bg-[#FFD713]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FFD713]/30"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-8">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-[#FFD713] hover:text-[#FFA500] font-semibold transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </div>

          <p className="text-center text-sm text-gray-600 mt-8">
            Need help?{" "}
            <Link
              to="/support"
              className="text-[#FFD713] hover:text-[#FFA500] transition-colors"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
