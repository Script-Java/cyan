import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  BarChart3,
  Cloud,
  Eye,
  MessageCircle,
  Settings,
  LogOut,
  Inbox,
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
      icon: Bookmark,
      title: "Orders",
      description: "View order history",
      color: "text-emerald-600",
      borderColor: "rgba(5, 150, 105, 0.2)",
      bgColor: "rgba(16, 185, 129, 0.05)",
      onClick: () => navigate("/order-history"),
    },
    {
      icon: BarChart3,
      title: "Finances",
      description: "View spending & savings",
      color: "text-blue-600",
      borderColor: "rgba(59, 130, 246, 0.2)",
      bgColor: "rgba(59, 130, 246, 0.05)",
      onClick: () => navigate("/finances"),
    },
    {
      icon: Cloud,
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
      onClick: () => navigate("/support"),
    },
    {
      icon: Inbox,
      title: "My Tickets",
      description: "View your support tickets",
      color: "text-purple-600",
      borderColor: "rgba(168, 85, 247, 0.2)",
      bgColor: "rgba(168, 85, 247, 0.05)",
      onClick: () => navigate("/my-tickets"),
    },
    {
      icon: Settings,
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

  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      {/* Action Items Grid */}
      <div className="col-span-4 grid grid-cols-3 gap-3">
        {actionItems.map((item: any) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              onClick={item.onClick}
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
          {bottomItems.map((item: any) => {
            const Icon = item.icon;
            const buttonContent = (
              <button
                onClick={item.isLogout ? onLogout : item.onClick}
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
