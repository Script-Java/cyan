import { CheckCircle, Package, Calendar, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Order {
  id: number;
  customerId: number;
  status: string;
  dateCreated: string;
  total: number;
  itemCount: number;
}

interface ActiveOrdersSummaryProps {
  activeOrders: Order[];
}

export default function ActiveOrdersSummary({
  activeOrders,
}: ActiveOrdersSummaryProps) {
  const navigate = useNavigate();

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

  return (
    <div
      className="rounded-2xl border p-6 mb-6 overflow-hidden bg-white shadow-sm"
      style={{
        borderColor: "rgba(5, 150, 105, 0.2)",
      }}
    >
      <div
        className="border-b pb-4 mb-6"
        style={{ borderColor: "rgba(5, 150, 105, 0.1)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-3 text-lg sm:text-xl font-bold text-gray-900">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Active Orders
            <span
              className="ml-2 px-2 py-1 rounded-full text-sm font-bold"
              style={{
                backgroundColor: "rgba(5, 150, 105, 0.1)",
                color: "#059669",
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
            <div
              key={order.id}
              className={`rounded-lg p-4 flex items-center justify-between ${getStatusColor(order.status)}`}
            >
              <div className="flex items-center gap-4 flex-1">
                <Package className="w-5 h-5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">
                      Order #{order.id}
                    </p>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusBadgeColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
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
                <p className="font-semibold text-sm">
                  ${order.total.toFixed(2)}
                </p>
                <button
                  onClick={() => navigate(`/order-history/${order.id}`)}
                  className="text-xs px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors whitespace-nowrap"
                >
                  View Details
                </button>
              </div>
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
