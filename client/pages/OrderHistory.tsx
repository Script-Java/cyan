import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  Calendar,
  DollarSign,
  ArrowRight,
  AlertCircle,
  ChevronDown,
  Search,
  X,
  MapPin,
  User,
  Phone,
  Mail,
  MessageSquare,
  Image as ImageIcon,
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

interface Shipment {
  id: number;
  status: string;
  dateCreated: string;
  trackingNumber: string;
  shippingProvider: string;
  shippingMethod: string;
  comments?: string;
  itemsCount: number;
}

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price_inc_tax?: number;
  price_ex_tax?: number;
  price?: number;
  option_price?: number;
  total_price?: number;
  options?: Record<string, any> | Array<{
    option_id?: string;
    option_name?: string;
    name?: string;
    option_value?: string;
    value?: string;
    price?: number;
    modifier_price?: number;
  }>;
  design_file_url?: string;
}

interface DigitalFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  uploaded_at: string;
}

interface Order {
  id: number;
  customerId: number;
  status: string;
  dateCreated: string;
  total: number;
  itemCount: number;
  shipments: Shipment[];
  subtotal?: number;
  tax?: number;
  items?: OrderItem[];
  estimated_delivery_date?: string;
  tracking_number?: string;
  tracking_carrier?: string;
  tracking_url?: string;
  shipped_date?: string;
  digital_files?: DigitalFile[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface OrdersResponse {
  success: boolean;
  orders: Order[];
  count: number;
}

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Helper functions
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

  const formatPrice = (price: number | undefined): string => {
    if (typeof price === "number") {
      return price.toFixed(2);
    }
    return "0.00";
  };

  const getItemPrice = (item: OrderItem): number => {
    if (typeof item.price_inc_tax === "number") return item.price_inc_tax;
    if (typeof item.price_ex_tax === "number") return item.price_ex_tax;
    if (typeof item.price === "number") return item.price;
    return 0;
  };

  const formatOptionValue = (value: any): string => {
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return "";
  };

  const formatOptionKey = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Filter orders based on search query
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();

    // Search by order number/ID
    if (order.id.toString().includes(query)) return true;

    // Search by date (flexible matching: "dec", "2025", "12/25", etc.)
    const orderDate = formatDate(order.dateCreated).toLowerCase();
    if (orderDate.includes(query)) return true;

    // Search by amount (without currency symbol)
    const amount = order.total.toFixed(2);
    if (amount.includes(query)) return true;

    // Search by formatted currency amount
    const currencyAmount = formatCurrency(order.total)
      .replace("$", "")
      .toLowerCase();
    if (currencyAmount.includes(query)) return true;

    return false;
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch order history");
        }

