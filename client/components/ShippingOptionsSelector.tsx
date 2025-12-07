import { useState, useEffect } from "react";
import { Truck, AlertCircle } from "lucide-react";
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
  onSelectionChange: (optionId: number, cost: number, estimatedDeliveryDate: string) => void;
}

export default function ShippingOptionsSelector({
  selectedOptionId,
  onSelectionChange,
}: ShippingOptionsSelectorProps) {
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShippingOptions = async () => {
      try {
        const response = await fetch("/api/shipping-options");

        if (!response.ok) {
          throw new Error(`Failed to fetch shipping options: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const options = data.data || [];

        setShippingOptions(options);
        setError(null);

        if (options.length > 0 && !selectedOptionId) {
          const defaultOption = options[0];
          const estimatedDate = calculateEstimatedDeliveryDate(defaultOption);
          onSelectionChange(defaultOption.id, defaultOption.cost, estimatedDate);
        }
      } catch (err) {
        console.error("Error fetching shipping options:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load shipping options",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchShippingOptions();
  }, [selectedOptionId, onSelectionChange]);

  const calculateEstimatedDeliveryDate = (option: ShippingOption): string => {
    const totalDays = option.processing_time_days + option.estimated_delivery_days_min;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + totalDays);
    return deliveryDate.toISOString().split("T")[0];
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
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
          <span className="ml-3 text-white/60">Loading shipping options...</span>
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
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
      <h4 className="text-white font-bold mb-4 flex items-center gap-2">
        <Truck className="w-5 h-5" />
        Shipping Options
      </h4>

      <div className="space-y-3">
        {shippingOptions.map((option) => {
          const estimatedDeliveryDate = calculateEstimatedDeliveryDate(option);
          const deliveryDateObj = new Date(estimatedDeliveryDate);
          const formattedDate = deliveryDateObj.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });

          return (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option)}
              className={`w-full flex items-center gap-2 p-3 rounded-lg border transition-all text-sm ${
                selectedOptionId === option.id
                  ? "bg-blue-500/20 border-blue-500/50"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <input
                type="radio"
                name="shipping-option"
                value={option.id}
                checked={selectedOptionId === option.id}
                onChange={() => handleSelectOption(option)}
                className="w-4 h-4 cursor-pointer flex-shrink-0"
              />

              <div className="flex-1 text-left min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-white font-semibold truncate">{option.name}</p>
                  <span className="text-white font-bold flex-shrink-0 whitespace-nowrap">
                    ${option.cost.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-white/60 line-clamp-1">
                  {option.processing_time_days}d prep + {option.estimated_delivery_days_min}-
                  {option.estimated_delivery_days_max}d shipping • {formattedDate}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
