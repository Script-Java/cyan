import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  subtotal: number;
  tax_amount: number;
  shipping: number;
  discount_amount: number;
  due_date: string;
  status: string;
  shipping_address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  notes?: string;
}

export default function InvoiceCheckout() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid invoice token");
      navigate("/");
      return;
    }

    fetchInvoice();
  }, [token, navigate]);

  const fetchInvoice = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/invoice/${token}`);

      if (!response.ok) {
        throw new Error("Failed to fetch invoice");
      }

      const data = await response.json();
      setInvoice(data.data || data.invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      toast.error("Failed to load invoice");
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!invoice) return;

    try {
      setIsProcessing(true);

      // Create payment session with Square
      const response = await fetch("/api/square/create-payment-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(invoice.total * 100), // Convert to cents
          currency: "USD",
          description: `Invoice #${invoice.invoice_number}`,
          customer_email: invoice.customer_email,
          customer_name: invoice.customer_name,
          invoice_id: invoice.id,
          redirect_url: `${window.location.origin}/invoice/${token}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment");
      }

      const { payment_link } = await response.json();

      // Redirect to Square payment
      if (payment_link) {
        window.location.href = payment_link;
      } else {
        toast.error("Failed to generate payment link");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          </div>
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
              <CardContent className="pt-6">
                <p className="text-center text-gray-600">
                  Invoice not found or has expired
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  const isPaid = invoice.status === "Paid";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Invoice Confirmation */}
          <Card className="mb-6">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="text-2xl">Invoice Confirmation</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Invoice Number</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {invoice.invoice_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Due Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bill To</p>
                  <p className="font-semibold text-gray-900">
                    {invoice.customer_name}
                  </p>
                  <p className="text-sm text-gray-600">{invoice.customer_email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className={`text-lg font-semibold ${
                    isPaid ? "text-green-600" : "text-yellow-600"
                  }`}>
                    {invoice.status}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {invoice.shipping_address && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-900">
                    {invoice.customer_name}
                  </p>
                  {invoice.shipping_address.street && (
                    <p className="text-gray-600">{invoice.shipping_address.street}</p>
                  )}
                  {invoice.shipping_address.city && (
                    <p className="text-gray-600">
                      {invoice.shipping_address.city}
                      {invoice.shipping_address.state && `, ${invoice.shipping_address.state}`}
                      {invoice.shipping_address.zip && ` ${invoice.shipping_address.zip}`}
                    </p>
                  )}
                  {invoice.shipping_address.country && (
                    <p className="text-gray-600">{invoice.shipping_address.country}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoice Totals */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Invoice Totals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ${(Number(invoice.subtotal) || 0).toFixed(2)}
                  </span>
                </div>
                {Number(invoice.tax_amount || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">
                      ${(Number(invoice.tax_amount) || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                {Number(invoice.shipping || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      ${(Number(invoice.shipping) || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                {Number(invoice.discount_amount || 0) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">
                      -${(Number(invoice.discount_amount) || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Amount Due</span>
                  <span className="text-3xl font-bold text-blue-600">
                    ${(Number(invoice.total) || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          {invoice.notes && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-blue-900 mb-2">Notes</p>
                <p className="text-sm text-blue-800">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Payment Status */}
          {isPaid && (
            <Card className="mb-6 bg-green-50 border-green-200">
              <CardContent className="pt-6 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-medium">
                  This invoice has been paid. Thank you!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Payment Button */}
          {!isPaid && (
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-semibold mb-4"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Pay with Square ${(Number(invoice.total) || 0).toFixed(2)}
                </>
              )}
            </Button>
          )}

          {/* Security Notice */}
          {!isPaid && (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Your payment is securely processed by Square
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
