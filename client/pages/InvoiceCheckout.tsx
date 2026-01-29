import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function InvoiceCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);

  const token = searchParams.get("invoiceToken");
  const amount = searchParams.get("amount");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        if (!token) {
          throw new Error("Invalid invoice link");
        }

        const response = await fetch(`/api/invoice/${token}`);
        if (!response.ok) {
          throw new Error("Invoice not found");
        }

        const data = await response.json();
        setInvoice(data.data);
        setEmail(data.data.customer_email);
      } catch (error) {
        console.error("Error fetching invoice:", error);
        toast.error("Invoice not found or has expired");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchInvoice();
    }
  }, [token]);

  const handlePaymentSuccess = async () => {
    try {
      setIsProcessing(true);

      // Mark invoice as paid
      // This would be done via webhook normally
      // Update order status
      const response = await fetch("/api/square/confirm-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: invoice.id,
          invoiceToken: token,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to confirm payment");
      }

      toast.success("Payment received! Your invoice is now marked as paid.");

      // Check if customer needs account creation
      const authToken = localStorage.getItem("auth_token");
      if (!authToken) {
        // Offer account creation
        setTimeout(() => {
          navigate("/auth/create-account?email=" + encodeURIComponent(email));
        }, 2000);
      } else {
        // Redirect to invoice detail
        setTimeout(() => {
          navigate(`/invoice/${token}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </main>
      </>
    );
  }

  if (!invoice) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-2xl mx-auto px-4 py-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600 mb-4">
                  Invoice not found or has expired
                </p>
                <Button onClick={() => navigate("/")} className="w-full">
                  Return Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  if (accountCreated) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-2xl mx-auto px-4 py-8">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="text-5xl">✓</div>
                <h2 className="text-2xl font-bold text-green-900">
                  Payment Received!
                </h2>
                <p className="text-green-800">
                  Your invoice has been marked as paid. A confirmation email
                  has been sent to {email}.
                </p>
                <p className="text-sm text-green-700 pt-4">
                  Check your email to set up your account and access your
                  orders anytime.
                </p>
                <Button
                  onClick={() => navigate("/")}
                  className="w-full bg-green-600 hover:bg-green-700 mt-4"
                >
                  Return Home
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
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Invoice Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Invoice {invoice.invoice_number}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer</span>
                  <span className="font-medium">{invoice.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium text-lg">
                    ${invoice.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date</span>
                  <span className="font-medium">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount to Pay
                </label>
                <div className="text-3xl font-bold text-blue-600">
                  ${invoice.total.toFixed(2)}
                </div>
              </div>

              {/* Square Payment Form would go here */}
              <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-600">
                <p className="mb-4">Square payment form would be integrated here</p>
                <Button
                  onClick={handlePaymentSuccess}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
                >
                  {isProcessing && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Complete Payment
                </Button>
              </div>

              <p className="text-xs text-gray-600 text-center">
                Secure payment powered by Square. Your payment information is
                encrypted and secure.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
