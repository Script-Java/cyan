import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Eye,
  ChevronDown,
  Mail,
  Clipboard,
  Plus,
  Menu,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[];
  badge?: number;
}

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const fetchPendingOrdersCount = async () => {
      if (!isMounted) return;

      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          if (isMounted) setPendingOrdersCount(0);
          return;
        }

        const controller = new AbortController();
        timeoutId = setTimeout(() => {
          controller.abort();
        }, 10000); // 10 second timeout

        try {
          const response = await fetch("/api/admin/pending-orders", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          });

          if (timeoutId) clearTimeout(timeoutId);

          if (!response.ok) {
            console.warn(
              `Failed to fetch pending orders: ${response.status} ${response.statusText}`
            );
            if (response.status === 401) {
              // Unauthorized - clear auth
              if (isMounted) {
                localStorage.removeItem("authToken");
                setPendingOrdersCount(0);
              }
            } else {
              // Other error - try to parse error message
              try {
                const errorData = await response.json();
                console.warn("Server error:", errorData);
              } catch (e) {
                // Response wasn't JSON
              }
              if (isMounted) setPendingOrdersCount(0);
            }
            return;
          }

          try {
            const data = await response.json();
            if (isMounted) {
              setPendingOrdersCount(data.count ?? data.orders?.length ?? 0);
            }
          } catch (parseError) {
            console.error("Failed to parse pending orders response:", parseError);
            if (isMounted) setPendingOrdersCount(0);
          }
        } catch (fetchError) {
          if (timeoutId) clearTimeout(timeoutId);

          if (fetchError instanceof Error) {
            if (fetchError.name === "AbortError") {
              console.warn("Pending orders count fetch timeout after 10 seconds");
            } else {
              console.warn("Network error fetching pending orders count:", fetchError.message);
            }
          } else {
            console.warn("Unknown error fetching pending orders count");
          }

          if (isMounted) setPendingOrdersCount(0);
        }
      } catch (error) {
        console.error("Unexpected error in fetchPendingOrdersCount:", error);
        if (isMounted) setPendingOrdersCount(0);
      }
    };

    // Initial fetch with a small delay to avoid race conditions
    const initialFetchTimer = setTimeout(() => {
      fetchPendingOrdersCount();
    }, 500);

    const interval = setInterval(fetchPendingOrdersCount, 60000); // Poll every 60 seconds

    return () => {
      isMounted = false;
      clearTimeout(initialFetchTimer);
      if (timeoutId) clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, []);

  const mainNavItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: <Home className="w-4 h-4" />,
      path: "/dashboard",
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
      label: "Gallery",
      icon: <ImageIcon className="w-4 h-4" />,
      path: "/admin/gallery",
    },
    {
      label: "Email Notifications",
      icon: <Mail className="w-4 h-4" />,
      path: "/admin/email-notifications",
    },
    {
      label: "Apps",
      icon: <Plus className="w-4 h-4" />,
      children: [
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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  const handleNavItemClick = (path?: string) => {
    if (path) {
      navigate(path);
      setMobileMenuOpen(false);
    }
  };

  const NavItem = ({
    item,
    isMobile = false,
  }: {
    item: NavItem;
    isMobile?: boolean;
  }) => {
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.path);
    const isDropdownOpen = expandedDropdown === item.label;

    if (hasChildren) {
      return (
        <div key={item.label} className="relative group">
          <button
            onClick={() => {
              if (isMobile) {
                setExpandedDropdown(isDropdownOpen ? null : item.label);
              }
            }}
            onMouseEnter={() => {
              if (!isMobile) {
                setExpandedDropdown(item.label);
              }
            }}
            onMouseLeave={() => {
              if (!isMobile) {
                setExpandedDropdown(null);
              }
            }}
            className={cn(
              "flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium",
              "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
            )}
          >
            {item.icon}
            <span>{item.label}</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                (isMobile ? isDropdownOpen : expandedDropdown === item.label) &&
                  "rotate-180",
              )}
            />
          </button>

          {/* Dropdown menu */}
          {(isMobile ? isDropdownOpen : expandedDropdown === item.label) && (
            <div
              className={cn(
                "rounded-lg bg-white border border-gray-200 shadow-lg overflow-hidden z-50",
                isMobile
                  ? "mt-2 w-full"
                  : "absolute left-0 top-full mt-1 min-w-[200px] group-hover:block hidden",
              )}
            >
              {item.children!.map((child) => (
                <button
                  key={child.label}
                  onClick={() => {
                    if (child.path) {
                      navigate(child.path);
                      setMobileMenuOpen(false);
                      setExpandedDropdown(null);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-all",
                    isActive(child.path)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                  )}
                >
                  {child.icon}
                  <span>{child.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.label}
        onClick={() => handleNavItemClick(item.path)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
          active
            ? "bg-blue-50 text-blue-600 font-semibold"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
        )}
      >
        {item.icon}
        <span>{item.label}</span>
        {item.badge ? (
          <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
            {item.badge}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="hidden md:flex h-14 items-center justify-between">
          {/* Main Items */}
          <div className="flex items-center gap-0.5 flex-1">
            {mainNavItems.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </div>

          {/* Secondary Items */}
          <div className="flex items-center gap-0.5">
            {secondaryNavItems.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </div>

          {/* Settings and Logout */}
          <div className="flex items-center gap-0.5 ml-3 pl-3 border-l border-gray-200">
            <button
              onClick={() => navigate("/admin/settings")}
              className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium",
                isActive("/admin/settings")
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
              )}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-1.5 flex-1 overflow-x-auto">
              {mainNavItems.slice(0, 3).map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavItemClick(item.path)}
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-1 rounded text-xs font-medium whitespace-nowrap",
                    isActive(item.path)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                  )}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="ml-2 p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-900" />
              ) : (
                <Menu className="w-5 h-5 text-gray-900" />
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="border-t border-gray-200 bg-gray-50/50 backdrop-blur-sm max-h-96 overflow-y-auto">
              <div className="p-2 space-y-0.5">
                {mainNavItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavItemClick(item.path)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all text-sm",
                      isActive(item.path)
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="ml-auto bg-[#FFD713] text-black text-xs font-bold rounded-full px-1.5 py-0.5">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                ))}

                <div className="border-t border-gray-200 my-1.5 pt-1.5">
                  {secondaryNavItems.map((item) => (
                    <NavItem key={item.label} item={item} isMobile={true} />
                  ))}
                </div>

                <div className="border-t border-gray-200 my-1.5 pt-1.5 space-y-0.5">
                  <button
                    onClick={() => {
                      navigate("/admin/settings");
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all text-sm",
                      isActive("/admin/settings")
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                    )}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
