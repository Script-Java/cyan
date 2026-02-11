module.exports = [
"[project]/components/ProductGallery.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProductGallerySlideshow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-ssr] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dompurify$2f$dist$2f$purify$2e$es$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/dompurify/dist/purify.es.mjs [app-ssr] (ecmascript)");
;
;
;
;
;
function ProductGallerySlideshow({ images, productName, productDescription }) {
    // ========================================================================
    // STATE MANAGEMENT
    // ========================================================================
    /** Tracks the currently displayed slide index (0-based) */ const [currentIndex, setCurrentIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    /** Controls whether carousel auto-rotates
   * Set to false when user interacts with navigation
   * Prevents jarring auto-advance while user is browsing */ const [autoplay, setAutoplay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
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
   */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Skip if autoplay disabled or no images
        if (!autoplay || images.length === 0) return;
        // Set up interval to advance slides every 5 seconds
        const interval = setInterval(()=>{
            setCurrentIndex((prev)=>(prev + 1) % images.length);
        }, 5000);
        // Cleanup: Clear interval when component unmounts or dependencies change
        return ()=>clearInterval(interval);
    }, [
        autoplay,
        images.length
    ]);
    // ========================================================================
    // NAVIGATION HANDLERS
    // ========================================================================
    /**
   * Jump to specific slide and pause autoplay
   * Used by: Thumbnail clicks, dot navigation
   */ const goToSlide = (index)=>{
        setCurrentIndex(index);
        setAutoplay(false);
    };
    /**
   * Advance to next slide (wraps around to first)
   * Disables autoplay to prevent jarring transitions
   * Used by: Right arrow button
   */ const nextSlide = ()=>{
        setCurrentIndex((prev)=>(prev + 1) % images.length);
        setAutoplay(false);
    };
    /**
   * Go to previous slide (wraps around to last)
   * The "+ images.length" ensures we never get negative numbers
   * Example: If on slide 0, prev goes to slide (images.length - 1)
   * Disables autoplay to prevent jarring transitions
   * Used by: Left arrow button
   */ const prevSlide = ()=>{
        setCurrentIndex((prev)=>(prev - 1 + images.length) % images.length);
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
    return(// CONTAINER: Frosted glass effect with subtle styling
    // - bg-gray-100/50: Light gray with 50% opacity (allows backdrop)
    // - backdrop-blur-sm: Frosted glass blur effect
    // - rounded-2xl: Large rounded corners for modern look
    // - p-6 sm:p-8: Responsive padding (6 on mobile, 8 on tablet+)
    // - mb-12: Bottom margin for spacing below component
    // - border border-gray-200/50: Subtle border for definition
    // - shadow-sm: Light shadow for depth
    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full bg-white backdrop-blur-sm rounded-2xl p-3 sm:p-4 mb-6 border border-gray-200 shadow-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-3 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative mb-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative bg-white/60 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-200/50",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: images[currentIndex],
                                            alt: `${productName} - ${currentIndex + 1}`,
                                            className: "w-full h-80 sm:h-80 object-cover",
                                            loading: "eager",
                                            decoding: "async",
                                            style: {
                                                imageRendering: 'crisp-edges',
                                                WebkitFontSmoothing: 'antialiased'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/ProductGallery.tsx",
                                            lineNumber: 207,
                                            columnNumber: 15
                                        }, this),
                                        images.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: prevSlide,
                                                    onMouseEnter: ()=>setAutoplay(false),
                                                    className: "absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition backdrop-blur-sm",
                                                    "aria-label": "Previous image",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                                        className: "w-6 h-6"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ProductGallery.tsx",
                                                        lineNumber: 239,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ProductGallery.tsx",
                                                    lineNumber: 233,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: nextSlide,
                                                    onMouseEnter: ()=>setAutoplay(false),
                                                    className: "absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition backdrop-blur-sm",
                                                    "aria-label": "Next image",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                        className: "w-6 h-6"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ProductGallery.tsx",
                                                        lineNumber: 249,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ProductGallery.tsx",
                                                    lineNumber: 243,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true),
                                        images.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm",
                                            children: [
                                                currentIndex + 1,
                                                " / ",
                                                images.length
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/ProductGallery.tsx",
                                            lineNumber: 263,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ProductGallery.tsx",
                                    lineNumber: 195,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/ProductGallery.tsx",
                                lineNumber: 192,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "font-bold text-lg sm:text-xl uppercase text-gray-900",
                                        children: productName
                                    }, void 0, false, {
                                        fileName: "[project]/components/ProductGallery.tsx",
                                        lineNumber: 278,
                                        columnNumber: 13
                                    }, this),
                                    productDescription && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs sm:text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none [&_p]:mb-2 [&_strong]:font-bold [&_br]:block [&_br]:mb-1",
                                        dangerouslySetInnerHTML: {
                                            __html: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dompurify$2f$dist$2f$purify$2e$es$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].sanitize(productDescription, {
                                                ALLOWED_TAGS: [
                                                    'p',
                                                    'strong',
                                                    'em',
                                                    'b',
                                                    'i',
                                                    'br',
                                                    'ul',
                                                    'ol',
                                                    'li',
                                                    'a'
                                                ],
                                                ALLOWED_ATTR: [
                                                    'href',
                                                    'target',
                                                    'rel'
                                                ]
                                            })
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/ProductGallery.tsx",
                                        lineNumber: 285,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ProductGallery.tsx",
                                lineNumber: 275,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ProductGallery.tsx",
                        lineNumber: 186,
                        columnNumber: 9
                    }, this),
                    images.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-1 space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xs font-bold text-gray-600 uppercase tracking-wider",
                                children: "Gallery"
                            }, void 0, false, {
                                fileName: "[project]/components/ProductGallery.tsx",
                                lineNumber: 319,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-4 lg:grid-cols-3 gap-2 lg:gap-3",
                                children: images.map((image, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>goToSlide(index),
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(// Base styles applied to all thumbnails
                                        "relative aspect-square rounded-lg overflow-hidden transition-all duration-300", // Conditional styles based on whether thumbnail is active
                                        currentIndex === index ? "ring-2 ring-yellow-400 shadow-lg" // Active: yellow ring, shadow
                                         : "ring-1 ring-gray-300 hover:ring-gray-400 hover:shadow-md opacity-75 hover:opacity-100" // Inactive: gray ring, opacity
                                        ),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: image,
                                                alt: `${productName} thumbnail ${index + 1}`,
                                                className: "w-full h-full object-cover",
                                                loading: "lazy",
                                                decoding: "async",
                                                style: {
                                                    imageRendering: 'crisp-edges',
                                                    WebkitFontSmoothing: 'antialiased'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/ProductGallery.tsx",
                                                lineNumber: 341,
                                                columnNumber: 19
                                            }, this),
                                            currentIndex === index && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-0 bg-yellow-400/20 pointer-events-none"
                                            }, void 0, false, {
                                                fileName: "[project]/components/ProductGallery.tsx",
                                                lineNumber: 355,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, index, true, {
                                        fileName: "[project]/components/ProductGallery.tsx",
                                        lineNumber: 328,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/ProductGallery.tsx",
                                lineNumber: 324,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ProductGallery.tsx",
                        lineNumber: 316,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ProductGallery.tsx",
                lineNumber: 180,
                columnNumber: 7
            }, this),
            images.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-center gap-2 mt-8",
                children: images.map((_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>goToSlide(index),
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(// Base styles for all dots
                        "transition-all duration-300 rounded-full", // Conditional sizing based on active state
                        currentIndex === index ? "w-8 h-2 bg-yellow-400" // Active: wide yellow dot
                         : "w-2 h-2 bg-gray-300 hover:bg-gray-400" // Inactive: small gray dot
                        ),
                        "aria-label": `Go to slide ${index + 1}`
                    }, index, false, {
                        fileName: "[project]/components/ProductGallery.tsx",
                        lineNumber: 377,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/ProductGallery.tsx",
                lineNumber: 373,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ProductGallery.tsx",
        lineNumber: 170,
        columnNumber: 5
    }, this));
} /**
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
}),
"[project]/components/ui/button.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
const Button = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, variant, size, asChild = false, ...props }, ref)=>{
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/button.tsx",
        lineNumber: 46,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
Button.displayName = "Button";
;
}),
"[project]/components/ui/input.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
const Input = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, type, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/input.tsx",
        lineNumber: 8,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
Input.displayName = "Input";
;
}),
"[project]/components/ui/textarea.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Textarea",
    ()=>Textarea
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
const Textarea = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/textarea.tsx",
        lineNumber: 11,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
Textarea.displayName = "Textarea";
;
}),
"[project]/components/ui/label.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Label",
    ()=>Label
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-label/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
;
;
const labelVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cva"])("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
const Label = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(labelVariants(), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/label.tsx",
        lineNumber: 16,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
Label.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"].displayName;
;
}),
"[project]/app/product-page/[productId]/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProductPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-ssr] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-ssr] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ProductGallery$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ProductGallery.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/input.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$textarea$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/textarea.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/label.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-toast.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
function ProductPage() {
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useParams"])();
    const productId = params?.productId;
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { toast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useToast"])();
    const [product, setProduct] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [currentImageIndex, setCurrentImageIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [selectedOptions, setSelectedOptions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [designFile, setDesignFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [designPreview, setDesignPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [optionalFields, setOptionalFields] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [orderNotes, setOrderNotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [quantity, setQuantity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(100);
    const [isAddingToCart, setIsAddingToCart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [activeQuantityOption, setActiveQuantityOption] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(100);
    const getSavedDefaults = (productId)=>{
        try {
            const saved = localStorage.getItem(`product_defaults_${productId}`);
            return saved ? JSON.parse(saved) : {};
        } catch  {
            return {};
        }
    };
    const saveAsDefault = (options)=>{
        if (!productId) return;
        try {
            localStorage.setItem(`product_defaults_${productId}`, JSON.stringify(options));
        } catch (error) {
            console.error("Failed to save default options:", error);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const fetchProduct = async ()=>{
            try {
                if (!productId) return;
                const response = await fetch(`/api/public/products/${productId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch product");
                }
                const data = await response.json();
                setProduct(data.product);
                const savedDefaults = getSavedDefaults(productId);
                const initialOptions = {};
                data.product.options.forEach((option)=>{
                    if (savedDefaults[option.id]) {
                        initialOptions[option.id] = savedDefaults[option.id];
                    } else if (option.defaultValueId) {
                        initialOptions[option.id] = option.defaultValueId;
                    }
                });
                setSelectedOptions(initialOptions);
                if (savedDefaults.quantity) {
                    setQuantity(savedDefaults.quantity);
                    setActiveQuantityOption(savedDefaults.quantity);
                }
                const initialFields = {};
                data.product.optional_fields.forEach((field)=>{
                    initialFields[field.name] = "";
                });
                setOptionalFields(initialFields);
            } catch (error) {
                console.error("Error fetching product:", error);
                toast({
                    title: "Error",
                    description: "Failed to load product",
                    variant: "destructive"
                });
            } finally{
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [
        productId,
        toast
    ]);
    const handleDesignUpload = (e)=>{
        const file = e.target.files?.[0];
        if (!file) return;
        if (!product?.customer_upload_config.allowedFormats.includes(file.name.split(".").pop()?.toLowerCase() || "")) {
            toast({
                title: "Invalid File Format",
                description: `Allowed formats: ${product?.customer_upload_config.allowedFormats.join(", ")}`,
                variant: "destructive"
            });
            return;
        }
        if (file.size > (product?.customer_upload_config.maxFileSize || 5) * 1024 * 1024) {
            toast({
                title: "File Too Large",
                description: `Maximum file size: ${product?.customer_upload_config.maxFileSize}MB`,
                variant: "destructive"
            });
            return;
        }
        setDesignFile(file);
        const reader = new FileReader();
        reader.onload = (event)=>{
            setDesignPreview(event.target?.result);
        };
        reader.readAsDataURL(file);
    };
    const removeDesign = ()=>{
        setDesignFile(null);
        setDesignPreview(null);
    };
    const checkSharedVariantMatch = ()=>{
        if (!product?.shared_variants) return null;
        for (const sharedVariant of product.shared_variants){
            let isMatch = true;
            for (const selection of sharedVariant.optionSelections){
                const selectedValueId = selectedOptions[selection.optionId];
                if (!selectedValueId || !selection.selectedValueIds.includes(selectedValueId)) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                return sharedVariant;
            }
        }
        return null;
    };
    const calculatePriceForValue = (optionId, valueId)=>{
        if (!product) return 0;
        const option = product.options.find((o)=>o.id === optionId);
        if (option) {
            const value = option.values.find((v)=>v.id === valueId);
            if (value) {
                return value.priceModifier;
            }
        }
        return 0;
    };
    const calculatePrice = ()=>{
        if (!product) return "0.00";
        const matchedSharedVariant = checkSharedVariantMatch();
        if (matchedSharedVariant) {
            return matchedSharedVariant.price.toFixed(2);
        }
        let totalPrice = 0;
        let hasOptionPrice = false;
        Object.entries(selectedOptions).forEach(([optionId, valueId])=>{
            const option = product.options.find((o)=>o.id === optionId);
            if (option) {
                const value = option.values.find((v)=>v.id === valueId);
                if (value && value.priceModifier !== 0) {
                    hasOptionPrice = true;
                    totalPrice += value.priceModifier;
                }
            }
        });
        if (hasOptionPrice) {
            return totalPrice.toFixed(2);
        }
        return product.base_price.toFixed(2);
    };
    const calculateTotalPrice = ()=>{
        const pricePerUnit = parseFloat(calculatePrice());
        return (pricePerUnit * quantity).toFixed(2);
    };
    const calculatePricePerUnit = ()=>{
        const totalPrice = parseFloat(calculateTotalPrice());
        return (totalPrice / quantity).toFixed(2);
    };
    const getQuantityTierPricing = ()=>{
        const basePricePerUnit = parseFloat(calculatePrice());
        const quantityTiers = [
            {
                qty: 50,
                discountPercent: 0
            },
            {
                qty: 100,
                discountPercent: 0
            },
            {
                qty: 200,
                discountPercent: 0
            },
            {
                qty: 300,
                discountPercent: 0
            },
            {
                qty: 500,
                discountPercent: 0
            },
            {
                qty: 1000,
                discountPercent: 0
            },
            {
                qty: 2500,
                discountPercent: 0
            }
        ];
        return quantityTiers.map((tier)=>{
            const discountedPrice = basePricePerUnit * (1 - tier.discountPercent / 100);
            const totalPrice = discountedPrice * tier.qty;
            return {
                qty: tier.qty,
                price: totalPrice,
                save: tier.discountPercent > 0 ? tier.discountPercent : null
            };
        });
    };
    const handleAddToCart = async ()=>{
        const requiredOptions = product?.options.filter((o)=>o.required) || [];
        const missingOptions = requiredOptions.filter((o)=>!selectedOptions[o.id]);
        if (missingOptions.length > 0) {
            toast({
                title: "Missing Required Options",
                description: `Please select: ${missingOptions.map((o)=>o.name).join(", ")}`,
                variant: "destructive"
            });
            return;
        }
        saveAsDefault(selectedOptions);
        // Design file is now optional - allow adding to cart without it
        setIsAddingToCart(true);
        try {
            const basePrice = parseFloat(calculatePrice());
            // Find save percentage for current quantity
            const quantityTiers = [
                {
                    qty: 50,
                    discountPercent: 0
                },
                {
                    qty: 100,
                    discountPercent: 0
                },
                {
                    qty: 200,
                    discountPercent: 0
                },
                {
                    qty: 300,
                    discountPercent: 0
                },
                {
                    qty: 500,
                    discountPercent: 0
                },
                {
                    qty: 1000,
                    discountPercent: 0
                },
                {
                    qty: 2500,
                    discountPercent: 0
                }
            ];
            const tierInfo = quantityTiers.find((t)=>t.qty === quantity);
            const savePercentage = tierInfo?.discountPercent || 0;
            // Calculate discounted price based on quantity tier
            const discountedPricePerUnit = basePrice * (1 - savePercentage / 100);
            const totalPrice = discountedPricePerUnit * quantity;
            // Upload design file to server if provided
            let design_file_url;
            if (designFile) {
                try {
                    const reader = new FileReader();
                    const fileData = await new Promise((resolve)=>{
                        reader.onload = (event)=>{
                            const result = event.target?.result;
                            // Extract base64 part
                            const base64 = result.split(",")[1];
                            resolve(base64);
                        };
                        reader.readAsDataURL(designFile);
                    });
                    const token = localStorage.getItem("authToken");
                    const uploadResponse = await fetch("/api/designs/upload", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            ...token && {
                                Authorization: `Bearer ${token}`
                            }
                        },
                        body: JSON.stringify({
                            fileData,
                            fileName: designFile.name,
                            fileType: designFile.type
                        })
                    });
                    if (!uploadResponse.ok) {
                        throw new Error("Failed to upload design file");
                    }
                    const uploadData = await uploadResponse.json();
                    design_file_url = uploadData.fileUrl;
                } catch (error) {
                    console.error("Error uploading design file:", error);
                    toast({
                        title: "Warning",
                        description: "Design file upload failed. Try again or continue without uploading.",
                        variant: "destructive"
                    });
                }
            }
            const cartItem = {
                productId: productId,
                selectedOptions,
                design_file_url,
                optionalFields,
                orderNotes,
                quantity,
                pricePerUnit: discountedPricePerUnit,
                totalPrice,
                basePrice,
                savePercentage
            };
            const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
            existingCart.push(cartItem);
            localStorage.setItem("cart", JSON.stringify(existingCart));
            toast({
                title: "Success",
                description: "Product added to cart! You can continue shopping or proceed to checkout."
            });
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast({
                title: "Error",
                description: "Failed to add product to cart",
                variant: "destructive"
            });
        } finally{
            setIsAddingToCart(false);
        }
    };
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-screen bg-[#fafafa] text-black flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600",
                        children: "Loading product..."
                    }, void 0, false, {
                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                        lineNumber: 452,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/product-page/[productId]/page.tsx",
                    lineNumber: 451,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/product-page/[productId]/page.tsx",
                lineNumber: 450,
                columnNumber: 17
            }, this)
        }, void 0, false);
    }
    if (!product) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-screen bg-[#fafafa] text-black flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600",
                        children: "Product not found"
                    }, void 0, false, {
                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                        lineNumber: 464,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/product-page/[productId]/page.tsx",
                    lineNumber: 463,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/product-page/[productId]/page.tsx",
                lineNumber: 462,
                columnNumber: 17
            }, this)
        }, void 0, false);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "min-h-screen bg-white text-black",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    maxWidth: "1100px",
                    margin: "0 auto 3px",
                    padding: "12px 12px 80px"
                },
                className: "px-3 sm:px-4 lg:px-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>router.push("/ecwid-store?search="),
                        className: "flex items-center gap-2 text-blue-600 hover:text-blue-700 transition mb-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                className: "w-5 h-5"
                            }, void 0, false, {
                                fileName: "[project]/app/product-page/[productId]/page.tsx",
                                lineNumber: 487,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Back to Store"
                            }, void 0, false, {
                                fileName: "[project]/app/product-page/[productId]/page.tsx",
                                lineNumber: 488,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                        lineNumber: 483,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-3 bg-white rounded-lg border border-gray-200 p-3",
                        style: {
                            backdropFilter: "blur(4px)",
                            backgroundColor: "rgb(255, 255, 255)",
                            borderColor: "rgba(220, 220, 220, 0.8)"
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-2",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ProductGallery$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                images: product.images.map((img)=>img.url),
                                productName: product.name,
                                productDescription: product.description
                            }, void 0, false, {
                                fileName: "[project]/app/product-page/[productId]/page.tsx",
                                lineNumber: 502,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                            lineNumber: 501,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                        lineNumber: 492,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3",
                        children: [
                            product.options.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "backdrop-blur-xl bg-gray-50 border border-gray-200 rounded-lg",
                                    style: {
                                        marginRight: "0px",
                                        padding: "10px 8px 10px 8px"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-xs font-bold mb-1.5 flex items-center gap-1",
                                            children: [
                                                option.name === "Shape" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1763135086/StickerShuttle_DieCutIcon_r0vire.png",
                                                    alt: option.name,
                                                    className: "w-5 h-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                    lineNumber: 521,
                                                    columnNumber: 41
                                                }, this),
                                                option.name === "Material" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1763228661/StickerShuttle_KissCutIcon_pynbqq.png",
                                                    alt: option.name,
                                                    className: "w-5 h-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                    lineNumber: 528,
                                                    columnNumber: 41
                                                }, this),
                                                option.name === "Size" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1763135086/StickerShuttle_CircleIcon_igib6i.png",
                                                    alt: option.name,
                                                    className: "w-5 h-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                    lineNumber: 535,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "truncate",
                                                    children: [
                                                        "Select a ",
                                                        option.name
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                    lineNumber: 541,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                            lineNumber: 519,
                                            columnNumber: 33
                                        }, this),
                                        option.type === "dropdown" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-2 gap-1.5",
                                            children: option.values.map((value, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>{
                                                        const newOptions = {
                                                            ...selectedOptions,
                                                            [option.id]: value.id
                                                        };
                                                        setSelectedOptions(newOptions);
                                                        saveAsDefault(newOptions);
                                                    },
                                                    className: `relative flex flex-col items-center justify-center border-2 rounded p-1.5 transition text-center ${selectedOptions[option.id] === value.id ? "border-purple-500 bg-purple-100 shadow-lg shadow-purple-200/50" : "border-gray-200 hover:border-gray-300 bg-gray-50"}`,
                                                    children: [
                                                        option.name === "Material" && value.name?.toLowerCase() === "satin" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                            src: "https://cdn.builder.io/api/v1/image/assets%2F1e00ee8c48924560b1c928d354e4521b%2F1b04ce3e2b7342ff891113ccedd6beda?format=webp&width=800",
                                                            alt: "Satin",
                                                            className: "w-8 h-8 object-contain mb-0.5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                            lineNumber: 564,
                                                            columnNumber: 53
                                                        }, this) : value.image && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                            src: value.image.preview || value.image.url,
                                                            alt: value.name,
                                                            className: "w-8 h-8 object-contain mb-0.5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                            lineNumber: 571,
                                                            columnNumber: 57
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "font-medium text-xs text-black",
                                                            children: value.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                            lineNumber: 578,
                                                            columnNumber: 49
                                                        }, this),
                                                        value.priceModifier !== 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-gray-600 mt-0.5",
                                                            children: [
                                                                "+$",
                                                                value.priceModifier.toFixed(2)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                            lineNumber: 582,
                                                            columnNumber: 53
                                                        }, this),
                                                        index === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "absolute top-1 right-1 text-xxs font-bold text-white bg-purple-600 px-1.5 py-0.5 rounded",
                                                            style: {
                                                                fontSize: "10px"
                                                            },
                                                            children: "Popular"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                            lineNumber: 587,
                                                            columnNumber: 53
                                                        }, this)
                                                    ]
                                                }, value.id, true, {
                                                    fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                    lineNumber: 547,
                                                    columnNumber: 45
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                            lineNumber: 545,
                                            columnNumber: 37
                                        }, this),
                                        option.type === "radio" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-2 gap-1",
                                            children: option.values.map((value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>{
                                                        const newOptions = {
                                                            ...selectedOptions,
                                                            [option.id]: value.id
                                                        };
                                                        setSelectedOptions(newOptions);
                                                        saveAsDefault(newOptions);
                                                    },
                                                    className: `border-2 rounded-lg p-1 transition text-center text-xs ${selectedOptions[option.id] === value.id ? "border-purple-500 bg-purple-100" : "border-gray-200 hover:border-gray-300 bg-gray-50"}`,
                                                    children: [
                                                        value.image && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                            src: value.image.preview || value.image.url,
                                                            alt: value.name,
                                                            className: "w-8 h-8 object-cover mx-auto mb-0.5 rounded"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                            lineNumber: 618,
                                                            columnNumber: 53
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "font-medium text-xs text-black",
                                                            children: value.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                            lineNumber: 624,
                                                            columnNumber: 49
                                                        }, this),
                                                        value.priceModifier !== 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-gray-600 mt-0.5",
                                                            children: [
                                                                "+$",
                                                                value.priceModifier.toFixed(2)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                            lineNumber: 628,
                                                            columnNumber: 53
                                                        }, this)
                                                    ]
                                                }, value.id, true, {
                                                    fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                    lineNumber: 602,
                                                    columnNumber: 45
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                            lineNumber: 600,
                                            columnNumber: 37
                                        }, this),
                                        option.type === "swatch" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-2 gap-1.5",
                                            children: option.values.map((value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>{
                                                        const newOptions = {
                                                            ...selectedOptions,
                                                            [option.id]: value.id
                                                        };
                                                        setSelectedOptions(newOptions);
                                                        saveAsDefault(newOptions);
                                                    },
                                                    className: `relative border-2 rounded overflow-hidden transition flex flex-col items-center justify-center p-1 ${selectedOptions[option.id] === value.id ? "border-purple-500" : "border-gray-200 hover:border-gray-300"}`,
                                                    children: [
                                                        value.image ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                            src: value.image.preview || value.image.url,
                                                            alt: value.name,
                                                            className: "w-10 h-10 object-contain"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                            lineNumber: 656,
                                                            columnNumber: 53
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-full h-10 bg-gray-100 flex items-center justify-center",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-gray-600 text-xs text-center px-1 truncate",
                                                                children: value.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                                lineNumber: 663,
                                                                columnNumber: 57
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                            lineNumber: 662,
                                                            columnNumber: 53
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-gray-700 text-xs mt-0.5 font-medium text-center truncate",
                                                            children: value.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                            lineNumber: 668,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-purple-600 text-xs font-bold mt-0.5",
                                                            children: [
                                                                "$",
                                                                calculatePriceForValue(option.id, value.id).toFixed(2)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                            lineNumber: 671,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, value.id, true, {
                                                    fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                    lineNumber: 640,
                                                    columnNumber: 45
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                            lineNumber: 638,
                                            columnNumber: 37
                                        }, this),
                                        option.type === "text" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                            type: "text",
                                            value: selectedOptions[option.id] || "",
                                            onChange: (e)=>setSelectedOptions((prev)=>({
                                                        ...prev,
                                                        [option.id]: e.target.value
                                                    })),
                                            placeholder: `Enter ${option.name}`,
                                            className: "bg-gray-50 border-gray-200 text-black placeholder-gray-500 text-xs"
                                        }, void 0, false, {
                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                            lineNumber: 683,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, option.id, true, {
                                    fileName: "[project]/app/product-page/[productId]/page.tsx",
                                    lineNumber: 514,
                                    columnNumber: 29
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-lg border transition",
                                style: {
                                    margin: "0 0 0 0",
                                    padding: "10px 8px",
                                    backdropFilter: "blur(12px)",
                                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                                    borderColor: "rgba(255, 255, 255, 0.1)",
                                    borderWidth: "1px",
                                    boxShadow: "rgba(0, 0, 0, 0.3) 0px 8px 32px 0px, rgba(255, 255, 255, 0.1) 0px 1px 0px 0px inset"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "font-bold mb-1.5 flex items-center gap-1 text-xs",
                                        style: {
                                            fontFamily: "Rubik, sans-serif",
                                            fontSize: "12px",
                                            fontWeight: "700",
                                            color: "rgb(0, 0, 0)",
                                            lineHeight: "20px"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                fill: "none",
                                                viewBox: "0 0 24 24",
                                                stroke: "currentColor",
                                                style: {
                                                    width: "16px",
                                                    height: "16px",
                                                    stroke: "rgb(0, 0, 0)"
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    strokeWidth: "2",
                                                    d: "M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                    lineNumber: 733,
                                                    columnNumber: 37
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                lineNumber: 723,
                                                columnNumber: 33
                                            }, this),
                                            "Select a quantity"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                        lineNumber: 713,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            position: "relative"
                                        },
                                        children: getQuantityTierPricing().map((option, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{
                                                    setQuantity(option.qty);
                                                    setActiveQuantityOption(option.qty);
                                                    if (productId) {
                                                        try {
                                                            const savedDefaults = getSavedDefaults(productId);
                                                            localStorage.setItem(`product_defaults_${productId}`, JSON.stringify({
                                                                ...savedDefaults,
                                                                quantity: option.qty
                                                            }));
                                                        } catch (error) {
                                                            console.error("Failed to save default quantity:", error);
                                                        }
                                                    }
                                                },
                                                style: {
                                                    marginBottom: "3px",
                                                    width: "100%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    padding: "6px 8px",
                                                    borderRadius: "6px",
                                                    border: activeQuantityOption === option.qty ? "2px solid rgb(253, 224, 71)" : "1px solid oklab(0.714 0.117894 -0.165257 / 0.2)",
                                                    backdropFilter: "blur(12px)",
                                                    backgroundColor: activeQuantityOption === option.qty ? "rgba(253, 224, 71, 0.15)" : "rgba(255, 255, 255, 0.1)",
                                                    color: "rgb(0, 0, 0)",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontFamily: "Rubik, sans-serif",
                                                            fontSize: "14px",
                                                            fontWeight: "500",
                                                            color: "rgb(0, 0, 0)",
                                                            lineHeight: "20px"
                                                        },
                                                        children: option.qty.toLocaleString()
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                        lineNumber: 790,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: "flex",
                                                            gap: "8px",
                                                            alignItems: "center"
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontFamily: "Rubik, sans-serif",
                                                                fontWeight: "600",
                                                                color: "rgb(0, 0, 0)",
                                                                fontSize: "13px"
                                                            },
                                                            children: [
                                                                "$",
                                                                option.price.toFixed(2)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                            lineNumber: 808,
                                                            columnNumber: 45
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                        lineNumber: 801,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, option.qty, true, {
                                                fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                lineNumber: 745,
                                                columnNumber: 37
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                        lineNumber: 743,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/product-page/[productId]/page.tsx",
                                lineNumber: 700,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                        lineNumber: 511,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3",
                        children: [
                            product.optional_fields.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "backdrop-blur-xl bg-gray-50 border border-gray-200 rounded-lg p-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-xs font-bold mb-1.5",
                                        children: "✏️ Additional Instructions (optional)"
                                    }, void 0, false, {
                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                        lineNumber: 830,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1.5",
                                        children: product.optional_fields.map((field)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"], {
                                                        className: "text-gray-700 text-xs mb-1 block",
                                                        children: field.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                        lineNumber: 836,
                                                        columnNumber: 45
                                                    }, this),
                                                    field.type === "textarea" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$textarea$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Textarea"], {
                                                        value: optionalFields[field.name] || "",
                                                        onChange: (e)=>setOptionalFields((prev)=>({
                                                                    ...prev,
                                                                    [field.name]: e.target.value
                                                                })),
                                                        placeholder: `Enter any special requests or instructions here...`,
                                                        className: "bg-gray-50 border-gray-200 text-black placeholder-gray-500 min-h-12 text-xs"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                        lineNumber: 840,
                                                        columnNumber: 49
                                                    }, this) : field.type === "date" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                                        type: "date",
                                                        value: optionalFields[field.name] || "",
                                                        onChange: (e)=>setOptionalFields((prev)=>({
                                                                    ...prev,
                                                                    [field.name]: e.target.value
                                                                })),
                                                        className: "bg-gray-50 border-gray-200 text-black placeholder-gray-500 text-xs"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                        lineNumber: 852,
                                                        columnNumber: 49
                                                    }, this) : field.type === "number" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                                        type: "number",
                                                        value: optionalFields[field.name] || "",
                                                        onChange: (e)=>setOptionalFields((prev)=>({
                                                                    ...prev,
                                                                    [field.name]: e.target.value
                                                                })),
                                                        placeholder: `Enter ${field.name}`,
                                                        className: "bg-gray-50 border-gray-200 text-black placeholder-gray-500 text-xs"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                        lineNumber: 864,
                                                        columnNumber: 49
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Input"], {
                                                        type: "text",
                                                        value: optionalFields[field.name] || "",
                                                        onChange: (e)=>setOptionalFields((prev)=>({
                                                                    ...prev,
                                                                    [field.name]: e.target.value
                                                                })),
                                                        placeholder: `Enter ${field.name}`,
                                                        className: "bg-gray-50 border-gray-200 text-black placeholder-gray-500 text-xs"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                        lineNumber: 877,
                                                        columnNumber: 49
                                                    }, this)
                                                ]
                                            }, field.name, true, {
                                                fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                lineNumber: 835,
                                                columnNumber: 41
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                        lineNumber: 833,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/product-page/[productId]/page.tsx",
                                lineNumber: 829,
                                columnNumber: 29
                            }, this),
                            product.customer_upload_config.enabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "backdrop-blur-xl bg-gray-50 border border-gray-200 rounded-lg p-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-xs font-bold mb-1",
                                        children: "Upload your artwork"
                                    }, void 0, false, {
                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                        lineNumber: 899,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-600 text-xs mb-1.5",
                                        children: product.customer_upload_config.description
                                    }, void 0, false, {
                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                        lineNumber: 900,
                                        columnNumber: 33
                                    }, this),
                                    designPreview ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative bg-gray-50 border border-gray-200 rounded overflow-hidden",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: designPreview,
                                                        alt: "Design preview",
                                                        className: "w-full h-20 object-contain p-1.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                        lineNumber: 907,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: removeDesign,
                                                        className: "absolute top-2 right-2 bg-red-600/80 hover:bg-red-700 text-white p-1 rounded",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                            lineNumber: 916,
                                                            columnNumber: 49
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                        lineNumber: 912,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                lineNumber: 906,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-gray-600 text-xs",
                                                children: [
                                                    designFile?.name,
                                                    " (",
                                                    ((designFile?.size || 0) / 1024 / 1024).toFixed(2),
                                                    " MB)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                lineNumber: 919,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                        lineNumber: 905,
                                        columnNumber: 37
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-green-600 rounded p-2 cursor-pointer hover:border-green-700 transition bg-green-50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: "https://cdn.builder.io/api/v1/image/assets%2F1e00ee8c48924560b1c928d354e4521b%2Fcee606b598864f7a983db9ee1358acf5?format=webp&width=800",
                                                alt: "Upload",
                                                className: "w-8 h-8"
                                            }, void 0, false, {
                                                fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                lineNumber: 926,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-black font-medium text-xs",
                                                        children: "Drag or click to upload"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                        lineNumber: 932,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-gray-600 text-xs mt-0.5",
                                                        children: [
                                                            "All formats supported. Max file size:",
                                                            " ",
                                                            product.customer_upload_config.maxFileSize,
                                                            "MB | 1 file per order"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                        lineNumber: 935,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                lineNumber: 931,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "file",
                                                accept: product.customer_upload_config.allowedFormats.map((f)=>`.${f}`).join(","),
                                                onChange: handleDesignUpload,
                                                className: "hidden"
                                            }, void 0, false, {
                                                fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                lineNumber: 941,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                        lineNumber: 925,
                                        columnNumber: 37
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/product-page/[productId]/page.tsx",
                                lineNumber: 898,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "backdrop-blur-xl bg-gray-50 border border-gray-200 rounded-lg p-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-xs font-bold mb-1.5",
                                        children: "📝 Order Notes (optional)"
                                    }, void 0, false, {
                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                        lineNumber: 956,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$textarea$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Textarea"], {
                                        value: orderNotes,
                                        onChange: (e)=>setOrderNotes(e.target.value),
                                        placeholder: "Add any special requests or notes...",
                                        className: "bg-white border-gray-300 text-black placeholder-gray-500 min-h-10 text-xs"
                                    }, void 0, false, {
                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                        lineNumber: 959,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-600 text-xs mt-1",
                                        children: "Let us know about any special requirements or customizations"
                                    }, void 0, false, {
                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                        lineNumber: 965,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/product-page/[productId]/page.tsx",
                                lineNumber: 955,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                        lineNumber: 826,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "backdrop-blur-xl bg-gray-50 border border-gray-200 rounded-lg p-3",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                            onClick: handleAddToCart,
                                            disabled: isAddingToCart || !product.availability,
                                            className: "w-full bg-white/60 hover:bg-[#FFD713] border border-gray-300 text-black hover:text-black py-1.5 text-xs font-semibold gap-2 rounded transition-all disabled:bg-gray-100 disabled:text-gray-400",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                                    className: "w-3 h-3"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/product-page/[productId]/page.tsx",
                                                    lineNumber: 981,
                                                    columnNumber: 37
                                                }, this),
                                                isAddingToCart ? "Adding..." : !product.availability ? "Out of Stock" : "Add to Cart"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                            lineNumber: 976,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                        lineNumber: 975,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "backdrop-blur-xl bg-gray-50 border border-gray-200 rounded-lg p-3",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                            onClick: ()=>router.push("/checkout-new"),
                                            className: "w-full bg-white/60 hover:bg-[#FFD713] border border-gray-300 text-black hover:text-black py-1.5 text-xs font-semibold gap-2 rounded transition-all",
                                            children: "🛒 Checkout"
                                        }, void 0, false, {
                                            fileName: "[project]/app/product-page/[productId]/page.tsx",
                                            lineNumber: 992,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                                        lineNumber: 991,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/product-page/[productId]/page.tsx",
                                lineNumber: 973,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-center text-gray-600 text-xs",
                                children: "Continue adding products or proceed to checkout when ready"
                            }, void 0, false, {
                                fileName: "[project]/app/product-page/[productId]/page.tsx",
                                lineNumber: 1001,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/product-page/[productId]/page.tsx",
                        lineNumber: 972,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/product-page/[productId]/page.tsx",
                lineNumber: 474,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/product-page/[productId]/page.tsx",
            lineNumber: 473,
            columnNumber: 13
        }, this)
    }, void 0, false);
}
}),
];

//# sourceMappingURL=_0dbae662._.js.map