import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  street2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface BillingInfo {
  same_as_shipping: boolean;
  firstName: string;
  lastName: string;
  street: string;
  street2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CheckoutData {
  product_id: number;
  quantity: number;
  selectedOptions: Record<number, string>;
  notes?: string;
  file?: string;
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

export default function CheckoutBigCommerce() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [customerEmail, setCustomerEmail] = useState("");

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    street2: "",
    city: "",
    state: "CA",
    postalCode: "",
    country: "US",
  });

  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    same_as_shipping: true,
    firstName: "",
    lastName: "",
    street: "",
    street2: "",
    city: "",
    state: "CA",
    postalCode: "",
    country: "US",
  });

  // Load auth and checkout data
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setAuthToken(token);

    // Get checkout data from session
    const pending = sessionStorage.getItem("pending_checkout");
    if (!pending) {
      setError("No checkout data found. Please add items to your cart.");
      setIsLoading(false);
      return;
    }

    try {
      const data = JSON.parse(pending);
      setCheckoutData(data);
    } catch (err) {
      setError("Invalid checkout data");
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  }, [navigate]);

  const handleShippingChange = (field: keyof ShippingInfo, value: string) => {
    const updated = { ...shippingInfo, [field]: value };
    setShippingInfo(updated);

    if (billingInfo.same_as_shipping) {
      setBillingInfo((prev) => ({
        ...prev,
        firstName: updated.firstName,
        lastName: updated.lastName,
        street: updated.street,
        street2: updated.street2,
        city: updated.city,
        state: updated.state,
        postalCode: updated.postalCode,
        country: updated.country,
      }));
    }
  };

  const handleBillingChange = (
    field: keyof BillingInfo,
    value: string | boolean,
  ) => {
    if (field === "same_as_shipping") {
      setBillingInfo((prev) => ({
        ...prev,
        same_as_shipping: value as boolean,
      }));

      if (value) {
        setBillingInfo((prev) => ({
          ...prev,
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          street: shippingInfo.street,
          street2: shippingInfo.street2,
          city: shippingInfo.city,
          state: shippingInfo.state,
          postalCode: shippingInfo.postalCode,
          country: shippingInfo.country,
        }));
      }
    } else {
      setBillingInfo((prev) => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = (): boolean => {
    if (
      !shippingInfo.firstName ||
      !shippingInfo.lastName ||
      !shippingInfo.email ||
      !shippingInfo.phone ||
      !shippingInfo.street ||
      !shippingInfo.city ||
      !shippingInfo.state ||
      !shippingInfo.postalCode
    ) {
      setError("Please fill in all required shipping fields");
      return false;
    }

    if (
      !billingInfo.same_as_shipping &&
      (!billingInfo.firstName ||
        !billingInfo.lastName ||
        !billingInfo.street ||
        !billingInfo.city ||
        !billingInfo.state ||
        !billingInfo.postalCode)
    ) {
      setError("Please fill in all required billing fields");
      return false;
    }

    return true;
  };

  const handleProceedToCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm() || !checkoutData) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the BigCommerce checkout API
      const checkoutPayload: any = {
        customer_id: null, // Guest checkout
        customer_email: shippingInfo.email,
        products: [
          {
            product_id: checkoutData.product_id,
            quantity: checkoutData.quantity,
            price_inc_tax: 0, // Let BigCommerce calculate
          },
        ],
        billing_address: {
          first_name: billingInfo.firstName,
          last_name: billingInfo.lastName,
          street_1: billingInfo.street,
          street_2: billingInfo.street2,
          city: billingInfo.city,
          state_or_province: billingInfo.state,
          postal_code: billingInfo.postalCode,
          country_code: billingInfo.country,
        },
        shipping_addresses: [
          {
            first_name: shippingInfo.firstName,
            last_name: shippingInfo.lastName,
            street_1: shippingInfo.street,
            street_2: shippingInfo.street2,
            city: shippingInfo.city,
            state_or_province: shippingInfo.state,
            postal_code: shippingInfo.postalCode,
            country_code: shippingInfo.country,
          },
        ],
      };

      // Add product options if available
      if (
        checkoutData.selectedOptions &&
        Object.keys(checkoutData.selectedOptions).length > 0
      ) {
        checkoutPayload.product_options = checkoutData.selectedOptions;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const response = await fetch("/api/bigcommerce/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify(checkoutPayload),
      });

      let result: any;
      let responseText = "";

      try {
        responseText = await response.text();
        console.log("Raw response text:", responseText);
        result = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("Failed to parse checkout response:", {
          error: parseError,
          responseText: responseText || "[empty response]",
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error(
          `Server error (${response.status}): ${responseText || "[empty response]"}`,
        );
      }

      if (!response.ok) {
        const errorMessage =
          result?.error || result?.message || "Failed to create BigCommerce checkout";
        throw new Error(errorMessage);
      }

      // Redirect to BigCommerce checkout
      if (result.data?.checkout_url) {
        toast.success("Redirecting to BigCommerce checkout...");
        // Clear session data before redirecting
        sessionStorage.removeItem("pending_checkout");
        setTimeout(() => {
          window.location.href = result.data.checkout_url;
        }, 500);
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to proceed to checkout";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("BigCommerce checkout error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </main>
      </>
    );
  }

  if (error && isLoading === false && !checkoutData) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate("/products")}
              className="mt-6 w-full"
            >
              Back to Shopping
            </Button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Shipping Information
            </h1>
            <p className="text-gray-600">
              Please enter your shipping details to proceed to BigCommerce
              checkout
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleProceedToCheckout}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Shipping & Billing Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                    <CardDescription>
                      Where should we deliver your order?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={shippingInfo.firstName}
                          onChange={(e) =>
                            handleShippingChange("firstName", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={shippingInfo.lastName}
                          onChange={(e) =>
                            handleShippingChange("lastName", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={shippingInfo.email}
                        onChange={(e) =>
                          handleShippingChange("email", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={shippingInfo.phone}
                        onChange={(e) =>
                          handleShippingChange("phone", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="street">Street Address *</Label>
                      <Input
                        id="street"
                        placeholder="123 Main St"
                        value={shippingInfo.street}
                        onChange={(e) =>
                          handleShippingChange("street", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="street2">
                        Apt, Suite, etc. (Optional)
                      </Label>
                      <Input
                        id="street2"
                        placeholder="Apt 4B"
                        value={shippingInfo.street2}
                        onChange={(e) =>
                          handleShippingChange("street2", e.target.value)
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          placeholder="New York"
                          value={shippingInfo.city}
                          onChange={(e) =>
                            handleShippingChange("city", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        {shippingInfo.country === "US" ? (
                          <Select
                            value={shippingInfo.state}
                            onValueChange={(value) =>
                              handleShippingChange("state", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              {US_STATES.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            placeholder="Province/State"
                            value={shippingInfo.state}
                            onChange={(e) =>
                              handleShippingChange("state", e.target.value)
                            }
                          />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postalCode">Postal Code *</Label>
                        <Input
                          id="postalCode"
                          placeholder="10001"
                          value={shippingInfo.postalCode}
                          onChange={(e) =>
                            handleShippingChange("postalCode", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country *</Label>
                        <Select
                          value={shippingInfo.country}
                          onValueChange={(value) =>
                            handleShippingChange("country", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((country) => (
                              <SelectItem
                                key={country.code}
                                value={country.code}
                              >
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Billing Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={billingInfo.same_as_shipping}
                        onChange={(e) =>
                          handleBillingChange(
                            "same_as_shipping",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">
                        Same as shipping address
                      </span>
                    </label>

                    {!billingInfo.same_as_shipping && (
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billingFirstName">
                              First Name *
                            </Label>
                            <Input
                              id="billingFirstName"
                              placeholder="John"
                              value={billingInfo.firstName}
                              onChange={(e) =>
                                handleBillingChange("firstName", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="billingLastName">Last Name *</Label>
                            <Input
                              id="billingLastName"
                              placeholder="Doe"
                              value={billingInfo.lastName}
                              onChange={(e) =>
                                handleBillingChange("lastName", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="billingStreet">
                            Street Address *
                          </Label>
                          <Input
                            id="billingStreet"
                            placeholder="123 Main St"
                            value={billingInfo.street}
                            onChange={(e) =>
                              handleBillingChange("street", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="billingStreet2">
                            Apt, Suite, etc. (Optional)
                          </Label>
                          <Input
                            id="billingStreet2"
                            placeholder="Apt 4B"
                            value={billingInfo.street2}
                            onChange={(e) =>
                              handleBillingChange("street2", e.target.value)
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billingCity">City *</Label>
                            <Input
                              id="billingCity"
                              placeholder="New York"
                              value={billingInfo.city}
                              onChange={(e) =>
                                handleBillingChange("city", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="billingState">State *</Label>
                            <Input
                              id="billingState"
                              placeholder="NY"
                              value={billingInfo.state}
                              onChange={(e) =>
                                handleBillingChange("state", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billingPostalCode">
                              Postal Code *
                            </Label>
                            <Input
                              id="billingPostalCode"
                              placeholder="10001"
                              value={billingInfo.postalCode}
                              onChange={(e) =>
                                handleBillingChange(
                                  "postalCode",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="billingCountry">Country *</Label>
                            <Select
                              value={billingInfo.country}
                              onValueChange={(value) =>
                                handleBillingChange("country", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                {COUNTRIES.map((country) => (
                                  <SelectItem
                                    key={country.code}
                                    value={country.code}
                                  >
                                    {country.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {checkoutData && (
                      <>
                        <div className="space-y-2 border-b pb-4">
                          <div className="flex justify-between text-sm">
                            <span>Product ID: {checkoutData.product_id}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Quantity: {checkoutData.quantity}</span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600">
                          <p className="mb-3">
                            You will complete payment and review order details
                            on the BigCommerce checkout page.
                          </p>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-bold"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Continue to BigCommerce
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                          onClick={() => navigate("/products")}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
