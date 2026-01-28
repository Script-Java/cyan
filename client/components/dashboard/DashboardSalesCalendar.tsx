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
  const today = new Date().toISOString().split("T")[0];

  const selectedDayRevenue = selectedDate
    ? getRevenueForDay(parseInt(selectedDate.split("-")[2]))
    : 0;
  const selectedDayOrders = selectedDate
    ? getOrdersForDay(parseInt(selectedDate.split("-")[2]))
    : 0;

  const isToday = (dateStr: string | null) => dateStr === today;

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
            {monthNames[currentMonth.getMonth()]}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {currentMonth.getFullYear()}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1,
                ),
              );
            }}
            className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-600 hover:text-gray-900"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1,
                ),
              );
            }}
            className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-600 hover:text-gray-900"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
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
              const isDayToday = isToday(dateStr);
              const hasRevenue = revenue > 0;

              if (!day) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="aspect-square rounded-lg"
                  />
                );
              }

              return (
                <button
                  key={day}
                  onClick={() => {
                    if (dateStr) {
                      onDateSelect(dateStr);
                    }
                  }}
                  className={`
                    aspect-square rounded-lg p-3 flex flex-col items-start justify-between
                    text-left transition-all duration-200 group
                    ${
                      isSelected
                        ? "bg-blue-50 border-2 border-blue-500 shadow-sm"
                        : isDayToday
                          ? "border-2 border-blue-300 bg-white hover:bg-blue-50"
                          : "bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    }
                  `}
                >
                  <div className="flex flex-col w-full">
                    <span
                      className={`text-sm font-medium ${
                        isSelected
                          ? "text-blue-600"
                          : isDayToday
                            ? "text-blue-600"
                            : "text-gray-900"
                      }`}
                    >
                      {day}
                    </span>
                    {isDayToday && (
                      <span className="text-xs font-semibold text-blue-600 mt-0.5">
                        Today
                      </span>
                    )}
                  </div>

                  {hasRevenue && (
                    <span
                      className={`text-xs font-semibold whitespace-nowrap ${
                        isSelected
                          ? "text-blue-600"
                          : "text-gray-600 group-hover:text-gray-900"
                      }`}
                    >
                      ${(revenue / 100).toFixed(0)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-4">
              Legend
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded border-2 border-blue-300 bg-white" />
                <span>Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-blue-50 border-2 border-blue-500" />
                <span>Selected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Day Summary Panel */}
        <div className="lg:col-span-1">
          {selectedDate ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 h-full flex flex-col justify-between shadow-sm">
              {/* Date */}
              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">
                  Selected Date
                </p>
                <p className="text-lg font-medium text-gray-900">
                  {getDateLabel(selectedDate)}
                </p>
              </div>

              {/* Metrics */}
              <div className="space-y-6 flex-1">
                {/* Sales */}
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">
                    Total Sales
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-semibold text-blue-600">
                      ${selectedDayRevenue.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Orders */}
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">
                    Orders
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-gray-900">
                      {selectedDayOrders}
                    </span>
                    <span className="text-sm text-gray-500">
                      {selectedDayOrders === 1 ? "order" : "orders"}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 text-sm shadow-sm hover:shadow-md">
                View Orders for This Day
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Select a day on the calendar to see details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
