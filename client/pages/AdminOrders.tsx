import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import AdminNavigationGrid from "@/components/AdminNavigationGrid";
import OrderStatusEditor from "@/components/OrderStatusEditor";
import ShippingLabelModal from "@/components/ShippingLabelModal";
import ShippingAddressEditor from "@/components/ShippingAddressEditor";
import {
  Package,
  Calendar,
  Mail,
  ChevronDown,
  Search,
  Filter,
  Image as ImageIcon,
  ArrowRight,
  Edit,
  Truck,
  Loader2,
} from "lucide-react";

interface OrderItem {
  id?: number;
  quantity?: number;
  product_name?: string;
  options?: Record<string, any>;
  design_file_url?: string;
}

interface PendingOrder {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  status: string;
  total: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  dateCreated: string;
  itemCount?: number;
  orderItems?: OrderItem[];
  tracking_number?: string;
  tracking_carrier?: string;
  tracking_url?: string;
  shipped_date?: string;
  shipping_addresses?: Array<{
    first_name: string;
    last_name: string;
    street_1: string;
    street_2?: string;
    city: string;
    state_or_province: string;
    postal_code: string;
    country_iso2: string;
    phone?: string;
  }>;
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PendingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [hideRecentOrders, setHideRecentOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [shippingLabelOrderId, setShippingLabelOrderId] = useState<
    number | null
  >(null);
  const [editingShippingAddressOrderId, setEditingShippingAddressOrderId] =
    useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }
    setIsAuthenticated(true);
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async (retryCount = 0) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found");
        setIsLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout

