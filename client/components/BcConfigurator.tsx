import React, { useState } from "react";
import { ShoppingCart, AlertCircle, Loader } from "lucide-react";

/* ====== CONFIG: replace these with your real IDs ====== */
const PRODUCT_ID = 123; // BigCommerce product ID
// Example mapping: option name -> option id / input id (fill with IDs from your store)
const OPTION_IDS = {
  Shape: 111,      // product option id for "Shape"
  Material: 112,   // product option id for "Material"
  Size: 113,       // product option id for "Size"
  Quantity: null,  // we'll use quantity field, not an option id
  Upload: 114      // file-upload option id (if used)
};
/* ===================================================== */

export default function BcConfigurator({ product: builderProduct }) {
  // selections
  const [shape, setShape] = useState<string | null>(null);
  const [material, setMaterial] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(50);
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // cart / price state
  const [cartId, setCartId] = useState<string | null>(null);
  const [priceInfo, setPriceInfo] = useState({ subtotal: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Helper: create a storefront cart (or reuse)
  async function ensureCart() {
    if (cartId) return cartId;
    try {
      // create cart
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ line_items: [] })
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
      const message = err instanceof Error ? err.message : "Failed to create cart";
      throw new Error(message);
    }
  }

  // Build line item payload with option selections (BigCommerce expects option selections or variant ids)
  function buildLineItemPayload() {
    // If your product uses variants (variant ids), include variant_id
    // Or include product_options: [{option_id, option_value}]
    const item: any = {
      product_id: PRODUCT_ID,
      quantity: quantity,
      // BigCommerce expects `option_selections` or `product_options` depending on API version.
      // We'll use product_options array which is accepted by some storefront endpoints.
      // If your store expects variant_id, swap in variant_id with the correct id.
      product_options: []
    };

    if (shape) item.product_options.push({ option_id: OPTION_IDS.Shape, option_value: shape });
    if (material) item.product_options.push({ option_id: OPTION_IDS.Material, option_value: material });
    if (size) item.product_options.push({ option_id: OPTION_IDS.Size, option_value: size });

    // For file uploads: BigCommerce expects the file to be sent as multipart form-data
    // and attached as a `file` field or a custom modifier - see addFileToCart() below
    return item;
  }

  // Add item(s) to cart and optionally include file upload
  async function addToCart() {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const cart = await ensureCart();

      // If there's a file to upload and BigCommerce requires a multipart POST for file modifier,
      // we'll send a multipart request directly to the cart add endpoint.
      if (file && OPTION_IDS.Upload) {
        // Create formdata payload expected by BigCommerce file modifier
        const form = new FormData();
        // attach basic cart creation payload (line_items JSON)
        const lineItems = [buildLineItemPayload()];
        form.append("line_items", JSON.stringify(lineItems));

        // attach file under a key the store expects; many BigCommerce implementations expect
        // the file to be present and the product option configured as "File Upload" (server stores it)
        form.append("file", file, file.name);

        // add notes (as a cart-level field if supported)
        if (notes) form.append("custom_fields", JSON.stringify([{ name: "Notes", value: notes }]));

        const res = await fetch("/api/storefront/carts", {
          method: "POST",
          body: form
        });
        const json = await res.json();
        // update UI price
        setPriceInfo(extractPrices(json));
        setCartId(json.data?.id || json.id || cart);
      } else {
        // simple JSON add:
        const payload = { line_items: [buildLineItemPayload()] };
        const res = await fetch("/api/storefront/carts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        setPriceInfo(extractPrices(json));
        setCartId(json.data?.id || json.id || cart);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      // success UX: you can redirect to /cart or show a modal
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not add to cart";
      console.error("Add to cart error", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function extractPrices(cartJson: any) {
    // BigCommerce response shapes vary; try common paths
    const data = cartJson.data || cartJson;
    const subtotal = ((data?.cart?.base_amount || data?.base_amount || 0) / 100) || 0;
    const total = ((data?.cart?.cart_amount || data?.cart?.base_amount || 0) / 100) || subtotal;
    return { subtotal, total };
  }

  // Example UI: simple card grids — replace classes with your design / icons
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Shape panel */}
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-4">Select a Shape</h4>
        <div className="grid grid-cols-2 gap-2">
          {["Custom Shape","Kiss-Cut","Circle","Oval","Square","Rectangle"].map(option => (
            <button
              key={option}
              onClick={() => setShape(option)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                shape === option 
                  ? "bg-blue-600 text-white border-2 border-blue-600" 
                  : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Material panel */}
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-4">Material</h4>
        <div className="flex flex-col gap-2">
          {["Matte","Gloss"].map(opt => (
            <button 
              key={opt} 
              onClick={() => setMaterial(opt)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                material === opt 
                  ? "bg-blue-600 text-white border-2 border-blue-600" 
                  : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Size panel */}
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-4">Select a Size</h4>
        <div className="grid grid-cols-2 gap-2">
          {["Small (2\")","Medium (3\")","Large (4\")","X-Large (5\")"].map(opt => (
            <button 
              key={opt} 
              onClick={() => setSize(opt)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                size === opt 
                  ? "bg-blue-600 text-white border-2 border-blue-600" 
                  : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
              }`}
            >
              {opt}
            </button>
          ))}
          <input 
            placeholder="Custom size" 
            onBlur={e => setSize(e.target.value)} 
            className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Price / quantity panel */}
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-4">Quantity</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {[50,100,200,300,500,1000,2500].map(q => (
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
              <span className="text-gray-600">${(q * 0.25).toFixed(2)}</span>
            </label>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-300">
          <div className="font-bold text-lg text-gray-900 mb-4">
            Total: ${priceInfo.total || (quantity * 0.25).toFixed(2)}
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
            onChange={e => setNotes(e.target.value)} 
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
              onChange={e => setFile(e.target.files?.[0] || null)} 
              className="hidden"
            />
            <div className="text-gray-700 font-medium">
              {file ? file.name : "Drag or click to upload"}
            </div>
            <div className="text-xs text-gray-500 mt-1">PNG, JPG, PDF (max 50MB)</div>
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
