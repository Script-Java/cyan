import Header from "@/components/Header";
import BcConfigurator from "@/components/BcConfigurator";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Star, AlertCircle, Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ProductData {
  id: number;
  name: string;
  description?: string;
  price?: number;
  image_url?: string;
  weight?: number;
  type?: string;
  status?: string;
  options?: any[];
}

// BigCommerce product ID mapping
const PRODUCT_ID_MAP: Record<string, number> = {
  "custom-stickers": 112,
  "vinyl-stickers": 112,
  "die-cut-stickers": 112,
  "holographic-stickers": 112,
  "chrome-stickers": 112,
  "glitter-stickers": 112,
};

// Mock product data for testing (non-BigCommerce products)
const MOCK_PRODUCTS: Record<string, ProductData> = {
  "test-square-product": {
    id: 999,
    name: "Test Square Product",
    description:
      "Perfect for testing Square checkout integration. $1.00 product.",
    price: 1.0,
    image_url: "/placeholder.svg",
    type: "sticker",
    status: "ACTIVE",
    options: [],
  },
};

export default function Product() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if it's a mock product first
        if (productId && productId in MOCK_PRODUCTS) {
          setProduct(MOCK_PRODUCTS[productId]);
          setIsLoading(false);
          return;
        }

        // Handle new admin/imported product IDs (admin_11, imported_5, etc.)
        if (productId?.startsWith("admin_")) {
          const adminId = productId.split("_")[1];
          const response = await fetch(`/api/public/products/admin/${adminId}`);

          if (!response.ok) {
            throw new Error("Failed to fetch admin product");
          }

          const data = await response.json();
          setProduct({
            id: parseInt(adminId),
            name: data.name,
            description: data.description,
            price: data.base_price || data.price,
            image_url: data.images?.[0]?.url,
            type: "sticker",
            status: data.availability ? "ACTIVE" : "INACTIVE",
            options: data.options || [],
          });
          setIsLoading(false);
          return;
        }

        if (productId?.startsWith("imported_")) {
          const importedId = productId.split("_")[1];
          const response = await fetch(`/api/public/products/imported/${importedId}`);

          if (!response.ok) {
            throw new Error("Failed to fetch imported product");
          }

          const data = await response.json();
          setProduct({
            id: parseInt(importedId),
            name: data.name,
            description: data.description,
            price: data.min_price || data.price,
            image_url: data.image_url,
            type: "sticker",
            status: "ACTIVE",
            options: data.options || [],
          });
          setIsLoading(false);
          return;
        }

        const bcProductId = productId && PRODUCT_ID_MAP[productId];

        if (!bcProductId) {
          setError("Product not found");
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/products/${bcProductId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }

        const data = await response.json();
        setProduct(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const addTestProductToCart = async () => {
    setIsAddingToCart(true);
    try {
      // Create or get cart
      let cartId = localStorage.getItem("cart_id");

      if (!cartId) {
        const cartResponse = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const cartData = await cartResponse.json();
        cartId = cartData.data?.id;
        localStorage.setItem("cart_id", cartId);
      }

      // Add product to cart
      const addResponse = await fetch(`/api/cart/${cartId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line_items: [
            {
              product_id: product!.id,
              quantity: quantity,
              price: product!.price,
              product_name: product!.name,
            },
          ],
        }),
      });

      if (!addResponse.ok) {
        throw new Error("Failed to add to cart");
      }

      toast.success(`Added ${quantity} ${product!.name} to cart`);
      navigate(`/checkout-new?cartId=${cartId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-[#fafafa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 mt-4">Loading product...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-[#fafafa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Product Not Found
              </h1>
              <p className="text-gray-600 mb-8">
                {error || "We couldn't find the product you're looking for."}
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                Back to Products
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-sm text-gray-600">
            <Link to="/products" className="hover:text-gray-900">
              Products
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>

          {/* Product Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            {/* Product Image */}
            <div className="lg:col-span-1">
              <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center mb-6">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info Card */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                {product.price !== undefined && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-2">
                      Price per unit
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">
                      $
                      {typeof product.price === "number"
                        ? product.price.toFixed(2)
                        : "0.00"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Bulk pricing available
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                {product.description && (
                  <p className="text-lg text-gray-600">{product.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Configurator Section or Test Product Section */}
          <div className="border-t border-gray-200 pt-12">
            {productId === "test-square-product" ? (
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Add to Cart
                </h2>
                <p className="text-gray-600 mb-8">
                  Use this product to test the Square checkout integration.
                </p>

                <div className="bg-gray-50 rounded-lg p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-4">
                      Quantity
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="border border-gray-300 rounded-lg px-4 py-2 text-center w-20"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-lg font-bold text-gray-900 mb-6">
                      Total: ${(product.price! * quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={addTestProductToCart}
                      disabled={isAddingToCart}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-all"
                    >
                      {isAddingToCart
                        ? "Adding to cart..."
                        : "Add to Cart & Checkout"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Customize Your Order
                </h2>
                <p className="text-gray-600 mb-8">
                  Select your options, upload your design, and add to cart
                </p>

                <div className="bg-gray-50 rounded-lg p-8">
                  <BcConfigurator productId={product.id} product={product} />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
