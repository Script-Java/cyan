import Header from "@/components/Header";
import { Star, ShoppingCart, ChevronDown } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import ProductCategoryCard from "@/components/ProductCategoryCard";

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

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

export default function Products() {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<
    string | number | null
  >(null);

  const categories: Category[] = [
    {
      id: "vinyl",
      name: "Vinyl Stickers",
      description: "Durable vinyl stickers perfect for laptops and outdoor use",
      image: "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749593599/Alien_Rocket_mkwlag.png",
    },
    {
      id: "holographic",
      name: "Holographic Stickers",
      description: "Eye-catching holographic stickers that shimmer in the light",
      image: "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749593621/PurpleAlien_StickerShuttle_HolographicIcon_ukdotq.png",
    },
    {
      id: "glitter",
      name: "Glitter Stickers",
      description: "Add sparkle with vibrant glitter stickers",
      image: "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749593602/BlueAlien_StickerShuttle_GlitterIcon_rocwpi.png",
    },
    {
      id: "chrome",
      name: "Chrome Stickers",
      description: "Metallic chrome stickers for a premium look",
      image: "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749593680/yELLOWAlien_StickerShuttle_ChromeIcon_nut4el.png",
    },
    {
      id: "clear",
      name: "Clear Stickers",
      description: "Transparent stickers with vibrant full-color printing",
      image: "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749849590/StickerShuttle_ClearIcon_zxjnqc.svg",
    },
    {
      id: "sheets",
      name: "Sticker Sheets",
      description: "Get multiple stickers in one convenient sheet",
      image: "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749847809/StickerShuttle_StickerSheetsIcon_2_g61dty.svg",
    },
  ];

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

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) {
      return products;
    }
    return products.filter((product) => {
      const categoryMap: Record<string, string[]> = {
        vinyl: ["vinyl", "vinyl-stickers"],
        holographic: ["holographic", "holographic-stickers"],
        glitter: ["glitter", "glitter-stickers"],
        chrome: ["chrome", "chrome-stickers"],
        clear: ["clear", "clear-stickers"],
        sheets: ["sheet", "sticker-sheets"],
      };
      const categoryIds = categoryMap[selectedCategory] || [];
      return (
        categoryIds.some(
          (cat) =>
            product.id?.toString().toLowerCase().includes(cat) ||
            product.name?.toLowerCase().includes(selectedCategory) ||
            product.category?.toLowerCase().includes(selectedCategory)
        ) ||
        (selectedCategory === "vinyl" &&
          product.id?.toString().includes("vinyl")) ||
        (selectedCategory === "holographic" &&
          product.id?.toString().includes("holographic")) ||
        (selectedCategory === "glitter" && product.id?.toString().includes("glitter")) ||
        (selectedCategory === "chrome" && product.id?.toString().includes("chrome")) ||
        (selectedCategory === "clear" && product.id?.toString().includes("clear")) ||
        (selectedCategory === "sheets" && product.id?.toString().includes("sheet"))
      );
    });
  }, [products, selectedCategory]);

  const getCategoryItemCount = (categoryId: string): number => {
    const categoryMap: Record<string, string[]> = {
      vinyl: ["vinyl", "vinyl-stickers"],
      holographic: ["holographic", "holographic-stickers"],
      glitter: ["glitter", "glitter-stickers"],
      chrome: ["chrome", "chrome-stickers"],
      clear: ["clear", "clear-stickers"],
      sheets: ["sheet", "sticker-sheets"],
    };
    const categoryIds = categoryMap[categoryId] || [];
    return products.filter((product) =>
      categoryIds.some(
        (cat) =>
          product.id?.toString().toLowerCase().includes(cat) ||
          product.name?.toLowerCase().includes(categoryId)
      )
    ).length;
  };

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8">
          {/* Category Section */}
          {!selectedCategory && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-1 text-center">
                CHOOSE{" "}
                <span className="inline-block text-black px-2 py-0.5 rounded font-bold text-lg" style={{ backgroundColor: "#FFD713" }}>
                  STICKER
                </span>
              </h2>
              <p className="text-center text-white/60 mb-8 text-sm">TYPE:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                {categories.map((category) => (
                  <ProductCategoryCard
                    key={category.id}
                    id={category.id}
                    name={category.name}
                    description={category.description}
                    image={category.image}
                    itemCount={getCategoryItemCount(category.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Category Filter Indicator */}
          {selectedCategory && (
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {categories.find((c) => c.id === selectedCategory)?.name ||
                    "Products"}
                </h2>
                <p className="text-white/60 mt-0.5 text-xs">
                  {filteredProducts.length} product
                  {filteredProducts.length !== 1 ? "s" : ""} available
                </p>
              </div>
              <Link
                to="/products"
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-xs font-medium whitespace-nowrap"
              >
                View All
              </Link>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-white/60 text-sm">Loading products...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && products.length === 0 && !isLoading && (
            <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-200 text-sm">Error: {error}</p>
              <button
                onClick={fetchProducts}
                className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs"
              >
                Try Again
              </button>
            </div>
          )}

          {/* No Products Found */}
          {!isLoading && selectedCategory && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/60 text-sm mb-4">
                No products found in this category.
              </p>
              <Link
                to="/products"
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm"
              >
                View All Categories
              </Link>
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group rounded-lg overflow-hidden bg-white/5 hover:bg-white/10 transition-all duration-300 flex flex-col"
                >
                  {/* Product Image */}
                  <div className="relative bg-white/10 aspect-square overflow-hidden flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.badge && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                        {product.badge}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3 flex flex-col flex-grow">
                    <h3 className="font-bold text-white text-sm mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-xs text-white/60 mb-2 flex-grow line-clamp-2">
                      {product.description}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
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
                    <div className="mb-2">
                      <span className="text-xs text-white/60">from</span>
                      <p className="text-lg font-bold text-white">
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
                        className="mb-2 flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View {product.variations.length} Options
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${
                            expandedProduct === product.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Link
                    to={`/product/${product.id}`}
                    className="mx-3 mb-3 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-300 text-center flex items-center justify-center gap-1 text-xs"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    Add to Cart
                  </Link>

                  {/* Expanded Variations */}
                  {expandedProduct === product.id &&
                    product.variations &&
                    product.variations.length > 0 && (
                      <div className="p-2 bg-white/5 space-y-1">
                        <h4 className="font-semibold text-xs text-white mb-2">
                          Options:
                        </h4>
                        {product.variations.slice(0, 8).map((variation) => (
                          <div
                            key={variation.id}
                            className="flex items-center justify-between text-xs bg-white/10 rounded p-1.5"
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
                                <span className="text-white/60">
                                  {variation.id}
                                </span>
                              )}
                            </div>
                            <span className="font-semibold text-white">
                              ${variation.price.toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {product.variations.length > 8 && (
                          <p className="text-xs text-white/40 text-center pt-1">
                            +{product.variations.length - 8} more
                          </p>
                        )}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-2">
              Can't find what you're looking for?
            </h2>
            <p className="text-sm text-white/80 mb-4">
              Contact our team for custom bulk orders and special requests.
            </p>
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all text-sm">
              Get a Quote
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
