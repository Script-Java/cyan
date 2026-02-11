"use client";

import { useState, useEffect, ComponentType } from "react";
import dynamic from "next/dynamic";

const LoadingFallback = () => (
    <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#FFD713] mb-3"></div>
            <p className="text-gray-600 text-sm">Loading...</p>
        </div>
    </div>
);

const NotFoundPage = () => (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-100">
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
            <a href="/" className="text-blue-500 hover:text-blue-700 underline">Return to Home</a>
        </div>
    </div>
);

const dynamicOpts = { ssr: false, loading: () => <LoadingFallback /> };

// Each component gets its own next/dynamic wrapper with ssr:false
// Using @/pages/* alias (maps to ./client/pages/* in tsconfig)
const pageComponents: Record<string, ComponentType<any>> = {
    "Signup": dynamic(() => import("@/pages/Signup"), dynamicOpts),
    "ForgotPassword": dynamic(() => import("@/pages/ForgotPassword"), dynamicOpts),
    "ResetPassword": dynamic(() => import("@/pages/ResetPassword"), dynamicOpts),
    "VerifyEmail": dynamic(() => import("@/pages/VerifyEmail"), dynamicOpts),
    "Products": dynamic(() => import("@/pages/Products"), dynamicOpts),
    "Deals": dynamic(() => import("@/pages/Deals"), dynamicOpts),
    "Cart": dynamic(() => import("@/pages/Cart"), dynamicOpts),
    "Checkout": dynamic(() => import("@/pages/Checkout"), dynamicOpts),
    "CheckoutNew": dynamic(() => import("@/pages/CheckoutNew"), dynamicOpts),
    "OrderHistory": dynamic(() => import("@/pages/OrderHistory"), dynamicOpts),
    "OrderStatus": dynamic(() => import("@/pages/OrderStatus"), dynamicOpts),
    "Finances": dynamic(() => import("@/pages/Finances"), dynamicOpts),
    "Designs": dynamic(() => import("@/pages/Designs"), dynamicOpts),
    "Proofs": dynamic(() => import("@/pages/Proofs"), dynamicOpts),
    "ProofReview": dynamic(() => import("@/pages/ProofReview"), dynamicOpts),
    "ProofApproval": dynamic(() => import("@/pages/ProofApproval"), dynamicOpts),
    "ProofApprovalPublic": dynamic(() => import("@/pages/ProofApprovalPublic"), dynamicOpts),
    "AccountSettings": dynamic(() => import("@/pages/AccountSettings"), dynamicOpts),
    "Support": dynamic(() => import("@/pages/Support"), dynamicOpts),
    "MyTickets": dynamic(() => import("@/pages/MyTickets"), dynamicOpts),
    "Blogs": dynamic(() => import("@/pages/Blogs"), dynamicOpts),
    "BlogPost": dynamic(() => import("@/pages/BlogPost"), dynamicOpts),
    "LegalPages": dynamic(() => import("@/pages/LegalPages"), dynamicOpts),
    "LegalPage": dynamic(() => import("@/pages/LegalPage"), dynamicOpts),
    "ReturnRefundPolicy": dynamic(() => import("@/pages/ReturnRefundPolicy"), dynamicOpts),
    "Customers": dynamic(() => import("@/pages/Customers"), dynamicOpts),
    "AuthCallback": dynamic(() => import("@/pages/AuthCallback"), dynamicOpts),
    "StoreCreditAdmin": dynamic(() => import("@/pages/StoreCreditAdmin"), dynamicOpts),
    "Product": dynamic(() => import("@/pages/Product"), dynamicOpts),
    "ProductPage": dynamic(() => import("@/pages/ProductPage"), dynamicOpts),
    "EcwidProductDetail": dynamic(() => import("@/pages/EcwidProductDetail"), dynamicOpts),
    "CheckoutSuccess": dynamic(() => import("@/pages/CheckoutSuccess"), dynamicOpts),
    "OrderConfirmation": dynamic(() => import("@/pages/OrderConfirmation"), dynamicOpts),
    "OrderDetails": dynamic(() => import("@/pages/OrderDetails"), dynamicOpts),
    "CustomerInvoiceView": dynamic(() => import("@/pages/CustomerInvoiceView"), dynamicOpts),
    "InvoiceCheckout": dynamic(() => import("@/pages/InvoiceCheckout"), dynamicOpts),
    // Admin
    "AdminDashboard": dynamic(() => import("@/pages/AdminDashboard"), dynamicOpts),
    "AdminOrders": dynamic(() => import("@/pages/AdminOrders"), dynamicOpts),
    "AdminOrderDetail": dynamic(() => import("@/pages/AdminOrderDetail"), dynamicOpts),
    "AdminCustomers": dynamic(() => import("@/pages/AdminCustomers"), dynamicOpts),
    "AdminCustomerDetail": dynamic(() => import("@/pages/AdminCustomerDetail"), dynamicOpts),
    "AdminProducts": dynamic(() => import("@/pages/AdminProducts"), dynamicOpts),
    "ProductForm": dynamic(() => import("@/pages/ProductForm"), dynamicOpts),
    "AdminProofs": dynamic(() => import("@/pages/AdminProofs"), dynamicOpts),
    "AdminProofDetail": dynamic(() => import("@/pages/AdminProofDetail"), dynamicOpts),
    "AdminSendProof": dynamic(() => import("@/pages/AdminSendProof"), dynamicOpts),
    "AdminReviews": dynamic(() => import("@/pages/AdminReviews"), dynamicOpts),
    "AdminEmailNotifications": dynamic(() => import("@/pages/AdminEmailNotifications"), dynamicOpts),
    "AdminFinance": dynamic(() => import("@/pages/AdminFinance"), dynamicOpts),
    "AdminAnalytics": dynamic(() => import("@/pages/AdminAnalytics"), dynamicOpts),
    "AdminBlogs": dynamic(() => import("@/pages/AdminBlogs"), dynamicOpts),
    "CreateBlog": dynamic(() => import("@/pages/CreateBlog"), dynamicOpts),
    "EditBlog": dynamic(() => import("@/pages/EditBlog"), dynamicOpts),
    "AdminLegalPages": dynamic(() => import("@/pages/AdminLegalPages"), dynamicOpts),
    "CreateLegalPage": dynamic(() => import("@/pages/CreateLegalPage"), dynamicOpts),
    "EditLegalPage": dynamic(() => import("@/pages/EditLegalPage"), dynamicOpts),
    "AdminReturnRefundPolicy": dynamic(() => import("@/pages/AdminReturnRefundPolicy"), dynamicOpts),
    "AdminSettings": dynamic(() => import("@/pages/AdminSettings"), dynamicOpts),
    "AdminSupport": dynamic(() => import("@/pages/AdminSupport"), dynamicOpts),
    "AdminShipping": dynamic(() => import("@/pages/AdminShipping"), dynamicOpts),
    "AdminGallery": dynamic(() => import("@/pages/AdminGallery"), dynamicOpts),
    "AdminDiscounts": dynamic(() => import("@/pages/AdminDiscounts"), dynamicOpts),
    "AdminProductImport": dynamic(() => import("@/pages/AdminProductImport"), dynamicOpts),
    "AdminEcwidMigration": dynamic(() => import("@/pages/AdminEcwidMigration"), dynamicOpts),
    "AdminInvoices": dynamic(() => import("@/pages/AdminInvoices"), dynamicOpts),
    "AdminInvoiceNew": dynamic(() => import("@/pages/AdminInvoiceNew"), dynamicOpts),
    "AdminInvoiceDetail": dynamic(() => import("@/pages/AdminInvoiceDetail"), dynamicOpts),
    "AdminInvoiceEdit": dynamic(() => import("@/pages/AdminInvoiceEdit"), dynamicOpts),
};

