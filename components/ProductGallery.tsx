/**
 * ============================================================================
 * PRODUCT GALLERY SLIDESHOW COMPONENT - FULLY DOCUMENTED FOR PORTING
 * ============================================================================
 * 
 * A responsive, auto-rotating image gallery with multiple navigation methods.
 * Includes thumbnail grid, navigation arrows, slide counter, and dot indicators.
 * 
 * DEPENDENCIES:
 * - React (useState, useEffect)
 * - lucide-react (ChevronLeft, ChevronRight icons)
 * - @/lib/utils (cn function for conditional classnames)
 * - Tailwind CSS (all styling)
 * - tailwind.config.ts must define 'primary-yellow' color
 * 
 * RESPONSIVE BEHAVIOR:
 * - Mobile: Single column layout, stacked thumbnails (4 columns)
 * - Tablet/Desktop: 3-column grid (2 cols main, 1 col thumbnails on right)
 * 
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";

/**
 * Props interface for the ProductGallerySlideshow component
 */
interface ProductGallerySlideshowProps {
  /** Array of image URLs to display in the gallery */
  images: string[];
  
  /** Product name - displayed as main heading above images */
  productName: string;
  
  /** Optional product description - supports HTML markup
   * Will be rendered using dangerouslySetInnerHTML for rich formatting
   * Can include <p>, <strong>, <br> tags for layout */
  productDescription?: string;
}

/**
 * Main Component: ProductGallerySlideshow
 * 
 * FEATURES:
 * 1. Auto-rotates through images every 5 seconds
 * 2. Multiple navigation methods: arrows, thumbnails, dots
 * 3. Pauses autoplay when user interacts
 * 4. Fully responsive layout
 * 5. Accessible (proper ARIA labels, semantic HTML)
 * 
 * USAGE EXAMPLE:
 * ```tsx
 * <ProductGallerySlideshow
 *   images={[
 *     "https://example.com/image1.jpg",
 *     "https://example.com/image2.jpg",
 *   ]}
 *   productName="Custom Stickers"
 *   productDescription="<p><strong>High quality</strong> stickers</p>"
 * />
 * ```
 */
