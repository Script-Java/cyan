import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import ProofNotificationAlert from "@/components/dashboard/ProofNotificationAlert";
import {
  TrendingUp,
  Settings,
  ChevronRight,
  ChevronDown,
  Package,
  Calendar,
  Upload,
  ArrowRight,
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }

    setIsAuthenticated(true);
    fetchPendingOrders();
    setIsLoading(false);
    setLiveVisitors(Math.floor(Math.random() * 50) + 10);
  }, [navigate]);

  const fetchPendingOrders = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      try {
        const response = await fetch("/api/admin/pending-orders", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setPendingOrders(data.orders || []);
          setPendingOrdersCount(data.count || 0);
        } else {
          console.warn(`Failed to fetch pending orders: ${response.status}`);
          setPendingOrders([]);
          setPendingOrdersCount(0);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          console.warn("Pending orders fetch timeout");
        } else {
          console.warn("Failed to fetch pending orders");
        }
        // Gracefully degrade - set empty values
        setPendingOrders([]);
        setPendingOrdersCount(0);
      }
    } catch (error) {
      console.warn("Error in fetchPendingOrders:", error);
      setPendingOrders([]);
      setPendingOrdersCount(0);
    }
  };


  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <main className="py-6">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's what's happening with your store.
            </p>
          </div>

          {/* Proof Notifications */}
          <div className="mb-6">
            <ProofNotificationAlert />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <div className="text-gray-600">Loading dashboard...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pending Orders Section */}
              {pendingOrdersCount > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      Pending Orders
                      <span className="ml-auto text-sm font-normal text-gray-600">
                        {pendingOrdersCount}{" "}
                        {pendingOrdersCount === 1 ? "order" : "orders"}
                      </span>
                    </h2>
                  </div>

                  {/* Orders List */}
                  <div className="divide-y divide-gray-200">
                    {pendingOrders.slice(0, 5).map((order) => (
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
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-900">
                                Order #{order.id}
                              </span>
                              <span className="text-sm text-gray-600">
                                {order.customerName}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(order.dateCreated).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-900">
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
                          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-gray-600">
                                  Customer
                                </p>
                                <p className="text-gray-900">
                                  {order.customerName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {order.customerEmail}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Subtotal
                                  </p>
                                  <p className="text-gray-900">
                                    ${(order.subtotal || 0).toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Tax</p>
                                  <p className="text-gray-900">
                                    ${(order.tax || 0).toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Shipping
                                  </p>
                                  <p className="text-gray-900">
                                    ${(order.shipping || 0).toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Total</p>
                                  <p className="text-gray-900 font-semibold">
                                    ${order.total.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  navigate(`/admin/orders?orderId=${order.id}`)
                                }
                                className="mt-3 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                              >
                                View Full Details
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {pendingOrdersCount > 5 && (
                    <div className="px-6 py-3 text-center border-t border-gray-200">
                      <button
                        onClick={() => navigate("/admin/orders")}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
                      >
                        View All Orders
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Live Visitors */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Live Visitors</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {liveVisitors}
                      </p>
                    </div>
                    <Eye className="w-8 h-8 text-green-600 opacity-50" />
                  </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Pending Orders</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {pendingOrdersCount}
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-yellow-600 opacity-50" />
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Quick Links</p>
                      <button
                        onClick={() => navigate("/admin/settings")}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-flex items-center gap-1"
                      >
                        Settings <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    <Settings className="w-8 h-8 text-blue-600 opacity-50" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </AdminLayout>
  );
}
