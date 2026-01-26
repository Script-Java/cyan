import { useEffect, useState } from "react";
import { AlertCircle, Edit2, Trash2, Plus, Copy, CheckCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DiscountCode } from "@shared/api";
import { cn } from "@/lib/utils";

interface CreateDiscountForm {
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  min_order_value: string;
  max_uses: string;
  expires_at: string;
  is_active: boolean;
}

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateDiscountForm>({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_value: "0",
    max_uses: "",
    expires_at: "",
    is_active: true,
  });

  const token = localStorage.getItem("authToken");

  // Fetch discount codes
  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/discounts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch discount codes");
      }

      const result = await response.json();
      setDiscounts(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!formData.code.trim()) {
        setError("Code is required");
        return;
      }

      if (!formData.discount_value || parseFloat(formData.discount_value) <= 0) {
        setError("Discount value must be a positive number");
        return;
      }

      const payload: any = {
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        is_active: formData.is_active,
      };

      // Only include optional fields if they have values
      if (formData.description.trim()) {
        payload.description = formData.description;
      }

      if (formData.min_order_value && parseFloat(formData.min_order_value) > 0) {
        payload.min_order_value = parseFloat(formData.min_order_value);
      } else {
        payload.min_order_value = 0;
      }

      if (formData.max_uses && parseInt(formData.max_uses) > 0) {
        payload.max_uses = parseInt(formData.max_uses);
      }

      if (formData.expires_at) {
        payload.expires_at = new Date(formData.expires_at).toISOString();
      }

      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/admin/discounts/${editingId}` : "/api/admin/discounts";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Show detailed validation errors if available
        if (errorData.details && Array.isArray(errorData.details)) {
          const validationErrors = errorData.details
            .map((err: any) => err.message)
            .join(", ");
          throw new Error(validationErrors);
        }
        throw new Error(errorData.error || "Failed to save discount code");
      }

      await fetchDiscounts();
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this discount code?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/discounts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete discount code");
      }

      await fetchDiscounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleEdit = (discount: DiscountCode) => {
    setFormData({
      code: discount.code,
      description: discount.description || "",
      discount_type: discount.discount_type,
      discount_value: discount.discount_value.toString(),
      min_order_value: discount.min_order_value.toString(),
      max_uses: discount.max_uses?.toString() || "",
      expires_at: discount.expires_at ? discount.expires_at.slice(0, 16) : "",
      is_active: discount.is_active,
    });
    setEditingId(discount.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      min_order_value: "0",
      max_uses: "",
      expires_at: "",
      is_active: true,
    });
    setEditingId(null);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpired = (discount: DiscountCode) => {
    if (!discount.expires_at) return false;
    return new Date(discount.expires_at) < new Date();
  };

  const isLimitReached = (discount: DiscountCode) => {
    return discount.max_uses !== null && discount.used_count >= discount.max_uses;
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discount Codes</h1>
            <p className="text-gray-600 mt-2">Create and manage customer discount codes</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="gap-2"
          >
            <Plus size={20} />
            New Discount Code
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {/* Form Section */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">
              {editingId ? "Edit Discount Code" : "Create New Discount Code"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code *
                  </label>
                  <Input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g., SAVE20"
                    disabled={!!editingId}
                    required
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_type: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Value *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount_value}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_value: e.target.value })
                    }
                    placeholder={
                      formData.discount_type === "percentage" ? "e.g., 20" : "e.g., 10.00"
                    }
                    required
                  />
                </div>

                {/* Min Order Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Order Value ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.min_order_value}
                    onChange={(e) =>
                      setFormData({ ...formData, min_order_value: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>

                {/* Max Uses */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Uses (leave empty for unlimited)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.max_uses}
                    onChange={(e) =>
                      setFormData({ ...formData, max_uses: e.target.value })
                    }
                    placeholder="e.g., 100"
                  />
                </div>

                {/* Expires At */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration Date (optional)
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) =>
                      setFormData({ ...formData, expires_at: e.target.value })
                    }
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="e.g., Summer sale promotion"
                  />
                </div>

                {/* Active Status */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-6 border-t">
                <Button type="submit" className="gap-2">
                  {editingId ? "Update" : "Create"} Discount Code
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Discounts List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading discount codes...</div>
          ) : discounts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No discount codes yet. Create your first one!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Uses
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {discounts.map((discount) => (
                    <tr key={discount.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <code className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">
                            {discount.code}
                          </code>
                          <button
                            onClick={() => handleCopyCode(discount.code)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Copy code"
                          >
                            {copiedCode === discount.code ? (
                              <CheckCircle size={16} className="text-green-600" />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {discount.discount_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {discount.discount_type === "percentage"
                          ? `${discount.discount_value}%`
                          : `$${discount.discount_value.toFixed(2)}`}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {discount.max_uses ? (
                          <span
                            className={cn(
                              isLimitReached(discount)
                                ? "text-red-600 font-semibold"
                                : "text-gray-600",
                            )}
                          >
                            {discount.used_count} / {discount.max_uses}
                          </span>
                        ) : (
                          <span className="text-gray-600">{discount.used_count} / ∞</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="space-y-1">
                          <div>
                            <span
                              className={cn(
                                "px-2 py-1 rounded text-xs font-medium",
                                discount.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800",
                              )}
                            >
                              {discount.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          {isLimitReached(discount) && (
                            <div className="text-xs text-red-600 font-semibold">
                              Limit reached
                            </div>
                          )}
                          {isExpired(discount) && (
                            <div className="text-xs text-red-600 font-semibold">
                              Expired
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {discount.expires_at
                          ? new Date(discount.expires_at).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(discount)}
                            className="text-blue-600 hover:text-blue-800 transition"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(discount.id)}
                            className="text-red-600 hover:text-red-800 transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </div>
      </div>
    </AdminLayout>
  );
}
