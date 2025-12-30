import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Key, AlertCircle, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. No token provided.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // This is a placeholder for the actual API call
      // Replace with your actual password reset endpoint
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reset password";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
          <div className="max-w-md mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-center mb-6">
                <div className="bg-red-100 rounded-full p-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
                Invalid Link
              </h1>
              <p className="text-gray-600 text-center mb-6">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (success) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
          <div className="max-w-md mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 rounded-full p-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
                Password Reset Successful
              </h1>
              <p className="text-gray-600 text-center mb-6">
                Your password has been reset successfully. Redirecting you to login...
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 rounded-full p-4">
                <Key className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Enter your new password below
            </p>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password (min 8 characters)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              Remember your password?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Back to Login
              </button>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
