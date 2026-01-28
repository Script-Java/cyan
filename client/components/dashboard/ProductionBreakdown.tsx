import { Package, Printer, Truck } from "lucide-react";

interface ProductionBreakdownProps {
  printingCount: number;
  printedCount: number;
  shippedCount: number;
  selectedDate: string | null;
}

export default function ProductionBreakdown({
  printingCount,
  printedCount,
  shippedCount,
  selectedDate,
}: ProductionBreakdownProps) {
  const dateLabel = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Today";

  const cards = [
    {
      icon: Printer,
      label: "Printing Now",
      count: printingCount,
      borderColor: "border-orange-200",
      bgHover: "hover:bg-orange-50",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      labelColor: "text-orange-700",
      countColor: "text-orange-600",
    },
    {
      icon: Package,
      label: "Printed",
      count: printedCount,
      borderColor: "border-cyan-200",
      bgHover: "hover:bg-cyan-50",
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
      labelColor: "text-cyan-700",
      countColor: "text-cyan-600",
    },
    {
      icon: Truck,
      label: "Shipped",
      count: shippedCount,
      borderColor: "border-green-200",
      bgHover: "hover:bg-green-50",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      labelColor: "text-green-700",
      countColor: "text-green-600",
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Production Status
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          {selectedDate
            ? `Orders for ${dateLabel}`
            : "Orders for today"}
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const totalCount = card.count;

          return (
            <div
              key={idx}
              className={`
                border ${card.borderColor} bg-white rounded-xl p-6
                transition-all duration-200 ${card.bgHover}
                flex flex-col items-start justify-between
                hover:border-opacity-60
              `}
            >
              {/* Icon + Label */}
              <div className="flex items-start gap-4 w-full mb-4">
                <div className={`${card.iconBg} rounded-lg p-3 flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-xs uppercase font-semibold tracking-wider ${card.labelColor} mb-1`}>
                    {card.label}
                  </p>
                </div>
              </div>

              {/* Count Display */}
              <div className="w-full">
                <p className={`text-4xl font-semibold ${card.countColor}`}>
                  {totalCount}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {totalCount === 1 ? "order" : "orders"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Line */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Total orders: <span className="font-semibold text-gray-900">{printingCount + printedCount + shippedCount}</span>
          </span>
          <span className="text-gray-500">
            Last updated: <span className="font-medium text-gray-700">Just now</span>
          </span>
        </div>
      </div>
    </div>
  );
}
