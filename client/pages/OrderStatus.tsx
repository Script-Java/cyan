import { useEffect, useState } from "react";
import {
  Package,
  Truck,
  Calendar,
  DollarSign,
  AlertCircle,
  Search,
  X,
  MapPin,
  Mail,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatOrderNumber, parseOrderNumber } from "@/lib/order-number";

interface OrderItemOption {
  option_id?: string | number;
  option_name?: string;
  option_value?: string;
  modifier_price?: number;
  price?: number;
}

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name?: string;
  product_sku?: string;
  product_description?: string;
  options?: OrderItemOption[] | null;
  design_file_url?: string | null;
  line_total?: number;
}

interface DigitalFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  uploaded_at: string;
}

interface OrderData {
  id: number;
  status: string;
  dateCreated: string;
  total: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  customerName?: string;
  customerEmail?: string;
  products: OrderItem[];
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
  trackingCarrier?: string;
  trackingUrl?: string;
  shippedDate?: string;
  digitalFiles?: DigitalFile[];
}

export default function OrderStatus() {
  const [orderNumber, setOrderNumber] = useState("SY-54002");
  const [verificationField, setVerificationField] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [publicAccessToken, setPublicAccessToken] = useState<string | null>(
    null,
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-orange-600 bg-orange-50 border border-orange-200";
      case "processing":
        return "text-yellow-600 bg-yellow-50 border border-yellow-200";
      case "printing":
        return "text-purple-600 bg-purple-50 border border-purple-200";
      case "preparing for shipping":
        return "text-indigo-600 bg-indigo-50 border border-indigo-200";
      case "in transit":
        return "text-blue-600 bg-blue-50 border border-blue-200";
      case "shipped":
        return "text-emerald-600 bg-emerald-50 border border-emerald-200";
      case "delivered":
        return "text-cyan-600 bg-cyan-50 border border-cyan-200";
      case "completed":
        return "text-green-600 bg-green-50 border border-green-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
        return <CheckCircle className="w-5 h-5" />;
      case "in transit":
      case "shipped":
        return <Truck className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrderData(null);
    setHasSearched(true);

    if (!orderNumber.trim()) {
      setError("Please enter an order number");
      return;
    }

    if (!verificationField.trim()) {
      setError("Please enter your email or phone number");
      return;
    }

    try {
      setIsLoading(true);

      // Step 1: Verify order ownership with email or phone
      const verifyResponse = await fetch("/api/public/orders/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          verificationField: verificationField.trim(),
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || "Unable to find order");
      }

      const verifyData = await verifyResponse.json();
      if (!verifyData.verified) {
        setError("Order verification failed. Please check your details.");
        return;
      }

      // Step 2: Fetch order details using public access token
      const orderResponse = await fetch(
        `/api/public/order-status?publicAccessToken=${encodeURIComponent(verifyData.publicAccessToken)}`,
      );

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Unable to find order");
      }

      const data = await orderResponse.json();
      if (data.success) {
        setOrderData(data.data);
        setPublicAccessToken(verifyData.publicAccessToken);
      } else {
        setError(data.error || "Unable to find order");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to look up order";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setOrderNumber("");
    setVerificationField("");
    setOrderData(null);
    setError("");
    setHasSearched(false);
    setPublicAccessToken(null);
  };

  return (
    <>
      <main className="min-h-screen bg-white text-gray-900 pt-16">
        {/* Hero Section */}
        <section className="relative bg-white overflow-hidden py-12 sm:py-16">
          <div
            className="mx-auto px-4 sm:px-6 lg:px-8"
            style={{ maxWidth: "1100px" }}
          >
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                Track Your Order
                <span className="block bg-gradient-to-r from-[#F63049] to-[#d62a3f] bg-clip-text text-transparent">
                  Status & Delivery
                </span>
              </h1>

              <p className="text-sm sm:text-base text-gray-600 mb-8 leading-relaxed">
                Enter your order number to see the current status, tracking
                information, and estimated delivery date.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="bg-white py-8 sm:py-12">
          <div
            className="mx-auto px-4 sm:px-6 lg:px-8"
            style={{ maxWidth: "1100px" }}
          >
            {/* Search Form */}
            <div className="backdrop-blur-sm bg-white/40 border border-gray-200/50 rounded-xl p-6 sm:p-8 mb-8 shadow-sm">
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label
                    htmlFor="orderNumber"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Order Number
                  </label>
                  <input
                    id="orderNumber"
                    type="text"
                    placeholder="e.g., SY-54011"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 text-gray-900 placeholder-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: SY-XXXXX (found in your order confirmation email)
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="verification"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Verification
                  </label>
                  <input
                    id="verification"
                    type="text"
                    placeholder="Enter your email or phone number"
                    value={verificationField}
                    onChange={(e) => setVerificationField(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 text-gray-900 placeholder-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email or phone number associated with your order
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Search className="w-5 h-5" />
                    {isLoading ? "Searching..." : "Find Order"}
                  </button>
                  {orderData && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 border border-gray-300 text-gray-900 rounded-lg font-bold hover:bg-gray-200 transition-all"
                    >
                      <X className="w-5 h-5" />
                      New Search
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">{error}</p>
                  {error === "Order not found" && (
                    <p className="text-xs text-red-700 mt-1">
                      Please verify your order number and try again.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* No Search Yet */}
            {!hasSearched && !orderData && !error && (
              <div className="backdrop-blur-sm bg-blue-50/40 border border-blue-200/50 rounded-xl p-8 sm:p-12 text-center">
                <Package className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  Ready to Track?
                </h2>
                <p className="text-gray-600">
                  Enter your order number and email above to get started.
                </p>
              </div>
            )}

            {/* Order Found */}
            {orderData && (
              <div className="space-y-6">
                {/* Status Overview */}
                <div
                  className={`rounded-lg p-6 sm:p-8 ${getStatusColor(orderData.status)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(orderData.status)}
                        <h2 className="text-2xl sm:text-3xl font-bold">
                          Order Status
                        </h2>
                      </div>
                      <p className="text-base font-semibold capitalize">
                        {orderData.status.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 mb-1">Order #</p>
                      <p className="text-2xl font-bold">
                        {formatOrderNumber(orderData.id)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tracking Information */}
                {orderData.trackingNumber && (
                  <div className="backdrop-blur-sm bg-white/40 border border-gray-200/50 rounded-xl p-6 sm:p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-blue-600" />
                      Tracking Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">
                            Tracking Number
                          </p>
                          <p className="text-lg font-mono font-bold text-gray-900 mt-1">
                            {orderData.trackingNumber}
                          </p>
                        </div>
                        {orderData.trackingUrl && (
                          <a
                            href={orderData.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                          >
                            Track Package
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      {orderData.trackingCarrier && (
                        <div className="p-4 bg-gray-50/50 border border-gray-200 rounded-lg">
                          <p className="text-xs font-semibold text-gray-600 uppercase">
                            Carrier
                          </p>
                          <p className="text-base font-medium text-gray-900 mt-1">
                            {orderData.trackingCarrier}
                          </p>
                        </div>
                      )}

                      {orderData.shippedDate && (
                        <div className="p-4 bg-gray-50/50 border border-gray-200 rounded-lg">
                          <p className="text-xs font-semibold text-gray-600 uppercase">
                            Shipped On
                          </p>
                          <p className="text-base font-medium text-gray-900 mt-1">
                            {formatDate(orderData.shippedDate)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Digital Files */}
                {orderData.digitalFiles &&
                  orderData.digitalFiles.length > 0 && (
                    <div className="backdrop-blur-sm bg-white/40 border border-gray-200/50 rounded-xl p-6 sm:p-8 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-green-500" />
                        Design Files
                      </h3>
                      <div className="space-y-3">
                        {orderData.digitalFiles.map((file) => (
                          <a
                            key={file.id}
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-green-50/50 border border-gray-200 hover:border-green-200 rounded-lg transition-colors gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Package className="w-5 h-5 text-green-600 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {file.file_name}
                                </p>
                                {file.file_size && (
                                  <p className="text-xs text-gray-600">
                                    {(file.file_size / 1024 / 1024).toFixed(2)}{" "}
                                    MB
                                  </p>
                                )}
                              </div>
                            </div>
                            <ExternalLink className="w-5 h-5 text-green-600 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Order Summary */}
                <div className="backdrop-blur-sm bg-white/40 border border-gray-200/50 rounded-xl p-6 sm:p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Order Total Breakdown
                  </h3>

                  {/* Items Cost */}
                  {orderData.products && orderData.products.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Item Costs
                      </h4>
                      <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                        {orderData.products.map((item) => (
                          <div
                            key={item.id}
                            className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
                          >
                            <div className="flex gap-3 items-start mb-3">
                              {/* Design Thumbnail */}
                              {item.design_file_url && (
                                <div className="flex-shrink-0">
                                  <img
                                    src={item.design_file_url}
                                    alt={item.product_name || "Product Design"}
                                    className="w-16 h-16 rounded border border-gray-300 object-cover"
                                  />
                                </div>
                              )}

                              {/* Product Details */}
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-700 font-medium">
                                    {item.product_name ||
                                      `Product ${item.product_id}`}
                                  </span>
                                  <span className="font-semibold text-gray-900">
                                    {formatCurrency(item.line_total || 0)}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 mb-2">
                                  {item.quantity} × {formatCurrency(item.price)}
                                </div>
                              </div>
                            </div>

                            {/* Options Summary */}
                            {item.options && item.options.length > 0 && (
                              <div className="ml-3 mt-2 pt-2 border-t border-gray-300 space-y-1">
                                {item.options.map((option, optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className="flex justify-between text-xs text-gray-600"
                                  >
                                    <span>
                                      <span className="font-semibold">
                                        {option.option_name}:
                                      </span>{" "}
                                      {option.option_value}
                                    </span>
                                    {option.modifier_price &&
                                      option.modifier_price > 0 && (
                                        <span className="text-gray-700 font-semibold">
                                          +
                                          {formatCurrency(
                                            option.modifier_price,
                                          )}
                                        </span>
                                      )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cost Breakdown */}
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    {orderData.subtotal !== undefined && (
                      <div className="flex justify-between text-gray-600">
                        <span className="font-medium">Subtotal (Items)</span>
                        <span className="font-semibold">
                          {formatCurrency(orderData.subtotal)}
                        </span>
                      </div>
                    )}
                    {orderData.tax !== undefined && orderData.tax > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span className="font-medium">Sales Tax</span>
                        <span className="font-semibold">
                          {formatCurrency(orderData.tax)}
                        </span>
                      </div>
                    )}
                    {orderData.shipping !== undefined &&
                      orderData.shipping > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span className="font-medium">Shipping</span>
                          <span className="font-semibold">
                            {formatCurrency(orderData.shipping)}
                          </span>
                        </div>
                      )}
                    {orderData.shipping === 0 &&
                      orderData.shipping !== undefined && (
                        <div className="flex justify-between text-gray-600">
                          <span className="font-medium">Shipping</span>
                          <span className="font-semibold text-green-600">
                            Free
                          </span>
                        </div>
                      )}

                    {/* Final Total */}
                    <div className="pt-3 border-t border-gray-300 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 flex justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        Final Total
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(orderData.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Date */}
                <div className="text-center text-sm text-gray-600 pb-4">
                  Order placed on{" "}
                  <span className="font-semibold">
                    {formatDate(orderData.dateCreated)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
