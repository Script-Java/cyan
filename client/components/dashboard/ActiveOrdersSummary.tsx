import { CheckCircle } from "lucide-react";

interface ActiveOrdersSummaryProps {
  activeOrderCount: number;
}

export default function ActiveOrdersSummary({ activeOrderCount }: ActiveOrdersSummaryProps) {
  return (
    <div
      className="rounded-2xl border p-6 mb-6 overflow-hidden backdrop-blur-lg"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderColor: "rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="border-b border-white/10 pb-4 mb-6" style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-3 text-lg sm:text-xl font-bold text-white">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Active Orders
            <span
              className="ml-2 px-2 py-1 rounded-full text-sm font-bold"
              style={{
                backgroundColor: "rgba(112, 181, 81, 0.2)",
                color: "#a8f26a",
              }}
            >
              {activeOrderCount}
            </span>
          </h2>
        </div>
      </div>

      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-white">There are no active orders</h3>
      </div>
    </div>
  );
}
