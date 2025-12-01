import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  TrendingUp,
  Palette,
  CheckCircle2,
  Headphones,
  Ticket,
  CircleUserRound,
  LogOut,
} from "lucide-react";

interface DashboardNavigationProps {
  onLogout: () => void;
}

export default function DashboardNavigation({
  onLogout,
}: DashboardNavigationProps) {
  const navigate = useNavigate();

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
              className="p-3 rounded-2xl border transition-all duration-500 flex flex-col gap-2 items-center text-center hover:bg-white/10 backdrop-blur-xl bg-white/5 border-white/10"
              style={{
                opacity: item.isLogout ? 0.85 : 1,
              }}
            >
              <div className="p-2 bg-white/10 rounded-lg flex-shrink-0 backdrop-blur-sm">
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
              </div>
              <div className="text-center">
                <h4 className="text-xs sm:text-sm font-semibold text-white leading-tight">
                  {item.title}
                </h4>
                <p className="text-xs text-white/60 hidden sm:block">
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
