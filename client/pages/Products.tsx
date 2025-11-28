import Header from "@/components/Header";
import { Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

const PRODUCTS = [
  {
    id: "test-square-product",
    name: "Test Square Product",
    price: 1.0,
    image: "/placeholder.svg",
    rating: 5.0,
    reviews: 1,
    description: "Perfect for testing Square checkout integration. $1.00 product.",
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
    description: "Eye-catching holographic stickers that shimmer in the light.",
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

export default function Products() {
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

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {PRODUCTS.map((product) => (
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
                            i < Math.floor(product.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">
                      {product.rating} ({product.reviews})
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
