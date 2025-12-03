import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AdminNavbar from "@/components/AdminNavbar";
import {
  Home,
  ShoppingCart,
  Eye,
  Package,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavLink {
  label: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();

  const navLinks: NavLink[] = [
    {
      label: "Home",
      description: "Dashboard overview",
      icon: <Home className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: "/admin",
      color: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30",
    },
    {
      label: "Orders",
      description: "View order history",
      icon: <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: "/admin/orders",
      color: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30",
    },
    {
      label: "Proofs",
      description: "Review designs",
      icon: <Eye className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: "/admin/proofs",
      color: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30",
    },
    {
      label: "Products",
      description: "Manage products",
      icon: <Package className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: "/admin/products",
      color: "bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/30",
    },
    {
      label: "Customers",
      description: "Manage customers",
      icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: "/admin/customers",
      color: "bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/30",
    },
    {
      label: "Finance",
      description: "View spending",
      icon: <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: "/admin/finance",
      color: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30",
    },
    {
      label: "Analytics",
      description: "View analytics",
      icon: <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: "/admin/analytics",
      color: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30",
    },
    {
      label: "Settings",
      description: "Manage account",
      icon: <Settings className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: "/admin/settings",
      color: "bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/30",
    },
    {
      label: "Logout",
      description: "End session",
      icon: <LogOut className="w-6 h-6 sm:w-8 sm:h-8" />,
      path: "#logout",
      color: "bg-red-500/10 hover:bg-red-500/20 border-red-500/30",
    },
  ];

  const handleNavigate = (link: NavLink) => {
    if (link.path === "#logout") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("isAdmin");
      navigate("/login");
    } else {
      navigate(link.path);
    }
  };

  return (
    <>
      <Header />
      <AdminNavbar />
      <div className="min-h-screen bg-black text-white">
        {children}
      </div>

      {/* Admin Navigation Grid - Floating on all pages */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 flex items-center justify-center transition-all duration-300 group"
          title="Navigation menu"
        >
          <div className="text-xl">≡</div>

          {/* Hover Menu */}
          <div className="absolute bottom-20 right-0 bg-black/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl p-4 hidden group-hover:block min-w-max max-w-md">
            <div className="grid grid-cols-2 gap-3">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavigate(link)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200 text-center",
                    "hover:scale-105 active:scale-95",
                    link.color,
                  )}
                >
                  <div className="text-emerald-400">{link.icon}</div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {link.label}
                    </p>
                    <p className="text-xs text-white/60">{link.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </button>
      </div>
    </>
  );
}