// Route map: URL path -> component key
const routeMap: Record<string, string> = {
    "/signup": "Signup",
    "/forgot-password": "ForgotPassword",
    "/reset-password": "ResetPassword",
    "/verify": "VerifyEmail",
    "/products": "Products",
    "/deals": "Deals",
    "/cart": "Cart",
    "/checkout": "Checkout",
    "/checkout-new": "CheckoutNew",
    "/order-history": "OrderHistory",
    "/order-status": "OrderStatus",
    "/finances": "Finances",
    "/designs": "Designs",
    "/proofs": "Proofs",
    "/proofs/review": "ProofReview",
    "/account-settings": "AccountSettings",
    "/support": "Support",
    "/my-tickets": "MyTickets",
    "/blogs": "Blogs",
    "/legal-pages": "LegalPages",
    "/return-refund-policy": "ReturnRefundPolicy",
    "/customers": "Customers",
    "/auth/callback": "AuthCallback",
    "/store-credit-admin": "StoreCreditAdmin",
    "/admin": "AdminDashboard",
    "/admin/orders": "AdminOrders",
    "/admin/customers": "AdminCustomers",
    "/admin/products": "AdminProducts",
    "/admin/products/new": "ProductForm",
    "/admin/proofs": "AdminProofs",
    "/admin/send-proof": "AdminSendProof",
    "/admin/reviews": "AdminReviews",
    "/admin/email-notifications": "AdminEmailNotifications",
    "/admin/finance": "AdminFinance",
    "/admin/analytics": "AdminAnalytics",
    "/admin/blogs": "AdminBlogs",
    "/admin/create-blog": "CreateBlog",
    "/admin/legal-pages": "AdminLegalPages",
    "/admin/create-legal-page": "CreateLegalPage",
    "/admin/return-refund-policy": "AdminReturnRefundPolicy",
    "/admin/settings": "AdminSettings",
    "/admin/support": "AdminSupport",
    "/admin/shipping": "AdminShipping",
    "/admin/gallery": "AdminGallery",
    "/admin/discounts": "AdminDiscounts",
    "/admin/import-products": "AdminProductImport",
    "/admin/ecwid-migration": "AdminEcwidMigration",
    "/admin/invoices": "AdminInvoices",
    "/admin/invoices/new": "AdminInvoiceNew",
};

