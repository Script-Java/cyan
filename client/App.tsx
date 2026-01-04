import "./global.css";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Products from "./pages/Products";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import EcwidStore from "./pages/EcwidStore";
import EcwidProductDetail from "./pages/EcwidProductDetail";
import Checkout from "./pages/Checkout";
import CheckoutNew from "./pages/CheckoutNew";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import OrderConfirmation from "./pages/OrderConfirmation";
import Dashboard from "./pages/Dashboard";
import OrderHistory from "./pages/OrderHistory";
import OrderDetails from "./pages/OrderDetails";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Finances from "./pages/Finances";
import Designs from "./pages/Designs";
import Proofs from "./pages/Proofs";
import ProofApproval from "./pages/ProofApproval";
import AccountSettings from "./pages/AccountSettings";
import Support from "./pages/Support";
import MyTickets from "./pages/MyTickets";
import AdminSupport from "./pages/AdminSupport";
import AdminOrders from "./pages/AdminOrders";
import AdminProofs from "./pages/AdminProofs";
import AdminEmailNotifications from "./pages/AdminEmailNotifications";
import AdminSettings from "./pages/AdminSettings";
import StoreCreditAdmin from "./pages/StoreCreditAdmin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProductImport from "./pages/AdminProductImport";
import AdminProducts from "./pages/AdminProducts";
import ProductForm from "./pages/ProductForm";
import ProductPage from "./pages/ProductPage";
import AdminFinance from "./pages/AdminFinance";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminBlogs from "./pages/AdminBlogs";
import CreateBlog from "./pages/CreateBlog";
import BlogPost from "./pages/BlogPost";
import Blogs from "./pages/Blogs";
import EditBlog from "./pages/EditBlog";
import AdminLegalPages from "./pages/AdminLegalPages";
import CreateLegalPage from "./pages/CreateLegalPage";
import EditLegalPage from "./pages/EditLegalPage";
import LegalPage from "./pages/LegalPage";
import LegalPages from "./pages/LegalPages";
import Customers from "./pages/Customers";
import AdminShipping from "./pages/AdminShipping";
import AdminEcwidMigration from "./pages/AdminEcwidMigration";
import ReturnRefundPolicy from "./pages/ReturnRefundPolicy";
import AdminReturnRefundPolicy from "./pages/AdminReturnRefundPolicy";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView();
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PageTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:productId" element={<Product />} />
            <Route path="/product-page/:productId" element={<ProductPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/ecwid-store" element={<EcwidStore />} />
            <Route
              path="/ecwid-product/:productId"
              element={<EcwidProductDetail />}
            />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout-new" element={<CheckoutNew />} />
            <Route path="/checkout-success" element={<CheckoutSuccess />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/order-history/:orderId" element={<OrderDetails />} />
            <Route path="/finances" element={<Finances />} />
            <Route path="/designs" element={<Designs />} />
            <Route path="/proofs" element={<Proofs />} />
            <Route path="/proofs/:proofId/approve" element={<ProofApproval />} />
            <Route path="/proofs/:proofId/request-revisions" element={<ProofApproval />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/support" element={<Support />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blog/:blogId" element={<BlogPost />} />
            <Route path="/legal-pages" element={<LegalPages />} />
            <Route path="/return-refund-policy" element={<ReturnRefundPolicy />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/customers" element={<Customers />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/new" element={<ProductForm />} />
            <Route
              path="/admin/products/:productId/edit"
              element={<ProductForm />}
            />
            <Route path="/admin/proofs" element={<AdminProofs />} />
            <Route path="/admin/email-notifications" element={<AdminEmailNotifications />} />
            <Route path="/admin/finance" element={<AdminFinance />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/blogs" element={<AdminBlogs />} />
            <Route path="/admin/create-blog" element={<CreateBlog />} />
            <Route path="/admin/edit-blog/:blogId" element={<EditBlog />} />
            <Route path="/admin/legal-pages" element={<AdminLegalPages />} />
            <Route
              path="/admin/create-legal-page"
              element={<CreateLegalPage />}
            />
            <Route
              path="/admin/edit-legal-page/:pageId"
              element={<EditLegalPage />}
            />
            <Route path="/admin/return-refund-policy" element={<AdminReturnRefundPolicy />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/support" element={<AdminSupport />} />
            <Route path="/admin/shipping" element={<AdminShipping />} />
            <Route
              path="/admin/import-products"
              element={<AdminProductImport />}
            />
            <Route
              path="/admin/ecwid-migration"
              element={<AdminEcwidMigration />}
            />
            <Route path="/store-credit-admin" element={<StoreCreditAdmin />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="/:pageType" element={<LegalPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
