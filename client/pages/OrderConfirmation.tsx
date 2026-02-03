import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatOrderNumber } from "@/lib/orderFormatting";
import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Package,
  Truck,
  Calendar,
  Eye,
  Download,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  design_file_url?: string;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Order {
  id: number;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount?: number;
  created_at: string;
  estimated_delivery_date?: string;
  shipping_address?: ShippingAddress;
  orderItems?: OrderItem[];
  square_payment_id?: string;
}

export default function OrderConfirmation() {
  const { orderId: pathOrderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = pathOrderId;

  useEffect(() => {
    const fetchOrder = async () => {
      // Allow preview mode with mock data for development
      const isPreview = !orderId || orderId === "preview" || isNaN(Number(orderId));

      if (isPreview) {
        // Mock order for testing/editing
        const mockOrder: Order = {
          id: 1001,
          status: "paid",
          total: 149.99,
          subtotal: 125.00,
          tax: 12.50,
          shipping: 12.49,
          discount: 0,
          created_at: new Date().toISOString(),
          estimated_delivery_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          shipping_address: {
            firstName: "John",
            lastName: "Doe",
            street: "123 Main Street",
            city: "San Francisco",
            state: "CA",
            postalCode: "94102",
            country: "United States",
          },
          orderItems: [
            {
              id: 1,
              product_id: 1,
              product_name: "Custom Sticker Sheet",
              quantity: 2,
              price: 29.99,
              design_file_url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=400&fit=crop",
            },
            {
              id: 2,
              product_id: 2,
              product_name: "Vinyl Decal Pack",
              quantity: 1,
              price: 65.00,
              design_file_url: "https://images.unsplash.com/photo-1609027291529-0cfecda156de?w=400&h=400&fit=crop",
            },
          ],
        };
        setOrder(mockOrder);
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching order details:", orderId);

        const response = await fetch(`/api/public/orders/${orderId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch order (${response.status})`);
        }

        const result = await response.json();
        console.log("Order data received:", result);

        if (!result.success || !result.data) {
          throw new Error("Invalid order data");
        }

        const data = result.data;

        // Only show order if payment is confirmed
        if (
          data.status !== "paid" &&
          data.status !== "completed" &&
          data.status !== "processing" &&
          data.status !== "shipped" &&
          data.status !== "delivered"
        ) {
          throw new Error(
            "Order is not yet confirmed. Please wait for payment verification.",
          );
        }

        // Transform the data to match our Order interface
        const transformedOrder: Order = {
          id: data.id,
          status: data.status,
          total: data.total,
          subtotal: data.subtotal,
          tax: data.tax,
          shipping: data.shipping,
          discount: 0,
          created_at: data.date_created,
          estimated_delivery_date: data.estimated_delivery_date,
          shipping_address: data.shipping_addresses?.[0],
          orderItems: data.products?.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
            design_file_url: item.design_file_url,
          })),
        };

        setOrder(transformedOrder);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load order details";
        setError(errorMessage);
        console.error("Order fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

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
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Order Error</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button
                  onClick={() => navigate("/")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Return to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  if (!order) {
    return null;
  }

  const orderNumber = formatOrderNumber(order.id);
  const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate shipping timeline
  const PROCESSING_DAYS = 3; // 2-3 business days to process
  const SHIPPING_DAYS_MIN = 7; // Minimum 7 business days for shipping
  const SHIPPING_DAYS_MAX = 21; // Maximum 21 business days for shipping

  const processingEndDate = new Date(Date.now() + PROCESSING_DAYS * 24 * 60 * 60 * 1000);
  const deliveryMinDate = new Date(Date.now() + (PROCESSING_DAYS + SHIPPING_DAYS_MIN) * 24 * 60 * 60 * 1000);
  const deliveryMaxDate = new Date(Date.now() + (PROCESSING_DAYS + SHIPPING_DAYS_MAX) * 24 * 60 * 60 * 1000);

  const estimatedDelivery = order.estimated_delivery_date
    ? new Date(order.estimated_delivery_date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : deliveryMaxDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  const processingDateStr = processingEndDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const deliveryDateMinStr = deliveryMinDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const deliveryDateMaxStr = deliveryMaxDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const getStatusBadge = () => {
    switch (order.status) {
      case "paid":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <Package className="w-4 h-4" />
            Processing
          </div>
        );
      case "processing":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <Package className="w-4 h-4" />
            Processing
          </div>
        );
      case "shipped":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            <Truck className="w-4 h-4" />
            Shipped
          </div>
        );
      case "delivered":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Delivered
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            {order.status}
          </div>
        );
    }
  };

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          {/* Logo Section */}
          <div className="flex justify-center mb-8">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F1e00ee8c48924560b1c928d354e4521b%2Ff76c51c7227242dc8bd4b1757ab321af"
              alt="Sticky Slap"
              className="h-24 w-auto"
            />
          </div>

          {/* Success Header */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-900">
                Order Confirmed!
              </CardTitle>
              <CardDescription className="text-green-800">
                Thank you for your purchase. Your order is now being prepared.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Order Number and Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl font-bold text-[#030140]">
                    {orderNumber}
                  </CardTitle>
                  <CardDescription>Ordered on {orderDate}</CardDescription>
                </div>
                {getStatusBadge()}
              </div>
            </CardHeader>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {order.orderItems?.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-6 pb-6 border-b last:pb-0 last:border-b-0"
                  >
                    {/* Design Thumbnail */}
                    <div className="flex-shrink-0">
                      {item.design_file_url ? (
                        <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={item.design_file_url}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <div className="space-y-3">
                        <div>
                          <p className="font-bold text-lg text-gray-900">
                            {item.product_name}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Product ID: #{item.product_id}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
                          <div>
                            <p className="text-xs text-gray-600 font-medium">QUANTITY</p>
                            <p className="text-lg font-bold text-gray-900">
                              {item.quantity} {item.quantity === 1 ? 'item' : 'items'}
                            </p>
                          </div>
                          <div className="border-l border-gray-300"></div>
                          <div>
                            <p className="text-xs text-gray-600 font-medium">PRICE PER ITEM</p>
                            <p className="text-lg font-bold text-gray-900">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {item.design_file_url && (
                          <div className="space-y-2 pt-2">
                            <p className="text-sm font-medium text-gray-700">Design Included</p>
                            <div className="flex gap-2">
                              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium">
                                <Eye className="w-4 h-4" />
                                View Design
                              </button>
                              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium">
                                <Download className="w-4 h-4" />
                                Download
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price Section */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                      <p className="font-bold text-2xl">
                        <span style={{color: "rgba(20, 20, 20, 1)"}}>$</span>
                        <span style={{color: "rgba(32, 32, 31, 1)"}}>{(item.price * item.quantity).toFixed(2)}</span>
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  ${order.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  ${order.shipping.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${order.tax.toFixed(2)}</span>
              </div>
              {order.discount && order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">
                    -${order.discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t-2 flex justify-between items-center">
                <span className="font-bold text-lg text-gray-900">Total</span>
                <span className="font-bold text-lg text-[#FFD713] bg-black rounded-xl px-4 py-2">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping & Delivery */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping & Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.shipping_address && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Delivery Address
                  </p>
                  <p className="text-gray-900">
                    {order.shipping_address.firstName}{" "}
                    {order.shipping_address.lastName}
                  </p>
                  <p className="text-gray-600">
                    {order.shipping_address.street}
                  </p>
                  {order.shipping_address.street2 && (
                    <p className="text-gray-600">
                      {order.shipping_address.street2}
                    </p>
                  )}
                  <p className="text-gray-600">
                    {order.shipping_address.city},{" "}
                    {order.shipping_address.state}{" "}
                    {order.shipping_address.postalCode}
                  </p>
                  <p className="text-gray-600">
                    {order.shipping_address.country}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-medium text-gray-500">
                    Shipping Timeline
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-600 mb-2"></div>
                      <div className="w-0.5 h-12 bg-gray-300"></div>
                    </div>
                    <div className="pb-12">
                      <p className="font-medium text-gray-900 text-sm">Processing</p>
                      <p className="text-xs text-gray-600">2-3 business days</p>
                      <p className="text-xs text-blue-600 font-medium mt-1">Ready by {processingDateStr}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-600 mb-2"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Shipping</p>
                      <p className="text-xs text-gray-600">7-21 business days via USPS/UPS</p>
                      <p className="text-xs text-blue-600 font-medium mt-1">Arrives between {deliveryDateMinStr} - {deliveryDateMaxStr}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FFD713] flex items-center justify-center text-sm font-bold text-[#030140] flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Order Confirmation
                    </p>
                    <p className="text-sm text-gray-600">
                      A confirmation email has been sent to your email address.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Production & Quality Check
                    </p>
                    <p className="text-sm text-gray-600">
                      We'll create your stickers and perform a quality check.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Shipping</p>
                    <p className="text-sm text-gray-600">
                      Your order will be shipped via USPS or UPS. You'll receive
                      a tracking number.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => navigate("/")}
                  className="w-full bg-[#FFD713] hover:bg-[#e6c200] text-[#030140] font-medium"
                >
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
