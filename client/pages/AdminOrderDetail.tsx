import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import DesignThumbnail from "@/components/DesignThumbnail";
import OrderStatusEditor from "@/components/OrderStatusEditor";
import ShippingAddressEditor from "@/components/ShippingAddressEditor";
import OptionCostEditor from "@/components/OptionCostEditor";
import ProductionStatusEditor from "@/components/ProductionStatusEditor";
import {
  Package,
  ChevronLeft,
  Edit,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

interface OrderItem {
  id?: number;
  quantity?: number;
  product_name?: string;
  options?: Record<string, any> | Array<any>;
  design_file_url?: string;
}

interface ProofStatus {
  id: string;
  status: "pending" | "approved" | "revisions_requested";
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ShippingAddress {
  first_name: string;
  last_name: string;
  street_1: string;
  street_2?: string;
  city: string;
  state_or_province: string;
  postal_code: string;
  country_iso2: string;
  phone?: string;
}

interface OrderDetail {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  status: string;
  total: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  dateCreated: string;
  dateUpdated: string;
  source: "supabase";
  shippingAddress?: ShippingAddress;
  trackingNumber?: string;
  trackingCarrier?: string;
  trackingUrl?: string;
  shippedDate?: string;
  orderItems?: OrderItem[];
  proofs?: ProofStatus[];
}

const generateOrderNumber = (orderId: number): string => {
  const orderNumber = 4001 + orderId;
  return `SY-5${orderNumber}`;
};

export default function AdminOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [editingShippingAddressOrderId, setEditingShippingAddressOrderId] =
    useState<number | null>(null);
  const [editingOptionItemId, setEditingOptionItemId] = useState<{
    orderId: number;
    itemId: number;
    productName: string;
    options: any[];
  } | null>(null);
  const [editingProductionStatusOrderId, setEditingProductionStatusOrderId] =
    useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }
    setIsAuthenticated(true);
    fetchOrderDetail();
  }, [orderId, navigate]);

  const fetchOrderDetail = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token || !orderId) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error(`Failed to fetch order: ${response.status}`, errorData);
          setErrorMessage(
            errorData.error || `Failed to fetch order (${response.status})`,
          );
        } catch {
          console.error(`Failed to fetch order: ${response.status}`);
          setErrorMessage(`Failed to fetch order: ${response.statusText}`);
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setErrorMessage(null);
      } else {
        setErrorMessage("Invalid response from server");
        console.error("Unexpected response format:", data);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Error fetching order detail:", errorMsg);
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "text-amber-300 bg-amber-500/20 border border-amber-500/30";
      case "paid":
        return "text-emerald-300 bg-emerald-500/20 border border-emerald-500/30";
      case "pending":
        return "text-orange-300 bg-orange-500/20 border border-orange-500/30";
      case "processing":
        return "text-yellow-300 bg-yellow-500/20 border border-yellow-500/30";
      case "printing":
        return "text-purple-300 bg-purple-500/20 border border-purple-500/30";
      case "preparing for shipping":
        return "text-indigo-300 bg-indigo-500/20 border border-indigo-500/30";
      case "in transit":
        return "text-blue-300 bg-blue-500/20 border border-blue-500/30";
      case "shipped":
        return "text-green-300 bg-green-500/20 border border-green-500/30";
      case "delivered":
        return "text-cyan-300 bg-cyan-500/20 border border-cyan-500/30";
      case "cancelled":
        return "text-red-300 bg-red-500/20 border border-red-500/30";
      default:
        return "text-gray-600 bg-gray-100 border border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    if (status === "pending_payment") {
      return "text-orange-600 bg-orange-50 border border-orange-200";
    } else if (status === "paid") {
      return "text-green-600 bg-green-50 border border-green-200";
    }
    return "";
  };

  const getPaymentStatusLabel = (status: string) => {
    if (status === "pending_payment") {
      return "Awaiting Payment";
    } else if (status === "paid") {
      return "Payment Confirmed";
    }
    return null;
  };

  const getStatusDisplayLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending_payment: "Pending Payment",
      paid: "Awaiting Fulfillment",
      pending: "Pending",
      processing: "Processing",
      printing: "Printing",
      "preparing for shipping": "Preparing for Shipping",
      "in transit": "In Transit",
      shipped: "Shipped",
      delivered: "Delivered",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return (
      statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatOptionValue = (value: any): string => {
    if (value === null || value === undefined) {
      return "N/A";
    }
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "number") {
      return String(value);
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return "Complex Object";
      }
    }
    return String(value);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="text-gray-600">Loading order details...</div>
        </div>
      </AdminLayout>
    );
  }

  if (errorMessage || !order) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate("/admin/orders")}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Orders
          </button>
          <div className="bg-white border border-gray-200 rounded-lg p-8 sm:p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Unable to Load Order
            </h3>
            <p className="text-sm text-gray-600">
              {errorMessage || "The requested order could not be found."}
            </p>
            {errorMessage && (
              <button
                onClick={() => {
                  setErrorMessage(null);
                  fetchOrderDetail();
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            )}
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
          onClick={() => navigate("/admin/orders")}
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Orders
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {generateOrderNumber(order.id)}
            </h1>
            <span
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                order.status,
              )}`}
            >
              {getStatusDisplayLabel(order.status)}
            </span>
            {getPaymentStatusLabel(order.status) && (
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${getPaymentStatusColor(
                  order.status,
                )}`}
              >
                {getPaymentStatusLabel(order.status)}
              </span>
            )}
          </div>
          <p className="text-gray-600">
            {formatDate(order.dateCreated)} • {order.customerName} •{" "}
            <span className="text-gray-500">{order.customerEmail}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setEditingProductionStatusOrderId(order.id)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 border border-purple-300 rounded-lg text-purple-700 hover:text-purple-800 transition-colors text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            Update Production Status
          </button>
          <button
            onClick={() => setEditingOrderId(order.id)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 border border-green-300 rounded-lg text-green-700 hover:text-green-800 transition-colors text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit Status & Tracking
          </button>
          <button
            onClick={() => setEditingShippingAddressOrderId(order.id)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg text-blue-700 hover:text-blue-800 transition-colors text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit Shipping Address
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Price Breakdown */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Price Breakdown
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded border border-gray-200 p-4">
                <p className="text-xs text-gray-600 font-medium">Subtotal</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  ${(order.subtotal || order.total * 0.8).toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 rounded border border-gray-200 p-4">
                <p className="text-xs text-gray-600 font-medium">Tax</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  ${(order.tax || order.total * 0.1).toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 rounded border border-gray-200 p-4">
                <p className="text-xs text-gray-600 font-medium">Shipping</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  ${(order.shipping || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-xs text-gray-600 font-medium">Total</p>
                <p className="text-lg font-semibold text-green-700 mt-1">
                  ${order.total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tracking Information
            </h2>
            <div className="space-y-4">
              {order.trackingNumber && (
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Tracking Number
                  </p>
                  <p className="text-base font-mono text-gray-900 mt-1">
                    {order.trackingNumber}
                  </p>
                </div>
              )}
              {order.trackingCarrier && (
                <div>
                  <p className="text-sm text-gray-600 font-medium">Carrier</p>
                  <p className="text-base text-gray-900 mt-1">
                    {order.trackingCarrier}
                  </p>
                </div>
              )}
              {order.trackingUrl && (
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    Track Package
                  </p>
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors break-all"
                  >
                    {order.trackingUrl}
                  </a>
                </div>
              )}
              {order.shippedDate && (
                <div>
                  <p className="text-sm text-gray-600 font-medium">Shipped</p>
                  <p className="text-base text-gray-900 mt-1">
                    {formatDate(order.shippedDate)}
                  </p>
                </div>
              )}
              {!order.trackingNumber && !order.trackingCarrier && (
                <p className="text-sm text-gray-600 italic">
                  No tracking information yet. Click "Edit Status & Tracking" to
                  add it.
                </p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Shipping Address
            </h2>
            {order.shippingAddress ? (
              <div className="text-sm space-y-1">
                <p className="text-gray-900 font-medium">
                  {order.shippingAddress.first_name}{" "}
                  {order.shippingAddress.last_name}
                </p>
                <p className="text-gray-600">
                  {order.shippingAddress.street_1}
                </p>
                {order.shippingAddress.street_2 && (
                  <p className="text-gray-600">
                    {order.shippingAddress.street_2}
                  </p>
                )}
                <p className="text-gray-600">
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state_or_province}{" "}
                  {order.shippingAddress.postal_code}
                </p>
                <p className="text-gray-600">
                  {order.shippingAddress.country_iso2}
                </p>
                {order.shippingAddress.phone && (
                  <p className="text-gray-600 mt-2">
                    {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                No shipping address yet. Click "Edit Shipping Address" to add
                one.
              </p>
            )}
          </div>

          {/* Order Items */}
          {order.orderItems && order.orderItems.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Items ({order.orderItems.length})
              </h2>
              <div className="space-y-4">
                {order.orderItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 rounded border border-gray-200 p-4"
                  >
                    <div className="flex gap-4 items-start">
                      {/* Design Thumbnail */}
                      {item.design_file_url && (
                        <div className="flex-shrink-0">
                          <DesignThumbnail
                            designFileUrl={item.design_file_url}
                            itemId={item.id}
                            size="medium"
                          />
                        </div>
                      )}

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 font-semibold mb-3">
                          {item.product_name || "Product"}
                        </h3>

                        {/* Quantity */}
                        <div className="mb-3">
                          <p className="text-xs text-gray-600 font-medium">
                            QUANTITY
                          </p>
                          <p className="text-sm text-gray-900 font-medium mt-1">
                            {item.quantity || 1}{" "}
                            {item.quantity === 1 ? "unit" : "units"}
                          </p>
                        </div>

                        {/* Product Options */}
                        {item.options && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs text-gray-600 font-medium">
                                SPECIFICATIONS
                              </p>
                              <button
                                onClick={() => {
                                  setEditingOptionItemId({
                                    orderId: order.id,
                                    itemId: item.id ?? idx,
                                    productName: item.product_name || "Product",
                                    options: Array.isArray(item.options)
                                      ? item.options
                                      : Object.entries(item.options).map(
                                          ([key, val]) => ({
                                            option_id: key,
                                            option_value:
                                              formatOptionValue(val),
                                            price:
                                              typeof val === "object"
                                                ? val.price || 0
                                                : 0,
                                          }),
                                        ),
                                  });
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 hover:bg-green-200 text-green-700 border border-green-300 rounded transition-colors"
                              >
                                <Edit className="w-3 h-3" />
                                Edit Costs
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(item.options)
                                ? item.options.length > 0
                                  ? item.options.map(
                                      (option: any, idx: number) => {
                                        const optionName =
                                          option.option_id || "";
                                        const optionValue =
                                          option.option_value || "";
                                        const optionPrice =
                                          option.price ||
                                          option.modifier_price ||
                                          0;

                                        if (!optionName || !optionValue) {
                                          return null;
                                        }

                                        return (
                                          <span
                                            key={idx}
                                            className="inline-block bg-blue-50 text-blue-900 px-3 py-1 rounded-full text-xs font-medium border border-blue-200"
                                          >
                                            {optionName}: {optionValue}
                                            {optionPrice > 0 && (
                                              <span className="ml-1 font-semibold">
                                                (+$
                                                {optionPrice.toFixed(2)})
                                              </span>
                                            )}
                                          </span>
                                        );
                                      },
                                    )
                                  : null
                                : Object.entries(item.options).map(
                                    ([key, val]) => {
                                      const displayValue =
                                        formatOptionValue(val);
                                      const isNumericKey = /^\d+$/.test(key);
                                      const label = isNumericKey
                                        ? displayValue
                                        : `${key}: ${displayValue}`;
                                      const optionPrice =
                                        typeof val === "object"
                                          ? val.price || 0
                                          : 0;

                                      return (
                                        <span
                                          key={key}
                                          className="inline-block bg-blue-50 text-blue-900 px-3 py-1 rounded-full text-xs font-medium border border-blue-200"
                                        >
                                          {label}
                                          {optionPrice > 0 && (
                                            <span className="ml-1 font-semibold">
                                              (+$
                                              {optionPrice.toFixed(2)})
                                            </span>
                                          )}
                                        </span>
                                      );
                                    },
                                  )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Customer
            </h2>
            <p className="text-sm text-gray-900">{order.customerName}</p>
            <p className="text-sm text-gray-600">{order.customerEmail}</p>
          </div>

          {/* Artwork Proofs Status */}
          {order.proofs && order.proofs.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                Artwork Proofs
              </h2>
              <div className="space-y-3">
                {order.proofs.map((proof, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded border border-blue-100 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {proof.status === "approved" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            ✓ Approved
                          </span>
                        )}
                        {proof.status === "revisions_requested" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                            ⟳ Revisions Requested
                          </span>
                        )}
                        {proof.status === "pending" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                            ⏳ Pending Review
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(
                          proof.updatedAt || proof.createdAt,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {proof.description && (
                      <p className="text-sm text-gray-700 mt-2">
                        {proof.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Status Editor Modal */}
      {editingOrderId !== null && (
        <OrderStatusEditor
          orderId={editingOrderId}
          currentStatus={order?.status || ""}
          currentTrackingNumber={order?.trackingNumber}
          currentTrackingCarrier={order?.trackingCarrier}
          currentTrackingUrl={order?.trackingUrl}
          onClose={() => setEditingOrderId(null)}
          onSuccess={() => {
            setEditingOrderId(null);
            fetchOrderDetail();
          }}
        />
      )}

      {/* Shipping Address Editor Modal */}
      {editingShippingAddressOrderId !== null && (
        <ShippingAddressEditor
          orderId={editingShippingAddressOrderId}
          currentAddress={order?.shippingAddress}
          onClose={() => setEditingShippingAddressOrderId(null)}
          onSuccess={() => {
            setEditingShippingAddressOrderId(null);
            fetchOrderDetail();
          }}
        />
      )}

      {/* Option Cost Editor Modal */}
      {editingOptionItemId !== null && (
        <OptionCostEditor
          orderId={editingOptionItemId.orderId}
          itemId={editingOptionItemId.itemId}
          productName={editingOptionItemId.productName}
          options={editingOptionItemId.options}
          onClose={() => setEditingOptionItemId(null)}
          onSuccess={() => {
            setEditingOptionItemId(null);
            fetchOrderDetail();
          }}
        />
      )}
    </AdminLayout>
  );
}
