import { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import AdminNavigationGrid from "@/components/AdminNavigationGrid";
import ProofNotificationAlert from "@/components/dashboard/ProofNotificationAlert";
import {
  BarChart3,
  Users,
  TrendingUp,
  Eye,
  DollarSign,
  Settings,
  ChevronRight,
  ChevronDown,
  Package,
  Calendar,
  Mail,
  Upload,
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
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("authToken");

      // Simulate fetching live visitor data
      setLiveVisitors(Math.floor(Math.random() * 500) + 50);

      // Fetch pending orders
      if (token) {
        const response = await fetch("/api/admin/pending-orders", {
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
      icon: <Upload className="w-5 h-5" />,
      path: "/admin/import-products",
      color: "bg-purple-50 hover:bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      title: "Support Admin",
      description: "Manage customer support tickets",
      icon: <BarChart3 className="w-5 h-5" />,
      path: "/admin/support",
      color: "bg-orange-50 hover:bg-orange-100",
      textColor: "text-orange-600",
    },
    {
      title: "Store Credit",
      description: "Manage customer balances",
      icon: <DollarSign className="w-5 h-5" />,
      path: "/store-credit-admin",
      color: "bg-emerald-50 hover:bg-emerald-100",
      textColor: "text-emerald-600",
    },
    {
      title: "Settings",
      description: "Configure store settings",
      icon: <Settings className="w-5 h-5" />,
      path: "/admin/settings",
      color: "bg-blue-50 hover:bg-blue-100",
      textColor: "text-blue-600",
    },
  ];

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Header Section */}
        <div className="border-b border-white/10 bg-black">
          <div className="px-3 sm:px-6 lg:px-8 py-1 sm:py-2">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white">
                  Dashboard
                </h1>
                <p className="text-white/60 mt-0.5 text-xs sm:text-sm">
                  Welcome back! Here's what's happening with your store today.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Grid - Desktop/Tablet Only */}
        <div className="hidden md:block border-b border-white/10 bg-black/50 backdrop-blur-sm">
          <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
            <h2 className="text-sm font-semibold text-white/80 mb-2">
              Quick Navigation
            </h2>
            <AdminNavigationGrid />
          </div>
        </div>

        {/* Main Content */}
        <div className="px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <div className="text-white/60">Loading dashboard...</div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Proof Notifications */}
              <ProofNotificationAlert />

              {/* Pending Orders Section */}
              {pendingOrdersCount > 0 && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-4">
                  <div className="mb-2 sm:mb-3">
                    <h2 className="text-sm sm:text-lg font-bold text-white flex items-center gap-2">
                      <Package className="w-4 sm:w-5 h-4 sm:h-5 text-[#FFD713]" />
                      Pending Orders
                    </h2>
                    <p className="text-white/60 mt-1 text-xs">
                      {pendingOrdersCount} order
                      {pendingOrdersCount !== 1 ? "s" : ""} awaiting shipment
                    </p>
                  </div>

                  {/* Orders Table */}
                  <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="px-2 sm:px-3 py-2 font-semibold text-white/80 whitespace-nowrap">
                            Order ID
                          </th>
                          <th className="px-2 sm:px-3 py-2 font-semibold text-white/80 whitespace-nowrap hidden sm:table-cell">
                            Customer
                          </th>
                          <th className="px-2 sm:px-3 py-2 font-semibold text-white/80 whitespace-nowrap hidden md:table-cell">
                            Email
                          </th>
                          <th className="px-2 sm:px-3 py-2 font-semibold text-white/80 whitespace-nowrap hidden lg:table-cell">
                            Date
                          </th>
                          <th className="px-2 sm:px-3 py-2 font-semibold text-white/80 text-right whitespace-nowrap">
                            Total
                          </th>
                          <th className="px-2 sm:px-3 py-2 font-semibold text-white/80 whitespace-nowrap">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingOrders.map((order) => (
                          <Fragment key={order.id}>
                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="px-2 sm:px-3 py-2 font-semibold text-white whitespace-nowrap">
                                #{order.id}
                              </td>
                              <td className="px-2 sm:px-3 py-2 text-white/80 whitespace-nowrap hidden sm:table-cell truncate max-w-xs">
                                {order.customerName || "Guest"}
                              </td>
                              <td className="px-2 sm:px-3 py-2 text-white/60 hidden md:table-cell">
                                <div className="flex items-center gap-1 truncate max-w-xs">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate text-xs sm:text-sm">
                                    {order.customerEmail}
                                  </span>
                                </div>
                              </td>
                              <td className="px-2 sm:px-3 py-2 text-white/60 hidden lg:table-cell whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span className="text-xs sm:text-sm">
                                    {new Date(
                                      order.dateCreated,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </td>
                              <td className="px-2 sm:px-3 py-2 font-semibold text-white text-right whitespace-nowrap">
                                ${order.total.toFixed(2)}
                              </td>
                              <td className="px-2 sm:px-3 py-2">
                                <button
                                  onClick={() =>
                                    setExpandedOrderId(
                                      expandedOrderId === order.id
                                        ? null
                                        : order.id,
                                    )
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs sm:text-sm bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 transition-colors font-medium whitespace-nowrap"
                                >
                                  <span>
                                    {expandedOrderId === order.id
                                      ? "Hide"
                                      : "View"}
                                  </span>
                                  <ChevronDown
                                    className={`w-3 h-3 transition-transform ${
                                      expandedOrderId === order.id
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                  />
                                </button>
                              </td>
                            </tr>
                            {expandedOrderId === order.id && (
                              <tr className="border-b border-white/5 bg-white/5">
                                <td colSpan={6} className="px-2 sm:px-3 py-4">
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                      <div className="bg-white/10 rounded p-3">
                                        <p className="text-white/60 text-xs uppercase tracking-wide mb-1">
                                          Subtotal
                                        </p>
                                        <p className="text-sm font-semibold text-white">
                                          $
                                          {(
                                            order.subtotal || order.total * 0.8
                                          ).toFixed(2)}
                                        </p>
                                      </div>
                                      <div className="bg-white/10 rounded p-3">
                                        <p className="text-white/60 text-xs uppercase tracking-wide mb-1">
                                          Tax
                                        </p>
                                        <p className="text-sm font-semibold text-white">
                                          $
                                          {(
                                            order.tax || order.total * 0.1
                                          ).toFixed(2)}
                                        </p>
                                      </div>
                                      <div className="bg-white/10 rounded p-3">
                                        <p className="text-white/60 text-xs uppercase tracking-wide mb-1">
                                          Shipping
                                        </p>
                                        <p className="text-sm font-semibold text-white">
                                          ${(order.shipping || 0).toFixed(2)}
                                        </p>
                                      </div>
                                      <div className="bg-blue-600/20 rounded p-3 border border-blue-500/30">
                                        <p className="text-blue-300/60 text-xs uppercase tracking-wide mb-1">
                                          Total
                                        </p>
                                        <p className="text-sm font-semibold text-blue-300">
                                          ${order.total.toFixed(2)}
                                        </p>
                                      </div>
                                    </div>

                                    {order.orderItems &&
                                      order.orderItems.length > 0 && (
                                        <div>
                                          <p className="text-white font-semibold text-sm mb-3">
                                            Items
                                          </p>
                                          <div className="space-y-3">
                                            {order.orderItems.map(
                                              (item, idx) => (
                                                <div
                                                  key={idx}
                                                  className="bg-white/5 rounded p-3 flex gap-3"
                                                >
                                                  <div className="flex-1">
                                                    <p className="text-white text-sm font-medium">
                                                      {item.product_name ||
                                                        "Product"}
                                                    </p>
                                                    <p className="text-white/60 text-xs mt-1">
                                                      Qty: {item.quantity || 1}
                                                    </p>
                                                    {item.options &&
                                                      Object.keys(item.options)
                                                        .length > 0 && (
                                                        <div className="mt-2 text-xs text-white/60">
                                                          {Object.entries(
                                                            item.options,
                                                          ).map(
                                                            ([key, val]) => (
                                                              <div key={key}>
                                                                {key}:{" "}
                                                                {String(val)}
                                                              </div>
                                                            ),
                                                          )}
                                                        </div>
                                                      )}
                                                  </div>
                                                  {item.design_file_url && (
                                                    <div className="flex-shrink-0">
                                                      <p className="text-white/60 text-xs uppercase tracking-wide mb-2">
                                                        Design
                                                      </p>
                                                      <div className="w-16 h-16 bg-white/5 border border-white/10 rounded overflow-hidden flex items-center justify-center">
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
                                                            className="flex flex-col items-center gap-1 p-2 hover:text-blue-300 transition-colors"
                                                          >
                                                            <ImageIcon className="w-5 h-5 text-white/60" />
                                                          </a>
                                                        )}
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              ),
                                            )}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Quick Access Links */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
                {adminLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(link.path)}
                    className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 text-left transition-all hover:bg-white/10"
                  >
                    <div className="text-[#FFD713] mb-2 w-4 sm:w-5 h-4 sm:h-5">
                      {link.icon}
                    </div>
                    <h3 className="font-semibold text-white mb-1 text-xs sm:text-sm">
                      {link.title}
                    </h3>
                    <p className="text-xs text-white/60 mb-2 hidden sm:block">
                      {link.description}
                    </p>
                    <div className="flex items-center text-purple-400 text-xs font-medium">
                      Manage{" "}
                      <ChevronRight className="w-3 h-3 ml-1 hidden sm:inline" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Traffic Section */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-4">
                <div className="mb-2 sm:mb-3">
                  <h2 className="text-sm sm:text-lg font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400" />
                    Traffic Section
                  </h2>
                  <p className="text-white/60 mt-1 text-xs">
                    Monitor your store's traffic patterns and performance
                  </p>
                </div>

                {/* Traffic Chart Placeholder */}
                <div className="flex items-center justify-center h-24 sm:h-40 bg-white/5 rounded-lg border-2 border-dashed border-white/10 mb-4">
                  <div className="text-center">
                    <BarChart3 className="w-6 sm:w-10 h-6 sm:h-10 text-white/40 mx-auto mb-2" />
                    <p className="text-white/60 font-medium text-xs">
                      Traffic Chart
                    </p>
                  </div>
                </div>

                {/* Traffic Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
                  <div className="p-2 sm:p-3 bg-white/5 rounded-lg">
                    <p className="text-white/60 text-xs mb-1">Views</p>
                    <p className="text-lg sm:text-xl font-bold text-white">
                      24,580
                    </p>
                    <p className="text-green-400 text-xs mt-1 hidden sm:flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +12.5%
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-white/5 rounded-lg">
                    <p className="text-white/60 text-xs mb-1">Visitors</p>
                    <p className="text-lg sm:text-xl font-bold text-white">
                      3,240
                    </p>
                    <p className="text-green-400 text-xs mt-1 hidden sm:flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +8.2%
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-white/5 rounded-lg">
                    <p className="text-white/60 text-xs mb-1">Bounce</p>
                    <p className="text-lg sm:text-xl font-bold text-white">
                      32.5%
                    </p>
                    <p className="text-red-400 text-xs mt-1 hidden sm:flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +2.1%
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-white/5 rounded-lg">
                    <p className="text-white/60 text-xs mb-1">Session</p>
                    <p className="text-lg sm:text-xl font-bold text-white">
                      4m 32s
                    </p>
                    <p className="text-green-400 text-xs mt-1 hidden sm:flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +0.5m
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Visitors Section */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-4">
                <div className="mb-2 sm:mb-3">
                  <h2 className="text-sm sm:text-lg font-bold text-white flex items-center gap-2">
                    <Eye className="w-4 sm:w-5 h-4 sm:h-5 text-green-400" />
                    Live Visitors
                  </h2>
                  <p className="text-white/60 mt-1 text-xs">
                    Real-time view of visitors currently on your site
                  </p>
                </div>

                {/* Live Visitors Counter */}
                <div className="bg-white/5 rounded-lg border border-white/10 p-2 sm:p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 font-medium mb-1 text-xs">
                        Currently Online
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-bold text-[#FFD713]">
                          {liveVisitors}
                        </span>
                        <span className="text-white/60 text-xs">visitors</span>
                      </div>
                    </div>
                    <div className="relative w-12 sm:w-16 h-12 sm:h-16">
                      <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Users className="w-6 sm:w-8 h-6 sm:h-8 text-green-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Visitors Placeholder */}
                <div className="flex items-center justify-center h-20 sm:h-32 bg-white/5 rounded-lg border-2 border-dashed border-white/10 mb-3">
                  <div className="text-center">
                    <Eye className="w-6 sm:w-8 h-6 sm:h-8 text-white/40 mx-auto mb-2" />
                    <p className="text-white/60 font-medium text-xs">
                      Live Map
                    </p>
                  </div>
                </div>

                {/* Live Visitors Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2">
                  <div className="p-2 sm:p-3 bg-white/5 rounded-lg">
                    <p className="text-white/60 text-xs mb-1">Peak</p>
                    <p className="text-base sm:text-lg font-bold text-white">
                      2-4 PM
                    </p>
                    <p className="text-white/40 text-xs mt-1 hidden sm:block">
                      Busiest time
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-white/5 rounded-lg">
                    <p className="text-white/60 text-xs mb-1">Top Page</p>
                    <p className="text-base sm:text-lg font-bold text-white">
                      /products
                    </p>
                    <p className="text-white/40 text-xs mt-1 hidden sm:block">
                      Most visited
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-white/5 rounded-lg">
                    <p className="text-white/60 text-xs mb-1">Devices</p>
                    <p className="text-base sm:text-lg font-bold text-white">
                      68% Mobile
                    </p>
                    <p className="text-white/40 text-xs mt-1 hidden sm:block">
                      Primary type
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
