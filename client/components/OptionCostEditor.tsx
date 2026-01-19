import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";

interface Option {
  option_id?: string;
  option_name?: string;
  name?: string;
  option_value?: string;
  value?: string;
  price?: number;
  modifier_price?: number;
}

interface OptionCostEditorProps {
  itemId: number;
  orderId: number;
  productName: string;
  options: Option[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function OptionCostEditor({
  itemId,
  orderId,
  productName,
  options,
  onClose,
  onSuccess,
}: OptionCostEditorProps) {
  const [editedOptions, setEditedOptions] = useState<Option[]>(
    options.map((opt) => ({
      ...opt,
      price: opt.price || opt.modifier_price || 0,
    }))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePriceChange = (index: number, newPrice: string) => {
    const numPrice = parseFloat(newPrice) || 0;
    const updated = [...editedOptions];
    updated[index].price = numPrice;
    setEditedOptions(updated);
  };

  const handleSave = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/api/admin/update-order-item-options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          itemId,
          options: editedOptions.map((opt) => ({
            option_id: opt.option_id,
            option_name: opt.option_name || opt.name,
            option_value: opt.option_value || opt.value,
            price: opt.price,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Failed to update option costs"
        );
      }

      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Option Costs</h2>
            <p className="text-sm text-gray-600 mt-1">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {editedOptions.length > 0 ? (
            <div className="space-y-4">
              {editedOptions.map((option, idx) => {
                const optionName =
                  option.option_name || option.name || `Option ${idx + 1}`;
                const optionValue = option.option_value || option.value || "";
                const currentPrice = option.price || 0;

                return (
                  <div
                    key={idx}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Option Name */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          Option Name
                        </label>
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <p className="text-sm font-medium text-gray-900">
                            {optionName}
                          </p>
                          {optionValue && (
                            <p className="text-xs text-gray-600 mt-1">
                              {optionValue}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Price Input */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          Additional Cost ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={currentPrice}
                          onChange={(e) =>
                            handlePriceChange(idx, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-600">No options to edit</p>
            </div>
          )}

          {/* Summary */}
          {editedOptions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">
                Total Additional Cost:
              </p>
              <p className="text-2xl font-bold text-blue-600">
                ${editedOptions.reduce((sum, opt) => sum + (opt.price || 0), 0).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
