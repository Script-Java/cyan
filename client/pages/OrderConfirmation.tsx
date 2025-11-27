import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Loader2, Home } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OrderDetails {
  id: number;
  customer_id: number;
  total: number;
  status: string;
  date_created: string;
  products?: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  billing_address?: {
    first_name: string;
    last_name: string;
    street_1: string;
    city: string;
    state_or_province: string;
    postal_code: string;
  };
  shipping_addresses?: Array<{
    first_name: string;
    last_name: string;
    street_1: string;
    city: string;
    state_or_province: string;
    postal_code: string;
  }>;
}

const STATUS_DISPLAY = {
  0: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  1: { label: "Completed", color: "bg-green-100 text-green-800" },
  2: { label: "Shipped", color: "bg-blue-100 text-blue-800" },
  3: { label: "Delivered", color: "bg-green-100 text-green-800" },
  4: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  5: { label: "Refunded", color: "bg-purple-100 text-purple-800" },
};

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setAuthToken(token);

    if (!token) {
      setError("Please log in to view order details");
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId) {
          setError("No order ID provided");
          setIsLoading(false);
          return;
        }

        if (!authToken) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }

        const data = await response.json();
        setOrder(data.data);
      } catch (err) {
        console.error("Failed to fetch order:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load order details",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (authToken && orderId) {
      fetchOrder();
    }
  }, [authToken, orderId]);

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

  if (error) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button asChild className="mt-6">
              <Link to="/">Return Home</Link>
            </Button>
          </div>
        </main>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600">Order not found</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  const statusInfo = STATUS_DISPLAY[order.status as keyof typeof STATUS_DISPLAY] || {
    label: "Unknown",
    color: "bg-gray-100 text-gray-800",
  };

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-20 h-20 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold text-[#030140] mb-4">
              Order Confirmed!
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Thank you for your purchase
            </p>
            <p className="text-lg text-gray-500">
              Order #{order.id} • placed on{" "}
              {new Date(order.date_created).toLocaleDateString()}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`inline-block px-4 py-2 rounded-lg font-semibold ${statusInfo.color}`}>
                    {statusInfo.label}
                  </div>
                  <p className="text-gray-600 mt-4">
                    We've sent a confirmation email with your order details. You can track your shipment once it's dispatched.
                  </p>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              {order.shipping_addresses && order.shipping_addresses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-700">
                      <p className="font-semibold">
                        {order.shipping_addresses[0].first_name}{" "}
                        {order.shipping_addresses[0].last_name}
                      </p>
                      <p>{order.shipping_addresses[0].street_1}</p>
                      <p>
                        {order.shipping_addresses[0].city},{" "}
                        {order.shipping_addresses[0].state_or_province}{" "}
                        {order.shipping_addresses[0].postal_code}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Billing Address */}
              {order.billing_address && (
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-700">
                      <p className="font-semibold">
                        {order.billing_address.first_name}{" "}
                        {order.billing_address.last_name}
                      </p>
                      <p>{order.billing_address.street_1}</p>
                      <p>
                        {order.billing_address.city},{" "}
                        {order.billing_address.state_or_province}{" "}
                        {order.billing_address.postal_code}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>Order #{order.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-b pb-4">
                    {order.products && order.products.length > 0 ? (
                      <div className="space-y-3">
                        {order.products.map((product) => (
                          <div key={product.id} className="flex justify-between text-sm">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-gray-600">Qty: {product.quantity}</p>
                            </div>
                            <p className="font-medium">
                              ${(product.price * product.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Items in order</p>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base">What's Next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold mb-1">1. Confirmation Email</p>
                    <p className="text-gray-600">
                      Check your email for order confirmation
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">2. Processing</p>
                    <p className="text-gray-600">
                      We'll prepare your order for shipment
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">3. Tracking</p>
                    <p className="text-gray-600">
                      You'll receive tracking info when it ships
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              variant="outline"
              className="border-[#030140] text-[#030140] hover:bg-[#030140]/5"
            >
              <Link to="/order-history">View Order History</Link>
            </Button>
            <Button
              asChild
              className="bg-[#FFD713] text-[#030140] hover:bg-[#FFD713]/90"
            >
              <Link to="/products">Continue Shopping</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#030140] text-[#030140] hover:bg-[#030140]/5"
            >
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Back Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
