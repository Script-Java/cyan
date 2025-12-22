import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CheckoutFormProps {
  customerInfo: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    street: string;
    street2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingInfo: {
    sameAsShipping: boolean;
    firstName: string;
    lastName: string;
    street: string;
    street2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  onCustomerChange: (field: string, value: string) => void;
  onBillingChange: (field: string, value: string | boolean) => void;
}

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
];

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

interface SavedAddress {
  id: number;
  first_name: string;
  last_name: string;
  street_1: string;
  street_2?: string;
  city: string;
  state_or_province: string;
  postal_code: string;
  country_code: string;
}

export default function CheckoutForm({
  customerInfo,
  billingInfo,
  onCustomerChange,
  onBillingChange,
}: CheckoutFormProps) {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<
    number | null
  >(null);

  useEffect(() => {
    const loadSavedAddresses = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        setIsLoadingAddresses(true);
        const response = await fetch("/api/customers/me/addresses", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setSavedAddresses(data.addresses || []);

          // Auto-select first address
          if (data.addresses && data.addresses.length > 0) {
            const firstAddress = data.addresses[0];
            setSelectedSavedAddressId(firstAddress.id);
            onCustomerChange("firstName", firstAddress.first_name);
            onCustomerChange("lastName", firstAddress.last_name);
            onCustomerChange("street", firstAddress.street_1);
            onCustomerChange("street2", firstAddress.street_2 || "");
            onCustomerChange("city", firstAddress.city);
            onCustomerChange("state", firstAddress.state_or_province);
            onCustomerChange("postalCode", firstAddress.postal_code);
            onCustomerChange("country", firstAddress.country_code);
          }
        }
      } catch (error) {
        console.error("Error loading saved addresses:", error);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    loadSavedAddresses();
  }, []);

  const handleSelectAddress = (addressId: number) => {
    const address = savedAddresses.find((a) => a.id === addressId);
    if (!address) return;

    setSelectedSavedAddressId(addressId);
    onCustomerChange("firstName", address.first_name);
    onCustomerChange("lastName", address.last_name);
    onCustomerChange("street", address.street_1);
    onCustomerChange("street2", address.street_2 || "");
    onCustomerChange("city", address.city);
    onCustomerChange("state", address.state_or_province);
    onCustomerChange("postalCode", address.postal_code);
    onCustomerChange("country", address.country_code);
  };

  return (
    <div className="space-y-6">
      {/* Saved Addresses */}
      {savedAddresses.length > 0 && (
        <div className="backdrop-blur-xl bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-6">Saved Addresses</h3>
          <div className="space-y-2 mb-4">
            {savedAddresses.map((address) => (
              <button
                key={address.id}
                onClick={() => handleSelectAddress(address.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedSavedAddressId === address.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-gray-50"
                }`}
              >
                <p className="font-semibold text-gray-900">
                  {address.first_name} {address.last_name}
                </p>
                <p className="text-gray-700 text-sm">{address.street_1}</p>
                {address.street_2 && (
                  <p className="text-gray-700 text-sm">{address.street_2}</p>
                )}
                <p className="text-gray-700 text-sm">
                  {address.city}, {address.state_or_province}{" "}
                  {address.postal_code}
                </p>
              </button>
            ))}
          </div>
          <p className="text-gray-600 text-sm mb-6">
            Or enter a different address below:
          </p>
        </div>
      )}

      {/* Shipping Information */}
      <div className="backdrop-blur-xl bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-6">Shipping Address</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-gray-700">First Name *</Label>
            <Input
              value={customerInfo.firstName}
              onChange={(e) => onCustomerChange("firstName", e.target.value)}
              className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 mt-2"
              required
            />
          </div>
          <div>
            <Label className="text-gray-700">Last Name *</Label>
            <Input
              value={customerInfo.lastName}
              onChange={(e) => onCustomerChange("lastName", e.target.value)}
              className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 mt-2"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <Label className="text-gray-700">Email Address *</Label>
          <Input
            type="email"
            value={customerInfo.email}
            onChange={(e) => onCustomerChange("email", e.target.value)}
            className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 mt-2"
            required
          />
        </div>

        <div className="mb-4">
          <Label className="text-gray-700">Phone Number *</Label>
          <Input
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => onCustomerChange("phone", e.target.value)}
            className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 mt-2"
            required
          />
        </div>

        <div className="mb-4">
          <Label className="text-gray-700">Street Address *</Label>
          <Input
            value={customerInfo.street}
            onChange={(e) => onCustomerChange("street", e.target.value)}
            placeholder="123 Main St"
            className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 mt-2"
            required
          />
        </div>

        <div className="mb-4">
          <Label className="text-gray-700">Apt, Suite, etc. (optional)</Label>
          <Input
            value={customerInfo.street2}
            onChange={(e) => onCustomerChange("street2", e.target.value)}
            placeholder="Apt 4B"
            className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 mt-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-gray-700">City *</Label>
            <Input
              value={customerInfo.city}
              onChange={(e) => onCustomerChange("city", e.target.value)}
              className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 mt-2"
              required
            />
          </div>
          <div>
            <Label className="text-gray-700">Postal Code *</Label>
            <Input
              value={customerInfo.postalCode}
              onChange={(e) => onCustomerChange("postalCode", e.target.value)}
              className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 mt-2"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-700">Country *</Label>
            <Select
              value={customerInfo.country}
              onValueChange={(value) => onCustomerChange("country", value)}
            >
              <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-200">
                {COUNTRIES.map((country) => (
                  <SelectItem
                    key={country.code}
                    value={country.code}
                    className="text-gray-900 hover:bg-white/10"
                  >
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-700">State/Province *</Label>
            {customerInfo.country === "US" ? (
              <Select
                value={customerInfo.state}
                onValueChange={(value) => onCustomerChange("state", value)}
              >
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-200 max-h-60">
                  {US_STATES.map((state) => (
                    <SelectItem
                      key={state}
                      value={state}
                      className="text-gray-900 hover:bg-white/10"
                    >
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={customerInfo.state}
                onChange={(e) => onCustomerChange("state", e.target.value)}
                placeholder="State/Province"
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 mt-2"
                required
              />
            )}
          </div>
        </div>
      </div>

      {/* Billing Information */}
      <div className="backdrop-blur-xl bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-6">Billing Address</h3>

        <div className="flex items-center gap-3 mb-6">
          <input
            type="checkbox"
            id="sameAsShipping"
            checked={billingInfo.sameAsShipping}
            onChange={(e) =>
              onBillingChange("sameAsShipping", e.target.checked)
            }
            className="w-5 h-5 rounded bg-gray-50 border-gray-200"
          />
          <Label
            htmlFor="sameAsShipping"
            className="text-gray-700 cursor-pointer font-normal"
          >
            Same as shipping address
          </Label>
        </div>

        {!billingInfo.sameAsShipping && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-gray-700">First Name *</Label>
                <Input
                  value={billingInfo.firstName}
                  onChange={(e) => onBillingChange("firstName", e.target.value)}
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 mt-2"
                  required
                />
              </div>
              <div>
                <Label className="text-gray-700">Last Name *</Label>
                <Input
                  value={billingInfo.lastName}
                  onChange={(e) => onBillingChange("lastName", e.target.value)}
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 mt-2"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <Label className="text-gray-700">Street Address *</Label>
              <Input
                value={billingInfo.street}
                onChange={(e) => onBillingChange("street", e.target.value)}
                placeholder="123 Main St"
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 mt-2"
                required
              />
            </div>

            <div className="mb-4">
              <Label className="text-gray-700">
                Apt, Suite, etc. (optional)
              </Label>
              <Input
                value={billingInfo.street2}
                onChange={(e) => onBillingChange("street2", e.target.value)}
                placeholder="Apt 4B"
                className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-gray-700">City *</Label>
                <Input
                  value={billingInfo.city}
                  onChange={(e) => onBillingChange("city", e.target.value)}
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 mt-2"
                  required
                />
              </div>
              <div>
                <Label className="text-gray-700">Postal Code *</Label>
                <Input
                  value={billingInfo.postalCode}
                  onChange={(e) =>
                    onBillingChange("postalCode", e.target.value)
                  }
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 mt-2"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700">Country *</Label>
                <Select
                  value={billingInfo.country}
                  onValueChange={(value) => onBillingChange("country", value)}
                >
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-200">
                    {COUNTRIES.map((country) => (
                      <SelectItem
                        key={country.code}
                        value={country.code}
                        className="text-gray-900 hover:bg-white/10"
                      >
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-700">State/Province *</Label>
                {billingInfo.country === "US" ? (
                  <Select
                    value={billingInfo.state}
                    onValueChange={(value) => onBillingChange("state", value)}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-200 max-h-60">
                      {US_STATES.map((state) => (
                        <SelectItem
                          key={state}
                          value={state}
                          className="text-gray-900 hover:bg-white/10"
                        >
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={billingInfo.state}
                    onChange={(e) => onBillingChange("state", e.target.value)}
                    placeholder="State/Province"
                    className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 mt-2"
                    required
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
