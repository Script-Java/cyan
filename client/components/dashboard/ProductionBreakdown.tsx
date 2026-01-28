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
      })
    : "Today";

  const cards = [
    {
      icon: Printer,
      label: "Printing Now",
      count: printingCount,
      color: "from-orange-50 to-amber-50",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      textColor: "text-orange-600",
    },
    {
      icon: Package,
      label: "Printed",
      count: printedCount,
      color: "from-blue-50 to-cyan-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      textColor: "text-blue-600",
    },
    {
      icon: Truck,
      label: "Shipped",
      count: shippedCount,
      color: "from-green-50 to-emerald-50",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      textColor: "text-green-600",
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">📦 Production Status</h2>
        <p className="text-sm text-gray-600 mt-1">
          {selectedDate ? `Orders for ${dateLabel}` : "All orders today"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-gradient-to-br ${card.color} border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.label}
                  </p>
                  <p className={`text-4xl font-bold ${card.textColor}`}>
                    {card.count}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    {card.count === 1 ? "order" : "orders"}
                  </p>
                </div>
                <div className={`${card.iconBg} rounded-lg p-3`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
