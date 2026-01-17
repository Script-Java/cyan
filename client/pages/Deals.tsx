import Header from "@/components/Header";
import { Star, ShoppingCart, ArrowRight } from "lucide-react";
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
  category?: string;
  variations?: Variation[];
  options?: Option[];
}

export default function Deals() {
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

      const response = await fetch("/api/storefront/products?limit=100");
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
      description: "Perfect for testing Square checkout integration.",
      badge: "Deal",
    },
    {
      id: "vinyl-stickers",
      name: "Vinyl Stickers",
      price: 0.25,
      image: "/placeholder.svg",
      rating: 4.8,
      reviews: 234,
      description: "Durable vinyl stickers for any surface.",
      badge: "Deal",
    },
    {
      id: "die-cut-stickers",
      name: "Die-Cut Stickers",
      price: 0.3,
      image: "/placeholder.svg",
      rating: 4.9,
      reviews: 189,
      description: "Custom-cut stickers with any shape.",
      badge: "Hot",
    },
    {
      id: "holographic-stickers",
      name: "Holographic Stickers",
      price: 0.45,
      image: "/placeholder.svg",
      rating: 4.9,
      reviews: 156,
      description: "Eye-catching holographic effect.",
      badge: "Deal",
    },
    {
      id: "clear-stickers",
      name: "Clear Stickers",
      price: 0.2,
      image: "/placeholder.svg",
      rating: 4.7,
      reviews: 198,
      description: "Transparent stickers vibrant colors.",
      badge: "Deal",
    },
    {
      id: "glitter-stickers",
      name: "Glitter Stickers",
      price: 0.35,
      image: "/placeholder.svg",
      rating: 4.6,
      reviews: 145,
      description: "Add sparkle with glitter finish.",
      badge: "Hot",
    },
    {
      id: "chrome-stickers",
      name: "Chrome Stickers",
      price: 0.5,
      image: "/placeholder.svg",
      rating: 4.8,
      reviews: 167,
      description: "Metallic chrome premium look.",
      badge: "Deal",
    },
    {
      id: "sticker-sheets",
      name: "Sticker Sheets",
      price: 2.5,
      image: "/placeholder.svg",
      rating: 4.7,
      reviews: 203,
      description: "Multiple stickers in one sheet.",
      badge: "Popular",
    },
    {
      id: "matte-stickers",
      name: "Matte Stickers",
      price: 0.28,
      image: "/placeholder.svg",
      rating: 4.6,
      reviews: 112,
      description: "Subtle matte finish stickers.",
      badge: "Deal",
    },
    {
      id: "waterproof-stickers",
      name: "Waterproof Stickers",
      price: 0.4,
      image: "/placeholder.svg",
      rating: 4.9,
      reviews: 178,
      description: "Perfect for outdoor use.",
      badge: "Deal",
    },
    {
      id: "metallic-stickers",
      name: "Metallic Stickers",
      price: 0.55,
      image: "/placeholder.svg",
      rating: 4.7,
      reviews: 134,
      description: "Shiny metallic finish stickers.",
      badge: "Hot",
    },
    {
      id: "bubble-free-stickers",
      name: "Bubble-Free Stickers",
      price: 0.32,
      image: "/placeholder.svg",
      rating: 4.8,
      reviews: 191,
      description: "Easy application bubble-free.",
      badge: "Deal",
    },
    {
      id: "eco-stickers",
      name: "Eco-Friendly Stickers",
      price: 0.45,
      image: "/placeholder.svg",
      rating: 4.6,
      reviews: 98,
      description: "Sustainable eco-friendly option.",
      badge: "Green",
    },
    {
      id: "uv-resistant-stickers",
      name: "UV-Resistant Stickers",
      price: 0.42,
      image: "/placeholder.svg",
      rating: 4.8,
      reviews: 156,
      description: "Sun-proof UV-resistant stickers.",
      badge: "Deal",
    },
    {
      id: "bumper-stickers",
      name: "Bumper Stickers",
      price: 0.75,
      image: "/placeholder.svg",
      rating: 4.7,
      reviews: 142,
      description: "Large format bumper stickers.",
      badge: "Deal",
    },
    {
      id: "kiss-cut-stickers",
      name: "Kiss-Cut Stickers",
      price: 0.38,
      image: "/placeholder.svg",
      rating: 4.9,
      reviews: 167,
      description: "Kiss-cut individual stickers.",
      badge: "Popular",
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

  const getBadgeColor = (badge?: string) => {
    switch (badge?.toLowerCase()) {
      case "hot":
        return "bg-red-600";
      case "deal":
        return "bg-green-600";
      case "green":
        return "bg-emerald-600";
      case "popular":
        return "bg-blue-600";
      default:
        return "bg-blue-600";
    }
  };

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-white text-gray-900">
        <div className="max-w-full mx-auto px-2 sm:px-3 lg:px-4" style={{ padding: "16px 16px 50px" }}>
          {/* Header Section */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Deals &amp; Offers
            </h1>
            <p className="text-sm text-gray-600">Discover our best deals on premium stickers</p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-gray-600 text-sm">Loading deals...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && products.length === 0 && !isLoading && (
            <div className="bg-red-100 border border-red-400 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">Error: {error}</p>
              <button
                onClick={fetchProducts}
                className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Deals Grid - Slim layout with 5-6 columns for 4 rows */}
          {!isLoading && products.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group rounded-lg overflow-hidden bg-gray-100 hover:bg-gray-200 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Product Image */}
                  <div className="relative bg-gray-200 aspect-square overflow-hidden flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                    {product.badge && (
                      <div
                        className={`absolute top-1 right-1 ${getBadgeColor(product.badge)} text-white px-1.5 py-0.5 rounded text-xs font-bold`}
                      >
                        {product.badge}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-1.5 flex flex-col flex-grow">
                    <h3 className="font-bold text-gray-900 text-xs mb-0.5 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-0.5 mb-1">
                      <div className="flex gap-0.25">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-2.5 h-2.5 ${
                              i < Math.floor(product.rating || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        {product.reviews || 0}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-1">
                      <p className="text-sm font-bold text-gray-900">
                        {getPriceDisplay(product)}
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    to={`/product/${product.id}`}
                    className="mx-1 mb-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-center flex items-center justify-center gap-0.5 text-xs font-semibold transition-all"
                  >
                    <ShoppingCart className="w-2.5 h-2.5" />
                    Cart
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Explore All Section */}
          <div className="mt-8 text-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all text-sm"
            >
              Explore All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Footer */}
          <div
            style={{
              fontWeight: "400",
              textAlign: "left",
              paddingTop: "40px",
              fontSize: "12px",
              color: "rgba(0, 0, 0, 0.5)",
            }}
          >
            Built with ❤️ by © Sticky Slap LLC
          </div>
        </div>
      </main>
    </>
  );
}
