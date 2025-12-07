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

  useEffect(() => {
    const loadCart = async () => {
      try {
        const id = cartId || localStorage.getItem("cart_id");
        const localStorageCart = localStorage.getItem("cart");

        if (localStorageCart) {
          const customItems = JSON.parse(localStorageCart);
          const items = [];
          for (const item of customItems) {
            const response = await fetch(
              `/api/public/products/${item.productId}`,
            );
            if (response.ok) {
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
              });
            }
          }
          setCartItems(items);
          const subtotal = items.reduce(
            (sum: number, item: any) => sum + (item.price || 0) * item.quantity,
            0,
          );
          setOrderData((prev) => ({
            ...prev,
            subtotal,
            total: subtotal,
          }));
          setIsLoading(false);
          return;
        }

        if (!id) {
          console.log("No cart ID found, skipping cart load");
          setIsLoading(false);
          return;
        }

        console.log("Loading cart with ID:", id);

        const response = await fetch(`/api/cart/${id}`);

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
          const items = data.data?.line_items || [];
          console.log("Cart loaded successfully:", {
            itemCount: items.length,
            subtotal: data.data?.subtotal,
          });
          setCartItems(items);

          const subtotal = items.reduce((sum: number, item: CartItem) => {
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

  const calculateOrderData = (
    subtotal: number,
    discount: number,
    creditAmount: number = appliedStoreCredit,
  ) => {
    const tax = subtotal * 0.08;
    const shipping = 0;
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

    const newSubtotal = updatedItems.reduce((sum, item) => {
      return sum + (item.price || 0.25) * item.quantity;
    }, 0);

    calculateOrderData(newSubtotal, appliedDiscount, appliedStoreCredit);
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

    return true;
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
        items: cartItems,
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
      };

      console.log("Checkout payload being sent:", {
        amount: checkoutPayload.amount,
        items: checkoutPayload.items?.length,
        customerEmail: checkoutPayload.customerEmail,
        total: checkoutPayload.total,
      });

      const response = await fetch("/api/square/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutPayload),
      });

      const result = await response.json();

      console.log("Checkout response:", response.status, result);

      if (!response.ok) {
        throw new Error(result.error || "Checkout failed");
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
        <main className="pt-20 min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFD713]" />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen bg-black text-white px-10 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Your Cart</h1>

          <form onSubmit={handleCheckout}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items & Form */}
              <div className="lg:col-span-2 space-y-6">
                {cartItems.map((item, index) => (
                  <div
                    key={index}
                    className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
                  >
                    <div className="flex gap-6">
                      <div className="flex flex-col gap-4 flex-shrink-0">
                        <div className="w-48 h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
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
                          <div className="w-48 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center">
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
                                <p className="text-xs text-white/60">
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
                                        <p className="text-white/60">
                                          Regular: ${regularTotal.toFixed(2)}
                                        </p>
                                        <p className="text-white/60">
                                          Quantity: {item.quantity}
                                        </p>
                                        <p className="text-green-400 font-semibold">
                                          Save {item.savePercentage}%
                                        </p>
                                        <p className="text-green-400">
                                          Amount Saved: $
                                          {amountSaved.toFixed(2)}
                                        </p>
                                        <p className="text-white font-bold border-t border-white/20 pt-1">
                                          Total: ${total.toFixed(2)}
                                        </p>
                                      </>
                                    );
                                  })()}
                                </>
                              ) : (
                                <p className="text-white/60">
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

                        <div className="space-y-3 bg-white/5 rounded-lg p-4 mb-4">
                          <h4 className="text-purple-400 text-sm font-bold uppercase tracking-wider">
                            Product Specifications
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-white/60">Quantity</span>
                              <span className="font-medium">
                                {item.quantity}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-white/60">Size</span>
                              <span className="font-medium">Custom</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-purple-400 text-sm font-bold uppercase tracking-wider">
                            Additional Notes
                          </label>
                          <textarea
                            placeholder="Any special instructions or requests..."
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <CheckoutForm
                  customerInfo={customerInfo}
                  billingInfo={billingInfo}
                  onCustomerChange={handleCustomerInfoChange}
                  onBillingChange={handleBillingInfoChange}
                />
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-32 space-y-6">
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold">Order Summary</h3>
                      <button
                        type="button"
                        className="text-white/60 hover:text-white transition"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3 text-sm mb-6 pb-6 border-b border-white/10">
                      <div className="flex justify-between text-white/60">
                        <span>Subtotal ({cartItems.length} items)</span>
                        <span>${orderData.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-white/60">
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
                      <div className="flex justify-between text-green-400">
                        <span>Shipping</span>
                        <span className="font-bold">FREE</span>
                      </div>
                      {appliedDiscount > 0 && (
                        <div className="flex justify-between text-green-400">
                          <span>Deal Savings</span>
                          <span className="font-bold">
                            -${appliedDiscount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {blindShipmentEnabled && (
                        <div className="flex justify-between text-orange-400">
                          <span>Blind Shipment Fee</span>
                          <span>+${orderData.blindShipmentFee.toFixed(2)}</span>
                        </div>
                      )}
                      {orderData.additionalPayment > 0 && (
                        <div className="flex justify-between text-orange-400">
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

                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          placeholder="Discount code"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder-white/40"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleApplyDiscount}
                        disabled={!discountCode}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>

                  {/* Store credit section disabled temporarily */}

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
                    </div>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6 text-lg font-bold rounded-lg mb-3"
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
                  )}

                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                      📦 Estimated Delivery
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Processing</span>
                        <span>2 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Shipping</span>
                        <span>4 days</span>
                      </div>
                      <div className="border-t border-white/10 pt-3 flex justify-between font-bold">
                        <span>Delivery by</span>
                        <span>Mon, Dec 8</span>
                      </div>
                    </div>
                    <p className="text-xs text-white/40 mt-3">
                      * UPS may not deliver on weekends. Delivery dates are
                      automatically moved to the next business day.
                    </p>
                  </div>

                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setExpandedOptions(!expandedOptions)}
                      className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition"
                    >
                      <span className="font-bold">Advanced Cart Options</span>
                      <ChevronDown
                        className={`w-5 h-5 transition ${
                          expandedOptions ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expandedOptions && (
                      <div className="border-t border-white/10 p-6 space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={blindShipmentEnabled}
                              onChange={(e) => {
                                setBlindShipmentEnabled(e.target.checked);
                                calculateOrderData(
                                  orderData.subtotal,
                                  appliedDiscount,
                                  appliedStoreCredit,
                                );
                              }}
                              className="w-5 h-5 rounded"
                            />
                            <div>
                              <p className="font-bold">Blind Shipment</p>
                              <p className="text-xs text-white/60">
                                Hide Sticky Slap logos from packaging
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-orange-400 bg-orange-400/10 rounded p-2">
                            ℹ️ Your order will have generic packaging and
                            shipping labels.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h4 className="font-bold mb-1">
                              Additional Payment
                            </h4>
                            <p className="text-xs text-white/60">
                              Add extra amount to your order
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {[5, 10, 15].map((percent) => (
                              <button
                                key={percent}
                                type="button"
                                onClick={() => handleAdditionalPayment(percent)}
                                className={`py-2 px-3 rounded text-sm font-bold transition ${
                                  additionalPaymentPercent === percent
                                    ? "bg-green-600 text-white"
                                    : "bg-white/5 hover:bg-white/10"
                                }`}
                              >
                                {percent}% ($
                                {(
                                  (orderData.subtotal +
                                    orderData.tax +
                                    orderData.shipping +
                                    (blindShipmentEnabled ? 5 : 0) -
                                    appliedDiscount) *
                                  (percent / 100)
                                ).toFixed(2)}
                                )
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Custom amount ($)"
                              min="0"
                              step="0.01"
                              className="bg-white/5 border-white/10 text-white placeholder-white/40"
                            />
                            <Button
                              type="button"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
