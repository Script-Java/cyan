import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ShoppingBag, User, FileText, Package, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProfileCard from "@/components/dashboard/ProfileCard";
import OrdersSection from "@/components/dashboard/OrdersSection";

interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
}

interface Order {
  id: number;
  customerId: number;
  status: string;
  dateCreated: string;
  total: number;
  itemCount: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [customerRes, ordersRes] = await Promise.all([
          fetch("/api/customers/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/orders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!customerRes.ok) {
          throw new Error("Failed to fetch customer data");
        }

        const customerData = await customerRes.json();
        setCustomer(customerData.customer);

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("customerId");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-[#030140] to-[#1a0055] py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="text-white text-lg">Loading your dashboard...</div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-[#030140] to-[#1a0055]">
        <DashboardLayout>
          {error && (
            <div className="mb-6 p-4 bg-red-50/10 border border-red-500/30 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Welcome, {customer?.firstName}!
              </h1>
              <p className="text-blue-200">Manage your account and orders</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors w-fit"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 border border-blue-300/20 rounded-xl p-6 hover:border-blue-300/40 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <p className="text-blue-200 text-sm font-medium">Total Orders</p>
                  <p className="text-3xl font-bold text-white">{orders.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-blue-300/20 rounded-xl p-6 hover:border-blue-300/40 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Package className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <p className="text-blue-200 text-sm font-medium">Total Spent</p>
                  <p className="text-3xl font-bold text-white">
                    ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-blue-300/20 rounded-xl p-6 hover:border-blue-300/40 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <FileText className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <p className="text-blue-200 text-sm font-medium">Active Orders</p>
                  <p className="text-3xl font-bold text-white">
                    {orders.filter((o) => o.status !== "completed").length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <ProfileCard customer={customer} />

            {/* Orders Section */}
            <OrdersSection orders={orders} />
          </div>
        </DashboardLayout>
      </main>
    </>
  );
}
