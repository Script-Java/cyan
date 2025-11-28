import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import {
  BarChart3,
  Users,
  TrendingUp,
  Eye,
  DollarSign,
  Settings,
  ChevronRight,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [liveVisitors, setLiveVisitors] = useState(0);
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
      // Simulate fetching live visitor data
      setLiveVisitors(Math.floor(Math.random() * 500) + 50);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const adminLinks = [
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
        <main className="flex-1 ml-64 min-h-screen bg-gray-50">
          <div className="pt-6">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
              <div className="px-6 lg:px-8 py-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Dashboard
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Welcome back! Here's what's happening with your store today.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-6 lg:px-8 py-8">
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="text-gray-600">Loading dashboard...</div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Quick Access Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {adminLinks.map((link, index) => (
                      <button
                        key={index}
                        onClick={() => navigate(link.path)}
                        className={`p-6 rounded-lg border border-gray-200 text-left transition-all hover:shadow-md ${link.color}`}
                      >
                        <div className={`${link.textColor} mb-3`}>
                          {link.icon}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {link.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {link.description}
                        </p>
                        <div className={`flex items-center ${link.textColor} text-sm font-medium`}>
                          Manage <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Traffic Section */}
                  <div className="bg-white rounded-lg border border-gray-200 p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <BarChart3 className="w-7 h-7 text-blue-600" />
                        Traffic Section
                      </h2>
                      <p className="text-gray-600 mt-2">
                        Monitor your store's traffic patterns and performance
                      </p>
                    </div>

                    {/* Traffic Chart Placeholder */}
                    <div className="flex items-center justify-center h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 text-blue-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">
                          Traffic Chart Placeholder
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          Your traffic analytics will appear here
                        </p>
                      </div>
                    </div>

                    {/* Traffic Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-2">Total Views</p>
                        <p className="text-2xl font-bold text-gray-900">24,580</p>
                        <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          +12.5% from last week
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-2">Unique Visitors</p>
                        <p className="text-2xl font-bold text-gray-900">3,240</p>
                        <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          +8.2% from last week
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-2">Bounce Rate</p>
                        <p className="text-2xl font-bold text-gray-900">32.5%</p>
                        <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          +2.1% from last week
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-2">Avg. Session</p>
                        <p className="text-2xl font-bold text-gray-900">4m 32s</p>
                        <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          +0.5m from last week
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Live Visitors Section */}
                  <div className="bg-white rounded-lg border border-gray-200 p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Eye className="w-7 h-7 text-green-600" />
                        Live Visitors
                      </h2>
                      <p className="text-gray-600 mt-2">
                        Real-time view of visitors currently on your site
                      </p>
                    </div>

                    {/* Live Visitors Counter */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-8 mb-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 font-medium mb-2">
                            Currently Online
                          </p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold text-green-600">
                              {liveVisitors}
                            </span>
                            <span className="text-gray-600">visitors</span>
                          </div>
                        </div>
                        <div className="relative w-24 h-24">
                          <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-75"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Users className="w-12 h-12 text-green-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Live Visitors Placeholder */}
                    <div className="flex items-center justify-center h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-dashed border-green-200">
                      <div className="text-center">
                        <Eye className="w-16 h-16 text-green-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">
                          Live Visitors Map
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          Geographic distribution of your visitors will appear here
                        </p>
                      </div>
                    </div>

                    {/* Live Visitors Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-2">Peak Hours</p>
                        <p className="text-2xl font-bold text-gray-900">2-4 PM</p>
                        <p className="text-gray-500 text-sm mt-2">
                          Your busiest time of day
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-2">Top Page</p>
                        <p className="text-2xl font-bold text-gray-900">/products</p>
                        <p className="text-gray-500 text-sm mt-2">
                          Most visited page
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-2">Devices</p>
                        <p className="text-2xl font-bold text-gray-900">68% Mobile</p>
                        <p className="text-gray-500 text-sm mt-2">
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
