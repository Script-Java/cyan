import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const { orderId: pathOrderId } = useParams<{ orderId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = pathOrderId;

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setIsLoading(false);
      return;
    }

    // Square has redirected us here, which means payment was successful
    // The webhook from Square will update the order status in the background
    console.log("Payment successful! Redirecting to order confirmation...");
    localStorage.removeItem("cart_id");
    localStorage.removeItem("cart");

    // Redirect to order confirmation after a short delay
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/order-confirmation/${orderId}`);
    }, 1500);
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
                      navigate(`/order-confirmation/${orderId}`)
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
