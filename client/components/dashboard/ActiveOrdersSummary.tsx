import { useState } from "react";
import { CheckCircle, Package, Calendar, ChevronDown, ChevronUp, Truck, MapPin } from "lucide-react";

interface Order {
  id: number;
  customerId: number;
  status: string;
  dateCreated: string;
  total: number;
  itemCount: number;
  tracking_number?: string;
  tracking_carrier?: string;
  tracking_url?: string;
  shipped_date?: string;
  estimated_delivery_date?: string;
}

interface ActiveOrdersSummaryProps {
  activeOrders: Order[];
}

export default function ActiveOrdersSummary({
  activeOrders,
}: ActiveOrdersSummaryProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-500/10 text-orange-700 border border-orange-200";
      case "processing":
        return "bg-yellow-500/10 text-yellow-700 border border-yellow-200";
      case "printing":
        return "bg-purple-500/10 text-purple-700 border border-purple-200";
      case "in transit":
        return "bg-blue-500/10 text-blue-700 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "printing":
        return "bg-purple-100 text-purple-800";
      case "in transit":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toggleExpanded = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="rounded-2xl border p-6 mb-6 overflow-hidden backdrop-blur-xl bg-white/5 border-white/10">
      <div
        className="border-b pb-4 mb-6"
        style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-3 text-lg sm:text-xl font-bold text-white">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Active Orders
            <span
              className="ml-2 px-2 py-1 rounded-full text-sm font-bold"
              style={{
                backgroundColor: "rgba(5, 150, 105, 0.2)",
                color: "#86efac",
              }}
            >
              {activeOrders.length}
            </span>
          </h2>
        </div>
      </div>

      {activeOrders.length > 0 ? (
        <div className="space-y-3">
          {activeOrders.map((order) => (
            <div key={order.id} className="border border-white/10 rounded-lg overflow-hidden bg-white/5">
              <div
                className={`p-4 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors backdrop-blur-sm`}
                onClick={() => toggleExpanded(order.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <Package className="w-5 h-5 flex-shrink-0 text-white/70" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-white">
                        Order #{order.id}
                      </p>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusBadgeColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/60 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.dateCreated).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <p className="font-semibold text-sm text-white">
                    ${order.total.toFixed(2)}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(order.id);
                    }}
                    className="text-xs px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 transition-colors whitespace-nowrap flex items-center gap-1"
                  >
                    {expandedOrderId === order.id ? "Hide" : "Show"} Details
                    {expandedOrderId === order.id ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Details Section */}
              {expandedOrderId === order.id && (
                <div className="bg-black/40 border-t border-white/10 p-4 space-y-4 backdrop-blur-sm">
                  {/* Tracking Information */}
                  {(order.tracking_number || order.shipped_date) && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10 backdrop-blur-sm">
                      <h3 className="font-semibold text-sm text-white mb-3 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-400" />
                        Shipping & Tracking
                      </h3>
                      <div className="space-y-2 text-sm">
                        {order.shipped_date && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Shipped Date:</span>
                            <span className="font-medium text-white">
                              {new Date(order.shipped_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {order.tracking_number && (
                          <div className="flex justify-between items-start">
                            <span className="text-white/60">Tracking Number:</span>
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-mono font-medium text-white">
                                {order.tracking_number}
                              </span>
                              {order.tracking_carrier && (
                                <span className="text-xs text-white/40">
                                  {order.tracking_carrier}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {order.tracking_url && (
                          <div className="pt-2">
                            <a
                              href={order.tracking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 border border-blue-500/30 transition-colors font-medium"
                            >
                              <MapPin className="w-3 h-3" />
                              Track Package
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Estimated Delivery */}
                  {order.estimated_delivery_date && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10 backdrop-blur-sm">
                      <h3 className="font-semibold text-sm text-white mb-2">
                        Estimated Delivery
                      </h3>
                      <p className="text-sm text-white/70">
                        {new Date(order.estimated_delivery_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10 backdrop-blur-sm">
                    <h3 className="font-semibold text-sm text-white mb-3">
                      Order Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Items:</span>
                        <span className="font-medium text-white">
                          {order.itemCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Order Date:</span>
                        <span className="font-medium text-white">
                          {new Date(order.dateCreated).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-white/10 flex justify-between">
                        <span className="font-semibold text-white">Total:</span>
                        <span className="font-semibold text-emerald-400">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-600">
            There are no active orders
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            No orders with pending, processing, printing, or in transit statuses
          </p>
        </div>
      )}
    </div>
  );
}
