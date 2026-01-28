import { Package, Printer, Truck, RefreshCw } from "lucide-react";

interface ProductionBreakdownProps {
  printingCount: number;
  printedCount: number;
  shippedCount: number;
  selectedDate: string | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function ProductionBreakdown({
  printingCount,
  printedCount,
  shippedCount,
  selectedDate,
  onRefresh,
  isRefreshing = false,
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
      unit: "sticker",
      bgGradient: "from-orange-500 to-orange-600",
      borderColor: "border-orange-400",
      hoverGlow: "hover:shadow-orange-500/50",
      darkBg: "bg-orange-900/20",
    },
    {
      icon: Package,
      label: "Cutting",
      count: printedCount,
      unit: "sticker",
      bgGradient: "from-cyan-500 to-cyan-600",
      borderColor: "border-cyan-400",
      hoverGlow: "hover:shadow-cyan-500/50",
      darkBg: "bg-cyan-900/20",
    },
    {
      icon: Truck,
      label: "Shipped",
      count: shippedCount,
      unit: "order",
      bgGradient: "from-green-500 to-green-600",
      borderColor: "border-green-400",
      hoverGlow: "hover:shadow-green-500/50",
      darkBg: "bg-green-900/20",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-700 rounded-2xl p-8 shadow-2xl hover:shadow-2xl transition-shadow duration-300">
      {/* Header */}
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h2 className="text-4xl font-bold text-white tracking-tight mb-2">
            Production Status
          </h2>
          <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold">
            {selectedDate
              ? `Orders for ${dateLabel}`
              : "Orders for today"}
          </p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-3 hover:bg-slate-800 rounded-lg transition-colors duration-200 text-slate-300 hover:text-white disabled:opacity-50"
            aria-label="Refresh production status"
            title="Refresh production status"
          >
            <RefreshCw
              className={`w-6 h-6 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const totalCount = card.count;

          return (
            <div
              key={idx}
              className={`
                relative overflow-hidden rounded-xl p-8
                border-2 ${card.borderColor}
                bg-gradient-to-br ${card.bgGradient}
                transition-all duration-300 ${card.hoverGlow}
                hover:shadow-2xl hover:scale-105
                group cursor-pointer
              `}
            >
              {/* Background glow effect */}
              <div className={`absolute inset-0 ${card.darkBg} blur-xl opacity-30`} />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="mb-6 inline-block p-4 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Label */}
                <p className="text-sm uppercase font-bold tracking-widest text-white/90 mb-3">
                  {card.label}
                </p>

                {/* Big Count */}
                <div className="mb-4">
                  <p className="text-6xl font-black text-white leading-none">
                    {totalCount}
                  </p>
                </div>

                {/* Unit Label */}
                <p className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                  {totalCount === 1 ? card.unit : `${card.unit}s`}
                </p>
              </div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            </div>
          );
        })}
      </div>

      {/* Summary Line */}
      <div className="mt-10 pt-8 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-1">
              Total stickers in progress
            </p>
            <p className="text-3xl font-black text-white">
              {printingCount + printedCount}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">
              Status
            </p>
            <p className="text-lg font-bold text-green-400">Live</p>
          </div>
        </div>
      </div>
    </div>
  );
}
