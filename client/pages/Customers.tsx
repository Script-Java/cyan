import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Filter,
  ChevronRight,
  X,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  ShoppingBag,
  Calendar,
  Building2,
  SortAsc,
  TrendingUp,
} from "lucide-react";
import Header from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  storeCredit: number;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate?: string;
}

interface CustomerDetails extends Customer {
  orders: Array<{
    id: number;
    total: number;
    status: string;
    createdAt: string;
    itemCount: number;
  }>;
}

interface CustomersResponse {
  success: boolean;
  customers: Customer[];
  count: number;
}

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "spent" | "name">("newest");
  const [filterOption, setFilterOption] = useState<"all" | "with-orders" | "no-orders">("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }

    fetchCustomers();
  }, [navigate]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError("");

      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data: CustomersResponse = await response.json();
      setCustomers(data.customers || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch customers");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerDetails = async (customerId: number) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch customer details");
      }

      const data = await response.json();
      setSelectedCustomer(data.customer);
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Error fetching customer details:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch details");
    }
  };

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.company?.toLowerCase() || "").includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterOption === "all" ||
        (filterOption === "with-orders" && customer.orderCount > 0) ||
        (filterOption === "no-orders" && customer.orderCount === 0);

      return matchesSearch && matchesFilter;
    });
  }, [customers, searchQuery, filterOption]);

  // Sort customers
  const sortedCustomers = useMemo(() => {
    const sorted = [...filteredCustomers];

    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "spent":
        sorted.sort((a, b) => b.totalSpent - a.totalSpent);
        break;
      case "name":
        sorted.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
        break;
    }

    return sorted;
  }, [filteredCustomers, sortBy]);

  const stats = {
    totalCustomers: customers.length,
    customersWithOrders: customers.filter((c) => c.orderCount > 0).length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgOrderValue:
      customers.length > 0
        ? customers.reduce((sum, c) => sum + c.totalSpent, 0) /
          customers.filter((c) => c.orderCount > 0).length
        : 0,
  };

  return (
    <>
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 ml-64 min-h-screen bg-gray-50">
          <div className="pt-6">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
              <div className="px-6 lg:px-8 py-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                      <Users className="w-8 h-8 text-blue-600" />
                      Customers
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Manage and view all customer information and their order history
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-6 lg:px-8 py-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-2">Total Customers</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
                    </div>
                    <Users className="w-10 h-10 text-blue-100" />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-2">Active Customers</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.customersWithOrders}</p>
                    </div>
                    <ShoppingBag className="w-10 h-10 text-green-100" />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-2">Total Revenue</p>
                      <p className="text-3xl font-bold text-gray-900">
                        ${stats.totalRevenue.toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="w-10 h-10 text-emerald-100" />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-2">Avg Order Value</p>
                      <p className="text-3xl font-bold text-gray-900">
                        ${stats.avgOrderValue.toFixed(2)}
                      </p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-orange-100" />
                  </div>
                </div>
              </div>

              {/* Search and Filter Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or company..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <SortAsc className="w-5 h-5 text-gray-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="spent">Highest Spent</option>
                      <option value="name">Name (A-Z)</option>
                    </select>
                  </div>

                  {/* Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <select
                      value={filterOption}
                      onChange={(e) => setFilterOption(e.target.value as typeof filterOption)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="all">All Customers</option>
                      <option value="with-orders">With Orders</option>
                      <option value="no-orders">No Orders</option>
                    </select>
                  </div>
                </div>

                {/* Results Info */}
                <p className="text-sm text-gray-600">
                  Showing {sortedCustomers.length} of {customers.length} customers
                </p>
              </div>

              {/* Customers List */}
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Loading customers...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-96">
                  <div className="text-center">
                    <p className="text-red-600 font-medium">{error}</p>
                    <Button onClick={fetchCustomers} className="mt-4">
                      Retry
                    </Button>
                  </div>
                </div>
              ) : sortedCustomers.length === 0 ? (
                <div className="flex justify-center items-center h-96">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No customers found</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {searchQuery ? "Try adjusting your search" : "Customers will appear here"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => fetchCustomerDetails(customer.id)}
                      className="w-full bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Customer Name and Email */}
                          <div className="mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {customer.firstName} {customer.lastName}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                              <Mail className="w-4 h-4" />
                              {customer.email}
                            </div>
                          </div>

                          {/* Customer Details Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                            {/* Phone */}
                            {customer.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{customer.phone}</span>
                              </div>
                            )}

                            {/* Company */}
                            {customer.company && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Building2 className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{customer.company}</span>
                              </div>
                            )}

                            {/* Signup Date */}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              {new Date(customer.createdAt).toLocaleDateString()}
                            </div>

                            {/* Store Credit */}
                            {customer.storeCredit > 0 && (
                              <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                                <DollarSign className="w-4 h-4 flex-shrink-0" />
                                ${customer.storeCredit.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Side Stats */}
                        <div className="ml-4 text-right">
                          <div className="bg-blue-50 rounded-lg px-4 py-3 mb-2">
                            <p className="text-gray-600 text-xs font-medium">Orders</p>
                            <p className="text-2xl font-bold text-blue-600">{customer.orderCount}</p>
                          </div>
                          <div className="bg-emerald-50 rounded-lg px-4 py-3">
                            <p className="text-gray-600 text-xs font-medium">Total Spent</p>
                            <p className="text-2xl font-bold text-emerald-600">
                              ${customer.totalSpent.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Chevron */}
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-4 self-center" />
                      </div>

                      {/* Last Order Info */}
                      {customer.lastOrderDate && (
                        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                          Last order: {new Date(customer.lastOrderDate).toLocaleDateString()}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                {selectedCustomer.firstName} {selectedCustomer.lastName}
              </DialogTitle>
              <DialogDescription>Customer profile and order history</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">Email</p>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {selectedCustomer.email}
                    </p>
                  </div>
                  {selectedCustomer.phone && (
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">Phone</p>
                      <p className="text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {selectedCustomer.phone}
                      </p>
                    </div>
                  )}
                  {selectedCustomer.company && (
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">Company</p>
                      <p className="text-gray-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        {selectedCustomer.company}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">Signup Date</p>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-gray-600 text-xs font-medium mb-2">Total Orders</p>
                  <p className="text-3xl font-bold text-blue-600">{selectedCustomer.orderCount}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-gray-600 text-xs font-medium mb-2">Total Spent</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    ${selectedCustomer.totalSpent.toFixed(2)}
                  </p>
                </div>
                {selectedCustomer.storeCredit > 0 && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-gray-600 text-xs font-medium mb-2">Store Credit</p>
                    <p className="text-3xl font-bold text-orange-600">
                      ${selectedCustomer.storeCredit.toFixed(2)}
                    </p>
                  </div>
                )}
                {selectedCustomer.orderCount > 0 && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-gray-600 text-xs font-medium mb-2">Avg Order Value</p>
                    <p className="text-3xl font-bold text-purple-600">
                      ${(selectedCustomer.totalSpent / selectedCustomer.orderCount).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Order History */}
              {selectedCustomer.orders && selectedCustomer.orders.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Order History</h3>
                  <div className="space-y-3">
                    {selectedCustomer.orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">Order #{order.id}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <ShoppingBag className="w-4 h-4" />
                              {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!selectedCustomer.orders || selectedCustomer.orders.length === 0) && (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">No orders yet</p>
                  <p className="text-gray-500 text-sm mt-1">This customer hasn't placed any orders</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
