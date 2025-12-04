import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Upload,
  X,
  Image as ImageIcon,
  GripVertical,
} from "lucide-react";
import Header from "@/components/Header";
import AdminNavigationGrid from "@/components/AdminNavigationGrid";
import MobileAdminPanel from "@/components/MobileAdminPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface PricingRule {
  id: string;
  conditions: { optionId: string; valueId: string }[];
  price: number;
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

interface SharedVariant {
  id: string;
  name: string;
  description: string;
  optionIds: string[];
}

interface CustomerUploadConfig {
  enabled: boolean;
  maxFileSize: number;
  allowedFormats: string[];
  description: string;
}

interface TaxConfig {
  id: string;
  name: string;
  rate: number;
  enabled: boolean;
}

interface ProductFormData {
  name: string;
  basePrice: number;
  description: string;
  sku: string;
  weight: number;
  images: ProductImage[];
  options: ProductOption[];
  pricingRules: PricingRule[];
  sharedVariants: SharedVariant[];
  customerUploadConfig: CustomerUploadConfig;
  optionalFields: { name: string; type: string }[];
  textArea: string;
  uploadedFiles: { name: string; file: File }[];
  conditionLogic: string;
  taxes: TaxConfig[];
  seo: {
    productUrl: string;
    pageTitle: string;
    metaDescription: string;
  };
  categories: string[];
  availability: boolean;
}

