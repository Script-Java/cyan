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
      image:
        "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749593599/Alien_Rocket_mkwlag.png",
    },
    {
      id: "holographic",
      name: "Holographic Stickers",
      description:
        "Eye-catching holographic stickers that shimmer in the light",
      image:
        "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749593621/PurpleAlien_StickerShuttle_HolographicIcon_ukdotq.png",
    },
    {
      id: "glitter",
      name: "Glitter Stickers",
      description: "Add sparkle with vibrant glitter stickers",
      image:
        "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749593602/BlueAlien_StickerShuttle_GlitterIcon_rocwpi.png",
    },
    {
      id: "chrome",
      name: "Chrome Stickers",
      description: "Metallic chrome stickers for a premium look",
      image:
        "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749593680/yELLOWAlien_StickerShuttle_ChromeIcon_nut4el.png",
    },
    {
      id: "clear",
      name: "Clear Stickers",
      description: "Transparent stickers with vibrant full-color printing",
      image:
        "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749849590/StickerShuttle_ClearIcon_zxjnqc.svg",
    },
    {
      id: "sheets",
      name: "Sticker Sheets",
      description: "Get multiple stickers in one convenient sheet",
      image:
        "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749847809/StickerShuttle_StickerSheetsIcon_2_g61dty.svg",
    },
  ];

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
            category: product.group,
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
            product.category?.toLowerCase().includes(selectedCategory),
        ) ||
        (selectedCategory === "vinyl" &&
          product.id?.toString().includes("vinyl")) ||
        (selectedCategory === "holographic" &&
          product.id?.toString().includes("holographic")) ||
        (selectedCategory === "glitter" &&
          product.id?.toString().includes("glitter")) ||
        (selectedCategory === "chrome" &&
          product.id?.toString().includes("chrome")) ||
        (selectedCategory === "clear" &&
          product.id?.toString().includes("clear")) ||
        (selectedCategory === "sheets" &&
          product.id?.toString().includes("sheet"))
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
          product.name?.toLowerCase().includes(categoryId),
      ),
    ).length;
  };

  return (
    <>
      <Header />
      <main className="pt-16 bg-white text-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Category Section */}
          {!selectedCategory && (
            <div className="mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold text-center mb-2">
                Shop Our Premium
                <span className="block bg-gradient-to-r from-[#FFD713] to-[#FFA500] bg-clip-text text-transparent">
                  Sticker Collection
                </span>
              </h1>
              <p className="text-center text-gray-600 text-lg mb-8">
                Choose from our wide range of high-quality stickers
              </p>

              {/* Category Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.id}`}
                    className="group text-center hover:opacity-80 transition-opacity"
                  >
                    <div className="bg-gray-100 rounded-lg p-4 mb-3 group-hover:bg-gray-200 transition-colors h-32 flex items-center justify-center overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 mb-1">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {getCategoryItemCount(category.id)} items
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter Indicator */}
          {selectedCategory && (
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {categories.find((c) => c.id === selectedCategory)?.name ||
                    "Products"}
                </h2>
                <p className="text-gray-600 mt-1">
                  {filteredProducts.length} product
                  {filteredProducts.length !== 1 ? "s" : ""} available
                </p>
              </div>
              <Link
                to="/products"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-sm font-medium whitespace-nowrap text-gray-900"
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
                <p className="text-gray-600 text-sm">Loading products...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && products.length === 0 && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">Error: {error}</p>
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
              <p className="text-gray-600 text-sm mb-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group rounded-lg overflow-hidden bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 flex flex-col shadow-sm hover:shadow-md"
                >
                  {/* Product Image */}
                  <div className="relative bg-gray-100 aspect-square overflow-hidden flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.badge && (
                      <div className="absolute top-3 right-3 bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                        {product.badge}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3 flex flex-col flex-grow">
                    <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-xs text-gray-600 mb-2 flex-grow line-clamp-2">
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
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        {product.rating || 0} ({product.reviews || 0})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-3">
                      <span className="text-xs text-gray-600">from</span>
                      <p className="text-lg font-bold text-gray-900">
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
                        className="mb-2 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
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
                      <div className="p-3 bg-gray-50 border-t border-gray-200 space-y-1">
                        <h4 className="font-semibold text-xs text-gray-900 mb-2">
                          Options:
                        </h4>
                        {product.variations.slice(0, 8).map((variation) => (
                          <div
                            key={variation.id}
                            className="flex items-center justify-between text-xs bg-white border border-gray-200 rounded p-1.5"
                          >
                            <div>
                              {variation.attributes &&
                              Object.keys(variation.attributes).length > 0 ? (
                                <div className="text-gray-800">
                                  {Object.entries(variation.attributes)
                                    .map(([key, val]) => `${val}`)
                                    .join(" • ")}
                                </div>
                              ) : (
                                <span className="text-gray-600">
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
                          <p className="text-xs text-gray-500 text-center pt-1">
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
          <div
            className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg text-center mt-12 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Can't find what you're looking for?
            </h2>
            <p className="text-gray-700 text-sm mb-4 max-w-2xl mx-auto">
              Contact our team for custom bulk orders and special requests.
            </p>
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all text-sm">
              Get a Quote
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer
        className="bg-white text-gray-600 border-t border-gray-200"
        style={{ padding: "32px 0" }}
      >
        <div
          className="mx-auto px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: "1100px" }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
            <div>
              <h4 className="font-bold text-gray-900 mb-3 text-sm">Shop</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/products?category=vinyl" className="hover:text-gray-900 transition-colors">
                    Vinyl Stickers
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=holographic" className="hover:text-gray-900 transition-colors">
                    Holographic
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=chrome" className="hover:text-gray-900 transition-colors">
                    Chrome
                  </Link>
                </li>
                <li>
                  <Link to="/deals" className="hover:text-gray-900 transition-colors">
                    Deals
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <Link to="/blogs" className="hover:text-gray-900 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="hover:text-gray-900 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="/privacy" className="hover:text-gray-900 transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-gray-900 transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <Link to="/return-refund-policy" className="hover:text-gray-900 transition-colors">
                    Returns
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3 text-sm">Follow</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    TikTok
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 text-center text-xs">
            <p>Built with ❤️ by © Sticky Slap LLC</p>
          </div>
        </div>
      </footer>
    </>
  );
}
