import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import AdminNavigationGrid from "@/components/AdminNavigationGrid";
import OrderStatusEditor from "@/components/OrderStatusEditor";
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
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PendingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);

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

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch("/api/admin/orders/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPendingOrders(data.orders || []);
        setFilteredOrders(data.orders || []);
      } else {
        console.error("Failed to fetch pending orders:", response.status);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = pendingOrders;

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
  }, [searchTerm, filterStatus, pendingOrders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-orange-300 bg-orange-500/20 border border-orange-500/30";
      case "processing":
        return "text-yellow-300 bg-yellow-500/20 border border-yellow-500/30";
      case "printing":
        return "text-purple-300 bg-purple-500/20 border border-purple-500/30";
      case "in transit":
        return "text-blue-300 bg-blue-500/20 border border-blue-500/30";
      case "shipped":
        return "text-green-300 bg-green-500/20 border border-green-500/30";
      case "delivered":
        return "text-cyan-300 bg-cyan-500/20 border border-cyan-500/30";
      default:
        return "text-white/60 bg-white/10 border border-white/10";
    }
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <main className="min-h-screen bg-black py-6">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">Orders</h1>
            <p className="text-white/60 mt-1">
              Manage and track all pending orders
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white/80 mb-3">
              Quick Navigation
            </h2>
            <AdminNavigationGrid />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <div className="text-white/60">Loading orders...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search by order, customer, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-white/40 flex-shrink-0" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  >
                    <option value="all" className="bg-gray-900">
                      All Statuses
                    </option>
                    <option value="pending" className="bg-gray-900">
                      Pending
                    </option>
                    <option value="processing" className="bg-gray-900">
                      Processing
                    </option>
                    <option value="printing" className="bg-gray-900">
                      Printing
                    </option>
                    <option value="in transit" className="bg-gray-900">
                      In Transit
                    </option>
                  </select>
                </div>
              </div>

              {/* Orders List */}
              {filteredOrders.length > 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden backdrop-blur-sm">
                  {/* Header */}
                  <div className="px-6 py-3 border-b border-white/10 bg-white/5">
                    <h2 className="text-lg font-semibold text-white">
                      Orders
                      <span className="ml-3 text-sm font-normal text-white/60">
                        {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"}
                      </span>
                    </h2>
                  </div>

                  {/* Orders */}
                  <div className="divide-y divide-white/10">
                    {filteredOrders.map((order) => (
                      <div key={order.id}>
                        {/* Order Row */}
                        <button
                          onClick={() =>
                            setExpandedOrderId(
                              expandedOrderId === order.id ? null : order.id,
                            )
                          }
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-semibold text-white">
                                Order #{order.id}
                              </span>
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  order.status,
                                )}`}
                              >
                                {order.status.charAt(0).toUpperCase() +
                                  order.status.slice(1)}
                              </span>
                            </div>
                            <div className="text-sm text-white/60 mt-1">
                              {order.customerName} •{" "}
                              <span className="text-white/50">
                                {order.customerEmail}
                              </span>
                            </div>
                            <div className="text-xs text-white/50 mt-1">
                              {formatDate(order.dateCreated)}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                            <span className="font-semibold text-green-300 text-right">
                              ${order.total.toFixed(2)}
                            </span>
                            <ChevronDown
                              className={`w-5 h-5 text-white/60 transition-transform ${
                                expandedOrderId === order.id ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </button>

                        {/* Order Details */}
                        {expandedOrderId === order.id && (
                          <div className="px-6 py-4 bg-white/5 border-t border-white/10 space-y-4">
                            {/* Edit Button */}
                            <button
                              onClick={() => setEditingOrderId(order.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-green-300 hover:text-green-200 transition-colors text-sm font-medium"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Status & Tracking
                            </button>
                            {/* Price Breakdown */}
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-3">
                                Price Breakdown
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-white/5 rounded border border-white/10 p-3">
                                  <p className="text-xs text-white/60">
                                    Subtotal
                                  </p>
                                  <p className="text-sm font-semibold text-white">
                                    ${(order.subtotal || order.total * 0.8).toFixed(2)}
                                  </p>
                                </div>
                                <div className="bg-white/5 rounded border border-white/10 p-3">
                                  <p className="text-xs text-white/60">Tax</p>
                                  <p className="text-sm font-semibold text-white">
                                    ${(order.tax || order.total * 0.1).toFixed(2)}
                                  </p>
                                </div>
                                <div className="bg-white/5 rounded border border-white/10 p-3">
                                  <p className="text-xs text-white/60">
                                    Shipping
                                  </p>
                                  <p className="text-sm font-semibold text-white">
                                    ${(order.shipping || 0).toFixed(2)}
                                  </p>
                                </div>
                                <div className="bg-green-500/20 border border-green-500/30 rounded p-3">
                                  <p className="text-xs text-white/60">Total</p>
                                  <p className="text-sm font-semibold text-green-300">
                                    ${order.total.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Items */}
                            {order.orderItems && order.orderItems.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-white mb-3">
                                  Items ({order.orderItems.length})
                                </h4>
                                <div className="space-y-3">
                                  {order.orderItems.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="bg-white/5 rounded border border-white/10 p-3"
                                    >
                                      <div className="flex gap-4 items-start">
                                        <div className="flex-1 min-w-0">
                                          <p className="text-white font-medium text-sm">
                                            {item.product_name || "Product"}
                                          </p>
                                          <p className="text-white/60 text-xs mt-1">
                                            Qty: {item.quantity || 1}
                                          </p>
                                          {item.options &&
                                            Object.keys(item.options).length >
                                              0 && (
                                              <div className="mt-2 text-xs text-white/60 space-y-1">
                                                {Object.entries(
                                                  item.options,
                                                ).map(([key, val]) => (
                                                  <div key={key}>
                                                    <span className="text-white/80">
                                                      {key}:
                                                    </span>{" "}
                                                    {String(val)}
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                        </div>
                                        {item.design_file_url && (
                                          <div className="flex-shrink-0">
                                            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded overflow-hidden flex items-center justify-center">
                                              {item.design_file_url.match(
                                                /\.(jpg|jpeg|png|gif|webp)$/i,
                                              ) ? (
                                                <img
                                                  src={item.design_file_url}
                                                  alt="Design"
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
                                                  className="flex items-center gap-1 p-1 hover:text-green-300 transition-colors"
                                                >
                                                  <ImageIcon className="w-5 h-5 text-white/60" />
                                                </a>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Customer Info */}
                            <div className="bg-white/5 rounded border border-white/10 p-3">
                              <h4 className="text-sm font-semibold text-white mb-2">
                                Customer
                              </h4>
                              <p className="text-sm text-white">
                                {order.customerName}
                              </p>
                              <p className="text-sm text-white/60">
                                {order.customerEmail}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-lg p-8 sm:p-12 text-center">
                  <Package className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-1">
                    No Orders Found
                  </h3>
                  <p className="text-sm text-white/60">
                    {searchTerm || filterStatus !== "all"
                      ? "No orders match your search or filter criteria."
                      : "There are no active orders at this time."}
                  </p>
                </div>
              )}

              {/* Summary Stats */}
              {pendingOrders.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <p className="text-xs text-white/60 mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-white">
                      {pendingOrders.length}
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <p className="text-xs text-white/60 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-300">
                      $
                      {pendingOrders
                        .reduce((sum, order) => sum + order.total, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <p className="text-xs text-white/60 mb-1">
                      Avg Order Value
                    </p>
                    <p className="text-2xl font-bold text-blue-300">
                      $
                      {(
                        pendingOrders.reduce(
                          (sum, order) => sum + order.total,
                          0,
                        ) / pendingOrders.length
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </AdminLayout>
  );
}
