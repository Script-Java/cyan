import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AdminNavbar from "@/components/AdminNavbar";
import AdminNavigationGrid from "@/components/AdminNavigationGrid";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
  showNavGrid?: boolean;
}

export default function AdminLayout({
  children,
  showNavGrid = true,
}: AdminLayoutProps) {
  const navigate = useNavigate();
  const [showMobileNav, setShowMobileNav] = useState(false);

  return (
    <>
      <Header />
      <AdminNavbar />
      <div className="flex min-h-screen bg-black text-white">
        {/* Sidebar Navigation for desktop */}
        <aside className="hidden lg:block w-80 border-r border-white/10 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Navigation</h2>
            <AdminNavigationGrid />
          </div>
        </aside>

        {/* Mobile Navigation Toggle */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className={cn(
              "w-14 h-14 rounded-full backdrop-blur-md border transition-all duration-300 flex items-center justify-center",
              showMobileNav
                ? "bg-red-500/20 border-red-500/30 text-red-400"
                : "bg-white/10 border-white/20 hover:bg-white/20 text-white",
            )}
          >
            {showMobileNav ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Mobile Navigation Overlay */}
          {showMobileNav && (
            <>
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setShowMobileNav(false)}
              />
              <div className="fixed bottom-24 right-6 bg-black/95 border border-white/10 rounded-lg p-4 shadow-2xl z-40 max-w-sm">
                <AdminNavigationGrid />
              </div>
            </>
          )}
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </>
  );
}
