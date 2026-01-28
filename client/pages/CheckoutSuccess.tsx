import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  const orderId = searchParams.get("orderId");
  const MAX_VERIFICATION_ATTEMPTS = 5;
  const VERIFICATION_INTERVAL = 2000; // 2 seconds

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setError("No order ID provided");
        setIsLoading(false);
        return;
      }

      setIsVerifying(true);
      console.log(
        `CheckoutSuccess: Verifying payment for order ${orderId} (attempt ${verificationAttempts + 1})`,
      );

      try {
        // Verify the payment with the backend
        const response = await fetch("/api/square/confirm-checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId }),
        });

        console.log("Payment verification response status:", response.status);

        const result = await response.json();

        // 202 Accepted means payment is still processing
        if (response.status === 202) {
          console.log("Payment is still processing, will retry...");
          setError(null); // Clear error for retry

          if (verificationAttempts < MAX_VERIFICATION_ATTEMPTS) {
            // Retry after a delay
            setTimeout(() => {
              setVerificationAttempts((prev) => prev + 1);
            }, VERIFICATION_INTERVAL);
            setIsVerifying(false);
            return;
          } else {
            // Max attempts reached
            throw new Error(
              "Payment verification timeout. Please refresh this page to check your order status.",
            );
          }
        }

        if (!response.ok) {
          throw new Error(
            result.error || `Payment verification failed (${response.status})`,
          );
        }

        console.log("Payment verified successfully, redirecting...");
        setOrderData(result.order);
        localStorage.removeItem("cart_id");
        localStorage.removeItem("cart");

        // Redirect immediately to order confirmation
        setTimeout(() => {
          console.log("Navigating to order confirmation page...");
          navigate(`/order-confirmation?orderId=${orderId}`);
        }, 1500);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to verify payment";
        setError(errorMessage);
        console.error("Payment verification error:", err);
      } finally {
        setIsVerifying(false);
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [orderId, navigate, verificationAttempts]);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFD713]" />
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-gray-50 py-12">
          <div className="max-w-md mx-auto px-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Payment Alert</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      navigate(`/order-confirmation?orderId=${orderId}`)
                    }
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    View Order Status
                  </Button>
                  <Button
                    onClick={() => navigate("/checkout")}
                    variant="outline"
                    className="flex-1"
                  >
                    Return to Checkout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <CardTitle>Payment Successful!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-gray-700">
                Your payment has been processed successfully.
              </p>
              {isVerifying && (
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    Verifying your order... (Attempt {verificationAttempts + 1})
                  </span>
                </div>
              )}
              <p className="text-sm text-gray-500">
                Redirecting to order confirmation...
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
