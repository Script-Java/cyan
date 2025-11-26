import { Gift, ArrowRight } from "lucide-react";

export default function PromoBanner() {
  return (
    <a
      href="https://www.stickershuttle.com/black-friday"
      target="_blank"
      rel="noopener noreferrer"
      className="block mb-6 group"
    >
      <div
        className="relative rounded-2xl overflow-hidden p-4 sm:p-6 border border-pink-200 transition-all duration-300 shadow-sm hover:shadow-md bg-gradient-to-br from-pink-50 to-red-50"
      >
        {/* Shimmer effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
          style={{
            backgroundImage: `linear-gradient(45deg, rgba(0, 0, 0, 0) 30%, rgba(255, 255, 255, 0.5) 50%, rgba(0, 0, 0, 0) 70%)`,
            backgroundSize: "200% 200%",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <div className="p-2 sm:p-3 bg-pink-100 rounded-lg flex-shrink-0">
              <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-pink-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-0">
                <span className="block">Shop Black Friday</span>
                <span className="text-sm sm:text-base text-gray-700">Deals Early</span>
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-pink-600 font-semibold whitespace-nowrap flex-shrink-0 ml-4">
            <span className="text-sm sm:text-base">Shop Now</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </a>
  );
}
