import { Plus, Grid3X3, Bookmark, BarChart3, Cloud, Eye, MessageCircle, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardNavigationProps {
  onLogout: () => void;
}

export default function DashboardNavigation({ onLogout }: DashboardNavigationProps) {
  const navigationItems = [
    {
      id: "create",
      href: "https://www.stickershuttle.com/products",
      icon: Plus,
      title: "Start New Mission",
      description: "Create custom stickers",
      colors: "from-blue-600 to-blue-400",
      borderColor: "rgba(59, 130, 246, 0.4)",
      isLink: true,
    },
    {
      id: "dashboard",
      href: "#",
      icon: Grid3X3,
      title: "Dashboard",
      description: "Mission overview",
      colors: "from-purple-600/40 to-purple-400/10",
      borderColor: "rgba(139, 92, 246, 0.4)",
      isLink: false,
    },
  ];

  const actionItems = [
    {
      icon: Bookmark,
      title: "Orders",
      description: "0 active orders",
      color: "text-emerald-400",
      borderColor: "rgba(255, 255, 255, 0.1)",
      bgColor: "rgba(255, 255, 255, 0.05)",
    },
    {
      icon: BarChart3,
      title: "Finances",
      description: "Manage finances",
      color: "text-blue-400",
      borderColor: "rgba(255, 255, 255, 0.1)",
      bgColor: "rgba(255, 255, 255, 0.05)",
    },
    {
      icon: Cloud,
      title: "Designs",
      description: "Manage designs",
      color: "text-pink-400",
      borderColor: "rgba(255, 255, 255, 0.1)",
      bgColor: "rgba(255, 255, 255, 0.05)",
    },
  ];

  const bottomItems = [
    {
      icon: Eye,
      title: "Proofs",
      description: "Review designs",
      color: "text-orange-400",
      borderColor: "rgba(255, 255, 255, 0.1)",
      bgColor: "rgba(255, 255, 255, 0.05)",
    },
    {
      icon: MessageCircle,
      title: "Support",
      description: "Contact ground crew",
      color: "text-red-400",
      borderColor: "rgba(255, 255, 255, 0.1)",
      bgColor: "rgba(255, 255, 255, 0.05)",
    },
    {
      icon: Settings,
      title: "Settings",
      description: "Manage account",
      color: "text-gray-400",
      borderColor: "rgba(255, 255, 255, 0.1)",
      bgColor: "rgba(255, 255, 255, 0.05)",
    },
    {
      icon: LogOut,
      title: "Log Out",
      description: "End session",
      color: "text-gray-500",
      borderColor: "rgba(255, 255, 255, 0.1)",
      bgColor: "rgba(255, 255, 255, 0.05)",
      isLogout: true,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      {/* Primary Navigation */}
      <div>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const content = (
            <div
              className={`w-full p-4 rounded-2xl border transition-all duration-500 flex gap-3 items-center cursor-pointer group`}
              style={{
                backgroundImage: `linear-gradient(135deg, ${item.colors})`,
                borderColor: item.borderColor,
                borderWidth: "1.33333px",
              }}
            >
              <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                <p className="text-xs text-white/80">{item.description}</p>
              </div>
            </div>
          );

          if (item.isLink) {
            return (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {content}
              </a>
            );
          }

          return <div key={item.id}>{content}</div>;
        })}
      </div>

      {/* Action Items Grid */}
      <div className="col-span-3 grid grid-cols-3 gap-3">
        {actionItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              className="p-4 rounded-2xl border transition-all duration-500 flex gap-3 items-center backdrop-blur-lg hover:bg-white/10"
              style={{
                backgroundColor: item.bgColor,
                borderColor: item.borderColor,
                borderWidth: "1.33333px",
              }}
            >
              <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">
                <Icon className={`w-7 h-7 ${item.color}`} />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                <p className="text-xs text-white/80">{item.description}</p>
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
                className="w-full p-4 rounded-2xl border transition-all duration-500 flex gap-3 items-center backdrop-blur-lg hover:bg-white/10"
                style={{
                  backgroundColor: item.bgColor,
                  borderColor: item.borderColor,
                  borderWidth: "1.33333px",
                  opacity: item.isLogout ? 0.75 : 1,
                }}
              >
                <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">
                  <Icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                  <p className="text-xs text-white/80">{item.description}</p>
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
