import { useState } from "react";
import {
  CheckCircle,
  Package,
  Calendar,
  ChevronDown,
  ChevronUp,
  Truck,
  MapPin,
  User,
  Mail,
  Phone,
  Image as ImageIcon,
  ArrowRight,
  DollarSign,
} from "lucide-react";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price_inc_tax?: number;
  price_ex_tax?: number;
  price?: number;
  option_price?: number;
  total_price?: number;
  options?: Record<string, any> | Array<{
    option_id?: string;
    option_name?: string;
    name?: string;
    option_value?: string;
    value?: string;
    price?: number;
    modifier_price?: number;
  }>;
  design_file_url?: string;
}

interface DigitalFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  uploaded_at: string;
}

interface Order {
  id: number;
  customerId: number;
  status: string;
  dateCreated: string;
  total: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  itemCount: number;
  items?: OrderItem[];
  tracking_number?: string;
  tracking_carrier?: string;
  tracking_url?: string;
  shipped_date?: string;
  estimated_delivery_date?: string;
  digital_files?: DigitalFile[];
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

interface ActiveOrdersSummaryProps {
  activeOrders: Order[];
}

export default function ActiveOrdersSummary({
  activeOrders,
}: ActiveOrdersSummaryProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/30";
      case "processing":
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30";
      case "printing":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/30";
      case "in transit":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/30";
      default:
        return "bg-white/5 text-white/60 border border-white/10";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-700 border-2 border-orange-300";
      case "processing":
        return "bg-yellow-100 text-yellow-700 border-2 border-yellow-300";
      case "printing":
        return "bg-purple-100 text-purple-700 border-2 border-purple-300";
      case "in transit":
        return "bg-blue-100 text-blue-700 border-2 border-blue-300";
      default:
        return "bg-gray-100 text-gray-600 border-2 border-gray-300";
    }
  };

  const toggleExpanded = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Helper function to safely format prices
  const formatPrice = (price: number | undefined): string => {
    if (typeof price === "number") {
      return price.toFixed(2);
    }
    return "0.00";
  };

  // Helper function to get item price (fallback to different field names)
  const getItemPrice = (
    item: OrderItem,
  ): number => {
    if (typeof item.price_inc_tax === "number") return item.price_inc_tax;
    if (typeof item.price_ex_tax === "number") return item.price_ex_tax;
    if (typeof item.price === "number") return item.price;
    return 0;
  };

  // Helper function to format option display value
  const formatOptionValue = (value: any): string => {
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return "";
  };

  // Helper function to format option key names (e.g., "vinyl_finish" -> "Vinyl Finish")
  const formatOptionKey = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="rounded-xl border-2 p-4 sm:p-6 mb-6 overflow-hidden bg-white shadow-md border-gray-200">
      <div
        className="border-b pb-3 sm:pb-4 mb-4 sm:mb-6"
        style={{ borderColor: "rgba(0, 0, 0, 0.1)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl font-bold text-gray-900">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
            Active Orders
            <span
              className="ml-2 px-3 py-1 rounded-full text-sm font-bold shadow-sm"
              style={{
                backgroundColor: "rgba(5, 150, 105, 0.15)",
                color: "#047857",
              }}
            >
              {activeOrders.length}
            </span>
          </h2>
        </div>
      </div>

      {activeOrders.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {activeOrders.map((order) => (
            <div
              key={order.id}
              className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg hover:border-emerald-300 transition-all group"
            >
              <div
                className={`p-3 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between cursor-pointer hover:bg-gray-50 transition-colors gap-3 sm:gap-4`}
                onClick={() => toggleExpanded(order.id)}
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="p-2 bg-emerald-50 rounded-lg flex-shrink-0">
                    <Package className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <p className="font-bold text-sm text-gray-900">
                        Order #{order.id}
                      </p>
                      <span
                        className={`text-xs font-semibold px-2 sm:px-3 py-1 rounded-full border-2 w-fit ${getStatusBadgeColor(order.status)}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-600 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        {new Date(order.dateCreated).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                        {order.itemCount}{" "}
                        {order.itemCount === 1 ? "item" : "items"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-3">
                  <p className="font-bold text-sm sm:text-base text-emerald-600">
                    ${formatPrice(order.total)}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(order.id);
                    }}
                    className="text-xs px-3 sm:px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md transition-all whitespace-nowrap flex items-center gap-1 sm:gap-2 font-semibold flex-shrink-0"
                  >
                    {expandedOrderId === order.id ? "Hide" : "Show"}
                    <span className="hidden sm:inline">Details</span>
                    {expandedOrderId === order.id ? (
                      <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Details Section */}
              {expandedOrderId === order.id && (
                <div className="bg-gray-50 border-t-2 border-gray-200 p-3 sm:p-5 space-y-3 sm:space-y-4">
                  {/* Customer Information & Shipping Address */}
                  <div className="bg-white rounded-lg border-2 border-blue-200 p-3 sm:p-4 shadow-sm">
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                      Customer & Shipping Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {order.customerName && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Full Name</p>
                          <p className="text-xs sm:text-sm font-medium text-gray-900">
                            {order.customerName}
                          </p>
                        </div>
                      )}
                      {order.customerEmail && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            Email
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-blue-600 break-all">
                            {order.customerEmail}
                          </p>
                        </div>
                      )}
                      {order.customerPhone && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            Phone
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-gray-900">
                            {order.customerPhone}
                          </p>
                        </div>
                      )}
                      {order.estimated_delivery_date && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Est. Delivery
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-blue-600">
                            {new Date(
                              order.estimated_delivery_date,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                    {order.shippingAddress && (
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Shipping Address
                        </p>
                        <div className="text-xs sm:text-sm text-gray-900 space-y-1">
                          {order.shippingAddress.street && (
                            <p>{order.shippingAddress.street}</p>
                          )}
                          <p>
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state}{" "}
                            {order.shippingAddress.postalCode}
                          </p>
                          {order.shippingAddress.country && (
                            <p>{order.shippingAddress.country}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Design File Thumbnails */}
                  {order.digital_files && order.digital_files.length > 0 && (
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                        <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        Design Files
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {order.digital_files.map((file) => (
                          <a
                            key={file.id}
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative group overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors h-20 sm:h-24"
                          >
                            {file.file_type?.includes("image") ? (
                              <img
                                src={file.file_url}
                                alt={file.file_name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-end justify-center opacity-0 group-hover:opacity-100">
                              <p className="text-white text-xs font-medium mb-1 px-1 text-center truncate">
                                {file.file_name}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Digital Files List */}
                  {order.digital_files && order.digital_files.length > 0 && (
                    <div className="bg-white rounded-lg border-2 border-blue-200 p-3 sm:p-4 shadow-sm">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                        📁 Digital Files
                      </h4>
                      <div className="space-y-2">
                        {order.digital_files.map((file) => (
                          <a
                            key={file.id}
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between bg-gray-50 p-2 sm:p-3 rounded border border-blue-100 hover:border-blue-400 hover:bg-blue-50 transition-colors gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Package className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-blue-900 truncate">
                                  {file.file_name}
                                </p>
                                {file.file_size && (
                                  <p className="text-xs text-gray-600">
                                    {formatPrice(file.file_size / 1024 / 1024)}{" "}
                                    MB
                                  </p>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="bg-white rounded-lg border-2 border-gray-200 p-3 sm:p-4 shadow-sm">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                        Order Items
                      </h4>
                      <div className="space-y-3 sm:space-y-4">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-gray-50 p-3 rounded border border-gray-200 space-y-2"
                          >
                            {/* Design File Thumbnail */}
                            {item.design_file_url && (
                              <div className="flex gap-2 mb-2">
                                {item.design_file_url.startsWith("data:") ||
                                item.design_file_url.match(
                                  /\.(jpg|jpeg|png|gif|webp)$/i,
                                ) ? (
                                  <a
                                    href={item.design_file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0"
                                  >
                                    <img
                                      src={item.design_file_url}
                                      alt="Design Upload"
                                      className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded border border-gray-300 hover:border-blue-400 transition-colors"
                                    />
                                  </a>
                                ) : (
                                  <a
                                    href={item.design_file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center rounded border border-gray-300 hover:border-blue-400 transition-colors bg-gray-100"
                                  >
                                    <Package className="w-6 h-6 text-gray-400" />
                                  </a>
                                )}
                                <div className="flex-1">
                                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                                    {item.product_name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Qty: {item.quantity}
                                  </p>
                                  <p className="text-xs sm:text-sm font-semibold text-emerald-600 mt-1">
                                    ${formatPrice(getItemPrice(item))}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Item without design file */}
                            {!item.design_file_url && (
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                                    {item.product_name}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                                <p className="text-xs sm:text-sm font-semibold text-emerald-600 flex-shrink-0">
                                  ${formatPrice(getItemPrice(item))}
                                </p>
                              </div>
                            )}

                            {/* Product Options */}
                            {item.options && (
                              <div className="pt-2 border-t border-gray-300 space-y-1">
                                <p className="text-xs font-semibold text-gray-700">
                                  Options:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {Array.isArray(item.options) ? (
                                    item.options.map((option: any, idx: number) => {
                                      const optionName =
                                        option.option_id || option.name || `Option ${idx + 1}`;
                                      const optionValue =
                                        option.option_value || option.value || "";
                                      return (
                                        <span
                                          key={idx}
                                          className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs border border-blue-300"
                                        >
                                          {optionName}: {optionValue}
                                        </span>
                                      );
                                    })
                                  ) : (
                                    Object.entries(item.options).map(([key, value]) => {
                                      const displayValue = formatOptionValue(value);
                                      const label = /^\d+$/.test(key)
                                        ? displayValue
                                        : `${key}: ${displayValue}`;
                                      return (
                                        <span
                                          key={key}
                                          className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs border border-blue-300"
                                        >
                                          {label}
                                        </span>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Totals - Detailed */}
                  <div className="bg-white rounded-lg border-2 border-gray-200 p-3 sm:p-4 shadow-sm">
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                      Order Summary
                    </h3>

                    {/* Item Breakdown - Detailed */}
                    <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Items Breakdown:
                      </p>
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-3">
                          {order.items.map((item) => {
                            const unitPrice = getItemPrice(item);

                            // Calculate total option price by summing all individual option prices
                            let totalOptionPrice = 0;
                            if (item.options) {
                              if (Array.isArray(item.options)) {
                                totalOptionPrice = item.options.reduce((sum, option) => {
                                  const optionPrice = option.price || option.modifier_price || 0;
                                  return sum + optionPrice;
                                }, 0);
                              } else {
                                // Handle object format
                                Object.values(item.options).forEach((val: any) => {
                                  const optionPrice = typeof val === "object" ? (val.price || val.modifier_price || 0) : 0;
                                  totalOptionPrice += optionPrice;
                                });
                              }
                            }

                            const pricePerUnit = unitPrice + totalOptionPrice;
                            const itemTotal = pricePerUnit * item.quantity;

                            return (
                              <div
                                key={item.id}
                                className="bg-gray-50 p-2 rounded border border-gray-100 text-xs"
                              >
                                {/* Product Name */}
                                <p className="font-semibold text-gray-900 mb-1">
                                  {item.product_name}
                                </p>

                                {/* Cost Breakdown Table */}
                                <div className="space-y-1 text-xs">
                                  {/* Price Explanation Note */}
                                  <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                                    <p className="text-blue-900 font-medium text-xs">Why Base Cost Per Sticker is ${formatPrice(pricePerUnit)}:</p>
                                    <div className="text-blue-800 text-xs mt-1 space-y-1">
                                      <div>📌 Base sticker price: <span className="font-semibold">$0.40</span></div>
                                      {totalOptionPrice > 0 && (
                                        <>
                                          <div>➕ Gloss & Lamination finish: <span className="font-semibold">+$0.10</span></div>
                                          <div className="pt-1 border-t border-blue-300 mt-1">
                                            <strong>= Final cost per sticker: ${formatPrice(pricePerUnit)}</strong>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Base Cost per Sticker:
                                    </span>
                                    <span className="text-gray-900 font-medium">
                                      ${formatPrice(unitPrice)}
                                    </span>
                                  </div>

                                  {/* Selected Options Summary */}
                                  {item.options && (
                                    <div className="pt-1 border-t border-gray-300 space-y-1">
                                      <p className="text-xs font-semibold text-gray-700 mb-1">
                                        Selected Options & Adjustments:
                                      </p>
                                      <div className="space-y-1 pl-2 border-l-2 border-blue-200">
                                        {Array.isArray(item.options) ? (
                                          item.options.map((option: any, idx: number) => {
                                            const optionPrice = option.price || option.modifier_price || 0;
                                            const optionName =
                                              option.option_name ||
                                              option.name ||
                                              option.option_id ||
                                              `Option ${idx + 1}`;
                                            const optionValue =
                                              option.option_value || option.value || "";

                                            return (
                                              <div key={idx} className="text-xs text-gray-700">
                                                {optionName}
                                                {optionValue && ` (${optionValue})`}
                                                {optionPrice > 0 && (
                                                  <span className="text-blue-600 font-medium ml-1">
                                                    +${formatPrice(optionPrice)}
                                                  </span>
                                                )}
                                              </div>
                                            );
                                          })
                                        ) : (
                                          Object.entries(item.options).map(([key, val]: [string, any]) => {
                                            const optionPrice = typeof val === "object" ? val.price || val.modifier_price : 0;
                                            const displayValue =
                                              typeof val === "object" ? val.value || val.name : val;
                                            const formattedKey = formatOptionKey(key);

                                            return (
                                              <div key={key} className="text-xs text-gray-700">
                                                {formattedKey}
                                                {displayValue && ` (${formatOptionValue(displayValue)})`}
                                                {optionPrice > 0 && (
                                                  <span className="text-blue-600 font-medium ml-1">
                                                    +${formatPrice(optionPrice)}
                                                  </span>
                                                )}
                                              </div>
                                            );
                                          })
                                        )}
                                      </div>
                                      <div className="pt-1 mt-1 border-t border-blue-200 flex justify-between text-xs font-semibold">
                                        <span className="text-gray-700">Total Option Cost:</span>
                                        <span className="text-blue-600">+${formatPrice(totalOptionPrice)}</span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Adjusted Price Summary */}
                                  <div className="pt-2 border-t border-gray-300 space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Adjusted Cost per Sticker:
                                      </span>
                                      <span className="text-gray-900 font-medium">
                                        ${formatPrice(pricePerUnit)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Quantity:
                                      </span>
                                      <span className="text-gray-900 font-medium">
                                        × {item.quantity}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Summary Total */}
                                  <div className="pt-2 border-t border-gray-300 flex justify-between font-semibold">
                                    <span className="text-gray-900">
                                      Item Total:
                                    </span>
                                    <span className="text-emerald-600">
                                      ${formatPrice(itemTotal)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-600">
                          {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium text-gray-900">
                          ${formatPrice(order.subtotal || 0)}
                        </span>
                      </div>

                      {order.tax !== undefined && order.tax > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax:</span>
                          <span className="font-medium text-gray-900">
                            ${formatPrice(order.tax)}
                          </span>
                        </div>
                      )}

                      {/* Shipping */}
                      {order.shipping !== undefined && order.shipping > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping:</span>
                          <span className="font-medium text-gray-900">
                            ${formatPrice(order.shipping)}
                          </span>
                        </div>
                      )}

                      {/* Divider */}
                      <div className="pt-2 border-t-2 border-gray-300 flex justify-between">
                        <span className="font-bold text-gray-900">
                          Order Total:
                        </span>
                        <span className="font-bold text-lg text-emerald-600">
                          ${formatPrice(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 p-2 rounded text-center">
                        <p className="text-xs text-gray-600">Items</p>
                        <p className="text-sm font-bold text-gray-900">
                          {order.itemCount}
                        </p>
                      </div>
                      <div className="bg-emerald-50 p-2 rounded text-center">
                        <p className="text-xs text-gray-600">Order Date</p>
                        <p className="text-xs font-medium text-emerald-700">
                          {new Date(order.dateCreated).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Information */}
                  {(order.tracking_number || order.shipped_date) && (
                    <div className="bg-white rounded-lg border-2 border-blue-200 p-3 sm:p-4 shadow-sm">
                      <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                        <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        Shipping & Tracking
                      </h3>
                      <div className="space-y-2 text-xs sm:text-sm">
                        {order.shipped_date && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipped Date:</span>
                            <span className="font-semibold text-gray-900">
                              {new Date(
                                order.shipped_date,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {order.tracking_number && (
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                            <span className="text-gray-600">
                              Tracking Number:
                            </span>
                            <div className="flex flex-col items-start sm:items-end gap-1">
                              <span className="font-mono font-semibold text-gray-900 text-xs sm:text-sm break-all">
                                {order.tracking_number}
                              </span>
                              {order.tracking_carrier && (
                                <span className="text-xs text-gray-500">
                                  {order.tracking_carrier}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {order.tracking_url && (
                          <div className="pt-2">
                            <a
                              href={order.tracking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs px-2 sm:px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300 transition-colors font-semibold shadow-sm"
                            >
                              <MapPin className="w-3 h-3" />
                              <span>Track</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12">
          <h3 className="text-base sm:text-lg font-bold text-gray-600">
            There are no active orders
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            No orders with pending, processing, printing, or in transit statuses
          </p>
        </div>
      )}
    </div>
  );
}
