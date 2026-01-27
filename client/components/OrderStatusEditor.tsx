import { useState } from "react";
import { X, Loader } from "lucide-react";

interface OrderStatusEditorProps {
  orderId: number;
  currentStatus: string;
  currentTrackingNumber?: string;
  currentTrackingCarrier?: string;
  currentTrackingUrl?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "orange" },
  { value: "processing", label: "Processing", color: "yellow" },
  { value: "printing", label: "Printing", color: "purple" },
  {
    value: "preparing for shipping",
    label: "Preparing for Shipping",
    color: "blue",
  },
  { value: "in transit", label: "In Transit", color: "blue" },
  { value: "shipped", label: "Shipped", color: "green" },
  { value: "delivered", label: "Delivered", color: "cyan" },
  { value: "cancelled", label: "Cancelled", color: "red" },
];

export default function OrderStatusEditor({
  orderId,
  currentStatus,
  currentTrackingNumber,
  currentTrackingCarrier,
  currentTrackingUrl,
  onClose,
  onSuccess,
}: OrderStatusEditorProps) {
  const [status, setStatus] = useState(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState(
    currentTrackingNumber || "",
  );
  const [trackingCarrier, setTrackingCarrier] = useState(
    currentTrackingCarrier || "",
  );
  const [trackingUrl, setTrackingUrl] = useState(currentTrackingUrl || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          tracking_number: trackingNumber || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update order");
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/10 rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            Update Order #{orderId}
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Order Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-gray-900"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tracking Number */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tracking Number
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g., 1Z999AA10123456784"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-500/20 border border-green-500/30 rounded text-green-200 text-sm">
              Order updated successfully!
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              {isLoading ? "Updating..." : "Update Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
