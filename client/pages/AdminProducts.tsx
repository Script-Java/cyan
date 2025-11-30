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
        <main className="flex-1 md:ml-64 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 pb-20 md:pb-0">
          <div className="pt-6">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
              <div className="px-6 lg:px-8 py-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                        <Package className="w-8 h-8 text-white" />
                      </div>
                      Products
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Manage your product catalog and inventory
                    </p>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-6 lg:px-8 py-8">
              {/* Search Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Placeholder Content */}
              <div className="flex justify-center items-center h-96 bg-white rounded-xl border border-gray-200">
                <div className="text-center">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">
                    No products yet
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    Click the "Add Product" button to get started
                  </p>
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Product
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
