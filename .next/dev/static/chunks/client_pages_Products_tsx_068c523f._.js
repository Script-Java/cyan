(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/client/pages/Products.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Products
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-cart.js [app-client] (ecmascript) <export default as ShoppingCart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$router$2d$dom$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/react-router-dom/dist/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
function Products() {
    _s();
    const [searchParams] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$router$2d$dom$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useSearchParams"])();
    const selectedCategory = searchParams.get("category");
    const [products, setProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [expandedProduct, setExpandedProduct] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const categoryMap = {
        "Vinyl Stickers": "vinyl",
        "Holographic Stickers": "holographic",
        "Glitter Stickers": "glitter",
        "Chrome Stickers": "chrome",
        "Clear Stickers": "clear",
        "Sticker Sheets": "sheets"
    };
    const categories = [
        {
            id: "vinyl",
            name: "Vinyl Stickers",
            description: "Durable vinyl stickers perfect for laptops and outdoor use",
            image: "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749593599/Alien_Rocket_mkwlag.png"
        },
        {
            id: "holographic",
            name: "Holographic Stickers",
            description: "Eye-catching holographic stickers that shimmer in the light",
            image: "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749593621/PurpleAlien_StickerShuttle_HolographicIcon_ukdotq.png"
        },
        {
            id: "glitter",
            name: "Glitter Stickers",
            description: "Add sparkle with vibrant glitter stickers",
            image: "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749593602/BlueAlien_StickerShuttle_GlitterIcon_rocwpi.png"
        },
        {
            id: "chrome",
            name: "Chrome Stickers",
            description: "Metallic chrome stickers for a premium look",
            image: "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749593680/yELLOWAlien_StickerShuttle_ChromeIcon_nut4el.png"
        },
        {
            id: "clear",
            name: "Clear Stickers",
            description: "Transparent stickers with vibrant full-color printing",
            image: "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749849590/StickerShuttle_ClearIcon_zxjnqc.svg"
        },
        {
            id: "sheets",
            name: "Sticker Sheets",
            description: "Get multiple stickers in one convenient sheet",
            image: "https://res.cloudinary.com/dxcnvqk6b/image/upload/v1749847809/StickerShuttle_StickerSheetsIcon_2_g61dty.svg"
        }
    ];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Products.useEffect": ()=>{
            fetchProducts();
        }
    }["Products.useEffect"], []);
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
                    category: product.group,
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
    const FEATURED_PRODUCTS = [
        {
            id: "astronaut-moon",
            name: "Astronaut on Moon",
            price: 4.0,
            image: "/images/stickers/astronaut-moon.png",
            rating: 5.0,
            reviews: 12,
            description: "High-quality vinyl sticker featuring an astronaut sitting on a circuit board moon.",
            badge: "New Arrival",
            category: "vinyl"
        },
        {
            id: "psychedelic-smiley",
            name: "Melting Smiley",
            price: 3.5,
            image: "/images/stickers/psychedelic-smiley.png",
            rating: 4.8,
            reviews: 8,
            description: "Trippy melting smiley face with vibrant psychedelic colors.",
            badge: "Best Seller",
            category: "holographic"
        },
        {
            id: "neon-cassette",
            name: "Neon Cassette",
            price: 3.0,
            image: "/images/stickers/neon-cassette.png",
            rating: 4.9,
            reviews: 15,
            description: "Retro synthwave style cassette tape with neon cyber aesthetics.",
            badge: "Retro",
            category: "vinyl"
        },
        {
            id: "graffiti-sneaker",
            name: "Graffiti Sneaker",
            price: 4.5,
            image: "/images/stickers/graffiti-sneaker.png",
            rating: 4.7,
            reviews: 6,
            description: "Urban style chunky sneaker with dripping graffiti art details.",
            badge: "Street",
            category: "vinyl"
        },
        {
            id: "cyber-wolf",
            name: "Cyber Wolf",
            price: 5.0,
            image: "/images/stickers/cyber-wolf.png",
            rating: 5.0,
            reviews: 20,
            description: "Intricate red and black cybernetic wolf mask design.",
            badge: "Premium",
            category: "chrome"
        }
    ];
    const getDefaultProducts = ()=>[
            ...FEATURED_PRODUCTS,
            {
                id: "test-square-product",
                name: "Test Square Product",
                price: 1.0,
                image: "/placeholder.svg",
                rating: 5.0,
                reviews: 1,
                description: "Perfect for testing Square checkout integration. $1.00 product.",
                badge: "Test"
            },
            {
                id: "vinyl-stickers",
                name: "Vinyl Stickers",
                price: 0.25,
                image: "/placeholder.svg",
                rating: 4.8,
                reviews: 234,
                description: "Durable vinyl stickers perfect for laptops and outdoor use.",
                badge: "Popular"
            },
            {
                id: "die-cut-stickers",
                name: "Die-Cut Stickers",
                price: 0.3,
                image: "/placeholder.svg",
                rating: 4.9,
                reviews: 189,
                description: "Custom-cut stickers with any shape you design.",
                badge: "Premium"
            },
            {
                id: "holographic-stickers",
                name: "Holographic Stickers",
                price: 0.45,
                image: "/placeholder.svg",
                rating: 4.9,
                reviews: 156,
                description: "Eye-catching holographic stickers that shimmer in the light.",
                badge: "Trending"
            },
            {
                id: "clear-stickers",
                name: "Clear Stickers",
                price: 0.2,
                image: "/placeholder.svg",
                rating: 4.7,
                reviews: 198,
                description: "Transparent stickers with vibrant full-color printing.",
                badge: "Budget"
            }
        ];
    const getPriceDisplay = (product)=>{
        if (product.min_price && product.max_price && product.min_price !== product.max_price) {
            return `$${product.min_price.toFixed(2)} - $${product.max_price.toFixed(2)}`;
        }
        return `$${(product.price || 0).toFixed(2)}`;
    };
    const filteredProducts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Products.useMemo[filteredProducts]": ()=>{
            if (!selectedCategory) {
                return products;
            }
            return products.filter({
                "Products.useMemo[filteredProducts]": (product)=>{
                    // Get the category ID that matches the product's group
                    const categoryId = Object.entries(categoryMap).find({
                        "Products.useMemo[filteredProducts]": ([name])=>name === product.category
                    }["Products.useMemo[filteredProducts]"])?.[1];
                    // Match if the category ID matches the selected category, or if product name contains category
                    return categoryId === selectedCategory || product.name?.toLowerCase().includes(selectedCategory.toLowerCase());
                }
            }["Products.useMemo[filteredProducts]"]);
        }
    }["Products.useMemo[filteredProducts]"], [
        products,
        selectedCategory,
        categoryMap
    ]);
    const getCategoryItemCount = (categoryId)=>{
        return products.filter((product)=>{
            // Get the category ID that matches the product's group
            const productCategoryId = Object.entries(categoryMap).find(([name])=>name === product.category)?.[1];
            // Count if the category ID matches or if product name contains category
            return productCategoryId === categoryId || product.name?.toLowerCase().includes(categoryId.toLowerCase());
        }).length;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "pt-16 bg-white text-gray-900 min-h-screen",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",
                children: [
                    !selectedCategory && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-12",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-4xl sm:text-5xl font-bold text-center mb-2",
                                children: [
                                    "Shop Our Premium",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "block bg-gradient-to-r from-[#FFD713] to-[#FFA500] bg-clip-text text-transparent",
                                        children: "Sticker Collection"
                                    }, void 0, false, {
                                        fileName: "[project]/client/pages/Products.tsx",
                                        lineNumber: 334,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/client/pages/Products.tsx",
                                lineNumber: 332,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-center text-gray-600 text-lg mb-8",
                                children: "Choose from our wide range of high-quality stickers"
                            }, void 0, false, {
                                fileName: "[project]/client/pages/Products.tsx",
                                lineNumber: 338,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/client/pages/Products.tsx",
                        lineNumber: 331,
                        columnNumber: 13
                    }, this),
                    selectedCategory && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-8 flex items-center justify-between gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-3xl font-bold text-gray-900",
                                        children: categories.find((c)=>c.id === selectedCategory)?.name || "Products"
                                    }, void 0, false, {
                                        fileName: "[project]/client/pages/Products.tsx",
                                        lineNumber: 348,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-600 mt-1",
                                        children: [
                                            filteredProducts.length,
                                            " product",
                                            filteredProducts.length !== 1 ? "s" : "",
                                            " available"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/client/pages/Products.tsx",
                                        lineNumber: 352,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/client/pages/Products.tsx",
                                lineNumber: 347,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$router$2d$dom$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Link"], {
                                to: "/products",
                                className: "px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-sm font-medium whitespace-nowrap text-gray-900",
                                children: "View All"
                            }, void 0, false, {
                                fileName: "[project]/client/pages/Products.tsx",
                                lineNumber: 357,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/client/pages/Products.tsx",
                        lineNumber: 346,
                        columnNumber: 13
                    }, this),
                    isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-center items-center py-12",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"
                                }, void 0, false, {
                                    fileName: "[project]/client/pages/Products.tsx",
                                    lineNumber: 370,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-600 text-sm",
                                    children: "Loading products..."
                                }, void 0, false, {
                                    fileName: "[project]/client/pages/Products.tsx",
                                    lineNumber: 371,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/client/pages/Products.tsx",
                            lineNumber: 369,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/client/pages/Products.tsx",
                        lineNumber: 368,
                        columnNumber: 13
                    }, this),
                    error && products.length === 0 && !isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-red-50 border border-red-200 rounded-lg p-4 mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-red-800 text-sm",
                                children: [
                                    "Error: ",
                                    error
                                ]
                            }, void 0, true, {
                                fileName: "[project]/client/pages/Products.tsx",
                                lineNumber: 379,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: fetchProducts,
                                className: "mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs",
                                children: "Try Again"
                            }, void 0, false, {
                                fileName: "[project]/client/pages/Products.tsx",
                                lineNumber: 380,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/client/pages/Products.tsx",
                        lineNumber: 378,
                        columnNumber: 13
                    }, this),
                    !isLoading && selectedCategory && filteredProducts.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center py-12",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-600 text-sm mb-4",
                                children: "No products found in this category."
                            }, void 0, false, {
                                fileName: "[project]/client/pages/Products.tsx",
                                lineNumber: 392,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$router$2d$dom$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Link"], {
                                to: "/products",
                                className: "inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm",
                                children: "View All Categories"
                            }, void 0, false, {
                                fileName: "[project]/client/pages/Products.tsx",
                                lineNumber: 395,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/client/pages/Products.tsx",
                        lineNumber: 391,
                        columnNumber: 13
                    }, this),
                    !isLoading && filteredProducts.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
                        children: filteredProducts.map((product)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "group rounded-lg overflow-hidden bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 flex flex-col shadow-sm hover:shadow-md",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative bg-gray-100 aspect-square overflow-hidden flex items-center justify-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: product.image,
                                                alt: product.name,
                                                className: "w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                            }, void 0, false, {
                                                fileName: "[project]/client/pages/Products.tsx",
                                                lineNumber: 414,
                                                columnNumber: 21
                                            }, this),
                                            product.badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute top-3 right-3 bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-bold",
                                                children: product.badge
                                            }, void 0, false, {
                                                fileName: "[project]/client/pages/Products.tsx",
                                                lineNumber: 420,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/client/pages/Products.tsx",
                                        lineNumber: 413,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-3 flex flex-col flex-grow",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "font-bold text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors line-clamp-2",
                                                children: product.name
                                            }, void 0, false, {
                                                fileName: "[project]/client/pages/Products.tsx",
                                                lineNumber: 428,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-gray-600 mb-2 flex-grow line-clamp-2",
                                                children: product.description
                                            }, void 0, false, {
                                                fileName: "[project]/client/pages/Products.tsx",
                                                lineNumber: 432,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-1 mb-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex gap-0.5",
                                                        children: [
                                                            ...Array(5)
                                                        ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                                className: `w-3 h-3 ${i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`
                                                            }, i, false, {
                                                                fileName: "[project]/client/pages/Products.tsx",
                                                                lineNumber: 440,
                                                                columnNumber: 27
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/client/pages/Products.tsx",
                                                        lineNumber: 438,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs text-gray-600",
                                                        children: [
                                                            product.rating || 0,
                                                            " (",
                                                            product.reviews || 0,
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/client/pages/Products.tsx",
                                                        lineNumber: 449,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/client/pages/Products.tsx",
                                                lineNumber: 437,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs text-gray-600",
                                                        children: "from"
                                                    }, void 0, false, {
                                                        fileName: "[project]/client/pages/Products.tsx",
                                                        lineNumber: 456,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-lg font-bold text-gray-900",
                                                        children: getPriceDisplay(product)
                                                    }, void 0, false, {
                                                        fileName: "[project]/client/pages/Products.tsx",
                                                        lineNumber: 457,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/client/pages/Products.tsx",
                                                lineNumber: 455,
                                                columnNumber: 21
                                            }, this),
                                            product.variations && product.variations.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setExpandedProduct(expandedProduct === product.id ? null : product.id),
                                                className: "mb-2 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors",
                                                children: [
                                                    "View ",
                                                    product.variations.length,
                                                    " Options",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                        className: `w-3 h-3 transition-transform ${expandedProduct === product.id ? "rotate-180" : ""}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/client/pages/Products.tsx",
                                                        lineNumber: 473,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/client/pages/Products.tsx",
                                                lineNumber: 464,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/client/pages/Products.tsx",
                                        lineNumber: 427,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$router$2d$dom$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Link"], {
                                        to: `/product/${product.id}`,
                                        className: "mx-3 mb-3 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-300 text-center flex items-center justify-center gap-1 text-xs",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"], {
                                                className: "w-3 h-3"
                                            }, void 0, false, {
                                                fileName: "[project]/client/pages/Products.tsx",
                                                lineNumber: 486,
                                                columnNumber: 21
                                            }, this),
                                            "Add to Cart"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/client/pages/Products.tsx",
                                        lineNumber: 482,
                                        columnNumber: 19
                                    }, this),
                                    expandedProduct === product.id && product.variations && product.variations.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-3 bg-gray-50 border-t border-gray-200 space-y-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                className: "font-semibold text-xs text-gray-900 mb-2",
                                                children: "Options:"
                                            }, void 0, false, {
                                                fileName: "[project]/client/pages/Products.tsx",
                                                lineNumber: 495,
                                                columnNumber: 25
                                            }, this),
                                            product.variations.slice(0, 8).map((variation)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-between text-xs bg-white border border-gray-200 rounded p-1.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: variation.attributes && Object.keys(variation.attributes).length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-gray-800",
                                                                children: Object.entries(variation.attributes).map(([key, val])=>`${val}`).join(" • ")
                                                            }, void 0, false, {
                                                                fileName: "[project]/client/pages/Products.tsx",
                                                                lineNumber: 506,
                                                                columnNumber: 33
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-gray-600",
                                                                children: variation.id
                                                            }, void 0, false, {
                                                                fileName: "[project]/client/pages/Products.tsx",
                                                                lineNumber: 512,
                                                                columnNumber: 33
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/client/pages/Products.tsx",
                                                            lineNumber: 503,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-semibold text-gray-900",
                                                            children: [
                                                                "$",
                                                                variation.price.toFixed(2)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/client/pages/Products.tsx",
                                                            lineNumber: 517,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, variation.id, true, {
                                                    fileName: "[project]/client/pages/Products.tsx",
                                                    lineNumber: 499,
                                                    columnNumber: 27
                                                }, this)),
                                            product.variations.length > 8 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-gray-500 text-center pt-1",
                                                children: [
                                                    "+",
                                                    product.variations.length - 8,
                                                    " more"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/client/pages/Products.tsx",
                                                lineNumber: 523,
                                                columnNumber: 27
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/client/pages/Products.tsx",
                                        lineNumber: 494,
                                        columnNumber: 23
                                    }, this)
                                ]
                            }, product.id, true, {
                                fileName: "[project]/client/pages/Products.tsx",
                                lineNumber: 408,
                                columnNumber: 17
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/client/pages/Products.tsx",
                        lineNumber: 406,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/client/pages/Products.tsx",
                lineNumber: 328,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/client/pages/Products.tsx",
            lineNumber: 327,
            columnNumber: 7
        }, this)
    }, void 0, false);
}
_s(Products, "hTYxxNz0hF3+zMUo/Ls4V52BgdY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$router$2d$dom$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useSearchParams"]
    ];
});
_c = Products;
var _c;
__turbopack_context__.k.register(_c, "Products");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=client_pages_Products_tsx_068c523f._.js.map