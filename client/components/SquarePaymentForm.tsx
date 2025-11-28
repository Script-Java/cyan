import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

declare const window: any;

interface SquarePaymentFormProps {
  applicationId: string;
  locationId?: string;
  amount: number;
  onPaymentSuccess: (token: string) => void;
  onPaymentError: (error: string) => void;
  isProcessing?: boolean;
}

export default function SquarePaymentForm({
  applicationId,
  locationId,
  amount,
  onPaymentSuccess,
  onPaymentError,
  isProcessing = false,
}: SquarePaymentFormProps) {
  const web = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentSourceId, setPaymentSourceId] = useState<string | null>(null);

  useEffect(() => {
    const initializeSquare = async () => {
      try {
        // Wait for Square SDK to be available
        let attempts = 0;
        while (!window.Square && attempts < 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          attempts++;
        }

        if (!window.Square) {
          throw new Error("Square SDK failed to load - window.Square not available");
        }

        // Check if web module is available
        if (!window.Square.web) {
          throw new Error(
            "Square Web Payments module not available - Square SDK may not have loaded correctly"
          );
        }

        // Initialize web payments
        web.current = await window.Square.web.payments(applicationId);

        if (!web.current) {
          throw new Error("Failed to initialize Square Web Payments");
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize Square:", error);
        onPaymentError(
          error instanceof Error ? error.message : "Failed to initialize payment"
        );
        setIsLoading(false);
      }
    };

    if (applicationId) {
      initializeSquare();
    }
  }, [applicationId, onPaymentError]);

  const handleRequestCardPayment = async () => {
    if (!web.current) {
      onPaymentError("Payment system not initialized");
      return;
    }

    try {
      const tokenResult = await web.current.requestCardPayment({
        amount: Math.round(amount * 100),
        currencyCode: "USD",
        intent: "CHARGE",
      });

      if (tokenResult.status === "SUCCESS") {
        setPaymentSourceId(tokenResult.token);
        onPaymentSuccess(tokenResult.token);
      } else if (tokenResult.errors && tokenResult.errors.length > 0) {
        const errorMessage = tokenResult.errors
          .map((e: any) => e.message)
          .join(", ");
        onPaymentError(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Payment failed";
      onPaymentError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading payment form...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            Click the button below to enter your card details securely through Square.
          </p>
        </div>

        <button
          onClick={handleRequestCardPayment}
          disabled={isProcessing || !web.current}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            "Enter Card Details"
          )}
        </button>

        {paymentSourceId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-900">
              ✓ Payment method ready to process
            </p>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          Your payment information is secure and encrypted by Square.
        </p>
      </CardContent>
    </Card>
  );
}
