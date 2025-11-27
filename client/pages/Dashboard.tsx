import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  ShoppingBag,
  User,
  FileText,
  Package,
  AlertCircle,
} from "lucide-react";
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

        // Fetch customer data
        let customerError: string | null = null;
        try {
          const customerRes = await fetch("/api/customers/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (customerRes.ok) {
            const customerData = await customerRes.json();
            if (customerData.customer) {
              setCustomer(customerData.customer);
            }
          } else {
            try {
              const errorData = await customerRes.json();
              customerError =
                errorData.error || "Failed to fetch customer data";
            } catch {
              customerError = `Failed to fetch customer data (${customerRes.status})`;
            }
            setError(customerError);
          }
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Network error fetching customer data";
          setError(message);
        }

        // Fetch orders data (separate try-catch to not fail the whole dashboard)
        try {
          const ordersRes = await fetch("/api/orders", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            setOrders(ordersData.orders || []);
          } else {
            try {
              const errorData = await ordersRes.json();
              const ordersError = errorData.error || "Failed to fetch orders";
              // Only set error if we don't already have one
              if (!customerError) {
                setError(ordersError);
              }
            } catch {
              if (!customerError) {
                setError(`Failed to fetch orders (${ordersRes.status})`);
              }
            }
          }
        } catch (err) {
          if (!customerError) {
            const message =
              err instanceof Error
                ? err.message
                : "Network error fetching orders";
            setError(message);
          }
        }
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
        <main className="min-h-screen bg-white py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600 text-lg">
                Loading your dashboard...
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <DashboardLayout>
          {error && (
            <div
              className="bg-red-50 border border-red-200 rounded-lg flex gap-3"
              style={{
                margin: "53px 0 24px",
                padding: "16px 16px 200px",
              }}
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
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
            activeOrderCount={
              orders.filter(
                (o) => o.status === "pending" || o.status === "processing",
              ).length
            }
          />

          {/* Quick Order Section */}
          <QuickOrderSection />
        </DashboardLayout>
      </main>
    </>
  );
}
