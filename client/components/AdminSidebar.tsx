import { useState, useEffect } from "react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  Target,
  Tag,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  ChevronDown,
  Mail,
  Clipboard,
  Plus,
  Eye,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[];
  badge?: number;
}

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["apps"]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    const fetchPendingOrdersCount = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await fetch("/api/admin/pending-orders", {
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
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const mainNavItems: NavItem[] = [
    {
      label: "Home",
      icon: <Home className="w-4 h-4" />,
      path: "/admin",
    },
    {
      label: "Orders",
      icon: <ShoppingCart className="w-4 h-4" />,
      path: "/admin/orders",
      badge: pendingOrdersCount,
    },
    {
      label: "Proofs",
      icon: <Eye className="w-4 h-4" />,
      path: "/admin/proofs",
    },
    {
      label: "Products",
      icon: <Package className="w-4 h-4" />,
      path: "/admin/products",
    },
    {
      label: "Customers",
      icon: <Users className="w-4 h-4" />,
      path: "/admin/customers",
    },
    {
      label: "Marketing",
      icon: <Target className="w-4 h-4" />,
      path: "/admin/marketing",
    },
    {
      label: "Discounts",
      icon: <Tag className="w-4 h-4" />,
      path: "/admin/discounts",
    },
    {
      label: "Content",
      icon: <FileText className="w-4 h-4" />,
      path: "/admin/content",
    },
    {
      label: "Finance",
      icon: <DollarSign className="w-4 h-4" />,
      path: "/admin/finance",
    },
    {
      label: "Analytics",
      icon: <BarChart3 className="w-4 h-4" />,
      path: "/admin/analytics",
    },
  ];

  const secondaryNavItems: NavItem[] = [
    {
      label: "Apps",
      icon: <Plus className="w-4 h-4" />,
      children: [
        {
          label: "Email",
          icon: <Mail className="w-3.5 h-3.5" />,
          path: "/admin/apps/email",
        },
        {
          label: "Forms",
          icon: <Clipboard className="w-3.5 h-3.5" />,
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
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
            isChild ? "text-xs" : "text-xs font-medium",
            active && !hasChildren
              ? "bg-white/10 text-[#FFD713] font-semibold"
              : "text-white/60 hover:bg-white/5 hover:text-white",
            hasChildren && "justify-between",
          )}
        >
          <div className="flex items-center gap-3 flex-1">
            <span
              className={cn(
                "flex-shrink-0 transition-colors",
                active && "text-[#FFD713]",
              )}
            >
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
          </div>
          {item.badge && (
            <span className="bg-[#FFD713] text-black text-xs font-bold rounded-full px-1.5 py-0.5 flex-shrink-0">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronDown
              className={cn(
                "w-3 h-3 flex-shrink-0 transition-transform",
                isExpanded && "rotate-180",
              )}
            />
          )}
        </button>

        {hasChildren && isExpanded && (
          <div className="ml-2 mt-0.5 space-y-0.5 border-l-2 border-white/10 pl-2">
            {item.children!.map((child) => (
              <button
                key={child.label}
                onClick={() => child.path && navigate(child.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs transition-all",
                  isActive(child.path)
                    ? "bg-purple-500/20 text-purple-300 font-semibold"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80",
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
    <>
      {/* Mobile overlay backdrop */}
      {!isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-12 h-[calc(100vh-3rem)] w-64 bg-black border-r border-white/10 flex flex-col overflow-hidden transition-all duration-300 z-40",
        "md:static md:w-64 md:h-auto",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Mobile Close Button */}
        {!isOpen && (
          <button
            onClick={onClose}
            className="md:hidden absolute top-3 right-3 p-2 text-white/60 hover:text-white transition-colors z-50"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto mt-5">
          <nav className="p-3 space-y-0.5">
            {mainNavItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </nav>

          {/* Secondary Navigation */}
          <div className="border-t border-white/10 mt-1">
            <nav className="p-3 space-y-0.5">
              {secondaryNavItems.map((item) => (
                <NavLink key={item.label} item={item} />
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom Settings */}
        <div className="border-t border-white/10 p-3 space-y-2">
          <button
            onClick={() => navigate("/admin/settings")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium",
              isActive("/admin/settings")
                ? "bg-white/10 text-[#FFD713]"
                : "text-white/60 hover:bg-white/5 hover:text-white",
            )}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-white/60 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
