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
        className="relative rounded-2xl overflow-hidden p-4 sm:p-6 border border-pink-500/60 transition-all duration-300"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(236, 72, 153, 0.7) 0%, rgba(239, 68, 68, 0.6) 50%, rgba(236, 72, 153, 0.5) 100%)`,
          backdropFilter: "blur(25px)",
        }}
      >
        {/* Shimmer effect */}
        <div
          className="absolute inset-0 animate-pulse opacity-30"
          style={{
            backgroundImage: `linear-gradient(45deg, rgba(0, 0, 0, 0) 30%, rgba(255, 255, 255, 0.3) 50%, rgba(0, 0, 0, 0) 70%)`,
            backgroundSize: "200% 200%",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <div className="p-2 sm:p-3 bg-white/10 rounded-lg flex-shrink-0">
              <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-0">
                <span className="block">Shop Black Friday</span>
                <span className="text-sm sm:text-base">Deals Early</span>
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white font-semibold whitespace-nowrap flex-shrink-0 ml-4">
            <span className="text-sm sm:text-base">Shop Now</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </a>
  );
}
