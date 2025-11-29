import { RefreshCw, ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  href: string;
  imageUrl: string;
  dropShadowColor: string;
}

const PRODUCT_CATEGORIES: Product[] = [
  {
    id: "vinyl",
    name: "Vinyl →",
    href: "/designs",
    imageUrl:
      "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749593599/Alien_Rocket_mkwlag.png",
    dropShadowColor: "rgba(168, 242, 106, 0.3)",
  },
  {
    id: "holographic",
    name: "Holographic →",
    href: "/designs",
    imageUrl:
      "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749593621/PurpleAlien_StickerShuttle_HolographicIcon_ukdotq.png",
    dropShadowColor: "rgba(168, 85, 247, 0.3)",
  },
  {
    id: "glitter",
    name: "Glitter →",
    href: "/designs",
    imageUrl:
      "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749593602/BlueAlien_StickerShuttle_GlitterIcon_rocwpi.png",
    dropShadowColor: "rgba(59, 130, 246, 0.3)",
  },
  {
    id: "chrome",
    name: "Chrome →",
    href: "/designs",
    imageUrl:
      "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749593680/yELLOWAlien_StickerShuttle_ChromeIcon_nut4el.png",
    dropShadowColor: "rgba(220, 220, 220, 0.3)",
  },
  {
    id: "sheets",
    name: "Sheets →",
    href: "/designs",
    imageUrl:
      "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749847809/StickerShuttle_StickerSheetsIcon_2_g61dty.svg",
    dropShadowColor: "rgba(196, 181, 253, 0.3)",
  },
];

export default function QuickOrderSection() {
  return (
    <div
      className="rounded-2xl border overflow-hidden bg-white shadow-sm"
      style={{
        borderColor: "rgba(100, 116, 139, 0.2)",
      }}
    >
      {/* Header */}
      <div
        className="border-b p-6"
        style={{ borderColor: "rgba(100, 116, 139, 0.1)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-3 text-lg sm:text-xl font-bold text-gray-900">
            <RefreshCw className="w-5 h-5 text-gray-700" />
            Quick Order
          </h2>
          <a
            href="/designs"
            className="hidden md:flex items-center gap-2 text-sm font-medium transition-colors text-purple-600 hover:text-purple-700"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Product Grid */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {PRODUCT_CATEGORIES.map((product) => (
            <div key={product.id} className="group">
              <div
                className="rounded-2xl border p-4 text-center transition-all duration-500 hover:shadow-md hover:bg-gray-50 flex flex-col items-center bg-white"
                style={{
                  borderColor: "rgba(100, 116, 139, 0.2)",
                }}
              >
                {/* Image Container */}
                <div
                  className="w-24 h-24 flex items-center justify-center mb-3 rounded-lg transition-transform duration-500 group-hover:scale-110"
                  style={{
                    filter: `drop-shadow(${product.dropShadowColor} 0px 0px 8px)`,
                  }}
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                  />
                </div>

                {/* Title Link */}
                <a
                  href={product.href}
                  className="text-sm font-semibold text-gray-900 text-center transition-colors hover:text-purple-600 hover:underline"
                >
                  {product.name}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
