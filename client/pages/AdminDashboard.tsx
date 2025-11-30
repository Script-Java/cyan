import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import ProofNotificationAlert from "@/components/dashboard/ProofNotificationAlert";
import {
  BarChart3,
  Users,
  TrendingUp,
  Eye,
  DollarSign,
  Settings,
  ChevronRight,
  Package,
  Calendar,
  Mail,
  Upload,
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }
    setIsAuthenticated(true);
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("authToken");

      // Simulate fetching live visitor data
      setLiveVisitors(Math.floor(Math.random() * 500) + 50);

      // Fetch pending orders
      if (token) {
        const response = await fetch("/api/admin/orders/pending", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPendingOrders(data.orders || []);
          setPendingOrdersCount(data.count || 0);
        } else {
          console.error("Failed to fetch pending orders:", response.status);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const adminLinks = [
    {
      title: "Import Products",
      description: "Import products from CSV files",
      icon: <Upload className="w-8 h-8" />,
      path: "/admin/import-products",
      color: "bg-purple-50 hover:bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      title: "Support Admin",
      description: "Manage customer support tickets",
      icon: <BarChart3 className="w-8 h-8" />,
      path: "/admin/support",
      color: "bg-orange-50 hover:bg-orange-100",
      textColor: "text-orange-600",
    },
    {
      title: "Store Credit",
      description: "Manage customer balances",
      icon: <DollarSign className="w-8 h-8" />,
      path: "/store-credit-admin",
      color: "bg-emerald-50 hover:bg-emerald-100",
      textColor: "text-emerald-600",
    },
    {
      title: "Settings",
      description: "Configure store settings",
      icon: <Settings className="w-8 h-8" />,
      path: "/admin/settings",
      color: "bg-blue-50 hover:bg-blue-100",
      textColor: "text-blue-600",
    },
  ];

  return (
    <>
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 ml-64 min-h-screen bg-black text-white">
          <div className="pt-4">
            {/* Header Section */}
            <div className="border-b border-white/10 bg-black">
              <div className="px-6 lg:px-8 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Dashboard
                    </h1>
                    <p className="text-white/60 mt-1 text-sm">
                      Welcome back! Here's what's happening with your store
                      today.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-6 lg:px-8 py-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="text-gray-600">Loading dashboard...</div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Proof Notifications */}
                  <ProofNotificationAlert />

                  {/* Pending Orders Section */}
                  {pendingOrdersCount > 0 && (
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5">
                      <div className="mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <Package className="w-5 h-5 text-[#FFD713]" />
                          Pending Orders
                        </h2>
                        <p className="text-white/60 mt-1 text-xs">
                          {pendingOrdersCount} order
                          {pendingOrdersCount !== 1 ? "s" : ""} awaiting
                          shipment
                        </p>
                      </div>

                      {/* Orders Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="px-3 py-2 font-semibold text-white/80">
                                Order ID
                              </th>
                              <th className="px-3 py-2 font-semibold text-white/80">
                                Customer
                              </th>
                              <th className="px-3 py-2 font-semibold text-white/80">
                                Email
                              </th>
                              <th className="px-3 py-2 font-semibold text-white/80">
                                Date
                              </th>
                              <th className="px-3 py-2 font-semibold text-white/80 text-right">
                                Total
                              </th>
                              <th className="px-3 py-2 font-semibold text-white/80">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingOrders.map((order) => (
                              <tr
                                key={order.id}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                              >
                                <td className="px-3 py-2 font-semibold text-white">
                                  #{order.id}
                                </td>
                                <td className="px-3 py-2 text-white/80">
                                  {order.customerName || "Guest"}
                                </td>
                                <td className="px-3 py-2 text-white/60 flex items-center gap-2">
                                  <Mail className="w-3 h-3" />
                                  {order.customerEmail}
                                </td>
                                <td className="px-3 py-2 text-white/60 flex items-center gap-2">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(
                                    order.dateCreated,
                                  ).toLocaleDateString()}
                                </td>
                                <td className="px-3 py-2 font-semibold text-white text-right">
                                  ${order.total.toFixed(2)}
                                </td>
                                <td className="px-3 py-2">
                                  <button className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 transition-colors font-medium text-xs">
                                    View
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Quick Access Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {adminLinks.map((link, index) => (
                      <button
                        key={index}
                        onClick={() => navigate(link.path)}
                        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 text-left transition-all hover:bg-white/10"
                      >
                        <div className="text-[#FFD713] mb-2">
                          {React.cloneElement(link.icon, { className: "w-5 h-5" })}
                        </div>
                        <h3 className="font-semibold text-white mb-1 text-sm">
                          {link.title}
                        </h3>
                        <p className="text-xs text-white/60 mb-2">
                          {link.description}
                        </p>
                        <div className="flex items-center text-purple-400 text-xs font-medium">
                          Manage <ChevronRight className="w-3 h-3 ml-1" />
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Traffic Section */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="mb-4">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-400" />
                        Traffic Section
                      </h2>
                      <p className="text-white/60 mt-1 text-xs">
                        Monitor your store's traffic patterns and performance
                      </p>
                    </div>

                    {/* Traffic Chart Placeholder */}
                    <div className="flex items-center justify-center h-40 bg-white/5 rounded-lg border-2 border-dashed border-white/10 mb-4">
                      <div className="text-center">
                        <BarChart3 className="w-10 h-10 text-white/40 mx-auto mb-2" />
                        <p className="text-white/60 font-medium text-xs">
                          Traffic Chart Placeholder
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                          Your traffic analytics will appear here
                        </p>
                      </div>
                    </div>

                    {/* Traffic Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-white/60 text-xs mb-1">
                          Total Views
                        </p>
                        <p className="text-xl font-bold text-white">
                          24,580
                        </p>
                        <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          +12.5% from last week
                        </p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-white/60 text-xs mb-1">
                          Unique Visitors
                        </p>
                        <p className="text-xl font-bold text-white">
                          3,240
                        </p>
                        <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          +8.2% from last week
                        </p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-white/60 text-xs mb-1">
                          Bounce Rate
                        </p>
                        <p className="text-xl font-bold text-white">
                          32.5%
                        </p>
                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          +2.1% from last week
                        </p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-white/60 text-xs mb-1">
                          Avg. Session
                        </p>
                        <p className="text-xl font-bold text-white">
                          4m 32s
                        </p>
                        <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          +0.5m from last week
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Live Visitors Section */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="mb-4">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Eye className="w-5 h-5 text-green-400" />
                        Live Visitors
                      </h2>
                      <p className="text-white/60 mt-1 text-xs">
                        Real-time view of visitors currently on your site
                      </p>
                    </div>

                    {/* Live Visitors Counter */}
                    <div className="bg-white/5 rounded-lg border border-white/10 p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/60 font-medium mb-1 text-xs">
                            Currently Online
                          </p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-[#FFD713]">
                              {liveVisitors}
                            </span>
                            <span className="text-white/60 text-xs">visitors</span>
                          </div>
                        </div>
                        <div className="relative w-16 h-16">
                          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Users className="w-8 h-8 text-green-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Live Visitors Placeholder */}
                    <div className="flex items-center justify-center h-32 bg-white/5 rounded-lg border-2 border-dashed border-white/10 mb-4">
                      <div className="text-center">
                        <Eye className="w-8 h-8 text-white/40 mx-auto mb-2" />
                        <p className="text-white/60 font-medium text-xs">
                          Live Visitors Map
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                          Geographic distribution of your visitors will appear
                          here
                        </p>
                      </div>
                    </div>

                    {/* Live Visitors Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-white/60 text-xs mb-1">Peak Hours</p>
                        <p className="text-lg font-bold text-white">
                          2-4 PM
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                          Your busiest time of day
                        </p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-white/60 text-xs mb-1">Top Page</p>
                        <p className="text-lg font-bold text-white">
                          /products
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                          Most visited page
                        </p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-white/60 text-xs mb-1">Devices</p>
                        <p className="text-lg font-bold text-white">
                          68% Mobile
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                          Primary device type
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
