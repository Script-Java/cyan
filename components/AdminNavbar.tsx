import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  MoreHorizontal,
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
  const location = useLocation();
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

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
        }, 10000);

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
            if (response.status === 401) {
              if (isMounted) {
                localStorage.removeItem("authToken");
                setPendingOrdersCount(0);
              }
            } else {
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
            if (isMounted) setPendingOrdersCount(0);
          }
        } catch (fetchError) {
          if (timeoutId) clearTimeout(timeoutId);
          if (isMounted) setPendingOrdersCount(0);
        }
      } catch (error) {
        if (isMounted) setPendingOrdersCount(0);
      }
    };

    const initialFetchTimer = setTimeout(() => {
      fetchPendingOrdersCount();
    }, 500);

    const interval = setInterval(fetchPendingOrdersCount, 60000);

    return () => {
      isMounted = false;
      clearTimeout(initialFetchTimer);
      if (timeoutId) clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, []);

  const primaryNavItems: NavItem[] = [
    {
      label: "Dashboard",
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
      label: "Email",
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
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("customerId");
    localStorage.removeItem("isAdmin");
    
    // Dispatch auth change event to update Header navigation
    window.dispatchEvent(new Event("auth-change"));
    
    window.location.href = "/login";
  };

  const handleNavItemClick = (path?: string) => {
    if (path) {
      window.location.href = path;
      setMobileMenuOpen(false);
      setMoreMenuOpen(false);
    }
  };

  const NavButton = ({
    item,
    isDropdown = false,
    isOpen,
    onClick,
  }: {
    item: NavItem;
    isDropdown?: boolean;
    isOpen?: boolean;
    onClick?: () => void;
  }) => {
    const active = isActive(item.path);

    if (isDropdown) {
      return (
        <button
          onClick={onClick}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap",
            isOpen
              ? "bg-blue-50 text-blue-600"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          )}
        >
          {item.icon}
          <span>{item.label}</span>
          <ChevronDown
            className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")}
          />
        </button>
      );
    }

    return (
      <button
        onClick={() => handleNavItemClick(item.path)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap",
          active
            ? "bg-blue-50 text-blue-600 font-semibold"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        )}
      >
        {item.icon}
        <span>{item.label}</span>
        {item.badge ? (
          <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-20 z-40">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Navigation - Two Row Layout */}
          <div className="hidden lg:block">
            {/* Top Row - Primary Navigation */}
            <div className="flex h-14 items-center justify-between">
              {/* Primary Nav Items */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                {primaryNavItems.map((item) => (
                  <NavButton key={item.label} item={item} />
                ))}
              </div>

              {/* Right Side - Always Visible */}
              <div className="flex items-center gap-1 flex-shrink-0 ml-4 pl-4 border-l border-gray-200">
                {/* More Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
                      moreMenuOpen
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                    <span>More</span>
                    <ChevronDown
                      className={cn("w-4 h-4 transition-transform", moreMenuOpen && "rotate-180")}
                    />
                  </button>

                  {/* More Dropdown Menu */}
                  {moreMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMoreMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2">
                        {secondaryNavItems.map((item) =>
                          item.children ? (
                            <div key={item.label} className="px-2">
                              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                {item.label}
                              </div>
                              {item.children.map((child) => (
                                <button
                                  key={child.label}
                                  onClick={() => handleNavItemClick(child.path)}
                                  className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                                    isActive(child.path)
                                      ? "bg-blue-50 text-blue-600"
                                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                  )}
                                >
                                  {child.icon}
                                  <span>{child.label}</span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <button
                              key={item.label}
                              onClick={() => handleNavItemClick(item.path)}
                              className={cn(
                                "w-full flex items-center gap-2 px-5 py-2.5 text-sm transition-all mx-2 rounded-lg",
                                isActive(item.path)
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                              )}
                            >
                              {item.icon}
                              <span>{item.label}</span>
                            </button>
                          )
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Settings */}
                <button
                  onClick={() => window.location.href = "/admin/settings"}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
                    isActive("/admin/settings")
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden xl:inline">Settings</span>
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden xl:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tablet Navigation */}
          <div className="hidden md:flex lg:hidden h-14 items-center justify-between">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1">
              {primaryNavItems.map((item) => (
                <NavButton key={item.label} item={item} />
              ))}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0 ml-2 pl-2 border-l border-gray-200">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.location.href = "/admin/settings"}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  isActive("/admin/settings")
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* More Menu Dropdown for Tablet */}
            {moreMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMoreMenuOpen(false)}
                />
                <div className="absolute right-4 top-14 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2">
                  {secondaryNavItems.map((item) =>
                    item.children ? (
                      <div key={item.label} className="px-2">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          {item.label}
                        </div>
                        {item.children.map((child) => (
                          <button
                            key={child.label}
                            onClick={() => handleNavItemClick(child.path)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          >
                            {child.icon}
                            <span>{child.label}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        key={item.label}
                        onClick={() => handleNavItemClick(item.path)}
                        className="w-full flex items-center gap-2 px-5 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 mx-2 rounded-lg"
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    )
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <div className="flex h-14 items-center justify-between">
              <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide">
                {primaryNavItems.slice(0, 4).map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavItemClick(item.path)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium whitespace-nowrap",
                      isActive(item.path)
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="ml-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-900" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-900" />
                )}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="border-t border-gray-200 bg-gray-50/50 py-2">
                <div className="space-y-1">
                  {primaryNavItems.slice(4).map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleNavItemClick(item.path)}
                      className={cn(
                        "w-full flex items-center gap-2 px-4 py-2 text-sm",
                        isActive(item.path)
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.badge ? (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  ))}

                  <div className="border-t border-gray-200 my-2 pt-2">
                    {secondaryNavItems.map((item) =>
                      item.children ? (
                        item.children.map((child) => (
                          <button
                            key={child.label}
                            onClick={() => handleNavItemClick(child.path)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          >
                            {child.icon}
                            <span>{child.label}</span>
                          </button>
                        ))
                      ) : (
                        <button
                          key={item.label}
                          onClick={() => handleNavItemClick(item.path)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      )
                    )}
                  </div>

                  <div className="border-t border-gray-200 my-2 pt-2 space-y-1">
                    <button
                      onClick={() => {
                        window.location.href = "/admin/settings";
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-4 py-2 text-sm",
                        isActive("/admin/settings")
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      )}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50"
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
      </div>
    </nav>
  );
}
