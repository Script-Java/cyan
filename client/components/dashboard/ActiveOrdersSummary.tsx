import { CheckCircle } from "lucide-react";

interface ActiveOrdersSummaryProps {
  activeOrderCount: number;
}

export default function ActiveOrdersSummary({
  activeOrderCount,
}: ActiveOrdersSummaryProps) {
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
              {activeOrderCount}
            </span>
          </h2>
        </div>
      </div>

      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-gray-600">
          There are no active orders
        </h3>
      </div>
    </div>
  );
}
