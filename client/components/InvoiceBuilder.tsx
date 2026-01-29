import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, X, Mail } from "lucide-react";
import { toast } from "sonner";

interface LineItem {
  id?: number;
  item_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  tax_enabled?: boolean;
}

interface InvoiceData {
  customer_name: string;
  customer_email: string;
  company?: string;
  billing_address?: any;
  invoice_type: "Standard" | "ArtworkUpload";
  issue_date: string;
  due_date: string;
  notes?: string;
  line_items: LineItem[];
  tax_rate: number;
  shipping: number;
  discount_amount: number;
  discount_type?: "fixed" | "percentage";
}

interface InvoiceBuilderProps {
  initialData?: InvoiceData;
  invoiceId?: number;
  onSave?: (data: InvoiceData) => void;
}

export default function InvoiceBuilder({
  initialData,
  invoiceId,
  onSave,
}: InvoiceBuilderProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState<InvoiceData>(
    initialData || {
      customer_name: "",
      customer_email: "",
      company: "",
      billing_address: {},
      invoice_type: "Standard",
      issue_date: new Date().toISOString().split("T")[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      notes: "",
      line_items: [
        {
          item_name: "",
          description: "",
          quantity: 1,
          unit_price: 0,
          tax_enabled: false,
        },
      ],
      tax_rate: 0,
      shipping: 0,
      discount_amount: 0,
      discount_type: "fixed",
    }
  );

  // Calculate totals
  const subtotal = formData.line_items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  const taxAmount = (subtotal * formData.tax_rate) / 100;
  const total =
    subtotal + taxAmount + formData.shipping - formData.discount_amount;

  const handleLineItemChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const items = [...formData.line_items];
    items[index] = { ...items[index], [field]: value };
    setFormData({ ...formData, line_items: items });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      line_items: [
        ...formData.line_items,
        {
          item_name: "",
          description: "",
          quantity: 1,
          unit_price: 0,
          tax_enabled: false,
        },
      ],
    });
  };

  const removeLineItem = (index: number) => {
    setFormData({
      ...formData,
      line_items: formData.line_items.filter((_, i) => i !== index),
    });
  };

  const handleSave = async (sendNow: boolean = false) => {
    if (!formData.customer_name || !formData.customer_email) {
      toast.error("Please fill in customer name and email");
      return;
    }

    if (formData.line_items.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

    try {
      setIsLoading(true);
      const endpoint = invoiceId
        ? `/api/admin/invoices/${invoiceId}`
        : "/api/admin/invoices";

      const method = invoiceId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save invoice");
      }

      const data = await response.json();
      toast.success(
        invoiceId ? "Invoice updated successfully" : "Invoice created successfully"
      );

      if (sendNow) {
        handleSendInvoice(data.data.id);
      } else {
        setTimeout(() => {
          navigate(`/admin/invoices/${data.data.id}`);
        }, 1000);
      }

      if (onSave) {
        onSave(formData);
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save invoice"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvoice = async (id: number) => {
    try {
      setIsSending(true);
      const response = await fetch(`/api/admin/invoices/${id}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          email_subject: `Invoice #${formData.customer_name}`,
          email_message: "Please find your invoice below. Click the link to pay.",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send invoice");
      }

      toast.success("Invoice sent to customer");
      setTimeout(() => {
        navigate(`/admin/invoices/${id}`);
      }, 1000);
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast.error("Failed to send invoice");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Customer Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <Input
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                value={formData.customer_email}
                onChange={(e) =>
                  setFormData({ ...formData, customer_email: e.target.value })
                }
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <Input
                value={formData.company || ""}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                placeholder="Company Name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date
              </label>
              <Input
                type="date"
                value={formData.issue_date}
                onChange={(e) =>
                  setFormData({ ...formData, issue_date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Type
              </label>
              <select
                value={formData.invoice_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    invoice_type: e.target.value as "Standard" | "ArtworkUpload",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Standard">Standard Invoice</option>
                <option value="ArtworkUpload">
                  Artwork Upload Required
                </option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes / Memo
            </label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Payment terms, special instructions, etc."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {formData.line_items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-end border-b pb-4"
              >
                <Input
                  placeholder="Item name"
                  value={item.item_name}
                  onChange={(e) =>
                    handleLineItemChange(index, "item_name", e.target.value)
                  }
                  className="col-span-4"
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  value={isNaN(item.quantity) ? "" : item.quantity}
                  onChange={(e) =>
                    handleLineItemChange(
                      index,
                      "quantity",
                      e.target.value === "" ? 0 : parseFloat(e.target.value) || 0
                    )
                  }
                  className="col-span-2"
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={isNaN(item.unit_price) ? "" : item.unit_price}
                  onChange={(e) =>
                    handleLineItemChange(
                      index,
                      "unit_price",
                      e.target.value === "" ? 0 : parseFloat(e.target.value) || 0
                    )
                  }
                  className="col-span-2"
                />
                <div className="col-span-2 font-medium">
                  ${(item.quantity * item.unit_price).toFixed(2)}
                </div>
                <button
                  onClick={() => removeLineItem(index)}
                  className="col-span-1 text-red-600 hover:text-red-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <Button
            onClick={addLineItem}
            variant="outline"
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Line Item
          </Button>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Adjustments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Subtotal</p>
              <p className="text-2xl font-bold">${subtotal.toFixed(2)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <Input
                type="number"
                value={formData.tax_rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tax_rate: parseFloat(e.target.value),
                  })
                }
                step="0.01"
              />
              <p className="text-xs text-gray-600 mt-1">
                ${taxAmount.toFixed(2)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipping
              </label>
              <Input
                type="number"
                value={formData.shipping}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shipping: parseFloat(e.target.value),
                  })
                }
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount
              </label>
              <Input
                type="number"
                value={formData.discount_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount_amount: parseFloat(e.target.value),
                  })
                }
                step="0.01"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Total Due</p>
            <p className="text-3xl font-bold text-blue-600">
              ${total.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={() => handleSave(false)}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Draft
        </Button>
        <Button
          onClick={() => handleSave(true)}
          disabled={isLoading || isSending}
          className="bg-green-600 hover:bg-green-700"
        >
          {(isLoading || isSending) && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          <Mail className="w-4 h-4 mr-2" />
          Save & Send
        </Button>
        <Button
          onClick={() => navigate("/admin/invoices")}
          variant="outline"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
