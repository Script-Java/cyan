import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, X, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ProductImage {
  id: string;
  url: string;
  name: string;
  preview?: string;
}

interface VariantValue {
  id: string;
  name: string;
  priceModifier: number;
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
  required: boolean;
  values: VariantValue[];
  defaultValueId?: string;
  displayOrder: number;
}

interface OptionSelection {
  optionId: string;
  optionName: string;
  selectedValueIds: string[];
}

interface SharedVariant {
  id: string;
  name: string;
  description: string;
  optionSelections: OptionSelection[];
  price: number;
}

interface CustomerUploadConfig {
  enabled: boolean;
  maxFileSize: number;
  allowedFormats: string[];
  description: string;
}

interface Product {
  id: string;
  name: string;
  base_price: number;
  description: string;
  images: ProductImage[];
  options: ProductOption[];
  shared_variants?: SharedVariant[];
  customer_upload_config: CustomerUploadConfig;
  optional_fields: { name: string; type: string }[];
  availability: boolean;
}

interface CartItem {
  productId: string;
  selectedOptions: { [optionId: string]: string };
  designFile?: File;
  optionalFields: { [fieldName: string]: string };
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<{
    [optionId: string]: string;
  }>({});
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designPreview, setDesignPreview] = useState<string | null>(null);
  const [optionalFields, setOptionalFields] = useState<{
    [fieldName: string]: string;
  }>({});
  const [quantity, setQuantity] = useState(100);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeQuantityOption, setActiveQuantityOption] = useState<
    number | null
  >(100);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!productId) return;

        const response = await fetch(`/api/public/products/${productId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }

        const data = await response.json();
        setProduct(data.product);

        const initialOptions: { [key: string]: string } = {};
        data.product.options.forEach((option: ProductOption) => {
          if (option.defaultValueId) {
            initialOptions[option.id] = option.defaultValueId;
          }
        });
        setSelectedOptions(initialOptions);

        const initialFields: { [key: string]: string } = {};
        data.product.optional_fields.forEach(
          (field: { name: string; type: string }) => {
            initialFields[field.name] = "";
          },
        );
        setOptionalFields(initialFields);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description: "Failed to load product",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, toast]);

  const handleDesignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !product?.customer_upload_config.allowedFormats.includes(
        file.name.split(".").pop()?.toLowerCase() || "",
      )
    ) {
      toast({
        title: "Invalid File Format",
        description: `Allowed formats: ${product?.customer_upload_config.allowedFormats.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    if (
      file.size >
      (product?.customer_upload_config.maxFileSize || 5) * 1024 * 1024
    ) {
      toast({
        title: "File Too Large",
        description: `Maximum file size: ${product?.customer_upload_config.maxFileSize}MB`,
        variant: "destructive",
      });
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

  const checkSharedVariantMatch = (): SharedVariant | null => {
    if (!product?.shared_variants) return null;

    for (const sharedVariant of product.shared_variants) {
      let isMatch = true;

      for (const selection of sharedVariant.optionSelections) {
        const selectedValueId = selectedOptions[selection.optionId];
        if (
          !selectedValueId ||
          !selection.selectedValueIds.includes(selectedValueId)
        ) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        return sharedVariant;
      }
    }

    return null;
  };

  const calculatePrice = () => {
    if (!product) return 0;

    const matchedSharedVariant = checkSharedVariantMatch();
    if (matchedSharedVariant) {
      return matchedSharedVariant.price.toFixed(2);
    }

    let totalPrice = 0;
    let hasOptionPrice = false;

    Object.entries(selectedOptions).forEach(([optionId, valueId]) => {
      const option = product.options.find((o) => o.id === optionId);
      if (option) {
        const value = option.values.find((v) => v.id === valueId);
        if (value && value.priceModifier !== 0) {
          hasOptionPrice = true;
          totalPrice += value.priceModifier;
        }
      }
    });

    if (hasOptionPrice) {
      return totalPrice.toFixed(2);
    }

    return product.base_price.toFixed(2);
  };

  const calculateTotalPrice = () => {
    const pricePerUnit = parseFloat(calculatePrice());
    return (pricePerUnit * quantity).toFixed(2);
  };

  const calculatePricePerUnit = () => {
    const totalPrice = parseFloat(calculateTotalPrice());
    return (totalPrice / quantity).toFixed(2);
  };

  const getQuantityTierPricing = () => {
    const basePricePerUnit = parseFloat(calculatePrice());
    const quantityTiers = [
      { qty: 50, discountPercent: 0 },
      { qty: 100, discountPercent: 35 },
      { qty: 200, discountPercent: 54 },
      { qty: 300, discountPercent: 61 },
      { qty: 500, discountPercent: 68 },
      { qty: 1000, discountPercent: 74 },
      { qty: 2500, discountPercent: 81 },
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
    const requiredOptions = product?.options.filter((o) => o.required) || [];
    const missingOptions = requiredOptions.filter(
      (o) => !selectedOptions[o.id],
    );

    if (missingOptions.length > 0) {
      toast({
        title: "Missing Required Options",
        description: `Please select: ${missingOptions.map((o) => o.name).join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    if (product?.customer_upload_config.enabled && !designFile) {
      toast({
        title: "Design Required",
        description: "Please upload your design to continue",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToCart(true);
    try {
      const cartItem: CartItem = {
        productId: productId!,
        selectedOptions,
        designFile,
        optionalFields,
        quantity,
      };

      const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
      existingCart.push(cartItem);
      localStorage.setItem("cart", JSON.stringify(existingCart));

      toast({
        title: "Success",
        description: "Product added to cart",
      });
      setTimeout(() => {
        navigate("/checkout-new");
      }, 500);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white text-black flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white text-black flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Product not found</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white text-black">
        <div
          style={{
            maxWidth: "1824px",
            margin: "0 auto 3px",
            padding: "32px 32px 200px",
          }}
          className="px-4 sm:px-6 lg:px-8"
        >
          {/* Back Navigation */}
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition mb-8"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Hero Section with Image and Description */}
          <div className="mb-12">
            <div style={{ display: "flex", gap: "20px", marginBottom: "32px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: "normal",
                  width: "50%",
                  marginLeft: "0px",
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: "normal",
                  width: "50%",
                  marginLeft: "20px",
                }}
              />
            </div>
          </div>

          {/* Main Content Grid - 4 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Product Options - Each in Own Column */}
            {product.options.map((option) => (
              <div
                key={option.id}
                className="backdrop-blur-xl bg-gray-50 border border-gray-200 rounded-2xl"
                style={{ marginRight: "15px", padding: "24px 20px 24px 18px" }}
              >
                <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                  {option.name === "Shape" && (
                    <img
                      src="https://res.cloudinary.com/dxcnvqk6b/image/upload/v1763135086/StickerShuttle_DieCutIcon_r0vire.png"
                      alt={option.name}
                      className="w-6 h-6"
                    />
                  )}
                  {option.name === "Material" && (
                    <img
                      src="https://res.cloudinary.com/dxcnvqk6b/image/upload/v1763228661/StickerShuttle_KissCutIcon_pynbqq.png"
                      alt={option.name}
                      className="w-6 h-6"
                    />
                  )}
                  {option.name === "Size" && (
                    <img
                      src="https://res.cloudinary.com/dxcnvqk6b/image/upload/v1763135086/StickerShuttle_CircleIcon_igib6i.png"
                      alt={option.name}
                      className="w-6 h-6"
                    />
                  )}
                  Select a {option.name}
                </h2>

                {option.type === "dropdown" && (
                  <div className="grid grid-cols-2 gap-3">
                    {option.values.map((value, index) => (
                      <button
                        key={value.id}
                        onClick={() =>
                          setSelectedOptions((prev) => ({
                            ...prev,
                            [option.id]: value.id,
                          }))
                        }
                        className={`relative flex flex-col items-center justify-center border-2 rounded-xl p-4 transition text-center ${
                          selectedOptions[option.id] === value.id
                            ? "border-purple-500 bg-purple-100 shadow-lg shadow-purple-200/50"
                            : "border-gray-200 hover:border-gray-300 bg-gray-50"
                        }`}
                      >
                        {option.name === "Material" &&
                        value.name?.toLowerCase() === "satin" ? (
                          <img
                            src="https://cdn.builder.io/api/v1/image/assets%2F1e00ee8c48924560b1c928d354e4521b%2F1b04ce3e2b7342ff891113ccedd6beda?format=webp&width=800"
                            alt="Satin"
                            className="w-16 h-16 object-contain mb-2"
                          />
                        ) : (
                          value.image && (
                            <img
                              src={value.image.preview || value.image.url}
                              alt={value.name}
                              className="w-16 h-16 object-contain mb-2"
                            />
                          )
                        )}
                        <p className="font-medium text-xs text-black">
                          {value.name}
                        </p>
                        {value.priceModifier !== 0 && (
                          <p className="text-xs text-gray-600 mt-1">
                            +${value.priceModifier.toFixed(2)}
                          </p>
                        )}
                        {index === 0 && (
                          <span className="absolute top-2 right-2 text-xs font-bold text-purple-600">
                            Popular
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {option.type === "radio" && (
                  <div className="grid grid-cols-2 gap-2">
                    {option.values.map((value) => (
                      <button
                        key={value.id}
                        onClick={() =>
                          setSelectedOptions((prev) => ({
                            ...prev,
                            [option.id]: value.id,
                          }))
                        }
                        className={`border-2 rounded-lg p-2 transition text-center text-xs ${
                          selectedOptions[option.id] === value.id
                            ? "border-purple-500 bg-purple-100"
                            : "border-gray-200 hover:border-gray-300 bg-gray-50"
                        }`}
                      >
                        {value.image && (
                          <img
                            src={value.image.preview || value.image.url}
                            alt={value.name}
                            className="w-10 h-10 object-cover mx-auto mb-1 rounded"
                          />
                        )}
                        <p className="font-medium text-xs text-black">
                          {value.name}
                        </p>
                        {value.priceModifier !== 0 && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            +${value.priceModifier.toFixed(2)}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {option.type === "swatch" && (
                  <div className="grid grid-cols-2 gap-2">
                    {option.values.map((value) => (
                      <button
                        key={value.id}
                        onClick={() =>
                          setSelectedOptions((prev) => ({
                            ...prev,
                            [option.id]: value.id,
                          }))
                        }
                        className={`relative border-2 rounded-lg overflow-hidden transition ${
                          selectedOptions[option.id] === value.id
                            ? "border-purple-500"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {value.image ? (
                          <img
                            src={value.image.preview || value.image.url}
                            alt={value.name}
                            className="w-full h-14 object-cover"
                          />
                        ) : (
                          <div className="w-full h-14 bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-600 text-xs text-center px-1">
                              {value.name}
                            </span>
                          </div>
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

            {/* Quantity Selection Column */}
            <div
              className="rounded-2xl border transition"
              style={{
                margin: "0 -5px 3px 0",
                padding: "24px",
                backdropFilter: "blur(12px)",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 255, 255, 0.1)",
                borderWidth: "1px",
                boxShadow:
                  "rgba(0, 0, 0, 0.3) 0px 8px 32px 0px, rgba(255, 255, 255, 0.1) 0px 1px 0px 0px inset",
              }}
            >
              <h2
                className="font-bold mb-4 flex items-center gap-2"
                style={{
                  fontFamily: "Rubik, sans-serif",
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "rgb(0, 0, 0)",
                  lineHeight: "28px",
                }}
              >
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{
                    width: "20px",
                    height: "20px",
                    stroke: "rgb(0, 0, 0)",
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
                Select a quantity
              </h2>

              <div style={{ position: "relative" }}>
                {getQuantityTierPricing().map((option, index) => (
                  <button
                    key={option.qty}
                    onClick={() => {
                      setQuantity(option.qty);
                      setActiveQuantityOption(option.qty);
                    }}
                    style={{
                      marginBottom: "8px",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border:
                        activeQuantityOption === option.qty
                          ? "2px solid rgb(253, 224, 71)"
                          : "1px solid oklab(0.714 0.117894 -0.165257 / 0.2)",
                      backdropFilter: "blur(12px)",
                      backgroundColor:
                        activeQuantityOption === option.qty
                          ? "rgba(253, 224, 71, 0.15)"
                          : "rgba(255, 255, 255, 0.1)",
                      color: "rgb(0, 0, 0)",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Rubik, sans-serif",
                        fontSize: "18px",
                        fontWeight: "500",
                        color: "rgb(0, 0, 0)",
                        lineHeight: "28px",
                      }}
                    >
                      {option.qty.toLocaleString()}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Rubik, sans-serif",
                          fontWeight: "600",
                          color: "rgb(0, 0, 0)",
                        }}
                      >
                        ${option.price.toFixed(2)}
                      </span>
                      {option.save && (
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "rgb(34, 197, 94)",
                          }}
                        >
                          Save {option.save}%
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Below Grid - Additional Fields and Upload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Additional Fields */}
            {product.optional_fields.length > 0 && (
              <div className="backdrop-blur-xl bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <h2 className="text-sm font-bold mb-4">
                  ✏️ Additional Instructions (optional)
                </h2>
                <div className="space-y-4">
                  {product.optional_fields.map((field) => (
                    <div key={field.name}>
                      <Label className="text-gray-700 text-xs mb-2 block">
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
                          className="bg-gray-50 border-gray-200 text-black placeholder-gray-500 min-h-20 text-xs"
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
            {product.customer_upload_config.enabled && (
              <div className="backdrop-blur-xl bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <h2 className="text-sm font-bold mb-2">Upload your artwork</h2>
                <p className="text-gray-600 text-xs mb-4">
                  {product.customer_upload_config.description}
                </p>

                {designPreview ? (
                  <div className="space-y-3">
                    <div className="relative bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={designPreview}
                        alt="Design preview"
                        className="w-full h-40 object-contain p-4"
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
                  <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-green-600 rounded-lg p-8 cursor-pointer hover:border-green-700 transition bg-green-50">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2F1e00ee8c48924560b1c928d354e4521b%2Fcee606b598864f7a983db9ee1358acf5?format=webp&width=800"
                      alt="Upload"
                      className="w-16 h-16"
                    />
                    <div className="text-center">
                      <p className="text-black font-medium text-sm">
                        Drag or click to upload your file
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
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
          </div>

          {/* Add to Cart Button - Full Width */}
          <div className="backdrop-blur-xl bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <Button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !product.availability || !designFile}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 text-lg font-semibold gap-2 rounded-xl"
            >
              <Upload className="w-5 h-5" />
              {isAddingToCart
                ? "Adding to Cart..."
                : !designFile
                  ? "Upload Artwork to Continue"
                  : !product.availability
                    ? "Out of Stock"
                    : "Add to Cart"}
            </Button>

            <p className="text-center text-gray-600 text-xs mt-3">
              Items will be added to your cart for review before checkout
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 text-gray-600">
          <div
            className="mx-auto px-4 sm:px-6 lg:px-8 py-16"
            style={{ maxWidth: "1824px" }}
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
    </>
  );
}
