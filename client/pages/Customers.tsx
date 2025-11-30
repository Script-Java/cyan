import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  Mail,
  Phone,
  Building2,
  DollarSign,
  ShoppingBag,
  Calendar,
  TrendingUp,
  ArrowUpDown,
} from "lucide-react";
import Header from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";

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

type SortColumn = "name" | "email" | "orders" | "spent" | "date";

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expandedCustomerId, setExpandedCustomerId] = useState<number | null>(
    null,
  );
  const [expandedDetails, setExpandedDetails] =
    useState<CustomerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState<
    "all" | "with-orders" | "no-orders"
  >("all");
  const [sortColumn, setSortColumn] = useState<SortColumn>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

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
      setError(
        err instanceof Error ? err.message : "Failed to fetch customers",
      );
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
      setExpandedDetails(data.customer);
      setExpandedCustomerId(customerId);
    } catch (err) {
      console.error("Error fetching customer details:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch details");
    }
  };

  const handleRowClick = (customerId: number) => {
    if (expandedCustomerId === customerId) {
      setExpandedCustomerId(null);
      setExpandedDetails(null);
    } else {
      fetchCustomerDetails(customerId);
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.company?.toLowerCase() || "").includes(
          searchQuery.toLowerCase(),
        );

      const matchesFilter =
        filterOption === "all" ||
        (filterOption === "with-orders" && customer.orderCount > 0) ||
        (filterOption === "no-orders" && customer.orderCount === 0);

      return matchesSearch && matchesFilter;
    });
  }, [customers, searchQuery, filterOption]);

  const sortedCustomers = useMemo(() => {
    const sorted = [...filteredCustomers];
    const multiplier = sortDirection === "asc" ? 1 : -1;

    switch (sortColumn) {
      case "name":
        sorted.sort(
          (a, b) =>
            `${a.firstName} ${a.lastName}`.localeCompare(
              `${b.firstName} ${b.lastName}`,
            ) * multiplier,
        );
        break;
      case "email":
        sorted.sort((a, b) => a.email.localeCompare(b.email) * multiplier);
        break;
      case "orders":
        sorted.sort((a, b) => (a.orderCount - b.orderCount) * multiplier);
        break;
      case "spent":
        sorted.sort((a, b) => (a.totalSpent - b.totalSpent) * multiplier);
        break;
      case "date":
        sorted.sort(
          (a, b) =>
            (new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()) *
            multiplier,
        );
        break;
    }

    return sorted;
  }, [filteredCustomers, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

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

  const SortHeader = ({
    label,
    column,
  }: {
    label: string;
    column: SortColumn;
  }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
    >
      {label}
      <ArrowUpDown
        className={`w-4 h-4 transition-all ${
          sortColumn === column ? "text-blue-600" : "text-gray-400"
        }`}
      />
    </button>
  );

  return (
    <>
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 ml-64 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
          <div className="pt-6">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
              <div className="px-6 lg:px-8 py-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      Customers
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Manage and analyze all customer information
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-6 lg:px-8 py-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium mb-2">
                        Total Customers
                      </p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                        {stats.totalCustomers}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium mb-2">
                        Active Customers
                      </p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {stats.customersWithOrders}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <ShoppingBag className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium mb-2">
                        Total Revenue
                      </p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        ${stats.totalRevenue.toFixed(0)}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium mb-2">
                        Avg Order Value
                      </p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                        ${stats.avgOrderValue.toFixed(0)}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Filter Controls */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or company..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <select
                      value={filterOption}
                      onChange={(e) =>
                        setFilterOption(e.target.value as typeof filterOption)
                      }
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
                    >
                      <option value="all">All Customers</option>
                      <option value="with-orders">With Orders</option>
                      <option value="no-orders">No Orders</option>
                    </select>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-3">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {sortedCustomers.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">
                    {customers.length}
                  </span>{" "}
                  customers
                </p>
              </div>

              {/* Table */}
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3 animate-pulse" />
                    <p className="text-gray-600 font-medium">
                      Loading customers...
                    </p>
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
                    <p className="text-gray-600 font-medium">
                      No customers found
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {searchQuery
                        ? "Try adjusting your search"
                        : "Customers will appear here"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left w-8"></th>
                          <th className="px-6 py-4 text-left">
                            <SortHeader label="Name" column="name" />
                          </th>
                          <th className="px-6 py-4 text-left">
                            <SortHeader label="Email" column="email" />
                          </th>
                          <th className="px-6 py-4 text-left">Contact</th>
                          <th className="px-6 py-4 text-left">
                            <SortHeader label="Orders" column="orders" />
                          </th>
                          <th className="px-6 py-4 text-left">
                            <SortHeader label="Total Spent" column="spent" />
                          </th>
                          <th className="px-6 py-4 text-left">
                            <SortHeader label="Signup Date" column="date" />
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {sortedCustomers.map((customer, index) => (
                          <>
                            {/* Main Row */}
                            <tr
                              key={`main-${customer.id}`}
                              onClick={() => handleRowClick(customer.id)}
                              className={`hover:bg-blue-50 transition-colors duration-200 cursor-pointer ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }`}
                            >
                              <td className="px-6 py-4">
                                <ChevronDown
                                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                                    expandedCustomerId === customer.id
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                />
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-sm">
                                      {customer.firstName.charAt(0)}
                                      {customer.lastName.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      {customer.firstName} {customer.lastName}
                                    </p>
                                    {customer.company && (
                                      <p className="text-xs text-gray-600">
                                        {customer.company}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-gray-700">
                                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <span className="text-sm">
                                    {customer.email}
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                {customer.phone ? (
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm">
                                      {customer.phone}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">
                                    —
                                  </span>
                                )}
                              </td>

                              <td className="px-6 py-4">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                                  <span className="font-bold text-blue-600 text-sm">
                                    {customer.orderCount}
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <div className="font-semibold text-gray-900">
                                  ${customer.totalSpent.toFixed(2)}
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-gray-700">
                                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <span className="text-sm">
                                    {new Date(
                                      customer.createdAt,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </td>
                            </tr>

                            {/* Expanded Details Row */}
                            {expandedCustomerId === customer.id &&
                              expandedDetails && (
                                <tr
                                  key={`expanded-${customer.id}`}
                                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200"
                                >
                                  <td colSpan={8} className="p-0">
                                    <div className="px-6 py-8 space-y-6">
                                      {/* Personal Information */}
                                      <div>
                                        <h3 className="font-bold text-gray-900 mb-4 text-lg">
                                          Personal Information
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs text-gray-600 font-medium mb-2 uppercase tracking-wide">
                                              Email
                                            </p>
                                            <p className="text-gray-900 flex items-start gap-2">
                                              <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                              <span className="break-all">
                                                {expandedDetails.email}
                                              </span>
                                            </p>
                                          </div>

                                          {expandedDetails.phone && (
                                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                              <p className="text-xs text-gray-600 font-medium mb-2 uppercase tracking-wide">
                                                Phone
                                              </p>
                                              <p className="text-gray-900 flex items-start gap-2">
                                                <Phone className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                {expandedDetails.phone}
                                              </p>
                                            </div>
                                          )}

                                          {expandedDetails.company && (
                                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                              <p className="text-xs text-gray-600 font-medium mb-2 uppercase tracking-wide">
                                                Company
                                              </p>
                                              <p className="text-gray-900 flex items-start gap-2">
                                                <Building2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                {expandedDetails.company}
                                              </p>
                                            </div>
                                          )}

                                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <p className="text-xs text-gray-600 font-medium mb-2 uppercase tracking-wide">
                                              Signup Date
                                            </p>
                                            <p className="text-gray-900 flex items-start gap-2">
                                              <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                              {new Date(
                                                expandedDetails.createdAt,
                                              ).toLocaleDateString()}
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Customer Statistics */}
                                      <div>
                                        <h3 className="font-bold text-gray-900 mb-4 text-lg">
                                          Customer Statistics
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                            <p className="text-gray-600 text-xs font-medium mb-2 uppercase tracking-wide">
                                              Total Orders
                                            </p>
                                            <p className="text-3xl font-bold text-blue-600">
                                              {expandedDetails.orderCount}
                                            </p>
                                          </div>

                                          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
                                            <p className="text-gray-600 text-xs font-medium mb-2 uppercase tracking-wide">
                                              Total Spent
                                            </p>
                                            <p className="text-3xl font-bold text-emerald-600">
                                              $
                                              {expandedDetails.totalSpent.toFixed(
                                                2,
                                              )}
                                            </p>
                                          </div>

                                          {expandedDetails.storeCredit > 0 && (
                                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                                              <p className="text-gray-600 text-xs font-medium mb-2 uppercase tracking-wide">
                                                Store Credit
                                              </p>
                                              <p className="text-3xl font-bold text-orange-600">
                                                $
                                                {expandedDetails.storeCredit.toFixed(
                                                  2,
                                                )}
                                              </p>
                                            </div>
                                          )}

                                          {expandedDetails.orderCount > 0 && (
                                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                                              <p className="text-gray-600 text-xs font-medium mb-2 uppercase tracking-wide">
                                                Avg Order Value
                                              </p>
                                              <p className="text-3xl font-bold text-purple-600">
                                                $
                                                {(
                                                  expandedDetails.totalSpent /
                                                  expandedDetails.orderCount
                                                ).toFixed(2)}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Order History */}
                                      {expandedDetails.orders &&
                                        expandedDetails.orders.length > 0 && (
                                          <div>
                                            <h3 className="font-bold text-gray-900 mb-4 text-lg">
                                              Order History (
                                              {expandedDetails.orders.length})
                                            </h3>
                                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                              {expandedDetails.orders.map(
                                                (order) => (
                                                  <div
                                                    key={order.id}
                                                    className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                                                  >
                                                    <div className="flex items-center justify-between">
                                                      <div className="flex-1">
                                                        <p className="font-semibold text-gray-900">
                                                          Order #{order.id}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                                                          <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {new Date(
                                                              order.createdAt,
                                                            ).toLocaleDateString()}
                                                          </span>
                                                          <span className="flex items-center gap-1">
                                                            <ShoppingBag className="w-4 h-4" />
                                                            {order.itemCount}{" "}
                                                            item
                                                            {order.itemCount !==
                                                            1
                                                              ? "s"
                                                              : ""}
                                                          </span>
                                                        </div>
                                                      </div>
                                                      <div className="text-right ml-4">
                                                        <p className="font-bold text-gray-900">
                                                          $
                                                          {order.total.toFixed(
                                                            2,
                                                          )}
                                                        </p>
                                                        <span
                                                          className={`text-xs font-medium inline-block mt-2 px-3 py-1 rounded-full ${
                                                            order.status ===
                                                            "pending"
                                                              ? "bg-yellow-100 text-yellow-800"
                                                              : order.status ===
                                                                  "completed"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-gray-100 text-gray-800"
                                                          }`}
                                                        >
                                                          {order.status}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        )}

                                      {(!expandedDetails.orders ||
                                        expandedDetails.orders.length ===
                                          0) && (
                                        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                                          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                          <p className="text-gray-600 font-medium">
                                            No orders yet
                                          </p>
                                          <p className="text-gray-500 text-sm mt-1">
                                            This customer hasn't placed any
                                            orders
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
