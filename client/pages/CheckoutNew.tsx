import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import CheckoutForm from "@/components/CheckoutForm";
import ShippingOptionsSelector from "@/components/ShippingOptionsSelector";
import SquarePaymentForm from "@/components/SquarePaymentForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Trash2,
  Share2,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useStoreCredit } from "@/hooks/useStoreCredit";

interface CartItem {
  product_id: number;
  product_name?: string;
  quantity: number;
  price?: number;
  image?: string;
  basePrice?: number;
  savePercentage?: number;
  design_file_url?: string;
  selectedOptions?: Record<string, string>;
  options?: Array<{ option_id: number; option_value: string }>;
}

interface OrderData {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  blindShipmentFee: number;
  additionalPayment: number;
  total: number;
  storeCredit: number;
  appliedStoreCredit: number;
}

export default function CheckoutNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cartId = searchParams.get("cartId");

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedOptions, setExpandedOptions] = useState(false);
  const [blindShipmentEnabled, setBlindShipmentEnabled] = useState(false);
  const [additionalPaymentPercent, setAdditionalPaymentPercent] = useState(0);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedStoreCredit, setAppliedStoreCredit] = useState(0);
  const { storeCredit: availableStoreCredit, fetchStoreCredit } =
    useStoreCredit();

  const [selectedShippingOptionId, setSelectedShippingOptionId] = useState<
    number | null
  >(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState<
    string | null
  >(null);

  const [orderData, setOrderData] = useState<OrderData>({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    blindShipmentFee: 0,
    additionalPayment: 0,
    total: 0,
    storeCredit: 0,
    appliedStoreCredit: 0,
  });

  const [customerInfo, setCustomerInfo] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    street2: "",
    city: "",
    state: "CA",
    postalCode: "",
    country: "US",
  });

  const [billingInfo, setBillingInfo] = useState({
    sameAsShipping: true,
    firstName: "",
    lastName: "",
    street: "",
    street2: "",
    city: "",
    state: "CA",
    postalCode: "",
    country: "US",
  });

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [showPolicyDropdown, setShowPolicyDropdown] = useState(false);
  const [policy, setPolicy] = useState<any>(null);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToGDPR, setAgreedToGDPR] = useState(false);
  const [agreedToCCPA, setAgreedToCCPA] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToShippingPolicy, setAgreedToShippingPolicy] = useState(false);

  useEffect(() => {
    const loadCustomerInfo = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          return;
        }

        const response = await fetch("/api/customers/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.customer) {
            const customer = data.customer;
            const primaryAddress = customer.addresses?.[0];

            console.log("Loaded customer info:", {
              email: customer.email,
              firstName: customer.firstName,
              lastName: customer.lastName,
              phone: customer.phone,
              addresses: customer.addresses?.length || 0,
            });

            setCustomerInfo({
              email: customer.email || "",
              firstName: customer.firstName || "",
              lastName: customer.lastName || "",
              phone: customer.phone || "",
              street: primaryAddress?.street_1 || "",
              street2: primaryAddress?.street_2 || "",
              city: primaryAddress?.city || "",
              state: primaryAddress?.state_or_province || "CA",
              postalCode: primaryAddress?.postal_code || "",
              country: primaryAddress?.country_code || "US",
            });
          }
        } else {
          console.warn("Failed to load customer info, status:", response.status);
        }
      } catch (err) {
        console.warn("Failed to load customer info:", err);
      }
    };

    const loadCart = async () => {
      try {
        const id = cartId || localStorage.getItem("cart_id");
        const localStorageCart = localStorage.getItem("cart");

        if (localStorageCart) {
          const customItems = JSON.parse(localStorageCart);
          const items = [];
          for (const item of customItems) {
            try {
              const response = await fetch(
                `/api/public/products/${item.productId}`,
              );
              if (!response.ok) {
                console.warn(
                  `Failed to fetch product ${item.productId}: HTTP ${response.status}`,
                );
                continue;
              }
              const productData = await response.json();
              const product = productData.product;
              const selectedOption = Object.keys(item.selectedOptions).find(
                (optionId) => {
                  const option = product.options?.find(
                    (o: any) => o.id === optionId,
                  );
                  const sharedVariant = product.shared_variants?.find(
                    (sv: any) =>
                      sv.optionSelections.some(
                        (os: any) =>
                          os.optionId === optionId &&
                          os.selectedValueIds.includes(
                            item.selectedOptions[optionId],
                          ),
                      ),
                  );
                  return sharedVariant;
                },
              );
              items.push({
                product_id: item.productId,
                product_name: product.name,
                quantity: item.quantity,
                price: item.pricePerUnit || product.base_price || 0,
                image: product.images?.[0]?.url,
                basePrice: item.basePrice,
                savePercentage: item.savePercentage,
                design_file_url: item.design_file_url,
                selectedOptions: item.selectedOptions,
                options: product.options,
              });
            } catch (err) {
              console.warn(
                `Failed to load product ${item.productId}:`,
                err instanceof Error ? err.message : err,
              );
            }
          }
          setCartItems(items);
          const subtotal = items.reduce(
            (sum: number, item: any) => sum + (item.price || 0) * item.quantity,
            0,
          );
          calculateOrderData(subtotal, 0);
          setIsLoading(false);
          return;
        }

        if (!id) {
          console.log("No cart ID found, skipping cart load");
          setIsLoading(false);
          return;
        }

        console.log("Loading cart with ID:", id);

        let response;
        try {
          response = await fetch(`/api/cart/${id}`);
        } catch (fetchError) {
          console.warn("Network error loading cart:", fetchError);
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          console.error("Failed to load cart - HTTP error:", {
            status: response.status,
            statusText: response.statusText,
          });

          try {
            const errorData = await response.json();
            console.error("Error response data:", errorData);
          } catch (e) {
            console.error("Could not parse error response");
          }

          if (response.status === 404) {
            console.warn("Cart not found, continuing with empty cart");
            setIsLoading(false);
            return;
          }

          throw new Error(
            `Failed to load cart: ${response.status} ${response.statusText}`,
          );
        }

        try {
          const data = await response.json();
          let items = data.data?.line_items || [];
          console.log("Cart loaded successfully:", {
            itemCount: items.length,
            subtotal: data.data?.subtotal,
          });

          // Enrich cart items with product options for proper display
          const enrichedItems = [];
          for (const item of items) {
            try {
              const response = await fetch(
                `/api/public/products/${item.product_id}`,
              );
              if (response.ok) {
                const productData = await response.json();
                const product = productData.product;
                enrichedItems.push({
                  ...item,
                  options: product.options,
                });
              } else {
                // If product fetch fails, just use the item as-is
                enrichedItems.push(item);
              }
            } catch (err) {
              console.warn(
                `Failed to fetch product ${item.product_id}:`,
                err instanceof Error ? err.message : err,
              );
              // Use item without enriched options
              enrichedItems.push(item);
            }
          }

          setCartItems(enrichedItems);

          const subtotal = enrichedItems.reduce((sum: number, item: CartItem) => {
            return sum + (item.price || 0.25) * item.quantity;
          }, 0);

          calculateOrderData(subtotal, 0);
        } catch (parseError) {
          console.error("Error parsing cart response:", parseError);
          throw new Error("Failed to parse cart response");
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("Failed to load cart:", {
          message: errorMsg,
          error: err,
        });
        toast.error(`Cart loading error: ${errorMsg}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomerInfo();
    loadCart();
    fetchStoreCredit();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStoreCredit();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [cartId, fetchStoreCredit]);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await fetch("/api/return-refund-policy");
        if (response.ok) {
          const data = await response.json();
          setPolicy(data.policy);
        }
      } catch (err) {
        console.error("Failed to fetch policy:", err);
      }
    };

    fetchPolicy();
  }, []);

  const calculateOrderData = (
    subtotal: number,
    discount: number,
    creditAmount: number = appliedStoreCredit,
    shipping: number = shippingCost,
  ) => {
    const tax = subtotal * 0.08;
    const blindShipmentFee = blindShipmentEnabled ? 5 : 0;
    const additionalPayment =
      (subtotal + tax + shipping + blindShipmentFee - discount) *
      (additionalPaymentPercent / 100);
    const subtotalBeforeCredit =
      subtotal +
      tax +
      shipping +
      blindShipmentFee +
      additionalPayment -
      discount;
    const total = Math.max(0, subtotalBeforeCredit - creditAmount);
    const storeCredit = total * 0.05;

    setOrderData({
      subtotal,
      tax,
      shipping,
      discount,
      blindShipmentFee,
      additionalPayment,
      total,
      storeCredit,
      appliedStoreCredit: creditAmount,
    });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedItems);

    // Update localStorage
    const localStorageCart = localStorage.getItem("cart");
    if (localStorageCart) {
      const customItems = JSON.parse(localStorageCart);
      const updatedCart = customItems.filter(
        (_: any, i: number) => i !== index,
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }

    const newSubtotal = updatedItems.reduce((sum, item) => {
      return sum + (item.price || 0.25) * item.quantity;
    }, 0);

    calculateOrderData(newSubtotal, appliedDiscount, appliedStoreCredit);
    toast.success("Item removed from cart");
  };

  const handleApplyStoreCredit = (amount: number) => {
    const validAmount = Math.max(0, Math.min(amount, availableStoreCredit));
    setAppliedStoreCredit(validAmount);
    calculateOrderData(orderData.subtotal, appliedDiscount, validAmount);
    fetchStoreCredit();
  };

  const handleApplyDiscount = () => {
    if (discountCode) {
      const discountAmount = orderData.subtotal * 0.1;
      setAppliedDiscount(discountAmount);
      calculateOrderData(
        orderData.subtotal,
        discountAmount,
        appliedStoreCredit,
      );
      toast.success("Discount code applied!");
    }
  };

  const handleAdditionalPayment = (percent: number) => {
    setAdditionalPaymentPercent(percent);
    calculateOrderData(orderData.subtotal, appliedDiscount, appliedStoreCredit);
  };

  const handleRemoveStoreCredit = () => {
    setAppliedStoreCredit(0);
    calculateOrderData(orderData.subtotal, appliedDiscount, 0);
  };

  const validateForm = (): boolean => {
    if (
      !customerInfo.firstName ||
      !customerInfo.lastName ||
      !customerInfo.email ||
      !customerInfo.phone ||
      !customerInfo.street ||
      !customerInfo.city ||
      !customerInfo.state ||
      !customerInfo.postalCode ||
      !customerInfo.country
    ) {
      toast.error("Please fill in all required shipping fields");
      return false;
    }

    if (!billingInfo.sameAsShipping) {
      if (
        !billingInfo.firstName ||
        !billingInfo.lastName ||
        !billingInfo.street ||
        !billingInfo.city ||
        !billingInfo.state ||
        !billingInfo.postalCode ||
        !billingInfo.country
      ) {
        toast.error("Please fill in all required billing fields");
        return false;
      }
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return false;
    }

    if (!agreedToPolicy) {
      toast.error("Please agree to the Return & Refund Policy to proceed");
      return false;
    }

    if (!agreedToPrivacy) {
      toast.error("Please agree to the Privacy Policy to proceed");
      return false;
    }

    if (!agreedToGDPR) {
      toast.error("Please confirm GDPR data processing consent to proceed");
      return false;
    }

    if (!agreedToCCPA) {
      toast.error("Please acknowledge CCPA privacy rights to proceed");
      return false;
    }

    if (!agreedToTerms) {
      toast.error("Please agree to the Terms of Service to proceed");
      return false;
    }

    if (!agreedToShippingPolicy) {
      toast.error("Please agree to the Shipping Policy to proceed");
      return false;
    }

    return true;
  };

  // Helper function to get option display values for an item
  const getOptionsForPayload = (item: CartItem) => {
    if (!item.selectedOptions || Object.keys(item.selectedOptions).length === 0) {
      return [];
    }
    return Object.entries(item.selectedOptions).map(([optionId, valueId]) => ({
      option_id: optionId,
      option_value: valueId,
    }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const customerId = localStorage.getItem("customerId");

      const checkoutPayload = {
        amount: orderData.total,
        currency: "USD",
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          design_file_url: item.design_file_url,
          options: getOptionsForPayload(item),
        })),
        phone: customerInfo.phone,
        shippingAddress: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          street: customerInfo.street,
          street2: customerInfo.street2,
          city: customerInfo.city,
          state: customerInfo.state,
          postalCode: customerInfo.postalCode,
          country: customerInfo.country,
        },
        billingAddress: billingInfo.sameAsShipping
          ? {
              firstName: customerInfo.firstName,
              lastName: customerInfo.lastName,
              street: customerInfo.street,
              street2: customerInfo.street2,
              city: customerInfo.city,
              state: customerInfo.state,
              postalCode: customerInfo.postalCode,
              country: customerInfo.country,
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
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shipping: orderData.shipping,
        total: orderData.total,
        appliedStoreCredit: appliedStoreCredit,
        customerId: customerId ? parseInt(customerId) : undefined,
        customerEmail: customerInfo.email,
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        ...(selectedShippingOptionId && {
          shipping_option_id: selectedShippingOptionId,
        }),
        policies: {
          returnAndRefund: agreedToPolicy,
          privacy: agreedToPrivacy,
          gdpr: agreedToGDPR,
          ccpa: agreedToCCPA,
          terms: agreedToTerms,
          shipping: agreedToShippingPolicy,
        },
      };

      console.log("Checkout payload being sent:", {
        amount: checkoutPayload.amount,
        items: checkoutPayload.items?.length,
        customerEmail: checkoutPayload.customerEmail,
        total: checkoutPayload.total,
        payloadSize: JSON.stringify(checkoutPayload).length,
      });

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      let response;
      let result;

      try {
        response = await fetch("/api/square/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(checkoutPayload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log("Checkout response status:", response.status);

        // Try to parse response
        try {
          result = await response.json();
        } catch (parseError) {
          console.error("Failed to parse checkout response:", parseError);
          throw new Error(
            `Server error (${response.status}): Could not parse response`
          );
        }

        console.log("Checkout response data:", result);

        if (!response.ok) {
          const errorMsg =
            result?.error ||
            result?.message ||
            `HTTP ${response.status}: Checkout failed`;
          throw new Error(errorMsg);
        }
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        if (fetchErr instanceof Error && fetchErr.name === "AbortError") {
          throw new Error(
            "Request timeout: Checkout is taking too long. Please try again."
          );
        }
        // Network errors
        if (fetchErr instanceof TypeError) {
          console.error("Network error details:", {
            message: fetchErr.message,
            stack: fetchErr.stack,
          });
          throw new Error(
            `Network error: ${fetchErr.message}. Please check your connection and try again.`
          );
        }
        throw fetchErr;
      }

      // Store the order ID
      if (result.order?.id) {
        setCreatedOrderId(result.order.id);

        // If there's a checkout URL (Square Payment Link), redirect to it
        if (result.checkoutUrl) {
          toast.success("Order created! Redirecting to payment...");
          setTimeout(() => {
            window.location.href = result.checkoutUrl;
          }, 1000);
        } else {
          // Otherwise show the payment form
          setShowPaymentForm(true);
          toast.success("Order created! Please complete payment below.");
        }
      } else {
        throw new Error("No order ID returned from checkout");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Checkout failed";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = (token: string) => {
    // Store credit fetch disabled temporarily
    // fetchStoreCredit();

    // Redirect to order confirmation page
    if (createdOrderId) {
      setTimeout(() => {
        navigate(`/order-confirmation?orderId=${createdOrderId}`);
      }, 1000);
    }
  };

  const handleCustomerInfoChange = (field: string, value: string) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBillingInfoChange = (field: string, value: string | boolean) => {
    if (field === "sameAsShipping") {
      setBillingInfo((prev) => ({
        ...prev,
        sameAsShipping: value as boolean,
      }));
      if (value) {
        setBillingInfo((prev) => ({
          ...prev,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          street: customerInfo.street,
          street2: customerInfo.street2,
          city: customerInfo.city,
          state: customerInfo.state,
          postalCode: customerInfo.postalCode,
          country: customerInfo.country,
        }));
      }
    } else {
      setBillingInfo((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-[#fafafa] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      {/* Skip to Main Content Link - Accessibility */}
      <a
        href="#checkout-form"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 bg-blue-600 text-white px-4 py-2"
      >
        Skip to checkout form
      </a>

      <main
        className="pt-24 min-h-screen bg-[#fafafa] text-gray-900 px-10 py-12"
        id="checkout-main"
        role="main"
        aria-label="Checkout page"
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Your Cart</h1>

          <form onSubmit={handleCheckout}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items & Form */}
              <div className="lg:col-span-2 space-y-6">
                {cartItems.map((item, index) => (
                  <div
                    key={index}
                    className="backdrop-blur-xl bg-white border border-gray-200 rounded-2xl p-6"
                  >
                    <div className="flex gap-6">
                      <div className="flex flex-col gap-4 flex-shrink-0">
                        <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.product_name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <div className="text-gray-500 text-center">
                              <p className="text-sm">No image</p>
                            </div>
                          )}
                        </div>
                        {item.design_file_url && (
                          <div className="w-48 bg-white border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
                            {item.design_file_url.match(
                              /\.(jpg|jpeg|png|gif|webp)$/i,
                            ) ||
                            item.design_file_url.startsWith("data:image") ? (
                              <div className="w-full h-auto p-2">
                                <img
                                  src={item.design_file_url}
                                  alt="Design thumbnail"
                                  className="w-full h-auto object-contain rounded-lg"
                                />
                              </div>
                            ) : (
                              <div className="p-4 text-center">
                                <p className="text-xs text-gray-600">
                                  Design file uploaded
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold">
                              {item.product_name ||
                                `Product #${item.product_id}`}
                            </h3>
                            <div className="text-sm space-y-1">
                              {item.savePercentage &&
                              item.savePercentage > 0 ? (
                                <>
                                  {(() => {
                                    const basePrice =
                                      item.basePrice ||
                                      item.price /
                                        (1 - item.savePercentage / 100);
                                    const regularTotal =
                                      basePrice * item.quantity;
                                    const amountSaved =
                                      ((basePrice * item.savePercentage) /
                                        100) *
                                      item.quantity;
                                    const total =
                                      (item.price || 0.25) * item.quantity;
                                    return (
                                      <>
                                        <p className="text-gray-600">
                                          Regular: ${regularTotal.toFixed(2)}
                                        </p>
                                        <p className="text-gray-600">
                                          Quantity: {item.quantity}
                                        </p>
                                        <p className="text-green-600 font-semibold">
                                          Save {item.savePercentage}%
                                        </p>
                                        <p className="text-green-600">
                                          Amount Saved: $
                                          {amountSaved.toFixed(2)}
                                        </p>
                                        <p className="text-gray-900 font-bold border-t border-gray-200 pt-1">
                                          Total: ${total.toFixed(2)}
                                        </p>
                                      </>
                                    );
                                  })()}
                                </>
                              ) : (
                                <p className="text-gray-600">
                                  $
                                  {(
                                    (item.price || 0.25) * item.quantity
                                  ).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="space-y-3 bg-gray-50 rounded-lg p-4 mb-4">
                          <h4 className="text-blue-600 text-sm font-bold uppercase tracking-wider">
                            Product Specifications
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Price per sticker</span>
                              <span className="font-medium">
                                ${(item.price || 0.25).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Quantity</span>
                              <span className="font-medium">
                                {item.quantity}
                              </span>
                            </div>
                            {/* Handle both selectedOptions (from localStorage) and product_options (from API) */}
                            {item.selectedOptions &&
                              Object.keys(item.selectedOptions).length > 0 && (
                                <>
                                  {Object.entries(item.selectedOptions).map(
                                    ([optionId, valueId]) => {
                                      // Find the option and its value name
                                      const option = item.options?.find(
                                        (opt: any) => opt.id === optionId,
                                      );
                                      const optionValue = option?.values?.find(
                                        (val: any) => val.id === valueId,
                                      );
                                      const displayValue = optionValue?.name || valueId;

                                      return (
                                        <div
                                          key={optionId}
                                          className="flex items-center justify-between"
                                        >
                                          <span className="text-gray-600">
                                            {option?.name || "Option"}
                                          </span>
                                          <span className="font-medium">
                                            {displayValue}
                                          </span>
                                        </div>
                                      );
                                    },
                                  )}
                                </>
                              )}
                            {/* Handle product_options from API carts */}
                            {!item.selectedOptions &&
                              item.product_options &&
                              item.product_options.length > 0 && (
                                <>
                                  {item.product_options.map(
                                    (
                                      opt: { option_id?: number; option_value?: string } | string,
                                      idx: number,
                                    ) => {
                                      // Handle both simple string options and structured options
                                      const optionValue =
                                        typeof opt === "string"
                                          ? opt
                                          : opt.option_value || "";

                                      // Try to find the option name from the options array
                                      const optionName =
                                        typeof opt !== "string" && opt.option_id && item.options
                                          ? item.options.find(
                                              (o: any) => o.id === opt.option_id,
                                            )?.name
                                          : null;

                                      return (
                                        <div
                                          key={idx}
                                          className="flex items-center justify-between"
                                        >
                                          <span className="text-gray-600">
                                            {optionName || "Option"}
                                          </span>
                                          <span className="font-medium">
                                            {optionValue}
                                          </span>
                                        </div>
                                      );
                                    },
                                  )}
                                </>
                              )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-blue-600 text-sm font-bold uppercase tracking-wider">
                            Additional Notes
                          </label>
                          <textarea
                            placeholder="Any special instructions or requests..."
                            rows={3}
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="backdrop-blur-xl bg-white border border-gray-200 rounded-2xl p-6">
                  <fieldset>
                    <legend className="sr-only">Discount Code Section</legend>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <label htmlFor="discount-code" className="sr-only">
                          Discount code
                        </label>
                        <Input
                          id="discount-code"
                          placeholder="Discount code"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                          aria-label="Discount code"
                          aria-describedby="discount-help"
                        />
                        <span id="discount-help" className="sr-only">
                          Enter your discount code to apply savings to your order
                        </span>
                      </div>
                      <Button
                        type="button"
                        onClick={handleApplyDiscount}
                        disabled={!discountCode}
                        className="bg-green-500 hover:bg-green-600 text-white px-6"
                        aria-label="Apply discount code"
                      >
                        Apply
                      </Button>
                    </div>
                  </fieldset>
                </div>

                <CheckoutForm
                  customerInfo={customerInfo}
                  billingInfo={billingInfo}
                  onCustomerChange={handleCustomerInfoChange}
                  onBillingChange={handleBillingInfoChange}
                />

                {/* Return & Refund Policy Agreement */}
                <div className="backdrop-blur-xl bg-white border border-gray-200 rounded-2xl p-6">
                  <button
                    type="button"
                    onClick={() => setShowPolicyDropdown(!showPolicyDropdown)}
                    className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition"
                  >
                    <h4 className="text-gray-900 font-bold text-lg">
                      Return & Refund Policy
                    </h4>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-600 transition-transform ${
                        showPolicyDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showPolicyDropdown && (
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-80 overflow-y-auto text-sm space-y-3">
                        {policy ? (
                          <>
                            <div>
                              <p className="font-semibold text-gray-900 mb-2">
                                {policy.guarantee_days}-Day Money-Back Guarantee
                              </p>
                              <p className="text-gray-600">
                                We offer a {policy.guarantee_days}-day money-back guarantee on all orders. If you're not satisfied with your custom stickers for any reason, you can request a full refund within {policy.guarantee_days} days of your purchase.
                              </p>
                            </div>

                            {policy.return_conditions && policy.return_conditions.length > 0 && (
                              <div>
                                <p className="font-semibold text-gray-900 mb-2">
                                  Return Conditions
                                </p>
                                <ul className="text-gray-600 space-y-1">
                                  {policy.return_conditions.map((condition: string, index: number) => (
                                    <li key={index}>• {condition}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {policy.how_to_return && policy.how_to_return.length > 0 && (
                              <div>
                                <p className="font-semibold text-gray-900 mb-2">
                                  How to Return
                                </p>
                                <ol className="text-gray-600 space-y-1">
                                  {policy.how_to_return.map((step: string, index: number) => (
                                    <li key={index}>{index + 1}. {step}</li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            <div>
                              <p className="font-semibold text-gray-900 mb-2">
                                Defective or Damaged Items
                              </p>
                              <p className="text-gray-600">
                                If your stickers arrive damaged or defective, we'll replace them at no cost to you within {policy.defective_items_days} days of delivery.
                              </p>
                            </div>

                            {policy.non_returnable_items && policy.non_returnable_items.length > 0 && (
                              <div>
                                <p className="font-semibold text-gray-900 mb-2">
                                  Non-Returnable Items
                                </p>
                                <ul className="text-gray-600 space-y-1">
                                  {policy.non_returnable_items.map((item: string, index: number) => (
                                    <li key={index}>• {item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div>
                              <p className="font-semibold text-gray-900 mb-2">
                                Refund Timeline
                              </p>
                              <p className="text-gray-600">
                                {policy.refund_timeline}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                              <a
                                href="/return-refund-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                              >
                                Read Full Policy →
                              </a>
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-500 text-sm">Loading policy...</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agreeToPolicy"
                      checked={agreedToPolicy}
                      onChange={(e) => setAgreedToPolicy(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 mt-1 flex-shrink-0 cursor-pointer"
                    />
                    <label
                      htmlFor="agreeToPolicy"
                      className="text-gray-600 text-sm flex-1 cursor-pointer"
                    >
                      I have read and agree to the{" "}
                      <a
                        href="/return-refund-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Return & Refund Policy
                      </a>
                    </label>
                  </div>

                  {!agreedToPolicy && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2" role="alert">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <p className="text-xs text-amber-800">
                        You must agree to the Return & Refund Policy to complete your purchase.
                      </p>
                    </div>
                  )}

                  {/* Privacy Policy & Data Handling */}
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h4 className="text-gray-900 font-bold text-lg mb-4">
                      Privacy & Data Protection
                    </h4>

                    {/* Privacy Policy Agreement */}
                    <div className="flex items-start gap-3 mb-4">
                      <input
                        type="checkbox"
                        id="agreeToPrivacy"
                        checked={agreedToPrivacy}
                        onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 mt-1 flex-shrink-0 cursor-pointer"
                      />
                      <label
                        htmlFor="agreeToPrivacy"
                        className="text-gray-600 text-sm flex-1 cursor-pointer"
                      >
                        I have read and agree to the{" "}
                        <a
                          href="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Privacy Policy
                        </a>
                      </label>
                    </div>

                    {/* GDPR Compliance */}
                    <div className="flex items-start gap-3 mb-4">
                      <input
                        type="checkbox"
                        id="agreeToGDPR"
                        checked={agreedToGDPR}
                        onChange={(e) => setAgreedToGDPR(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500 mt-1 flex-shrink-0 cursor-pointer"
                      />
                      <label
                        htmlFor="agreeToGDPR"
                        className="text-gray-600 text-sm flex-1 cursor-pointer"
                      >
                        <span className="font-medium">GDPR Compliance:</span> I consent to the collection, processing, and storage of my personal data in accordance with GDPR regulations. I understand my rights including data access, correction, deletion, and portability.
                      </label>
                    </div>

                    {/* CCPA Compliance */}
                    <div className="flex items-start gap-3 mb-4">
                      <input
                        type="checkbox"
                        id="agreeToCCPA"
                        checked={agreedToCCPA}
                        onChange={(e) => setAgreedToCCPA(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-2 focus:ring-orange-500 mt-1 flex-shrink-0 cursor-pointer"
                      />
                      <label
                        htmlFor="agreeToCCPA"
                        className="text-gray-600 text-sm flex-1 cursor-pointer"
                      >
                        <span className="font-medium">CCPA Rights (California residents):</span> I acknowledge my rights to know what personal information is collected, the purposes of use, and my right to delete or opt-out of the sale of personal information.
                      </label>
                    </div>

                    {/* Terms of Service */}
                    <div className="flex items-start gap-3 mb-4">
                      <input
                        type="checkbox"
                        id="agreeToTerms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-2 focus:ring-red-500 mt-1 flex-shrink-0 cursor-pointer"
                      />
                      <label
                        htmlFor="agreeToTerms"
                        className="text-gray-600 text-sm flex-1 cursor-pointer"
                      >
                        I have read and agree to the{" "}
                        <a
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Terms of Service
                        </a>
                      </label>
                    </div>

                    {/* Shipping Policy */}
                    <div className="flex items-start gap-3 mb-4">
                      <input
                        type="checkbox"
                        id="agreeToShippingPolicy"
                        checked={agreedToShippingPolicy}
                        onChange={(e) => setAgreedToShippingPolicy(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 mt-1 flex-shrink-0 cursor-pointer"
                      />
                      <label
                        htmlFor="agreeToShippingPolicy"
                        className="text-gray-600 text-sm flex-1 cursor-pointer"
                      >
                        I have read and agree to the{" "}
                        <a
                          href="/shipping"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Shipping Policy
                        </a>
                      </label>
                    </div>

                    {/* Data Handling Transparency */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
                      <p className="font-semibold text-gray-900 mb-2">How We Handle Your Data</p>
                      <ul className="space-y-2 text-xs">
                        <li>✓ Your personal information is encrypted and transmitted securely using SSL/TLS</li>
                        <li>✓ Payment information is processed by Square and never stored on our servers</li>
                        <li>✓ We do not sell or share your personal data with third parties for marketing</li>
                        <li>✓ You can request access, correction, or deletion of your data at any time</li>
                        <li>✓ We retain your data only as long as necessary for order fulfillment and legal compliance</li>
                      </ul>
                    </div>
                  </div>

                  {(!agreedToPrivacy || !agreedToGDPR || !agreedToCCPA || !agreedToTerms || !agreedToShippingPolicy) && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        You must agree to all policies and terms to complete your purchase.
                      </p>
                    </div>
                  )}

                  {/* Support Contact Info */}
                  <div className="backdrop-blur-xl bg-white border border-gray-200 rounded-2xl p-6 mt-6">
                    <h4 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                      💬 Need Help?
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Email Support</p>
                        <a
                          href="mailto:sticky@stickyslap.com"
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm break-all"
                        >
                          sticky@stickyslap.com
                        </a>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Create a Support Ticket</p>
                        <a
                          href="/support"
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          Contact Support →
                        </a>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500">We typically respond within 24 hours</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-32 space-y-6">
                  <div className="backdrop-blur-xl bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold">Order Summary</h3>
                      <button
                        type="button"
                        className="text-gray-600 hover:text-gray-900 transition"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3 text-sm mb-6 pb-6 border-b border-gray-200">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal ({cartItems.length} items)</span>
                        <span>${orderData.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>You're paying</span>
                        <span>
                          $
                          {(
                            orderData.subtotal /
                            (cartItems.reduce(
                              (sum, i) => sum + i.quantity,
                              0,
                            ) || 1)
                          ).toFixed(2)}{" "}
                          per sticker
                        </span>
                      </div>
                      {orderData.tax > 0 && (
                        <div className="flex justify-between text-orange-600">
                          <span>Tax (8%)</span>
                          <span className="font-bold">
                            ${orderData.tax.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {shippingCost > 0 && (
                        <div className="flex justify-between text-blue-600">
                          <span>Shipping</span>
                          <span className="font-bold">
                            ${shippingCost.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {shippingCost === 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Shipping</span>
                          <span className="font-bold">FREE</span>
                        </div>
                      )}
                      {appliedDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Deal Savings</span>
                          <span className="font-bold">
                            -${appliedDiscount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {blindShipmentEnabled && (
                        <div className="flex justify-between text-orange-600">
                          <span>Blind Shipment Fee</span>
                          <span>+${orderData.blindShipmentFee.toFixed(2)}</span>
                        </div>
                      )}
                      {orderData.additionalPayment > 0 && (
                        <div className="flex justify-between text-orange-600">
                          <span>Additional Payment</span>
                          <span>
                            +${orderData.additionalPayment.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {/* Store Credit Applied display disabled temporarily */}
                    </div>

                    <div className="flex justify-between items-center mb-6 text-xl font-bold">
                      <span>Total</span>
                      <span>${orderData.total.toFixed(2)}</span>
                    </div>

                    {/* Store credit earned display disabled temporarily */}
                  </div>

                  {/* Store credit section disabled temporarily */}

                  <ShippingOptionsSelector
                    selectedOptionId={selectedShippingOptionId}
                    onSelectionChange={(optionId, cost, deliveryDate) => {
                      setSelectedShippingOptionId(optionId);
                      setShippingCost(cost);
                      setEstimatedDeliveryDate(deliveryDate);
                      calculateOrderData(
                        orderData.subtotal,
                        appliedDiscount,
                        appliedStoreCredit,
                        cost,
                      );
                    }}
                  />

                  {estimatedDeliveryDate && (
                    <div className="backdrop-blur-xl bg-white border border-gray-200 rounded-2xl p-6">
                      <h4 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                        📦 Estimated Delivery
                      </h4>
                      <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
                        <span>Delivery by</span>
                        <span className="text-green-600">
                          {new Date(estimatedDeliveryDate).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        * Delivery may not occur on weekends. Dates are
                        automatically moved to the next business day.
                      </p>
                    </div>
                  )}

                  {showPaymentForm && createdOrderId ? (
                    <div className="mb-3">
                      <SquarePaymentForm
                        amount={orderData.total}
                        orderId={createdOrderId}
                        customerEmail={customerInfo.email}
                        customerName={`${customerInfo.firstName} ${customerInfo.lastName}`}
                        onPaymentSuccess={handlePaymentSuccess}
                        isLoading={isSubmitting}
                      />

                      {/* PCI DSS Compliance Badge */}
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-900">PCI DSS Level 1 Compliant</p>
                          <p className="text-xs text-green-700">Your payment information is processed securely by Square Payment Systems, certified to PCI DSS Level 1 standards.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Button
                        type="submit"
                        disabled={isSubmitting || !agreedToPolicy || !agreedToPrivacy || !agreedToGDPR || !agreedToCCPA || !agreedToTerms || !agreedToShippingPolicy}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6 text-lg font-bold rounded-lg mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>💳 Go to Checkout</>
                        )}
                      </Button>

                      {/* PCI DSS Compliance Notice */}
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-800">
                          🔒 <span className="font-semibold">Payment Security:</span> Your payment information will be processed securely by Square Payment Systems, which is PCI DSS Level 1 certified. We never store your credit card information on our servers.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
