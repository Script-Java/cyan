import {
  Plus,
  Grid3X3,
  Bookmark,
  BarChart3,
  Cloud,
  Eye,
  MessageCircle,
  Settings,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardNavigationProps {
  onLogout: () => void;
}

export default function DashboardNavigation({
  onLogout,
}: DashboardNavigationProps) {
  const navigationItems = [
    {
      id: "create",
      href: "https://www.stickershuttle.com/products",
      icon: Plus,
      title: "Start New Mission",
      description: "Create custom stickers",
      colors: "from-blue-600 to-blue-400",
      borderColor: "rgba(59, 130, 246, 0.3)",
      isLink: true,
    },
    {
      id: "dashboard",
      href: "#",
      icon: Grid3X3,
      title: "Dashboard",
      description: "Mission overview",
      colors: "from-purple-600/40 to-purple-400/10",
      borderColor: "rgba(139, 92, 246, 0.3)",
      isLink: false,
    },
  ];

  const actionItems = [
    {
      icon: Bookmark,
      title: "Orders",
      description: "0 active orders",
      color: "text-emerald-600",
      borderColor: "rgba(5, 150, 105, 0.2)",
      bgColor: "rgba(16, 185, 129, 0.05)",
    },
    {
      icon: BarChart3,
      title: "Finances",
      description: "Manage finances",
      color: "text-blue-600",
      borderColor: "rgba(59, 130, 246, 0.2)",
      bgColor: "rgba(59, 130, 246, 0.05)",
    },
    {
      icon: Cloud,
      title: "Designs",
      description: "Manage designs",
      color: "text-pink-600",
      borderColor: "rgba(236, 72, 153, 0.2)",
      bgColor: "rgba(236, 72, 153, 0.05)",
    },
  ];

  const bottomItems = [
    {
      icon: Eye,
      title: "Proofs",
      description: "Review designs",
      color: "text-orange-600",
      borderColor: "rgba(249, 115, 22, 0.2)",
      bgColor: "rgba(249, 115, 22, 0.05)",
    },
    {
      icon: MessageCircle,
      title: "Support",
      description: "Contact ground crew",
      color: "text-red-600",
      borderColor: "rgba(239, 68, 68, 0.2)",
      bgColor: "rgba(239, 68, 68, 0.05)",
    },
    {
      icon: Settings,
      title: "Settings",
      description: "Manage account",
      color: "text-gray-600",
      borderColor: "rgba(107, 114, 128, 0.2)",
      bgColor: "rgba(107, 114, 128, 0.05)",
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

  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      {/* Action Items Grid */}
      <div className="col-span-4 grid grid-cols-3 gap-3">
        {actionItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              className="p-4 rounded-2xl border transition-all duration-500 flex gap-3 items-center hover:shadow-md hover:bg-gray-50"
              style={{
                backgroundColor: item.bgColor,
                borderColor: item.borderColor,
                borderWidth: "1px",
              }}
            >
              <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                <Icon className={`w-7 h-7 ${item.color}`} />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-semibold text-gray-900">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-600">{item.description}</p>
              </div>
            </button>
          );
        })}

        {/* Bottom Row Items */}
        <div className="col-span-3 grid grid-cols-4 gap-3">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const buttonContent = (
              <button
                onClick={item.isLogout ? onLogout : undefined}
                className="w-full p-4 rounded-2xl border transition-all duration-500 flex gap-3 items-center hover:shadow-md hover:bg-gray-50"
                style={{
                  backgroundColor: item.bgColor,
                  borderColor: item.borderColor,
                  borderWidth: "1px",
                  opacity: item.isLogout ? 0.85 : 1,
                }}
              >
                <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                  <Icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>
              </button>
            );

            return <div key={item.title}>{buttonContent}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
