import { useState, useEffect } from "react";
import { Truck, AlertCircle, ChevronDown } from "lucide-react";
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
}

interface ShippingOptionsSelectorProps {
  selectedOptionId: number | null;
  onSelectionChange: (
    optionId: number,
    cost: number,
    estimatedDeliveryDate: string,
    shippingOptionName: string,
  ) => void;
}

export default function ShippingOptionsSelector({
  selectedOptionId,
  onSelectionChange,
}: ShippingOptionsSelectorProps) {
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOptionId, setExpandedOptionId] = useState<number | null>(null);

  useEffect(() => {
    const fetchShippingOptions = async () => {
      try {
        const apiUrl = `/api/shipping-options`;
        console.log("Attempting to fetch shipping options from:", apiUrl);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
          const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          console.log("Shipping options response status:", response.status);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error || `HTTP ${response.status}`;
            throw new Error(`Failed to fetch shipping options: ${errorMsg}`);
          }

          const data = await response.json();
          const options = data.data || [];

          console.log("Shipping options loaded:", options.length);
          setShippingOptions(options);
          setError(null);

          if (options.length > 0 && !selectedOptionId) {
            const defaultOption = options[0];
            const estimatedDate = calculateEstimatedDeliveryDate(defaultOption);
            onSelectionChange(
              defaultOption.id,
              defaultOption.cost,
              estimatedDate,
              defaultOption.name,
            );
          }
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          if (fetchErr instanceof Error && fetchErr.name === 'AbortError') {
            throw new Error("Request timeout: Shipping options are taking too long to load");
          }
          throw fetchErr;
        }
      } catch (err) {
        console.error("Error fetching shipping options:", err);
        const errorMsg = err instanceof Error ? err.message : "Failed to load shipping options";
        console.error("Full error details:", {
          error: err,
          message: errorMsg,
          type: err instanceof Error ? err.constructor.name : typeof err,
        });
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShippingOptions();
  }, [selectedOptionId, onSelectionChange]);

  const calculateEstimatedDeliveryDate = (option: ShippingOption): string => {
    // Use MAX delivery days for conservative estimate (worst-case scenario)
    const totalDays =
      option.processing_time_days + option.estimated_delivery_days_max;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + totalDays);
    return deliveryDate.toISOString().split("T")[0];
  };

  const calculateDeliveryDateRange = (
    option: ShippingOption,
  ): { min: string; max: string } => {
    const minTotalDays =
      option.processing_time_days + option.estimated_delivery_days_min;
    const maxTotalDays =
      option.processing_time_days + option.estimated_delivery_days_max;

    const minDate = new Date();
    minDate.setDate(minDate.getDate() + minTotalDays);

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxTotalDays);

    return {
      min: minDate.toISOString().split("T")[0],
      max: maxDate.toISOString().split("T")[0],
    };
  };

  const handleSelectOption = (option: ShippingOption) => {
    const estimatedDate = calculateEstimatedDeliveryDate(option);
    onSelectionChange(option.id, option.cost, estimatedDate, option.name);
  };

  if (isLoading) {
    return (
      <div className="backdrop-blur-xl bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-gray-900 font-bold mb-2 text-sm flex items-center gap-2">
          <Truck className="w-4 h-4" />
          Shipping
        </h4>
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
          <span className="ml-2 text-gray-600 text-xs">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="backdrop-blur-xl bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-gray-900 font-bold mb-2 text-sm flex items-center gap-2">
          <Truck className="w-4 h-4" />
          Shipping
        </h4>
        <div className="flex items-start gap-2 bg-red-500/20 border border-red-500/50 rounded p-3">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-400 text-xs font-medium mb-1">{error}</p>
            <p className="text-red-400/70 text-xs">
              Shipping costs will be calculated during checkout. You can continue without selecting an option.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (shippingOptions.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-gray-900 font-bold mb-2 text-sm flex items-center gap-2">
          <Truck className="w-4 h-4" />
          Shipping
        </h4>
        <p className="text-gray-600 text-xs">
          No options available. Costs will be calculated at checkout.
        </p>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-gray-900 font-bold mb-2 text-sm flex items-center gap-2">
        <Truck className="w-4 h-4" />
        Shipping
      </h4>

      <div className="space-y-2">
        {shippingOptions.map((option) => {
          const { min: minDate, max: maxDate } =
            calculateDeliveryDateRange(option);

          const minDateObj = new Date(minDate);
          const maxDateObj = new Date(maxDate);

          const formattedMinDate = minDateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          const formattedMaxDate = maxDateObj.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });

          const isExpanded = expandedOptionId === option.id;
          const isSelected = selectedOptionId === option.id;

          return (
            <div
              key={option.id}
              className="overflow-hidden rounded-lg border border-gray-200"
            >
              <button
                onClick={() => {
                  setExpandedOptionId(isExpanded ? null : option.id);
                  if (!isSelected) {
                    handleSelectOption(option);
                  }
                }}
                className={`w-full flex items-center gap-2 p-3 transition-all text-sm ${
                  isSelected
                    ? "bg-blue-50 border-blue-600/50"
                    : "bg-white/5 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="shipping-option"
                  value={option.id}
                  checked={isSelected}
                  onChange={() => handleSelectOption(option)}
                  className="w-4 h-4 cursor-pointer flex-shrink-0"
                />

                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-gray-900 font-semibold truncate">
                      {option.name}
                    </p>
                    <span className="text-gray-900 font-bold flex-shrink-0 whitespace-nowrap">
                      ${option.cost.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-1">
                    {option.processing_time_days}d +{" "}
                    {option.estimated_delivery_days_min}-
                    {option.estimated_delivery_days_max}d = {formattedMinDate}{" "}
                    to {formattedMaxDate}
                  </p>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-gray-900/40 flex-shrink-0 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 bg-white/5 p-3 space-y-3 text-xs text-gray-900/70">
                  <div className="space-y-2">
                    <h5 className="font-semibold text-gray-900 text-sm">
                      Timing Breakdown
                    </h5>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Processing</span>
                        <span className="text-gray-900 font-medium">
                          {option.processing_time_days} day
                          {option.processing_time_days !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="text-gray-900 font-medium">
                          {option.estimated_delivery_days_min}-
                          {option.estimated_delivery_days_max} days
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-1 flex justify-between">
                        <span>Total</span>
                        <span className="text-gray-900 font-medium">
                          {option.processing_time_days +
                            option.estimated_delivery_days_min}
                          -
                          {option.processing_time_days +
                            option.estimated_delivery_days_max}{" "}
                          days
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 border-t border-gray-200 pt-2">
                    <h5 className="font-semibold text-gray-900 text-sm">
                      Estimated Delivery
                    </h5>
                    <div className="flex justify-between">
                      <span>Earliest</span>
                      <span className="text-green-400 font-medium">
                        {formattedMinDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Latest</span>
                      <span className="text-green-400 font-medium">
                        {formattedMaxDate}
                      </span>
                    </div>
                  </div>

                  {option.description && (
                    <div className="border-t border-gray-200 pt-2">
                      <h5 className="font-semibold text-gray-900 text-sm mb-1">
                        Details
                      </h5>
                      <p className="text-gray-600">{option.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
