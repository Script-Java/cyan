import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
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
  DollarSign,
  ShoppingCart,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AnalyticsData {
  activeUsers: number;
  totalPageViews: number;
  totalRevenue: number;
  totalOrders: number;
  conversionRate: number;
  avgOrderValue: number;
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
  topProducts: Array<{
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }>;
  topDesigns: Array<{ id: number; name: string; uses: number }>;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  customerMetrics: {
    totalCustomers: number;
    newCustomersThisMonth: number;
    repeatCustomers: number;
    avgCustomerLifetimeValue: number;
  };
}

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    activeUsers: 0,
    totalPageViews: 0,
    totalRevenue: 0,
    totalOrders: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    devices: { mobile: 0, desktop: 0, tablet: 0 },
    trafficSources: {
      direct: 0,
      google: 0,
      facebook: 0,
      instagram: 0,
      other: 0,
    },
    topPages: [],
    topProducts: [],
    topDesigns: [],
    revenueByDay: [],
    customerMetrics: {
      totalCustomers: 0,
      newCustomersThisMonth: 0,
      repeatCustomers: 0,
      avgCustomerLifetimeValue: 0,
    },
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

    const interval = setInterval(fetchAnalyticsData, 60000);
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

  const today = new Date().toISOString().split("T")[0];
  const todayRevenue = analytics.revenueByDay.find(
    (day) => day.date === today,
  )?.revenue ?? 0;

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getRevenueForDay = (day: number | null) => {
    if (!day) return 0;
    const dateStr = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1,
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return analytics.revenueByDay.find((d) => d.date === dateStr)?.revenue ?? 0;
  };

  const getOrdersForDay = (day: number | null) => {
    if (!day) return 0;
    const dateStr = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1,
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return analytics.revenueByDay.find((d) => d.date === dateStr)?.orders ?? 0;
  };

  const getMaxRevenueInMonth = () => {
    return Math.max(
      ...analytics.revenueByDay
        .filter((d) => {
          const [year, month] = d.date.split("-");
          return (
            parseInt(year) === currentMonth.getFullYear() &&
            parseInt(month) === currentMonth.getMonth() + 1
          );
        })
        .map((d) => d.revenue),
      0,
    );
  };

  const getColorIntensity = (revenue: number) => {
    if (revenue === 0) return "bg-gray-50";
    const maxRevenue = getMaxRevenueInMonth();
    const intensity = maxRevenue > 0 ? revenue / maxRevenue : 0;
    if (intensity === 0) return "bg-gray-50";
    if (intensity < 0.25) return "bg-green-100";
    if (intensity < 0.5) return "bg-green-200";
    if (intensity < 0.75) return "bg-green-400";
    return "bg-green-600";
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const calendarDays = generateCalendarDays();
  const maxRevenueInMonth = getMaxRevenueInMonth();

  const selectedDayRevenue = selectedDate
    ? getRevenueForDay(
        parseInt(selectedDate.split("-")[2]),
      )
    : 0;
  const selectedDayOrders = selectedDate
    ? getOrdersForDay(
        parseInt(selectedDate.split("-")[2]),
      )
    : 0;

  const trafficData = [
    {
      name: "Direct",
      value: analytics.trafficSources.direct,
      icon: "🔗",
      barColor: "bg-green-500",
    },
    {
      name: "Google",
      value: analytics.trafficSources.google,
      icon: "🔍",
      barColor: "bg-blue-500",
    },
    {
      name: "Facebook",
      value: analytics.trafficSources.facebook,
      icon: "👍",
      barColor: "bg-cyan-500",
    },
    {
      name: "Instagram",
      value: analytics.trafficSources.instagram,
      icon: "📸",
      barColor: "bg-pink-500",
    },
    {
      name: "Other",
      value: analytics.trafficSources.other,
      icon: "🌐",
      barColor: "bg-purple-500",
    },
  ];

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Header Section */}
        <div className="border-b border-gray-200 bg-white">
          <div className="px-4 sm:px-10 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
                    Analytics
                  </h1>
                  <p className="text-gray-600">
                    Last 30 days performance overview
                  </p>
                </div>
                <button
                  onClick={fetchAnalyticsData}
                  disabled={isRefreshing}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg font-medium transition-all text-sm flex items-center gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="min-h-screen text-gray-900 px-4 sm:px-10 py-12">
          <div className="max-w-7xl mx-auto">
            {/* TODAY'S QUICK VIEW */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <h2 className="text-lg font-bold text-gray-900 mb-4">📊 Today's Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Checkouts Today */}
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <p className="text-gray-600 text-xs uppercase tracking-wide font-medium mb-2">
                    Checkouts Today
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {analytics.totalOrders}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">Total orders</p>
                </div>

                {/* Sales Today */}
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <p className="text-gray-600 text-xs uppercase tracking-wide font-medium mb-2">
                    Total Sales
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    ${todayRevenue.toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">Today's revenue</p>
                </div>

                {/* Products Sold */}
                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <p className="text-gray-600 text-xs uppercase tracking-wide font-medium mb-2">
                    Products Sold
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {analytics.topProducts.length}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">Different products</p>
                </div>
              </div>
            </div>

            {/* CALENDAR VIEW - DAILY SALES */}
            <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">📅 Sales Calendar</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() - 1,
                        ),
                      );
                      setSelectedDate(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-sm font-semibold text-gray-900 min-w-[180px] text-center">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <button
                    onClick={() => {
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() + 1,
                        ),
                      );
                      setSelectedDate(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Selected Day Details */}
              {selectedDate && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                        Revenue
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        ${selectedDayRevenue.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                        Orders
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedDayOrders}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold text-gray-600 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, idx) => {
                  const revenue = getRevenueForDay(day);
                  const dateStr = day
                    ? `${currentMonth.getFullYear()}-${String(
                        currentMonth.getMonth() + 1,
                      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                    : null;
                  const isSelected = selectedDate === dateStr;
                  const hasRevenue = revenue > 0;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (day) {
                          setSelectedDate(dateStr);
                        }
                      }}
                      disabled={!day}
                      className={`aspect-square rounded-lg p-2 text-sm font-medium transition-all ${
                        !day
                          ? "bg-transparent cursor-default"
                          : isSelected
                            ? "ring-2 ring-green-500 ring-offset-2 bg-green-500 text-white"
                            : hasRevenue
                              ? `${getColorIntensity(revenue)} text-gray-900 hover:shadow-md cursor-pointer`
                              : "bg-gray-50 text-gray-400 hover:bg-gray-100 cursor-pointer"
                      }`}
                    >
                      {day && (
                        <div className="flex flex-col h-full justify-between">
                          <span className="text-xs">{day}</span>
                          {hasRevenue && (
                            <span className="text-xs font-bold">
                              ${(revenue / 100).toFixed(0)}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-3">
                  Color Legend:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-50 rounded"></div>
                    <span className="text-xs text-gray-600">No Sales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded"></div>
                    <span className="text-xs text-gray-600">Low</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-200 rounded"></div>
                    <span className="text-xs text-gray-600">Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-400 rounded"></div>
                    <span className="text-xs text-gray-600">High</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-600 rounded"></div>
                    <span className="text-xs text-gray-600">Very High</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Revenue */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      ${analytics.totalRevenue.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-green-600 text-xs font-semibold">
                      <ArrowUpRight className="w-3 h-3" />
                      +15% from last month
                    </div>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Orders */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {analytics.totalOrders}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-blue-600 text-xs font-semibold">
                      <ArrowUpRight className="w-3 h-3" />
                      {analytics.avgOrderValue > 0
                        ? `Avg $${analytics.avgOrderValue.toFixed(2)}`
                        : "N/A"}
                    </div>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">
                      Conversion Rate
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {analytics.conversionRate.toFixed(2)}%
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-purple-600 text-xs font-semibold">
                      <TrendingUp className="w-3 h-3" />
                      +3% from last period
                    </div>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Customers */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-xs uppercase tracking-wide font-medium">
                      Total Customers
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {analytics.customerMetrics.totalCustomers}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-orange-600 text-xs font-semibold">
                      <ArrowUpRight className="w-3 h-3" />
                      {analytics.customerMetrics.newCustomersThisMonth} new this
                      month
                    </div>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row - Traffic & Customer Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Traffic Overview */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">
                  Traffic Overview
                </h2>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 text-xs font-medium">
                        Active Users
                      </span>
                      <span className="text-gray-900 font-bold">
                        {analytics.activeUsers}
                      </span>
                    </div>
                    <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-green-500 h-full"
                        style={{
                          width:
                            Math.min((analytics.activeUsers / 100) * 100, 100) +
                            "%",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 text-xs font-medium">
                        Page Views
                      </span>
                      <span className="text-gray-900 font-bold">
                        {analytics.totalPageViews}
                      </span>
                    </div>
                    <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full"
                        style={{
                          width:
                            Math.min(
                              (analytics.totalPageViews / 5000) * 100,
                              100,
                            ) + "%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Metrics */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">
                  Customer Metrics
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700 text-xs">
                      Repeat Customers
                    </span>
                    <span className="text-gray-900 font-bold">
                      {analytics.customerMetrics.repeatCustomers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700 text-xs">
                      Avg Lifetime Value
                    </span>
                    <span className="text-gray-900 font-bold">
                      $
                      {analytics.customerMetrics.avgCustomerLifetimeValue.toFixed(
                        2,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Device Distribution */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 hover:shadow-md transition-shadow">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                Device Distribution
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    name: "Mobile",
                    icon: Smartphone,
                    value: analytics.devices.mobile,
                    color: "bg-pink-100",
                    iconColor: "text-pink-600",
                    barColor: "bg-pink-500",
                  },
                  {
                    name: "Desktop",
                    icon: Monitor,
                    value: analytics.devices.desktop,
                    color: "bg-blue-100",
                    iconColor: "text-blue-600",
                    barColor: "bg-blue-500",
                  },
                  {
                    name: "Tablet",
                    icon: Tablet,
                    value: analytics.devices.tablet,
                    color: "bg-emerald-100",
                    iconColor: "text-emerald-600",
                    barColor: "bg-emerald-500",
                  },
                ].map((device, idx) => {
                  const Icon = device.icon;
                  const percentage =
                    totalDevices > 0 ? (device.value / totalDevices) * 100 : 0;
                  return (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-gray-600 text-xs">{device.name}</p>
                          <p className="text-lg font-bold text-gray-900">
                            {device.value}
                          </p>
                        </div>
                        <Icon className={`w-4 h-4 ${device.iconColor}`} />
                      </div>
                      <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${device.barColor}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-gray-500 text-xs mt-1">
                        {percentage.toFixed(0)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 hover:shadow-md transition-shadow">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                Traffic Sources
              </h2>
              <div className="space-y-3">
                {trafficData.map((source, idx) => {
                  const percentage =
                    totalTraffic > 0 ? (source.value / totalTraffic) * 100 : 0;
                  return (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{source.icon}</span>
                          <div>
                            <p className="text-gray-900 font-medium text-sm">
                              {source.name}
                            </p>
                            <p className="text-gray-600 text-xs">
                              {source.value} visitors
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-900 font-bold text-sm">
                          {percentage.toFixed(0)}%
                        </p>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${source.barColor}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Products */}
            {analytics.topProducts.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 hover:shadow-md transition-shadow">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">
                  Top Products
                </h2>
                <div className="space-y-2">
                  {analytics.topProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border border-gray-200 rounded p-3 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        <p className="text-gray-900 font-medium text-sm">
                          {product.name}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {product.sales} sales
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-600 font-bold text-sm">
                          ${product.revenue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Pages */}
            {analytics.topPages.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">
                  Top Pages
                </h2>
                <div className="space-y-2">
                  {analytics.topPages.map((page, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded p-3 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <p className="text-gray-900 text-sm">{page.path}</p>
                      <p className="text-gray-600 text-xs font-medium">
                        {page.views} views
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
