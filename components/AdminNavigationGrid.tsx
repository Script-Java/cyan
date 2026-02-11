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
  Truck,
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
      icon: <Home className="w-5 h-5 sm:w-6 sm:h-6" />,
      path: "/admin",
      color:
        "bg-gray-300 hover:bg-gray-400 border-gray-400 hover:border-gray-500",
      iconColor: "text-emerald-600",
    },
    {
      label: "Orders",
      description: "View order history",
      icon: <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />,
      path: "/admin/orders",
      color:
        "bg-gray-300 hover:bg-gray-400 border-gray-400 hover:border-gray-500",
      iconColor: "text-emerald-600",
    },
    {
      label: "Proofs",
      description: "Review designs",
      icon: <Eye className="w-5 h-5 sm:w-6 sm:h-6" />,
      path: "/admin/proofs",
      color:
        "bg-gray-300 hover:bg-gray-400 border-gray-400 hover:border-gray-500",
      iconColor: "text-orange-600",
    },
    {
      label: "Products",
      description: "Manage products",
      icon: <Package className="w-5 h-5 sm:w-6 sm:h-6" />,
      path: "/admin/products",
      color:
        "bg-gray-300 hover:bg-gray-400 border-gray-400 hover:border-gray-500",
      iconColor: "text-pink-600",
    },
    {
      label: "Customers",
      description: "Manage customers",
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      path: "/admin/customers",
      color:
        "bg-gray-300 hover:bg-gray-400 border-gray-400 hover:border-gray-500",
      iconColor: "text-gray-700",
    },
    {
      label: "Finance",
      description: "View spending",
      icon: <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />,
      path: "/admin/finance",
      color:
        "bg-gray-300 hover:bg-gray-400 border-gray-400 hover:border-gray-500",
      iconColor: "text-blue-600",
    },
    {
      label: "Analytics",
      description: "View analytics",
      icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />,
      path: "/admin/analytics",
      color:
        "bg-gray-300 hover:bg-gray-400 border-gray-400 hover:border-gray-500",
      iconColor: "text-blue-600",
    },
    {
      label: "Shipping",
      description: "Shipping options",
      icon: <Truck className="w-5 h-5 sm:w-6 sm:h-6" />,
      path: "/admin/shipping",
      color:
        "bg-gray-300 hover:bg-gray-400 border-gray-400 hover:border-gray-500",
      iconColor: "text-teal-600",
    },
    {
      label: "Settings",
      description: "Manage account",
      icon: <Settings className="w-5 h-5 sm:w-6 sm:h-6" />,
      path: "/admin/settings",
      color:
        "bg-gray-300 hover:bg-gray-400 border-gray-400 hover:border-gray-500",
      iconColor: "text-gray-700",
    },
    {
      label: "Logout",
      description: "End session",
      icon: <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />,
      path: "#logout",
      color:
        "bg-gray-300 hover:bg-gray-400 border-gray-400 hover:border-gray-500 opacity-85",
      iconColor: "text-gray-700",
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
          <p className="text-xs font-semibold text-gray-900 line-clamp-1">
            {item.label}
          </p>
        </button>
      ))}
    </div>
  );
}
