import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

declare const window: any;

interface SquareWebPaymentFormProps {
  applicationId: string;
  amount: number;
  onPaymentSuccess: (token: string) => void;
  onPaymentError: (error: string) => void;
  isProcessing?: boolean;
}

export default function SquareWebPaymentForm({
  applicationId,
  amount,
  onPaymentSuccess,
  onPaymentError,
  isProcessing = false,
}: SquareWebPaymentFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeSquarePayments = async () => {
      try {
        // Wait for Square SDK to load
        let attempts = 0;
        while (!window.Square && attempts < 30) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          attempts++;
        }

        if (!window.Square) {
          throw new Error("Square SDK failed to load");
        }

        console.log("Square SDK loaded successfully");

        // Initialize Web Payments
        const payments = window.Square.payments(applicationId);

        // Create Card Payment Method
        const card = await payments.card();
        await card.attach("#square-card-container");

        cardRef.current = {
          payments,
          card,
        };

        setIsInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize Square:", error);
        let errorMsg =
          error instanceof Error ? error.message : "Failed to load payment form";

        // Check if it's a CORS or authentication error
        if (
          errorMsg.includes("403") ||
          errorMsg.includes("Invalid JSON") ||
          errorMsg.includes("pci-connect")
        ) {
          errorMsg =
            "Square SDK authentication failed. Please verify your Application ID is correct and matches your Square account configuration.";
        }

        // Log more detailed error info for debugging
        if (error instanceof Error) {
          console.error("Square SDK Error Details:", {
            message: error.message,
            stack: error.stack,
          });
        }

        onPaymentError(errorMsg);
        setIsLoading(false);
      }
    };

    if (applicationId) {
      initializeSquarePayments();
    }
  }, [applicationId, onPaymentError]);

  const handleRequestCardPayment = async () => {
    if (!cardRef.current?.card) {
      onPaymentError("Payment form not initialized");
      return;
    }

    try {
      // Tokenize the card
      const result = await cardRef.current.card.tokenize();

      console.log("Card tokenization result:", result);

      if (result.status === "OK") {
        if (!result.token) {
          throw new Error("No token returned from Square");
        }
        console.log("Card tokenized successfully, token:", result.token.substring(0, 20) + "...");
        onPaymentSuccess(result.token);
      } else if (result.errors && result.errors.length > 0) {
        const errorMessages = result.errors
          .map((e: any) => e.message || e.detail)
          .join(", ");
        console.error("Tokenization errors:", result.errors);
        onPaymentError(errorMessages);
      } else {
        onPaymentError("Failed to process card");
      }
    } catch (error) {
      console.error("Tokenization error:", error);
      let errorMsg =
        error instanceof Error ? error.message : "Payment processing failed";

      // Check for specific error patterns
      if (errorMsg.includes("403") || errorMsg.includes("Unauthorized")) {
        errorMsg =
          "Authentication error with Square. Please verify your Application ID configuration in the Square Dashboard.";
      } else if (errorMsg.includes("Invalid") || errorMsg.includes("malformed")) {
        errorMsg = "Invalid card information. Please check your card details and try again.";
      }

      onPaymentError(errorMsg);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading secure payment form...</span>
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
          <p className="text-sm text-blue-900 font-medium">
            Amount to charge: ${amount.toFixed(2)}
          </p>
          <p className="text-xs text-blue-700 mt-2">
            Your payment information is secure and encrypted by Square.
          </p>
        </div>

        {/* Square Card Container */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Card Details *
          </label>
          <div
            id="square-card-container"
            ref={containerRef}
            className="w-full border border-gray-300 rounded-lg p-4 bg-white"
            style={{ minHeight: "120px" }}
          />
        </div>

        {/* Payment Button */}
        <button
          onClick={handleRequestCardPayment}
          disabled={isProcessing || !isInitialized}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Payments are securely processed through Square. Your card details are never stored on our servers.
        </p>
      </CardContent>
    </Card>
  );
}
