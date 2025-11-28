import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  ChevronDown,
  LayoutGrid,
  Bookmark,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [storeCredit, setStoreCredit] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const adminStatus = localStorage.getItem("isAdmin") === "true";
    setIsAuthenticated(!!token);
    setIsAdmin(adminStatus);

    // Fetch store credit if authenticated
    if (token) {
      const fetchStoreCredit = async () => {
        try {
          console.log(
            "Fetching store credit with token:",
            token.substring(0, 20) + "...",
          );
          const response = await fetch("/api/customers/me/store-credit", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log("Store credit response status:", response.status);

          if (response.ok) {
            const data = await response.json();
            console.log("Store credit data:", data);
            setStoreCredit(data.storeCredit || 0);
          } else {
            const errorData = await response.json();
            console.error("Store credit fetch error:", errorData);
          }
        } catch (error) {
          console.error("Error fetching store credit:", error);
        }
      };

      fetchStoreCredit();
    }
  }, []);

  useEffect(() => {
    // Fetch cart count from cart data or BigCommerce
    const fetchCartCount = () => {
      try {
        const cartData = localStorage.getItem("cart");
        if (cartData) {
          const cart = JSON.parse(cartData);
          const count = cart.items ? cart.items.length : 0;
          setCartCount(count);
        }
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
    };

    fetchCartCount();

    // Listen for storage changes to update cart count in real-time
    const handleStorageChange = () => {
      fetchCartCount();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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
          <div className="flex items-center justify-between" style={{ margin: "-4px 0 -5px" }}>
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
            <div className="hidden md:flex items-center mr-6">
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

            {/* Mobile Cart Button (hidden on larger screens) */}
            <div className="md:hidden flex items-center">
              <Link
                to="/cart"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors relative"
              >
                <ShoppingCart className="w-6 h-6 text-white" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
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

              {/* Desktop Cart */}
              <Link
                to="/cart"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-2 relative"
                title="Shopping cart"
              >
                <ShoppingCart className="w-6 h-6 text-white" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
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
                alt="Sticker Shuttle Logo"
                className="h-8 object-contain"
              />
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Auth Buttons */}
            <nav className="space-y-2">
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
