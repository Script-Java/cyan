import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import AdminNavigationGrid from "@/components/AdminNavigationGrid";
import {
  BarChart3,
  Users,
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

const StatCard = ({
  icon: Icon,
  title,
  value,
  trend,
  color,
  isLive = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend?: number;
  color: string;
  isLive?: boolean;
}) => (
  <div className="group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-white/60 text-xs uppercase tracking-widest font-medium mb-0.5">
          {title}
        </p>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      </div>
      <div
        className={`p-2 rounded-lg backdrop-blur-xl transition-all duration-300 group-hover:scale-110 ${
          isLive ? `${color} animate-pulse` : `bg-gradient-to-br ${color}`
        }`}
      >
        {Icon}
      </div>
    </div>
    {trend !== undefined && (
      <div className="flex items-center gap-1.5">
        <div
          className={`flex items-center gap-0.5 text-xs font-semibold ${
            trend >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {trend >= 0 ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {Math.abs(trend)}%
        </div>
        <span className="text-white/40 text-xs">vs yesterday</span>
      </div>
    )}
  </div>
);

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
      barColor: "bg-gradient-to-r from-green-500 to-green-400",
    },
    {
      name: "Google",
      value: analytics.trafficSources.google,
      icon: "🔍",
      color: "from-blue-500/40 to-blue-600/20",
      borderColor: "border-blue-500/50",
      barColor: "bg-gradient-to-r from-blue-500 to-blue-400",
    },
    {
      name: "Facebook",
      value: analytics.trafficSources.facebook,
      icon: "👍",
      color: "from-cyan-500/40 to-cyan-600/20",
      borderColor: "border-cyan-500/50",
      barColor: "bg-gradient-to-r from-cyan-500 to-cyan-400",
    },
    {
      name: "Instagram",
      value: analytics.trafficSources.instagram,
      icon: "📸",
      color: "from-pink-500/40 to-pink-600/20",
      borderColor: "border-pink-500/50",
      barColor: "bg-gradient-to-r from-pink-500 to-pink-400",
    },
    {
      name: "Other",
      value: analytics.trafficSources.other,
      icon: "🌐",
      color: "from-purple-500/40 to-purple-600/20",
      borderColor: "border-purple-500/50",
      barColor: "bg-gradient-to-r from-purple-500 to-purple-400",
    },
  ];

  return (
    <AdminLayout>
      <div className="w-full bg-black text-white pb-20 md:pb-0">
        <div className="border-b border-white/10 pb-4">
          <div className="px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
                    <BarChart3 className="w-4 h-4 text-green-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">Analytics</h1>
                </div>
                <p className="text-white/50 text-xs mt-1">
                  Real-time customer activity and traffic insights
                </p>
              </div>
              <button
                onClick={fetchAnalyticsData}
                disabled={isRefreshing}
                className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:from-green-600/50 disabled:to-green-500/50 text-white rounded-lg font-medium transition-all duration-300 text-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="hidden md:block border-b border-white/10 bg-black/50 backdrop-blur-sm">
          <div className="px-6 lg:px-8 py-6 sm:py-8">
            <h2 className="text-sm font-semibold text-white/80 mb-4">
              Quick Navigation
            </h2>
            <AdminNavigationGrid />
          </div>
        </div>

        <main className="min-h-screen bg-black text-white">
          <div className="px-6 lg:px-8 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <StatCard
                icon={<Activity className="w-4 h-4 text-green-400" />}
                title="Active Users Now"
                value={analytics.activeUsers}
                trend={12}
                color="from-green-500/20 to-green-600/10"
                isLive
              />
              <StatCard
                icon={<TrendingUp className="w-4 h-4 text-blue-400" />}
                title="Page Views Today"
                value={analytics.totalPageViews}
                trend={8}
                color="from-blue-500/20 to-blue-600/10"
              />
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-5 mb-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Device Distribution
                  </h2>
                  <p className="text-white/40 text-xs">Traffic by device type</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    name: "Mobile",
                    icon: Smartphone,
                    value: analytics.devices.mobile,
                    color: "from-pink-500 to-rose-400",
                    iconColor: "text-pink-400",
                  },
                  {
                    name: "Desktop",
                    icon: Monitor,
                    value: analytics.devices.desktop,
                    color: "from-blue-500 to-cyan-400",
                    iconColor: "text-blue-400",
                  },
                  {
                    name: "Tablet",
                    icon: Tablet,
                    value: analytics.devices.tablet,
                    color: "from-emerald-500 to-teal-400",
                    iconColor: "text-emerald-400",
                  },
                ].map((device, idx) => {
                  const Icon = device.icon;
                  const percentage =
                    totalDevices > 0 ? (device.value / totalDevices) * 100 : 0;
                  return (
                    <div
                      key={idx}
                      className="backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 rounded-lg p-3 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-white/60 text-xs uppercase tracking-wide font-medium">
                            {device.name}
                          </p>
                          <p className="text-lg font-bold text-white">
                            {device.value}
                          </p>
                        </div>
                        <div
                          className={`p-2 rounded-lg bg-gradient-to-br ${device.color}`}
                        >
                          <Icon className={`w-4 h-4 ${device.iconColor}`} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${device.color} transition-all duration-500`}
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                        <p className="text-white/40 text-xs">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Traffic Sources
                  </h2>
                  <p className="text-white/40 text-xs">Where visitors come from</p>
                </div>
              </div>

              <div className="space-y-3">
                {trafficData.map((source, idx) => {
                  const percentage =
                    totalTraffic > 0 ? (source.value / totalTraffic) * 100 : 0;
                  return (
                    <div
                      key={idx}
                      className={`backdrop-blur-xl bg-gradient-to-r ${source.color} border ${source.borderColor} rounded-lg p-3 transition-all duration-300 hover:border-white/30`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{source.icon}</span>
                          <div>
                            <p className="text-white font-semibold text-sm">
                              {source.name}
                            </p>
                            <p className="text-white/60 text-xs">
                              {source.value} visitors
                            </p>
                          </div>
                        </div>
                        <p className="text-white font-bold text-sm">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>

                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${source.barColor} transition-all duration-500`}
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
      </div>
    </AdminLayout>
  );
}
