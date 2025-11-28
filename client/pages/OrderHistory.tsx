import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  Calendar,
  DollarSign,
  ArrowRight,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

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

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price_inc_tax: number;
  price_ex_tax: number;
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
}

interface OrdersResponse {
  success: boolean;
  orders: Order[];
  count: number;
}

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch order history");
        }

        const data: OrdersResponse = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load order history";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

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
      case "completed":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "shipped":
        return "text-blue-600 bg-blue-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getShipmentStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "shipped":
      case "in_transit":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <Package className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600 text-lg">
                Loading your orders...
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
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
            <p className="text-gray-600 mt-2">
              View all your orders and track shipments
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {orders.length === 0 && !error && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No Orders Yet
              </h2>
              <p className="text-gray-600 mb-6">
                You haven't placed any orders yet. Start shopping to see your
                order history here.
              </p>
              <Button
                onClick={() => navigate("/products")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Shop Now
              </Button>
            </div>
          )}

          {/* Orders Table View */}
          {orders.length > 0 && (
            <div className="mb-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Order #
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Est. Delivery
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Tracking
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Digital Files
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() =>
                          setExpandedOrderId(
                            expandedOrderId === order.id ? null : order.id,
                          )
                        }
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">#{order.id}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(order.dateCreated)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {order.estimated_delivery_date ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-900 font-medium">
                                {formatDate(order.estimated_delivery_date)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {order.tracking_number ? (
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-green-600" />
                              <div>
                                <p className="font-mono text-gray-900 text-xs">
                                  {order.tracking_number}
                                </p>
                                {order.tracking_carrier && (
                                  <p className="text-gray-600 text-xs">
                                    {order.tracking_carrier}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {order.digital_files && order.digital_files.length > 0 ? (
                            <div className="space-y-2">
                              {order.digital_files.map((file) => (
                                <a
                                  key={file.id}
                                  href={file.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                  <Package className="w-4 h-4" />
                                  <span className="text-xs font-medium">
                                    {file.file_name}
                                  </span>
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Detailed View */}
          {orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Order Summary */}
                  <button
                    onClick={() =>
                      setExpandedOrderId(
                        expandedOrderId === order.id ? null : order.id,
                      )
                    }
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 text-left">
                      <div className="bg-gray-100 p-3 rounded-lg flex-shrink-0">
                        <Package className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.id}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.dateCreated)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {order.itemCount} item
                            {order.itemCount !== 1 ? "s" : ""}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(order.total)}
                          </div>
                          {order.estimated_delivery_date && (
                            <div className="flex items-center gap-1 text-blue-600 font-medium">
                              <Calendar className="w-4 h-4" />
                              Delivery: {formatDate(order.estimated_delivery_date)}
                            </div>
                          )}
                          {order.tracking_number && (
                            <div className="flex items-center gap-1 text-green-600 font-medium">
                              <Truck className="w-4 h-4" />
                              Tracking: {order.tracking_number}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                        expandedOrderId === order.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Order Details - Expanded */}
                  {expandedOrderId === order.id && (
                    <div className="border-t border-gray-200 px-6 py-6 bg-gray-50">
                      {/* Order Items */}
                      {order.items && order.items.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-900 mb-4">
                            Order Items
                          </h4>
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between items-center bg-white p-3 rounded border border-gray-200"
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.product_name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Quantity: {item.quantity}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(item.price_inc_tax)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Order Totals */}
                      <div className="mb-6 bg-white p-4 rounded border border-gray-200">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">
                              {formatCurrency(order.subtotal || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax:</span>
                            <span className="font-medium">
                              {formatCurrency(order.tax || 0)}
                            </span>
                          </div>
                          <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                            <span>Total:</span>
                            <span className="text-lg">
                              {formatCurrency(order.total)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Shipments and Tracking */}
                      {order.shipments && order.shipments.length > 0 ? (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-4">
                            Shipments & Tracking
                          </h4>
                          <div className="space-y-4">
                            {order.shipments.map((shipment) => (
                              <div
                                key={shipment.id}
                                className="bg-white p-4 rounded border border-gray-200"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    {getShipmentStatusIcon(shipment.status)}
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">
                                        {shipment.shippingProvider ||
                                          "Shipment"}{" "}
                                        -{" "}
                                        {shipment.shippingMethod || "Standard"}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        {formatDate(shipment.dateCreated)}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                    {shipment.status
                                      .replace(/_/g, " ")
                                      .charAt(0)
                                      .toUpperCase() +
                                      shipment.status
                                        .replace(/_/g, " ")
                                        .slice(1)}
                                  </span>
                                </div>

                                {shipment.trackingNumber && (
                                  <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-100">
                                    <p className="text-xs text-gray-600 mb-1">
                                      Tracking Number:
                                    </p>
                                    <p className="font-mono font-semibold text-blue-900">
                                      {shipment.trackingNumber}
                                    </p>
                                  </div>
                                )}

                                {shipment.comments && (
                                  <div className="p-3 bg-gray-100 rounded text-sm text-gray-700">
                                    {shipment.comments}
                                  </div>
                                )}

                                <p className="text-xs text-gray-600 mt-2">
                                  Items in shipment: {shipment.itemsCount}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded p-4">
                          <p className="text-sm text-blue-900">
                            📦 Your order has not been shipped yet. We'll send
                            you a tracking number as soon as it's on its way!
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Total Summary */}
          {orders.length > 0 && (
            <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      orders.reduce((sum, order) => sum + order.total, 0),
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.reduce((sum, order) => sum + order.itemCount, 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