        const data: OrdersResponse = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load order history";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-orange-600 bg-orange-50";
      case "processing":
        return "text-yellow-600 bg-yellow-50";
      case "printing":
        return "text-purple-600 bg-purple-50";
      case "preparing for shipping":
        return "text-indigo-600 bg-indigo-50";
      case "in transit":
        return "text-blue-600 bg-blue-50";
      case "shipped":
        return "text-emerald-600 bg-emerald-50";
      case "delivered":
        return "text-cyan-600 bg-cyan-50";
      case "completed":
        return "text-green-600 bg-green-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getShipmentStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "shipped":
      case "in_transit":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <Package className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600 text-lg">
                Loading your orders...
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Dashboard
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Order History
            </h1>
            <p className="text-gray-600 mt-2">
              View all your orders and track shipments
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Search Bar */}
          {orders.length > 0 && (
            <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search orders by number, date (Dec 1), or amount ($50)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Clear search"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="mt-2 text-sm text-gray-600">
                  Found {filteredOrders.length} order
                  {filteredOrders.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          {/* Empty State */}
          {orders.length === 0 && !error && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No Orders Yet
              </h2>
              <p className="text-gray-600 mb-6">
                You haven't placed any orders yet. Start shopping to see your
                order history here.
              </p>
              <Button
                onClick={() => navigate("/products")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Shop Now
              </Button>
            </div>
          )}

          {/* No search results */}
          {orders.length > 0 && filteredOrders.length === 0 && searchQuery && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-12 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No Orders Found
              </h2>
              <p className="text-gray-600 mb-6">
                No orders match "{searchQuery}". Try searching by order number,
                date, or amount.
              </p>
              <Button
                onClick={() => setSearchQuery("")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Clear Search
              </Button>
            </div>
          )}

          {/* Orders Detailed View */}
          {filteredOrders.length > 0 && (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Order Summary */}
                  <button
                    onClick={() =>
                      setExpandedOrderId(
                        expandedOrderId === order.id ? null : order.id,
                      )
                    }
                    className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 text-left">
                      <div className="bg-gray-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                            Order #{order.id}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            {formatDate(order.dateCreated)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                            {order.itemCount} item
                            {order.itemCount !== 1 ? "s" : ""}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                            {formatCurrency(order.total)}
                          </div>
                          {order.estimated_delivery_date && (
                            <div className="flex items-center gap-1 text-blue-600 font-medium">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">
                                Delivery:
                              </span>{" "}
                              {formatDate(order.estimated_delivery_date)}
                            </div>
                          )}
                          {order.tracking_number && (
                            <div className="flex items-center gap-1 text-green-600 font-medium">
                              <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">
                                Tracking:
                              </span>{" "}
                              {order.tracking_number}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                        expandedOrderId === order.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Order Details - Expanded */}
                  {expandedOrderId === order.id && (
                    <div className="bg-gray-50 border-t-2 border-gray-200 p-3 sm:p-5 space-y-3 sm:space-y-4">
                      {/* Customer Information */}
                      <div className="bg-white rounded-lg border-2 border-blue-200 p-3 sm:p-4 shadow-sm">
                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                          Customer & Shipping Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          {order.customerName && (
                            <div>
                              <p className="text-xs text-gray-600 mb-1">
                                Full Name
                              </p>
                              <p className="text-xs sm:text-sm font-medium text-gray-900">
                                {order.customerName}
                              </p>
                            </div>
                          )}
                          {order.customerEmail && (
                            <div>
                              <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                Email
                              </p>
                              <p className="text-sm font-medium text-blue-600 break-all">
                                {order.customerEmail}
                              </p>
                            </div>
                          )}
                          {order.customerPhone && (
                            <div>
                              <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                Phone
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                {order.customerPhone}
                              </p>
                            </div>
                          )}
                          {order.estimated_delivery_date && (
                            <div>
                              <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Est. Delivery
                              </p>
                              <p className="text-sm font-medium text-blue-600">
                                {formatDate(order.estimated_delivery_date)}
                              </p>
                            </div>
                          )}
                        </div>
                        {order.shippingAddress && (
                          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Shipping Address
                            </p>
                            <div className="text-xs sm:text-sm text-gray-900 space-y-1">
                              <p>{order.shippingAddress.street}</p>
                              <p>
                                {order.shippingAddress.city},{" "}
                                {order.shippingAddress.state}{" "}
                                {order.shippingAddress.postalCode}
                              </p>
                              <p>{order.shippingAddress.country}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Design Thumbnails */}
                      {order.digital_files &&
                        order.digital_files.length > 0 && (
                          <div>
                            <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                              <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                              Design Files
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {order.digital_files.map((file) => (
                                <a
                                  key={file.id}
                                  href={file.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="relative group overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors h-24 sm:h-28"
                                >
                                  {file.file_type?.includes("image") ? (
                                    <img
                                      src={file.file_url}
                                      alt={file.file_name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                      <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-end justify-center opacity-0 group-hover:opacity-100">
                                    <p className="text-white text-xs font-medium mb-2 px-2 text-center truncate">
                                      {file.file_name}
                                    </p>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Digital Files */}
                      {order.digital_files &&
                        order.digital_files.length > 0 && (
                          <div className="bg-white rounded-lg border-2 border-blue-200 p-3 sm:p-4 shadow-sm">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                              📁 Digital Files
                            </h4>
                            <div className="space-y-2">
                              {order.digital_files.map((file) => (
                                <a
                                  key={file.id}
                                  href={file.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between bg-gray-50 p-2 sm:p-3 rounded border border-blue-100 hover:border-blue-400 hover:bg-blue-50 transition-colors gap-2"
                                >
                                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-xs sm:text-sm font-medium text-blue-900 truncate">
                                        {file.file_name}
                                      </p>
                                      {file.file_size && (
                                        <p className="text-xs text-gray-600">
                                          {(
                                            file.file_size /
                                            1024 /
                                            1024
                                          ).toFixed(2)}{" "}
                                          MB
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Order Items */}
                      {order.items && order.items.length > 0 && (
                        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 sm:p-4 shadow-sm">
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                            Order Items
                          </h4>
                          <div className="space-y-3 sm:space-y-4">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="bg-gray-50 p-3 rounded border border-gray-200 space-y-2"
                              >
                                {/* Design File Thumbnail */}
                                {item.design_file_url && (
                                  <div className="flex gap-2 mb-2">
                                    {item.design_file_url.startsWith("data:") ||
                                    item.design_file_url.match(
                                      /\.(jpg|jpeg|png|gif|webp)$/i,
                                    ) ? (
                                      <a
                                        href={item.design_file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0"
                                      >
                                        <img
                                          src={item.design_file_url}
                                          alt="Design Upload"
                                          className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded border border-gray-300 hover:border-blue-400 transition-colors"
                                        />
                                      </a>
                                    ) : (
                                      <a
                                        href={item.design_file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center rounded border border-gray-300 hover:border-blue-400 transition-colors bg-gray-100"
                                      >
                                        <Package className="w-6 h-6 text-gray-400" />
                                      </a>
                                    )}
                                    <div className="flex-1">
                                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                                        {item.product_name}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        Qty: {item.quantity}
                                      </p>
                                      <p className="text-xs sm:text-sm font-semibold text-emerald-600 mt-1">
                                        ${formatPrice(getItemPrice(item))}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Item without design file */}
                                {!item.design_file_url && (
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                                        {item.product_name}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-1">
                                        Qty: {item.quantity}
                                      </p>
                                    </div>
                                    <p className="text-xs sm:text-sm font-semibold text-emerald-600 flex-shrink-0">
                                      ${formatPrice(getItemPrice(item))}
                                    </p>
                                  </div>
                                )}

                                {/* Product Options */}
                                {item.options && (
                                  <div className="pt-2 border-t border-gray-300 space-y-1">
                                    <p className="text-xs font-semibold text-gray-700">
                                      Options:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {Array.isArray(item.options) ? (
                                        item.options.map((option: any, idx: number) => {
                                          const optionName =
                                            option.option_id || option.name || `Option ${idx + 1}`;
                                          const optionValue =
                                            option.option_value || option.value || "";
                                          return (
                                            <span
                                              key={idx}
                                              className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs border border-blue-300"
                                            >
                                              {optionName}: {optionValue}
                                            </span>
                                          );
                                        })
                                      ) : (
                                        Object.entries(item.options).map(([key, value]) => {
                                          const displayValue = formatOptionValue(value);
                                          const label = /^\d+$/.test(key)
                                            ? displayValue
                                            : `${key}: ${displayValue}`;
                                          return (
                                            <span
                                              key={key}
                                              className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs border border-blue-300"
                                            >
                                              {label}
                                            </span>
                                          );
                                        })
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Order Totals */}
                      <div className="bg-white rounded-lg border-2 border-gray-200 p-3 sm:p-4 shadow-sm">
                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-600" />
                          Order Summary
                        </h3>
                        <div className="space-y-2 text-xs sm:text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(order.subtotal || 0)}
                            </span>
                          </div>
                          {order.tax !== undefined && order.tax > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tax:</span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(order.tax)}
                              </span>
                            </div>
                          )}
                          <div className="pt-2 border-t-2 border-gray-300 flex justify-between">
                            <span className="font-bold text-gray-900">
                              Order Total:
                            </span>
                            <span className="font-bold text-lg text-emerald-600">
                              {formatCurrency(order.total)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Shipments and Tracking */}
                      {order.shipments && order.shipments.length > 0 ? (
                        <div className="bg-white rounded-lg border-2 border-blue-200 p-3 sm:p-4 shadow-sm">
                          <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                            <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                            Shipping & Tracking
                          </h3>
                          <div className="space-y-3">
                            {order.shipments.map((shipment) => (
                              <div
                                key={shipment.id}
                                className="bg-gray-50 p-3 rounded border border-gray-200"
                              >
                                <div className="flex items-start justify-between mb-2 gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {getShipmentStatusIcon(shipment.status)}
                                    <div className="min-w-0">
                                      <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                                        {shipment.shippingProvider ||
                                          "Shipment"}{" "}
                                        -{" "}
                                        {shipment.shippingMethod || "Standard"}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        {formatDate(shipment.dateCreated)}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 flex-shrink-0">
                                    {shipment.status
                                      .replace(/_/g, " ")
                                      .charAt(0)
                                      .toUpperCase() +
                                      shipment.status
                                        .replace(/_/g, " ")
                                        .slice(1)}
                                  </span>
                                </div>

                                {shipment.trackingNumber && (
                                  <div className="mb-2 text-xs sm:text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Tracking Number:</span>
                                      <div className="flex flex-col items-end gap-1">
                                        <span className="font-mono font-semibold text-gray-900 text-xs sm:text-sm break-all">
                                          {shipment.trackingNumber}
                                        </span>
                                        {shipment.shippingProvider && (
                                          <span className="text-xs text-gray-500">
                                            {shipment.shippingProvider}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {shipment.comments && (
                                  <div className="mt-2 p-2 sm:p-3 bg-gray-100 rounded text-xs sm:text-sm text-gray-700">
                                    {shipment.comments}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg border-2 border-blue-200 p-3 sm:p-4 shadow-sm">
                          <p className="text-xs sm:text-sm text-gray-700">
                            📦 Your order has not been shipped yet. We'll send
                            you a tracking number as soon as it's on its way!
                          </p>
                        </div>
                      )}

                      {/* Support Ticket Button */}
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                        <button
                          onClick={() => {
                            const ticketData = {
                              orderId: order.id,
                              orderAmount: order.total,
                              orderDate: formatDate(order.dateCreated),
                              orderStatus: order.status,
                              productTypes: order.items
                                ?.map((item) => item.product_name)
                                .join(", "),
                              trackingNumber: order.tracking_number,
                              estimatedDelivery: order.estimated_delivery_date
                                ? formatDate(order.estimated_delivery_date)
                                : "Not available",
                            };

                            // Navigate to support page with pre-filled order data
                            localStorage.setItem(
                              "prefillOrderData",
                              JSON.stringify(ticketData),
                            );
                            navigate("/support");
                          }}
                          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md text-xs sm:text-sm"
                        >
                          <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                          Create Support Ticket
                        </button>
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          Need help with this order? Click above to open a
                          support ticket and we'll pre-fill your order details.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Total Summary */}
          {filteredOrders.length > 0 && (
            <div className="mt-8 bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    {searchQuery ? "Matching Orders" : "Total Orders"}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {filteredOrders.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    {searchQuery ? "Matching Total Spent" : "Total Spent"}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      filteredOrders.reduce(
                        (sum, order) => sum + order.total,
                        0,
                      ),
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    {searchQuery ? "Matching Total Items" : "Total Items"}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {filteredOrders.reduce(
                      (sum, order) => sum + order.itemCount,
                      0,
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
