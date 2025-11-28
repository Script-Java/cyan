import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import Header from "@/components/Header";

interface ProductOption {
  name: string;
  type: string;
  required: boolean;
  choices?: { text: string; priceModifier?: number }[];
}

interface ProductImage {
  id: number;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  description: string;
  options: ProductOption[];
  images: ProductImage[];
  defaultImage?: ProductImage;
}

export default function EcwidProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/ecwid-products/${productId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              `HTTP ${response.status}: Failed to fetch product`,
          );
        }

        const data = await response.json();
        setProduct(data);

        // Initialize selected options
        const initialOptions: Record<string, string> = {};
        data.options?.forEach((opt: ProductOption) => {
          if (opt.choices && opt.choices.length > 0) {
            initialOptions[opt.name] = opt.choices[0].text;
          }
        });
        setSelectedOptions(initialOptions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handlePrevImage = () => {
    if (product?.images) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + product.images.length) % product.images.length,
      );
    }
  };

  const handleNextImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const handleAddToCart = async () => {
    // TODO: Implement add to cart functionality
    console.log("Adding to cart:", {
      productId: product?.id,
      quantity,
      selectedOptions,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-24">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="animate-pulse">
              <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-24">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <button
              onClick={() => navigate("/ecwid-store")}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Store
            </button>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error || "Product not found"}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentImage =
    product.images[currentImageIndex] || product.defaultImage;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-24">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <button
            onClick={() => navigate("/ecwid-store")}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Store
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
                {currentImage && (
                  <img
                    src={currentImage.url}
                    alt={currentImage.alt || product.name}
                    className="w-full h-96 object-cover"
                  />
                )}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        idx === currentImageIndex
                          ? "border-blue-600"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.alt || "Thumbnail"}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info and Options */}
            <div>
              <h1 className="text-4xl font-bold mb-4 text-gray-900">
                {product.name}
              </h1>

              <div className="mb-8">
                <p className="text-3xl font-bold text-blue-600">
                  ${product.price.toFixed(2)}
                </p>
                {product.sku && (
                  <p className="text-sm text-gray-600 mt-2">
                    SKU: {product.sku}
                  </p>
                )}
              </div>

              {product.description && (
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Product Options in 4-Column Grid */}
              {product.options && product.options.length > 0 && (
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <h2 className="text-lg font-bold mb-6 text-gray-900">
                    Options
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {product.options.map((option) => (
                      <div key={option.name} className="flex flex-col gap-2">
                        <label className="font-semibold text-gray-900 text-sm">
                          {option.name}
                          {option.required && (
                            <span className="text-red-600 ml-1">*</span>
                          )}
                        </label>
                        {option.type === "select" && option.choices ? (
                          <select
                            value={selectedOptions[option.name] || ""}
                            onChange={(e) =>
                              setSelectedOptions({
                                ...selectedOptions,
                                [option.name]: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                          >
                            <option value="">Select {option.name}</option>
                            {option.choices.map((choice) => (
                              <option key={choice.text} value={choice.text}>
                                {choice.text}
                                {choice.priceModifier
                                  ? ` (+$${choice.priceModifier.toFixed(2)})`
                                  : ""}
                              </option>
                            ))}
                          </select>
                        ) : option.type === "radio" && option.choices ? (
                          <div className="space-y-2">
                            {option.choices.map((choice) => (
                              <label
                                key={choice.text}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="radio"
                                  name={option.name}
                                  value={choice.text}
                                  checked={
                                    selectedOptions[option.name] === choice.text
                                  }
                                  onChange={(e) =>
                                    setSelectedOptions({
                                      ...selectedOptions,
                                      [option.name]: e.target.value,
                                    })
                                  }
                                  className="w-4 h-4"
                                />
                                <span className="text-sm text-gray-700">
                                  {choice.text}
                                </span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={selectedOptions[option.name] || ""}
                            onChange={(e) =>
                              setSelectedOptions({
                                ...selectedOptions,
                                [option.name]: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                            placeholder={option.name}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-8 flex items-center gap-4">
                <label className="font-semibold text-gray-900">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-16 text-center py-2 outline-none"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg inline-flex items-center justify-center gap-2 transition"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
