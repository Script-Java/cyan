import { useState, useEffect, useCallback } from "react";
import { AlertCircle, Loader2, Package, X } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

interface ShippingLabelModalProps {
  orderId: number;
  orderNumber: string;
  shippingAddress?: {
    first_name: string;
    last_name: string;
    street_1: string;
    city: string;
    state_or_province: string;
    postal_code: string;
    country_iso2: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

interface Carrier {
  name: string;
  code: string;
}

interface Service {
  name: string;
  code: string;
}

export default function ShippingLabelModal({
  orderId,
  orderNumber,
  shippingAddress,
  onClose,
  onSuccess,
}: ShippingLabelModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState("usps");
  const [selectedService, setSelectedService] = useState("");
  const [weight, setWeight] = useState("16");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [isTestLabel, setIsTestLabel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Define fetchCarriers with useCallback
  const fetchCarriers = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.warn("No auth token found, using default carriers");
        const defaultCarriers = [
          { name: "USPS", code: "usps" },
          { name: "UPS", code: "ups" },
          { name: "FedEx", code: "fedex" },
        ];
        setCarriers(defaultCarriers);
        setSelectedCarrier("usps");
        return;
      }

      const response = await fetch("/api/shipping/carriers", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error:", errorData);
        throw new Error(errorData.error || "Failed to fetch carriers");
      }

      const data = await response.json();
      const carrierList = Array.isArray(data) ? data : data.carriers || [];

      if (carrierList.length === 0) {
        throw new Error("No carriers returned");
      }

      setCarriers(carrierList);
      setSelectedCarrier(carrierList[0].code);
    } catch (err) {
      console.error("Failed to fetch carriers:", err);
      // Use default carriers as fallback
      const defaultCarriers = [
        { name: "USPS", code: "usps" },
        { name: "UPS", code: "ups" },
        { name: "FedEx", code: "fedex" },
        { name: "DHL Express", code: "dhl_express" },
        { name: "OnTrac", code: "ontrac" },
      ];
      setCarriers(defaultCarriers);
      setSelectedCarrier("usps");
    }
  }, []);

  // Define fetchServices with useCallback
  const fetchServices = useCallback(async (carrierCode: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.warn("No auth token found, using default services");
        setServices([]);
        return;
      }

      const response = await fetch(
        `/api/shipping/services?carrierCode=${carrierCode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error:", errorData);
        throw new Error(errorData.error || "Failed to fetch services");
      }

      const data = await response.json();
      const serviceList = Array.isArray(data) ? data : data.services || [];

      setServices(serviceList);
      if (serviceList.length > 0) {
        setSelectedService(serviceList[0].code);
      }
    } catch (err) {
      console.error("Failed to fetch services:", err);
      // Use default services based on carrier
      const defaultServices: Record<string, any[]> = {
        usps: [
          { name: "USPS Priority Mail", code: "usps_priority_mail" },
          {
            name: "USPS Priority Mail Express",
            code: "usps_priority_mail_express",
          },
          { name: "USPS First Class Mail", code: "usps_first_class_mail" },
        ],
        ups: [
          { name: "UPS Ground", code: "ups_ground" },
          { name: "UPS 2nd Day Air", code: "ups_2nd_day_air" },
          { name: "UPS Next Day Air", code: "ups_next_day_air" },
        ],
        fedex: [
          { name: "FedEx Ground", code: "fedex_ground" },
          { name: "FedEx 2Day", code: "fedex_2day" },
          { name: "FedEx Overnight", code: "fedex_overnight" },
        ],
      };
      setServices(defaultServices[carrierCode] || []);
    }
  }, []);

  // Fetch carriers on mount
  useEffect(() => {
    fetchCarriers();
  }, [fetchCarriers]);

  // Fetch services when carrier changes
  useEffect(() => {
    if (selectedCarrier) {
      fetchServices(selectedCarrier);
    }
  }, [selectedCarrier, fetchServices]);

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedService) {
      setError("Please select a shipping service");
      return;
    }

    if (!weight || parseFloat(weight) <= 0) {
      setError("Please enter a valid weight");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      const payload = {
        orderId,
        carrier: selectedCarrier,
        service: selectedService,
        weight: parseFloat(weight),
        ...(length &&
          width &&
          height && {
            dimensions: {
              length: parseFloat(length),
              width: parseFloat(width),
              height: parseFloat(height),
            },
          }),
        testLabel: isTestLabel,
      };

      const response = await fetch("/api/shipping/label", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create shipping label");
      }

      toast.success("Shipping label created successfully!");

      if (result.labelUrl) {
        // Open label in new window
        window.open(result.labelUrl, "_blank");
      }

      onSuccess();
      onClose();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to create shipping label";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">
              Purchase Shipping Label
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-white/60 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleCreateLabel} className="p-6 space-y-4">
          {/* Order Info */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-sm text-white/60">Order</p>
            <p className="font-semibold text-white">#{orderNumber}</p>
          </div>

          {/* Shipping Address Summary */}
          {shippingAddress && (
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-sm text-white/60 mb-1">Shipping To</p>
              <p className="text-sm text-white">
                {shippingAddress.first_name} {shippingAddress.last_name}
              </p>
              <p className="text-xs text-white/60">
                {shippingAddress.street_1}, {shippingAddress.city},{" "}
                {shippingAddress.state_or_province}{" "}
                {shippingAddress.postal_code}
              </p>
            </div>
          )}

          {/* Carrier Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Carrier
            </label>
            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
              disabled={isLoading || carriers.length === 0}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50"
            >
              {carriers.map((carrier) => (
                <option
                  key={carrier.code}
                  value={carrier.code}
                  className="bg-gray-900"
                >
                  {carrier.name}
                </option>
              ))}
            </select>
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Service
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              disabled={isLoading || services.length === 0}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50"
            >
              <option value="" className="bg-gray-900">
                {services.length === 0
                  ? "Loading services..."
                  : "Select a service..."}
              </option>
              {services.map((service) => (
                <option
                  key={service.code}
                  value={service.code}
                  className="bg-gray-900"
                >
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Weight (ounces) *
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              disabled={isLoading}
              min="0.1"
              step="0.1"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50"
              placeholder="Enter weight in ounces"
            />
          </div>

          {/* Dimensions */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Dimensions (inches) - Optional
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                disabled={isLoading}
                min="0"
                step="0.1"
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50"
                placeholder="Length"
              />
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                disabled={isLoading}
                min="0"
                step="0.1"
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50"
                placeholder="Width"
              />
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                disabled={isLoading}
                min="0"
                step="0.1"
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50"
                placeholder="Height"
              />
            </div>
          </div>

          {/* Test Label Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="testLabel"
              checked={isTestLabel}
              onChange={(e) => setIsTestLabel(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 rounded border-white/20 cursor-pointer disabled:opacity-50"
            />
            <label htmlFor="testLabel" className="text-sm text-white/70">
              Test Label (won't be charged)
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              variant="outline"
              className="flex-1 border-white/10 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Label...
                </>
              ) : (
                "Create Label"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
