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

export default function CheckoutForm({
  customerInfo,
  billingInfo,
  onCustomerChange,
  onBillingChange,
}: CheckoutFormProps) {
  return (
    <div className="space-y-6">
      {/* Shipping Information */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-6">Shipping Address</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-white/80">First Name *</Label>
            <Input
              value={customerInfo.firstName}
              onChange={(e) => onCustomerChange("firstName", e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder-white/40 mt-2"
              required
            />
          </div>
          <div>
            <Label className="text-white/80">Last Name *</Label>
            <Input
              value={customerInfo.lastName}
              onChange={(e) => onCustomerChange("lastName", e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder-white/40 mt-2"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <Label className="text-white/80">Email Address *</Label>
          <Input
            type="email"
            value={customerInfo.email}
            onChange={(e) => onCustomerChange("email", e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder-white/40 mt-2"
            required
          />
        </div>

        <div className="mb-4">
          <Label className="text-white/80">Phone Number *</Label>
          <Input
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => onCustomerChange("phone", e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder-white/40 mt-2"
            required
          />
        </div>

        <div className="mb-4">
          <Label className="text-white/80">Street Address *</Label>
          <Input
            value={customerInfo.street}
            onChange={(e) => onCustomerChange("street", e.target.value)}
            placeholder="123 Main St"
            className="bg-white/5 border-white/10 text-white placeholder-white/40 mt-2"
            required
          />
        </div>

        <div className="mb-4">
          <Label className="text-white/80">Apt, Suite, etc. (optional)</Label>
          <Input
            value={customerInfo.street2}
            onChange={(e) => onCustomerChange("street2", e.target.value)}
            placeholder="Apt 4B"
            className="bg-white/5 border-white/10 text-white placeholder-white/40 mt-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-white/80">City *</Label>
            <Input
              value={customerInfo.city}
              onChange={(e) => onCustomerChange("city", e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder-white/40 mt-2"
              required
            />
          </div>
          <div>
            <Label className="text-white/80">Postal Code *</Label>
            <Input
              value={customerInfo.postalCode}
              onChange={(e) => onCustomerChange("postalCode", e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder-white/40 mt-2"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white/80">Country *</Label>
            <Select
              value={customerInfo.country}
              onValueChange={(value) => onCustomerChange("country", value)}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                {COUNTRIES.map((country) => (
                  <SelectItem
                    key={country.code}
                    value={country.code}
                    className="text-white hover:bg-white/10"
                  >
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white/80">State/Province *</Label>
            {customerInfo.country === "US" ? (
              <Select
                value={customerInfo.state}
                onValueChange={(value) => onCustomerChange("state", value)}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10 max-h-60">
                  {US_STATES.map((state) => (
                    <SelectItem
                      key={state}
                      value={state}
                      className="text-white hover:bg-white/10"
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
                className="bg-white/5 border-white/10 text-white placeholder-white/40 mt-2"
                required
              />
            )}
          </div>
        </div>
      </div>

      {/* Billing Information */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-6">Billing Address</h3>

        <div className="flex items-center gap-3 mb-6">
          <input
            type="checkbox"
            id="sameAsShipping"
            checked={billingInfo.sameAsShipping}
            onChange={(e) =>
              onBillingChange("sameAsShipping", e.target.checked)
            }
            className="w-5 h-5 rounded bg-white/5 border-white/10"
          />
          <Label
            htmlFor="sameAsShipping"
            className="text-white/80 cursor-pointer font-normal"
          >
            Same as shipping address
          </Label>
        </div>

        {!billingInfo.sameAsShipping && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-white/80">First Name *</Label>
                <Input
                  value={billingInfo.firstName}
                  onChange={(e) => onBillingChange("firstName", e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder-white/40 mt-2"
                  required
                />
              </div>
              <div>
                <Label className="text-white/80">Last Name *</Label>
                <Input
                  value={billingInfo.lastName}
                  onChange={(e) => onBillingChange("lastName", e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder-white/40 mt-2"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <Label className="text-white/80">Street Address *</Label>
              <Input
                value={billingInfo.street}
                onChange={(e) => onBillingChange("street", e.target.value)}
                placeholder="123 Main St"
                className="bg-white/5 border-white/10 text-white placeholder-white/40 mt-2"
                required
              />
            </div>

            <div className="mb-4">
              <Label className="text-white/80">
                Apt, Suite, etc. (optional)
              </Label>
              <Input
                value={billingInfo.street2}
                onChange={(e) => onBillingChange("street2", e.target.value)}
                placeholder="Apt 4B"
                className="bg-white/5 border-white/10 text-white placeholder-white/40 mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-white/80">City *</Label>
                <Input
                  value={billingInfo.city}
                  onChange={(e) => onBillingChange("city", e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder-white/40 mt-2"
                  required
                />
              </div>
              <div>
                <Label className="text-white/80">Postal Code *</Label>
                <Input
                  value={billingInfo.postalCode}
                  onChange={(e) =>
                    onBillingChange("postalCode", e.target.value)
                  }
                  className="bg-white/5 border-white/10 text-white placeholder-white/40 mt-2"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/80">Country *</Label>
                <Select
                  value={billingInfo.country}
                  onValueChange={(value) => onBillingChange("country", value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    {COUNTRIES.map((country) => (
                      <SelectItem
                        key={country.code}
                        value={country.code}
                        className="text-white hover:bg-white/10"
                      >
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/80">State/Province *</Label>
                {billingInfo.country === "US" ? (
                  <Select
                    value={billingInfo.state}
                    onValueChange={(value) => onBillingChange("state", value)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10 max-h-60">
                      {US_STATES.map((state) => (
                        <SelectItem
                          key={state}
                          value={state}
                          className="text-white hover:bg-white/10"
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
                    className="bg-white/5 border-white/10 text-white placeholder-white/40 mt-2"
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
