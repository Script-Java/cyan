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
  completed: { bg: "bg-green-500/10", text: "text-green-300", border: "border-green-500/30" },
  pending: { bg: "bg-yellow-500/10", text: "text-yellow-300", border: "border-yellow-500/30" },
  processing: { bg: "bg-blue-500/10", text: "text-blue-300", border: "border-blue-500/30" },
  shipped: { bg: "bg-cyan-500/10", text: "text-cyan-300", border: "border-cyan-500/30" },
  cancelled: { bg: "bg-red-500/10", text: "text-red-300", border: "border-red-500/30" },
};

function getStatusColor(status: string) {
  return statusColorMap[status.toLowerCase()] || statusColorMap.pending;
}

export default function OrdersSection({ orders }: OrdersSectionProps) {
  return (
    <div className="lg:col-span-2">
      <div className="bg-white/5 border border-blue-300/20 rounded-2xl p-8 hover:border-blue-300/40 transition-colors">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <ShoppingBag className="w-6 h-6 text-blue-300" />
          </div>
          Recent Orders
        </h2>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-blue-300/30 mx-auto mb-4" />
            <p className="text-blue-200/70 mb-2">No orders yet</p>
            <p className="text-blue-200/50 text-sm">
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
                  className="bg-white/5 border border-blue-300/10 rounded-xl p-6 hover:border-blue-300/30 transition-all hover:bg-white/10 cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <ShoppingBag className="w-5 h-5 text-blue-300" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">Order #{order.id}</p>
                          <p className="text-blue-200/60 text-sm flex items-center gap-1">
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
                        <p className="text-blue-200/60 text-xs font-medium mb-1">
                          Items
                        </p>
                        <p className="text-lg font-bold text-white">
                          {order.itemCount}
                        </p>
                      </div>

                      {/* Total */}
                      <div className="text-center">
                        <p className="text-blue-200/60 text-xs font-medium mb-1">
                          Total
                        </p>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-yellow-300" />
                          <p className="text-lg font-bold text-white">
                            {order.total.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="text-center">
                        <p className="text-blue-200/60 text-xs font-medium mb-1">
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
                    <div className="text-blue-300/30 group-hover:text-blue-300 transition-colors">
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
