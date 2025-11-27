import Header from "@/components/Header";
import {
  ArrowRight,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Loader2,
} from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface CartItem {
  product_id: number;
  product_name?: string;
  quantity: number;
  price?: number;
}

interface CartData {
  id: string;
  line_items: CartItem[];
  subtotal: number;
  total: number;
}

export default function Cart() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cartId = searchParams.get("cartId");

  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Load auth token and cart ID from localStorage
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setAuthToken(token);

    const storedCartId = localStorage.getItem("cart_id");
    if (!cartId && storedCartId) {
      window.history.replaceState({}, "", `?cartId=${storedCartId}`);
    }
  }, [cartId]);

  // Load cart data
  useEffect(() => {
    const loadCart = async () => {
      try {
        const id = cartId || localStorage.getItem("cart_id");

        if (!id) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/cart/${id}`);
        if (!response.ok) {
          throw new Error("Failed to load cart");
        }

        const data = await response.json();
        setCart(data.data);
      } catch (err) {
        console.error("Failed to load cart:", err);
        toast.error("Failed to load cart");
      } finally {
        setIsLoading(false);
      }
    };

    const id = cartId || localStorage.getItem("cart_id");
    if (id) {
      loadCart();
    } else {
      setIsLoading(false);
    }
  }, [cartId]);

  const handleRemoveItem = async (index: number) => {
    if (!cart) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/cart/${cart.id}/items/${index}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      const data = await response.json();
      setCart(data.data);
      toast.success("Item removed from cart");
    } catch (err) {
      console.error("Failed to remove item:", err);
      toast.error("Failed to remove item");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateQuantity = async (index: number, newQuantity: number) => {
    if (!cart || newQuantity < 1) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/cart/${cart.id}/items/${index}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      const data = await response.json();
      setCart(data.data);
      toast.success("Cart updated");
    } catch (err) {
      console.error("Failed to update quantity:", err);
      toast.error("Failed to update quantity");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCheckout = () => {
    if (!authToken) {
      toast.error("Please log in to checkout");
      navigate("/login");
      return;
    }

    if (!cart || cart.line_items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    navigate(`/checkout?cartId=${cart.id}`);
  };

  const handleContinueShopping = () => {
    navigate("/products");
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFD713]" />
        </main>
      </>
    );
  }

  // Empty Cart
  if (!cart || cart.line_items.length === 0) {
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
                Your cart is empty. Browse our sticker collections to get
                started!
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

  // Cart with items
  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#030140] mb-2">
              Shopping Cart
            </h1>
            <p className="text-gray-600">
              {cart.line_items.length} item
              {cart.line_items.length !== 1 ? "s" : ""} in your cart
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Items</CardTitle>
                  <CardDescription>
                    Review your items before checkout
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.line_items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 pb-4 border-b last:border-b-0"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {item.product_name || `Product #${item.product_id}`}
                        </h3>
                        <p className="text-gray-600">
                          Price: ${(item.price || 0.25).toFixed(2)} each
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 border rounded-lg">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(index, item.quantity - 1)
                            }
                            disabled={isUpdating || item.quantity <= 1}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 min-w-12 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(index, item.quantity + 1)
                            }
                            disabled={isUpdating}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="font-bold text-lg">
                          ${((item.price || 0.25) * item.quantity).toFixed(2)}
                        </p>

                        <button
                          onClick={() => handleRemoveItem(index)}
                          disabled={isUpdating}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary & Checkout */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 border-b pb-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${cart.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>$9.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (est.)</span>
                      <span>${(cart.subtotal * 0.08).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>
                      $
                      {(cart.subtotal + 9.99 + cart.subtotal * 0.08).toFixed(2)}
                    </span>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-[#FFD713] text-[#030140] hover:bg-[#FFD713]/90 py-6 text-lg font-bold"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        Proceed to Checkout
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleContinueShopping}
                    variant="outline"
                    className="w-full border-[#030140] text-[#030140] hover:bg-[#030140]/5"
                  >
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
