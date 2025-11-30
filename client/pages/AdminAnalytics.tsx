import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import MobileAdminPanel from "@/components/MobileAdminPanel";
import {
  BarChart3,
  Users,
  Smartphone,
  Monitor,
  Tablet,
  Activity,
  TrendingUp,
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

    // Refresh analytics every 30 seconds
    const interval = setInterval(fetchAnalyticsData, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchAnalyticsData = async () => {
    try {
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

  return (
    <>
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 md:ml-64 min-h-screen bg-black text-white pb-20 md:pb-0">
          <div className="pt-6">
            {/* Header Section */}
            <div className="border-b border-white/10 pb-8">
              <div className="px-6 lg:px-8 py-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                      <div className="p-2 bg-green-600/20 border border-green-500/30 rounded-lg">
                        <BarChart3 className="w-8 h-8 text-green-400" />
                      </div>
                      Analytics
                    </h1>
                    <p className="text-white/60 mt-2">
                      Live view of customer activity and traffic sources
                    </p>
                  </div>
                  <button
                    onClick={fetchAnalyticsData}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-6 lg:px-8 py-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Active Users */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/60 text-sm uppercase tracking-wider">
                      Active Users Right Now
                    </h3>
                    <div className="p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-white">
                    {analytics.activeUsers}
                  </p>
                  <p className="text-white/40 text-xs mt-2">
                    Currently browsing
                  </p>
                </div>

                {/* Total Page Views */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/60 text-sm uppercase tracking-wider">
                      Total Page Views
                    </h3>
                    <div className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-white">
                    {analytics.totalPageViews}
                  </p>
                  <p className="text-white/40 text-xs mt-2">Today</p>
                </div>
              </div>

              {/* Device Breakdown */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-purple-400" />
                  Device Breakdown
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Mobile */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white/60 text-sm">Mobile</p>
                      <Smartphone className="w-5 h-5 text-pink-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {analytics.devices.mobile}
                    </p>
                    <div className="mt-3 bg-white/5 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-pink-500 h-full transition-all"
                        style={{
                          width: `${
                            totalDevices > 0
                              ? (analytics.devices.mobile / totalDevices) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <p className="text-white/40 text-xs mt-2">
                      {totalDevices > 0
                        ? (
                            (analytics.devices.mobile / totalDevices) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>

                  {/* Desktop */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white/60 text-sm">Desktop</p>
                      <Monitor className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {analytics.devices.desktop}
                    </p>
                    <div className="mt-3 bg-white/5 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full transition-all"
                        style={{
                          width: `${
                            totalDevices > 0
                              ? (analytics.devices.desktop / totalDevices) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <p className="text-white/40 text-xs mt-2">
                      {totalDevices > 0
                        ? (
                            (analytics.devices.desktop / totalDevices) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>

                  {/* Tablet */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white/60 text-sm">Tablet</p>
                      <Tablet className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {analytics.devices.tablet}
                    </p>
                    <div className="mt-3 bg-white/5 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-green-500 h-full transition-all"
                        style={{
                          width: `${
                            totalDevices > 0
                              ? (analytics.devices.tablet / totalDevices) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <p className="text-white/40 text-xs mt-2">
                      {totalDevices > 0
                        ? (
                            (analytics.devices.tablet / totalDevices) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </div>

              {/* Traffic Sources */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Traffic Sources
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      name: "Direct",
                      value: analytics.trafficSources.direct,
                      color: "bg-green-500",
                    },
                    {
                      name: "Google",
                      value: analytics.trafficSources.google,
                      color: "bg-blue-500",
                    },
                    {
                      name: "Facebook",
                      value: analytics.trafficSources.facebook,
                      color: "bg-cyan-500",
                    },
                    {
                      name: "Instagram",
                      value: analytics.trafficSources.instagram,
                      color: "bg-pink-500",
                    },
                    {
                      name: "Other",
                      value: analytics.trafficSources.other,
                      color: "bg-purple-500",
                    },
                  ].map((source) => (
                    <div key={source.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80 text-sm">
                          {source.name}
                        </span>
                        <span className="text-white font-medium">
                          {source.value}
                          {totalTraffic > 0 && (
                            <span className="text-white/40 ml-2">
                              ({((source.value / totalTraffic) * 100).toFixed(1)}%)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="bg-white/5 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`${source.color} h-full transition-all`}
                          style={{
                            width: `${
                              totalTraffic > 0
                                ? (source.value / totalTraffic) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Admin Panel */}
        <MobileAdminPanel />
      </div>
    </>
  );
}
