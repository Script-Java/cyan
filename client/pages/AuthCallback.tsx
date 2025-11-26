import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("auth_token");
    const customerId = searchParams.get("customer_id");
    const error = searchParams.get("error");

    if (error) {
      // Handle authentication error
      console.error("Authentication error:", error);
      navigate("/login?error=authentication_failed");
      return;
    }

    if (token && customerId) {
      // Store the token and customer ID
      localStorage.setItem("authToken", token);
      localStorage.setItem("customerId", customerId);
      // Redirect to home
      navigate("/");
    } else {
      // If no token, redirect to login
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#030140] mb-4">
            Completing authentication...
          </h1>
          <p className="text-gray-600">Please wait while we log you in.</p>
        </div>
      </main>
    </>
  );
}
