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
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
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
  digitalFiles?: DigitalFile[];
}

export default function OrderStatus() {
  const [orderNumber, setOrderNumber] = useState("SY-54002");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

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

    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/public/order-status?orderNumber=${encodeURIComponent(orderNumber)}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unable to find order");
      }

      const data = await response.json();
      if (data.success) {
        setOrderData(data.data);
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
    setOrderData(null);
    setError("");
    setHasSearched(false);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white text-gray-900 pt-16">
        {/* Hero Section */}
        <section className="relative bg-white overflow-hidden py-12 sm:py-16">
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: "1100px" }}>
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                Track Your Order
                <span className="block bg-gradient-to-r from-[#FFD713] to-[#FFA500] bg-clip-text text-transparent">
                  Status & Delivery
                </span>
              </h1>

              <p className="text-sm sm:text-base text-gray-600 mb-8 leading-relaxed">
                Enter your order number to see the current status,
                tracking information, and estimated delivery date.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="bg-white py-8 sm:py-12">
          <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: "1100px" }}>
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
                <div className={`rounded-lg p-6 sm:p-8 ${getStatusColor(orderData.status)}`}>
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
                        {orderData.id}
                      </p>
                    </div>
                  </div>
                </div>


                {/* Shipping Address */}
                {orderData.shippingAddress && (
                  <div className="backdrop-blur-sm bg-white/40 border border-gray-200/50 rounded-xl p-6 sm:p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-500" />
                      Shipping Address
                    </h3>
                    <div className="text-gray-900 space-y-1">
                      <p className="font-semibold">{orderData.customerName}</p>
                      {orderData.shippingAddress.street && (
                        <p className="text-gray-600">{orderData.shippingAddress.street}</p>
                      )}
                      {orderData.shippingAddress.city && (
                        <p className="text-gray-600">
                          {orderData.shippingAddress.city},{" "}
                          {orderData.shippingAddress.state}{" "}
                          {orderData.shippingAddress.postalCode}
                        </p>
                      )}
                      {orderData.shippingAddress.country && (
                        <p className="text-gray-600">
                          {orderData.shippingAddress.country}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                {orderData.products && orderData.products.length > 0 && (
                  <div className="backdrop-blur-sm bg-white/40 border border-gray-200/50 rounded-xl p-6 sm:p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Package className="w-5 h-5 text-green-500" />
                      Order Items
                    </h3>
                    <div className="space-y-3">
                      {orderData.products.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-start border-b border-gray-200 pb-3 last:border-b-0"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              Product ID: {item.product_id}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <p className="font-bold text-gray-900 flex-shrink-0 ml-4">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Digital Files */}
                {orderData.digitalFiles && orderData.digitalFiles.length > 0 && (
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
                                  {(file.file_size / 1024 / 1024).toFixed(2)} MB
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
                    Order Total
                  </h3>
                  <div className="space-y-3">
                    {orderData.subtotal !== undefined && (
                      <div className="flex justify-between text-gray-600">
                        <span className="font-medium">Subtotal</span>
                        <span>{formatCurrency(orderData.subtotal)}</span>
                      </div>
                    )}
                    {orderData.tax !== undefined && (
                      <div className="flex justify-between text-gray-600">
                        <span className="font-medium">Tax</span>
                        <span>{formatCurrency(orderData.tax)}</span>
                      </div>
                    )}
                    {orderData.shipping !== undefined && (
                      <div className="flex justify-between text-gray-600">
                        <span className="font-medium">Shipping</span>
                        <span>{formatCurrency(orderData.shipping)}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-300 flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>{formatCurrency(orderData.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Order Date */}
                <div className="text-center text-sm text-gray-600 pb-4">
                  Order placed on <span className="font-semibold">{formatDate(orderData.dateCreated)}</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
