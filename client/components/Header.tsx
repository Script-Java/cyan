import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  ChevronDown,
  LayoutGrid,
  Bookmark,
  BarChart3,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoreCredit } from "@/hooks/useStoreCredit";

const ECWID_STORE_ID = "120154275";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const ecwidScriptLoaded = useRef(false);
  const { storeCredit, fetchStoreCredit } = useStoreCredit();

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
  }, [fetchStoreCredit]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("customerId");
    setIsAuthenticated(false);
    setIsProfileMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-md text-white border-b border-white/10">
      <div className="mx-auto px-4 pt-0.5 pb-0">
        <div className="max-w-7xl mx-auto">
          <div
            className="flex items-center justify-between"
            style={{ margin: "-4px 0 -5px" }}
          >
            {/* Mobile Profile Button */}
            <div className="flex md:hidden items-center">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F1e00ee8c48924560b1c928d354e4521b%2Ff84956aaeddb4872bf448e0f5fbc3371?format=webp&width=800"
                  alt="Profile"
                  className="w-10 h-10 rounded-full border border-white/20"
                />
                <ChevronDown className="w-4 h-4" />
              </button>
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

            {/* Mobile/Tablet Centered Logo */}
            <div className="md:hidden absolute left-1/2 transform -translate-x-1/2">
              <Link to="/" className="flex items-center">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F1e00ee8c48924560b1c928d354e4521b%2F6def69979e504acebe0ba665997a2501?format=webp&width=800"
                  alt="Sticky Logo"
                  className="h-10 object-contain"
                />
              </Link>
            </div>

            {/* Mobile Cart Widget (hidden on larger screens) */}
            <div className="md:hidden flex items-center">
              <div className="ec-cart-widget"></div>
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
              {isAuthenticated && (
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-yellow-500/40 bg-gradient-to-br from-yellow-500/30 to-yellow-600/10 font-medium text-sm"
                  title="Store credit from your BigCommerce account"
                >
                  <img
                    src="https://res.cloudinary.com/dxcnvqk6b/image/upload/v1753923671/StickerShuttle_CoinIcon_aperue.png"
                    alt="Credits"
                    className="w-5 h-5"
                  />
                  <span className="text-yellow-300">
                    $ {storeCredit.toFixed(2)}
                  </span>
                </div>
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

              {/* Desktop Cart Widget */}
              <div className="ml-2">
                <div className="ec-cart-widget"></div>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
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
        <div className="fixed top-0 left-0 h-full w-80 bg-[#030140]/95 border-r border-white/20 backdrop-blur-md z-40 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <img
                src="https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749591683/White_Logo_ojmn3s.png"
                alt="Sticky Slap Logo"
                className="h-8 object-contain"
              />
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

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
                </>
              )}

              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white font-medium text-sm border border-white/20"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="w-5 h-5"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white font-medium text-sm border border-white/20"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="w-5 h-5"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Signup
                  </Link>
                </>
              )}
            </nav>
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
