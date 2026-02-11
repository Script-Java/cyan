// This file maps URL paths to their corresponding page components
// Each entry is lazily loaded to improve initial bundle size

import { ComponentType } from "react";

export type PageLoader = () => Promise<{ default: ComponentType<any> }>;

// Route mapping for all legacy pages
// Format: "/path": () => import("@/pages/ComponentName")
// 
// IMPORTANT: Routes are organized in phases to enable progressive migration
// Phase 1: Core public routes (tested and working)
// Phase 2: Dashboard routes
// Phase 3: Admin routes
// Phase 4: Advanced/Complex routes

export const routeMap: Record<string, PageLoader> = {
    // Phase 1: Core public routes (high priority, test these first)
    "/": () => import("@/pages/Index"),
    "/deals": () => import("@/pages/Deals"),
    "/blogs": () => import("@/pages/Blogs"),
    "/products": () => import("@/pages/Products"),
    "/product/:id": () => import("@/pages/Product"),
    "/designs": () => import("@/pages/Designs"),
    "/legal": () => import("@/pages/LegalPages"),
    "/legal/:slug": () => import("@/pages/LegalPage"),
    "/support": () => import("@/pages/Support"),
    "/cart": () => import("@/pages/Cart"),
    "/checkout": () => import("@/pages/Checkout"),
    "/checkout/success": () => import("@/pages/CheckoutSuccess"),
    "/login": () => import("@/pages/Login"),
    "/signup": () => import("@/pages/Signup"),
    "/forgot-password": () => import("@/pages/ForgotPassword"),
    "/reset-password": () => import("@/pages/ResetPassword"),
    
    // Phase 2: Dashboard and account routes
    "/dashboard": () => import("@/pages/Dashboard"),
    "/account-settings": () => import("@/pages/AccountSettings"),
    "/order-history": () => import("@/pages/OrderHistory"),
    "/order/:id": () => import("@/pages/OrderDetails"),
    "/order-confirmation": () => import("@/pages/OrderConfirmation"),
    "/order-status": () => import("@/pages/OrderStatus"),
    "/finances": () => import("@/pages/Finances"),
    "/my-tickets": () => import("@/pages/MyTickets"),
    "/proofs": () => import("@/pages/Proofs"),
    "/proof-approval": () => import("@/pages/ProofApproval"),
    "/proof-approval/:token": () => import("@/pages/ProofApprovalPublic"),
    
    // Phase 3: Admin routes
    "/admin": () => import("@/pages/AdminDashboard"),
    "/admin/dashboard": () => import("@/pages/AdminDashboard"),
    "/admin/analytics": () => import("@/pages/AdminAnalytics"),
    "/admin/customers": () => import("@/pages/AdminCustomers"),
    "/admin/customers/:id": () => import("@/pages/AdminCustomerDetail"),
    "/admin/orders": () => import("@/pages/AdminOrders"),
    "/admin/orders/:id": () => import("@/pages/AdminOrderDetail"),
    "/admin/products": () => import("@/pages/AdminProducts"),
    "/admin/blogs": () => import("@/pages/AdminBlogs"),
    "/admin/proofs": () => import("@/pages/AdminProofs"),
    "/admin/gallery": () => import("@/pages/AdminGallery"),
    "/admin/discounts": () => import("@/pages/AdminDiscounts"),
    "/admin/reviews": () => import("@/pages/AdminReviews"),
    "/admin/finance": () => import("@/pages/AdminFinance"),
    "/admin/settings": () => import("@/pages/AdminSettings"),
    "/admin/legal-pages": () => import("@/pages/AdminLegalPages"),
    "/admin/return-refund-policy": () => import("@/pages/AdminReturnRefundPolicy"),
    "/admin/support": () => import("@/pages/AdminSupport"),
    "/admin/shipping": () => import("@/pages/AdminShipping"),
    "/admin/invoices": () => import("@/pages/AdminInvoices"),
    "/invoice/:token": () => import("@/pages/CustomerInvoiceView"),
    
    // Phase 4: Advanced/Complex routes
    "/blog/:id": () => import("@/pages/BlogPost"),
    "/product-page/:productId": () => import("@/pages/ProductPage"),
    "/ecwid-store": () => import("@/pages/EcwidStore"),
    "/ecwid-product/:id": () => import("@/pages/EcwidProductDetail"),
    "/return-refund-policy": () => import("@/pages/ReturnRefundPolicy"),
    "/checkout-new": () => import("@/pages/CheckoutNew"),
    "/checkout/bigcommerce": () => import("@/pages/CheckoutBigCommerce"),
    "/invoice-checkout": () => import("@/pages/InvoiceCheckout"),
    "/verify-email": () => import("@/pages/VerifyEmail"),
    "/auth/callback": () => import("@/pages/AuthCallback"),
    "/proof-review": () => import("@/pages/ProofReview"),
    "/admin/products/import": () => import("@/pages/AdminProductImport"),
    "/admin/product-form": () => import("@/pages/ProductForm"),
    "/admin/blogs/create": () => import("@/pages/CreateBlog"),
    "/admin/blogs/edit/:id": () => import("@/pages/EditBlog"),
    "/admin/proofs/:id": () => import("@/pages/AdminProofDetail"),
    "/admin/proofs/send": () => import("@/pages/AdminSendProof"),
    "/admin/legal-pages/create": () => import("@/pages/CreateLegalPage"),
    "/admin/legal-pages/edit/:id": () => import("@/pages/EditLegalPage"),
    "/admin/ecwid-migration": () => import("@/pages/AdminEcwidMigration"),
    "/admin/email-notifications": () => import("@/pages/AdminEmailNotifications"),
    "/admin/invoices/new": () => import("@/pages/AdminInvoiceNew"),
    "/admin/invoices/:id": () => import("@/pages/AdminInvoiceDetail"),
    "/admin/invoices/edit/:id": () => import("@/pages/AdminInvoiceEdit"),
    "/customers": () => import("@/pages/Customers"),
    "/store-credit-admin": () => import("@/pages/StoreCreditAdmin"),
};

// Helper function to match dynamic routes
export function matchRoute(pathname: string): { loader: PageLoader | null; params: Record<string, string> } {
    // Exact match first
    if (routeMap[pathname]) {
        return { loader: routeMap[pathname], params: {} };
    }

    // Try to match dynamic routes
    for (const [route, loader] of Object.entries(routeMap)) {
        if (route.includes(":")) {
            const pattern = route.replace(/:([^/]+)/g, "([^/]+)");
            const regex = new RegExp(`^${pattern}$`);
            const match = pathname.match(regex);
            
            if (match) {
                const paramNames = route.match(/:([^/]+)/g)?.map(p => p.slice(1)) || [];
                const params: Record<string, string> = {};
                paramNames.forEach((name, index) => {
                    params[name] = match[index + 1];
                });
                return { loader, params };
            }
        }
    }

    return { loader: null, params: {} };
}

// List of all available routes for debugging
export const availableRoutes = Object.keys(routeMap).sort();