      const response = await fetch("/api/admin/all-orders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.text().catch(() => "");
        console.error(`Failed to fetch orders: ${response.status} ${response.statusText}`, errorData);

        // Retry on server errors, but not on auth errors
        if (response.status >= 500 && retryCount < 2) {
          console.log(`Retrying orders fetch (attempt ${retryCount + 2})...`);
          setTimeout(() => fetchOrders(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }

        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setPendingOrders(data.orders || []);
      setFilteredOrders(data.orders || []);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.error("Orders fetch timeout after 60 seconds");
      } else {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error fetching orders:", errorMessage);
      }

      // Retry on network errors
      if (retryCount < 2) {
        console.log(`Retrying orders fetch (attempt ${retryCount + 2}) after network error...`);
        setTimeout(() => fetchOrders(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = pendingOrders;

    // Hide orders from the past 7 days if toggle is enabled
    if (hideRecentOrders) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(
        (order) => new Date(order.dateCreated) < sevenDaysAgo,
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toString().includes(searchTerm) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, filterStatus, pendingOrders, hideRecentOrders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "text-gray-300 bg-gray-500/20 border border-gray-500/30";
      case "paid":
        return "text-emerald-300 bg-emerald-500/20 border border-emerald-500/30";
      case "pending":
        return "text-orange-300 bg-orange-500/20 border border-orange-500/30";
      case "processing":
        return "text-yellow-300 bg-yellow-500/20 border border-yellow-500/30";
      case "printing":
        return "text-purple-300 bg-purple-500/20 border border-purple-500/30";
      case "preparing for shipping":
        return "text-indigo-300 bg-indigo-500/20 border border-indigo-500/30";
      case "in transit":
        return "text-blue-300 bg-blue-500/20 border border-blue-500/30";
      case "shipped":
        return "text-green-300 bg-green-500/20 border border-green-500/30";
      case "delivered":
        return "text-cyan-300 bg-cyan-500/20 border border-cyan-500/30";
      case "cancelled":
        return "text-red-300 bg-red-500/20 border border-red-500/30";
      default:
        return "text-gray-600 bg-gray-100 border border-gray-200";
    }
  };

  const getStatusDisplayLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending_payment: "Pending Payment",
      paid: "Awaiting Fulfillment",
      pending: "Pending",
      processing: "Processing",
      printing: "Printing",
      "preparing for shipping": "Preparing for Shipping",
      "in transit": "In Transit",
      shipped: "Shipped",
      delivered: "Delivered",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatOptionValue = (value: any): string => {
    if (value === null || value === undefined) {
      return "N/A";
    }
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "number") {
      return String(value);
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return "Complex Object";
      }
    }
    return String(value);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">
            View and manage all orders across all statuses
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Quick Navigation
          </h2>
            <AdminNavigationGrid />
          </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-gray-600">Loading orders...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by order, customer, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending_payment">Pending Payment</option>
                      <option value="paid">Awaiting Fulfillment</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="printing">Printing</option>
                      <option value="preparing for shipping">
                        Preparing for Shipping
                      </option>
                      <option value="in transit">In Transit</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Hide Recent Orders Toggle */}
                <div className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-lg w-fit">
                  <input
                    type="checkbox"
                    id="hideRecentOrders"
                    checked={hideRecentOrders}
                    onChange={(e) => setHideRecentOrders(e.target.checked)}
                    className="w-4 h-4 rounded border border-gray-300 bg-white cursor-pointer accent-green-500"
                  />
                  <label
                    htmlFor="hideRecentOrders"
                    className="text-sm text-gray-700 cursor-pointer font-medium"
                  >
                    Hide orders from past 7 days
                  </label>
                </div>
              </div>

            {/* Orders List */}
            {filteredOrders.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Header */}
                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Orders
                    <span className="ml-3 text-sm font-normal text-gray-600">
                      {filteredOrders.length}{" "}
                      {filteredOrders.length === 1 ? "order" : "orders"}
                    </span>
                  </h2>
                </div>

                {/* Orders */}
                <div className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <div key={order.id}>
                    {/* Order Row */}
                    <button
                      onClick={() =>
                        setExpandedOrderId(
                          expandedOrderId === order.id ? null : order.id,
                        )
                      }
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-semibold text-gray-900">
                            Order #{order.id}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              order.status,
                            )}`}
                          >
                            {getStatusDisplayLabel(order.status)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {order.customerName} •{" "}
                          <span className="text-gray-500">
                            {order.customerEmail}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(order.dateCreated)}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                        <span className="font-semibold text-green-600 text-right">
                          ${order.total.toFixed(2)}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-600 transition-transform ${
                            expandedOrderId === order.id ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* Order Details */}
                    {expandedOrderId === order.id && (
                      <div className="px-6 py-4 bg-white border-t border-gray-200 space-y-4">
                            {/* Action Buttons */}
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => setEditingOrderId(order.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 border border-green-300 rounded-lg text-green-700 hover:text-green-800 transition-colors text-sm font-medium"
                              >
                                <Edit className="w-4 h-4" />
                                Edit Status & Tracking
                              </button>
                              <button
                                onClick={() =>
                                  setShippingLabelOrderId(order.id)
                                }
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg text-blue-700 hover:text-blue-800 transition-colors text-sm font-medium"
                              >
                                <Truck className="w-4 h-4" />
                                Purchase Shipping Label
                              </button>
                            </div>
                            {/* Price Breakdown */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                Price Breakdown
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-gray-50 rounded border border-gray-200 p-3">
                                  <p className="text-xs text-gray-600">
                                    Subtotal
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    $
                                    {(
                                      order.subtotal || order.total * 0.8
                                    ).toFixed(2)}
                                  </p>
                                </div>
                                <div className="bg-gray-50 rounded border border-gray-200 p-3">
                                  <p className="text-xs text-gray-600">Tax</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    $
                                    {(order.tax || order.total * 0.1).toFixed(
                                      2,
                                    )}
                                  </p>
                                </div>
                                <div className="bg-gray-50 rounded border border-gray-200 p-3">
                                  <p className="text-xs text-gray-600">
                                    Shipping
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    ${(order.shipping || 0).toFixed(2)}
                                  </p>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded p-3">
                                  <p className="text-xs text-gray-600">Total</p>
                                  <p className="text-sm font-semibold text-green-700">
                                    ${order.total.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Items */}
                            {order.orderItems &&
                              order.orderItems.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                    Order Items ({order.orderItems.length})
                                  </h4>
                                  <div className="space-y-4">
                                    {order.orderItems.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="bg-white rounded border border-gray-200 p-4"
                                      >
                                        <div className="flex gap-4 items-start">
                                          {/* Product Image Thumbnail */}
                                          {item.design_file_url && (
                                            <div className="flex-shrink-0">
                                              <div className="w-24 h-24 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
                                                {item.design_file_url.match(
                                                  /\.(jpg|jpeg|png|gif|webp)$/i,
                                                ) ? (
                                                  <img
                                                    src={item.design_file_url}
                                                    alt="Design Upload"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                      e.currentTarget.style.display =
                                                        "none";
                                                    }}
                                                  />
                                                ) : (
                                                  <a
                                                    href={item.design_file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 p-1 hover:text-green-700 transition-colors"
                                                    title="View full design"
                                                  >
                                                    <ImageIcon className="w-6 h-6 text-gray-500" />
                                                  </a>
                                                )}
                                              </div>
                                            </div>
                                          )}

                                          {/* Product Details */}
                                          <div className="flex-1 min-w-0">
                                            <h5 className="text-gray-900 font-semibold text-sm mb-2">
                                              {item.product_name || "Product"}
                                            </h5>

                                            {/* Quantity */}
                                            <div className="mb-3">
                                              <p className="text-xs text-gray-600 font-medium">
                                                QUANTITY
                                              </p>
                                              <p className="text-sm text-gray-900 font-medium">
                                                {item.quantity || 1} {item.quantity === 1 ? 'unit' : 'units'}
                                              </p>
                                            </div>

                                            {/* Product Options */}
                                            {item.options &&
                                              Object.keys(item.options).length >
                                                0 && (
                                                <div>
                                                  <p className="text-xs text-gray-600 font-medium mb-2">
                                                    SPECIFICATIONS
                                                  </p>
                                                  <div className="flex flex-wrap gap-2">
                                                    {Object.entries(
                                                      item.options,
                                                    ).map(([key, val]) => {
                                                      const displayValue = formatOptionValue(val);
                                                      // Check if key is numeric (option ID)
                                                      // If so, just show the value; otherwise show key: value
                                                      const isNumericKey = /^\d+$/.test(key);
                                                      const label = isNumericKey ? displayValue : `${key}: ${displayValue}`;

                                                      return (
                                                        <span
                                                          key={key}
                                                          className="inline-block bg-blue-50 text-blue-900 px-3 py-1 rounded-full text-xs font-medium border border-blue-200"
                                                        >
                                                          {label}
                                                        </span>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {/* Tracking Information */}
                            <div className="bg-gray-50 rounded border border-gray-200 p-3">
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                Tracking Information
                              </h4>
                              {order.tracking_number ? (
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs text-gray-600">
                                      Tracking Number
                                    </p>
                                    <p className="text-sm font-mono text-gray-900">
                                      {order.tracking_number}
                                    </p>
                                  </div>
                                  {order.tracking_carrier && (
                                    <div>
                                      <p className="text-xs text-gray-600">
                                        Carrier
                                      </p>
                                      <p className="text-sm text-gray-900">
                                        {order.tracking_carrier}
                                      </p>
                                    </div>
                                  )}
                                  {order.tracking_url && (
                                    <div>
                                      <a
                                        href={order.tracking_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-700 transition-colors break-all"
                                      >
                                        Track Package →
                                      </a>
                                    </div>
                                  )}
                                  {order.shipped_date && (
                                    <div>
                                      <p className="text-xs text-gray-600">
                                        Shipped
                                      </p>
                                      <p className="text-sm text-gray-900">
                                        {formatDate(order.shipped_date)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-600">
                                  No tracking information yet
                                </p>
                              )}
                            </div>

                            {/* Customer Info */}
                            <div className="bg-gray-50 rounded border border-gray-200 p-3">
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                Customer
                              </h4>
                              <p className="text-sm text-gray-900">
                                {order.customerName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {order.customerEmail}
                              </p>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-gray-50 rounded border border-gray-200 p-3">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-gray-900">
                                  Shipping Address
                                </h4>
                                <button
                                  onClick={() =>
                                    setEditingShippingAddressOrderId(order.id)
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded text-blue-700 hover:text-blue-800 transition-colors text-xs font-medium"
                                >
                                  <Edit className="w-3 h-3" />
                                  {order.shipping_addresses &&
                                  order.shipping_addresses.length > 0
                                    ? "Edit"
                                    : "Add"}
                                </button>
                              </div>
                              {order.shipping_addresses &&
                              order.shipping_addresses.length > 0 ? (
                                order.shipping_addresses.map((address, idx) => (
                                  <div key={idx} className="text-sm">
                                    <p className="text-gray-900">
                                      {address.first_name} {address.last_name}
                                    </p>
                                    <p className="text-gray-600">
                                      {address.street_1}
                                    </p>
                                    {address.street_2 && (
                                      <p className="text-gray-600">
                                        {address.street_2}
                                      </p>
                                    )}
                                    <p className="text-gray-600">
                                      {address.city},{" "}
                                      {address.state_or_province}{" "}
                                      {address.postal_code}
                                    </p>
                                    <p className="text-gray-600">
                                      {address.country_iso2}
                                    </p>
                                    {address.phone && (
                                      <p className="text-gray-600 mt-1">
                                        {address.phone}
                                      </p>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-gray-600">
                                  No shipping address yet. Click "Add" to add
                                  one.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-8 sm:p-12 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  No Orders Found
                </h3>
                <p className="text-sm text-gray-600">
                  {searchTerm || filterStatus !== "all" || hideRecentOrders
                    ? "No orders match your search or filter criteria."
                    : "There are no orders at this time."}
                </p>
              </div>
            )}

            {/* Summary Stats */}
            {filteredOrders.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredOrders.length}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    $
                    {filteredOrders
                      .reduce((sum, order) => sum + order.total, 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">
                    Avg Order Value
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    $
                    {(
                      filteredOrders.reduce(
                        (sum, order) => sum + order.total,
                        0,
                      ) / filteredOrders.length
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            )}
            </div>
          )}
      </div>

      {/* Order Status Editor Modal */}
      {editingOrderId !== null && (
        <OrderStatusEditor
          orderId={editingOrderId}
          currentStatus={
            pendingOrders.find((o) => o.id === editingOrderId)?.status || ""
          }
          currentTrackingNumber={
            pendingOrders.find((o) => o.id === editingOrderId)?.tracking_number
          }
          currentTrackingCarrier={
            pendingOrders.find((o) => o.id === editingOrderId)?.tracking_carrier
          }
          currentTrackingUrl={
            pendingOrders.find((o) => o.id === editingOrderId)?.tracking_url
          }
          onClose={() => setEditingOrderId(null)}
          onSuccess={() => {
            setEditingOrderId(null);
            fetchOrders();
          }}
        />
      )}

      {/* Shipping Label Modal */}
      {shippingLabelOrderId !== null && (
        <ShippingLabelModal
          orderId={shippingLabelOrderId}
          orderNumber={shippingLabelOrderId.toString()}
          shippingAddress={
            pendingOrders.find((o) => o.id === shippingLabelOrderId)
              ?.shipping_addresses?.[0]
          }
          onClose={() => setShippingLabelOrderId(null)}
          onSuccess={() => {
            setShippingLabelOrderId(null);
            fetchOrders();
          }}
        />
      )}

      {/* Shipping Address Editor Modal */}
      {editingShippingAddressOrderId !== null && (
        <ShippingAddressEditor
          orderId={editingShippingAddressOrderId}
          currentAddress={
            pendingOrders.find((o) => o.id === editingShippingAddressOrderId)
              ?.shipping_addresses?.[0]
          }
          onClose={() => setEditingShippingAddressOrderId(null)}
          onSuccess={() => {
            setEditingShippingAddressOrderId(null);
            fetchOrders();
          }}
        />
      )}
    </AdminLayout>
  );
}
