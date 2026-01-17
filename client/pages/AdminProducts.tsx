import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Package, Search, Plus, Edit2, Trash2, Eye, Download } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import AdminNavigationGrid from "@/components/AdminNavigationGrid";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { importAdminProduct, STICKY_SLAP_STICKER_PRODUCT, TWO_INCH_STICKERS_PRODUCT, FOUR_INCH_PROMO_STICKER_PRODUCT, THOUSAND_STICKERS_PROMO_PRODUCT, THREE_INCH_100_STICKERS_PRODUCT } from "@/lib/import-product";

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
  const [isImporting, setIsImporting] = useState(false);
  const [importMenuOpen, setImportMenuOpen] = useState(false);

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

  const handleImportProduct = async (product: any) => {
    setIsImporting(true);
    setImportMenuOpen(false);
    try {
      const result = await importAdminProduct(product);
      toast({
        title: "Success",
        description: `Product "${result.product.name}" imported successfully`,
      });
      // Refresh products list
      const token = localStorage.getItem("authToken");
      if (token) {
        fetchProducts(token);
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to import product",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <main className="min-h-screen bg-[#fafafa] py-6 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-1">
                Manage your product catalog and inventory
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Button
                  onClick={() => setImportMenuOpen(!importMenuOpen)}
                  disabled={isImporting}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium rounded-lg px-4 py-2 text-sm disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isImporting ? "Importing..." : "Import Product"}
                </Button>
                {importMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <button
                      onClick={() => handleImportProduct(TWO_INCH_STICKERS_PRODUCT)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-200"
                    >
                      <div className="font-semibold text-gray-900">2 INCH - 100 CUSTOM STICKERS</div>
                      <div className="text-xs text-gray-600 mt-1">SKU: 00003 • Price: $0.17</div>
                    </button>
                    <button
                      onClick={() => handleImportProduct(THREE_INCH_100_STICKERS_PRODUCT)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-200"
                    >
                      <div className="font-semibold text-gray-900">3'' INCH - 100 STICKERS</div>
                      <div className="text-xs text-gray-600 mt-1">SKU: 00007 • Price: $17.00</div>
                    </button>
                    <button
                      onClick={() => handleImportProduct(FOUR_INCH_PROMO_STICKER_PRODUCT)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-200"
                    >
                      <div className="font-semibold text-gray-900">4'' INCH - CUSTOM STICKER PROMO</div>
                      <div className="text-xs text-gray-600 mt-1">Price: $0.40</div>
                    </button>
                    <button
                      onClick={() => handleImportProduct(THOUSAND_STICKERS_PROMO_PRODUCT)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-200"
                    >
                      <div className="font-semibold text-gray-900">1000 STICKERS PROMO</div>
                      <div className="text-xs text-gray-600 mt-1">SKU: 00006 • Price: $60.00</div>
                    </button>
                    <button
                      onClick={() => handleImportProduct(STICKY_SLAP_STICKER_PRODUCT)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50"
                    >
                      <div className="font-semibold text-gray-900">CREATE A STICKER</div>
                      <div className="text-xs text-gray-600 mt-1">SKU: 00004 • Price: $0.00</div>
                    </button>
                  </div>
                )}
              </div>
              <Button
                onClick={() => navigate("/admin/products/new")}
                className="bg-green-600 hover:bg-green-700 text-white gap-2 font-medium rounded-lg px-4 py-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Quick Navigation
            </h2>
            <AdminNavigationGrid />
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
          </div>

          {/* Products List */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-white border border-gray-200 rounded-lg">
              <div className="text-gray-600">Loading products...</div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white border border-gray-200 rounded-lg">
              <Package className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-900 font-medium mb-1">
                {searchQuery ? "No products found" : "No products yet"}
              </p>
              <p className="text-gray-600 text-sm mb-4">
                {searchQuery
                  ? "Try a different search query"
                  : "Click the Add Product button to get started"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => navigate("/admin/products/new")}
                  className="bg-green-600 hover:bg-green-700 text-white gap-2 font-medium rounded-lg text-sm px-4 py-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Product
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                <p className="text-sm font-semibold text-gray-900">
                  Products
                  <span className="ml-3 text-xs font-normal text-gray-600">
                    {filteredProducts.length}{" "}
                    {filteredProducts.length === 1 ? "item" : "items"}
                  </span>
                </p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 text-xs">
                        Product Name
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 text-xs hidden sm:table-cell">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 text-xs">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 text-xs hidden md:table-cell">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 text-xs hidden lg:table-cell">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 text-xs">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-900 text-sm font-medium">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm hidden sm:table-cell">
                          {product.sku || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-900 text-sm font-medium">
                          {formatPrice(product.base_price)}
                        </td>
                        <td className="px-6 py-4 text-sm hidden md:table-cell">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                              product.availability
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.availability ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-xs hidden lg:table-cell">
                          {formatDate(product.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                window.open(
                                  `/product-page/${product.id}`,
                                  "_blank",
                                )
                              }
                              className="text-green-600 hover:text-green-700 transition p-1"
                              title="Preview product page"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/admin/products/${product.id}/edit`)
                              }
                              className="text-blue-600 hover:text-blue-700 transition p-1"
                              title="Edit product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={isDeleting === product.id}
                              className="text-red-600 hover:text-red-700 transition disabled:opacity-50 p-1"
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
