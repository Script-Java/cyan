"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  ShoppingCart,
  ChevronDown,
  LayoutGrid,
  Bookmark,
  BarChart3,
  Search,
  LogIn,
  UserPlus,
  Shield,
  LogOut,
  BookOpen,
  Crown,
  Sparkles,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoreCredit } from "@/hooks/useStoreCredit";

const ECWID_STORE_ID = "120154275";

interface HeaderProps {
  onMobileMenuClick?: () => void;
}

export default function Header({ onMobileMenuClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const ecwidScriptLoaded = useRef(false);
  const { storeCredit, fetchStoreCredit } = useStoreCredit();
  const isAdminPage = pathname?.startsWith("/admin");

  // Brand Colors
  const coral = "#F63049";
  const navy = "#111F35";

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const updateCartCount = () => {
    // Basic check for client-side execution
    if (typeof window === "undefined") return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItemCount(cart.length);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/ecwid-store?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Function to check and update auth state
  const checkAuthState = () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("authToken");
    const adminStatus = localStorage.getItem("isAdmin") === "true";
    const currentAuthState = !!token;
    const currentAdminState = adminStatus;

    // Only update if state actually changed
    setIsAuthenticated(prev => {
      if (prev !== currentAuthState) {
        return currentAuthState;
      }
      return prev;
    });

    setIsAdmin(prev => {
      if (prev !== currentAdminState) {
        return currentAdminState;
      }
      return prev;
    });

    if (token) {
      fetchStoreCredit();
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!ecwidScriptLoaded.current) {
      const script = document.createElement("script");
      script.src = `https://app.ecwid.com/script.js?${ECWID_STORE_ID}&data_platform=code&data_date=2025-11-28`;
      script.setAttribute("data-cfasync", "false");
      script.async = true;
      document.body.appendChild(script);
      ecwidScriptLoaded.current = true;
    }

    // Initial auth check
    checkAuthState();
    updateCartCount();

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuthState();
        fetchStoreCredit();
      }
    };

    // Handle storage changes (from other tabs/pages)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cart") {
        updateCartCount();
      }
      if (e.key === "authToken" || e.key === "isAdmin") {
        checkAuthState();
      }
    };

    // Handle custom auth change event
    const handleAuthChange = () => {
      checkAuthState();
    };

    // Handle focus
    const handleFocus = () => {
      checkAuthState();
      updateCartCount();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("auth-change", handleAuthChange);

    // Poll for auth changes every 2 seconds (backup mechanism)
    const intervalId = setInterval(checkAuthState, 2000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("auth-change", handleAuthChange);
      clearInterval(intervalId);
    };
  }, [fetchStoreCredit, pathname]); // Re-run when pathname changes

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("customerId");
    localStorage.removeItem("isAdmin");
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsProfileMenuOpen(false);

    // Dispatch auth change event to notify other components
    window.dispatchEvent(new Event("auth-change"));

    router.push("/");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-gray-100"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center">
              {isAdminPage && onMobileMenuClick ? (
                <button
                  onClick={onMobileMenuClick}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Menu className="w-6 h-6" style={{ color: navy }} />
                </button>
              ) : (
                <Link href="/" className="flex items-center">
                  <img
                    src="/stickerland_logo_red.png"
                    alt="Stickerland"
                    className="h-10 w-auto object-contain"
                    onError={(e) => {
                      // If image fails to load, show text fallback
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span class="text-xl font-bold text-[#F63049]">Stickerland</span>';
                      }
                    }}
                  />
                </Link>
              )}
            </div>

            {/* Desktop Logo */}
            <div className="hidden md:flex items-center">
              <Link href="/" className="flex items-center group">
                <img
                  src="/stickerland_logo_red.png"
                  alt="Stickerland"
                  className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    // If image fails to load, show text fallback
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = '<span class="text-2xl font-bold text-[#F63049]">Stickerland</span>';
                    }
                  }}
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-300"
                    title="Dashboard"
                  >
                    <LayoutGrid className="w-5 h-5" style={{ color: "#64748b" }} />
                  </Link>
                  <Link
                    href="/order-history"
                    className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-300"
                    title="Orders"
                  >
                    <Bookmark className="w-5 h-5" style={{ color: "#64748b" }} />
                  </Link>
                </>
              )}

              <div className="h-6 w-px bg-gray-200 mx-2" />

              <Link
                href="/order-status"
                className="px-5 py-2.5 text-sm font-medium transition-colors duration-300 hover:text-[#F63049]"
                style={{ color: navy }}
              >
                Track Order
              </Link>
              <Link
                href="/deals"
                className="px-5 py-2.5 text-sm font-medium transition-colors duration-300 hover:text-[#F63049]"
                style={{ color: navy }}
              >
                Deals
              </Link>
              <Link
                href="/blogs"
                className="px-5 py-2.5 text-sm font-medium transition-colors duration-300 hover:text-[#F63049]"
                style={{ color: navy }}
              >
                Journal
              </Link>

              {!isAuthenticated && (
                <>
                  <div className="h-6 w-px bg-gray-200 mx-2" />
                  <Link
                    href="/login"
                    className="px-5 py-2.5 text-sm font-medium transition-colors duration-300 hover:text-[#F63049]"
                    style={{ color: "#64748b" }}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="ml-2 px-6 py-2.5 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${coral} 0%, #D02752 100%)`,
                      boxShadow: `0 10px 25px -5px ${coral}40`
                    }}
                  >
                    Get Started
                  </Link>
                </>
              )}

              {isAuthenticated && isAdmin && (
                <Link
                  href="/admin"
                  className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-300"
                  title="Admin Dashboard"
                >
                  <Shield className="w-5 h-5" style={{ color: coral }} />
                </Link>
              )}

              {/* Profile Dropdown */}
              {isAuthenticated && (
                <div className="relative ml-2">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-all duration-300"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${navy} 0%, #1a2d4a 100%)` }}
                    >
                      <span className="text-white text-sm font-semibold">
                        {isAdmin ? "A" : "U"}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4" style={{ color: "#64748b" }} />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 z-50 overflow-hidden">
                      <div
                        className="p-4 border-b border-gray-100"
                        style={{ background: `linear-gradient(135deg, #fafafa 0%, white 100%)` }}
                      >
                        <p className="font-semibold" style={{ color: navy }}>
                          {isAdmin ? "Administrator" : "My Account"}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                          {isAuthenticated ? "Signed in" : "Guest"}
                        </p>
                      </div>

                      <div className="p-2">
                        {isAdmin ? (
                          <>
                            <Link
                              href="/admin"
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                              style={{ color: navy }}
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <BarChart3 className="w-4 h-4" style={{ color: coral }} />
                              Admin Panel
                            </Link>
                            <Link
                              href="/dashboard"
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                              style={{ color: navy }}
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <LayoutGrid className="w-4 h-4" style={{ color: "#64748b" }} />
                              Dashboard
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              href="/dashboard"
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                              style={{ color: navy }}
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <LayoutGrid className="w-4 h-4" style={{ color: "#64748b" }} />
                              Dashboard
                            </Link>
                            <Link
                              href="/order-history"
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                              style={{ color: navy }}
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <Bookmark className="w-4 h-4" style={{ color: "#64748b" }} />
                              Orders
                            </Link>
                            <Link
                              href="/designs"
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                              style={{ color: navy }}
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <Sparkles className="w-4 h-4" style={{ color: "#64748b" }} />
                              My Designs
                            </Link>
                            <Link
                              href="/support"
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                              style={{ color: navy }}
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <BookOpen className="w-4 h-4" style={{ color: "#64748b" }} />
                              Support
                            </Link>
                          </>
                        )}

                        <div className="h-px bg-gray-100 my-2" />

                        <button
                          onClick={() => {
                            handleLogout();
                            setIsProfileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium w-full"
                          style={{ color: "#dc2626" }}
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cart */}
              <Link
                href="/checkout-new"
                className="relative ml-2 p-3 hover:bg-gray-100 rounded-xl transition-all duration-300 group"
              >
                <ShoppingCart className="w-5 h-5 transition-colors group-hover:text-[#F63049]" style={{ color: navy }} />
                {cartItemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    style={{ background: coral }}
                  >
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
              </Link>

              <div className="ml-2">
                <div className="ec-cart-widget"></div>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" style={{ color: coral }} />
              ) : (
                <Menu className="w-6 h-6" style={{ color: navy }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 md:hidden overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <img
                    src="/stickerland_logo_red.png"
                    alt="Stickerland"
                    className="h-10 w-auto object-contain"
                    onError={(e) => {
                      // If image fails to load, show text fallback
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span class="text-xl font-bold text-[#F63049]">Stickerland</span>';
                      }
                    }}
                  />
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" style={{ color: "#64748b" }} />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search stickers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F63049]/20 focus:border-[#F63049]"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                    <Search className="w-4 h-4" style={{ color: "#64748b" }} />
                  </button>
                </div>
              </form>

              {/* Mobile Navigation */}
              <nav className="space-y-1">
                <Link
                  href="/ecwid-store"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-white font-medium transition-colors"
                  style={{ background: `linear-gradient(135deg, ${coral} 0%, #D02752 100%)` }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Shop All Products
                </Link>

                <div className="h-px bg-gray-100 my-4" />

                <Link
                  href="/deals"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                  style={{ color: navy }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" style={{ color: coral }} />
                  Deals
                </Link>
                <Link
                  href="/blogs"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                  style={{ color: navy }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BookOpen className="w-5 h-5" style={{ color: coral }} />
                  Journal
                </Link>
                <Link
                  href="/order-status"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                  style={{ color: navy }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Bookmark className="w-5 h-5" style={{ color: coral }} />
                  Track Order
                </Link>

                {isAuthenticated && (
                  <>
                    <div className="h-px bg-gray-100 my-4" />
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                      style={{ color: navy }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutGrid className="w-5 h-5" style={{ color: "#64748b" }} />
                      Dashboard
                    </Link>
                    <Link
                      href="/order-history"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                      style={{ color: navy }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Bookmark className="w-5 h-5" style={{ color: "#64748b" }} />
                      Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors border"
                        style={{
                          background: `${coral}15`,
                          color: coral,
                          borderColor: `${coral}30`
                        }}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Shield className="w-5 h-5" />
                        Admin Panel
                      </Link>
                    )}
                  </>
                )}
              </nav>

              {/* Mobile Auth */}
              <div className="mt-8 space-y-3">
                {!isAuthenticated ? (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 font-semibold transition-colors"
                      style={{ borderColor: navy, color: navy }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-white font-semibold transition-colors"
                      style={{ background: `linear-gradient(135deg, ${coral} 0%, #D02752 100%)` }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserPlus className="w-5 h-5" />
                      Create Account
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-red-200 text-red-600 font-semibold transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
