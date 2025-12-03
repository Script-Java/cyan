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
    <AdminLayout>
      <main className="min-h-screen bg-black py-6">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">Finance</h1>
            <p className="text-white/60 mt-1">
              Revenue, transactions, and financial performance
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white/80 mb-3">
              Quick Navigation
            </h2>
            <AdminNavigationGrid />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-white/60">Loading finance data...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Primary Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-wide font-medium">
                        Total Revenue
                      </p>
                      <p className="text-lg font-bold text-white mt-1">
                        ${stats.totalRevenue.toFixed(0)}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-green-400 text-xs font-semibold">
                        <ArrowUpRight className="w-3 h-3" />
                        {stats.revenueChange}%
                      </div>
                    </div>
                    <DollarSign className="w-5 h-5 text-green-400 opacity-50" />
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-wide font-medium">
                        This Month
                      </p>
                      <p className="text-lg font-bold text-white mt-1">
                        ${stats.monthlyRevenue.toFixed(0)}
                      </p>
                    </div>
                    <Wallet className="w-5 h-5 text-blue-400 opacity-50" />
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-wide font-medium">
                        Avg Order Value
                      </p>
                      <p className="text-lg font-bold text-white mt-1">
                        ${stats.averageOrderValue.toFixed(2)}
                      </p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-purple-400 opacity-50" />
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-wide font-medium">
                        Total Orders
                      </p>
                      <p className="text-lg font-bold text-white mt-1">
                        {stats.totalOrders}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-green-400 text-xs font-semibold">
                        <ArrowUpRight className="w-3 h-3" />
                        {stats.orderChange}%
                      </div>
                    </div>
                    <CreditCard className="w-5 h-5 text-orange-400 opacity-50" />
                  </div>
                </div>
              </div>

              {/* Revenue Trends */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h2 className="text-sm font-semibold text-white mb-3">
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
                      <p className="text-white/60 text-xs">{data.day}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-white/60 text-xs uppercase tracking-wide font-medium">
                    Monthly Goal Progress
                  </p>
                  <p className="text-xl font-bold text-white mt-2">
                    {((stats.monthlyRevenue / 5000) * 100).toFixed(0)}%
                  </p>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-2">
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
                  <p className="text-white/40 text-xs mt-1">Goal: $5,000</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-white/60 text-xs uppercase tracking-wide font-medium">
                    Conversion Rate
                  </p>
                  <p className="text-xl font-bold text-white mt-2">3.2%</p>
                  <div className="flex items-center gap-1 mt-2 text-green-400 text-xs font-semibold">
                    <ArrowUpRight className="w-3 h-3" />
                    +0.5% vs last
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-white/60 text-xs uppercase tracking-wide font-medium">
                    Transactions Today
                  </p>
                  <p className="text-xl font-bold text-white mt-2">
                    {stats.totalOrders}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-green-400 text-xs font-semibold">
                    <ArrowUpRight className="w-3 h-3" />
                    {stats.orderChange}% vs last
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </AdminLayout>
  );
}
