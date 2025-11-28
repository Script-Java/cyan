import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface SimplePaymentFormProps {
  amount: number;
  onPaymentSuccess: (token: string, cardData: any) => void;
  onPaymentError: (error: string) => void;
  isProcessing?: boolean;
}

export default function SimplePaymentForm({
  amount,
  onPaymentSuccess,
  onPaymentError,
  isProcessing = false,
}: SimplePaymentFormProps) {
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!cardholderName.trim()) {
      onPaymentError("Cardholder name is required");
      return;
    }

    if (!cardNumber.trim() || cardNumber.length < 13) {
      onPaymentError("Valid card number is required (min 13 digits)");
      return;
    }

    if (!expiryMonth || !expiryYear) {
      onPaymentError("Card expiry date is required");
      return;
    }

    if (!cvv || cvv.length < 3) {
      onPaymentError("Valid CVV is required (min 3 digits)");
      return;
    }

    // For demo purposes, create a token-like string
    // In production, this would be sent to Square backend for tokenization
    const mockToken = `tok_${Date.now()}`;

    onPaymentSuccess(mockToken, {
      cardholderName,
      cardNumber: `****${cardNumber.slice(-4)}`,
      expiryMonth,
      expiryYear,
      amount,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 font-medium">
              Amount to charge: ${amount.toFixed(2)}
            </p>
          </div>

          {/* Cardholder Name */}
          <div>
            <Label htmlFor="cardholderName">Cardholder Name *</Label>
            <Input
              id="cardholderName"
              placeholder="John Doe"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              disabled={isProcessing}
              required
            />
          </div>

          {/* Card Number */}
          <div>
            <Label htmlFor="cardNumber">Card Number *</Label>
            <Input
              id="cardNumber"
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ""))}
              disabled={isProcessing}
              required
            />
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="expiryMonth">Month *</Label>
              <Input
                id="expiryMonth"
                placeholder="MM"
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(e.target.value.slice(0, 2))}
                maxLength={2}
                disabled={isProcessing}
                required
              />
            </div>

            <div>
              <Label htmlFor="expiryYear">Year *</Label>
              <Input
                id="expiryYear"
                placeholder="YY"
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value.slice(0, 2))}
                maxLength={2}
                disabled={isProcessing}
                required
              />
            </div>

            <div>
              <Label htmlFor="cvv">CVV *</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.slice(0, 4))}
                maxLength={4}
                disabled={isProcessing}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mt-6"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Complete Payment"
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Payment information will be securely processed through Square.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
