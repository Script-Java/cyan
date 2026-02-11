import { useNavigate } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Eye,
  Users,
  Mail,
} from "lucide-react";

export default function MobileAdminPanel() {
  const navigate = useNavigate();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-40">
      <div className="grid grid-cols-5 gap-0 p-2">
        <button
          onClick={() => navigate("/admin")}
          className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-all text-xs font-medium"
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Dashboard</span>
        </button>
        <button
          onClick={() => navigate("/admin/orders")}
          className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-all text-xs font-medium"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-xs">Orders</span>
        </button>
        <button
          onClick={() => navigate("/admin/proofs")}
          className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-all text-xs font-medium"
        >
          <Eye className="w-5 h-5" />
          <span className="text-xs">Proofs</span>
        </button>
        <button
          onClick={() => navigate("/admin/customers")}
          className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-all text-xs font-medium"
        >
          <Users className="w-5 h-5" />
          <span className="text-xs">Customers</span>
        </button>
        <button
          onClick={() => navigate("/admin/support")}
          className="flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-all text-xs font-medium"
        >
          <Mail className="w-5 h-5" />
          <span className="text-xs">Support</span>
        </button>
      </div>
    </div>
  );
}
