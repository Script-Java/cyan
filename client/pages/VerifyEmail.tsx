import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Mail, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError("Invalid verification link. No token provided.");
        setIsLoading(false);
        return;
      }

      try {
        // This is a placeholder for the actual API call
        // Replace with your actual email verification endpoint
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to verify email");
        }

        setSuccess(true);
        toast.success("Email verified successfully!");
        setTimeout(() => navigate("/dashboard"), 3000);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to verify email";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  if (isLoading) {
    return (
      <>
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
          <div className="max-w-md mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-100 rounded-full p-4 animate-pulse">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
                Verifying Your Email
              </h1>
              <p className="text-gray-600 text-center mb-8 flex items-center justify-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Please wait while we verify your email address...
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
          <div className="max-w-md mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-center mb-6">
                <div className="bg-red-100 rounded-full p-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
                Verification Failed
              </h1>
              <p className="text-gray-600 text-center mb-6">
                {error}
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="w-full mb-3"
              >
                Back to Login
              </Button>
              <Button
                onClick={() => navigate("/support")}
                variant="outline"
                className="w-full"
              >
                Contact Support
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
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
          <div className="max-w-md mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 rounded-full p-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
                Email Verified
              </h1>
              <p className="text-gray-600 text-center mb-6">
                Your email has been verified successfully. Redirecting you to your dashboard...
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }
}
