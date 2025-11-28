import Header from "@/components/Header";
import BcConfigurator from "@/components/BcConfigurator";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Star, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

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
};

export default function Product() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const bcProductId = productId && PRODUCT_ID_MAP[productId];

        if (!bcProductId) {
          setError("Product not found");
          setLoading(false);
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
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-white">
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
        <main className="pt-20 min-h-screen bg-white">
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
      <main className="pt-20 min-h-screen bg-white">
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

          {/* Configurator Section */}
          <div className="border-t border-gray-200 pt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Customize Your Order
            </h2>
            <p className="text-gray-600 mb-8">
              Select your options, upload your design, and add to cart
            </p>

            <div className="bg-gray-50 rounded-lg p-8">
              <BcConfigurator productId={product.id} product={product} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
