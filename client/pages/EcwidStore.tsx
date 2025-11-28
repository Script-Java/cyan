import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { ShoppingCart, Star } from "lucide-react";

interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  description: string;
  defaultImage?: {
    id: number;
    url: string;
    alt?: string;
  };
  images: Array<{
    id: number;
    url: string;
    alt?: string;
  }>;
}

export default function EcwidStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/ecwid-products?limit=20", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP ${response.status}: Failed to fetch products`
          );
        }

        const data = await response.json();
        setProducts(data.items || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        const errorMsg =
          err instanceof Error ? err.message : "Failed to load products";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="pt-24">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">
              Featured Products
            </h1>
            <p className="text-lg text-gray-600">
              Browse our complete collection of stickers and products
            </p>
          </div>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products found</p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/ecwid-product/${product.id}`}
                  className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                >
                  {/* Product Image */}
                  <div className="relative bg-gray-100 aspect-square overflow-hidden">
                    {product.defaultImage ? (
                      <img
                        src={product.defaultImage.url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      FREE SHIPPING
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                      {product.name}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                      </p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          console.log("Add to cart:", product.id);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
                        title="Add to cart"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
