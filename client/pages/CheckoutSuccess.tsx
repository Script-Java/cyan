import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const confirmPayment = async () => {
      if (!orderId) {
        setError("No order ID provided");
        setIsLoading(false);
        return;
      }

      setIsConfirming(true);

      try {
        // Confirm the payment with the backend
        const response = await fetch("/api/square/confirm-checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || `Payment confirmation failed (${response.status})`
          );
        }

        setOrderData(result.order);
        localStorage.removeItem("cart_id");

        setTimeout(() => {
          navigate(`/order-confirmation?orderId=${orderId}`);
        }, 2000);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to confirm payment";
        setError(errorMessage);
        console.error("Payment confirmation error:", err);
      } finally {
        setIsConfirming(false);
        setIsLoading(false);
      }
    };

    confirmPayment();
  }, [orderId, navigate]);

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
                <CardTitle className="text-red-600">Payment Error</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{error}</p>
                <Button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Return to Checkout
                </Button>
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
              {isConfirming && (
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Confirming your order...</span>
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
