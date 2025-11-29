import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
  applicationId,
}: SquarePaymentFormProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [appId, setAppId] = useState<string>("");
  const [locationId, setLocationId] = useState<string>("");
  const paymentsRef = useRef<any>(null);
  const cardRef = useRef<any>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const paymentStatusRef = useRef<HTMLDivElement>(null);

  // Fetch app ID and location ID from backend
  useEffect(() => {
    const fetchConfig = async () => {
      if (applicationId) {
        setAppId(applicationId);
      } else {
        try {
          const response = await fetch("/api/square/config");
          const data = await response.json();
          setAppId(data.applicationId || "sq0idp-aI75bRHWpnYqioPYqvKvsw");
          setLocationId(data.locationId || "");
        } catch (error) {
          console.error("Failed to fetch Square config:", error);
          setAppId("sq0idp-aI75bRHWpnYqioPYqvKvsw");
        }
      }
    };

    fetchConfig();
  }, [applicationId]);

  // Initialize Square payments and card
  useEffect(() => {
    if (!appId || !locationId) return;

    const initializeSquare = async () => {
      try {
        if ((window as any).Square) {
          const payments = (window as any).Square.payments(appId, locationId);
          paymentsRef.current = payments;

          const card = await payments.card();
          cardRef.current = card;

          if (cardContainerRef.current) {
            await card.attach("#card-container");
          }

          setIsSDKLoaded(true);
        } else {
          throw new Error("Square SDK not loaded");
        }
      } catch (error) {
        console.error("Failed to initialize Square payments:", error);
        toast.error("Payment system failed to load. Please try again.");
      }
    };

    initializeSquare();
  }, [appId, locationId]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardRef.current || !paymentsRef.current) {
      toast.error("Payment system not ready. Please refresh the page.");
      return;
    }

    setIsProcessing(true);
    const statusContainer = paymentStatusRef.current;

    try {
      const result = await cardRef.current.tokenize();

      if (result.status === "OK") {
        const token = result.token;
        console.log(`Payment token is ${token}`);

        // Send token to backend for payment processing
        const response = await fetch("/api/square/process-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
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

        if (statusContainer) {
          statusContainer.innerHTML = "Payment Successful";
        }
        toast.success("Payment successful!");
        onPaymentSuccess(token);
      } else {
        let errorMessage = `Tokenization failed with status: ${result.status}`;
        if (result.errors) {
          errorMessage += ` and errors: ${JSON.stringify(result.errors)}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Payment failed";
      console.error("Payment error:", error);
      if (statusContainer) {
        statusContainer.innerHTML = "Payment Failed";
      }
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
      <form onSubmit={handlePaymentSubmit} className="space-y-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-2">Payment Details</h3>
            <p className="text-white/60 text-sm">
              Amount: ${(amount / 100).toFixed(2)}
            </p>
          </div>

          <div id="payment-status-container" 
            ref={paymentStatusRef}
            className="mb-4 text-sm font-medium" />

          <div
            id="card-container"
            ref={cardContainerRef}
            className="mb-6 p-4 bg-black/30 rounded-lg border border-white/10"
          />

          <Button
            id="card-button"
            type="submit"
            disabled={isProcessing || isLoading}
            className="w-full bg-[#FFD713] hover:bg-[#FFD713]/90 text-black font-bold py-3 rounded-lg transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              `Pay $${(amount / 100).toFixed(2)}`
            )}
          </Button>

          <p className="text-xs text-white/40 text-center mt-4">
            Secure payment powered by Square
          </p>
        </div>
      </form>
    </div>
  );
}
