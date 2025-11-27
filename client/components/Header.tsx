import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("customerId");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#030140] border-b border-white/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[50px]">
          {/* Left side - Login/Signup buttons (mobile) */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <User className="w-6 h-6 text-white" />
            </Link>
          </div>

          {/* Center - Logo and Brand */}
          <Link
            to="/"
            className="flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 hover:opacity-80 transition-opacity ml-0 sm:ml-0"
          >
            <div className="flex flex-col items-center sm:items-start">
              <div className="text-white font-bold text-xl">StickerHub</div>
              <div className="text-xs text-white/70">Custom Stickers</div>
            </div>
          </Link>

          {/* Right side - Navigation and buttons (desktop) */}
          <nav
            className={cn(
              "hidden lg:flex items-center gap-6 ml-12",
              "text-white text-sm font-medium",
            )}
          >
            <Link
              to="/products"
              className="hover:text-[#FFD713] transition-colors"
            >
              Shop
            </Link>
            <a
              href="#"
              className="flex items-center gap-1 hover:text-[#FFD713] transition-colors"
            >
              🔥 Hot Deals
            </a>
            <a href="#" className="hover:text-[#FFD713] transition-colors">
              Premium
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Shopping Cart */}
            <Link
              to="/cart"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-white" />
            </Link>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors font-medium"
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors font-medium"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 rounded-lg bg-[#FFD713] text-[#030140] hover:bg-[#FFD713]/90 transition-colors font-medium shadow-lg shadow-[#CfAF13]/50"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>

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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-white/20 bg-[#030140]/95 backdrop-blur-md">
            <div className="px-4 py-6 space-y-4">
              <Link
                to="/products"
                className="block text-white hover:text-[#FFD713] transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              <a
                href="#"
                className="block text-white hover:text-[#FFD713] transition-colors font-medium"
              >
                🔥 Hot Deals
              </a>
              <a
                href="#"
                className="block text-white hover:text-[#FFD713] transition-colors font-medium"
              >
                Premium
              </a>

              <div className="pt-4 border-t border-white/20 space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="block w-full px-4 py-2 rounded-lg border border-white/20 text-white text-center hover:bg-white/5 transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full px-4 py-2 rounded-lg border border-white/20 text-white text-center hover:bg-white/5 transition-colors font-medium"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block w-full px-4 py-2 rounded-lg border border-white/20 text-white text-center hover:bg-white/5 transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="block w-full px-4 py-2 rounded-lg bg-[#FFD713] text-[#030140] text-center hover:bg-[#FFD713]/90 transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
