import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  applicationId,
}: SquarePaymentFormProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [appId, setAppId] = useState<string>("");
  const [web, setWeb] = useState<any>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardPaymentMethodRef = useRef<any>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  // First effect: Fetch and set the appId
  useEffect(() => {
    const fetchAppId = async () => {
      if (applicationId) {
        setAppId(applicationId);
      } else {
        try {
          const response = await fetch("/api/square/config");
          const data = await response.json();
          setAppId(data.applicationId || "sq0idp-aI75bRHWpnYqioPYqvKvsw");
        } catch (error) {
          console.error("Failed to fetch Square config:", error);
          setAppId("sq0idp-aI75bRHWpnYqioPYqvKvsw");
        }
      }
    };

    fetchAppId();
  }, [applicationId]);

  // Second effect: Load the script only after appId is set
  useEffect(() => {
    if (!appId) return;

    // Load Square Web Payments SDK from CDN
    const script = document.createElement("script");
    script.src = "https://sandbox.web.squarecdn.com/v1/square.js";
    script.async = true;

    const handleScriptLoad = async () => {
      try {
        if ((window as any).Square) {
          const webInstance = await (window as any).Square.payments(appId, "us");
          setWeb(webInstance);

          // Create card payment method
          const cardPaymentMethod = await webInstance.cardPaymentMethod();
          cardPaymentMethodRef.current = cardPaymentMethod;

          // Attach card payment method to the DOM
          if (cardContainerRef.current) {
            await cardPaymentMethod.attach(cardContainerRef.current);
          }

          setIsSDKLoaded(true);
        } else {
          throw new Error("Square SDK not loaded");
        }
      } catch (error) {
        console.error("Failed to initialize Square Web Payments:", error);
        toast.error("Payment system failed to load. Please try again.");
      }
    };

    script.onload = handleScriptLoad;
    script.onerror = () => {
      console.error("Failed to load Square SDK script");
      toast.error("Failed to load payment form. Please refresh the page.");
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [appId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!web || !cardPaymentMethodRef.current) return;

    // Validate form data
    if (!formData.firstName || !formData.lastName || !formData.cardNumber || !formData.expiry || !formData.cvv) {
      toast.error("Please fill in all payment fields");
      return;
    }

    setIsProcessing(true);
    try {
      // Request a payment token from the card payment method
      const result = await web.requestCardPaymentMethod({
        amount: Math.round(amount * 100),
        currency: "USD",
        contact: {
          givenName: formData.firstName,
          familyName: formData.lastName,
          email: customerEmail,
        },
      });

      if (result.status === "SUCCESS") {
        const token = result.details.payment.token.token;

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

        toast.success("Payment successful!");
        onPaymentSuccess(token);
      } else {
        throw new Error("Payment request was not successful");
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
      <form onSubmit={handlePaymentSubmit} className="space-y-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-2">Payment Details</h3>
            <p className="text-white/60 text-sm">
              Amount: ${(amount / 100).toFixed(2)}
            </p>
          </div>

          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-white mb-2">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  className="bg-black/40 border border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-white mb-2">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  className="bg-black/40 border border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>
            </div>

            {/* Card Payment Method Container */}
            <div>
              <Label className="text-white mb-2">Card Details *</Label>
              <div className="mb-6 p-4 bg-black/30 rounded-lg border border-white/10">
                <div ref={cardContainerRef} id="square-card-container" />
              </div>
            </div>

            {/* Additional Manual Card Fields (fallback/display) */}
            <div>
              <Label htmlFor="cardNumber" className="text-white mb-2">
                Card Number *
              </Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                type="text"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="4111 1111 1111 1111"
                maxLength="19"
                className="bg-black/40 border border-white/20 text-white placeholder:text-white/40 font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry" className="text-white mb-2">
                  Expiry Date (MM/YY) *
                </Label>
                <Input
                  id="expiry"
                  name="expiry"
                  type="text"
                  value={formData.expiry}
                  onChange={handleInputChange}
                  placeholder="12/25"
                  maxLength="5"
                  className="bg-black/40 border border-white/20 text-white placeholder:text-white/40 font-mono"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cvv" className="text-white mb-2">
                  CVV *
                </Label>
                <Input
                  id="cvv"
                  name="cvv"
                  type="text"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  maxLength="4"
                  className="bg-black/40 border border-white/20 text-white placeholder:text-white/40 font-mono"
                  required
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isProcessing || isLoading}
            className="w-full bg-[#FFD713] hover:bg-[#FFD713]/90 text-black font-bold py-3 rounded-lg transition-all mt-6"
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

      <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-200">
          Test card: <span className="font-mono">4111 1111 1111 1111</span> with any future date (MM/YY) and any CVV
        </p>
      </div>
    </div>
  );
}
