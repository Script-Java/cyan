import { Edit3, RotateCcw } from "lucide-react";
import { useState } from "react";

interface GreetingBannerProps {
  firstName: string;
  avatarUrl?: string;
}

export default function GreetingBanner({ firstName, avatarUrl }: GreetingBannerProps) {
  const [isHovering, setIsHovering] = useState(false);

  const defaultAvatar =
    "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1751390215/StickerShuttle_Avatar1_dmnkat.png";
  const bannerImage =
    "https://images-assets.nasa.gov/image/iss073e0204297/iss073e0204297~orig.jpg";

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-8 aspect-video max-w-full bg-cover bg-center shadow-xl"
      style={{
        backgroundImage: `url('${bannerImage}')`,
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Overlay with dark background */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Hover actions */}
      {isHovering && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 z-20 transition-opacity duration-200">
          <button
            title="Choose Banner Template"
            className="p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-full backdrop-blur-md border border-purple-300/30 transition-all"
          >
            <Edit3 className="w-6 h-6 text-purple-300" />
          </button>
          <button
            title="Reset to Default Banner"
            className="p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-full backdrop-blur-md border border-blue-300/30 transition-all"
          >
            <RotateCcw className="w-6 h-6 text-blue-300" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="absolute inset-0 flex items-start gap-6 p-6 sm:p-8 z-30">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white/20 backdrop-blur-md bg-white/10 flex items-center justify-center flex-shrink-0 shadow-lg">
            <img
              src={avatarUrl || defaultAvatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 pt-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
            Greetings, {firstName}
          </h1>
          <div className="flex items-center gap-2 mb-4">
            <p className="text-blue-100 text-sm sm:text-base font-medium">
              StickerHub Dashboard
            </p>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-400/50 backdrop-blur-md">
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                v4
              </span>
            </span>
          </div>
          <div className="font-mono text-xs sm:text-sm text-green-300 drop-shadow-lg">
            <p className="opacity-90">&gt; MISSION ACTIVE &gt; REVIEW YOUR ORDERS BELOW</p>
          </div>
        </div>
      </div>
    </div>
  );
}
