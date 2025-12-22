import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import AdminNavigationGrid from "@/components/AdminNavigationGrid";
import {
  BarChart3,
  Smartphone,
  Monitor,
  Tablet,
  Activity,
  TrendingUp,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Eye,
  BookOpen,
  FileText,
  Truck,
  MessageSquare,
} from "lucide-react";

interface AnalyticsData {
  activeUsers: number;
  totalPageViews: number;
  totalRevenue: number;
  totalOrders: number;
  conversionRate: number;
  avgOrderValue: number;
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  trafficSources: {
    direct: number;
    google: number;
    facebook: number;
    instagram: number;
    other: number;
  };
  topPages: Array<{ path: string; views: number }>;
  topProducts: Array<{
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }>;
  topDesigns: Array<{ id: number; name: string; uses: number }>;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  customerMetrics: {
    totalCustomers: number;
    newCustomersThisMonth: number;
    repeatCustomers: number;
    avgCustomerLifetimeValue: number;
  };
}

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    activeUsers: 0,
    totalPageViews: 0,
    totalRevenue: 0,
    totalOrders: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    devices: { mobile: 0, desktop: 0, tablet: 0 },
    trafficSources: {
      direct: 0,
      google: 0,
      facebook: 0,
      instagram: 0,
      other: 0,
    },
    topPages: [],
    topProducts: [],
    topDesigns: [],
    revenueByDay: [],
    customerMetrics: {
      totalCustomers: 0,
      newCustomersThisMonth: 0,
      repeatCustomers: 0,
      avgCustomerLifetimeValue: 0,
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }

    setIsAuthenticated(true);
    fetchAnalyticsData();

    const interval = setInterval(fetchAnalyticsData, 60000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchAnalyticsData = async () => {
    try {
      setIsRefreshing(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch("/api/admin/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  if (!isAuthenticated || isLoading) {
    return null;
  }

  const quickAccessLinks = [
    {
      title: "Orders",
      description: "View all orders",
      icon: <Package className="w-5 h-5" />,
      path: "/admin/orders",
      color: "bg-blue-100 hover:bg-blue-200",
      textColor: "text-blue-600",
    },
    {
      title: "Proofs",
      description: "Manage proofs",
      icon: <Eye className="w-5 h-5" />,
      path: "/admin/proofs",
      color: "bg-orange-100 hover:bg-orange-200",
      textColor: "text-orange-600",
    },
    {
      title: "Products",
      description: "Manage catalog",
      icon: <Package className="w-5 h-5" />,
      path: "/admin/products",
      color: "bg-pink-100 hover:bg-pink-200",
      textColor: "text-pink-600",
    },
    {
      title: "Customers",
      description: "View customers",
      icon: <Users className="w-5 h-5" />,
      path: "/admin/customers",
      color: "bg-purple-100 hover:bg-purple-200",
      textColor: "text-purple-600",
    },
    {
      title: "Finance",
      description: "View spending",
      icon: <DollarSign className="w-5 h-5" />,
      path: "/admin/finance",
      color: "bg-green-100 hover:bg-green-200",
      textColor: "text-green-600",
    },
    {
      title: "Analytics",
      description: "View analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      path: "/admin/analytics",
      color: "bg-cyan-100 hover:bg-cyan-200",
      textColor: "text-cyan-600",
    },
    {
      title: "Blogs",
      description: "Manage blogs",
      icon: <BookOpen className="w-5 h-5" />,
      path: "/admin/blogs",
      color: "bg-indigo-100 hover:bg-indigo-200",
      textColor: "text-indigo-600",
    },
    {
      title: "Legal Pages",
      description: "Manage legal content",
      icon: <FileText className="w-5 h-5" />,
      path: "/admin/legal-pages",
      color: "bg-amber-100 hover:bg-amber-200",
      textColor: "text-amber-600",
    },
    {
      title: "Shipping",
      description: "Manage shipping options",
      icon: <Truck className="w-5 h-5" />,
      path: "/admin/shipping",
      color: "bg-teal-100 hover:bg-teal-200",
      textColor: "text-teal-600",
    },
    {
      title: "Support",
      description: "Answer support tickets",
      icon: <MessageSquare className="w-5 h-5" />,
      path: "/admin/support",
      color: "bg-red-100 hover:bg-red-200",
      textColor: "text-red-600",
    },
  ];

  const totalDevices =
    analytics.devices.mobile +
    analytics.devices.desktop +
    analytics.devices.tablet;
  const totalTraffic = Object.values(analytics.trafficSources).reduce(
    (a, b) => a + b,
    0,
  );

  const trafficData = [
    {
      name: "Direct",
      value: analytics.trafficSources.direct,
      icon: "🔗",
      barColor: "bg-green-500",
    },
    {
      name: "Google",
      value: analytics.trafficSources.google,
      icon: "🔍",
      barColor: "bg-blue-500",
    },
    {
      name: "Facebook",
      value: analytics.trafficSources.facebook,
      icon: "👍",
      barColor: "bg-cyan-500",
    },
    {
      name: "Instagram",
      value: analytics.trafficSources.instagram,
      icon: "📸",
      barColor: "bg-pink-500",
    },
    {
      name: "Other",
      value: analytics.trafficSources.other,
      icon: "🌐",
      barColor: "bg-purple-500",
    },
  ];

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Header Section */}
        <div className="border-b border-gray-200 bg-white">
          <div className="px-4 sm:px-10 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">Analytics</h1>
                  <p className="text-gray-600">
                    Last 30 days performance overview
                  </p>
                </div>
                <button
                  onClick={fetchAnalyticsData}
                  disabled={isRefreshing}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg font-medium transition-all text-sm flex items-center gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="min-h-screen text-gray-900 px-4 sm:px-10 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Quick Access Links */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Access
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {quickAccessLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-gray-200 transition-all duration-200 hover:scale-105 active:scale-95 ${link.color}`}
                  >
                    <div className={`${link.textColor}`}>{link.icon}</div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                        {link.title}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Revenue */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      ${analytics.totalRevenue.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-green-600 text-xs font-semibold">
                      <ArrowUpRight className="w-3 h-3" />
                      +15% from last month
                    </div>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Orders */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {analytics.totalOrders}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-blue-600 text-xs font-semibold">
                      <ArrowUpRight className="w-3 h-3" />
                      {analytics.avgOrderValue > 0
                        ? `Avg $${analytics.avgOrderValue.toFixed(2)}`
                        : "N/A"}
                    </div>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">
                      Conversion Rate
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {analytics.conversionRate.toFixed(2)}%
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-purple-600 text-xs font-semibold">
                      <TrendingUp className="w-3 h-3" />
                      +3% from last period
                    </div>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Customers */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">
                      Total Customers
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {analytics.customerMetrics.totalCustomers}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-orange-600 text-xs font-semibold">
                      <ArrowUpRight className="w-3 h-3" />
                      {analytics.customerMetrics.newCustomersThisMonth} new this
                      month
                    </div>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row - Traffic & Customer Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Traffic Overview */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">
                  Traffic Overview
                </h2>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 text-xs font-medium">
                      Active Users
                    </span>
                    <span className="text-gray-900 font-bold">
                      {analytics.activeUsers}
                    </span>
                  </div>
                  <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 h-full"
                      style={{
                        width:
                          Math.min((analytics.activeUsers / 100) * 100, 100) +
                          "%",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 text-xs font-medium">
                      Page Views
                    </span>
                    <span className="text-gray-900 font-bold">
                      {analytics.totalPageViews}
                    </span>
                  </div>
                  <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full"
                      style={{
                        width:
                          Math.min(
                            (analytics.totalPageViews / 5000) * 100,
                            100,
                          ) + "%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

              {/* Customer Metrics */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">
                  Customer Metrics
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700 text-xs">
                      Repeat Customers
                    </span>
                    <span className="text-gray-900 font-bold">
                      {analytics.customerMetrics.repeatCustomers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700 text-xs">
                      Avg Lifetime Value
                    </span>
                    <span className="text-gray-900 font-bold">
                      $
                      {analytics.customerMetrics.avgCustomerLifetimeValue.toFixed(
                        2,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Device Distribution */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 hover:shadow-md transition-shadow">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                Device Distribution
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    name: "Mobile",
                    icon: Smartphone,
                    value: analytics.devices.mobile,
                    color: "bg-pink-100",
                    iconColor: "text-pink-600",
                    barColor: "bg-pink-500",
                  },
                  {
                    name: "Desktop",
                    icon: Monitor,
                    value: analytics.devices.desktop,
                    color: "bg-blue-100",
                    iconColor: "text-blue-600",
                    barColor: "bg-blue-500",
                  },
                  {
                    name: "Tablet",
                    icon: Tablet,
                    value: analytics.devices.tablet,
                    color: "bg-emerald-100",
                    iconColor: "text-emerald-600",
                    barColor: "bg-emerald-500",
                  },
                ].map((device, idx) => {
                  const Icon = device.icon;
                  const percentage =
                    totalDevices > 0 ? (device.value / totalDevices) * 100 : 0;
                  return (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-gray-600 text-xs">{device.name}</p>
                          <p className="text-lg font-bold text-gray-900">
                            {device.value}
                          </p>
                        </div>
                        <Icon className={`w-4 h-4 ${device.iconColor}`} />
                      </div>
                      <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${device.barColor}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-gray-500 text-xs mt-1">
                        {percentage.toFixed(0)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 hover:shadow-md transition-shadow">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                Traffic Sources
              </h2>
              <div className="space-y-3">
                {trafficData.map((source, idx) => {
                  const percentage =
                    totalTraffic > 0 ? (source.value / totalTraffic) * 100 : 0;
                  return (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{source.icon}</span>
                          <div>
                            <p className="text-gray-900 font-medium text-sm">
                              {source.name}
                            </p>
                            <p className="text-gray-600 text-xs">
                              {source.value} visitors
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-900 font-bold text-sm">
                          {percentage.toFixed(0)}%
                        </p>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${source.barColor}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Products */}
            {analytics.topProducts.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 hover:shadow-md transition-shadow">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">
                  Top Products
                </h2>
                <div className="space-y-2">
                  {analytics.topProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border border-gray-200 rounded p-3 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        <p className="text-gray-900 font-medium text-sm">
                          {product.name}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {product.sales} sales
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-600 font-bold text-sm">
                          ${product.revenue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Pages */}
            {analytics.topPages.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">
                  Top Pages
                </h2>
                <div className="space-y-2">
                  {analytics.topPages.map((page, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded p-3 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <p className="text-gray-900 text-sm">{page.path}</p>
                      <p className="text-gray-600 text-xs font-medium">
                        {page.views} views
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
