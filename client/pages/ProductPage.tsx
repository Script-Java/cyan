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
  const [activeQuantityOption, setActiveQuantityOption] = useState<number | null>(100);

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

    let totalModifier = 0;
    Object.entries(selectedOptions).forEach(([optionId, valueId]) => {
      const option = product.options.find((o) => o.id === optionId);
      if (option) {
        const value = option.values.find((v) => v.id === valueId);
        if (value) {
          totalModifier += value.priceModifier;
        }
      }
    });

    return (product.base_price + totalModifier).toFixed(2);
  };

  const calculateTotalPrice = () => {
    const pricePerUnit = parseFloat(calculatePrice());
    return (pricePerUnit * quantity).toFixed(2);
  };

  const calculatePricePerUnit = () => {
    const totalPrice = parseFloat(calculateTotalPrice());
    return (totalPrice / quantity).toFixed(2);
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
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/60">Loading product...</p>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/60">Product not found</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
          {/* Back Navigation */}
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 text-blue-300 hover:text-blue-400 transition mb-8"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Back to Sticker Types</span>
          </button>

          {/* Hero Section with Image and Description */}
          <div className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Product Image */}
              <div className="lg:col-span-2">
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl overflow-hidden aspect-square">
                  {product.images.length > 0 ? (
                    <>
                      <img
                        src={
                          product.images[currentImageIndex].preview ||
                          product.images[currentImageIndex].url
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.images.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setCurrentImageIndex(
                                (prev) =>
                                  (prev - 1 + product.images.length) %
                                  product.images.length,
                              )
                            }
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              setCurrentImageIndex(
                                (prev) => (prev + 1) % product.images.length,
                              )
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-white/40">No images available</p>
                    </div>
                  )}
                </div>

                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {product.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`border-2 rounded-lg overflow-hidden transition ${
                          currentImageIndex === index
                            ? "border-purple-500"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <img
                          src={image.preview || image.url}
                          alt={image.name}
                          className="w-full h-20 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col justify-center">
                <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                  {product.name}
                </h1>
                <p className="text-white/70 mb-6 leading-relaxed">
                  {product.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm">
                    💧 Waterproof
                  </span>
                  <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm">
                    ✨ Premium Quality
                  </span>
                  <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm">
                    🚀 Fast Shipping
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid - 4 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Product Options - Each in Own Column */}
            {product.options.map((option) => (
              <div
                key={option.id}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <h2 className="text-sm font-bold mb-4">
                  {option.name === "Shape" && "🎯"} Select a {option.name}
                </h2>

                {option.type === "dropdown" && (
                  <select
                    value={selectedOptions[option.id] || ""}
                    onChange={(e) =>
                      setSelectedOptions((prev) => ({
                        ...prev,
                        [option.id]: e.target.value,
                      }))
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/40 focus:border-purple-500 focus:outline-none transition"
                  >
                    <option value="">Select {option.name}</option>
                    {option.values.map((value) => (
                      <option key={value.id} value={value.id}>
                        {value.name}
                        {value.priceModifier !== 0 &&
                          ` (+$${value.priceModifier.toFixed(2)})`}
                      </option>
                    ))}
                  </select>
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
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-white/10 hover:border-white/20 bg-white/5"
                        }`}
                      >
                        {value.image && (
                          <img
                            src={value.image.preview || value.image.url}
                            alt={value.name}
                            className="w-10 h-10 object-cover mx-auto mb-1 rounded"
                          />
                        )}
                        <p className="font-medium text-xs">{value.name}</p>
                        {value.priceModifier !== 0 && (
                          <p className="text-xs text-white/60 mt-0.5">
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
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        {value.image ? (
                          <img
                            src={value.image.preview || value.image.url}
                            alt={value.name}
                            className="w-full h-14 object-cover"
                          />
                        ) : (
                          <div className="w-full h-14 bg-white/10 flex items-center justify-center">
                            <span className="text-white/40 text-xs text-center px-1">
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
                    className="bg-white/5 border-white/10 text-white placeholder-white/40 text-xs"
                  />
                )}
              </div>
            ))}

            {/* Quantity Selection Column */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-sm font-bold mb-3">📊 Select a quantity</h2>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {[
                  { qty: 50, price: 67.5, save: null },
                  { qty: 100, price: 87.75, save: 35 },
                  { qty: 200, price: 124.2, save: 54 },
                  { qty: 300, price: 157.95, save: 61 },
                  { qty: 500, price: 216, save: 68 },
                  { qty: 1000, price: 351, save: 74 },
                  { qty: 2500, price: 641.25, save: 81 },
                ].map((option) => (
                  <button
                    key={option.qty}
                    onClick={() => {
                      setQuantity(option.qty);
                      setActiveQuantityOption(option.qty);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg border-2 transition text-xs ${
                      activeQuantityOption === option.qty
                        ? "border-green-500 bg-green-500/10"
                        : "border-white/10 hover:border-white/20 bg-white/5"
                    }`}
                  >
                    <span className="font-semibold">{option.qty}</span>
                    <div className="text-right">
                      <p className="font-bold text-green-400">
                        ${option.price.toFixed(2)}
                      </p>
                      {option.save && (
                        <p className="text-xs text-green-300">
                          Save {option.save}%
                        </p>
                      )}
                    </div>
                  </button>
                ))}

                <button className="w-full flex items-center justify-between p-2 rounded-lg border-2 border-white/10 hover:border-white/20 bg-white/5 transition text-xs">
                  <span className="font-semibold">Custom</span>
                </button>
              </div>

              {/* Price Summary in Quantity Card */}
              <div className="mt-4 space-y-2 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-xs">Total:</span>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">
                      ${calculateTotalPrice()}
                    </p>
                    <p className="text-xs text-white/60">
                      ${calculatePricePerUnit()}/ea.
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-2 text-xs">
                  <span className="flex items-center gap-1 text-yellow-300">
                    <img
                      src="https://res.cloudinary.com/dxcnvqk6b/image/upload/v1753923671/StickerShuttle_CoinIcon_aperue.png"
                      alt="Credits"
                      className="w-4 h-4"
                    />
                    You'll earn ${(parseFloat(calculateTotalPrice()) * 0.02).toFixed(2)} in store credit!
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Below Grid - Additional Fields and Upload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Additional Fields */}
            {product.optional_fields.length > 0 && (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-sm font-bold mb-4">
                  ✏️ Additional Instructions (optional)
                </h2>
                <div className="space-y-4">
                  {product.optional_fields.map((field) => (
                    <div key={field.name}>
                      <Label className="text-white/80 text-xs mb-2 block">
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
                          className="bg-white/5 border-white/10 text-white placeholder-white/40 min-h-20 text-xs"
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
                          className="bg-white/5 border-white/10 text-white placeholder-white/40 text-xs"
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
                          className="bg-white/5 border-white/10 text-white placeholder-white/40 text-xs"
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
                          className="bg-white/5 border-white/10 text-white placeholder-white/40 text-xs"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Design Upload */}
            {product.customer_upload_config.enabled && (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-sm font-bold mb-2">
                  Upload your artwork
                </h2>
                <p className="text-white/60 text-xs mb-4">
                  {product.customer_upload_config.description}
                </p>

                {designPreview ? (
                  <div className="space-y-3">
                    <div className="relative bg-white/5 border border-white/10 rounded-lg overflow-hidden">
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
                    <p className="text-white/60 text-xs">
                      {designFile?.name} (
                      {((designFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/30 rounded-lg p-8 cursor-pointer hover:border-white/50 transition">
                    <img
                      src="https://res.cloudinary.com/dxcnvqk6b/image/upload/v1763150114/StickerShuttle_UploadIcon_m5qbvw.png"
                      alt="Upload"
                      className="w-16 h-16"
                    />
                    <div className="text-center">
                      <p className="text-white font-medium text-sm">
                        Drag or click to upload your file
                      </p>
                      <p className="text-white/60 text-xs mt-1">
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
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <Button
              onClick={handleAddToCart}
              disabled={
                isAddingToCart || !product.availability || !designFile
              }
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-4 text-lg font-semibold gap-2 rounded-xl"
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

            <p className="text-center text-white/60 text-xs mt-3">
              Items will be added to your cart for review before checkout
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