export default function ProductGallerySlideshow({
  images,
  productName,
  productDescription,
}: ProductGallerySlideshowProps) {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  /** Tracks the currently displayed slide index (0-based) */
  const [currentIndex, setCurrentIndex] = useState(0);
  
  /** Controls whether carousel auto-rotates
   * Set to false when user interacts with navigation
   * Prevents jarring auto-advance while user is browsing */
  const [autoplay, setAutoplay] = useState(true);

  // ========================================================================
  // AUTOPLAY EFFECT
  // ========================================================================
  
  /** 
   * Effect: Handles auto-rotation of slides
   * 
   * BEHAVIOR:
   * - Runs a 5-second interval to advance slides
   * - Only runs if autoplay is true AND images exist
   * - Automatically wraps around (after last slide, goes to first)
   * - Cleanup function clears interval to prevent memory leaks
   * 
   * DEPENDENCIES:
   * - autoplay: Controls whether effect runs
   * - images.length: Re-run if image count changes
   */
  useEffect(() => {
    // Skip if autoplay disabled or no images
    if (!autoplay || images.length === 0) return;

    // Set up interval to advance slides every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    // Cleanup: Clear interval when component unmounts or dependencies change
    return () => clearInterval(interval);
  }, [autoplay, images.length]);

  // ========================================================================
  // NAVIGATION HANDLERS
  // ========================================================================
  
  /**
   * Jump to specific slide and pause autoplay
   * Used by: Thumbnail clicks, dot navigation
   */
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setAutoplay(false);
  };

  /**
   * Advance to next slide (wraps around to first)
   * Disables autoplay to prevent jarring transitions
   * Used by: Right arrow button
   */
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setAutoplay(false);
  };

  /**
   * Go to previous slide (wraps around to last)
   * The "+ images.length" ensures we never get negative numbers
   * Example: If on slide 0, prev goes to slide (images.length - 1)
   * Disables autoplay to prevent jarring transitions
   * Used by: Left arrow button
   */
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setAutoplay(false);
  };

  // ========================================================================
  // RENDER GUARD
  // ========================================================================
  
  // Don't render component if no images provided
  if (!images || images.length === 0) {
    return null;
  }

  // ========================================================================
  // RENDER
  // ========================================================================
  
  return (
    // CONTAINER: Frosted glass effect with subtle styling
    // - bg-gray-100/50: Light gray with 50% opacity (allows backdrop)
    // - backdrop-blur-sm: Frosted glass blur effect
    // - rounded-2xl: Large rounded corners for modern look
    // - p-6 sm:p-8: Responsive padding (6 on mobile, 8 on tablet+)
    // - mb-12: Bottom margin for spacing below component
    // - border border-gray-200/50: Subtle border for definition
    // - shadow-sm: Light shadow for depth
    <div className="w-full bg-white backdrop-blur-sm rounded-2xl p-3 sm:p-4 mb-6 border border-gray-200 shadow-sm">

      {/* ====================================================================
          MAIN LAYOUT GRID
          ====================================================================
          Responsive grid structure:
          - Mobile (< 1024px): Single column (gallery spans full width)
          - Desktop (>= 1024px): 3 columns (gallery: 2 cols, thumbnails: 1 col)
          - gap-3: Spacing between main content and thumbnails
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* ====================================================================
            MAIN GALLERY SECTION (Left side on desktop)
            Spans: 2 columns on desktop, full width on mobile
        */}
        <div className="lg:col-span-2">
          
          {/* ================================================================
              MAIN IMAGE CONTAINER
              Includes: Large display image with navigation arrows and counter
          */}
          <div className="relative mb-3">
            
            {/* Image wrapper with frosted glass effect */}
            <div className="relative bg-white/60 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-200/50">

              {/* ============================================================
                  MAIN IMAGE
                  Properties:
                  - w-full: Takes 100% of container width
                  - h-80: Fixed height (320px) - reduced for compact layout
                  - object-cover: Fills container while maintaining aspect ratio
                  - loading="eager": Load immediately (hero image)
                  - decoding="async": Non-blocking decode
                  - imageRendering: Crisp rendering for sharp edges
              */}
              <img
                src={images[currentIndex]}
                alt={`${productName} - ${currentIndex + 1}`}
                className="w-full h-80 sm:h-80 object-cover"
                loading="eager"
                decoding="async"
                style={{
                  imageRendering: 'crisp-edges',
                  WebkitFontSmoothing: 'antialiased',
                }}
              />
              
              {/* ============================================================
                  NAVIGATION ARROWS
                  Only show if multiple images exist
                  
                  Left Arrow:
                  - absolute left-4 top-1/2 -translate-y-1/2: Center vertically
                  - z-10: Layer above image
                  - bg-black/30 hover:bg-black/50: Transparent darkening on hover
                  - p-2: Padding around icon
                  - rounded-full: Circular button
              */}
              {images.length > 1 && (
                <>
                  {/* LEFT / PREVIOUS BUTTON */}
                  <button
                    onClick={prevSlide}
                    onMouseEnter={() => setAutoplay(false)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition backdrop-blur-sm"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  
                  {/* RIGHT / NEXT BUTTON */}
                  <button
                    onClick={nextSlide}
                    onMouseEnter={() => setAutoplay(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition backdrop-blur-sm"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* ============================================================
                  IMAGE COUNTER BADGE
                  Displays current slide and total (e.g., "3 / 6")
                  Only show if multiple images exist
                  
                  Positioning: top-4 right-4 (top-right corner)
                  Styling: Black with transparency, white text, rounded
              */}
              {images.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                  {currentIndex + 1} / {images.length}
                </div>
              )}
            </div>
          </div>

          {/* ================================================================
              PRODUCT INFO SECTION
              Displays: Product name and description below main image
              Spacing: space-y-2 for gap between name and description
          */}
          <div className="space-y-2">
            
            {/* Product Name Heading */}
            <h2 className="font-bold text-lg sm:text-xl uppercase text-gray-900">
              {productName}
            </h2>
            
            {/* Product Description (optional, supports HTML) */}
            {/* SECURITY: Content is sanitized with DOMPurify to prevent XSS attacks */}
            {productDescription && (
              <div
                className="text-xs sm:text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none [&_p]:mb-2 [&_strong]:font-bold [&_br]:block [&_br]:mb-1"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(productDescription, {
                    ALLOWED_TAGS: ['p', 'strong', 'em', 'b', 'i', 'br', 'ul', 'ol', 'li', 'a'],
                    ALLOWED_ATTR: ['href', 'target', 'rel']
                  }) 
                }}
              />
            )}
            {/* 
              CSS Selectors Explanation:
              - prose prose-sm: Base typography styling
              - max-w-none: Remove max-width constraint
              - [&_p]:mb-2: Paragraph margin-bottom
              - [&_strong]:font-bold: Bold text styling
              - [&_br]:block [&_br]:mb-1: Line break spacing
            */}
          </div>
        </div>

        {/* ====================================================================
            THUMBNAIL GALLERY SECTION (Right side on desktop)
            Only render if multiple images exist
            
            Responsive:
            - Mobile: 4 columns
            - Desktop (lg): 3 columns
            - gap-2 on mobile, gap-3 on desktop
        */}
        {images.length > 1 && (
          <div className="lg:col-span-1 space-y-4">
            
            {/* Section heading */}
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Gallery
            </h3>
            
            {/* Thumbnail grid */}
            <div className="grid grid-cols-4 lg:grid-cols-3 gap-2 lg:gap-3">
              
              {/* Map through images to create thumbnail buttons */}
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    // Base styles applied to all thumbnails
                    "relative aspect-square rounded-lg overflow-hidden transition-all duration-300",
                    // Conditional styles based on whether thumbnail is active
                    currentIndex === index
                      ? "ring-2 ring-yellow-400 shadow-lg"  // Active: yellow ring, shadow
                      : "ring-1 ring-gray-300 hover:ring-gray-400 hover:shadow-md opacity-75 hover:opacity-100"  // Inactive: gray ring, opacity
                  )}
                >
                  {/* Thumbnail image */}
                  <img
                    src={image}
                    alt={`${productName} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"  // Lazy load thumbnails (not immediately needed)
                    decoding="async"
                    style={{
                      imageRendering: 'crisp-edges',
                      WebkitFontSmoothing: 'antialiased',
                    }}
                  />
                  
                  {/* Overlay for active thumbnail - yellow tint */}
                  {currentIndex === index && (
                    <div className="absolute inset-0 bg-yellow-400/20 pointer-events-none" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ====================================================================
          DOT NAVIGATION (Bottom)
          Alternative navigation method - clickable dots for each slide
          Only render if multiple images exist
          
          Layout: Flex row centered with gap-2 spacing
          Margin: mt-8 (top margin for spacing from main image)
      */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          
          {/* Map through images to create dot buttons */}
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                // Base styles for all dots
                "transition-all duration-300 rounded-full",
                // Conditional sizing based on active state
                currentIndex === index
                  ? "w-8 h-2 bg-yellow-400"  // Active: wide yellow dot
                  : "w-2 h-2 bg-gray-300 hover:bg-gray-400"  // Inactive: small gray dot
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * ============================================================================
 * PORTING GUIDE
 * ============================================================================
 * 
 * STEP 1: COPY THIS COMPONENT
 * - Copy this entire file to your other build's components directory
 * 
 * STEP 2: UPDATE IMPORTS
 * Replace imports based on your project structure:
 * ```tsx
 * import { useState, useEffect } from "react";
 * import { ChevronLeft, ChevronRight } from "lucide-react";  // or your icon library
 * import { cn } from "@/lib/utils";  // or your classname utility
 * ```
 * 
 * STEP 3: UPDATE TAILWIND CONFIG
 * Ensure your tailwind.config.ts includes 'primary-yellow' color:
 * ```js
 * module.exports = {
 *   theme: {
 *     colors: {
 *       primary: {
 *         yellow: '#your-yellow-color',  // e.g., '#FFD700'
 *       }
 *     }
 *   }
 * }
 * ```
 * 
 * STEP 4: CUSTOMIZE STYLING (Optional)
 * These values can be adjusted per your design:
 * - h-96: Main image height (384px)
 * - gap-6: Spacing between main and thumbnails
 * - grid-cols-4 lg:grid-cols-3: Thumbnail grid layout
 * - 5000: Autoplay interval milliseconds
 * 
 * STEP 5: TEST RESPONSIVENESS
 * - Test on mobile (< 640px)
 * - Test on tablet (640px - 1024px)
 * - Test on desktop (> 1024px)
 * - Verify touch interactions work on mobile
 * 
 * STEP 6: ACCESSIBILITY CHECK
 * - ARIA labels present for screen readers
 * - Keyboard navigation (arrows, dots)
 * - Color contrast sufficient
 * 
 * ============================================================================
 * CUSTOMIZATION EXAMPLES
 * ============================================================================
 * 
 * CHANGE AUTOPLAY INTERVAL (default: 5000ms = 5 seconds):
 * In useEffect, change: setInterval(..., 5000) to your desired milliseconds
 * 
 * HIDE THUMBNAILS:
 * Remove or comment out the entire Thumbnail Gallery Section
 * 
 * HIDE DOTS:
 * Remove or comment out the Dot Navigation Section
 * 
 * HIDE ARROW BUTTONS:
 * Remove or comment out the Navigation Arrows Section
 * 
 * CHANGE IMAGE HEIGHT:
 * Replace "h-96" class with desired Tailwind height class
 * Examples: h-64 (256px), h-80 (320px), h-screen (100vh)
 * 
 * CUSTOM COLOR SCHEME:
 * Replace "yellow-400" with any Tailwind color
 * Examples: "blue-500", "emerald-400", "rose-500"
 * 
 * ============================================================================
 */
