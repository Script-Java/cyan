import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cloud,
  Download,
  Calendar,
  Package,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  Grid3x3,
  List,
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

interface Design {
  id: string;
  name: string;
  url?: string;
  description?: string;
  type: string;
  size?: string;
  createdAt?: string;
}

interface OrderDesigns {
  orderId: number;
  orderDate: string;
  orderStatus: string;
  designs: Design[];
}

interface DesignsResponse {
  success: boolean;
  designs: OrderDesigns[];
  totalOrders: number;
  ordersWithDesigns: number;
}

export default function Designs() {
  const navigate = useNavigate();
  const [designsByOrder, setDesignsByOrder] = useState<OrderDesigns[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDesigns = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/designs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch designs");
        }

        const data: DesignsResponse = await response.json();
        setDesignsByOrder(data.designs || []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load designs";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDesigns();
  }, [navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "shipped":
        return "text-blue-600 bg-blue-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const totalDesigns = designsByOrder.reduce(
    (sum, order) => sum + order.designs.length,
    0,
  );

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600 text-lg">
                Loading your designs...
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Dashboard
            </button>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Design Library
                </h1>
                <p className="text-gray-600 mt-2">
                  View and manage designs from your past orders
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded border transition-colors ${
                    viewMode === "list"
                      ? "bg-blue-100 border-blue-300 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                  title="List view"
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded border transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-100 border-blue-300 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Grid view"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats */}
            {totalDesigns > 0 && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Designs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalDesigns}
                  </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-600 mb-1">
                    Orders with Designs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {designsByOrder.length}
                  </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-600 mb-1">Avg per Order</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(totalDesigns / designsByOrder.length).toFixed(1)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {designsByOrder.length === 0 && !error && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No Designs Yet
              </h2>
              <p className="text-gray-600 mb-6">
                Your designs from past orders will appear here. Start by
                creating a new order with design uploads.
              </p>
              <Button
                onClick={() => navigate("/products")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create a New Order
              </Button>
            </div>
          )}

          {/* Designs by Order */}
          {designsByOrder.length > 0 && (
            <div className="space-y-4">
              {designsByOrder.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Order Header */}
                  <button
                    onClick={() =>
                      setExpandedOrderId(
                        expandedOrderId === order.orderId
                          ? null
                          : order.orderId,
                      )
                    }
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 text-left">
                      <div className="bg-gray-100 p-3 rounded-lg flex-shrink-0">
                        <Cloud className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.orderId}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}
                          >
                            {order.orderStatus.charAt(0).toUpperCase() +
                              order.orderStatus.slice(1)}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-pink-50 text-pink-700">
                            {order.designs.length} design
                            {order.designs.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.orderDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                        expandedOrderId === order.orderId ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Design Details - Expanded */}
                  {expandedOrderId === order.orderId && (
                    <div className="border-t border-gray-200 px-6 py-6 bg-gray-50">
                      {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {order.designs.map((design) => (
                            <div
                              key={design.id}
                              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                            >
                              {/* Design Preview */}
                              <div className="bg-gradient-to-br from-pink-50 to-purple-50 h-40 flex items-center justify-center relative overflow-hidden">
                                {design.url ? (
                                  <img
                                    src={design.url}
                                    alt={design.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Cloud className="w-12 h-12 text-gray-300" />
                                )}
                              </div>

                              {/* Design Info */}
                              <div className="p-4">
                                <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                                  {design.name}
                                </h4>
                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                  {design.description || "Design file"}
                                </p>

                                {design.size && (
                                  <p className="text-xs text-gray-600 mb-2">
                                    Size: {design.size}
                                  </p>
                                )}

                                <div className="flex gap-2">
                                  {design.url && (
                                    <a
                                      href={design.url}
                                      download
                                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
                                    >
                                      <Download className="w-3 h-3" />
                                      Download
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {order.designs.map((design) => (
                            <div
                              key={design.id}
                              className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="bg-gradient-to-br from-pink-50 to-purple-50 w-16 h-16 rounded flex items-center justify-center flex-shrink-0">
                                  {design.url ? (
                                    <img
                                      src={design.url}
                                      alt={design.name}
                                      className="w-full h-full object-cover rounded"
                                    />
                                  ) : (
                                    <Cloud className="w-8 h-8 text-gray-300" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 text-sm">
                                    {design.name}
                                  </h4>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {design.description || "Design file"}
                                  </p>
                                  {design.createdAt && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {formatDate(design.createdAt)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {design.url && (
                                <a
                                  href={design.url}
                                  download
                                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-2 flex-shrink-0"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
