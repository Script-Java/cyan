import "./global.css";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import Finances from "./pages/Finances";
import Designs from "./pages/Designs";
import Proofs from "./pages/Proofs";
import AccountSettings from "./pages/AccountSettings";
import Support from "./pages/Support";
import MyTickets from "./pages/MyTickets";
import AdminSupport from "./pages/AdminSupport";
import AdminOrders from "./pages/AdminOrders";
import AdminProofs from "./pages/AdminProofs";
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
import Customers from "./pages/Customers";
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
            <Route path="/finances" element={<Finances />} />
            <Route path="/designs" element={<Designs />} />
            <Route path="/proofs" element={<Proofs />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/support" element={<Support />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/blog/:blogId" element={<BlogPost />} />
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
            <Route path="/admin/finance" element={<AdminFinance />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/blogs" element={<AdminBlogs />} />
            <Route path="/admin/create-blog" element={<CreateBlog />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/support" element={<AdminSupport />} />
            <Route
              path="/admin/import-products"
              element={<AdminProductImport />}
            />
            <Route path="/store-credit-admin" element={<StoreCreditAdmin />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