// Dynamic routes with params
const dynamicRoutes: Array<{ pattern: RegExp; component: string }> = [
    { pattern: /^\/product\/(.+)$/, component: "Product" },
    { pattern: /^\/product-page\/(.+)$/, component: "ProductPage" },
    { pattern: /^\/ecwid-product\/(.+)$/, component: "EcwidProductDetail" },
    { pattern: /^\/checkout-success\/(.+)$/, component: "CheckoutSuccess" },
    { pattern: /^\/order-confirmation\/(.+)$/, component: "OrderConfirmation" },
    { pattern: /^\/order-history\/(.+)$/, component: "OrderDetails" },
    { pattern: /^\/proofs\/(.+)\/approve$/, component: "ProofApproval" },
    { pattern: /^\/proofs\/(.+)\/request-revisions$/, component: "ProofApproval" },
    { pattern: /^\/proof\/(.+)\/approve$/, component: "ProofApprovalPublic" },
    { pattern: /^\/proof\/(.+)\/request-revisions$/, component: "ProofApprovalPublic" },
    { pattern: /^\/blog\/(.+)$/, component: "BlogPost" },
    { pattern: /^\/legal\/(.+)$/, component: "LegalPage" },
    { pattern: /^\/invoice\/(.+)\/checkout$/, component: "InvoiceCheckout" },
    { pattern: /^\/invoice\/(.+)$/, component: "CustomerInvoiceView" },
    { pattern: /^\/admin\/orders\/(.+)$/, component: "AdminOrderDetail" },
    { pattern: /^\/admin\/customers\/(.+)$/, component: "AdminCustomerDetail" },
    { pattern: /^\/admin\/products\/(.+)\/edit$/, component: "ProductForm" },
    { pattern: /^\/admin\/proofs\/(.+)$/, component: "AdminProofDetail" },
    { pattern: /^\/admin\/edit-blog\/(.+)$/, component: "EditBlog" },
    { pattern: /^\/admin\/edit-legal-page\/(.+)$/, component: "EditLegalPage" },
    { pattern: /^\/admin\/invoices\/(.+)\/edit$/, component: "AdminInvoiceEdit" },
    { pattern: /^\/admin\/invoices\/(.+)$/, component: "AdminInvoiceDetail" },
];

function resolveComponent(pathname: string): string | null {
    if (routeMap[pathname]) return routeMap[pathname];
    for (const route of dynamicRoutes) {
        if (route.pattern.test(pathname)) return route.component;
    }
    return null;
}

export default function LegacySPA() {
    const [pathname, setPathname] = useState("");
    const [resolved, setResolved] = useState<string | null>(null);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const p = window.location.pathname;
        setPathname(p);
        setResolved(resolveComponent(p));
        setChecked(true);
    }, []);

    if (!checked) return <LoadingFallback />;

    if (!resolved || !pageComponents[resolved]) {
        return <NotFoundPage />;
    }

    const PageComponent = pageComponents[resolved];
    return <PageComponent />;
}
