import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, Upload } from "lucide-react";
import { toast } from "sonner";

interface Invoice {
  id: number;
  invoice_number: string;
  status: string;
  total: number;
  subtotal: number;
  tax_amount: number;
  shipping: number;
  discount_amount: number;
  issue_date: string;
  due_date: string;
  customer_name: string;
  customer_email: string;
  company?: string;
  billing_address?: any;
  invoice_type: string;
  notes?: string;
  line_items: any[];
  artwork: any[];
}

export default function CustomerInvoiceView() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoice/${token}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              `Invoice not found (${response.status})`,
          );
        }

        const data = await response.json();
        if (!data.data) {
          throw new Error("Invalid response format");
        }
        setInvoice(data.data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Invoice not found or has expired";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchInvoice();
    }
  }, [token]);

  const handleArtworkUpload = async () => {
    if (!artworkFile || !invoice) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", artworkFile);

      const response = await fetch(
        `/api/admin/invoices/${invoice.id}/artwork`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("Failed to upload artwork");
      }

      toast.success("Artwork uploaded successfully");
      setArtworkFile(null);
      // Refresh invoice data
      const invoiceResponse = await fetch(`/api/invoice/${token}`);
      const data = await invoiceResponse.json();
      setInvoice(data.data);
    } catch (error) {
      console.error("Error uploading artwork:", error);
      toast.error("Failed to upload artwork");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePayment = () => {
    if (!invoice || !token) return;
    navigate(`/invoice/${token}/checkout`);
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
        <main className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 mb-4">
                Invoice not found or has expired
              </p>
              <Button onClick={() => navigate("/")} className="w-full">
                Return Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  const isPaid = invoice.status === "Paid";
  const isCanceled = invoice.status === "Canceled";
  const isOverdue = new Date(invoice.due_date) < new Date();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {invoice.invoice_number}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Issued: {new Date(invoice.issue_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-medium ${
                      isPaid
                        ? "text-green-600"
                        : isCanceled
                          ? "text-red-600"
                          : isOverdue
                            ? "text-red-600"
                            : "text-yellow-600"
                    }`}
                  >
                    {invoice.status}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ${(Number(invoice.total) || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Status Messages */}
          {isPaid && (
            <Card className="mb-6 bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <p className="text-green-800 font-medium">
                  ✓ This invoice has been paid. Thank you!
                </p>
              </CardContent>
            </Card>
          )}

          {isCanceled && (
            <Card className="mb-6 bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <p className="text-red-800 font-medium">
                  This invoice has been canceled. Please contact support for
                  more information.
                </p>
              </CardContent>
            </Card>
          )}

          {isOverdue && !isPaid && (
            <Card className="mb-6 bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <p className="text-yellow-800 font-medium">
                  ⚠ This invoice is overdue. Please pay as soon as possible.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Artwork Upload */}
          {invoice.invoice_type === "ArtworkUpload" &&
            invoice.artwork.length === 0 &&
            !isPaid && (
              <Card className="mb-6 bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">Upload Artwork</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Please upload your artwork file before making payment.
                  </p>
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <input
                      type="file"
                      onChange={(e) =>
                        setArtworkFile(e.target.files?.[0] || null)
                      }
                      accept="image/*,.pdf"
                      className="hidden"
                      id="artwork-input"
                    />
                    <label
                      htmlFor="artwork-input"
                      className="cursor-pointer text-blue-600 font-medium"
                    >
                      Click to upload or drag and drop
                    </label>
                    <p className="text-xs text-gray-600 mt-2">
                      PNG, JPG, PDF up to 50MB
                    </p>
                  </div>
                  {artworkFile && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Selected: {artworkFile.name}
                      </p>
                      <Button
                        onClick={handleArtworkUpload}
                        disabled={isUploading}
                        className="w-full mt-2"
                      >
                        {isUploading && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Upload Artwork
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          {/* Line Items */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                  <div>
                    <p className="text-sm text-gray-600">Bill To</p>
                    <p className="font-semibold">{invoice.customer_name}</p>
                    {invoice.company && (
                      <p className="text-sm text-gray-600">{invoice.company}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {invoice.customer_email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Due Date</p>
                    <p className="font-semibold">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Line Items Table */}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-semibold">
                        Description
                      </th>
                      <th className="text-center py-2 font-semibold w-20">
                        Qty
                      </th>
                      <th className="text-right py-2 font-semibold w-24">
                        Price
                      </th>
                      <th className="text-right py-2 font-semibold w-24">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.line_items.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-3">{item.item_name}</td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-right">
                          ${(Number(item.unit_price) || 0).toFixed(2)}
                        </td>
                        <td className="py-3 text-right font-medium">
                          $
                          {(
                            Number(
                              item.line_total ||
                                item.quantity * item.unit_price,
                            ) || 0
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${(Number(invoice.subtotal) || 0).toFixed(2)}</span>
                  </div>
                  {Number(invoice.tax_amount || 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>
                        ${(Number(invoice.tax_amount) || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {Number(invoice.shipping || 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>${(Number(invoice.shipping) || 0).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(invoice.discount_amount || 0) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>
                        -${(Number(invoice.discount_amount) || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-2 font-bold flex justify-between">
                    <span>Total Due:</span>
                    <span>${(Number(invoice.total) || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {!isPaid && !isCanceled && (
            <div className="flex gap-3">
              <Button
                onClick={handlePayment}
                disabled={
                  invoice.invoice_type === "ArtworkUpload" &&
                  invoice.artwork.length === 0
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-6 text-lg"
              >
                Pay ${(Number(invoice.total) || 0).toFixed(2)}
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
