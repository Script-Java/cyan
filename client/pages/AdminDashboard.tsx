import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import ProofNotificationAlert from "@/components/dashboard/ProofNotificationAlert";
import DashboardSalesCalendar from "@/components/dashboard/DashboardSalesCalendar";
import ProductionBreakdown from "@/components/dashboard/ProductionBreakdown";
import ApprovedProofs from "@/components/dashboard/ApprovedProofs";
import DashboardRecentOrders from "@/components/dashboard/DashboardRecentOrders";

interface OrderItem {
  id?: number;
  quantity?: number;
  product_name?: string;
  options?: Record<string, any>;
  design_file_url?: string;
}

interface Order {
  id: number;
  customerId?: number;
  customerName: string;
  customerEmail: string;
  status: string;
  total: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  dateCreated: string;
  itemCount?: number;
  orderItems?: OrderItem[];
}

interface DayData {
  date: string;
  revenue: number;
  orders: number;
}

interface Proof {
  id: number;
  orderId: number;
  customerName: string;
  thumbnailUrl?: string;
  approvedAt: string;
  status: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Selected date state - default to today
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Sales data (from analytics endpoint)
  const [salesData, setSalesData] = useState<DayData[]>([]);

  // Production status data
  const [printingCount, setPrintingCount] = useState(0);
  const [printedCount, setPrintedCount] = useState(0);
  const [shippedCount, setShippedCount] = useState(0);

  // Orders and proofs for selected day
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [approvedProofs, setApprovedProofs] = useState<Proof[]>([]);
  const [proofsLoading, setProofsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }

    setIsAuthenticated(true);
    fetchAnalyticsData();
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrdersForDate();
      fetchProofsForDate();
    }
  }, [selectedDate, isAuthenticated]);

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
        setSalesData(data.revenueByDay || []);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    }
  };

  const fetchOrdersForDate = async () => {
    try {
      setOrdersLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(
        `/api/admin/all-orders?date=${selectedDate}&limit=10&page=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const orders = data.orders || [];

        // Count orders by status
        const printingOrders = orders.filter(
          (o: Order) => o.status?.toUpperCase() === "PRINTING",
        ).length;
        const printedOrders = orders.filter(
          (o: Order) => o.status?.toUpperCase() === "PRINTED",
        ).length;
        const shippedOrders = orders.filter(
          (o: Order) => o.status?.toUpperCase() === "SHIPPED",
        ).length;

        setPrintingCount(printingOrders);
        setPrintedCount(printedOrders);
        setShippedCount(shippedOrders);

        // Orders are already sorted by date created (newest first) from the server
        setRecentOrders(orders);
      } else {
        console.error("Failed to fetch orders:", response.statusText);
        setRecentOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setRecentOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchProofsForDate = async () => {
    try {
      setProofsLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(
        `/api/admin/proofs?date=${selectedDate}&status=APPROVED&limit=10&page=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setApprovedProofs(data.proofs || []);
      } else {
        console.error("Failed to fetch proofs:", response.statusText);
        setApprovedProofs([]);
      }
    } catch (error) {
      console.error("Error fetching proofs:", error);
      setApprovedProofs([]);
    } finally {
      setProofsLoading(false);
    }
  };

  if (!isAuthenticated || isLoading) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's what's happening with your store today.
            </p>
          </div>

          {/* Proof Notifications */}
          <div className="mb-6">
            <ProofNotificationAlert />
          </div>

          <div className="space-y-6">
            {/* Sales Calendar */}
            <DashboardSalesCalendar
              salesData={salesData}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />

            {/* Production Status Cards */}
            <ProductionBreakdown
              printingCount={printingCount}
              printedCount={printedCount}
              shippedCount={shippedCount}
              selectedDate={selectedDate}
            />

            {/* Two Column Layout for Proofs and Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Approved Proofs */}
              <ApprovedProofs proofs={approvedProofs} isLoading={proofsLoading} />

              {/* Recent Orders */}
              <DashboardRecentOrders
                orders={recentOrders}
                isLoading={ordersLoading}
                selectedDate={selectedDate}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
