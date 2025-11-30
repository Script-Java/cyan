import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import MobileAdminPanel from "@/components/MobileAdminPanel";
import {
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
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

  if (!isAuthenticated || isLoading) {
    return null;
  }

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
                        <DollarSign className="w-8 h-8 text-green-400" />
                      </div>
                      Finance
                    </h1>
                    <p className="text-white/60 mt-2">
                      Track revenue and financial metrics
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-6 lg:px-8 py-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Revenue Card */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/60 text-sm uppercase tracking-wider">
                      Total Revenue
                    </h3>
                    <div className="p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <DollarSign className="w-4 h-4 text-green-400" />
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold text-white">
                      ${stats.totalRevenue.toFixed(2)}
                    </p>
                    <div
                      className={`flex items-center gap-1 text-sm font-medium mb-1 ${
                        stats.revenueChange >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {stats.revenueChange >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {Math.abs(stats.revenueChange)}%
                    </div>
                  </div>
                  <p className="text-white/40 text-xs mt-2">
                    vs last month
                  </p>
                </div>

                {/* Monthly Revenue Card */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/60 text-sm uppercase tracking-wider">
                      This Month
                    </h3>
                    <div className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    ${stats.monthlyRevenue.toFixed(2)}
                  </p>
                  <p className="text-white/40 text-xs mt-2">
                    Current month revenue
                  </p>
                </div>

                {/* Average Order Value Card */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/60 text-sm uppercase tracking-wider">
                      Avg Order Value
                    </h3>
                    <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    ${stats.averageOrderValue.toFixed(2)}
                  </p>
                  <p className="text-white/40 text-xs mt-2">
                    Per transaction
                  </p>
                </div>

                {/* Total Orders Card */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white/60 text-sm uppercase tracking-wider">
                      Total Orders
                    </h3>
                    <div className="p-2 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                      <DollarSign className="w-4 h-4 text-orange-400" />
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold text-white">
                      {stats.totalOrders}
                    </p>
                    <div
                      className={`flex items-center gap-1 text-sm font-medium mb-1 ${
                        stats.orderChange >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {stats.orderChange >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {Math.abs(stats.orderChange)}%
                    </div>
                  </div>
                  <p className="text-white/40 text-xs mt-2">
                    vs last month
                  </p>
                </div>
              </div>

              {/* Placeholder for Charts */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Revenue Trends
                </h2>
                <div className="flex items-center justify-center h-64 text-white/40">
                  <p>Chart visualization coming soon</p>
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
