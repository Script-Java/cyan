import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Package,
  Eye,
  BarChart3,
  DollarSign,
  Users,
  BookOpen,
  FileText,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

interface ShippingOption {
  id: number;
  name: string;
  description?: string;
  cost: number;
  processing_time_days: number;
  estimated_delivery_days_min: number;
  estimated_delivery_days_max: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: string;
  description: string;
  cost: number | "";
  processing_time_days: number | "";
  estimated_delivery_days_min: number | "";
  estimated_delivery_days_max: number | "";
  is_active: boolean;
  display_order: number | "";
}

const initialFormData: FormData = {
  name: "",
  description: "",
  cost: "",
  processing_time_days: "",
  estimated_delivery_days_min: "",
  estimated_delivery_days_max: "",
  is_active: true,
  display_order: "",
};

export default function AdminShipping() {
  const navigate = useNavigate();
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }

    fetchShippingOptions();
  }, [navigate]);

  const fetchShippingOptions = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/shipping-options", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch shipping options");
      }

      const data = await response.json();
      setShippingOptions(data.data || []);
    } catch (error) {
      console.error("Error fetching shipping options:", error);
      toast.error("Failed to load shipping options");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (option?: ShippingOption) => {
    if (option) {
      setEditingId(option.id);
      setFormData({
        name: option.name,
        description: option.description || "",
        cost: option.cost,
        processing_time_days: option.processing_time_days,
        estimated_delivery_days_min: option.estimated_delivery_days_min,
        estimated_delivery_days_max: option.estimated_delivery_days_max,
        is_active: option.is_active,
        display_order: option.display_order,
      });
    } else {
      setEditingId(null);
      setFormData(initialFormData);
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (
      [
        "cost",
        "processing_time_days",
        "estimated_delivery_days_min",
        "estimated_delivery_days_max",
        "display_order",
      ].includes(name)
    ) {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return "Name is required";
    if (formData.cost === "") return "Cost is required";
    if (formData.cost < 0) return "Cost must be non-negative";
    if (formData.processing_time_days === "")
      return "Processing time is required";
    if (formData.processing_time_days < 0)
      return "Processing time must be non-negative";
    if (formData.estimated_delivery_days_min === "")
      return "Min delivery days is required";
    if (formData.estimated_delivery_days_min < 1)
      return "Min delivery days must be at least 1";
    if (formData.estimated_delivery_days_max === "")
      return "Max delivery days is required";
    if (formData.estimated_delivery_days_max < 1)
      return "Max delivery days must be at least 1";
    if (
      formData.estimated_delivery_days_max <
      formData.estimated_delivery_days_min
    )
      return "Max delivery days must be >= min delivery days";
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const url = editingId
        ? `/api/admin/shipping-options/${editingId}`
        : "/api/admin/shipping-options";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          ...(formData.description && {
            description: formData.description.trim(),
          }),
          cost: Number(formData.cost),
          processing_time_days: Number(formData.processing_time_days),
          estimated_delivery_days_min: Number(
            formData.estimated_delivery_days_min,
          ),
          estimated_delivery_days_max: Number(
            formData.estimated_delivery_days_max,
          ),
          is_active: formData.is_active,
          display_order:
            formData.display_order === "" ? 0 : Number(formData.display_order),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Format detailed validation errors if available
        if (errorData.details && Array.isArray(errorData.details)) {
          const detailMessages = errorData.details
            .map((err: any) => {
              const fieldPath = err.path?.join(".") || "field";
              return `${fieldPath}: ${err.message}`;
            })
            .join(", ");
          throw new Error(detailMessages);
        }

        throw new Error(errorData.error || "Failed to save shipping option");
      }

      toast.success(
        editingId
          ? "Shipping option updated successfully"
          : "Shipping option created successfully",
      );
      handleCloseDialog();
      fetchShippingOptions();
    } catch (error) {
      console.error("Error saving shipping option:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save shipping option",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `/api/admin/shipping-options/${deletingId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete shipping option");
      }

      toast.success("Shipping option deleted successfully");
      setShowDeleteDialog(false);
      setDeletingId(null);
      fetchShippingOptions();
    } catch (error) {
      console.error("Error deleting shipping option:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete shipping option",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Header Section */}
        <div className="border-b border-gray-200 bg-white">
          <div className="px-4 sm:px-10 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
                    Shipping Options
                  </h1>
                  <p className="text-gray-600">
                    Manage shipping methods, costs, and delivery times
                  </p>
                </div>
                <Button
                  onClick={() => handleOpenDialog()}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Shipping Option
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="min-h-screen text-gray-900 px-4 sm:px-10 py-12">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Main Content Container */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  <p className="mt-2 text-gray-600">
                    Loading shipping options...
                  </p>
                </div>
              ) : shippingOptions.length === 0 ? (
                <div className="p-8 text-center">
                  <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    No Shipping Options
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Create your first shipping option to get started
                  </p>
                  <Button
                    onClick={() => handleOpenDialog()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Create Shipping Option
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 bg-gray-50 hover:bg-gray-50">
                        <TableHead className="text-gray-900">Name</TableHead>
                        <TableHead className="text-gray-900">Cost</TableHead>
                        <TableHead className="text-gray-900">
                          Processing Time
                        </TableHead>
                        <TableHead className="text-gray-900">
                          Est. Delivery
                        </TableHead>
                        <TableHead className="text-gray-900">Status</TableHead>
                        <TableHead className="text-gray-900">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shippingOptions.map((option) => (
                        <TableRow
                          key={option.id}
                          className="border-gray-200 hover:bg-gray-50"
                        >
                          <TableCell className="font-medium text-gray-900">
                            <div>
                              <p>{option.name}</p>
                              {option.description && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {option.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-900">
                            ${option.cost.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {option.processing_time_days} day
                            {option.processing_time_days !== 1 ? "s" : ""}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {option.estimated_delivery_days_min}-
                            {option.estimated_delivery_days_max} days
                          </TableCell>
                          <TableCell>
                            {option.is_active ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                Inactive
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-900">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDialog(option)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeletingId(option.id);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-white border-gray-200 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {editingId ? "Edit Shipping Option" : "Create Shipping Option"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingId
                ? "Update the shipping option details below"
                : "Add a new shipping option with cost and delivery time information"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <Label className="text-gray-900 mb-2 block">
                Option Name <span className="text-red-600">*</span>
              </Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Standard Shipping, Express, Overnight"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
              />
            </div>

            {/* Description */}
            <div>
              <Label className="text-gray-900 mb-2 block">Description</Label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g., Delivery within 5-7 business days"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            {/* Cost */}
            <div>
              <Label className="text-gray-900 mb-2 block">
                Shipping Cost <span className="text-red-600">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-600">$</span>
                <Input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 pl-7"
                />
              </div>
            </div>

            {/* Processing Time */}
            <div>
              <Label className="text-gray-900 mb-2 block">
                Processing Time <span className="text-red-600">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  name="processing_time_days"
                  value={formData.processing_time_days}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                />
                <span className="text-gray-600">days</span>
              </div>
            </div>

            {/* Estimated Delivery Days */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-900 mb-2 block">
                  Min Delivery Days <span className="text-red-600">*</span>
                </Label>
                <Input
                  type="number"
                  name="estimated_delivery_days_min"
                  value={formData.estimated_delivery_days_min}
                  onChange={handleInputChange}
                  placeholder="1"
                  min="1"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <div>
                <Label className="text-gray-900 mb-2 block">
                  Max Delivery Days <span className="text-red-600">*</span>
                </Label>
                <Input
                  type="number"
                  name="estimated_delivery_days_max"
                  value={formData.estimated_delivery_days_max}
                  onChange={handleInputChange}
                  placeholder="7"
                  min="1"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Display Order */}
            <div>
              <Label className="text-gray-900 mb-2 block">Display Order</Label>
              <Input
                type="number"
                name="display_order"
                value={formData.display_order}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-600 mt-1">
                Lower numbers appear first
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-gray-300 bg-white cursor-pointer"
              />
              <Label
                htmlFor="is_active"
                className="text-gray-900 cursor-pointer"
              >
                Active (available for customers)
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Delete Shipping Option
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete this shipping option? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSaving ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
