import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import AdminNavigationGrid from "@/components/AdminNavigationGrid";
import {
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard,
  Wallet,
  PieChart,
} from "lucide-react";

interface FinanceStats {
  totalRevenue: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  revenueChange: number;
  orderChange: number;
}

const MetricCard = ({
  icon: Icon,
  title,
  value,
  trend,
  trendLabel,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  color: string;
}) => (
  <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <p className="text-white/60 text-xs uppercase tracking-widest font-medium mb-0.5">
          {title}
        </p>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      </div>
      <div
        className={`p-2 rounded-lg backdrop-blur-xl transition-all duration-300 bg-gradient-to-br ${color}`}
      >
        {Icon}
      </div>
    </div>
    {trend !== undefined && (
      <div className="flex items-center gap-1">
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
        <span className="text-white/40 text-xs">{trendLabel}</span>
      </div>
    )}
  </div>
);

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
      <div className="w-full bg-black text-white pb-20 md:pb-0">
        <div className="pt-4">
          {/* Header Section */}
          <div className="border-b border-white/10 pb-4">
            <div className="px-6 lg:px-8 py-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
                      <DollarSign className="w-4 h-4 text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Finance</h1>
                  </div>
                  <p className="text-white/50 text-xs mt-1">
                    Revenue, transactions, and financial performance
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
                  <p className="text-white/60 text-xs uppercase tracking-wide font-medium">
                    This Month
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Grid - Desktop/Tablet Only */}
          <div className="hidden md:block border-b border-white/10 bg-black/50 backdrop-blur-sm">
            <div className="px-6 lg:px-8 py-6 sm:py-8">
              <h2 className="text-sm font-semibold text-white/80 mb-4">Quick Navigation</h2>
              <AdminNavigationGrid />
            </div>
          </div>

          {/* Main Content */}
          <div className="px-6 lg:px-8 py-5">
            {/* Primary Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <MetricCard
                icon={<DollarSign className="w-4 h-4 text-green-400" />}
                title="Total Revenue"
                value={`$${stats.totalRevenue.toFixed(2)}`}
                trend={stats.revenueChange}
                trendLabel="vs last month"
                color="from-green-500/20 to-emerald-500/20"
              />
              <MetricCard
                icon={<Wallet className="w-4 h-4 text-blue-400" />}
                title="This Month"
                value={`$${stats.monthlyRevenue.toFixed(2)}`}
                color="from-blue-500/20 to-cyan-500/20"
              />
              <MetricCard
                icon={<TrendingUp className="w-4 h-4 text-purple-400" />}
                title="Avg Order Value"
                value={`$${stats.averageOrderValue.toFixed(2)}`}
                color="from-purple-500/20 to-pink-500/20"
              />
              <MetricCard
                icon={<CreditCard className="w-4 h-4 text-orange-400" />}
                title="Total Orders"
                value={stats.totalOrders}
                trend={stats.orderChange}
                trendLabel="vs last month"
                color="from-orange-500/20 to-amber-500/20"
              />
            </div>

            {/* Revenue Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Revenue Breakdown */}
              <div className="lg:col-span-2 backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      Revenue Trends
                    </h2>
                    <p className="text-white/40 text-xs">Last 7 days</p>
                  </div>
                </div>

                <div className="h-40 flex items-end justify-between gap-1.5 px-1">
                  {[
                    { day: "Mon", amount: 1200, active: false },
                    { day: "Tue", amount: 1900, active: false },
                    { day: "Wed", amount: 1600, active: false },
                    { day: "Thu", amount: 2100, active: false },
                    { day: "Fri", amount: 2400, active: false },
                    { day: "Sat", amount: 2200, active: false },
                    { day: "Sun", amount: 2800, active: true },
                  ].map((data, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-1 flex-1"
                    >
                      <div className="relative h-32 w-full flex items-end justify-center group">
                        <div
                          className={`w-full transition-all duration-300 rounded-t-md ${
                            data.active
                              ? "bg-gradient-to-t from-green-500 to-green-400 group-hover:from-green-600 group-hover:to-green-500"
                              : "bg-gradient-to-t from-white/20 to-white/10 group-hover:from-white/30 group-hover:to-white/20"
                          }`}
                          style={{
                            height: `${(data.amount / 3000) * 100}%`,
                          }}
                        />
                        <div className="absolute -top-4 text-white/60 text-xs font-medium group-hover:text-white transition-colors whitespace-nowrap">
                          ${data.amount / 1000}K
                        </div>
                      </div>
                      <p className="text-white/60 text-xs font-medium">
                        {data.day}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-white/60 text-xs uppercase tracking-widest font-medium mb-1">
                    Monthly Goal
                  </p>
                  <p className="text-2xl font-bold text-white mb-2">$5,000</p>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                      style={{
                        width: `${
                          (stats.monthlyRevenue / 5000) * 100 > 100
                            ? 100
                            : (stats.monthlyRevenue / 5000) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-white/40 text-xs mt-2">
                    {((stats.monthlyRevenue / 5000) * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-white/60 text-xs uppercase tracking-widest font-medium mb-1">
                    Conversion Rate
                  </p>
                  <p className="text-2xl font-bold text-white mb-2">3.2%</p>
                  <div className="flex items-center gap-1">
                    <div className="text-green-400 flex items-center gap-0.5 text-xs font-semibold">
                      <ArrowUpRight className="w-3 h-3" />
                      +0.5%
                    </div>
                    <span className="text-white/40 text-xs">vs last</span>
                  </div>
                </div>

                <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-white/60 text-xs uppercase tracking-widest font-medium mb-1">
                    Transactions
                  </p>
                  <p className="text-2xl font-bold text-white mb-2">
                    {stats.totalOrders}
                  </p>
                  <div className="flex items-center gap-1">
                    <div className="text-green-400 flex items-center gap-0.5 text-xs font-semibold">
                      <ArrowUpRight className="w-3 h-3" />
                      {stats.orderChange}%
                    </div>
                    <span className="text-white/40 text-xs">vs last</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
