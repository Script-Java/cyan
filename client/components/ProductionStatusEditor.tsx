import { useState } from "react";
import { Printer, Package, Truck, X, Loader } from "lucide-react";

interface ProductionStatusEditorProps {
  orderId: number;
  currentStatus: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PRODUCTION_STATUSES = [
  {
    value: "printing",
    label: "Printing Now",
    icon: Printer,
    color: "orange",
    description: "Order is currently being printed",
  },
  {
    value: "cutting",
    label: "Cutting",
    icon: Package,
    color: "cyan",
    description: "Order is being cut and is ready for shipping",
  },
  {
    value: "shipped",
    label: "Shipped",
    icon: Truck,
    color: "green",
    description: "Order has been shipped to customer",
  },
];

export default function ProductionStatusEditor({
  orderId,
  currentStatus,
  onClose,
  onSuccess,
}: ProductionStatusEditorProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (newStatus: string) => {
    setError("");
    setSuccess(false);
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
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update production status");
      }

      setStatus(newStatus);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Production Status
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Status */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Current Status</p>
            <p className="text-lg font-semibold text-gray-900">{status}</p>
          </div>

          {/* Status Options */}
          <div className="space-y-3 mb-6">
            {PRODUCTION_STATUSES.map((option) => {
              const Icon = option.icon;
              const isSelected = status === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => handleSubmit(option.value)}
                  disabled={isLoading || isSelected}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  } ${isLoading && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        isSelected
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="flex items-center justify-center">
                        {isLoading ? (
                          <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
              <p className="text-sm text-green-700">Status updated successfully!</p>
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> The dashboard production status will update automatically when you change the status.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
