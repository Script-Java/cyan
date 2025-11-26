import Header from "@/components/Header";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Cart() {
  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <ShoppingCart className="w-16 h-16 text-[#FFD713] mx-auto mb-6 opacity-50" />
            <h1 className="text-4xl sm:text-5xl font-bold text-[#030140] mb-4">
              Shopping Cart
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your cart is empty. Browse our sticker collections to get started!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#FFD713] text-[#030140] rounded-lg font-bold hover:bg-[#FFD713]/90 transition-all shadow-lg shadow-[#FFD713]/30"
            >
              Start Shopping
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
