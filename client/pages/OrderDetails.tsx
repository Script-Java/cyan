import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Package,
  Truck,
  Calendar,
  DollarSign,
  ArrowRight,
  AlertCircle,
  MapPin,
  User,
  Phone,
  Mail,
  Image as ImageIcon,
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { formatOrderNumber } from "@/lib/order-number";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price_inc_tax: number;
  price_ex_tax: number;
}

interface Shipment {
  id: number;
  status: string;
  dateCreated: string;
  trackingNumber: string;
  shippingProvider: string;
  shippingMethod: string;
  comments?: string;
  itemsCount: number;
}

interface DigitalFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  uploaded_at: string;
}

interface Order {
  id: number;
  customerId: number;
  status: string;
  dateCreated: string;
  total: number;
  itemCount: number;
  shipments: Shipment[];
  subtotal?: number;
  tax?: number;
  items?: OrderItem[];
  estimated_delivery_date?: string;
  tracking_number?: string;
  tracking_carrier?: string;
  tracking_url?: string;
  shipped_date?: string;
  digital_files?: DigitalFile[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export default function OrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
    switch (status.toLowerCase()) {
      case "pending":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "processing":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "printing":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "preparing for shipping":
        return "text-indigo-600 bg-indigo-50 border-indigo-200";
      case "in transit":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "shipped":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "delivered":
        return "text-cyan-600 bg-cyan-50 border-cyan-200";
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch order details");
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load order details";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600 text-lg">
                Loading order details...
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <button
              onClick={() => navigate("/order-history")}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-6"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Order History
            </button>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-red-900 mb-1">Error</h2>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <button
              onClick={() => navigate("/order-history")}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-6"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Order History
            </button>
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900">
                Order Not Found
              </h2>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => navigate("/order-history")}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Order History
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {formatOrderNumber(order.id)}
            </h1>
            <p className="text-gray-600 mt-2">
              Placed on {formatDate(order.dateCreated)}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Status
                </h2>
                <div
                  className={`inline-block px-4 py-2 rounded-lg border ${getStatusColor(order.status)}`}
                >
                  <span className="font-medium">{order.status}</span>
                </div>
              </div>

              {/* Items */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Items
                </h2>
                <div className="space-y-4">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0"
                      >
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {item.product_name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Quantity: {item.quantity}
                          </p>
                          <p className="font-medium text-gray-900 mt-1">
                            {formatCurrency(item.price_inc_tax)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">No items in this order</p>
                  )}
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Pricing Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(order.subtotal || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(order.tax || 0)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-lg text-gray-900">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipments */}
              {order.shipments && order.shipments.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Shipments
                  </h2>
                  <div className="space-y-4">
                    {order.shipments.map((shipment) => (
                      <div
                        key={shipment.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Truck className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-gray-900">
                              {shipment.shippingProvider}
                            </span>
                          </div>
                          <span className="text-sm px-2 py-1 bg-blue-50 text-blue-700 rounded">
                            {shipment.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Method: {shipment.shippingMethod}
                        </p>
                        <p className="text-sm text-gray-600 mb-3">
                          Tracking: {shipment.trackingNumber || "N/A"}
                        </p>
                        {shipment.comments && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {shipment.comments}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Customer Information
                </h3>
                <div className="space-y-3 text-sm">
                  {order.customerName && (
                    <div className="flex items-start gap-3">
                      <User className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-600">Name</p>
                        <p className="font-medium text-gray-900">
                          {order.customerName}
                        </p>
                      </div>
                    </div>
                  )}
                  {order.customerEmail && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-medium text-gray-900 break-all">
                          {order.customerEmail}
                        </p>
                      </div>
                    </div>
                  )}
                  {order.customerPhone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">
                          {order.customerPhone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Shipping Address
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              )}

              {/* Order Date */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Order Date
                </h3>
                <p className="text-sm text-gray-600">
                  {formatDate(order.dateCreated)}
                </p>
              </div>

              {/* Estimated Delivery */}
              {order.estimated_delivery_date && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Estimated Delivery
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(order.estimated_delivery_date)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
