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
        const response = await fetch("/api/shipping-options");

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData.error || `HTTP ${response.status}`;
          throw new Error(`Failed to fetch shipping options: ${errorMsg}`);
        }

        const data = await response.json();
        const options = data.data || [];

        setShippingOptions(options);
        setError(null);

        if (options.length > 0 && !selectedOptionId) {
          const defaultOption = options[0];
          const estimatedDate = calculateEstimatedDeliveryDate(defaultOption);
          onSelectionChange(
            defaultOption.id,
            defaultOption.cost,
            estimatedDate,
          );
        }
      } catch (err) {
        console.error("Error fetching shipping options:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load shipping options",
        );
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
    onSelectionChange(option.id, option.cost, estimatedDate);
  };

  if (isLoading) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-4">
        <h4 className="text-white font-bold mb-2 text-sm flex items-center gap-2">
          <Truck className="w-4 h-4" />
          Shipping
        </h4>
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          <span className="ml-2 text-white/60 text-xs">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-4">
        <h4 className="text-white font-bold mb-2 text-sm flex items-center gap-2">
          <Truck className="w-4 h-4" />
          Shipping
        </h4>
        <div className="flex items-start gap-2 bg-red-500/20 border border-red-500/50 rounded p-3">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (shippingOptions.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-4">
        <h4 className="text-white font-bold mb-2 text-sm flex items-center gap-2">
          <Truck className="w-4 h-4" />
          Shipping
        </h4>
        <p className="text-white/60 text-xs">
          No options available. Costs will be calculated at checkout.
        </p>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-4">
      <h4 className="text-white font-bold mb-2 text-sm flex items-center gap-2">
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
              className="overflow-hidden rounded-lg border border-white/10"
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
                    ? "bg-blue-500/20 border-blue-500/50"
                    : "bg-white/5 hover:bg-white/10"
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
                    <p className="text-white font-semibold truncate">
                      {option.name}
                    </p>
                    <span className="text-white font-bold flex-shrink-0 whitespace-nowrap">
                      ${option.cost.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 line-clamp-1">
                    {option.processing_time_days}d +{" "}
                    {option.estimated_delivery_days_min}-
                    {option.estimated_delivery_days_max}d = {formattedMinDate}{" "}
                    to {formattedMaxDate}
                  </p>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-white/10 bg-white/5 p-3 space-y-3 text-xs text-white/70">
                  <div className="space-y-2">
                    <h5 className="font-semibold text-white text-sm">
                      Timing Breakdown
                    </h5>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Processing</span>
                        <span className="text-white font-medium">
                          {option.processing_time_days} day
                          {option.processing_time_days !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="text-white font-medium">
                          {option.estimated_delivery_days_min}-
                          {option.estimated_delivery_days_max} days
                        </span>
                      </div>
                      <div className="border-t border-white/10 pt-1 flex justify-between">
                        <span>Total</span>
                        <span className="text-white font-medium">
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

                  <div className="space-y-1 border-t border-white/10 pt-2">
                    <h5 className="font-semibold text-white text-sm">
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
                    <div className="border-t border-white/10 pt-2">
                      <h5 className="font-semibold text-white text-sm mb-1">
                        Details
                      </h5>
                      <p className="text-white/60">{option.description}</p>
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
