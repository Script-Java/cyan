import { ShoppingBag, Calendar, DollarSign, Package } from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: number;
  customerId: number;
  status: string;
  dateCreated: string;
  total: number;
  itemCount: number;
}

interface OrdersSectionProps {
  orders: Order[];
}

const statusColorMap: Record<string, { bg: string; text: string; border: string }> = {
  completed: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
  processing: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
  shipped: { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-300" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
};

function getStatusColor(status: string) {
  return statusColorMap[status.toLowerCase()] || statusColorMap.pending;
}

export default function OrdersSection({ orders }: OrdersSectionProps) {
  return (
    <div className="lg:col-span-2">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-md transition-shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
          </div>
          Recent Orders
        </h2>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No orders yet</p>
            <p className="text-gray-500 text-sm">
              Start shopping to see your orders here!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusColor = getStatusColor(order.status);
              const orderDate = new Date(order.dateCreated);
              const formattedDate = format(orderDate, "MMM dd, yyyy");

              return (
                <div
                  key={order.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <ShoppingBag className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-gray-900 font-semibold">Order #{order.id}</p>
                          <p className="text-gray-600 text-sm flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formattedDate}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Middle Section */}
                    <div className="flex items-center gap-6">
                      {/* Items Count */}
                      <div className="text-center">
                        <p className="text-gray-600 text-xs font-medium mb-1">
                          Items
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {order.itemCount}
                        </p>
                      </div>

                      {/* Total */}
                      <div className="text-center">
                        <p className="text-gray-600 text-xs font-medium mb-1">
                          Total
                        </p>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-amber-600" />
                          <p className="text-lg font-bold text-gray-900">
                            {order.total.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="text-center">
                        <p className="text-gray-600 text-xs font-medium mb-1">
                          Status
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
