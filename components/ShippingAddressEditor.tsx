import { useState } from "react";
import { X, Loader } from "lucide-react";

interface ShippingAddress {
  first_name: string;
  last_name: string;
  street_1: string;
  street_2?: string;
  city: string;
  state_or_province: string;
  postal_code: string;
  country_iso2: string;
  phone?: string;
}

interface ShippingAddressEditorProps {
  orderId: number;
  currentAddress?: ShippingAddress;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ShippingAddressEditor({
  orderId,
  currentAddress,
  onClose,
  onSuccess,
}: ShippingAddressEditorProps) {
  const [firstName, setFirstName] = useState(currentAddress?.first_name || "");
  const [lastName, setLastName] = useState(currentAddress?.last_name || "");
  const [street1, setStreet1] = useState(currentAddress?.street_1 || "");
  const [street2, setStreet2] = useState(currentAddress?.street_2 || "");
  const [city, setCity] = useState(currentAddress?.city || "");
  const [stateProvince, setStateProvince] = useState(
    currentAddress?.state_or_province || "",
  );
  const [postalCode, setPostalCode] = useState(
    currentAddress?.postal_code || "",
  );
  const [countryIso2, setCountryIso2] = useState(
    currentAddress?.country_iso2 || "",
  );
  const [phone, setPhone] = useState(currentAddress?.phone || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (
      !firstName ||
      !lastName ||
      !street1 ||
      !city ||
      !stateProvince ||
      !postalCode ||
      !countryIso2
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await fetch(
        `/api/admin/orders/${orderId}/shipping-address`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            street_1: street1,
            street_2: street2 || undefined,
            city,
            state_or_province: stateProvince,
            postal_code: postalCode,
            country_iso2: countryIso2,
            phone: phone || undefined,
          }),
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error || "Failed to update shipping address",
        );
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
      <div className="bg-gray-900 border border-white/10 rounded-lg max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-gray-900">
          <h2 className="text-lg font-semibold text-white">
            Edit Shipping Address - Order #{orderId}
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
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Street Address *
            </label>
            <input
              type="text"
              value={street1}
              onChange={(e) => setStreet1(e.target.value)}
              placeholder="123 Main Street"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>

          {/* Street Address 2 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Apartment, Suite, etc.
            </label>
            <input
              type="text"
              value={street2}
              onChange={(e) => setStreet2(e.target.value)}
              placeholder="Apt 4B (Optional)"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>

          {/* City, State, Postal Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="New York"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                State/Province *
              </label>
              <input
                type="text"
                value={stateProvince}
                onChange={(e) => setStateProvince(e.target.value)}
                placeholder="NY"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
          </div>

          {/* Postal Code and Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Postal Code *
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="10001"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Country Code *
              </label>
              <input
                type="text"
                value={countryIso2}
                onChange={(e) => setCountryIso2(e.target.value.toUpperCase())}
                placeholder="US"
                maxLength={2}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 uppercase"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
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
              Shipping address updated successfully!
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
              {isLoading ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
