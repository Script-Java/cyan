import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Search, Plus, Edit2, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import AdminSidebar from "@/components/AdminSidebar";
import MobileAdminPanel from "@/components/MobileAdminPanel";
import { Button } from "@/components/ui/button";

export default function AdminProducts() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(false);
  }, [navigate]);

  if (!isAuthenticated || isLoading) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 md:ml-64 min-h-screen bg-black text-white pb-20 md:pb-0">
          <div className="pt-6">
            {/* Header Section */}
            <div className="border-b border-white/10">
              <div className="px-6 lg:px-8 py-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                      <div className="p-2 bg-green-600/20 border border-green-500/30 rounded-lg">
                        <Package className="w-8 h-8 text-green-400" />
                      </div>
                      Products
                    </h1>
                    <p className="text-white/60 mt-2">
                      Manage your product catalog and inventory
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/admin/products/new")}
                    className="bg-green-600 hover:bg-green-700 text-white gap-2 font-medium rounded-lg px-4 py-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-6 lg:px-8 py-8">
              {/* Search Section */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Placeholder Content */}
              <div className="flex justify-center items-center h-96 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
                <div className="text-center">
                  <Package className="w-16 h-16 text-white/20 mx-auto mb-6" />
                  <p className="text-white font-medium mb-2">
                    No products yet
                  </p>
                  <p className="text-white/60 text-sm mb-6">
                    Click the "Add Product" button to get started
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700 text-white gap-2 font-medium rounded-lg px-6 py-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Product
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Admin Panel */}
        <MobileAdminPanel />
      </div>
    </>
  );
}
