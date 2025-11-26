import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ShoppingBag, User, FileText, Package, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import GreetingBanner from "@/components/dashboard/GreetingBanner";
import ProfileCard from "@/components/dashboard/ProfileCard";
import OrdersSection from "@/components/dashboard/OrdersSection";
import DashboardNavigation from "@/components/dashboard/DashboardNavigation";
import PromoBanner from "@/components/dashboard/PromoBanner";
import ActiveOrdersSummary from "@/components/dashboard/ActiveOrdersSummary";
import QuickOrderSection from "@/components/dashboard/QuickOrderSection";

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

          {/* Greeting Banner */}
          {customer && <GreetingBanner firstName={customer.firstName} />}

          {/* Dashboard Navigation Grid */}
          <DashboardNavigation onLogout={handleLogout} />

          {/* Promotional Banner */}
          <PromoBanner />

          {/* Active Orders Summary */}
          <ActiveOrdersSummary
            activeOrderCount={orders.filter((o) => o.status !== "completed").length}
          />

          {/* Quick Order Section */}
          <QuickOrderSection />
        </DashboardLayout>
      </main>
    </>
  );
}
