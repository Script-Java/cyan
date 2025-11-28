import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, AlertCircle, Loader } from "lucide-react";
import { toast } from "sonner";

interface ProductOption {
  id: number;
  name: string;
  type: string;
  option_values: Array<{
    id: number;
    label: string;
    value?: string;
  }>;
}

export default function BcConfigurator({ productId, product: builderProduct }) {
  // Product options state
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  // selections - using a map for dynamic options
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, string>
  >({});
  const [quantity, setQuantity] = useState(50);
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // cart / price state
  const [cartId, setCartId] = useState<string | null>(null);
  const [priceInfo, setPriceInfo] = useState({ subtotal: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fetch product options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      setOptionsLoading(true);
      try {
        const response = await fetch(`/api/products/${productId}/options`);
        if (response.ok) {
          const data = await response.json();
          setProductOptions(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch product options:", err);
      } finally {
        setOptionsLoading(false);
      }
    };

    if (productId) {
      fetchOptions();
    }
  }, [productId]);

  // Helper: create a storefront cart (or reuse)
  async function ensureCart() {
    if (cartId) return cartId;
    try {
      // create cart
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ line_items: [] }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create cart");
      }

      const data = await res.json();
      const newCartId = data.data?.id || null;

      if (!newCartId) {
        throw new Error("No cart ID returned from server");
      }

      setCartId(newCartId);
      return newCartId;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create cart";
      throw new Error(message);
    }
  }

  // Build line item payload with option selections (BigCommerce expects option selections or variant ids)
  function buildLineItemPayload() {
    const item: any = {
      product_id: productId,
      quantity: quantity,
      product_options: [],
    };

    // Add all selected options
    Object.entries(selectedOptions).forEach(([optionId, optionValue]) => {
      if (optionValue) {
        item.product_options.push({
          option_id: parseInt(optionId, 10),
          option_value: optionValue,
        });
      }
    });

    return item;
  }

  // Add item(s) to cart and redirect to BigCommerce checkout
  async function addToCart() {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      setSuccess(true);
      toast.success("Redirecting to BigCommerce checkout...");

      // Store the product and options for checkout
      const checkoutData = {
        product_id: productId,
        quantity: quantity,
        selectedOptions: selectedOptions,
        notes: notes,
        file: file ? file.name : null,
      };

      sessionStorage.setItem("pending_checkout", JSON.stringify(checkoutData));

      // Redirect to checkout page which will handle BigCommerce checkout
      setTimeout(() => {
        window.location.href = `/checkout-bigcommerce`;
      }, 1500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not proceed to checkout";
      console.error("Add to cart error", err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function extractPrices(cartJson: any) {
    // BigCommerce response shapes vary; try common paths
    const data = cartJson.data || cartJson;
    const subtotal =
      (data?.cart?.base_amount || data?.base_amount || 0) / 100 || 0;
    const total =
      (data?.cart?.cart_amount || data?.cart?.base_amount || 0) / 100 ||
      subtotal;
    return { subtotal, total };
  }

  // Loading state
  if (optionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading product options...</p>
        </div>
      </div>
    );
  }

  // Render dynamic product options
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Dynamic Option Panels */}
      {productOptions.map((option) => (
        <div
          key={option.id}
          className="p-4 rounded-lg bg-gray-50 border border-gray-200"
        >
          <h4 className="font-bold text-gray-900 mb-4">{option.name}</h4>
          <div className="flex flex-col gap-2">
            {option.option_values.map((value) => (
              <button
                key={value.id}
                onClick={() =>
                  setSelectedOptions({
                    ...selectedOptions,
                    [option.id]: value.label,
                  })
                }
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                  selectedOptions[option.id] === value.label
                    ? "bg-blue-600 text-white border-2 border-blue-600"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
                }`}
              >
                {value.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Price / quantity panel */}
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-4">Quantity</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {[50, 100, 200, 300, 500, 1000, 2500].map((q) => (
            <label
              key={q}
              className={`flex justify-between items-center p-2 rounded-lg cursor-pointer text-sm transition-all ${
                quantity === q
                  ? "bg-blue-100 border-2 border-blue-600"
                  : "bg-white border border-gray-300 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                checked={quantity === q}
                onChange={() => setQuantity(q)}
                className="cursor-pointer"
              />
              <span className="font-medium">{q} pcs</span>
              <span className="text-gray-600">
                $
                {builderProduct?.price &&
                typeof builderProduct.price === "number"
                  ? (q * builderProduct.price).toFixed(2)
                  : (q * 0.25).toFixed(2)}
              </span>
            </label>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-300">
          <div className="font-bold text-lg text-gray-900 mb-4">
            Total: $
            {priceInfo.total ||
              (builderProduct?.price && typeof builderProduct.price === "number"
                ? (quantity * builderProduct.price).toFixed(2)
                : (quantity * 0.25).toFixed(2))}
          </div>

          <button
            onClick={addToCart}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      {/* Below full-width: notes + upload + previews */}
      <div className="col-span-1 md:col-span-4 flex flex-col lg:flex-row gap-4 mt-4">
        <div className="flex-1">
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Special Requests
          </label>
          <textarea
            placeholder="Enter any special requests..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-40 resize-none"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Upload Artwork
          </label>
          <label className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
            <div className="text-4xl mb-2">📁</div>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <div className="text-gray-700 font-medium">
              {file ? file.name : "Drag or click to upload"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              PNG, JPG, PDF (max 50MB)
            </div>
          </label>
        </div>
      </div>

      {/* Error/Success messages */}
      {error && (
        <div className="col-span-1 md:col-span-4 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="col-span-1 md:col-span-4 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <ShoppingCart className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">✓ Item added to cart!</p>
        </div>
      )}
    </div>
  );
}
