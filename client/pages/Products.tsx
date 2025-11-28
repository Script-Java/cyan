import Header from "@/components/Header";
import { Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface Product {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  image_url?: string;
  rating?: number;
  reviews?: number;
  reviews_count?: number;
  description?: string;
  badge?: string;
  sku?: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/imported-products?limit=100");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      const formattedProducts: Product[] = (data.items || []).map(
        (product: any) => ({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          image: product.image_url || "/placeholder.svg",
          rating: product.rating || 0,
          reviews: product.reviews_count || 0,
          description:
            product.description || "Premium sticker product from our collection",
          sku: product.sku,
        }),
      );

      if (formattedProducts.length === 0) {
        setProducts(getDefaultProducts());
      } else {
        setProducts(formattedProducts);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load products",
      );
      setProducts(getDefaultProducts());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultProducts = (): Product[] => [
    {
      id: "test-square-product",
      name: "Test Square Product",
      price: 1.0,
      image: "/placeholder.svg",
      rating: 5.0,
      reviews: 1,
      description:
        "Perfect for testing Square checkout integration. $1.00 product.",
      badge: "Test",
    },
    {
      id: "vinyl-stickers",
      name: "Vinyl Stickers",
      price: 0.25,
      image: "/placeholder.svg",
      rating: 4.8,
      reviews: 234,
      description: "Durable vinyl stickers perfect for laptops and outdoor use.",
      badge: "Popular",
    },
    {
      id: "die-cut-stickers",
      name: "Die-Cut Stickers",
      price: 0.3,
      image: "/placeholder.svg",
      rating: 4.9,
      reviews: 189,
      description: "Custom-cut stickers with any shape you design.",
      badge: "Premium",
    },
    {
      id: "holographic-stickers",
      name: "Holographic Stickers",
      price: 0.45,
      image: "/placeholder.svg",
      rating: 4.9,
      reviews: 156,
      description:
        "Eye-catching holographic stickers that shimmer in the light.",
      badge: "Trending",
    },
    {
      id: "clear-stickers",
      name: "Clear Stickers",
      price: 0.2,
      image: "/placeholder.svg",
      rating: 4.7,
      reviews: 198,
      description: "Transparent stickers with vibrant full-color printing.",
      badge: "Budget",
    },
  ];

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-[#030140] mb-4">
              Our Products
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Choose from our premium selection of stickers and customize them
              to your needs.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && products.length === 0 && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <p className="text-red-800">Error: {error}</p>
              <button
                onClick={fetchProducts}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group rounded-lg overflow-hidden bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Product Image */}
                  <div className="relative bg-gray-100 aspect-square overflow-hidden flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.badge && (
                      <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {product.badge}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 flex-grow">
                      {product.description}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(product.rating || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        {product.rating || 0} ({product.reviews || 0})
                      </span>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-gray-600">from</span>
                        <p className="text-2xl font-bold text-gray-900">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                      <Link
                        to={`/product/${product.id}`}
                        className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 group-hover:shadow-lg"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    to={`/product/${product.id}`}
                    className="mx-4 mb-4 py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 text-center"
                  >
                    Customize
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Contact our team for custom bulk orders and special requests.
            </p>
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-all">
              Get a Quote
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
