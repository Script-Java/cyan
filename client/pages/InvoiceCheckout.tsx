import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  due_date: string;
  status: string;
  line_items?: any[];
}

export default function InvoiceCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    amount: 0,
  });

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error("Invalid invoice token");
      navigate("/");
      return;
    }

    fetchInvoice();
  }, [token]);

  const fetchInvoice = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/invoice/${token}`);

      if (!response.ok) {
        throw new Error("Failed to fetch invoice");
      }

      const data = await response.json();
      setInvoice(data.invoice);
      setFormData({
        email: data.invoice.customer_email || "",
        amount: data.invoice.total,
      });
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
          customer_email: formData.email,
          customer_name: invoice.customer_name,
          invoice_id: invoice.id,
          line_items: invoice.line_items?.map((item) => ({
            name: item.item_name,
            quantity: item.quantity,
            price_money: {
              amount: Math.round(item.unit_price * 100),
              currency: "USD",
            },
          })) || [
            {
              name: `Invoice #${invoice.invoice_number}`,
              quantity: 1,
              price_money: {
                amount: Math.round(invoice.total * 100),
                currency: "USD",
              },
            },
          ],
          redirect_url: `${window.location.origin}/checkout-success/${invoice.id}`,
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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Invoice Summary */}
              <div className="border-b pb-6">
                <h3 className="font-semibold text-lg mb-4">Invoice Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice #</span>
                    <span className="font-medium">{invoice.invoice_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer</span>
                    <span className="font-medium">{invoice.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date</span>
                    <span className="font-medium">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="font-medium">{invoice.status}</span>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              {invoice.line_items && invoice.line_items.length > 0 && (
                <div className="border-b pb-6">
                  <h3 className="font-semibold text-lg mb-4">Items</h3>
                  <div className="space-y-2 text-sm">
                    {invoice.line_items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-600">
                          {item.item_name} x {item.quantity}
                        </span>
                        <span className="font-medium">
                          ${(Number(item.amount || item.quantity * item.unit_price) || 0).toFixed(
                            2
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="your@email.com"
                  />
                </div>

                {/* Payment Amount */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total Amount Due
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${(Number(invoice.total) || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Square Payment Form Placeholder */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-500 mb-4">
                    Payment form will be displayed here
                  </p>
                  <p className="text-xs text-gray-400">
                    Secure payment powered by Square
                  </p>
                </div>

                {/* Pay Button */}
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay $${(Number(invoice.total) || 0).toFixed(2)}`
                  )}
                </Button>

                {/* Security Notice */}
                <p className="text-xs text-center text-gray-500">
                  Your payment information is encrypted and secure
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Need Help?</h4>
            <p className="text-sm text-blue-800">
              If you have any questions about this invoice, please contact us at
              support@stickyslap.app
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
