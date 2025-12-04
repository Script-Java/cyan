import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  const navigate = useNavigate();
  const location = useLocation();
  const ecwidScriptLoaded = useRef(false);
  const { storeCredit, fetchStoreCredit } = useStoreCredit();
  const isAdminPage = location.pathname.startsWith("/admin");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to Ecwid store and trigger search
      navigate(`/ecwid-store?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    // Load Ecwid script for cart widget
    if (!ecwidScriptLoaded.current) {
      const script = document.createElement("script");
      script.src = `https://app.ecwid.com/script.js?${ECWID_STORE_ID}&data_platform=code&data_date=2025-11-28`;
      script.setAttribute("data-cfasync", "false");
      script.async = true;
      document.body.appendChild(script);
      ecwidScriptLoaded.current = true;
    }

    const token = localStorage.getItem("authToken");
    const adminStatus = localStorage.getItem("isAdmin") === "true";
    setIsAuthenticated(!!token);
    setIsAdmin(adminStatus);

    if (token) {
      fetchStoreCredit();
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && token) {
        fetchStoreCredit();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchStoreCredit]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("customerId");
    setIsAuthenticated(false);
    setIsProfileMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black text-white border-b border-white/10">
      <div className="mx-auto px-4 pt-0.5 pb-0">
        <div className="max-w-7xl mx-auto">
          <div
            className="flex items-center justify-between"
            style={{ margin: "-4px 0 -5px" }}
          >
            {/* Mobile Menu/Profile Button - Left Side */}
            <div className="flex md:hidden items-center">
              {isAdminPage && onMobileMenuClick ? (
                <button
                  onClick={onMobileMenuClick}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Toggle sidebar"
                >
                  <Menu className="w-6 h-6 text-white" />
                </button>
              ) : (
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F1e00ee8c48924560b1c928d354e4521b%2Ff84956aaeddb4872bf448e0f5fbc3371?format=webp&width=800"
                    alt="Profile"
                    className="w-10 h-10 rounded-full border border-white/20"
                  />
                </button>
              )}
            </div>

            {/* Desktop Logo Area */}
            <div className="hidden md:flex items-center mr-2">
              <Link
                to="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F1e00ee8c48924560b1c928d354e4521b%2F6def69979e504acebe0ba665997a2501?format=webp&width=800"
                  alt="Sticky Logo"
                  className="h-12 object-contain"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/dashboard"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Dashboard"
              >
                <LayoutGrid className="w-7 h-7 text-[#8B5CF6]" />
              </Link>
              <Link
                to="/order-history"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Orders"
              >
                <Bookmark className="w-7 h-7 text-[#10B981]" />
              </Link>
              <Link
                to="/blogs"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Blog"
              >
                <BookOpen className="w-7 h-7 text-[#3B82F6]" />
              </Link>
              {isAuthenticated && (
                <div
                  className="flex items-center rounded-lg border"
                  title="Store credit from your BigCommerce account"
                  style={{
                    alignItems: "center",
                    backgroundImage:
                      "linear-gradient(to right bottom, rgba(234, 179, 8, 0.3), rgba(202, 138, 4, 0.1))",
                    borderColor: "rgba(234, 179, 8, 0.4)",
                    borderRadius: "8px",
                    borderWidth: "1.11111px",
                    fontSize: "14px",
                    fontWeight: "500",
                    gap: "8px",
                    lineHeight: "20px",
                    padding: "8px 16px",
                  }}
                >
                  <img
                    src="https://res.cloudinary.com/dxcnvqk6b/image/upload/v1753923671/StickerShuttle_CoinIcon_aperue.png"
                    alt="Credits"
                    style={{
                      display: "block",
                      fontWeight: "500",
                      height: "20px",
                      width: "20px",
                    }}
                  />
                  <span
                    style={{
                      display: "block",
                      color: "rgb(253, 224, 71)",
                      fontWeight: "500",
                    }}
                  >
                    $ {storeCredit.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Auth Icons */}
              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Login"
                  >
                    <LogIn className="w-6 h-6 text-blue-400" />
                  </Link>
                  <Link
                    to="/signup"
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Sign Up"
                  >
                    <UserPlus className="w-6 h-6 text-green-400" />
                  </Link>
                </>
              )}

              {isAuthenticated && isAdmin && (
                <Link
                  to="/admin"
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Admin Dashboard"
                >
                  <Shield className="w-6 h-6 text-orange-400" />
                </Link>
              )}

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                >
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F1e00ee8c48924560b1c928d354e4521b%2Ff84956aaeddb4872bf448e0f5fbc3371?format=webp&width=800"
                    alt="Profile"
                    className="w-10 h-10 rounded-full border border-white/20"
                  />
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#030140]/95 border border-white/20 rounded-lg backdrop-blur-md shadow-lg z-50">
                    {isAuthenticated ? (
                      <>
                        <Link
                          to="/dashboard"
                          className="block w-full px-4 py-2 text-left hover:bg-white/10 transition-colors text-white font-medium text-sm border-b border-white/10"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-white/10 transition-colors text-white font-medium text-sm border-b border-white/10"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <BarChart3 className="w-4 h-4" />
                            Admin
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            handleLogout();
                          }}
                          className="block w-full px-4 py-2 text-left hover:bg-white/10 transition-colors text-white font-medium text-sm"
                        >
                          Log out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="block w-full px-4 py-2 text-left hover:bg-white/10 transition-colors text-white font-medium text-sm border-b border-white/10"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Log in
                        </Link>
                        <Link
                          to="/signup"
                          className="block w-full px-4 py-2 text-left hover:bg-white/10 transition-colors text-white font-medium text-sm"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Sign up
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Desktop Cart Icon */}
              <Link
                to="/checkout-new"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Go to Checkout"
              >
                <ShoppingCart className="w-7 h-7 text-[#FFD713]" />
              </Link>

              {/* Desktop Cart Widget */}
              <div className="ml-2">
                <div className="ec-cart-widget"></div>
              </div>
            </nav>

            {/* Mobile Menu Button - Right Side */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      {isMenuOpen && (
        <div className="fixed top-0 left-0 h-full w-80 bg-black/95 border-r border-white/10 backdrop-blur-md z-40 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F1e00ee8c48924560b1c928d354e4521b%2F54e0024038fb466cb5627885e1e1afd9?format=webp&width=800"
                alt="Sticky Logo"
                className="h-16 object-contain"
              />
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Auth Section - shown when not authenticated */}
            {!isAuthenticated && (
              <div className="mb-6 space-y-2">
                <h3 className="text-xs font-semibold text-white/60 uppercase px-4 mb-3">
                  Account
                </h3>
                <Link
                  to="/login"
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 transition-colors text-blue-300 font-medium text-sm border border-blue-500/30"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn className="w-5 h-5" />
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-green-600/20 hover:bg-green-600/30 transition-colors text-green-300 font-medium text-sm border border-green-500/30"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserPlus className="w-5 h-5" />
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div style={{ fontWeight: "400", position: "relative" }}>
                <input
                  type="text"
                  placeholder="Search stickers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    display: "inline-block",
                    width: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    borderWidth: "1.11111px",
                    fontWeight: "400",
                    transitionDuration: "0.15s",
                    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                    padding: "8px 16px 8px 8px",
                    color: "white",
                    fontSize: "14px",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    borderRadius: "4px",
                    display: "block",
                    fontWeight: "400",
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transitionDuration: "0.15s",
                    transitionProperty:
                      "color, background-color, border-color, text-decoration-color, fill, stroke",
                    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(0, 0, 0, 0)",
                    borderColor: "rgba(0, 0, 0, 0)",
                    padding: "4px",
                    cursor: "pointer",
                  }}
                >
                  <Search className="w-4 h-4 text-white/60 hover:text-white" />
                </button>
              </div>
            </form>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <Link
                to="/blogs"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white font-medium text-sm border border-white/20"
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="w-5 h-5 text-[#3B82F6]" />
                Blog
              </Link>
              <Link
                to="/ecwid-store"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white font-medium text-sm border border-[#FFD713]/30"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5 text-[#FFD713]" />
                Shop All Products
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white font-medium text-sm border border-white/20"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutGrid className="w-5 h-5 text-[#8B5CF6]" />
                    Dashboard
                  </Link>
                  <Link
                    to="/order-history"
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white font-medium text-sm border border-white/20"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Bookmark className="w-5 h-5 text-[#10B981]" />
                    Orders
                  </Link>
                  <Link
                    to="/blogs"
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white font-medium text-sm border border-white/20"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BookOpen className="w-5 h-5 text-[#3B82F6]" />
                    Blog
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white font-medium text-sm border border-orange-500/30 bg-orange-600/20"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="w-5 h-5 text-orange-400" />
                      Admin Dashboard
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* Logout Section - shown when authenticated */}
            {isAuthenticated && (
              <div className="mt-6 space-y-2">
                <h3 className="text-xs font-semibold text-white/60 uppercase px-4 mb-3">
                  Account
                </h3>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-red-600/20 hover:bg-red-600/30 transition-colors text-red-300 font-medium text-sm border border-red-500/30"
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </header>
  );
}
