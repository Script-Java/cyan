import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DayData {
  date: string;
  revenue: number;
  orders: number;
}

interface DashboardSalesCalendarProps {
  salesData: DayData[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

export default function DashboardSalesCalendar({
  salesData,
  selectedDate,
  onDateSelect,
}: DashboardSalesCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getRevenueForDay = (day: number | null) => {
    if (!day) return 0;
    const dateStr = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1,
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return salesData.find((d) => d.date === dateStr)?.revenue ?? 0;
  };

  const getOrdersForDay = (day: number | null) => {
    if (!day) return 0;
    const dateStr = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1,
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return salesData.find((d) => d.date === dateStr)?.orders ?? 0;
  };

  const getMaxRevenueInMonth = () => {
    return Math.max(
      ...salesData
        .filter((d) => {
          const [year, month] = d.date.split("-");
          return (
            parseInt(year) === currentMonth.getFullYear() &&
            parseInt(month) === currentMonth.getMonth() + 1
          );
        })
        .map((d) => d.revenue),
      0,
    );
  };

  const getColorIntensity = (revenue: number) => {
    if (revenue === 0) return "bg-gray-50";
    const maxRevenue = getMaxRevenueInMonth();
    const intensity = maxRevenue > 0 ? revenue / maxRevenue : 0;
    if (intensity < 0.25) return "bg-blue-100";
    if (intensity < 0.5) return "bg-blue-200";
    if (intensity < 0.75) return "bg-blue-400";
    return "bg-blue-600";
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const calendarDays = generateCalendarDays();

  const selectedDayRevenue = selectedDate
    ? getRevenueForDay(parseInt(selectedDate.split("-")[2]))
    : 0;
  const selectedDayOrders = selectedDate
    ? getOrdersForDay(parseInt(selectedDate.split("-")[2]))
    : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">📅 Sales by Day</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1,
                ),
              );
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-900 min-w-[160px] text-center">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button
            onClick={() => {
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1,
                ),
              );
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const revenue = getRevenueForDay(day);
              const dateStr = day
                ? `${currentMonth.getFullYear()}-${String(
                    currentMonth.getMonth() + 1,
                  ).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                : null;
              const isSelected = selectedDate === dateStr;
              const hasRevenue = revenue > 0;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (day && dateStr) {
                      onDateSelect(dateStr);
                    }
                  }}
                  disabled={!day}
                  className={`aspect-square rounded-lg p-2 text-sm font-medium transition-all ${
                    !day
                      ? "bg-transparent cursor-default"
                      : isSelected
                        ? "ring-2 ring-blue-500 ring-offset-2 bg-blue-500 text-white"
                        : hasRevenue
                          ? `${getColorIntensity(revenue)} text-gray-900 hover:shadow-md cursor-pointer`
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100 cursor-pointer"
                  }`}
                >
                  {day && (
                    <div className="flex flex-col h-full justify-between">
                      <span className="text-xs">{day}</span>
                      {hasRevenue && (
                        <span className="text-xs font-bold">
                          ${(revenue / 100).toFixed(0)}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Summary */}
        <div className="lg:col-span-1">
          {selectedDate ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 h-full flex flex-col">
              <p className="text-sm font-medium text-gray-900 mb-4">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  },
                )}
              </p>
              <div className="space-y-4 flex-1">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-1">
                    Total Sales
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${selectedDayRevenue.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-1">
                    Orders
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {selectedDayOrders}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-full flex items-center justify-center">
              <p className="text-sm text-gray-600 text-center">
                Select a day to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
