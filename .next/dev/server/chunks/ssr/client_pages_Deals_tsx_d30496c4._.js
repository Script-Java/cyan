module.exports = [
"[project]/client/pages/Deals.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Deals
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-cart.js [app-ssr] (ecmascript) <export default as ShoppingCart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-ssr] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$router$2d$dom$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/react-router-dom/dist/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
;
;
function Deals() {
    const [products, setProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchProducts();
    }, []);
    const fetchProducts = async ()=>{
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch("/api/storefront/products?limit=100");
            if (!response.ok) {
                throw new Error("Failed to fetch products");
            }
            const data = await response.json();
            const formattedProducts = (data.items || []).map((product)=>{
                const minPrice = product.min_price || product.price;
                const maxPrice = product.max_price || product.price;
                return {
                    id: product.id,
                    name: product.name,
                    price: minPrice,
                    min_price: minPrice,
                    max_price: maxPrice,
                    image: product.image_url || "/placeholder.svg",
                    rating: product.rating || 0,
                    reviews: product.reviews_count || 0,
                    description: product.description || "Premium sticker product from our collection",
                    sku: product.sku,
                    variations: product.variations || [],
                    options: product.options || []
                };
            });
            if (formattedProducts.length === 0) {
                setProducts(getDefaultProducts());
            } else {
                setProducts(formattedProducts);
            }
        } catch (err) {
            console.error("Error fetching products:", err);
            setError(err instanceof Error ? err.message : "Failed to load products");
            setProducts(getDefaultProducts());
        } finally{
            setIsLoading(false);
        }
    };
    const getDefaultProducts = ()=>[
            {
                id: "test-square-product",
                name: "Test Square Product",
                price: 1.0,
                image: "/placeholder.svg",
                rating: 5.0,
                reviews: 1,
                description: "Perfect for testing Square checkout integration.",
                badge: "Deal"
            },
            {
                id: "vinyl-stickers",
                name: "Vinyl Stickers",
                price: 0.25,
                image: "/placeholder.svg",
                rating: 4.8,
                reviews: 234,
                description: "Durable vinyl stickers for any surface.",
                badge: "Deal"
            },
            {
                id: "die-cut-stickers",
                name: "Die-Cut Stickers",
                price: 0.3,
                image: "/placeholder.svg",
                rating: 4.9,
                reviews: 189,
                description: "Custom-cut stickers with any shape.",
                badge: "Hot"
            },
            {
                id: "holographic-stickers",
                name: "Holographic Stickers",
                price: 0.45,
                image: "/placeholder.svg",
                rating: 4.9,
                reviews: 156,
                description: "Eye-catching holographic effect.",
                badge: "Deal"
            },
            {
                id: "clear-stickers",
                name: "Clear Stickers",
                price: 0.2,
                image: "/placeholder.svg",
                rating: 4.7,
                reviews: 198,
                description: "Transparent stickers vibrant colors.",
                badge: "Deal"
            },
            {
                id: "glitter-stickers",
                name: "Glitter Stickers",
                price: 0.35,
                image: "/placeholder.svg",
                rating: 4.6,
                reviews: 145,
                description: "Add sparkle with glitter finish.",
                badge: "Hot"
            },
            {
                id: "chrome-stickers",
                name: "Chrome Stickers",
                price: 0.5,
                image: "/placeholder.svg",
                rating: 4.8,
                reviews: 167,
                description: "Metallic chrome premium look.",
                badge: "Deal"
            },
            {
                id: "sticker-sheets",
                name: "Sticker Sheets",
                price: 2.5,
                image: "/placeholder.svg",
                rating: 4.7,
                reviews: 203,
                description: "Multiple stickers in one sheet.",
                badge: "Popular"
            },
            {
                id: "matte-stickers",
                name: "Matte Stickers",
                price: 0.28,
                image: "/placeholder.svg",
                rating: 4.6,
                reviews: 112,
                description: "Subtle matte finish stickers.",
                badge: "Deal"
            },
            {
                id: "waterproof-stickers",
                name: "Waterproof Stickers",
                price: 0.4,
                image: "/placeholder.svg",
                rating: 4.9,
                reviews: 178,
                description: "Perfect for outdoor use.",
                badge: "Deal"
            },
            {
                id: "metallic-stickers",
                name: "Metallic Stickers",
                price: 0.55,
                image: "/placeholder.svg",
                rating: 4.7,
                reviews: 134,
                description: "Shiny metallic finish stickers.",
                badge: "Hot"
            },
            {
                id: "bubble-free-stickers",
                name: "Bubble-Free Stickers",
                price: 0.32,
                image: "/placeholder.svg",
                rating: 4.8,
                reviews: 191,
                description: "Easy application bubble-free.",
                badge: "Deal"
            },
            {
                id: "eco-stickers",
                name: "Eco-Friendly Stickers",
                price: 0.45,
                image: "/placeholder.svg",
                rating: 4.6,
                reviews: 98,
                description: "Sustainable eco-friendly option.",
                badge: "Green"
            },
            {
                id: "uv-resistant-stickers",
                name: "UV-Resistant Stickers",
                price: 0.42,
                image: "/placeholder.svg",
                rating: 4.8,
                reviews: 156,
                description: "Sun-proof UV-resistant stickers.",
                badge: "Deal"
            },
            {
                id: "bumper-stickers",
                name: "Bumper Stickers",
                price: 0.75,
                image: "/placeholder.svg",
                rating: 4.7,
                reviews: 142,
                description: "Large format bumper stickers.",
                badge: "Deal"
            },
            {
                id: "kiss-cut-stickers",
                name: "Kiss-Cut Stickers",
                price: 0.38,
                image: "/placeholder.svg",
                rating: 4.9,
                reviews: 167,
                description: "Kiss-cut individual stickers.",
                badge: "Popular"
            }
        ];
    const getPriceDisplay = (product)=>{
        if (product.min_price && product.max_price && product.min_price !== product.max_price) {
            return `$${product.min_price.toFixed(2)} - $${product.max_price.toFixed(2)} per sticker`;
        }
        return `$${(product.price || 0).toFixed(2)} per sticker`;
    };
    const getBadgeColor = (badge)=>{
        switch(badge?.toLowerCase()){
            case "hot":
                return "bg-red-600 text-white";
            case "deal":
                return "bg-[#F63049] text-white";
            case "green":
                return "bg-emerald-600 text-white";
            case "popular":
                return "bg-[#030140] text-white";
            default:
                return "bg-[#030140] text-white";
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "pt-20 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-full mx-auto px-2 sm:px-3 lg:px-4",
                style: {
                    padding: "16px 16px 50px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-8 text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl sm:text-4xl font-bold text-[#030140] mb-2",
                                children: "Deals & Offers"
                            }, void 0, false, {
                                fileName: "[project]/client/pages/Deals.tsx",
                                lineNumber: 294,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-base text-gray-600",
                                children: "Discover our best deals on premium stickers"
                            }, void 0, false, {
                                fileName: "[project]/client/pages/Deals.tsx",
                                lineNumber: 297,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/client/pages/Deals.tsx",
                        lineNumber: 293,
                        columnNumber: 11
                    }, this),
                    isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-center items-center py-12",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#F63049] mb-3"
                                }, void 0, false, {
                                    fileName: "[project]/client/pages/Deals.tsx",
                                    lineNumber: 306,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-600 text-sm",
                                    children: "Loading deals..."
                                }, void 0, false, {
                                    fileName: "[project]/client/pages/Deals.tsx",
                                    lineNumber: 307,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/client/pages/Deals.tsx",
                            lineNumber: 305,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/client/pages/Deals.tsx",
                        lineNumber: 304,
                        columnNumber: 13
                    }, this),
                    error && products.length === 0 && !isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-red-50 border border-red-200 rounded-lg p-4 mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-red-700 text-sm",
                                children: [
                                    "Error: ",
                                    error
                                ]
                            }, void 0, true, {
                                fileName: "[project]/client/pages/Deals.tsx",
                                lineNumber: 315,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: fetchProducts,
                                className: "mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs",
                                children: "Try Again"
                            }, void 0, false, {
                                fileName: "[project]/client/pages/Deals.tsx",
                                lineNumber: 316,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/client/pages/Deals.tsx",
                        lineNumber: 314,
                        columnNumber: 13
                    }, this),
                    !isLoading && products.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3",
                        children: products.map((product)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "group rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full border border-gray-200",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative bg-gray-100 aspect-square overflow-hidden flex items-center justify-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: product.image,
                                                alt: product.name,
                                                className: "w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                            }, void 0, false, {
                                                fileName: "[project]/client/pages/Deals.tsx",
                                                lineNumber: 335,
                                                columnNumber: 21
                                            }, this),
                                            product.badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `absolute top-2 right-2 ${getBadgeColor(product.badge)} px-2 py-1 rounded text-xs font-bold`,
                                                children: product.badge
                                            }, void 0, false, {
                                                fileName: "[project]/client/pages/Deals.tsx",
                                                lineNumber: 341,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/client/pages/Deals.tsx",
                                        lineNumber: 334,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-2 flex flex-col flex-grow",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-[#030140] text-xs mb-1 group-hover:text-[#F63049] transition-colors line-clamp-2",
                                            children: product.name
                                        }, void 0, false, {
                                            fileName: "[project]/client/pages/Deals.tsx",
                                            lineNumber: 351,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/client/pages/Deals.tsx",
                                        lineNumber: 350,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$router$2d$dom$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Link"], {
                                        to: `/product/${product.id}`,
                                        className: "mx-2 mb-2 py-2 px-2 bg-[#F63049] hover:bg-[#d62a3f] text-white rounded-md text-center flex items-center justify-center gap-1 text-xs font-semibold transition-all shadow-sm hover:shadow-md",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"], {
                                                className: "w-3 h-3"
                                            }, void 0, false, {
                                                fileName: "[project]/client/pages/Deals.tsx",
                                                lineNumber: 361,
                                                columnNumber: 21
                                            }, this),
                                            "View"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/client/pages/Deals.tsx",
                                        lineNumber: 357,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, product.id, true, {
                                fileName: "[project]/client/pages/Deals.tsx",
                                lineNumber: 329,
                                columnNumber: 17
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/client/pages/Deals.tsx",
                        lineNumber: 327,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-10 text-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$router$2d$dom$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Link"], {
                            to: "/products",
                            className: "inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#F63049] hover:bg-[#d62a3f] text-white rounded-lg font-bold transition-all text-base shadow-lg shadow-[#F63049]/30",
                            children: [
                                "Explore All Products",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/client/pages/Deals.tsx",
                                    lineNumber: 376,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/client/pages/Deals.tsx",
                            lineNumber: 371,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/client/pages/Deals.tsx",
                        lineNumber: 370,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontWeight: "400",
                            textAlign: "left",
                            paddingTop: "40px",
                            fontSize: "12px",
                            color: "rgba(0, 0, 0, 0.5)"
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "© Stickerland LLC"
                        }, void 0, false, {
                            fileName: "[project]/client/pages/Deals.tsx",
                            lineNumber: 390,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/client/pages/Deals.tsx",
                        lineNumber: 381,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/client/pages/Deals.tsx",
                lineNumber: 288,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/client/pages/Deals.tsx",
            lineNumber: 287,
            columnNumber: 7
        }, this)
    }, void 0, false);
}
}),
];

//# sourceMappingURL=client_pages_Deals_tsx_d30496c4._.js.map