export default function ProductForm() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedOption, setDraggedOption] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    basePrice: 0,
    description: "",
    sku: "",
    weight: 0,
    images: [],
    options: [],
    pricingRules: [],
    sharedVariants: [],
    customerUploadConfig: {
      enabled: true,
      maxFileSize: 5,
      allowedFormats: ["png", "jpg", "jpeg", "gif"],
      description: "Upload your custom sticker design",
    },
    optionalFields: [],
    textArea: "",
    uploadedFiles: [],
    conditionLogic: "all",
    taxes: [],
    seo: {
      productUrl: "",
      pageTitle: "",
      metaDescription: "",
    },
    categories: [],
    availability: true,
  });

  const [allCategories] = useState([
    "Electronics",
    "Clothing",
    "Home & Garden",
    "Sports",
    "Books",
    "Toys",
    "Food",
    "Health & Beauty",
  ]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }

    setIsAuthenticated(true);

    if (productId) {
      fetchProduct(token, productId);
    } else {
      setIsLoading(false);
    }
  }, [navigate, productId]);

  const fetchProduct = async (token: string, id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }

      const data = await response.json();
      const product = data.product;

      setFormData({
        name: product.name || "",
        basePrice: product.base_price || 0,
        description: product.description || "",
        sku: product.sku || "",
        weight: product.weight || 0,
        images: product.images || [],
        options: product.options || [],
        pricingRules: product.pricing_rules || [],
        sharedVariants: product.shared_variants || [],
        customerUploadConfig: product.customer_upload_config || {
          enabled: false,
          maxFileSize: 5,
          allowedFormats: ["png", "jpg", "jpeg", "gif"],
          description: "",
        },
        optionalFields: product.optional_fields || [],
        textArea: product.text_area || "",
        uploadedFiles: [],
        conditionLogic: product.condition_logic || "all",
        taxes: product.taxes || [],
        seo: product.seo || {
          productUrl: "",
          pageTitle: "",
          metaDescription: "",
        },
        categories: product.categories || [],
        availability: product.availability !== false,
      });
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

  if (!isAuthenticated || isLoading) {
    return null;
  }

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSEOChange = (
    field: keyof ProductFormData["seo"],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      seo: { ...prev.seo, [field]: value },
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newImage: ProductImage = {
            id: Math.random().toString(36),
            url: (event.target?.result as string) || "",
            name: file.name,
            preview: (event.target?.result as string) || "",
          };
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, newImage],
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }));
  };

  const addOption = () => {
    const newOption: ProductOption = {
      id: Math.random().toString(36),
      name: "",
      type: "dropdown",
      required: false,
      values: [],
      displayOrder: formData.options.length,
    };
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, newOption],
    }));
  };

  const updateOption = (id: string, field: keyof ProductOption, value: any) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt) =>
        opt.id === id ? { ...opt, [field]: value } : opt,
      ),
    }));
  };

  const removeOption = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((opt) => opt.id !== id),
      pricingRules: prev.pricingRules.filter(
        (rule) => !rule.conditions.some((cond) => cond.optionId === id),
      ),
    }));
  };

  const addVariantValue = (optionId: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt) =>
        opt.id === optionId
          ? {
              ...opt,
              values: [
                ...opt.values,
                {
                  id: Math.random().toString(36),
                  name: "",
                  priceModifier: 0,
                },
              ],
            }
          : opt,
      ),
    }));
  };

  const updateVariantValue = (
    optionId: string,
    valueId: string,
    field: keyof VariantValue,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt) =>
        opt.id === optionId
          ? {
              ...opt,
              values: opt.values.map((val) =>
                val.id === valueId ? { ...val, [field]: value } : val,
              ),
            }
          : opt,
      ),
    }));
  };

  const removeVariantValue = (optionId: string, valueId: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt) =>
        opt.id === optionId
          ? {
              ...opt,
              values: opt.values.filter((val) => val.id !== valueId),
              defaultValueId:
                opt.defaultValueId === valueId ? undefined : opt.defaultValueId,
            }
          : opt,
      ),
      pricingRules: prev.pricingRules.filter(
        (rule) =>
          !rule.conditions.some(
            (cond) => cond.optionId === optionId && cond.valueId === valueId,
          ),
      ),
    }));
  };

  const uploadVariantImage = (
    optionId: string,
    valueId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = {
          id: Math.random().toString(36),
          url: (event.target?.result as string) || "",
          name: file.name,
          preview: (event.target?.result as string) || "",
        };
        updateVariantValue(optionId, valueId, "image", imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeVariantImage = (optionId: string, valueId: string) => {
    updateVariantValue(optionId, valueId, "image", undefined);
  };

  const addSharedVariant = () => {
    const newSharedVariant: SharedVariant = {
      id: Math.random().toString(36),
      name: "",
      description: "",
      optionIds: [],
    };
    setFormData((prev) => ({
      ...prev,
      sharedVariants: [...prev.sharedVariants, newSharedVariant],
    }));
  };

  const updateSharedVariant = (
    id: string,
    field: keyof SharedVariant,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      sharedVariants: prev.sharedVariants.map((sv) =>
        sv.id === id ? { ...sv, [field]: value } : sv,
      ),
    }));
  };

  const removeSharedVariant = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      sharedVariants: prev.sharedVariants.filter((sv) => sv.id !== id),
    }));
  };

  const toggleSharedVariantOption = (
    sharedVariantId: string,
    optionId: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      sharedVariants: prev.sharedVariants.map((sv) =>
        sv.id === sharedVariantId
          ? {
              ...sv,
              optionIds: sv.optionIds.includes(optionId)
                ? sv.optionIds.filter((id) => id !== optionId)
                : [...sv.optionIds, optionId],
            }
          : sv,
      ),
    }));
  };

  const moveOption = (fromIndex: number, toIndex: number) => {
    const newOptions = [...formData.options];
    [newOptions[fromIndex], newOptions[toIndex]] = [
      newOptions[toIndex],
      newOptions[fromIndex],
    ];
    newOptions.forEach((opt, idx) => (opt.displayOrder = idx));
    setFormData((prev) => ({ ...prev, options: newOptions }));
    setDraggedOption(null);
  };

  const updateCustomerUploadConfig = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      customerUploadConfig: {
        ...prev.customerUploadConfig,
        [field]: value,
      },
    }));
  };

  const addOptionalField = () => {
    setFormData((prev) => ({
      ...prev,
      optionalFields: [...prev.optionalFields, { name: "", type: "text" }],
    }));
  };

  const updateOptionalField = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      optionalFields: prev.optionalFields.map((f, i) =>
        i === index ? { ...f, [field]: value } : f,
      ),
    }));
  };

  const removeOptionalField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      optionalFields: prev.optionalFields.filter((_, i) => i !== index),
    }));
  };

  const addTaxConfig = () => {
    const newTax: TaxConfig = {
      id: Math.random().toString(36),
      name: "",
      rate: 0,
      enabled: true,
    };
    setFormData((prev) => ({
      ...prev,
      taxes: [...prev.taxes, newTax],
    }));
  };

  const updateTaxConfig = (id: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      taxes: prev.taxes.map((tax) =>
        tax.id === id ? { ...tax, [field]: value } : tax,
      ),
    }));
  };

  const removeTaxConfig = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      taxes: prev.taxes.filter((tax) => tax.id !== id),
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        setFormData((prev) => ({
          ...prev,
          uploadedFiles: [
            ...prev.uploadedFiles,
            { name: file.name, file: file },
          ],
        }));
      });
    }
  };

  const removeFile = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((f) => f.name !== name),
    }));
  };

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.basePrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Base price must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const endpoint = productId
        ? `/api/products/${productId}`
        : "/api/products";
      const method = productId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to save product (${response.status})`,
        );
      }

      toast({
        title: "Success",
        description: `Product ${productId ? "updated" : "created"} successfully`,
      });
      navigate("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
      const message =
        error instanceof Error ? error.message : "Failed to save product";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black text-white pb-20 md:pb-0">
        <div className="border-b border-white/10">
          <div className="px-6 lg:px-8 py-6">
            <button
              onClick={() => navigate("/admin/products")}
              className="flex items-center gap-2 text-white/60 hover:text-white transition mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Products
            </button>
            <h1 className="text-4xl font-bold text-white">
              {productId ? "Edit Product" : "Create New Product"}
            </h1>
          </div>
        </div>

        {/* Navigation Grid - Desktop/Tablet Only */}
        <div className="hidden md:block border-b border-white/10 bg-black/50 backdrop-blur-sm">
          <div className="px-6 lg:px-8 py-6">
            <h2 className="text-sm font-semibold text-white/80 mb-4">Quick Navigation</h2>
            <AdminNavigationGrid />
          </div>
        </div>

        <div className="px-6 lg:px-8 py-8">
          <div className="max-w-4xl">
            {/* Basic Information Section */}
            <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="p-2 bg-green-600/20 border border-green-500/30 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-green-400" />
                </div>
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-white/80 mb-2 block">
                    Product Name *
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                    className="bg-white/5 border-white/10 text-white placeholder-white/40"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/80 mb-2 block">
                      Base Price (USD) *
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.basePrice}
                      onChange={(e) =>
                        handleInputChange(
                          "basePrice",
                          parseFloat(e.target.value),
                        )
                      }
                      placeholder="0.00"
                      className="bg-white/5 border-white/10 text-white placeholder-white/40"
                    />
                    <p className="text-white/40 text-sm mt-1">
                      Variant prices adjust from this base price
                    </p>
                  </div>
                  <div>
                    <Label className="text-white/80 mb-2 block">SKU</Label>
                    <Input
                      value={formData.sku}
                      onChange={(e) => handleInputChange("sku", e.target.value)}
                      placeholder="e.g., SKU-001"
                      className="bg-white/5 border-white/10 text-white placeholder-white/40"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white/80 mb-2 block">
                    Weight (lb)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.weight}
                    onChange={(e) =>
                      handleInputChange("weight", parseFloat(e.target.value))
                    }
                    placeholder="0.00"
                    className="bg-white/5 border-white/10 text-white placeholder-white/40"
                  />
                </div>

                <div>
                  <Label className="text-white/80 mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Enter product description"
                    className="bg-white/5 border-white/10 text-white placeholder-white/40 min-h-32"
                  />
                </div>
              </div>
            </section>

            {/* Product Gallery Section */}
            <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="p-2 bg-green-600/20 border border-green-500/30 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-green-400" />
                </div>
                Product Gallery
              </h2>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-green-500/50 transition">
                  <label className="cursor-pointer">
                    <Upload className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-white/80 font-medium">
                      Click to upload images or drag and drop
                    </p>
                    <p className="text-white/40 text-sm mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image) => (
                      <div
                        key={image.id}
                        className="relative group bg-white/5 border border-white/10 rounded-lg overflow-hidden"
                      >
                        <img
                          src={image.preview}
                          alt={image.name}
                          className="w-full h-32 object-cover"
                        />
                        <button
                          onClick={() => removeImage(image.id)}
                          className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-700 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Product Options Section */}
            <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <div className="p-2 bg-green-600/20 border border-green-500/30 rounded-lg">
                    <Plus className="w-5 h-5 text-green-400" />
                  </div>
                  Product Options & Variants
                </h2>
                <Button
                  onClick={addOption}
                  className="bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </Button>
              </div>

              <div className="space-y-6">
                {formData.options.length === 0 ? (
                  <p className="text-white/60 text-center py-8">
                    No options added yet. Click "Add Option" to get started with
                    variants.
                  </p>
                ) : (
                  formData.options.map((option, index) => (
                    <div
                      key={option.id}
                      draggable
                      onDragStart={() => setDraggedOption(option.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedOption && draggedOption !== option.id) {
                          const draggedIndex = formData.options.findIndex(
                            (o) => o.id === draggedOption,
                          );
                          moveOption(draggedIndex, index);
                        }
                      }}
                      className={`bg-white/5 border border-white/10 rounded-lg p-4 space-y-4 transition ${
                        draggedOption === option.id ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <GripVertical className="w-5 h-5 text-white/40 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <Label className="text-white/80 mb-2 block">
                                Option Name
                              </Label>
                              <Input
                                value={option.name}
                                onChange={(e) =>
                                  updateOption(
                                    option.id,
                                    "name",
                                    e.target.value,
                                  )
                                }
                                placeholder="e.g., Finish, Size, Color"
                                className="bg-white/10 border-white/10 text-white placeholder-white/40"
                              />
                            </div>
                            <div>
                              <Label className="text-white/80 mb-2 block">
                                Type
                              </Label>
                              <Select
                                value={option.type}
                                onValueChange={(value) =>
                                  updateOption(
                                    option.id,
                                    "type",
                                    value as ProductOption["type"],
                                  )
                                }
                              >
                                <SelectTrigger className="bg-white/10 border-white/10 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-white/10">
                                  <SelectItem value="dropdown">
                                    Dropdown
                                  </SelectItem>
                                  <SelectItem value="radio">Radio</SelectItem>
                                  <SelectItem value="swatch">Swatch</SelectItem>
                                  <SelectItem value="text">
                                    Text Input
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-white/80 mb-2 block">
                                Default Value
                              </Label>
                              <Select
                                value={option.defaultValueId || ""}
                                onValueChange={(value) =>
                                  updateOption(
                                    option.id,
                                    "defaultValueId",
                                    value || undefined,
                                  )
                                }
                              >
                                <SelectTrigger className="bg-white/10 border-white/10 text-white">
                                  <SelectValue placeholder="Select default" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-white/10">
                                  {option.values.map((val) => (
                                    <SelectItem key={val.id} value={val.id}>
                                      {val.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={option.required}
                                onCheckedChange={(checked) =>
                                  updateOption(option.id, "required", checked)
                                }
                              />
                              <Label className="text-white/80 font-normal cursor-pointer">
                                Required
                              </Label>
                            </div>
                            <button
                              onClick={() => removeOption(option.id)}
                              className="ml-auto text-red-400 hover:text-red-300 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Variant Values */}
                          <div className="bg-white/10 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-white font-semibold">
                                Option Values
                              </h4>
                              <Button
                                onClick={() => addVariantValue(option.id)}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Add Value
                              </Button>
                            </div>

                            {option.values.length === 0 ? (
                              <p className="text-white/40 text-sm">
                                Add values for this option
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {option.values.map((value) => (
                                  <div
                                    key={value.id}
                                    className="bg-black/40 rounded-lg p-3 space-y-3"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div>
                                        <Label className="text-white/70 text-sm mb-1 block">
                                          Value Name
                                        </Label>
                                        <Input
                                          value={value.name}
                                          onChange={(e) =>
                                            updateVariantValue(
                                              option.id,
                                              value.id,
                                              "name",
                                              e.target.value,
                                            )
                                          }
                                          placeholder="e.g., Satin, 5 inches"
                                          className="bg-white/5 border-white/10 text-white placeholder-white/40 text-sm"
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-white/70 text-sm mb-1 block">
                                          Price Modifier ($)
                                        </Label>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          value={value.priceModifier}
                                          onChange={(e) =>
                                            updateVariantValue(
                                              option.id,
                                              value.id,
                                              "priceModifier",
                                              parseFloat(e.target.value),
                                            )
                                          }
                                          placeholder="0.00"
                                          className="bg-white/5 border-white/10 text-white placeholder-white/40 text-sm"
                                        />
                                        <p className="text-white/40 text-xs mt-1">
                                          Add to base price
                                        </p>
                                      </div>
                                    </div>

                                    {(option.type === "swatch" ||
                                      option.type === "radio") && (
                                      <div className="space-y-2">
                                        <Label className="text-white/70 text-sm block">
                                          Swatch Image (Optional)
                                        </Label>
                                        {value.image ? (
                                          <div className="flex items-center gap-2">
                                            <img
                                              src={value.image.preview}
                                              alt={value.image.name}
                                              className="w-12 h-12 rounded object-cover"
                                            />
                                            <button
                                              onClick={() =>
                                                removeVariantImage(
                                                  option.id,
                                                  value.id,
                                                )
                                              }
                                              className="text-red-400 hover:text-red-300 text-sm"
                                            >
                                              Remove
                                            </button>
                                          </div>
                                        ) : (
                                          <label className="flex items-center justify-center gap-2 border border-dashed border-white/20 rounded p-2 cursor-pointer hover:border-white/40 transition">
                                            <Upload className="w-4 h-4 text-white/60" />
                                            <span className="text-white/60 text-sm">
                                              Upload swatch
                                            </span>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={(e) =>
                                                uploadVariantImage(
                                                  option.id,
                                                  value.id,
                                                  e,
                                                )
                                              }
                                              className="hidden"
                                            />
                                          </label>
                                        )}
                                      </div>
                                    )}

                                    <div className="flex justify-end">
                                      <button
                                        onClick={() =>
                                          removeVariantValue(
                                            option.id,
                                            value.id,
                                          )
                                        }
                                        className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                                      >
                                        <X className="w-3 h-3" />
                                        Remove Value
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Shared Variants Section */}
            <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <div className="p-2 bg-purple-600/20 border border-purple-500/30 rounded-lg">
                    <Plus className="w-5 h-5 text-purple-400" />
                  </div>
                  Shared Variants
                </h2>
                <Button
                  onClick={addSharedVariant}
                  className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Shared Variant
                </Button>
              </div>

              <p className="text-white/60 text-sm mb-6">
                Create shared variant groups that apply the same set of options
                across multiple products.
              </p>

              <div className="space-y-6">
                {formData.sharedVariants.length === 0 ? (
                  <p className="text-white/60 text-center py-8">
                    No shared variants added yet. Click "Add Shared Variant" to
                    create a reusable variant group.
                  </p>
                ) : (
                  formData.sharedVariants.map((sharedVariant) => (
                    <div
                      key={sharedVariant.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-4 w-full">
                          <div>
                            <Label className="text-white/80 mb-2 block">
                              Shared Variant Name
                            </Label>
                            <Input
                              value={sharedVariant.name}
                              onChange={(e) =>
                                updateSharedVariant(
                                  sharedVariant.id,
                                  "name",
                                  e.target.value,
                                )
                              }
                              placeholder="e.g., Size & Color Combo"
                              className="bg-white/10 border-white/10 text-white placeholder-white/40"
                            />
                          </div>

                          <div>
                            <Label className="text-white/80 mb-2 block">
                              Description
                            </Label>
                            <Textarea
                              value={sharedVariant.description}
                              onChange={(e) =>
                                updateSharedVariant(
                                  sharedVariant.id,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Describe this shared variant group..."
                              className="bg-white/10 border-white/10 text-white placeholder-white/40 min-h-24"
                            />
                          </div>

                          {/* Option Selection */}
                          {formData.options.length > 0 ? (
                            <div>
                              <Label className="text-white/80 mb-3 block">
                                Select Options to Include
                              </Label>
                              <div className="bg-white/10 rounded-lg p-4 space-y-2">
                                {formData.options.map((option) => (
                                  <label
                                    key={option.id}
                                    className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded transition"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={sharedVariant.optionIds.includes(
                                        option.id,
                                      )}
                                      onChange={() =>
                                        toggleSharedVariantOption(
                                          sharedVariant.id,
                                          option.id,
                                        )
                                      }
                                      className="w-4 h-4 cursor-pointer"
                                    />
                                    <div className="flex-1">
                                      <span className="text-white">
                                        {option.name || "Unnamed Option"}
                                      </span>
                                      <p className="text-white/40 text-sm">
                                        Type: {option.type} • Values:{" "}
                                        {option.values.length}
                                      </p>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-white/40 text-sm">
                              Add options above to include them in this shared
                              variant group.
                            </p>
                          )}

                          <div className="flex justify-end">
                            <button
                              onClick={() =>
                                removeSharedVariant(sharedVariant.id)
                              }
                              className="text-red-400 hover:text-red-300 transition flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Customer Design Upload Configuration */}
            <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                  <Upload className="w-5 h-5 text-blue-400" />
                </div>
                Customer Design Upload
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={formData.customerUploadConfig.enabled}
                    onCheckedChange={(checked) =>
                      updateCustomerUploadConfig("enabled", checked)
                    }
                  />
                  <Label className="text-white/80 font-normal cursor-pointer">
                    Enable customer design uploads
                  </Label>
                </div>

                {formData.customerUploadConfig.enabled && (
                  <>
                    <div>
                      <Label className="text-white/80 mb-2 block">
                        Upload Description
                      </Label>
                      <Input
                        value={formData.customerUploadConfig.description}
                        onChange={(e) =>
                          updateCustomerUploadConfig(
                            "description",
                            e.target.value,
                          )
                        }
                        placeholder="e.g., Upload your custom sticker design"
                        className="bg-white/5 border-white/10 text-white placeholder-white/40"
                      />
                      <p className="text-white/40 text-sm mt-1">
                        This text will appear on the product page
                      </p>
                    </div>

                    <div>
                      <Label className="text-white/80 mb-2 block">
                        Max File Size (MB)
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.customerUploadConfig.maxFileSize}
                        onChange={(e) =>
                          updateCustomerUploadConfig(
                            "maxFileSize",
                            parseInt(e.target.value),
                          )
                        }
                        className="bg-white/5 border-white/10 text-white placeholder-white/40"
                      />
                    </div>

                    <div>
                      <Label className="text-white/80 mb-2 block">
                        Allowed File Formats
                      </Label>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="space-y-2">
                          {["png", "jpg", "jpeg", "gif", "svg"].map(
                            (format) => (
                              <label
                                key={format}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.customerUploadConfig.allowedFormats.includes(
                                    format,
                                  )}
                                  onChange={(e) => {
                                    const formats =
                                      formData.customerUploadConfig
                                        .allowedFormats;
                                    if (e.target.checked) {
                                      updateCustomerUploadConfig(
                                        "allowedFormats",
                                        [...formats, format],
                                      );
                                    } else {
                                      updateCustomerUploadConfig(
                                        "allowedFormats",
                                        formats.filter((f) => f !== format),
                                      );
                                    }
                                  }}
                                  className="w-4 h-4 rounded bg-white/5 border-white/10 cursor-pointer"
                                />
                                <span className="text-white/80 uppercase text-sm">
                                  {format}
                                </span>
                              </label>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Optional Fields Section */}
            <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <div className="p-2 bg-green-600/20 border border-green-500/30 rounded-lg">
                    <Plus className="w-5 h-5 text-green-400" />
                  </div>
                  Optional Input Fields
                </h2>
                <Button
                  onClick={addOptionalField}
                  className="bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Field
                </Button>
              </div>

              <div className="space-y-4">
                {formData.optionalFields.map((field, index) => (
                  <div
                    key={index}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 flex gap-4 items-end"
                  >
                    <div className="flex-1">
                      <Label className="text-white/80 mb-2 block">
                        Field Name
                      </Label>
                      <Input
                        value={field.name}
                        onChange={(e) =>
                          updateOptionalField(index, "name", e.target.value)
                        }
                        placeholder="e.g., Gift Message"
                        className="bg-white/10 border-white/10 text-white placeholder-white/40"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-white/80 mb-2 block">Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value) =>
                          updateOptionalField(index, "type", value)
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/10">
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="textarea">Textarea</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <button
                      onClick={() => removeOptionalField(index)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Additional Information Section */}
            <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="p-2 bg-green-600/20 border border-green-500/30 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-green-400" />
                </div>
                Additional Information
              </h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-white/80 mb-2 block">
                    Additional Details
                  </Label>
                  <Textarea
                    value={formData.textArea}
                    onChange={(e) =>
                      handleInputChange("textArea", e.target.value)
                    }
                    placeholder="Enter any additional product information"
                    className="bg-white/5 border-white/10 text-white placeholder-white/40 min-h-32"
                  />
                </div>
              </div>
            </section>

            {/* File Upload Section */}
            <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="p-2 bg-green-600/20 border border-green-500/30 rounded-lg">
                  <Upload className="w-5 h-5 text-green-400" />
                </div>
                Upload Additional Files
              </h2>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-green-500/50 transition">
                  <label className="cursor-pointer">
                    <Upload className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-white/80 font-medium">
                      Click to upload files or drag and drop
                    </p>
                    <p className="text-white/40 text-sm mt-1">
                      Any file type up to 50MB
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {formData.uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {formData.uploadedFiles.map((file) => (
                      <div
                        key={file.name}
                        className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3"
                      >
                        <span className="text-white/80">{file.name}</span>
                        <button
                          onClick={() => removeFile(file.name)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Condition Logic Section */}
            <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="p-2 bg-green-600/20 border border-green-500/30 rounded-lg">
                  <Plus className="w-5 h-5 text-green-400" />
                </div>
                Condition Logic
              </h2>

              <div>
                <Label className="text-white/80 mb-2 block">Logic Type</Label>
                <Select
                  value={formData.conditionLogic}
                  onValueChange={(value) =>
                    handleInputChange("conditionLogic", value)
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    <SelectItem value="all">
                      All conditions must be met
                    </SelectItem>
                    <SelectItem value="any">
                      Any condition must be met
                    </SelectItem>
                    <SelectItem value="none">No conditions</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-white/60 text-sm mt-2">
                  Define how conditions interact with this product's options
                </p>
              </div>
            </section>

            {/* Tax Configuration Section */}
            <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <div className="p-2 bg-green-600/20 border border-green-500/30 rounded-lg">
                    <Plus className="w-5 h-5 text-green-400" />
                  </div>
                  Tax Configuration
                </h2>
                <Button
                  onClick={addTaxConfig}
                  className="bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Tax
                </Button>
              </div>

              <div className="space-y-4">
                {formData.taxes.map((tax) => (
                  <div
                    key={tax.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/80 mb-2 block">
                          Tax Name
                        </Label>
                        <Input
                          value={tax.name}
                          onChange={(e) =>
                            updateTaxConfig(tax.id, "name", e.target.value)
                          }
                          placeholder="e.g., Sales Tax, VAT"
                          className="bg-white/10 border-white/10 text-white placeholder-white/40"
                        />
                      </div>
                      <div>
                        <Label className="text-white/80 mb-2 block">
                          Rate (%)
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={tax.rate}
                          onChange={(e) =>
                            updateTaxConfig(
                              tax.id,
                              "rate",
                              parseFloat(e.target.value),
                            )
                          }
                          placeholder="0.00"
                          className="bg-white/10 border-white/10 text-white placeholder-white/40"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={tax.enabled}
                          onCheckedChange={(checked) =>
                            updateTaxConfig(tax.id, "enabled", checked)
                          }
                        />
                        <Label className="text-white/80 font-normal cursor-pointer">
                          Enabled
                        </Label>
                      </div>
                      <button
                        onClick={() => removeTaxConfig(tax.id)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SEO Section */}
            <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="p-2 bg-green-600/20 border border-green-500/30 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-green-400" />
                </div>
                SEO Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-white/80 mb-2 block">
                    Product URL
                  </Label>
                  <Input
                    value={formData.seo.productUrl}
                    onChange={(e) =>
                      handleSEOChange("productUrl", e.target.value)
                    }
                    placeholder="product-name"
                    className="bg-white/5 border-white/10 text-white placeholder-white/40"
                  />
                  <p className="text-white/40 text-sm mt-1">
                    Use hyphens to separate words
                  </p>
                </div>

                <div>
                  <Label className="text-white/80 mb-2 block">Page Title</Label>
                  <Input
                    value={formData.seo.pageTitle}
                    onChange={(e) =>
                      handleSEOChange("pageTitle", e.target.value)
                    }
                    placeholder="Product Name - Your Store"
                    className="bg-white/5 border-white/10 text-white placeholder-white/40"
                  />
                  <p className="text-white/40 text-sm mt-1">
                    Recommended length: 50-60 characters
                  </p>
                </div>

                <div>
                  <Label className="text-white/80 mb-2 block">
                    Meta Description
                  </Label>
                  <Textarea
                    value={formData.seo.metaDescription}
                    onChange={(e) =>
                      handleSEOChange("metaDescription", e.target.value)
                    }
                    placeholder="Brief description of the product for search engines"
                    className="bg-white/5 border-white/10 text-white placeholder-white/40 min-h-20"
                  />
                  <p className="text-white/40 text-sm mt-1">
                    Recommended length: 150-160 characters
                  </p>
                </div>
              </div>
            </section>

            {/* Categories Section */}
            <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="p-2 bg-green-600/20 border border-green-500/30 rounded-lg">
                  <Plus className="w-5 h-5 text-green-400" />
                </div>
                Categories
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {allCategories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="w-4 h-4 rounded bg-white/5 border-white/10 cursor-pointer"
                    />
                    <span className="text-white/80">{category}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Product Availability Section */}
            <section className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="p-2 bg-green-600/20 border border-green-500/30 rounded-lg">
                  <Plus className="w-5 h-5 text-green-400" />
                </div>
                Product Availability
              </h2>

              <div className="flex items-center gap-4">
                <Switch
                  checked={formData.availability}
                  onCheckedChange={(checked) =>
                    handleInputChange("availability", checked)
                  }
                />
                <div>
                  <Label className="text-white/80 font-normal cursor-pointer block">
                    {formData.availability
                      ? "Product is Available"
                      : "Product is Unavailable"}
                  </Label>
                  <p className="text-white/40 text-sm mt-1">
                    {formData.availability
                      ? "This product is visible to customers"
                      : "This product is hidden from customers"}
                  </p>
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white gap-2 flex-1"
              >
                {isSaving ? "Saving..." : "Save Product"}
              </Button>
              <Button
                onClick={() => navigate("/admin/products")}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </main>

      <MobileAdminPanel />
    </>
  );
}
