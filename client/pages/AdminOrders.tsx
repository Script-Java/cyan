import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import {
  Package,
  Calendar,
  Mail,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  Image as ImageIcon,
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
        return "bg-orange-500/20 text-orange-300 border border-orange-500/30";
      case "processing":
        return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
      case "printing":
        return "bg-purple-500/20 text-purple-300 border border-purple-500/30";
      case "in transit":
        return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
      case "shipped":
        return "bg-green-500/20 text-green-300 border border-green-500/30";
      case "delivered":
        return "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30";
      default:
        return "bg-white/10 text-white/60 border border-white/10";
    }
  };

  return (
    <AdminLayout>
      <div className="w-full pb-20 md:pb-0">
        {/* Header Section */}
        <div className="border-b border-white/10">
          <div className="px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold text-white flex items-center gap-3">
                  <Package className="w-7 sm:w-9 h-7 sm:h-9 text-green-400" />
                  Orders Management
                </h1>
                <p className="text-white/60 mt-2 text-sm">
                  Manage and track all orders pending shipment
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-48 sm:h-96">
              <div className="text-white/60 text-sm">Loading orders...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Filter className="w-5 h-5 text-white/40 flex-shrink-0" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition"
                  >
                    <option value="all" className="bg-gray-900">
                      All Active Statuses
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

              {/* Orders Table */}
              {filteredOrders.length > 0 ? (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                          <th className="px-4 sm:px-6 py-4 font-semibold text-purple-300 whitespace-nowrap">
                            Order ID
                          </th>
                          <th className="px-4 sm:px-6 py-4 font-semibold text-purple-300 whitespace-nowrap hidden sm:table-cell">
                            Customer
                          </th>
                          <th className="px-4 sm:px-6 py-4 font-semibold text-purple-300 whitespace-nowrap hidden md:table-cell">
                            Email
                          </th>
                          <th className="px-4 sm:px-6 py-4 font-semibold text-purple-300 whitespace-nowrap hidden lg:table-cell">
                            Date
                          </th>
                          <th className="px-4 sm:px-6 py-4 font-semibold text-purple-300 whitespace-nowrap">
                            Status
                          </th>
                          <th className="px-4 sm:px-6 py-4 font-semibold text-purple-300 text-right whitespace-nowrap">
                            Total
                          </th>
                          <th className="px-4 sm:px-6 py-4 font-semibold text-purple-300 text-right whitespace-nowrap">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <div key={order.id}>
                            <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
                              <td className="px-4 sm:px-6 py-4 font-semibold text-white whitespace-nowrap">
                                #{order.id}
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-white/80 whitespace-nowrap hidden sm:table-cell truncate max-w-xs">
                                {order.customerName || "Guest"}
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-white/60 hidden md:table-cell">
                                <div className="flex items-center gap-2 truncate max-w-xs">
                                  <Mail className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate text-xs sm:text-sm">
                                    {order.customerEmail}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-white/60 hidden lg:table-cell whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span className="text-xs sm:text-sm">
                                    {new Date(
                                      order.dateCreated,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                <span
                                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
                                    order.status,
                                  )}`}
                                >
                                  {order.status.charAt(0).toUpperCase() +
                                    order.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 font-semibold text-green-300 text-right whitespace-nowrap text-xs sm:text-sm">
                                ${order.total.toFixed(2)}
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-right">
                                <button
                                  onClick={() =>
                                    setExpandedOrderId(
                                      expandedOrderId === order.id ? null : order.id,
                                    )
                                  }
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600/20 text-green-300 hover:bg-green-600/30 transition-colors font-medium text-xs whitespace-nowrap border border-green-600/30"
                                >
                                  <span>
                                    {expandedOrderId === order.id ? "Hide" : "View"}
                                  </span>
                                  <ChevronDown
                                    className={`w-4 h-4 hidden sm:inline transition-transform ${
                                      expandedOrderId === order.id
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                  />
                                </button>
                              </td>
                            </tr>
                            {expandedOrderId === order.id && (
                              <tr className="border-b border-white/10 bg-white/5">
                                <td colSpan={7} className="px-4 sm:px-6 py-6">
                                  <div className="space-y-6">
                                    <div>
                                      <h3 className="text-lg font-semibold text-white mb-4">
                                        Order Details
                                      </h3>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                                          <p className="text-white/60 text-xs uppercase tracking-wide mb-2">
                                            Subtotal
                                          </p>
                                          <p className="text-lg font-semibold text-white">
                                            $
                                            {(
                                              order.subtotal || order.total * 0.8
                                            ).toFixed(2)}
                                          </p>
                                        </div>
                                        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                                          <p className="text-white/60 text-xs uppercase tracking-wide mb-2">
                                            Tax
                                          </p>
                                          <p className="text-lg font-semibold text-white">
                                            $
                                            {(
                                              order.tax || order.total * 0.1
                                            ).toFixed(2)}
                                          </p>
                                        </div>
                                        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                                          <p className="text-white/60 text-xs uppercase tracking-wide mb-2">
                                            Shipping
                                          </p>
                                          <p className="text-lg font-semibold text-white">
                                            $
                                            {(order.shipping || 0).toFixed(2)}
                                          </p>
                                        </div>
                                        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
                                          <p className="text-white/60 text-xs uppercase tracking-wide mb-2">
                                            Total
                                          </p>
                                          <p className="text-lg font-semibold text-green-300">
                                            ${order.total.toFixed(2)}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {order.orderItems &&
                                      order.orderItems.length > 0 && (
                                        <div>
                                          <h3 className="text-lg font-semibold text-white mb-4">
                                            Items
                                          </h3>
                                          <div className="space-y-4">
                                            {order.orderItems.map((item, idx) => (
                                              <div
                                                key={idx}
                                                className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4"
                                              >
                                                <div className="flex gap-4">
                                                  <div className="flex-1">
                                                    <p className="text-white font-medium">
                                                      {item.product_name ||
                                                        "Product"}
                                                    </p>
                                                    <p className="text-white/60 text-sm mt-1">
                                                      Quantity:{" "}
                                                      {item.quantity || 1}
                                                    </p>
                                                    {item.options &&
                                                      Object.keys(item.options)
                                                        .length > 0 && (
                                                        <div className="mt-2 text-sm text-white/60">
                                                          <p className="font-medium text-white/80">
                                                            Options:
                                                          </p>
                                                          <ul className="mt-1 space-y-1">
                                                            {Object.entries(
                                                              item.options,
                                                            ).map(
                                                              ([key, val]) => (
                                                                <li key={key}>
                                                                  {key}:{" "}
                                                                  {String(val)}
                                                                </li>
                                                              ),
                                                            )}
                                                          </ul>
                                                        </div>
                                                      )}
                                                  </div>
                                                  {item.design_file_url && (
                                                    <div className="flex-shrink-0">
                                                      <p className="text-white/60 text-xs uppercase tracking-wide mb-2">
                                                        Design File
                                                      </p>
                                                      <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center">
                                                        {item.design_file_url.match(
                                                          /\.(jpg|jpeg|png|gif|webp)$/i,
                                                        ) ? (
                                                          <img
                                                            src={
                                                              item.design_file_url
                                                            }
                                                            alt="Design"
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                              e.currentTarget.style.display =
                                                                "none";
                                                            }}
                                                          />
                                                        ) : (
                                                          <a
                                                            href={
                                                              item.design_file_url
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex flex-col items-center gap-1 p-2 hover:text-green-300 transition-colors"
                                                          >
                                                            <ImageIcon className="w-6 h-6 text-white/60" />
                                                            <span className="text-xs text-white/60 text-center">
                                                              View File
                                                            </span>
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
                                  </div>
                                </td>
                              </tr>
                            )}
                          </div>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 sm:p-12 text-center">
                  <Package className="w-16 sm:w-20 h-16 sm:h-20 text-white/20 mx-auto mb-6" />
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                    No Orders Found
                  </h3>
                  <p className="text-sm sm:text-base text-white/60">
                    {searchTerm || filterStatus !== "all"
                      ? "No orders match your search or filter criteria."
                      : "There are no active orders (pending, processing, printing, or in transit) at this time."}
                  </p>
                </div>
              )}

              {/* Summary Stats */}
              {pendingOrders.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
                    <p className="text-white/60 text-xs sm:text-sm mb-3 uppercase tracking-wider">
                      Total Orders
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold text-white">
                      {pendingOrders.length}
                    </p>
                  </div>
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
                    <p className="text-white/60 text-xs sm:text-sm mb-3 uppercase tracking-wider">
                      Total Revenue
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold text-green-300">
                      $
                      {pendingOrders
                        .reduce((sum, order) => sum + order.total, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
                    <p className="text-white/60 text-xs sm:text-sm mb-3 uppercase tracking-wider">
                      Avg Order Value
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold text-blue-300">
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
      </div>
    </AdminLayout>
  );
}
