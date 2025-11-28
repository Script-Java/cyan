import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  Target,
  Tag,
  FileText,
  Globe,
  DollarSign,
  BarChart3,
  Settings,
  ChevronDown,
  Store,
  Mail,
  Clipboard,
  Plus,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[];
  badge?: number;
}

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "sales-channels",
    "apps",
  ]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    const fetchPendingOrdersCount = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await fetch("/api/admin/orders/pending", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPendingOrdersCount(data.count || 0);
        }
      } catch (error) {
        console.error("Error fetching pending orders count:", error);
      }
    };

    fetchPendingOrdersCount();

    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingOrdersCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const mainNavItems: NavItem[] = [
    {
      label: "Home",
      icon: <Home className="w-5 h-5" />,
      path: "/admin",
    },
    {
      label: "Orders",
      icon: <ShoppingCart className="w-5 h-5" />,
      path: "/admin/orders",
      badge: 14,
    },
    {
      label: "Products",
      icon: <Package className="w-5 h-5" />,
      path: "/admin/products",
    },
    {
      label: "Customers",
      icon: <Users className="w-5 h-5" />,
      path: "/admin/customers",
    },
    {
      label: "Marketing",
      icon: <Target className="w-5 h-5" />,
      path: "/admin/marketing",
    },
    {
      label: "Discounts",
      icon: <Tag className="w-5 h-5" />,
      path: "/admin/discounts",
    },
    {
      label: "Content",
      icon: <FileText className="w-5 h-5" />,
      path: "/admin/content",
    },
    {
      label: "Markets",
      icon: <Globe className="w-5 h-5" />,
      path: "/admin/markets",
    },
    {
      label: "Finance",
      icon: <DollarSign className="w-5 h-5" />,
      path: "/admin/finance",
    },
    {
      label: "Analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      path: "/admin/analytics",
    },
  ];

  const secondaryNavItems: NavItem[] = [
    {
      label: "Sales Channels",
      icon: <Store className="w-5 h-5" />,
      children: [
        {
          label: "Point of Sale",
          icon: <Store className="w-4 h-4" />,
          path: "/admin/sales-channels/pos",
        },
        {
          label: "Online Store",
          icon: <Globe className="w-4 h-4" />,
          path: "/admin/sales-channels/online",
        },
        {
          label: "Shop App",
          icon: <ShoppingCart className="w-4 h-4" />,
          path: "/admin/sales-channels/shop",
        },
      ],
    },
    {
      label: "Apps",
      icon: <Plus className="w-5 h-5" />,
      children: [
        {
          label: "Email",
          icon: <Mail className="w-4 h-4" />,
          path: "/admin/apps/email",
        },
        {
          label: "Forms",
          icon: <Clipboard className="w-4 h-4" />,
          path: "/admin/apps/forms",
        },
      ],
    },
  ];

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const NavLink = ({
    item,
    isChild = false,
  }: {
    item: NavItem;
    isChild?: boolean;
  }) => {
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.path);
    const isExpanded = expandedItems.includes(item.label);

    return (
      <div key={item.label}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.label);
            } else if (item.path) {
              navigate(item.path);
            }
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
            isChild ? "text-sm" : "text-sm font-medium",
            active && !hasChildren
              ? "bg-blue-100 text-blue-900 font-semibold"
              : "text-gray-700 hover:bg-gray-100",
            hasChildren && "justify-between"
          )}
        >
          <div className="flex items-center gap-3 flex-1">
            <span className={cn("flex-shrink-0", active && "text-blue-600")}>
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
          </div>
          {item.badge && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 flex-shrink-0">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronDown
              className={cn(
                "w-4 h-4 flex-shrink-0 transition-transform",
                isExpanded && "rotate-180"
              )}
            />
          )}
        </button>

        {hasChildren && isExpanded && (
          <div className="ml-2 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
            {item.children!.map((child) => (
              <button
                key={child.label}
                onClick={() => child.path && navigate(child.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all",
                  isActive(child.path)
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <span className="flex-shrink-0">{child.icon}</span>
                <span className="truncate">{child.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-1">
          {mainNavItems.map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
        </nav>

        {/* Secondary Navigation */}
        <div className="border-t border-gray-200">
          <nav className="p-4 space-y-2">
            {secondaryNavItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom Settings */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={() => navigate("/admin/settings")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium",
            isActive("/admin/settings")
              ? "bg-blue-100 text-blue-900"
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 mt-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
