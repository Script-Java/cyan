import { useNavigate } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Eye,
  Package,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  iconColor: string;
}

interface AdminNavigationGridProps {
  className?: string;
}

export default function AdminNavigationGrid({
  className,
}: AdminNavigationGridProps) {
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    {
      label: "Home",
      description: "Dashboard overview",
      icon: <Home className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: "/admin",
      color:
        "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20",
      iconColor: "text-emerald-400",
    },
    {
      label: "Orders",
      description: "View order history",
      icon: <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: "/admin/orders",
      color:
        "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20",
      iconColor: "text-emerald-400",
    },
    {
      label: "Proofs",
      description: "Review designs",
      icon: <Eye className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: "/admin/proofs",
      color:
        "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20",
      iconColor: "text-orange-400",
    },
    {
      label: "Products",
      description: "Manage products",
      icon: <Package className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: "/admin/products",
      color:
        "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20",
      iconColor: "text-pink-400",
    },
    {
      label: "Customers",
      description: "Manage customers",
      icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: "/admin/customers",
      color:
        "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20",
      iconColor: "text-gray-400",
    },
    {
      label: "Finance",
      description: "View spending",
      icon: <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: "/admin/finance",
      color:
        "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20",
      iconColor: "text-blue-400",
    },
    {
      label: "Analytics",
      description: "View analytics",
      icon: <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: "/admin/analytics",
      color:
        "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20",
      iconColor: "text-blue-400",
    },
    {
      label: "Settings",
      description: "Manage account",
      icon: <Settings className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: "/admin/settings",
      color:
        "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20",
      iconColor: "text-gray-400",
    },
    {
      label: "Logout",
      description: "End session",
      icon: <LogOut className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: "#logout",
      color:
        "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 opacity-85",
      iconColor: "text-gray-400",
    },
  ];

  const handleNavigation = (item: NavItem) => {
    if (item.path === "#logout") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("isAdmin");
      navigate("/login");
    } else {
      navigate(item.path);
    }
  };

  return (
    <div
      className={cn(
        "grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-9 gap-1.5 sm:gap-2",
        className,
      )}
    >
      {navItems.map((item) => (
        <button
          key={item.label}
          onClick={() => handleNavigation(item)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2 rounded-lg border backdrop-blur-sm transition-all duration-200",
            "hover:scale-105 active:scale-95",
            item.color,
          )}
        >
          <div
            className={cn("flex-shrink-0 transition-colors", item.iconColor)}
          >
            {item.icon}
          </div>
          <p className="text-xs font-semibold text-white line-clamp-1">
            {item.label}
          </p>
        </button>
      ))}
    </div>
  );
}
