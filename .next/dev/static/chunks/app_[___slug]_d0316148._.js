(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/[...slug]/route-map.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// This file maps URL paths to their corresponding page components
// Each entry is lazily loaded to improve initial bundle size
__turbopack_context__.s([
    "availableRoutes",
    ()=>availableRoutes,
    "matchRoute",
    ()=>matchRoute,
    "routeMap",
    ()=>routeMap
]);
const routeMap = {
    // Phase 1: Core public routes (high priority, test these first)
    "/": ()=>__turbopack_context__.A("[project]/client/pages/Index.tsx [app-client] (ecmascript, async loader)"),
    "/deals": ()=>__turbopack_context__.A("[project]/client/pages/Deals.tsx [app-client] (ecmascript, async loader)"),
    "/blogs": ()=>__turbopack_context__.A("[project]/client/pages/Blogs.tsx [app-client] (ecmascript, async loader)"),
    "/products": ()=>__turbopack_context__.A("[project]/client/pages/Products.tsx [app-client] (ecmascript, async loader)"),
    "/product/:id": ()=>__turbopack_context__.A("[project]/client/pages/Product.tsx [app-client] (ecmascript, async loader)"),
    "/designs": ()=>__turbopack_context__.A("[project]/client/pages/Designs.tsx [app-client] (ecmascript, async loader)"),
    "/legal": ()=>__turbopack_context__.A("[project]/client/pages/LegalPages.tsx [app-client] (ecmascript, async loader)"),
    "/legal/:slug": ()=>__turbopack_context__.A("[project]/client/pages/LegalPage.tsx [app-client] (ecmascript, async loader)"),
    "/support": ()=>__turbopack_context__.A("[project]/client/pages/Support.tsx [app-client] (ecmascript, async loader)"),
    "/cart": ()=>__turbopack_context__.A("[project]/client/pages/Cart.tsx [app-client] (ecmascript, async loader)"),
    "/checkout": ()=>__turbopack_context__.A("[project]/client/pages/Checkout.tsx [app-client] (ecmascript, async loader)"),
    "/checkout/success": ()=>__turbopack_context__.A("[project]/client/pages/CheckoutSuccess.tsx [app-client] (ecmascript, async loader)"),
    "/login": ()=>__turbopack_context__.A("[project]/client/pages/Login.tsx [app-client] (ecmascript, async loader)"),
    "/signup": ()=>__turbopack_context__.A("[project]/client/pages/Signup.tsx [app-client] (ecmascript, async loader)"),
    "/forgot-password": ()=>__turbopack_context__.A("[project]/client/pages/ForgotPassword.tsx [app-client] (ecmascript, async loader)"),
    "/reset-password": ()=>__turbopack_context__.A("[project]/client/pages/ResetPassword.tsx [app-client] (ecmascript, async loader)"),
    // Phase 2: Dashboard and account routes
    "/dashboard": ()=>__turbopack_context__.A("[project]/client/pages/Dashboard.tsx [app-client] (ecmascript, async loader)"),
    "/account-settings": ()=>__turbopack_context__.A("[project]/client/pages/AccountSettings.tsx [app-client] (ecmascript, async loader)"),
    "/order-history": ()=>__turbopack_context__.A("[project]/client/pages/OrderHistory.tsx [app-client] (ecmascript, async loader)"),
    "/order/:id": ()=>__turbopack_context__.A("[project]/client/pages/OrderDetails.tsx [app-client] (ecmascript, async loader)"),
    "/order-confirmation": ()=>__turbopack_context__.A("[project]/client/pages/OrderConfirmation.tsx [app-client] (ecmascript, async loader)"),
    "/order-status": ()=>__turbopack_context__.A("[project]/client/pages/OrderStatus.tsx [app-client] (ecmascript, async loader)"),
    "/finances": ()=>__turbopack_context__.A("[project]/client/pages/Finances.tsx [app-client] (ecmascript, async loader)"),
    "/my-tickets": ()=>__turbopack_context__.A("[project]/client/pages/MyTickets.tsx [app-client] (ecmascript, async loader)"),
    "/proofs": ()=>__turbopack_context__.A("[project]/client/pages/Proofs.tsx [app-client] (ecmascript, async loader)"),
    "/proof-approval": ()=>__turbopack_context__.A("[project]/client/pages/ProofApproval.tsx [app-client] (ecmascript, async loader)"),
    "/proof-approval/:token": ()=>__turbopack_context__.A("[project]/client/pages/ProofApprovalPublic.tsx [app-client] (ecmascript, async loader)"),
    // Phase 3: Admin routes
    "/admin": ()=>__turbopack_context__.A("[project]/client/pages/AdminDashboard.tsx [app-client] (ecmascript, async loader)"),
    "/admin/dashboard": ()=>__turbopack_context__.A("[project]/client/pages/AdminDashboard.tsx [app-client] (ecmascript, async loader)"),
    "/admin/analytics": ()=>__turbopack_context__.A("[project]/client/pages/AdminAnalytics.tsx [app-client] (ecmascript, async loader)"),
    "/admin/customers": ()=>__turbopack_context__.A("[project]/client/pages/AdminCustomers.tsx [app-client] (ecmascript, async loader)"),
    "/admin/customers/:id": ()=>__turbopack_context__.A("[project]/client/pages/AdminCustomerDetail.tsx [app-client] (ecmascript, async loader)"),
    "/admin/orders": ()=>__turbopack_context__.A("[project]/client/pages/AdminOrders.tsx [app-client] (ecmascript, async loader)"),
    "/admin/orders/:id": ()=>__turbopack_context__.A("[project]/client/pages/AdminOrderDetail.tsx [app-client] (ecmascript, async loader)"),
    "/admin/products": ()=>__turbopack_context__.A("[project]/client/pages/AdminProducts.tsx [app-client] (ecmascript, async loader)"),
    "/admin/blogs": ()=>__turbopack_context__.A("[project]/client/pages/AdminBlogs.tsx [app-client] (ecmascript, async loader)"),
    "/admin/proofs": ()=>__turbopack_context__.A("[project]/client/pages/AdminProofs.tsx [app-client] (ecmascript, async loader)"),
    "/admin/gallery": ()=>__turbopack_context__.A("[project]/client/pages/AdminGallery.tsx [app-client] (ecmascript, async loader)"),
    "/admin/discounts": ()=>__turbopack_context__.A("[project]/client/pages/AdminDiscounts.tsx [app-client] (ecmascript, async loader)"),
    "/admin/reviews": ()=>__turbopack_context__.A("[project]/client/pages/AdminReviews.tsx [app-client] (ecmascript, async loader)"),
    "/admin/finance": ()=>__turbopack_context__.A("[project]/client/pages/AdminFinance.tsx [app-client] (ecmascript, async loader)"),
    "/admin/settings": ()=>__turbopack_context__.A("[project]/client/pages/AdminSettings.tsx [app-client] (ecmascript, async loader)"),
    "/admin/legal-pages": ()=>__turbopack_context__.A("[project]/client/pages/AdminLegalPages.tsx [app-client] (ecmascript, async loader)"),
    "/admin/return-refund-policy": ()=>__turbopack_context__.A("[project]/client/pages/AdminReturnRefundPolicy.tsx [app-client] (ecmascript, async loader)"),
    "/admin/support": ()=>__turbopack_context__.A("[project]/client/pages/AdminSupport.tsx [app-client] (ecmascript, async loader)"),
    "/admin/shipping": ()=>__turbopack_context__.A("[project]/client/pages/AdminShipping.tsx [app-client] (ecmascript, async loader)"),
    "/admin/invoices": ()=>__turbopack_context__.A("[project]/client/pages/AdminInvoices.tsx [app-client] (ecmascript, async loader)"),
    "/invoice/:token": ()=>__turbopack_context__.A("[project]/client/pages/CustomerInvoiceView.tsx [app-client] (ecmascript, async loader)"),
    // Phase 4: Advanced/Complex routes
    "/blog/:id": ()=>__turbopack_context__.A("[project]/client/pages/BlogPost.tsx [app-client] (ecmascript, async loader)"),
    "/product-page/:productId": ()=>__turbopack_context__.A("[project]/client/pages/ProductPage.tsx [app-client] (ecmascript, async loader)"),
    "/ecwid-store": ()=>__turbopack_context__.A("[project]/client/pages/EcwidStore.tsx [app-client] (ecmascript, async loader)"),
    "/ecwid-product/:id": ()=>__turbopack_context__.A("[project]/client/pages/EcwidProductDetail.tsx [app-client] (ecmascript, async loader)"),
    "/return-refund-policy": ()=>__turbopack_context__.A("[project]/client/pages/ReturnRefundPolicy.tsx [app-client] (ecmascript, async loader)"),
    "/checkout-new": ()=>__turbopack_context__.A("[project]/client/pages/CheckoutNew.tsx [app-client] (ecmascript, async loader)"),
    "/checkout/bigcommerce": ()=>__turbopack_context__.A("[project]/client/pages/CheckoutBigCommerce.tsx [app-client] (ecmascript, async loader)"),
    "/invoice-checkout": ()=>__turbopack_context__.A("[project]/client/pages/InvoiceCheckout.tsx [app-client] (ecmascript, async loader)"),
    "/verify-email": ()=>__turbopack_context__.A("[project]/client/pages/VerifyEmail.tsx [app-client] (ecmascript, async loader)"),
    "/auth/callback": ()=>__turbopack_context__.A("[project]/client/pages/AuthCallback.tsx [app-client] (ecmascript, async loader)"),
    "/proof-review": ()=>__turbopack_context__.A("[project]/client/pages/ProofReview.tsx [app-client] (ecmascript, async loader)"),
    "/admin/products/import": ()=>__turbopack_context__.A("[project]/client/pages/AdminProductImport.tsx [app-client] (ecmascript, async loader)"),
    "/admin/product-form": ()=>__turbopack_context__.A("[project]/client/pages/ProductForm.tsx [app-client] (ecmascript, async loader)"),
    "/admin/blogs/create": ()=>__turbopack_context__.A("[project]/client/pages/CreateBlog.tsx [app-client] (ecmascript, async loader)"),
    "/admin/blogs/edit/:id": ()=>__turbopack_context__.A("[project]/client/pages/EditBlog.tsx [app-client] (ecmascript, async loader)"),
    "/admin/proofs/:id": ()=>__turbopack_context__.A("[project]/client/pages/AdminProofDetail.tsx [app-client] (ecmascript, async loader)"),
    "/admin/proofs/send": ()=>__turbopack_context__.A("[project]/client/pages/AdminSendProof.tsx [app-client] (ecmascript, async loader)"),
    "/admin/legal-pages/create": ()=>__turbopack_context__.A("[project]/client/pages/CreateLegalPage.tsx [app-client] (ecmascript, async loader)"),
    "/admin/legal-pages/edit/:id": ()=>__turbopack_context__.A("[project]/client/pages/EditLegalPage.tsx [app-client] (ecmascript, async loader)"),
    "/admin/ecwid-migration": ()=>__turbopack_context__.A("[project]/client/pages/AdminEcwidMigration.tsx [app-client] (ecmascript, async loader)"),
    "/admin/email-notifications": ()=>__turbopack_context__.A("[project]/client/pages/AdminEmailNotifications.tsx [app-client] (ecmascript, async loader)"),
    "/admin/invoices/new": ()=>__turbopack_context__.A("[project]/client/pages/AdminInvoiceNew.tsx [app-client] (ecmascript, async loader)"),
    "/admin/invoices/:id": ()=>__turbopack_context__.A("[project]/client/pages/AdminInvoiceDetail.tsx [app-client] (ecmascript, async loader)"),
    "/admin/invoices/edit/:id": ()=>__turbopack_context__.A("[project]/client/pages/AdminInvoiceEdit.tsx [app-client] (ecmascript, async loader)"),
    "/customers": ()=>__turbopack_context__.A("[project]/client/pages/Customers.tsx [app-client] (ecmascript, async loader)"),
    "/store-credit-admin": ()=>__turbopack_context__.A("[project]/client/pages/StoreCreditAdmin.tsx [app-client] (ecmascript, async loader)")
};
function matchRoute(pathname) {
    // Exact match first
    if (routeMap[pathname]) {
        return {
            loader: routeMap[pathname],
            params: {}
        };
    }
    // Try to match dynamic routes
    for (const [route, loader] of Object.entries(routeMap)){
        if (route.includes(":")) {
            const pattern = route.replace(/:([^/]+)/g, "([^/]+)");
            const regex = new RegExp(`^${pattern}$`);
            const match = pathname.match(regex);
            if (match) {
                const paramNames = route.match(/:([^/]+)/g)?.map((p)=>p.slice(1)) || [];
                const params = {};
                paramNames.forEach((name, index)=>{
                    params[name] = match[index + 1];
                });
                return {
                    loader,
                    params
                };
            }
        }
    }
    return {
        loader: null,
        params: {}
    };
}
const availableRoutes = Object.keys(routeMap).sort();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/[...slug]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CatchAllPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b2e2e2e$slug$5d2f$route$2d$map$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/[...slug]/route-map.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
;
;
const LoadingFallback = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex justify-center items-center min-h-[60vh]",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#FFD713] mb-3"
                }, void 0, false, {
                    fileName: "[project]/app/[...slug]/page.tsx",
                    lineNumber: 9,
                    columnNumber: 13
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-600 text-sm",
                    children: "Loading..."
                }, void 0, false, {
                    fileName: "[project]/app/[...slug]/page.tsx",
                    lineNumber: 10,
                    columnNumber: 13
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/app/[...slug]/page.tsx",
            lineNumber: 8,
            columnNumber: 9
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/app/[...slug]/page.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
_c = LoadingFallback;
const NotFoundPage = ({ pathname, availableRoutes })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-[60vh] flex items-center justify-center bg-gray-100 p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center max-w-2xl",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-4xl font-bold mb-4",
                    children: "404"
                }, void 0, false, {
                    fileName: "[project]/app/[...slug]/page.tsx",
                    lineNumber: 18,
                    columnNumber: 13
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xl text-gray-600 mb-4",
                    children: "Oops! Page not found"
                }, void 0, false, {
                    fileName: "[project]/app/[...slug]/page.tsx",
                    lineNumber: 19,
                    columnNumber: 13
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-500 mb-4",
                    children: [
                        "Path: ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                            className: "bg-gray-200 px-2 py-1 rounded",
                            children: pathname
                        }, void 0, false, {
                            fileName: "[project]/app/[...slug]/page.tsx",
                            lineNumber: 20,
                            columnNumber: 53
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/[...slug]/page.tsx",
                    lineNumber: 20,
                    columnNumber: 13
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                    href: "/",
                    className: "text-blue-500 hover:text-blue-700 underline block mb-8",
                    children: "Return to Home"
                }, void 0, false, {
                    fileName: "[project]/app/[...slug]/page.tsx",
                    lineNumber: 21,
                    columnNumber: 13
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-left bg-white p-4 rounded-lg shadow-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-semibold text-gray-700 mb-2",
                            children: "Available Routes:"
                        }, void 0, false, {
                            fileName: "[project]/app/[...slug]/page.tsx",
                            lineNumber: 24,
                            columnNumber: 17
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "max-h-48 overflow-y-auto text-xs text-gray-600 space-y-1",
                            children: availableRoutes.map((route)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "font-mono",
                                    children: route
                                }, route, false, {
                                    fileName: "[project]/app/[...slug]/page.tsx",
                                    lineNumber: 27,
                                    columnNumber: 25
                                }, ("TURBOPACK compile-time value", void 0)))
                        }, void 0, false, {
                            fileName: "[project]/app/[...slug]/page.tsx",
                            lineNumber: 25,
                            columnNumber: 17
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/[...slug]/page.tsx",
                    lineNumber: 23,
                    columnNumber: 13
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/app/[...slug]/page.tsx",
            lineNumber: 17,
            columnNumber: 9
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/app/[...slug]/page.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
_c1 = NotFoundPage;
const ErrorPage = ({ error, pathname, onRetry })=>{
    _s();
    const [showDetails, setShowDetails] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-[60vh] flex items-center justify-center bg-gray-100 p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center max-w-2xl",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-4xl font-bold mb-4 text-red-600",
                    children: "500"
                }, void 0, false, {
                    fileName: "[project]/app/[...slug]/page.tsx",
                    lineNumber: 41,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xl text-gray-600 mb-4",
                    children: "Error loading page"
                }, void 0, false, {
                    fileName: "[project]/app/[...slug]/page.tsx",
                    lineNumber: 42,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-gray-500 mb-4",
                    children: [
                        "Path: ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                            className: "bg-gray-200 px-2 py-1 rounded",
                            children: pathname
                        }, void 0, false, {
                            fileName: "[project]/app/[...slug]/page.tsx",
                            lineNumber: 43,
                            columnNumber: 57
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/[...slug]/page.tsx",
                    lineNumber: 43,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-x-4 mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onRetry,
                            className: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors",
                            children: "Retry"
                        }, void 0, false, {
                            fileName: "[project]/app/[...slug]/page.tsx",
                            lineNumber: 46,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: "/",
                            className: "inline-block px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors",
                            children: "Return to Home"
                        }, void 0, false, {
                            fileName: "[project]/app/[...slug]/page.tsx",
                            lineNumber: 52,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/[...slug]/page.tsx",
                    lineNumber: 45,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>setShowDetails(!showDetails),
                    className: "text-sm text-blue-500 underline mb-4",
                    children: showDetails ? "Hide Error Details" : "Show Error Details"
                }, void 0, false, {
                    fileName: "[project]/app/[...slug]/page.tsx",
                    lineNumber: 57,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0)),
                showDetails && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-left bg-red-50 border border-red-200 p-4 rounded-lg overflow-auto max-h-96",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-semibold text-red-800 mb-2",
                            children: "Error Message:"
                        }, void 0, false, {
                            fileName: "[project]/app/[...slug]/page.tsx",
                            lineNumber: 66,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                            className: "text-xs text-red-700 whitespace-pre-wrap",
                            children: error.message
                        }, void 0, false, {
                            fileName: "[project]/app/[...slug]/page.tsx",
                            lineNumber: 67,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)),
                        error.stack && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-semibold text-red-800 mb-2 mt-4",
                                    children: "Stack Trace:"
                                }, void 0, false, {
                                    fileName: "[project]/app/[...slug]/page.tsx",
                                    lineNumber: 70,
                                    columnNumber: 33
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                    className: "text-xs text-red-700 whitespace-pre-wrap",
                                    children: error.stack
                                }, void 0, false, {
                                    fileName: "[project]/app/[...slug]/page.tsx",
                                    lineNumber: 71,
                                    columnNumber: 33
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/[...slug]/page.tsx",
                    lineNumber: 65,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/app/[...slug]/page.tsx",
            lineNumber: 40,
            columnNumber: 13
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/app/[...slug]/page.tsx",
        lineNumber: 39,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ErrorPage, "n2rC7YX8Mzz154E9USQBvseY7a0=");
