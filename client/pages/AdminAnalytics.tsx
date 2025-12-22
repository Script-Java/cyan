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
      <main className="min-h-screen bg-black py-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Analytics</h1>
              <p className="text-white/60 mt-1">
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

          {/* Quick Navigation */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white/80 mb-3">
              Quick Navigation
            </h2>
            <AdminNavigationGrid />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Revenue */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wide font-medium">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-white mt-2">
                    ${analytics.totalRevenue.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-green-400 text-xs font-semibold">
                    <ArrowUpRight className="w-3 h-3" />
                    +15% from last month
                  </div>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </div>

            {/* Orders */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wide font-medium">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {analytics.totalOrders}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-blue-400 text-xs font-semibold">
                    <ArrowUpRight className="w-3 h-3" />
                    {analytics.avgOrderValue > 0
                      ? `Avg $${analytics.avgOrderValue.toFixed(2)}`
                      : "N/A"}
                  </div>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wide font-medium">
                    Conversion Rate
                  </p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {analytics.conversionRate.toFixed(2)}%
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-purple-400 text-xs font-semibold">
                    <TrendingUp className="w-3 h-3" />
                    +3% from last period
                  </div>
                </div>
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Customers */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wide font-medium">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {analytics.customerMetrics.totalCustomers}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-orange-400 text-xs font-semibold">
                    <ArrowUpRight className="w-3 h-3" />
                    {analytics.customerMetrics.newCustomersThisMonth} new this
                    month
                  </div>
                </div>
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Second Row - Traffic & Customer Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Traffic Overview */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-white mb-4">
                Traffic Overview
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-xs font-medium">
                      Active Users
                    </span>
                    <span className="text-white font-bold">
                      {analytics.activeUsers}
                    </span>
                  </div>
                  <div className="bg-white/10 h-2 rounded-full overflow-hidden">
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
                    <span className="text-white text-xs font-medium">
                      Page Views
                    </span>
                    <span className="text-white font-bold">
                      {analytics.totalPageViews}
                    </span>
                  </div>
                  <div className="bg-white/10 h-2 rounded-full overflow-hidden">
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
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-white mb-4">
                Customer Metrics
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <span className="text-white/80 text-xs">
                    Repeat Customers
                  </span>
                  <span className="text-white font-bold">
                    {analytics.customerMetrics.repeatCustomers}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <span className="text-white/80 text-xs">
                    Avg Lifetime Value
                  </span>
                  <span className="text-white font-bold">
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
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
            <h2 className="text-sm font-semibold text-white mb-4">
              Device Distribution
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  name: "Mobile",
                  icon: Smartphone,
                  value: analytics.devices.mobile,
                  color: "bg-pink-500/20",
                  iconColor: "text-pink-400",
                  barColor: "bg-pink-500",
                },
                {
                  name: "Desktop",
                  icon: Monitor,
                  value: analytics.devices.desktop,
                  color: "bg-blue-500/20",
                  iconColor: "text-blue-400",
                  barColor: "bg-blue-500",
                },
                {
                  name: "Tablet",
                  icon: Tablet,
                  value: analytics.devices.tablet,
                  color: "bg-emerald-500/20",
                  iconColor: "text-emerald-400",
                  barColor: "bg-emerald-500",
                },
              ].map((device, idx) => {
                const Icon = device.icon;
                const percentage =
                  totalDevices > 0 ? (device.value / totalDevices) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className="bg-white/5 border border-white/10 rounded p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-white/60 text-xs">{device.name}</p>
                        <p className="text-lg font-bold text-white">
                          {device.value}
                        </p>
                      </div>
                      <Icon className={`w-4 h-4 ${device.iconColor}`} />
                    </div>
                    <div className="bg-white/10 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${device.barColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-white/40 text-xs mt-1">
                      {percentage.toFixed(0)}%
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
            <h2 className="text-sm font-semibold text-white mb-4">
              Traffic Sources
            </h2>
            <div className="space-y-3">
              {trafficData.map((source, idx) => {
                const percentage =
                  totalTraffic > 0 ? (source.value / totalTraffic) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className="bg-white/5 rounded border border-white/10 p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{source.icon}</span>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {source.name}
                          </p>
                          <p className="text-white/60 text-xs">
                            {source.value} visitors
                          </p>
                        </div>
                      </div>
                      <p className="text-white font-bold text-sm">
                        {percentage.toFixed(0)}%
                      </p>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
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
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
              <h2 className="text-sm font-semibold text-white mb-4">
                Top Products
              </h2>
              <div className="space-y-2">
                {analytics.topProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white/5 border border-white/10 rounded p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-white font-medium text-sm">
                        {product.name}
                      </p>
                      <p className="text-white/60 text-xs">
                        {product.sales} sales
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold text-sm">
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
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-white mb-4">
                Top Pages
              </h2>
              <div className="space-y-2">
                {analytics.topPages.map((page, idx) => (
                  <div
                    key={idx}
                    className="bg-white/5 rounded p-3 flex items-center justify-between"
                  >
                    <p className="text-white text-sm">{page.path}</p>
                    <p className="text-white/60 text-xs font-medium">
                      {page.views} views
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </AdminLayout>
  );
}
