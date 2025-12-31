import { Edit3, RotateCcw, ChevronDown, X } from "lucide-react";
import { useState, useEffect } from "react";

interface GreetingBannerProps {
  firstName: string;
  avatarUrl?: string;
}

const DEFAULT_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=1200&h=400&fit=crop";
const BANNER_IMAGE_STORAGE_KEY = "bannerImageUrl";

export default function GreetingBanner({
  firstName,
  avatarUrl,
}: GreetingBannerProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [bannerImage, setBannerImage] = useState(DEFAULT_BANNER_IMAGE);

  const defaultAvatar =
    "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1751390215/StickerShuttle_Avatar1_dmnkat.png";

  // Load banner image from localStorage on mount
  useEffect(() => {
    const savedImage = localStorage.getItem(BANNER_IMAGE_STORAGE_KEY);
    if (savedImage) {
      setBannerImage(savedImage);
    }
  }, []);

  const handleChangeBackground = () => {
    setImageUrl(bannerImage);
    setShowImageDialog(true);
  };

  const handleSaveImage = () => {
    if (imageUrl.trim()) {
      setBannerImage(imageUrl);
      localStorage.setItem(BANNER_IMAGE_STORAGE_KEY, imageUrl);
      setShowImageDialog(false);
      setImageUrl("");
    }
  };

  const handleResetBackground = () => {
    setBannerImage(DEFAULT_BANNER_IMAGE);
    localStorage.removeItem(BANNER_IMAGE_STORAGE_KEY);
  };

  return (
    <>
      <div
        className="relative rounded-2xl overflow-hidden mb-6 max-w-full bg-cover bg-center shadow-xl"
        style={{
          backgroundImage: `url('${bannerImage}')`,
          aspectRatio: "5.2 / 1",
          minHeight: "207px",
          paddingRight: "12px",
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Overlay with dark background */}
        <div
          className="absolute bg-black/30 left-0 right-0 bottom-0"
          style={{
            top: "2px",
            marginBottom: "auto",
            width: "1280px",
          }}
        />

        {/* Sticker Type Selector */}
        <div
          className="absolute flex-1 left-0 right-0 flex items-center justify-center z-30 hidden"
          style={{
            margin: "0 16px",
            position: "relative",
          }}
        >
          <button className="flex items-center justify-between w-full max-w-xs px-4 py-2 rounded-lg border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors gap-2">
            <div className="flex items-center gap-2">
              <img
                src="https://res.cloudinary.com/dxcnvqk6b/image/upload/v1763707664/Favicon_StickerShuttle_ml7yh2.png"
                alt="Sticky Slap"
                className="w-3.5 h-3.5"
              />
              <span className="text-sm font-medium text-white">
                Select sticker type...
              </span>
            </div>
            <ChevronDown className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Hover actions */}
        {isHovering && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 z-20 transition-opacity duration-200">
            <button
              title="Change Banner Background"
              onClick={handleChangeBackground}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md border border-white/40 transition-all"
            >
              <Edit3 className="w-6 h-6 text-white" />
            </button>
            <button
              title="Reset to Default Banner"
              onClick={handleResetBackground}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md border border-white/40 transition-all"
            >
              <RotateCcw className="w-6 h-6 text-white" />
            </button>
          </div>
        )}

        {/* Content */}
        <div
          className="absolute left-0 right-0 bottom-0 flex items-start gap-4 z-30"
          style={{
            top: "14px",
            marginBottom: "20px",
            padding: "24px",
          }}
        >
          {/* Avatar */}
          <div className="relative group">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 backdrop-blur-md bg-white/10 flex items-center justify-center flex-shrink-0 shadow-lg">
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
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight">
              Greetings, {firstName}
            </h1>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-blue-100 text-xs sm:text-sm font-medium">
                Sticky Slap Dashboard
              </p>
            </div>
            <div className="font-mono text-xs text-green-300 drop-shadow-lg">
              <p className="opacity-90">
                &gt; REVIEW YOUR ORDERS BELOW
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image URL Dialog - Outside banner to prevent clipping */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Change Background Image
              </h2>
              <button
                onClick={() => setShowImageDialog(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the URL of an image to use as the background
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowImageDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveImage}
                  disabled={!imageUrl.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
