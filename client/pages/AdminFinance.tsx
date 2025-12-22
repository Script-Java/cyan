import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import AdminNavigationGrid from "@/components/AdminNavigationGrid";
import {
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  Package,
  Eye,
  BarChart3,
  Users,
  Settings,
  BookOpen,
  FileText,
  Truck,
  MessageSquare,
} from "lucide-react";

interface FinanceStats {
  totalRevenue: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  revenueChange: number;
  orderChange: number;
}

export default function AdminFinance() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<FinanceStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    revenueChange: 0,
    orderChange: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }

    setIsAuthenticated(true);
    fetchFinanceData();
  }, [navigate]);

  const fetchFinanceData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch("/api/admin/finance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching finance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!isAuthenticated || isLoading) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Header Section */}
        <div className="border-b border-gray-200 bg-white">
          <div className="px-4 sm:px-10 py-8">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">Finance</h1>
              <p className="text-gray-600">
                Revenue, transactions, and financial performance
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="min-h-screen text-gray-900 px-4 sm:px-10 py-12">
          <div className="max-w-6xl mx-auto">
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

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-600">Loading finance data...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Primary Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">
                          Total Revenue
                        </p>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          ${stats.totalRevenue.toFixed(0)}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-green-600 text-xs font-semibold">
                          <ArrowUpRight className="w-3 h-3" />
                          {stats.revenueChange}%
                        </div>
                      </div>
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">
                          This Month
                        </p>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          ${stats.monthlyRevenue.toFixed(0)}
                        </p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Wallet className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">
                          Avg Order Value
                        </p>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          ${stats.averageOrderValue.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">
                          Total Orders
                        </p>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          {stats.totalOrders}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-green-600 text-xs font-semibold">
                          <ArrowUpRight className="w-3 h-3" />
                          {stats.orderChange}%
                        </div>
                      </div>
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <CreditCard className="w-5 h-5 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue Trends */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h2 className="text-sm font-semibold text-gray-900 mb-3">
                    Revenue Trends (Last 7 Days)
                  </h2>
                  <div className="flex items-end justify-between gap-1.5 h-32">
                    {[
                      { day: "Mon", amount: 1200 },
                      { day: "Tue", amount: 1900 },
                      { day: "Wed", amount: 1600 },
                      { day: "Thu", amount: 2100 },
                      { day: "Fri", amount: 2400 },
                      { day: "Sat", amount: 2200 },
                      { day: "Sun", amount: 2800 },
                    ].map((data, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center gap-1 flex-1"
                      >
                        <div className="w-full h-full flex items-end justify-center">
                          <div
                            className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all"
                            style={{
                              height: `${(data.amount / 3000) * 100}%`,
                            }}
                          />
                        </div>
                        <p className="text-gray-600 text-xs">{data.day}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">
                      Monthly Goal Progress
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-2">
                      {((stats.monthlyRevenue / 5000) * 100).toFixed(0)}%
                    </p>
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${
                            (stats.monthlyRevenue / 5000) * 100 > 100
                              ? 100
                              : (stats.monthlyRevenue / 5000) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-1">Goal: $5,000</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">
                      Conversion Rate
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-2">3.2%</p>
                    <div className="flex items-center gap-1 mt-2 text-green-600 text-xs font-semibold">
                      <ArrowUpRight className="w-3 h-3" />
                      +0.5% vs last
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">
                      Transactions Today
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-2">
                      {stats.totalOrders}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-green-600 text-xs font-semibold">
                      <ArrowUpRight className="w-3 h-3" />
                      {stats.orderChange}% vs last
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
