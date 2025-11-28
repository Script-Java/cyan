import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import {
  BarChart3,
  MessageSquare,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Activity,
  Package,
  Settings,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

interface StatsCard {
  title: string;
  value: string;
  change: string;
  changePositive: boolean;
  icon: React.ReactNode;
  color: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState({
    openTickets: 0,
    totalRevenue: "$0.00",
    customers: 0,
    orders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }
    setIsAuthenticated(true);
    fetchDashboardStats();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      // Simulate fetching stats
      setStats({
        openTickets: 3,
        totalRevenue: "$12,500.00",
        customers: 248,
        orders: 1024,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards: StatsCard[] = [
    {
      title: "Total Revenue",
      value: stats.totalRevenue,
      change: "+12.5%",
      changePositive: true,
      icon: <DollarSign className="w-6 h-6" />,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Orders",
      value: stats.orders.toString(),
      change: "+8.2%",
      changePositive: true,
      icon: <Package className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Customers",
      value: stats.customers.toString(),
      change: "+3.1%",
      changePositive: true,
      icon: <Users className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Support Tickets",
      value: stats.openTickets.toString(),
      change: "-2.4%",
      changePositive: false,
      icon: <MessageSquare className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
    },
  ];

  const adminLinks = [
    {
      title: "Support Admin",
      description: "Manage customer support tickets and inquiries",
      icon: <MessageSquare className="w-8 h-8" />,
      path: "/admin/support",
      color: "bg-orange-50 hover:bg-orange-100",
      textColor: "text-orange-600",
    },
    {
      title: "Store Credit",
      description: "Manage customer store credit balances",
      icon: <DollarSign className="w-8 h-8" />,
      path: "/store-credit-admin",
      color: "bg-emerald-50 hover:bg-emerald-100",
      textColor: "text-emerald-600",
    },
    {
      title: "Settings",
      description: "Configure store settings and integrations",
      icon: <Settings className="w-8 h-8" />,
      path: "/admin/settings",
      color: "bg-blue-50 hover:bg-blue-100",
      textColor: "text-blue-600",
    },
  ];

  const recentActivities = [
    { type: "order", label: "New order received", time: "2 hours ago" },
    { type: "ticket", label: "Support ticket opened", time: "4 hours ago" },
    { type: "customer", label: "New customer signed up", time: "6 hours ago" },
    { type: "payment", label: "Payment processed", time: "1 day ago" },
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
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Add Action
                </button>
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
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {statCards.map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white`}
                        >
                          {stat.icon}
                        </div>
                        <span
                          className={`text-sm font-semibold ${
                            stat.changePositive
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Admin Actions */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                          Admin Tools
                        </h2>
                        <p className="text-gray-600 text-sm">
                          Quick access to store management features
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {adminLinks.map((link, index) => (
                          <button
                            key={index}
                            onClick={() => navigate(link.path)}
                            className={`p-6 rounded-lg border border-gray-200 text-left transition-all hover:shadow-md ${link.color}`}
                          >
                            <div
                              className={`${link.textColor} mb-3`}
                            >
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
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                          Recent Activity
                        </h2>
                        <p className="text-gray-600 text-sm">
                          Latest updates from your store
                        </p>
                      </div>

                      <div className="space-y-4">
                        {recentActivities.map((activity, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.label}
                              </p>
                              <p className="text-xs text-gray-500">
                                {activity.time}
                              </p>
                            </div>
                            <Activity className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                      </div>

                      <button className="w-full mt-6 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm border-t border-gray-200 pt-6">
                        View all activity
                      </button>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Alerts */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="font-bold text-gray-900 mb-4">
                        Alerts & Insights
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-semibold text-amber-900">
                                Pending Orders
                              </p>
                              <p className="text-amber-700 text-xs mt-1">
                                You have 5 orders awaiting shipment
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex gap-3">
                            <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-semibold text-green-900">
                                Sales Growth
                              </p>
                              <p className="text-green-700 text-xs mt-1">
                                Revenue is up 12% this week
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Getting Started */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
                      <div className="flex items-start gap-3">
                        <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-bold text-blue-900 mb-2">
                            Need Help?
                          </h3>
                          <p className="text-sm text-blue-800 mb-3">
                            Check out our documentation and support resources
                          </p>
                          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            Learn more <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Stats Info */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="font-bold text-gray-900 mb-4">
                        Performance
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Conversion Rate
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              2.4%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: "24%" }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Customer Satisfaction
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              94%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-600 h-2 rounded-full"
                              style={{ width: "94%" }}
                            ></div>
                          </div>
                        </div>
                      </div>
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
