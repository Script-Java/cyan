import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  DollarSign,
  Edit,
} from "lucide-react";

interface CustomerOrder {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  itemCount: number;
}

interface CustomerDetail {
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
  orders: CustomerOrder[];
}

export default function AdminCustomerDetail() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }
    setIsAuthenticated(true);
    fetchCustomerDetail();
  }, [customerId, navigate]);

  const fetchCustomerDetail = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token || !customerId) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error(
            `Failed to fetch customer: ${response.status}`,
            errorData,
          );
          setErrorMessage(
            errorData.error || `Failed to fetch customer (${response.status})`,
          );
        } catch {
          console.error(`Failed to fetch customer: ${response.status}`);
          setErrorMessage(`Failed to fetch customer: ${response.statusText}`);
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success && data.customer) {
        setCustomer(data.customer);
        setErrorMessage(null);
      } else {
        setErrorMessage("Invalid response from server");
        console.error("Unexpected response format:", data);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Error fetching customer detail:", errorMsg);
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "text-amber-600 bg-amber-50";
      case "paid":
        return "text-emerald-600 bg-emerald-50";
      case "processing":
        return "text-yellow-600 bg-yellow-50";
      case "shipped":
        return "text-blue-600 bg-blue-50";
      case "delivered":
        return "text-green-600 bg-green-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="text-gray-600">Loading customer details...</div>
        </div>
      </AdminLayout>
    );
  }

  if (errorMessage || !customer) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate("/admin/customers")}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Customers
          </button>
          <div className="bg-white border border-gray-200 rounded-lg p-8 sm:p-12 text-center">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Unable to Load Customer
            </h3>
            <p className="text-sm text-gray-600">
              {errorMessage || "The requested customer could not be found."}
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/customers")}
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Customers
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {customer.firstName} {customer.lastName}
            </h1>
          </div>
          <p className="text-gray-600">
            Customer since {formatDate(customer.createdAt)}
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-xs text-gray-600 font-medium">EMAIL</p>
                </div>
                <a
                  href={`mailto:${customer.email}`}
                  className="text-blue-600 hover:text-blue-700 break-all"
                >
                  {customer.email}
                </a>
              </div>
              {customer.phone && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-600 font-medium">PHONE</p>
                  </div>
                  <a
                    href={`tel:${customer.phone}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {customer.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Customer Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-gray-600 font-medium">
                  TOTAL ORDERS
                </p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {customer.orderCount}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <p className="text-xs text-gray-600 font-medium">TOTAL SPENT</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(customer.totalSpent)}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-amber-600" />
                <p className="text-xs text-gray-600 font-medium">
                  STORE CREDIT
                </p>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {formatCurrency(customer.storeCredit)}
              </p>
            </div>
          </div>

          {/* Order History */}
          {customer.orders.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order History ({customer.orders.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Order ID
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Items
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Status
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">
                        Total
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customer.orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <button
                            onClick={() =>
                              navigate(`/admin/orders/${order.id}`)
                            }
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Order #{order.id}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {order.itemCount} item
                          {order.itemCount !== 1 ? "s" : ""}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              order.status,
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() =>
                              navigate(`/admin/orders/${order.id}`)
                            }
                            className="inline-flex items-center gap-1 px-2 py-1 text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {customer.orders.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No Orders Yet
              </h3>
              <p className="text-sm text-gray-600">
                This customer hasn't placed any orders yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
