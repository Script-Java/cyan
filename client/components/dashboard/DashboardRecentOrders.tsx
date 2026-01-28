import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  dateCreated: string;
  itemCount?: number;
}

interface DashboardRecentOrdersProps {
  orders: Order[];
  isLoading: boolean;
  selectedDate: string | null;
}

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case "NEW":
    case "PENDING":
      return "bg-blue-100 text-blue-800";
    case "PRINTING":
      return "bg-orange-100 text-orange-800";
    case "CUTTING":
      return "bg-cyan-100 text-cyan-800";
    case "PRINTED":
      return "bg-cyan-100 text-cyan-800";
    case "SHIPPED":
      return "bg-green-100 text-green-800";
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function DashboardRecentOrders({
  orders,
  isLoading,
  selectedDate,
}: DashboardRecentOrdersProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          📋 Recent Orders
        </h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const dateLabel = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "today";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">📋 Recent Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 text-sm">No orders for {dateLabel}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-gray-900">
                    Order #{order.id}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                    {order.status || "NEW"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{order.customerName}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(order.dateCreated).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ${order.total.toFixed(2)}
                </p>
                <button
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1 mt-2"
                >
                  View <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
