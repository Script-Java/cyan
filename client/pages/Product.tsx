import Header from "@/components/Header";
import ProductGallery from "@/components/ProductGallery";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, X, AlertCircle, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ProductImage {
  id?: string;
  url: string;
  name?: string;
  preview?: string;
}

interface VariantValue {
  id: string;
  name: string;
  priceModifier?: number;
  image?: {
    id: string;
    url: string;
    name: string;
    preview?: string;
  };
}

interface ProductOption {
  id: string;
  name: string;
  type: "dropdown" | "swatch" | "radio" | "text";
  required?: boolean;
  values: VariantValue[];
  defaultValueId?: string;
  displayOrder?: number;
}

interface ProductData {
  id: string;
  name: string;
  description?: string;
  base_price?: number;
  price?: number;
  image_url?: string;
  images?: ProductImage[];
  weight?: number;
  type?: string;
  status?: string;
  options?: ProductOption[];
  availability?: boolean;
  customer_upload_config?: {
    enabled: boolean;
    maxFileSize: number;
    allowedFormats: string[];
    description: string;
  };
  optional_fields?: Array<{ name: string; type: string }>;
  show_quantity_panel?: boolean;
  fixed_quantity?: number | null;
}

const MOCK_PRODUCTS: Record<string, ProductData> = {
  "test-square-product": {
    id: "999",
    name: "Test Square Product",
    description:
      "Perfect for testing Square checkout integration. $1.00 product.",
    price: 1.0,
    image_url: "/placeholder.svg",
    type: "sticker",
    status: "ACTIVE",
    options: [],
    images: [{ url: "/placeholder.svg", name: "Test Product" }],
    availability: true,
    customer_upload_config: {
      enabled: true,
      maxFileSize: 5,
      allowedFormats: ["pdf", "ai", "png", "jpg"],
      description: "Upload your design",
    },
    optional_fields: [],
    show_quantity_panel: true,
    fixed_quantity: null,
  },
};

