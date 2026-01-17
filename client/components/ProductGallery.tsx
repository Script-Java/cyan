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
      {/* Main Gallery */}
      <div className="relative bg-gray-50 rounded-lg overflow-hidden mb-6">
        {/* Main Image */}
        <div className="relative aspect-square overflow-hidden">
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

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => goToImage(index)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                currentImageIndex === index
                  ? "border-yellow-400 shadow-lg"
                  : "border-gray-200 opacity-75 hover:opacity-100"
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
      )}
    </div>
  );
}
