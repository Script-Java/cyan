import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  User,
  Mail,
  Phone,
  ShoppingBag,
  DollarSign,
  ChevronRight,
} from "lucide-react";

interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  storeCredit: number;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate?: string;
}

export default function AdminCustomers() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }

    setIsAuthenticated(true);
    fetchCustomers();
  }, [navigate]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Header Section */}
        <div className="border-b border-gray-200 bg-white">
          <div className="px-4 sm:px-10 py-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
                    Customers
                  </h1>
                  <p className="text-gray-600">
                    Manage and view customer information
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="min-h-screen text-gray-900 px-4 sm:px-10 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}

            {/* Search */}
            <div className="mb-6 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 pl-10 focus:border-blue-500"
              />
            </div>

            {/* Customer List */}
            {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <div className="text-gray-600">Loading customers...</div>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {customers.length === 0
                    ? "No customers yet"
                    : "No matching customers"}
                </h3>
                <p className="text-gray-600">
                  {customers.length === 0
                    ? "Customers who sign up or place orders will appear here"
                    : "Try adjusting your search criteria"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all group cursor-pointer"
                    onClick={() => navigate(`/admin/customers/${customer.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {customer.firstName} {customer.lastName}
                          </h3>
                        </div>

                        {/* Contact Info */}
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <a
                              href={`mailto:${customer.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {customer.email}
                            </a>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <a
                                href={`tel:${customer.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                {customer.phone}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <ShoppingBag className="w-3 h-3" />
                            <span>
                              {customer.orderCount}{" "}
                              {customer.orderCount === 1 ? "order" : "orders"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <DollarSign className="w-3 h-3" />
                            <span>
                              Total: {formatCurrency(customer.totalSpent)}
                            </span>
                          </div>
                          {customer.lastOrderDate && (
                            <div className="text-gray-500 text-xs">
                              Last order: {formatDate(customer.lastOrderDate)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* View Button */}
                      <div className="flex-shrink-0">
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary Stats */}
            {!isLoading && customers.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {customers.length}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(
                      customers.reduce((sum, c) => sum + c.totalSpent, 0),
                    )}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Average Order Value</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(
                      customers.length > 0
                        ? customers.reduce((sum, c) => sum + c.totalSpent, 0) /
                            customers.reduce((sum, c) => sum + c.orderCount, 0)
                        : 0,
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
