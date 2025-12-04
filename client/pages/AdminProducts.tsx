import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Search, Plus, Edit2, Trash2, Eye } from "lucide-react";
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
      <main className="min-h-screen bg-black py-6">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Products</h1>
              <p className="text-white/60 mt-1">
                Manage your product catalog and inventory
              </p>
            </div>
            <Button
              onClick={() => navigate("/admin/products/new")}
              className="bg-green-600 hover:bg-green-700 text-white gap-2 font-medium rounded-lg px-3 py-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>

          {/* Quick Navigation */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white/80 mb-3">
              Quick Navigation
            </h2>
            <AdminNavigationGrid />
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
          </div>

          {/* Products List */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-white/5 border border-white/10 rounded-lg">
              <div className="text-white/60">Loading products...</div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white/5 border border-white/10 rounded-lg">
              <Package className="w-10 h-10 text-white/20 mb-3" />
              <p className="text-white font-medium mb-1">
                {searchQuery ? "No products found" : "No products yet"}
              </p>
              <p className="text-white/60 text-sm mb-3">
                {searchQuery
                  ? "Try a different search query"
                  : "Click the Add Product button to get started"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => navigate("/admin/products/new")}
                  className="bg-green-600 hover:bg-green-700 text-white gap-2 font-medium rounded text-sm px-3 py-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Product
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                <p className="text-sm font-semibold text-white">
                  Products
                  <span className="ml-2 text-xs font-normal text-white/60">
                    {filteredProducts.length}{" "}
                    {filteredProducts.length === 1 ? "item" : "items"}
                  </span>
                </p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-4 py-2 text-left font-semibold text-white/80 text-xs">
                        Product Name
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-white/80 text-xs hidden sm:table-cell">
                        SKU
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-white/80 text-xs">
                        Price
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-white/80 text-xs hidden md:table-cell">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-white/80 text-xs hidden lg:table-cell">
                        Created
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-white/80 text-xs">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-2.5 text-white text-sm">
                          {product.name}
                        </td>
                        <td className="px-4 py-2.5 text-white/60 text-sm hidden sm:table-cell">
                          {product.sku || "-"}
                        </td>
                        <td className="px-4 py-2.5 text-white text-sm font-medium">
                          {formatPrice(product.base_price)}
                        </td>
                        <td className="px-4 py-2.5 text-sm hidden md:table-cell">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              product.availability
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {product.availability ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-white/60 text-xs hidden lg:table-cell">
                          {formatDate(product.created_at)}
                        </td>
                        <td className="px-4 py-2.5 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                window.open(`/product-page/${product.id}`, "_blank")
                              }
                              className="text-green-400 hover:text-green-300 transition p-1"
                              title="Preview product page"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/admin/products/${product.id}/edit`)
                              }
                              className="text-blue-400 hover:text-blue-300 transition p-1"
                              title="Edit product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={isDeleting === product.id}
                              className="text-red-400 hover:text-red-300 transition disabled:opacity-50 p-1"
                              title="Delete product"
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
            </div>
          )}
        </div>
      </main>
    </AdminLayout>
  );
}
