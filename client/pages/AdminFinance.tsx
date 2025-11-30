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
  <div className="group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
    <div className="flex items-start justify-between mb-6">
      <div className="flex-1">
        <p className="text-white/60 text-xs uppercase tracking-widest font-medium mb-1">
          {title}
        </p>
        <p className="text-4xl font-bold text-white tracking-tight">{value}</p>
      </div>
      <div
        className={`p-3 rounded-xl backdrop-blur-xl transition-all duration-300 group-hover:scale-110 bg-gradient-to-br ${color}`}
      >
        {Icon}
      </div>
    </div>
    {trend !== undefined && (
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1 text-sm font-semibold ${
            trend >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {trend >= 0 ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
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
    <>
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 md:ml-64 min-h-screen bg-black text-white pb-20 md:pb-0">
          <div className="pt-6">
            {/* Header Section */}
            <div className="border-b border-white/10 pb-8">
              <div className="px-6 lg:px-8 py-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl">
                        <DollarSign className="w-6 h-6 text-green-400" />
                      </div>
                      <h1 className="text-4xl font-bold text-white">
                        Finance
                      </h1>
                    </div>
                    <p className="text-white/50 mt-2 text-sm leading-relaxed">
                      Monitor revenue, transactions, and financial performance
                    </p>
                  </div>
                  <div className="px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl">
                    <p className="text-white/60 text-xs uppercase tracking-wide font-medium">
                      Period
                    </p>
                    <p className="text-white font-semibold mt-1">
                      This Month
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-6 lg:px-8 py-8">
              {/* Primary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                  icon={
                    <DollarSign className="w-5 h-5 text-green-400" />
                  }
                  title="Total Revenue"
                  value={`$${stats.totalRevenue.toFixed(2)}`}
                  trend={stats.revenueChange}
                  trendLabel="vs last month"
                  color="from-green-500/20 to-emerald-500/20"
                />
                <MetricCard
                  icon={
                    <Wallet className="w-5 h-5 text-blue-400" />
                  }
                  title="This Month"
                  value={`$${stats.monthlyRevenue.toFixed(2)}`}
                  color="from-blue-500/20 to-cyan-500/20"
                />
                <MetricCard
                  icon={
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  }
                  title="Avg Order Value"
                  value={`$${stats.averageOrderValue.toFixed(2)}`}
                  color="from-purple-500/20 to-pink-500/20"
                />
                <MetricCard
                  icon={
                    <CreditCard className="w-5 h-5 text-orange-400" />
                  }
                  title="Total Orders"
                  value={stats.totalOrders}
                  trend={stats.orderChange}
                  trendLabel="vs last month"
                  color="from-orange-500/20 to-amber-500/20"
                />
              </div>

              {/* Revenue Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue Breakdown */}
                <div className="lg:col-span-2 backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Revenue Trends
                      </h2>
                      <p className="text-white/40 text-xs mt-0.5">
                        Last 7 days performance
                      </p>
                    </div>
                  </div>

                  <div className="h-64 flex items-end justify-between gap-2 px-2">
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
                        className="flex flex-col items-center gap-2 flex-1"
                      >
                        <div className="relative h-48 w-full flex items-end justify-center group">
                          <div
                            className={`w-full transition-all duration-300 rounded-t-lg ${
                              data.active
                                ? "bg-gradient-to-t from-green-500 to-green-400 group-hover:from-green-600 group-hover:to-green-500"
                                : "bg-gradient-to-t from-white/20 to-white/10 group-hover:from-white/30 group-hover:to-white/20"
                            }`}
                            style={{
                              height: `${(data.amount / 3000) * 100}%`,
                            }}
                          />
                          <div className="absolute -top-6 text-white/60 text-xs font-medium group-hover:text-white transition-colors">
                            ${(data.amount / 1000).toFixed(1)}K
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
                <div className="space-y-4">
                  <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6">
                    <p className="text-white/60 text-xs uppercase tracking-widest font-medium mb-2">
                      Monthly Goal
                    </p>
                    <p className="text-3xl font-bold text-white mb-4">
                      $5,000
                    </p>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
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
                    <p className="text-white/40 text-xs mt-3">
                      {((stats.monthlyRevenue / 5000) * 100).toFixed(1)}%
                      achieved
                    </p>
                  </div>

                  <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6">
                    <p className="text-white/60 text-xs uppercase tracking-widest font-medium mb-2">
                      Conversion Rate
                    </p>
                    <p className="text-3xl font-bold text-white mb-4">3.2%</p>
                    <div className="flex items-center gap-2">
                      <div className="text-green-400 flex items-center gap-1 text-sm font-semibold">
                        <ArrowUpRight className="w-4 h-4" />
                        +0.5%
                      </div>
                      <span className="text-white/40 text-xs">
                        vs last month
                      </span>
                    </div>
                  </div>

                  <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6">
                    <p className="text-white/60 text-xs uppercase tracking-widest font-medium mb-2">
                      Transactions
                    </p>
                    <p className="text-3xl font-bold text-white mb-4">
                      {stats.totalOrders}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="text-green-400 flex items-center gap-1 text-sm font-semibold">
                        <ArrowUpRight className="w-4 h-4" />
                        {stats.orderChange}%
                      </div>
                      <span className="text-white/40 text-xs">
                        vs last month
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
                    <PieChart className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Payment Methods
                    </h2>
                    <p className="text-white/40 text-xs mt-0.5">
                      Distribution across payment types
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      name: "Credit Card",
                      amount: 3400,
                      percentage: 68,
                      color: "from-blue-500 to-cyan-400",
                    },
                    {
                      name: "Debit Card",
                      amount: 1200,
                      percentage: 24,
                      color: "from-green-500 to-emerald-400",
                    },
                    {
                      name: "Other",
                      amount: 400,
                      percentage: 8,
                      color: "from-purple-500 to-pink-400",
                    },
                  ].map((method, idx) => (
                    <div
                      key={idx}
                      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
                    >
                      <p className="text-white/60 text-sm font-medium mb-2">
                        {method.name}
                      </p>
                      <div className="flex items-baseline gap-2 mb-4">
                        <p className="text-2xl font-bold text-white">
                          ${method.amount}
                        </p>
                        <p className="text-green-400 text-sm font-semibold">
                          {method.percentage}%
                        </p>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${method.color}`}
                          style={{
                            width: `${method.percentage}%`,
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