export default function Product() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<
    { [optionId: string]: string }
  >({});
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designPreview, setDesignPreview] = useState<string | null>(null);
  const [optionalFields, setOptionalFields] = useState<
    { [fieldName: string]: string }
  >({});
  const [orderNotes, setOrderNotes] = useState("");
  const [quantity, setQuantity] = useState(100);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeQuantityOption, setActiveQuantityOption] = useState<
    number | null
  >(100);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if it's a mock product first
        if (productId && productId in MOCK_PRODUCTS) {
          const mockProduct = MOCK_PRODUCTS[productId];
          setProduct(mockProduct);
          if (mockProduct.optional_fields) {
            const initialFields: { [key: string]: string } = {};
            mockProduct.optional_fields.forEach((field) => {
              initialFields[field.name] = "";
            });
            setOptionalFields(initialFields);
          }
          setIsLoading(false);
          return;
        }

        // Handle new admin/imported product IDs (admin_11, imported_5, etc.)
        if (productId?.startsWith("admin_")) {
          const adminId = productId.split("_")[1];
          const response = await fetch(`/api/public/products/admin/${adminId}`);

          if (!response.ok) {
            throw new Error("Failed to fetch admin product");
          }

          const data = await response.json();
          const productData: ProductData = {
            id: adminId,
            name: data.name,
            description: data.description,
            base_price: data.base_price || data.price,
            price: data.base_price || data.price,
            images: data.images || [{ url: data.image_url || "/placeholder.svg" }],
            type: "sticker",
            status: data.availability ? "ACTIVE" : "INACTIVE",
            options: data.options || [],
            availability: data.availability ?? true,
            customer_upload_config: data.customer_upload_config || {
              enabled: true,
              maxFileSize: 5,
              allowedFormats: ["pdf", "ai", "png", "jpg"],
              description: "Upload your design",
            },
            optional_fields: data.optional_fields || [],
            show_quantity_panel: data.show_quantity_panel === true,
            fixed_quantity: data.fixed_quantity || null,
          };
          setProduct(productData);

          // Set quantity based on product settings
          if (productData.show_quantity_panel === false && productData.fixed_quantity) {
            setQuantity(productData.fixed_quantity);
            setActiveQuantityOption(productData.fixed_quantity);
          }

          if (productData.optional_fields) {
            const initialFields: { [key: string]: string } = {};
            productData.optional_fields.forEach((field) => {
              initialFields[field.name] = "";
            });
            setOptionalFields(initialFields);
          }

          if (productData.options) {
            const initialOptions: { [key: string]: string } = {};
            productData.options.forEach((option) => {
              if (option.defaultValueId) {
                initialOptions[option.id] = option.defaultValueId;
              } else if (option.values && option.values.length > 0) {
                initialOptions[option.id] = option.values[0].id;
              }
            });
            setSelectedOptions(initialOptions);
          }

          setIsLoading(false);
          return;
        }

        if (productId?.startsWith("imported_")) {
          const importedId = productId.split("_")[1];
          const response = await fetch(`/api/public/products/imported/${importedId}`);

          if (!response.ok) {
            throw new Error("Failed to fetch imported product");
          }

          const data = await response.json();
          const productData: ProductData = {
            id: importedId,
            name: data.name,
            description: data.description,
            price: data.min_price || data.price,
            base_price: data.min_price || data.price,
            image_url: data.image_url,
            images: data.image_url ? [{ url: data.image_url }] : [],
            type: "sticker",
            status: "ACTIVE",
            options: data.options || [],
            availability: true,
            customer_upload_config: {
              enabled: true,
              maxFileSize: 5,
              allowedFormats: ["pdf", "ai", "png", "jpg"],
              description: "Upload your design",
            },
            optional_fields: [],
            show_quantity_panel: data.show_quantity_panel === true,
            fixed_quantity: data.fixed_quantity || null,
          };
          setProduct(productData);

          // Set quantity based on product settings
          if (productData.show_quantity_panel === false && productData.fixed_quantity) {
            setQuantity(productData.fixed_quantity);
            setActiveQuantityOption(productData.fixed_quantity);
          }

          if (productData.options) {
            const initialOptions: { [key: string]: string } = {};
            productData.options.forEach((option) => {
              if (option.defaultValueId) {
                initialOptions[option.id] = option.defaultValueId;
              } else if (option.values && option.values.length > 0) {
                initialOptions[option.id] = option.values[0].id;
              }
            });
            setSelectedOptions(initialOptions);
          }

          setIsLoading(false);
          return;
        }

        setError("Product not found");
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load product";
        console.error("Product fetch error:", {
          productId,
          error: errorMessage,
          details: err,
        });
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleDesignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedFormats =
      product?.customer_upload_config?.allowedFormats || [
        "pdf",
        "ai",
        "png",
        "jpg",
      ];
    if (
      !allowedFormats.includes(
        file.name.split(".").pop()?.toLowerCase() || "",
      )
    ) {
      toast.error(
        `Invalid File Format. Allowed: ${allowedFormats.join(", ")}`,
      );
      return;
    }

    const maxSize = (product?.customer_upload_config?.maxFileSize || 5) * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(
        `File Too Large. Max: ${product?.customer_upload_config?.maxFileSize}MB`,
      );
      return;
    }

    setDesignFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setDesignPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeDesign = () => {
    setDesignFile(null);
    setDesignPreview(null);
  };

  const calculatePrice = (): string => {
    if (!product) return "0.00";
    let totalPrice = product.base_price || 0;

    Object.entries(selectedOptions).forEach(([optionId, valueId]) => {
      const option = product.options?.find((o) => o.id === optionId);
      if (option) {
        const value = option.values.find((v) => v.id === valueId);
        if (value && value.priceModifier && value.priceModifier !== 0) {
          totalPrice += value.priceModifier;
        }
      }
    });

    return totalPrice.toFixed(2);
  };

  const getQuantityTierPricing = () => {
    const basePricePerUnit = parseFloat(calculatePrice());
    const quantityTiers = [
      { qty: 50, discountPercent: 0 },
      { qty: 100, discountPercent: 0 },
      { qty: 200, discountPercent: 0 },
      { qty: 300, discountPercent: 0 },
      { qty: 500, discountPercent: 0 },
      { qty: 1000, discountPercent: 0 },
      { qty: 2500, discountPercent: 0 },
    ];

    return quantityTiers.map((tier) => {
      const discountedPrice =
        basePricePerUnit * (1 - tier.discountPercent / 100);
      const totalPrice = discountedPrice * tier.qty;
      return {
        qty: tier.qty,
        price: totalPrice,
        save: tier.discountPercent > 0 ? tier.discountPercent : null,
      };
    });
  };

  const handleAddToCart = async () => {
    if (product?.customer_upload_config?.enabled && !designFile) {
      toast.error("Please upload your design to continue");
      return;
    }

    setIsAddingToCart(true);
    try {
      const basePrice = parseFloat(calculatePrice());
      const quantityTiers = [
        { qty: 50, discountPercent: 0 },
        { qty: 100, discountPercent: 0 },
        { qty: 200, discountPercent: 0 },
        { qty: 300, discountPercent: 0 },
        { qty: 500, discountPercent: 0 },
        { qty: 1000, discountPercent: 0 },
        { qty: 2500, discountPercent: 0 },
      ];
      const tierInfo = quantityTiers.find((t) => t.qty === quantity);
      const savePercentage = tierInfo?.discountPercent || 0;

      const discountedPricePerUnit =
        basePrice * (1 - savePercentage / 100);
      const totalPrice = discountedPricePerUnit * quantity;

      let design_file_url: string | undefined;
      if (designFile) {
        const reader = new FileReader();
        design_file_url = await new Promise((resolve) => {
          reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.readAsDataURL(designFile);
        });
      }

      const cartItem = {
        productId: productId!,
        selectedOptions,
        design_file_url,
        optionalFields,
        orderNotes,
        quantity,
        pricePerUnit: discountedPricePerUnit,
        totalPrice,
        basePrice,
        savePercentage,
      };

      const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
      existingCart.push(cartItem);
      localStorage.setItem("cart", JSON.stringify(existingCart));

      toast.success("Product added to cart");
      setShowCheckoutDialog(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add product to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#fafafa] text-black flex items-center justify-center pt-20">
          <div className="text-center">
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <div className="pt-20 min-h-screen bg-[#fafafa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Product Not Found
              </h1>
              <p className="text-gray-600 mb-8">
                {error || "We couldn't find the product you're looking for."}
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const productImages =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.url)
      : [product.image_url || "/placeholder.svg"];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white text-black">
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto 3px",
            padding: "12px 12px 80px",
          }}
          className="px-3 sm:px-4 lg:px-6 pt-20"
        >
          {/* Back Navigation */}
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition mb-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Product Gallery with Description */}
          <div
            className="mb-3 bg-white rounded-lg border border-gray-200 p-3"
            style={{
              backdropFilter: "blur(4px)",
              backgroundColor: "rgb(255, 255, 255)",
              borderColor: "rgba(220, 220, 220, 0.8)",
            }}
          >
            <div className="mb-2">
              <ProductGallery
                images={productImages}
                productName={product.name}
                productDescription={product.description}
              />
            </div>
          </div>

          {/* Main Content Grid - 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
            {/* Product Options - Each in Own Column */}
            {product.options &&
              product.options.map((option) => (
                <div
                  key={option.id}
                  className="backdrop-blur-xl bg-gray-50 border border-gray-200 rounded-lg"
                  style={{ marginRight: "0px", padding: "10px 8px 10px 8px" }}
                >
                  <h2 className="text-xs font-bold mb-1.5 flex items-center gap-1">
                    {option.name === "Shape" && (
                      <img
                        src="https://res.cloudinary.com/dxcnvqk6b/image/upload/v1763135086/StickerShuttle_DieCutIcon_r0vire.png"
                        alt={option.name}
                        className="w-5 h-5"
                      />
                    )}
                    {option.name === "Material" && (
                      <img
                        src="https://res.cloudinary.com/dxcnvqk6b/image/upload/v1763228661/StickerShuttle_KissCutIcon_pynbqq.png"
                        alt={option.name}
                        className="w-5 h-5"
                      />
                    )}
                    {option.name === "Size" && (
                      <img
                        src="https://res.cloudinary.com/dxcnvqk6b/image/upload/v1763135086/StickerShuttle_CircleIcon_igib6i.png"
                        alt={option.name}
                        className="w-5 h-5"
                      />
                    )}
                    <span className="truncate">Select a {option.name}</span>
                  </h2>

                  {option.type === "dropdown" && (
                    <div className="grid grid-cols-1 gap-2">
                      {option.values.map((value, index) => (
                        <button
                          key={value.id}
                          onClick={() => {
                            const newOptions = {
                              ...selectedOptions,
                              [option.id]: value.id,
                            };
                            setSelectedOptions(newOptions);
                          }}
                          className={`relative flex flex-row items-center justify-start gap-3 border-2 rounded p-2 transition text-left ${
                            selectedOptions[option.id] === value.id
                              ? "border-purple-500 bg-purple-100 shadow-lg shadow-purple-200/50"
                              : "border-gray-200 hover:border-gray-300 bg-gray-50"
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {option.name === "Material" &&
                            value.name?.toLowerCase() === "satin" ? (
                              <img
                                src="https://cdn.builder.io/api/v1/image/assets%2F1e00ee8c48924560b1c928d354e4521b%2F1b04ce3e2b7342ff891113ccedd6beda?format=webp&width=800"
                                alt="Satin"
                                className="w-10 h-10 object-contain"
                              />
                            ) : (
                              value.image && (
                                <img
                                  src={value.image.preview || value.image.url}
                                  alt={value.name}
                                  className="w-10 h-10 object-contain"
                                />
                              )
                            )}
                          </div>
                          <div className="flex-grow flex flex-col items-start justify-center">
                            <p className="font-medium text-sm text-black">
                              {value.name}
                            </p>
                            {value.priceModifier !== undefined && value.priceModifier > 0 && (
                              <p className="text-xs text-gray-600 mt-0.5">
                                +${value.priceModifier.toFixed(2)}
                              </p>
                            )}
                          </div>
                          {index === 0 && (
                            <span
                              className="absolute top-1 right-1 text-xxs font-bold text-white bg-purple-600 px-1.5 py-0.5 rounded"
                              style={{ fontSize: "10px" }}
                            >
                              Popular
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {option.type === "radio" && (
                    <div className="grid grid-cols-2 gap-1">
                      {option.values.map((value) => (
                        <button
                          key={value.id}
                          onClick={() => {
                            const newOptions = {
                              ...selectedOptions,
                              [option.id]: value.id,
                            };
                            setSelectedOptions(newOptions);
                          }}
                          className={`border-2 rounded-lg p-1 transition text-center text-xs ${
                            selectedOptions[option.id] === value.id
                              ? "border-purple-500 bg-purple-100"
                              : "border-gray-200 hover:border-gray-300 bg-gray-50"
                          }`}
                        >
                          {value.image && (
                            <img
                              src={value.image.preview || value.image.url}
                              alt={value.name}
                              className="w-8 h-8 object-cover mx-auto mb-0.5 rounded"
                            />
                          )}
                          <p className="font-medium text-xs text-black">
                            {value.name}
                          </p>
                          {value.priceModifier !== undefined && value.priceModifier > 0 && (
                            <p className="text-xs text-gray-600 mt-0.5">
                              +${value.priceModifier.toFixed(2)}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {option.type === "swatch" && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {option.values.map((value) => (
                        <button
                          key={value.id}
                          onClick={() => {
                            const newOptions = {
                              ...selectedOptions,
                              [option.id]: value.id,
                            };
                            setSelectedOptions(newOptions);
                          }}
                          className={`relative border-2 rounded overflow-hidden transition flex flex-col items-center justify-center p-1 ${
                            selectedOptions[option.id] === value.id
                              ? "border-purple-500"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {value.image ? (
                            <img
                              src={value.image.preview || value.image.url}
                              alt={value.name}
                              className="w-10 h-10 object-contain"
                            />
                          ) : (
                            <div className="w-full h-10 bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-600 text-xs text-center px-1 truncate">
                                {value.name}
                              </span>
                            </div>
                          )}
                          <span className="text-gray-700 text-xs mt-0.5 font-medium text-center truncate">
                            {value.name}
                          </span>
                          {(value.priceModifier ?? 0) > 0 && (
                            <span className="text-purple-600 text-xs font-bold mt-0.5">
                              +$
                              {value.priceModifier?.toFixed(2)}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {option.type === "text" && (
                    <Input
                      type="text"
                      value={selectedOptions[option.id] || ""}
                      onChange={(e) =>
                        setSelectedOptions((prev) => ({
                          ...prev,
                          [option.id]: e.target.value,
                        }))
                      }
                      placeholder={`Enter ${option.name}`}
                      className="bg-gray-50 border-gray-200 text-black placeholder-gray-500 text-xs"
                    />
                  )}
                </div>
              ))}

            {/* Manual Quantity Input */}
            <div className="backdrop-blur-xl bg-gray-50 border border-gray-200 rounded-lg p-3">
              <label className="text-xs font-bold block mb-2">
                {product.fixed_quantity ? (
                  <>
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-4 h-4 inline mr-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm6-10V7a3 3 0 00-3-3h0a3 3 0 00-3 3v2h6z"
                      />
                    </svg>
                    Fixed Quantity
                  </>
                ) : (
                  <>
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-4 h-4 inline mr-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                      />
                    </svg>
                    Quantity
                  </>
                )}
              </label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  if (!product.fixed_quantity) {
                    const value = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, value));
                  }
                }}
                disabled={!!product.fixed_quantity}
                readOnly={!!product.fixed_quantity}
                className={`text-sm ${
                  product.fixed_quantity
                    ? "bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed opacity-70"
                    : "bg-white border-gray-200 text-black placeholder-gray-500"
                }`}
              />
              <p className="text-gray-500 text-xs mt-1">
                {product.fixed_quantity
                  ? "✓ Fixed quantity - cannot be changed"
                  : "Enter desired quantity"}
              </p>
            </div>
          </div>

          {/* Price Summary Section */}
          <div className="backdrop-blur-xl bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg p-4 mb-4 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Selected Quantity */}
              <div className="bg-white rounded-lg p-3 text-center border border-purple-200">
                <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Selected Quantity</p>
                <p className="text-3xl font-bold text-purple-600">{quantity.toLocaleString()}</p>
                <p className="text-gray-500 text-xs mt-1">stickers</p>
              </div>

              {/* Price Per Unit */}
              <div className="bg-white rounded-lg p-3 text-center border border-blue-200">
                <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Price Per sticker</p>
                <p className="text-3xl font-bold text-blue-600">${parseFloat(calculatePrice()).toFixed(2)}</p>
                <p className="text-gray-500 text-xs mt-1">each</p>
              </div>

              {/* Total Price */}
              <div className="bg-white rounded-lg p-3 text-center border-2 border-green-400">
                <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Total Price</p>
                <p className="text-3xl font-bold text-green-600">${(parseFloat(calculatePrice()) * quantity).toFixed(2)}</p>
                <p className="text-gray-500 text-xs mt-1">for your order</p>
              </div>
            </div>
          </div>

          {/* Below Grid - Additional Fields and Upload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
            {/* Additional Fields */}
            {product.optional_fields && product.optional_fields.length > 0 && (
              <div className="backdrop-blur-xl bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h2 className="text-xs font-bold mb-1.5">
                  ✏️ Additional Instructions (optional)
                </h2>
                <div className="space-y-1.5">
                  {product.optional_fields.map((field) => (
                    <div key={field.name}>
                      <Label className="text-gray-700 text-xs mb-1 block">
                        {field.name}
                      </Label>
                      {field.type === "textarea" ? (
                        <Textarea
                          value={optionalFields[field.name] || ""}
                          onChange={(e) =>
                            setOptionalFields((prev) => ({
                              ...prev,
                              [field.name]: e.target.value,
                            }))
                          }
                          placeholder={`Enter any special requests or instructions here...`}
                          className="bg-gray-50 border-gray-200 text-black placeholder-gray-500 min-h-12 text-xs"
                        />
                      ) : field.type === "date" ? (
                        <Input
                          type="date"
                          value={optionalFields[field.name] || ""}
                          onChange={(e) =>
                            setOptionalFields((prev) => ({
                              ...prev,
                              [field.name]: e.target.value,
                            }))
                          }
                          className="bg-gray-50 border-gray-200 text-black placeholder-gray-500 text-xs"
                        />
                      ) : field.type === "number" ? (
                        <Input
                          type="number"
                          value={optionalFields[field.name] || ""}
                          onChange={(e) =>
                            setOptionalFields((prev) => ({
                              ...prev,
                              [field.name]: e.target.value,
                            }))
                          }
                          placeholder={`Enter ${field.name}`}
                          className="bg-gray-50 border-gray-200 text-black placeholder-gray-500 text-xs"
                        />
                      ) : (
                        <Input
                          type="text"
                          value={optionalFields[field.name] || ""}
                          onChange={(e) =>
                            setOptionalFields((prev) => ({
                              ...prev,
                              [field.name]: e.target.value,
                            }))
                          }
                          placeholder={`Enter ${field.name}`}
                          className="bg-gray-50 border-gray-200 text-black placeholder-gray-500 text-xs"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Design Upload */}
            {product.customer_upload_config?.enabled && (
              <div className="backdrop-blur-xl bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h2 className="text-xs font-bold mb-1">Upload your artwork</h2>
                <p className="text-gray-600 text-xs mb-1.5">
                  {product.customer_upload_config.description}
                </p>

                {designPreview ? (
                  <div className="space-y-1.5">
                    <div className="relative bg-gray-50 border border-gray-200 rounded overflow-hidden">
                      <img
                        src={designPreview}
                        alt="Design preview"
                        className="w-full h-20 object-contain p-1.5"
                      />
                      <button
                        onClick={removeDesign}
                        className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-700 text-white p-1 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-600 text-xs">
                      {designFile?.name} (
                      {((designFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-green-600 rounded p-2 cursor-pointer hover:border-green-700 transition bg-green-50">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2F1e00ee8c48924560b1c928d354e4521b%2Fcee606b598864f7a983db9ee1358acf5?format=webp&width=800"
                      alt="Upload"
                      className="w-8 h-8"
                    />
                    <div className="text-center">
                      <p className="text-black font-medium text-xs">
                        Drag or click to upload
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">
                        All formats supported. Max file size:{" "}
                        {product.customer_upload_config.maxFileSize}MB | 1 file
                        per order
                      </p>
                    </div>
                    <input
                      type="file"
                      accept={product.customer_upload_config.allowedFormats
                        .map((f) => `.${f}`)
                        .join(",")}
                      onChange={handleDesignUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            {/* Order Notes */}
            <div className="backdrop-blur-xl bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h2 className="text-xs font-bold mb-1.5">
                📝 Order Notes (optional)
              </h2>
              <Textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Add any special requests or notes..."
                className="bg-white border-gray-300 text-black placeholder-gray-500 min-h-10 text-xs"
              />
              <p className="text-gray-600 text-xs mt-1">
                Let us know about any special requirements or customizations
              </p>
            </div>
          </div>

          {/* Add to Cart Button - Full Width */}
          <div className="backdrop-blur-xl bg-gray-50 border border-gray-200 rounded-lg p-3">
            <Button
              onClick={handleAddToCart}
              disabled={
                isAddingToCart ||
                !product.availability ||
                (product.customer_upload_config?.enabled && !designFile)
              }
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-1.5 text-xs font-semibold gap-2 rounded"
            >
              <Upload className="w-3 h-3" />
              {isAddingToCart
                ? "Adding to Cart..."
                : product.customer_upload_config?.enabled && !designFile
                  ? "Upload Artwork"
                  : !product.availability
                    ? "Out of Stock"
                    : "Add to Cart"}
            </Button>

            <p className="text-center text-gray-600 text-xs mt-1.5">
              Items will be added to your cart
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 text-gray-600">
          <div
            className="mx-auto px-4 sm:px-6 lg:px-8 py-6"
            style={{ maxWidth: "1100px" }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-bold text-gray-900 mb-4">Shop</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Vinyl Stickers
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Holographic
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Chrome
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Glitter
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      About
                    </a>
                  </li>
                  <li>
                    <a
                      href="/blogs"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Blog
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Terms
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Shipping
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Returns
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-4">Follow</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      TikTok
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      YouTube
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-center pt-8 border-t border-gray-200">
              <p
                style={{
                  fontWeight: "400",
                  fontSize: "12px",
                  color: "rgba(0, 0, 0, 0.5)",
                }}
              >
                Built with ❤️ by © Sticky Slap LLC
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Post-Checkout Action Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl">
              Item Added to Cart!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your artwork has been successfully added. What would you like to do next?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-6">
            <Button
              onClick={() => {
                setShowCheckoutDialog(false);
                setDesignFile(null);
                setDesignPreview(null);
                setOrderNotes("");
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add to Cart & Keep Shopping
            </Button>
            <Button
              onClick={() => {
                setShowCheckoutDialog(false);
                navigate("/checkout-new");
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Go to Checkout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
