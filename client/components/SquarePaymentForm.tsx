import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SquarePaymentFormProps {
  amount: number;
  orderId: number;
  customerEmail: string;
  customerName: string;
  onPaymentSuccess: (token: string) => void;
  isLoading?: boolean;
  applicationId?: string;
}

export default function SquarePaymentForm({
  amount,
  orderId,
  customerEmail,
  customerName,
  onPaymentSuccess,
  isLoading = false,
}: SquarePaymentFormProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sqPaymentRequest, setSqPaymentRequest] = useState<any>(null);

  useEffect(() => {
    // Load Square Web Payments SDK from CDN
    const script = document.createElement("script");
    script.src = "https://sandbox.web.squarecdn.com/v1/square.js";
    script.async = true;
    script.onload = initializeSquarePayments;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const initializeSquarePayments = async () => {
    if ((window as any).Square) {
      try {
        const web = await (window as any).Square.payments(
          process.env.VITE_SQUARE_APPLICATION_ID || "sq0idb-QCpVeag3Cf_bZhf5K8-gVQ",
          "us"
        );

        // Create payment request for Web Payments SDK
        const paymentRequest = web.paymentRequest({
          countryCode: "US",
          currencyCode: "USD",
          total: {
            amount: String(Math.round(amount * 100)), // Convert to cents
            label: `Order #${orderId}`,
          },
          requestShippingAddress: false,
        });

        setSqPaymentRequest({ web, paymentRequest });
        setIsSDKLoaded(true);
      } catch (error) {
        console.error("Failed to initialize Square Web Payments:", error);
        toast.error("Payment system failed to load. Please try again.");
      }
    }
  };

  const handlePaymentSubmit = async () => {
    if (!sqPaymentRequest) return;

    setIsProcessing(true);
    try {
      const { web, paymentRequest } = sqPaymentRequest;

      // Show payment form
      const result = await paymentRequest.show();

      if (result.status === "SUCCESS") {
        const token = result.token;

        // Send token to backend for payment processing
        const response = await fetch("/api/square/process-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token.token,
            orderId: orderId,
            amount: amount,
            customerEmail: customerEmail,
            customerName: customerName,
          }),
        });

        const paymentResult = await response.json();

        if (!response.ok) {
          throw new Error(paymentResult.error || "Payment failed");
        }

        toast.success("Payment successful!");
        onPaymentSuccess(token.token);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Payment failed";
      console.error("Payment error:", error);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#FFD713]" />
        <span className="ml-2 text-white">Loading payment form...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-2">Payment Details</h3>
          <p className="text-white/60 text-sm">
            Amount: ${(amount / 100).toFixed(2)}
          </p>
        </div>

        <Button
          onClick={handlePaymentSubmit}
          disabled={isProcessing || isLoading}
          className="w-full bg-[#FFD713] hover:bg-[#FFD713]/90 text-black font-bold py-3 rounded-lg transition-all"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            "Pay with Square"
          )}
        </Button>

        <p className="text-xs text-white/40 text-center mt-4">
          Secure payment powered by Square
        </p>
      </div>

      <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-200">
          Test card: <span className="font-mono">4111 1111 1111 1111</span> with any future date
        </p>
      </div>
    </div>
  );
}
