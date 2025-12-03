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
} from "lucide-react";

interface AnalyticsData {
  activeUsers: number;
  totalPageViews: number;
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
}

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    activeUsers: 0,
    totalPageViews: 0,
    devices: {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    },
    trafficSources: {
      direct: 0,
      google: 0,
      facebook: 0,
      instagram: 0,
      other: 0,
    },
    topPages: [],
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

    const interval = setInterval(fetchAnalyticsData, 30000);
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
      color: "from-green-500/40 to-green-600/20",
      borderColor: "border-green-500/50",
      barColor: "bg-green-500",
    },
    {
      name: "Google",
      value: analytics.trafficSources.google,
      icon: "🔍",
      color: "from-blue-500/40 to-blue-600/20",
      borderColor: "border-blue-500/50",
      barColor: "bg-blue-500",
    },
    {
      name: "Facebook",
      value: analytics.trafficSources.facebook,
      icon: "👍",
      color: "from-cyan-500/40 to-cyan-600/20",
      borderColor: "border-cyan-500/50",
      barColor: "bg-cyan-500",
    },
    {
      name: "Instagram",
      value: analytics.trafficSources.instagram,
      icon: "📸",
      color: "from-pink-500/40 to-pink-600/20",
      borderColor: "border-pink-500/50",
      barColor: "bg-pink-500",
    },
    {
      name: "Other",
      value: analytics.trafficSources.other,
      icon: "🌐",
      color: "from-purple-500/40 to-purple-600/20",
      borderColor: "border-purple-500/50",
      barColor: "bg-purple-500",
    },
  ];

  return (
    <AdminLayout>
      <main className="min-h-screen bg-black py-6">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Analytics</h1>
              <p className="text-white/60 mt-1">
                Real-time customer activity and traffic insights
              </p>
            </div>
            <button
              onClick={fetchAnalyticsData}
              disabled={isRefreshing}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg font-medium transition-all text-sm flex items-center gap-1.5 whitespace-nowrap"
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wide font-medium">
                    Active Users Now
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {analytics.activeUsers}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-green-400 text-xs font-semibold">
                    <ArrowUpRight className="w-3 h-3" />
                    12% vs yesterday
                  </div>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wide font-medium">
                    Page Views Today
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {analytics.totalPageViews}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-blue-400 text-xs font-semibold">
                    <ArrowUpRight className="w-3 h-3" />
                    8% vs yesterday
                  </div>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Device Distribution */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
            <h2 className="text-sm font-semibold text-white mb-3">
              Device Distribution
            </h2>
            <div className="grid grid-cols-3 gap-3">
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
                    <div className="bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${device.barColor} transition-all`}
                        style={{
                          width: `${percentage}%`,
                        }}
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
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-white mb-3">
              Traffic Sources
            </h2>
            <div className="space-y-2">
              {trafficData.map((source, idx) => {
                const percentage =
                  totalTraffic > 0 ? (source.value / totalTraffic) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className="bg-white/5 rounded border border-white/10 p-2.5"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">{source.icon}</span>
                        <div className="min-w-0">
                          <p className="text-white font-medium text-xs">
                            {source.name}
                          </p>
                          <p className="text-white/60 text-xs">
                            {source.value} visitors
                          </p>
                        </div>
                      </div>
                      <p className="text-white font-bold text-xs whitespace-nowrap ml-2">
                        {percentage.toFixed(0)}%
                      </p>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${source.barColor} transition-all`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
