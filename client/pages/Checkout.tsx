import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

interface CartItem {
  product_id: number;
  product_name?: string;
  quantity: number;
  price?: number;
}

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

interface PaymentInfo {
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
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

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCartId = searchParams.get("cartId");
  const localCartId = localStorage.getItem("cart_id");
  const cartId = urlCartId || localCartId;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [taxRate] = useState(0.08);
  const [shippingCost] = useState(9.99);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardholderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [squareApplicationId, setSquareApplicationId] = useState<string>("");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Load auth from localStorage (optional for guest checkout)
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const custId = localStorage.getItem("customer_id");
    setAuthToken(token);
    setCustomerId(custId ? parseInt(custId) : null);
    // Allow guest checkout - no redirect required
  }, [navigate]);

  // Load Square Application ID
  useEffect(() => {
    const loadSquareConfig = async () => {
      try {
        const response = await fetch("/api/square/config");
        if (response.ok) {
          const data = await response.json();
          if (data.applicationId) {
            setSquareApplicationId(data.applicationId);
          }
        }
      } catch (err) {
        console.error("Failed to load Square config:", err);
      }
    };

    loadSquareConfig();
  }, []);

  // Load cart data with timeout
  useEffect(() => {
    const loadCart = async () => {
      try {
        if (!cartId) {
          console.log("No cart ID provided, allowing checkout to proceed");
          // Allow checkout to proceed with sample items
          setIsLoading(false);
          return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`/api/cart/${cartId}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to load cart (Status: ${response.status})`);
        }

        const responseText = await response.text();
        let data: any;
        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch {
          throw new Error("Invalid cart response format");
        }

        setCartItems(data.data?.line_items || []);
        setSubtotal(data.data?.subtotal || 0);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to load cart";
        console.error("Cart loading error:", errorMsg);
        // Continue checkout anyway with sample items
      } finally {
        setIsLoading(false);
      }
    };

    // Load cart if available, otherwise allow checkout
    if (cartId) {
      loadCart();
    } else {
      setIsLoading(false);
    }
  }, [cartId]);

  const handleShippingChange = (
    field: keyof ShippingInfo,
    value: string | number,
  ) => {
    const updated = { ...shippingInfo, [field]: value };
    setShippingInfo(updated);

    // Auto-update billing if same as shipping
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

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    if (!paymentToken) {
      setError("Please enter your payment information");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderTotal = subtotal + subtotal * taxRate + shippingCost;

      console.log("Processing payment with Square, total:", orderTotal);

      // Process payment via Square
      const paymentPayload = {
        sourceId: paymentToken,
        amount: orderTotal,
        currency: "USD",
        items: cartItems,
        shippingAddress: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          street: shippingInfo.street,
          street2: shippingInfo.street2,
          city: shippingInfo.city,
          state: shippingInfo.state,
          postalCode: shippingInfo.postalCode,
          country: shippingInfo.country,
        },
        billingAddress: billingInfo.same_as_shipping
          ? {
              firstName: shippingInfo.firstName,
              lastName: shippingInfo.lastName,
              street: shippingInfo.street,
              street2: shippingInfo.street2,
              city: shippingInfo.city,
              state: shippingInfo.state,
              postalCode: shippingInfo.postalCode,
              country: shippingInfo.country,
            }
          : {
              firstName: billingInfo.firstName,
              lastName: billingInfo.lastName,
              street: billingInfo.street,
              street2: billingInfo.street2,
              city: billingInfo.city,
              state: billingInfo.state,
              postalCode: billingInfo.postalCode,
              country: billingInfo.country,
            },
        subtotal,
        tax: subtotal * taxRate,
        shipping: shippingCost,
        total: orderTotal,
        customerId: customerId || undefined,
        customerEmail: shippingInfo.email,
        customerName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
      };

      const response = await fetch("/api/square/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
      });

      let result: any;

      console.log("Payment response status:", response.status);

      try {
        result = await response.json();
      } catch (parseError) {
        console.error("Failed to parse payment response:", {
          error: parseError,
          status: response.status,
        });
        throw new Error(
          `Payment response parsing failed. Status: ${response.status}.`,
        );
      }

      if (!response.ok) {
        const errorMessage =
          result?.error ||
          result?.message ||
          `Payment failed (${response.status})`;
        console.error("Payment failed:", {
          status: response.status,
          error: result,
        });
        throw new Error(errorMessage);
      }

      console.log("Payment and order created successfully:", result.order.id);
      toast.success("Payment successful! Redirecting to confirmation...");
      localStorage.removeItem("cart_id");
      setTimeout(() => {
        navigate(`/order-confirmation?orderId=${result.order.id}`);
      }, 1000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create order";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Order creation error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tax = subtotal * taxRate;
  const total = subtotal + tax + shippingCost;

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFD713]" />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#030140] mb-2">Checkout</h1>
            <p className="text-gray-600">Complete your purchase</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmitOrder} className="space-y-8">
                {/* Shipping Information */}
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
                          value={shippingInfo.lastName}
                          onChange={(e) =>
                            handleShippingChange("lastName", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) =>
                          handleShippingChange("email", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
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
                        value={shippingInfo.street}
                        onChange={(e) =>
                          handleShippingChange("street", e.target.value)
                        }
                        placeholder="123 Main St"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="street2">
                        Apt, Suite, etc. (optional)
                      </Label>
                      <Input
                        id="street2"
                        value={shippingInfo.street2}
                        onChange={(e) =>
                          handleShippingChange("street2", e.target.value)
                        }
                        placeholder="Apt 4B"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={shippingInfo.city}
                          onChange={(e) =>
                            handleShippingChange("city", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postal Code *</Label>
                        <Input
                          id="postalCode"
                          value={shippingInfo.postalCode}
                          onChange={(e) =>
                            handleShippingChange("postalCode", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="country">Country *</Label>
                        <Select
                          value={shippingInfo.country}
                          onValueChange={(value) =>
                            handleShippingChange("country", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                      <div>
                        <Label htmlFor="state">State/Province *</Label>
                        {shippingInfo.country === "US" ? (
                          <Select
                            value={shippingInfo.state}
                            onValueChange={(value) =>
                              handleShippingChange("state", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
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
                            value={shippingInfo.state}
                            onChange={(e) =>
                              handleShippingChange("state", e.target.value)
                            }
                            placeholder="State/Province"
                            required
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Billing Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <input
                        type="checkbox"
                        id="sameAsShipping"
                        checked={billingInfo.same_as_shipping}
                        onChange={(e) =>
                          handleBillingChange(
                            "same_as_shipping",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                      <Label
                        htmlFor="sameAsShipping"
                        className="cursor-pointer font-normal"
                      >
                        Same as shipping address
                      </Label>
                    </div>

                    {!billingInfo.same_as_shipping && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billFirstName">First Name *</Label>
                            <Input
                              id="billFirstName"
                              value={billingInfo.firstName}
                              onChange={(e) =>
                                handleBillingChange("firstName", e.target.value)
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="billLastName">Last Name *</Label>
                            <Input
                              id="billLastName"
                              value={billingInfo.lastName}
                              onChange={(e) =>
                                handleBillingChange("lastName", e.target.value)
                              }
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="billStreet">Street Address *</Label>
                          <Input
                            id="billStreet"
                            value={billingInfo.street}
                            onChange={(e) =>
                              handleBillingChange("street", e.target.value)
                            }
                            placeholder="123 Main St"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="billStreet2">
                            Apt, Suite, etc. (optional)
                          </Label>
                          <Input
                            id="billStreet2"
                            value={billingInfo.street2}
                            onChange={(e) =>
                              handleBillingChange("street2", e.target.value)
                            }
                            placeholder="Apt 4B"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billCity">City *</Label>
                            <Input
                              id="billCity"
                              value={billingInfo.city}
                              onChange={(e) =>
                                handleBillingChange("city", e.target.value)
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="billPostalCode">
                              Postal Code *
                            </Label>
                            <Input
                              id="billPostalCode"
                              value={billingInfo.postalCode}
                              onChange={(e) =>
                                handleBillingChange(
                                  "postalCode",
                                  e.target.value,
                                )
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billCountry">Country *</Label>
                            <Select
                              value={billingInfo.country}
                              onValueChange={(value) =>
                                handleBillingChange("country", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
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
                          <div>
                            <Label htmlFor="billState">State/Province *</Label>
                            {billingInfo.country === "US" ? (
                              <Select
                                value={billingInfo.state}
                                onValueChange={(value) =>
                                  handleBillingChange("state", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
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
                                value={billingInfo.state}
                                onChange={(e) =>
                                  handleBillingChange("state", e.target.value)
                                }
                                placeholder="State/Province"
                                required
                              />
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {squareApplicationId && (
                  <>
                    <SquareWebPaymentForm
                      applicationId={squareApplicationId}
                      amount={total}
                      onPaymentSuccess={(token) => {
                        setPaymentToken(token);
                        setPaymentError(null);
                      }}
                      onPaymentError={(error) => {
                        setPaymentError(error);
                        setError(error);
                      }}
                      isProcessing={isSubmitting}
                    />
                    {paymentError && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{paymentError}</AlertDescription>
                      </Alert>
                    )}
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#FFD713] text-[#030140] hover:bg-[#FFD713]/90 py-6 text-lg font-bold disabled:opacity-50"
                  disabled={isSubmitting || !paymentToken}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Order
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto border-b pb-4">
                    {cartItems.length === 0 ? (
                      <p className="text-gray-500 text-sm">No items in cart</p>
                    ) : (
                      cartItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <div>
                            <p className="font-medium">
                              {item.product_name ||
                                `Product #${item.product_id}`}
                            </p>
                            <p className="text-gray-600">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">
                            ${((item.price || 0.25) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>${shippingCost.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
