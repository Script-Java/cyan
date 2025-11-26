import Header from "@/components/Header";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, AlertCircle, Eye, EyeOff, Check } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const passwordRequirements = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    {
      text: "Contains uppercase letter",
      met: /[A-Z]/.test(formData.password),
    },
    {
      text: "Contains lowercase letter",
      met: /[a-z]/.test(formData.password),
    },
    { text: "Contains a number", met: /\d/.test(formData.password) },
  ];

  const passwordsMatch = formData.password === formData.confirmPassword;
  const isPasswordValid = passwordRequirements.every((req) => req.met);
  const canSubmit = isPasswordValid && passwordsMatch && agreeTerms;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Please ensure all requirements are met");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Integrate with BigCommerce registration
      // This would call your backend API endpoint that handles BigCommerce customer creation
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Signup failed. Please try again.");
      }

      const data = await response.json();
      // Store auth token and redirect
      localStorage.setItem("authToken", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBigCommerceSignup = () => {
    // Redirect to BigCommerce OAuth endpoint for signup
    window.location.href = "/api/auth/bigcommerce/signup";
  };

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-md mx-auto px-4 py-12 sm:py-20">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#030140] mb-2">
                Create Account
              </h1>
              <p className="text-gray-600">
                Join StickerHub and start creating today
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-[#030140] mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD713] focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#030140] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
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

                {formData.password && (
                  <div className="mt-3 space-y-2">
                    {passwordRequirements.map((req, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check
                          className={`w-4 h-4 ${
                            req.met ? "text-green-600" : "text-gray-300"
                          }`}
                        />
                        <span
                          className={
                            req.met ? "text-green-600" : "text-gray-600"
                          }
                        >
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#030140] mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD713] focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="text-sm text-red-600 mt-2">
                    Passwords do not match
                  </p>
                )}
                {formData.confirmPassword && passwordsMatch && (
                  <p className="text-sm text-green-600 mt-2">
                    Passwords match ✓
                  </p>
                )}
              </div>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 cursor-pointer mt-1"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-[#FFD713] hover:text-[#FFA500] transition-colors font-medium"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-[#FFD713] hover:text-[#FFA500] transition-colors font-medium"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>

              <button
                type="submit"
                disabled={!canSubmit || isLoading}
                className="w-full py-3 bg-[#FFD713] text-[#030140] rounded-lg font-bold hover:bg-[#FFD713]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FFD713]/30"
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-600">Or sign up with</span>
              </div>
            </div>

            <button
              onClick={handleBigCommerceSignup}
              className="w-full py-3 border-2 border-[#030140] text-[#030140] rounded-lg font-bold hover:bg-gray-50 transition-all"
            >
              BigCommerce Account
            </button>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#FFD713] hover:text-[#FFA500] font-semibold transition-colors"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
