import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Copy, Send, Edit2, X, Clock, Check } from "lucide-react";
import { toast } from "sonner";

export default function AdminInvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/admin/invoices/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Invoice not found");
        }

        const data = await response.json();
        setInvoice(data.data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
        toast.error("Failed to load invoice");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const handleCopyLink = async () => {
    try {
      const response = await fetch(`/api/admin/invoices/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();
      const paymentLink = `https://stickyslap.app/invoice/${data.data.token}`;
      
      await navigator.clipboard.writeText(paymentLink);
      toast.success("Payment link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
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
          <div className="max-w-4xl mx-auto px-4 py-8">
            <p>Invoice not found</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {invoice.invoice_number}
              </h1>
              <p className="text-gray-600 mt-1">
                {invoice.customer_name}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${
                invoice.status === "Paid"
                  ? "text-green-600"
                  : invoice.status === "Draft"
                  ? "text-gray-600"
                  : "text-yellow-600"
              }`}>
                {invoice.status}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                ${invoice.total.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Issue Date</p>
                <p className="font-semibold">
                  {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : "N/A"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-semibold">
                  {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/A"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-semibold">{invoice.invoice_type}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-sm">{invoice.customer_email}</p>
              </CardContent>
            </Card>
          </div>

          {/* Line Items */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Description</th>
                    <th className="text-center py-2 w-20">Qty</th>
                    <th className="text-right py-2 w-24">Price</th>
                    <th className="text-right py-2 w-24">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.line_items?.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b">
                      <td className="py-3">{item.item_name}</td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">${(item.unit_price || 0).toFixed(2)}</td>
                      <td className="py-3 text-right font-medium">
                        ${(item.amount || item.quantity * item.unit_price || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${invoice.tax_amount.toFixed(2)}</span>
                  </div>
                )}
                {invoice.shipping > 0 && (
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>${invoice.shipping.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 font-bold flex justify-between">
                  <span>Total:</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          {invoice.activity?.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoice.activity?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-3 pb-4 border-b last:border-b-0">
                      <div className="flex-shrink-0">
                        {item.activity_type === "paid" ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.description}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            {invoice.status === "Draft" && (
              <Button
                onClick={() => navigate(`/admin/invoices/${id}/edit`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Invoice
              </Button>
            )}
            {invoice.status === "Draft" && (
              <Button
                onClick={() => {
                  // Send invoice logic
                  toast.success("Invoice sent");
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Send to Customer
              </Button>
            )}
            <Button
              onClick={handleCopyLink}
              variant="outline"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Payment Link
            </Button>
            {invoice.status !== "Paid" && invoice.status !== "Canceled" && (
              <Button
                onClick={() => navigate(`/admin/invoices`)}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel Invoice
              </Button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
