import Header from "@/components/Header";
import { Star, ShoppingCart, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface Variation {
  id: string;
  price: number;
  image_url?: string;
  attributes?: { [key: string]: string };
}

interface Option {
  name: string;
  type: string;
  required: boolean;
  choices?: Array<{ text: string; markup?: string }>;
}

interface Product {
  id: string | number;
  name: string;
  price: number;
  min_price?: number;
  max_price?: number;
  image?: string;
  image_url?: string;
  rating?: number;
  reviews?: number;
  reviews_count?: number;
  description?: string;
  badge?: string;
  sku?: string;
  variations?: Variation[];
  options?: Option[];
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<
    string | number | null
  >(null);

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
        (product: any) => {
          const minPrice = product.min_price || product.price;
          const maxPrice = product.max_price || product.price;

          return {
            id: product.id,
            name: product.name,
            price: minPrice,
            min_price: minPrice,
            max_price: maxPrice,
            image: product.image_url || "/placeholder.svg",
            rating: product.rating || 0,
            reviews: product.reviews_count || 0,
            description:
              product.description ||
              "Premium sticker product from our collection",
            sku: product.sku,
            variations: product.variations || [],
            options: product.options || [],
          };
        },
      );

      if (formattedProducts.length === 0) {
        setProducts(getDefaultProducts());
      } else {
        setProducts(formattedProducts);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err instanceof Error ? err.message : "Failed to load products");
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
      description:
        "Durable vinyl stickers perfect for laptops and outdoor use.",
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

  const getPriceDisplay = (product: Product) => {
    if (
      product.min_price &&
      product.max_price &&
      product.min_price !== product.max_price
    ) {
      return `$${product.min_price.toFixed(2)} - $${product.max_price.toFixed(2)}`;
    }
    return `$${(product.price || 0).toFixed(2)}`;
  };

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Our Products
            </h1>
            <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
              Choose from our premium selection of stickers and customize them
              to your needs.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-white/60">Loading products...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && products.length === 0 && !isLoading && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 mb-8">
              <p className="text-red-300">Error: {error}</p>
              <button
                onClick={fetchProducts}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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
                  className="group rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 flex flex-col"
                >
                  {/* Product Image */}
                  <div className="relative bg-white/10 aspect-square overflow-hidden flex items-center justify-center">
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
                    <h3 className="font-bold text-white text-lg mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-sm text-white/60 mb-4 flex-grow line-clamp-2">
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
                                : "text-white/20"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-white/60">
                        {product.rating || 0} ({product.reviews || 0})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-sm text-white/60">from</span>
                      <p className="text-2xl font-bold text-white">
                        {getPriceDisplay(product)}
                      </p>
                    </div>

                    {/* Variations Info */}
                    {product.variations && product.variations.length > 1 && (
                      <button
                        onClick={() =>
                          setExpandedProduct(
                            expandedProduct === product.id ? null : product.id,
                          )
                        }
                        className="mb-4 flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View {product.variations.length} Options
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedProduct === product.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Link
                    to={`/product/${product.id}`}
                    className="mx-4 mb-4 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-300 text-center flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </Link>

                  {/* Expanded Variations */}
                  {expandedProduct === product.id &&
                    product.variations &&
                    product.variations.length > 0 && (
                      <div className="border-t border-white/10 p-4 bg-white/5 space-y-2">
                        <h4 className="font-semibold text-sm text-white mb-3">
                          Available Options:
                        </h4>
                        {product.variations.slice(0, 8).map((variation) => (
                          <div
                            key={variation.id}
                            className="flex items-center justify-between text-sm bg-white/10 rounded p-2 border border-white/10"
                          >
                            <div>
                              {variation.attributes &&
                              Object.keys(variation.attributes).length > 0 ? (
                                <div className="text-white/80">
                                  {Object.entries(variation.attributes)
                                    .map(([key, val]) => `${val}`)
                                    .join(" • ")}
                                </div>
                              ) : (
                                <span className="text-gray-700">
                                  {variation.id}
                                </span>
                              )}
                            </div>
                            <span className="font-semibold text-gray-900">
                              ${variation.price.toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {product.variations.length > 8 && (
                          <p className="text-xs text-gray-600 text-center pt-2">
                            + {product.variations.length - 8} more options
                          </p>
                        )}
                      </div>
                    )}
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