_c2 = ErrorPage;
function LegacyPageLoader() {
    _s1();
    const [Component, setComponent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isNotFound, setIsNotFound] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [RRD, setRRD] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [params, setParams] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [pathname, setPathname] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const loadPage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "LegacyPageLoader.useCallback[loadPage]": async ()=>{
            setIsLoading(true);
            setError(null);
            setIsNotFound(false);
            setComponent(null);
            try {
                const currentPathname = window.location.pathname;
                setPathname(currentPathname);
                // Match the route
                const { loader, params: matchedParams } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b2e2e2e$slug$5d2f$route$2d$map$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["matchRoute"])(currentPathname);
                setParams(matchedParams);
                if (!loader) {
                    console.warn(`[CatchAll] No route found for: ${currentPathname}`);
                    console.log(`[CatchAll] Available routes:`, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b2e2e2e$slug$5d2f$route$2d$map$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["availableRoutes"]);
                    setIsNotFound(true);
                    setIsLoading(false);
                    return;
                }
                console.log(`[CatchAll] Loading route: ${currentPathname}`);
                // Load the component and React Router DOM in parallel
                const [mod, rrd] = await Promise.all([
                    loader(),
                    __turbopack_context__.A("[project]/node_modules/react-router-dom/dist/index.js [app-client] (ecmascript, async loader)")
                ]);
                if (!mod.default) {
                    throw new Error(`Component at ${currentPathname} does not have a default export`);
                }
                setComponent({
                    "LegacyPageLoader.useCallback[loadPage]": ()=>mod.default
                }["LegacyPageLoader.useCallback[loadPage]"]);
                setRRD(rrd);
                console.log(`[CatchAll] Successfully loaded: ${currentPathname}`);
            } catch (err) {
                console.error(`[CatchAll] Error loading page:`, err);
                setError(err instanceof Error ? err : new Error(String(err)));
            } finally{
                setIsLoading(false);
            }
        }
    }["LegacyPageLoader.useCallback[loadPage]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LegacyPageLoader.useEffect": ()=>{
            loadPage();
        }
    }["LegacyPageLoader.useEffect"], [
        loadPage
    ]);
    if (isLoading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LoadingFallback, {}, void 0, false, {
        fileName: "[project]/app/[...slug]/page.tsx",
        lineNumber: 139,
        columnNumber: 27
    }, this);
    if (error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ErrorPage, {
        error: error,
        pathname: pathname,
        onRetry: loadPage
    }, void 0, false, {
        fileName: "[project]/app/[...slug]/page.tsx",
        lineNumber: 140,
        columnNumber: 23
    }, this);
    if (isNotFound) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NotFoundPage, {
        pathname: pathname,
        availableRoutes: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f5b2e2e2e$slug$5d2f$route$2d$map$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["availableRoutes"]
    }, void 0, false, {
        fileName: "[project]/app/[...slug]/page.tsx",
        lineNumber: 141,
        columnNumber: 28
    }, this);
    if (!Component || !RRD) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LoadingFallback, {}, void 0, false, {
        fileName: "[project]/app/[...slug]/page.tsx",
        lineNumber: 142,
        columnNumber: 36
    }, this);
    // Wrap the component with BrowserRouter and provide route params
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RRD.BrowserRouter, {
        future: {
            v7_startTransition: true,
            v7_relativeSplatPath: true
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RRD.Routes, {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RRD.Route, {
                path: "*",
                element: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RouteParamsProvider, {
                    params: params,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Component, {}, void 0, false, {
                        fileName: "[project]/app/[...slug]/page.tsx",
                        lineNumber: 157,
                        columnNumber: 29
                    }, void 0)
                }, void 0, false, {
                    fileName: "[project]/app/[...slug]/page.tsx",
                    lineNumber: 156,
                    columnNumber: 25
                }, void 0)
            }, void 0, false, {
                fileName: "[project]/app/[...slug]/page.tsx",
                lineNumber: 153,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/[...slug]/page.tsx",
            lineNumber: 152,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/[...slug]/page.tsx",
        lineNumber: 146,
        columnNumber: 9
    }, this);
}
_s1(LegacyPageLoader, "IecaH3A0XEEcQ3ltIjwiefjTW9s=");
_c3 = LegacyPageLoader;
// Provider to inject URL params into React Router context
function RouteParamsProvider({ children, params }) {
    _s2();
    const location = window.location;
    // Create a modified history state that includes our params
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RouteParamsProvider.useEffect": ()=>{
            if (Object.keys(params).length > 0) {
                const searchParams = new URLSearchParams(location.search);
                Object.entries(params).forEach({
                    "RouteParamsProvider.useEffect": ([key, value])=>{
                        if (!searchParams.has(`_param_${key}`)) {
                            searchParams.set(`_param_${key}`, value);
                        }
                    }
                }["RouteParamsProvider.useEffect"]);
                const newUrl = `${location.pathname}?${searchParams.toString()}${location.hash}`;
                window.history.replaceState(window.history.state, "", newUrl);
            }
        }
    }["RouteParamsProvider.useEffect"], [
        params,
        location
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
_s2(RouteParamsProvider, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c4 = RouteParamsProvider;
function CatchAllPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LoadingFallback, {}, void 0, false, {
            fileName: "[project]/app/[...slug]/page.tsx",
            lineNumber: 190,
            columnNumber: 29
        }, void 0),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LegacyPageLoader, {}, void 0, false, {
            fileName: "[project]/app/[...slug]/page.tsx",
            lineNumber: 191,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/[...slug]/page.tsx",
        lineNumber: 190,
        columnNumber: 9
    }, this);
}
_c5 = CatchAllPage;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "LoadingFallback");
__turbopack_context__.k.register(_c1, "NotFoundPage");
__turbopack_context__.k.register(_c2, "ErrorPage");
__turbopack_context__.k.register(_c3, "LegacyPageLoader");
__turbopack_context__.k.register(_c4, "RouteParamsProvider");
__turbopack_context__.k.register(_c5, "CatchAllPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_%5B___slug%5D_d0316148._.js.map