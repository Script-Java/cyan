import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import MobileAdminPanel from "@/components/MobileAdminPanel";
import {
  Package,
  Calendar,
  Mail,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";

interface PendingOrder {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  dateCreated: string;
  itemCount: number;
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PendingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

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
        return "bg-orange-100 text-orange-800";
      case "shipped":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 md:ml-64 min-h-screen bg-gray-50 pb-20 md:pb-0">
          <div className="pt-4 md:pt-6">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
              <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                      <Package className="w-6 sm:w-8 h-6 sm:h-8 text-orange-600" />
                      Orders Management
                    </h1>
                    <p className="text-gray-600 mt-1 sm:mt-2 text-sm">
                      Manage and track all orders pending shipment
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="text-gray-600">Loading orders...</div>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-6">
                  {/* Search and Filter */}
                  <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 flex flex-col gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-2.5 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>

                  {/* Orders Table */}
                  {filteredOrders.length > 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                              <th className="px-2 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 whitespace-nowrap">
                                Order ID
                              </th>
                              <th className="px-2 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 whitespace-nowrap hidden sm:table-cell">
                                Customer
                              </th>
                              <th className="px-2 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 whitespace-nowrap hidden md:table-cell">
                                Email
                              </th>
                              <th className="px-2 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 whitespace-nowrap hidden lg:table-cell">
                                Date
                              </th>
                              <th className="px-2 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 whitespace-nowrap">
                                Status
                              </th>
                              <th className="px-2 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 text-right whitespace-nowrap">
                                Total
                              </th>
                              <th className="px-2 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 text-right whitespace-nowrap">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredOrders.map((order) => (
                              <tr
                                key={order.id}
                                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-2 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 whitespace-nowrap">
                                  #{order.id}
                                </td>
                                <td className="px-2 sm:px-6 py-3 sm:py-4 text-gray-700 whitespace-nowrap hidden sm:table-cell truncate max-w-xs">
                                  {order.customerName || "Guest"}
                                </td>
                                <td className="px-2 sm:px-6 py-3 sm:py-4 text-gray-600 hidden md:table-cell">
                                  <div className="flex items-center gap-1 truncate max-w-xs">
                                    <Mail className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate text-xs sm:text-sm">{order.customerEmail}</span>
                                  </div>
                                </td>
                                <td className="px-2 sm:px-6 py-3 sm:py-4 text-gray-600 hidden lg:table-cell whitespace-nowrap">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span className="text-xs sm:text-sm">{new Date(
                                      order.dateCreated,
                                    ).toLocaleDateString()}</span>
                                  </div>
                                </td>
                                <td className="px-2 sm:px-6 py-3 sm:py-4">
                                  <span
                                    className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                      order.status,
                                    )}`}
                                  >
                                    {order.status.charAt(0).toUpperCase() +
                                      order.status.slice(1)}
                                  </span>
                                </td>
                                <td className="px-2 sm:px-6 py-3 sm:py-4 font-semibold text-gray-900 text-right whitespace-nowrap text-xs sm:text-sm">
                                  ${order.total.toFixed(2)}
                                </td>
                                <td className="px-2 sm:px-6 py-3 sm:py-4 text-right">
                                  <button className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors font-medium text-xs whitespace-nowrap">
                                    View
                                    <ChevronRight className="w-3 h-3 hidden sm:inline" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-12 text-center">
                      <Package className="w-12 sm:w-16 h-12 sm:h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                        No Orders Found
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        {searchTerm || filterStatus !== "all"
                          ? "No orders match your search or filter criteria."
                          : "There are no pending orders at this time."}
                      </p>
                    </div>
                  )}

                  {/* Summary Stats */}
                  {pendingOrders.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                        <p className="text-gray-600 text-xs sm:text-sm mb-2">
                          Total Orders
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {pendingOrders.length}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                        <p className="text-gray-600 text-xs sm:text-sm mb-2">
                          Total Revenue
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                          $
                          {pendingOrders
                            .reduce((sum, order) => sum + order.total, 0)
                            .toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                        <p className="text-gray-600 text-xs sm:text-sm mb-2">
                          Avg Order Value
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">
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
        </main>

        {/* Mobile Admin Panel */}
        <MobileAdminPanel />
      </div>
    </>
  );
}
