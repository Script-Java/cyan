import {
  ShoppingBag,
  TrendingUp,
  Palette,
  CheckCircle2,
  Headphones,
  Ticket,
  CircleUserRound,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface DashboardNavigationProps {
  onLogout: () => void;
  expandedItem?: string | null;
  onItemClick?: (itemId: string) => void;
}

export default function DashboardNavigation({
  onLogout,
  expandedItem,
  onItemClick,
}: DashboardNavigationProps) {

  const actionItems = [
    {
      icon: ShoppingBag,
      title: "Orders",
      description: "View order history",
      color: "text-emerald-600",
      borderColor: "rgba(5, 150, 105, 0.2)",
      bgColor: "rgba(16, 185, 129, 0.05)",
      onClick: () => navigate("/order-history"),
    },
    {
      icon: TrendingUp,
      title: "Finances",
      description: "View spending & savings",
      color: "text-blue-600",
      borderColor: "rgba(59, 130, 246, 0.2)",
      bgColor: "rgba(59, 130, 246, 0.05)",
      onClick: () => navigate("/finances"),
    },
    {
      icon: Palette,
      title: "Designs",
      description: "Manage designs",
      color: "text-pink-600",
      borderColor: "rgba(236, 72, 153, 0.2)",
      bgColor: "rgba(236, 72, 153, 0.05)",
      onClick: () => navigate("/designs"),
    },
  ];

  const bottomItems = [
    {
      icon: CheckCircle2,
      title: "Proofs",
      description: "Review designs",
      color: "text-orange-600",
      borderColor: "rgba(249, 115, 22, 0.2)",
      bgColor: "rgba(249, 115, 22, 0.05)",
      onClick: () => navigate("/proofs"),
    },
    {
      icon: Headphones,
      title: "Support",
      description: "Contact ground crew",
      color: "text-red-600",
      borderColor: "rgba(239, 68, 68, 0.2)",
      bgColor: "rgba(239, 68, 68, 0.05)",
      onClick: () => navigate("/support"),
    },
    {
      icon: Ticket,
      title: "My Tickets",
      description: "View your support tickets",
      color: "text-purple-600",
      borderColor: "rgba(168, 85, 247, 0.2)",
      bgColor: "rgba(168, 85, 247, 0.05)",
      onClick: () => navigate("/my-tickets"),
    },
    {
      icon: CircleUserRound,
      title: "Account Settings",
      description: "Manage account",
      color: "text-gray-600",
      borderColor: "rgba(107, 114, 128, 0.2)",
      bgColor: "rgba(107, 114, 128, 0.05)",
      onClick: () => navigate("/account-settings"),
    },
    {
      icon: LogOut,
      title: "Log Out",
      description: "End session",
      color: "text-gray-700",
      borderColor: "rgba(107, 114, 128, 0.2)",
      bgColor: "rgba(107, 114, 128, 0.05)",
      isLogout: true,
    },
  ];

  const allItems = [...actionItems, ...bottomItems];

  return (
    <div className="mb-8">
      {/* All Items in One Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {allItems.map((item: any) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              onClick={item.isLogout ? onLogout : item.onClick}
              className="p-4 rounded-xl border-2 transition-all duration-300 flex flex-col gap-3 items-center text-center hover:shadow-lg hover:scale-105 bg-white shadow-md hover:shadow-xl border-gray-200 group"
              style={{
                opacity: item.isLogout ? 0.9 : 1,
              }}
            >
              <div
                className="p-3 rounded-xl flex-shrink-0 shadow-md group-hover:shadow-lg transition-all"
                style={{
                  backgroundColor: item.bgColor,
                  borderLeft: `3px solid ${item.color.split("-")[1] ? item.color : "#666"}`,
                }}
              >
                <Icon
                  className={`w-6 h-6 sm:w-7 sm:h-7 ${item.color} font-bold`}
                />
              </div>
              <div className="text-center">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-600 hidden sm:block">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
