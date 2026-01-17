import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImage {
  id: string;
  url: string;
  name: string;
  preview?: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full bg-gray-100 rounded-lg h-96 flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];

  const goToPrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="w-full">
      {/* Main Gallery - Side by Side Layout */}
      <div className="flex gap-6">
        {/* Left: Main Image Section */}
        <div className="flex-1">
          <div className="relative bg-gray-200 rounded-lg overflow-hidden">
            {/* Main Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={currentImage.url}
                alt={currentImage.name || productName}
                className="w-full h-full object-cover"
              />

              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    aria-label="Previous image"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={goToNext}
                    aria-label="Next image"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image Counter - Top Right */}
              {images.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded text-xs font-semibold">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="w-40">
            {/* Gallery Label */}
            <div className="text-xs font-bold text-gray-700 mb-3 tracking-widest">
              GALLERY
            </div>

            {/* Thumbnail Grid - 3 columns */}
            <div className="grid grid-cols-3 gap-3">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => goToImage(index)}
                  className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                    currentImageIndex === index
                      ? "border-yellow-400 shadow-md"
                      : "border-gray-200 opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                >
                  <img
                    src={image.url}
                    alt={image.name || `${productName} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {currentImageIndex === index && (
                    <div className="absolute inset-0 bg-yellow-400/10 pointer-events-none" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
