import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import AdminNavigationGrid from "@/components/AdminNavigationGrid";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AdminProduct {
  id: string;
  name: string;
  base_price: number;
  sku?: string;
  description?: string;
  availability: boolean;
  created_at: string;
  categories?: string[];
}

export default function AdminProducts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }

    setIsAuthenticated(true);
    fetchProducts(token);
  }, [navigate]);

  const fetchProducts = async (token: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setIsDeleting(productId);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts(products.filter((p) => p.id !== productId));
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="w-full pb-20 md:pb-0">
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

          {/* Navigation Grid - Desktop/Tablet Only */}
          <div className="hidden md:block border-b border-white/10 bg-black/50 backdrop-blur-sm">
            <div className="px-6 lg:px-8 py-6 sm:py-8">
              <h2 className="text-sm font-semibold text-white/80 mb-4">
                Quick Navigation
              </h2>
              <AdminNavigationGrid />
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
                    placeholder="Search products by name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition"
                  />
                </div>
              </div>
            </div>

            {/* Products List */}
            {isLoading ? (
              <div className="flex justify-center items-center h-96 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
                <div className="text-center">
                  <p className="text-white/60">Loading products...</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex justify-center items-center h-96 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
                <div className="text-center">
                  <Package className="w-16 h-16 text-white/20 mx-auto mb-6" />
                  <p className="text-white font-medium mb-2">
                    {searchQuery ? "No products found" : "No products yet"}
                  </p>
                  <p className="text-white/60 text-sm mb-6">
                    {searchQuery
                      ? "Try a different search query"
                      : 'Click the "Add Product" button to get started'}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() => navigate("/admin/products/new")}
                      className="bg-green-600 hover:bg-green-700 text-white gap-2 font-medium rounded-lg px-6 py-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Your First Product
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                        Product Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                        SKU
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-white/5 hover:bg-white/5 transition"
                      >
                        <td className="px-6 py-4 text-sm text-white">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-white/60">
                          {product.sku || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          {formatPrice(product.base_price)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              product.availability
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {product.availability ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/60">
                          {formatDate(product.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                navigate(`/admin/products/${product.id}/edit`)
                              }
                              className="text-blue-400 hover:text-blue-300 transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={isDeleting === product.id}
                              className="text-red-400 hover:text-red-300 transition disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
