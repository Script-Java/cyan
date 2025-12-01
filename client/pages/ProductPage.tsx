import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

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

    if (!product?.customer_upload_config.allowedFormats.includes(
      file.name.split(".").pop()?.toLowerCase() || "",
    )) {
      toast({
        title: "Invalid File Format",
        description: `Allowed formats: ${product?.customer_upload_config.allowedFormats.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    if (file.size > (product?.customer_upload_config.maxFileSize || 5) * 1024 * 1024) {
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

  const calculatePrice = () => {
    if (!product) return 0;

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
      <main className="min-h-screen bg-black text-white py-8">
        <div className="px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative bg-white/5 border border-white/10 rounded-lg overflow-hidden aspect-square">
                {product.images.length > 0 ? (
                  <>
                    <img
                      src={product.images[currentImageIndex].preview || product.images[currentImageIndex].url}
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
                              (prev) =>
                                (prev + 1) % product.images.length,
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
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`border-2 rounded-lg overflow-hidden transition ${
                        currentImageIndex === index
                          ? "border-green-500"
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

            {/* Product Details */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                <p className="text-white/60">{product.description}</p>
              </div>

              {/* Price */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <p className="text-white/60 text-sm mb-2">Price</p>
                <p className="text-4xl font-bold text-green-400">
                  ${calculatePrice()}
                </p>
              </div>

              {/* Product Options */}
              <div className="space-y-6">
                {product.options.map((option) => (
                  <div key={option.id}>
                    <Label className="text-white text-lg mb-4 block">
                      {option.name}
                      {option.required && <span className="text-red-400">*</span>}
                    </Label>

                    {option.type === "dropdown" && (
                      <select
                        value={selectedOptions[option.id] || ""}
                        onChange={(e) =>
                          setSelectedOptions((prev) => ({
                            ...prev,
                            [option.id]: e.target.value,
                          }))
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-green-500 focus:outline-none transition"
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
                      <div className="space-y-2">
                        {option.values.map((value) => (
                          <label
                            key={value.id}
                            className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-white/10 hover:border-white/20 transition"
                          >
                            <input
                              type="radio"
                              name={option.id}
                              value={value.id}
                              checked={selectedOptions[option.id] === value.id}
                              onChange={() =>
                                setSelectedOptions((prev) => ({
                                  ...prev,
                                  [option.id]: value.id,
                                }))
                              }
                              className="w-4 h-4"
                            />
                            <span className="text-white">
                              {value.name}
                              {value.priceModifier !== 0 &&
                                ` (+$${value.priceModifier.toFixed(2)})`}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {option.type === "swatch" && (
                      <div className="grid grid-cols-4 gap-3">
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
                                ? "border-green-500"
                                : "border-white/10 hover:border-white/20"
                            }`}
                          >
                            {value.image ? (
                              <img
                                src={value.image.preview || value.image.url}
                                alt={value.name}
                                className="w-full h-20 object-cover"
                              />
                            ) : (
                              <div className="w-full h-20 bg-white/10 flex items-center justify-center">
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
                        className="bg-white/5 border-white/10 text-white placeholder-white/40"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Customer Design Upload */}
              {product.customer_upload_config.enabled && (
                <div className="backdrop-blur-xl bg-blue-600/10 border border-blue-500/30 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-2 text-blue-400">
                    Custom Design Upload
                  </h3>
                  <p className="text-white/60 mb-4">
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
                      <p className="text-white/60 text-sm">
                        {designFile?.name} ({(designFile?.size || 0) / 1024 / 1024}.toFixed(2) MB)
                      </p>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-blue-500/50 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition">
                      <Upload className="w-5 h-5 text-blue-400" />
                      <div className="text-center">
                        <p className="text-white font-medium">Click to upload</p>
                        <p className="text-white/60 text-sm">
                          Max {product.customer_upload_config.maxFileSize}MB -{" "}
                          {product.customer_upload_config.allowedFormats.join(
                            ", ",
                          )}
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

              {/* Optional Fields */}
              {product.optional_fields.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Information</h3>
                  {product.optional_fields.map((field) => (
                    <div key={field.name}>
                      <Label className="text-white/80 mb-2 block">
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
                          placeholder={`Enter ${field.name}`}
                          className="bg-white/5 border-white/10 text-white placeholder-white/40 min-h-24"
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
                          className="bg-white/5 border-white/10 text-white placeholder-white/40"
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
                          className="bg-white/5 border-white/10 text-white placeholder-white/40"
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
                          className="bg-white/5 border-white/10 text-white placeholder-white/40"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div>
                  <Label className="text-white/80 mb-2 block">Quantity</Label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg transition"
                    >
                      -
                    </button>
                    <span className="text-white text-lg font-semibold w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !product.availability}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold gap-2"
                >
                  {isAddingToCart
                    ? "Adding to Cart..."
                    : !product.availability
                      ? "Out of Stock"
                      : "Add to Cart"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
