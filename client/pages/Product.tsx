import Header from "@/components/Header";
import BcConfigurator from "@/components/BcConfigurator";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Star } from "lucide-react";

// Mock product data - replace with API call to BigCommerce
const PRODUCTS = {
  "vinyl-stickers": {
    id: 1,
    name: "Vinyl Stickers",
    category: "Stickers",
    price: 0.25,
    image: "/placeholder.svg",
    rating: 4.8,
    reviews: 234,
    description:
      "Durable vinyl stickers perfect for laptops, water bottles, and outdoor use. Weather-resistant and UV-protected.",
    features: [
      "Waterproof & weather-resistant",
      "UV-protected colors",
      "Kiss-cut precision",
      "Custom shapes available",
      "Perfect for branding",
    ],
    specifications: {
      material: "Premium vinyl (3.5mil)",
      finish: "Matte or Gloss",
      sizes: ["1-5 inches"],
      minimum: "50 units",
    },
  },
  "die-cut-stickers": {
    id: 2,
    name: "Die-Cut Stickers",
    category: "Stickers",
    price: 0.3,
    image: "/placeholder.svg",
    rating: 4.9,
    reviews: 189,
    description:
      "Custom-cut stickers with any shape you design. White borders removed for a seamless look.",
    features: [
      "Any custom shape",
      "Perfect edges",
      "High-quality printing",
      "Bulk discounts available",
      "Fast turnaround",
    ],
    specifications: {
      material: "Premium vinyl (4mil)",
      finish: "Matte",
      sizes: ["1-10 inches"],
      minimum: "50 units",
    },
  },
  "holographic-stickers": {
    id: 3,
    name: "Holographic Stickers",
    category: "Stickers",
    price: 0.45,
    image: "/placeholder.svg",
    rating: 4.9,
    reviews: 156,
    description:
      "Eye-catching holographic stickers that shimmer and change in the light. Premium quality for special projects.",
    features: [
      "Stunning holographic effect",
      "Premium finish",
      "Weather-resistant",
      "Great for premium products",
      "Collectible quality",
    ],
    specifications: {
      material: "Holographic vinyl (3.5mil)",
      finish: "Holographic",
      sizes: ["1-6 inches"],
      minimum: "100 units",
    },
  },
  "clear-stickers": {
    id: 4,
    name: "Clear Stickers",
    category: "Stickers",
    price: 0.2,
    image: "/placeholder.svg",
    rating: 4.7,
    reviews: 198,
    description:
      "Transparent stickers with vibrant full-color printing. Perfect for windows and glass surfaces.",
    features: [
      "Transparent background",
      "Vibrant colors",
      "Window-safe",
      "Professional appearance",
      "Budget-friendly",
    ],
    specifications: {
      material: "Clear vinyl (3mil)",
      finish: "Glossy",
      sizes: ["1-8 inches"],
      minimum: "50 units",
    },
  },
};

export default function Product() {
  const { productId } = useParams<{ productId: string }>();

  const product = productId && PRODUCTS[productId as keyof typeof PRODUCTS];

  if (!product) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Product Not Found
              </h1>
              <p className="text-gray-600 mb-8">
                We couldn't find the product you're looking for.
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
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info Card */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-2">
                    Category
                  </h3>
                  <p className="text-gray-900">{product.category}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 mb-2">
                    Price per unit
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Bulk pricing available
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 mb-2">
                    Minimum Order
                  </h3>
                  <p className="text-gray-900">
                    {product.specifications.minimum}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">
                    Rating
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-gray-900">
                      {product.rating}
                    </span>
                    <span className="text-sm text-gray-600">
                      ({product.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <p className="text-lg text-gray-600">{product.description}</p>
              </div>

              {/* Features */}
              <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Key Features
                </h2>
                <ul className="space-y-3">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 font-bold text-xs">
                          ✓
                        </span>
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Specifications */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Specifications
                </h2>
                <dl className="grid grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm font-bold text-gray-700 mb-1">
                      Material
                    </dt>
                    <dd className="text-gray-900">
                      {product.specifications.material}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-gray-700 mb-1">
                      Finish
                    </dt>
                    <dd className="text-gray-900">
                      {product.specifications.finish}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-gray-700 mb-1">
                      Available Sizes
                    </dt>
                    <dd className="text-gray-900">
                      {product.specifications.sizes.join(", ")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-bold text-gray-700 mb-1">
                      Minimum Order
                    </dt>
                    <dd className="text-gray-900">
                      {product.specifications.minimum}
                    </dd>
                  </div>
                </dl>
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
              <BcConfigurator product={product} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
