import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

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

interface PricingRule {
  id: string;
  conditions: { optionId: string; valueId: string }[];
  price: number;
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

export const handleCreateProduct: RequestHandler = async (req, res) => {
  try {
    const productData: ProductFormData = req.body;

    if (!productData.name?.trim()) {
      return res.status(400).json({ error: "Product name is required" });
    }

    const hasSharedVariants =
      productData.sharedVariants && productData.sharedVariants.length > 0;
    if (productData.basePrice <= 0 && !hasSharedVariants) {
      return res.status(400).json({
        error: "Base price must be greater than 0 (or add shared variants)",
      });
    }

    const dbProduct = {
      name: productData.name,
      base_price: productData.basePrice,
      description: productData.description || "",
      sku: productData.sku || "",
      weight: productData.weight || 0,
      images: productData.images || [],
      options: productData.options || [],
      pricing_rules: productData.pricingRules || [],
      shared_variants: productData.sharedVariants || [],
      customer_upload_config: productData.customerUploadConfig || {
        enabled: false,
        maxFileSize: 5,
        allowedFormats: ["png", "jpg", "jpeg", "gif"],
        description: "",
      },
      optional_fields: productData.optionalFields || [],
      text_area: productData.textArea || "",
      condition_logic: productData.conditionLogic || "all",
      taxes: productData.taxes || [],
      seo: productData.seo || {
        productUrl: "",
        pageTitle: "",
        metaDescription: "",
      },
      // NOTE: categories field excluded - migrate database to add this column
      // categories: productData.categories || [],
      availability: productData.availability !== false,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("admin_products")
      .insert([dbProduct])
      .select();

    if (error) {
      console.error("Database error creating product:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return res
        .status(500)
        .json({
          error: "Failed to create product",
          details: error.message,
          code: error.code
        });
    }

    res.json({
      message: "Product created successfully",
      product: data?.[0],
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      error: "Failed to create product",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

export const handleUpdateProduct: RequestHandler = async (req, res) => {
  try {
    const { productId } = req.params;
    const productData: ProductFormData = req.body;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const id = parseInt(productId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    if (!productData.name?.trim()) {
      return res.status(400).json({ error: "Product name is required" });
    }

    const hasSharedVariants =
      productData.sharedVariants && productData.sharedVariants.length > 0;
    if (productData.basePrice <= 0 && !hasSharedVariants) {
      return res.status(400).json({
        error: "Base price must be greater than 0 (or add shared variants)",
      });
    }

    const dbProduct = {
      name: productData.name,
      base_price: productData.basePrice,
      description: productData.description || "",
      sku: productData.sku || "",
      weight: productData.weight || 0,
      images: productData.images || [],
      options: productData.options || [],
      pricing_rules: productData.pricingRules || [],
      shared_variants: productData.sharedVariants || [],
      customer_upload_config: productData.customerUploadConfig || {
        enabled: false,
        maxFileSize: 5,
        allowedFormats: ["png", "jpg", "jpeg", "gif"],
        description: "",
      },
      optional_fields: productData.optionalFields || [],
      text_area: productData.textArea || "",
      condition_logic: productData.conditionLogic || "all",
      taxes: productData.taxes || [],
      seo: productData.seo || {
        productUrl: "",
        pageTitle: "",
        metaDescription: "",
      },
      categories: productData.categories || [],
      availability: productData.availability !== false,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("admin_products")
      .update(dbProduct)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Database error updating product:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        productId: id,
      });
      return res
        .status(500)
        .json({
          error: "Failed to update product",
          details: error.message,
          code: error.code
        });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product: data[0],
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      error: "Failed to update product",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

export const handleGetAdminProducts: RequestHandler = async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("admin_products")
      .select("id, name, base_price, description, images, options, shared_variants, customer_upload_config, optional_fields, availability, sku, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch products", details: error.message });
    }

    res.json({ products: data || [] });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      error: "Failed to fetch products",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

export const handleGetAdminProduct: RequestHandler = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const id = parseInt(productId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    const { data, error } = await supabase
      .from("admin_products")
      .select("id, name, base_price, description, images, options, shared_variants, customer_upload_config, optional_fields, availability, sku, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Product not found" });
      }
      console.error("Database error fetching admin product:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        productId: id,
      });
      return res
        .status(500)
        .json({ error: "Failed to fetch product", details: error.message, code: error.code });
    }

    res.json({ product: data });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      error: "Failed to fetch product",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

export const handleDeleteAdminProduct: RequestHandler = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const id = parseInt(productId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    const { error } = await supabase
      .from("admin_products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Database error:", error);
      return res
        .status(500)
        .json({ error: "Failed to delete product", details: error.message });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      error: "Failed to delete product",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

export const handleGetPublicProduct: RequestHandler = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // Try parsing as numeric ID first
    const numericId = parseInt(productId, 10);
    let query = supabase
      .from("admin_products")
      .select("id, name, base_price, description, images, options, shared_variants, customer_upload_config, optional_fields, availability, created_at, updated_at")
      .eq("availability", true);

    // Use numeric ID if valid, otherwise treat as SKU
    if (!isNaN(numericId)) {
      query = query.eq("id", numericId);
    } else {
      query = query.eq("sku", productId);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Product not found" });
      }
      console.error("Database error fetching public product:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        productId: id,
      });
      return res
        .status(500)
        .json({ error: "Failed to fetch product", details: error.message, code: error.code });
    }

    if (!data) {
      return res.status(404).json({ error: "Product not found or not available" });
    }

    // Ensure proper data types for JSON fields
    const product = {
      ...data,
      images: Array.isArray(data.images) ? data.images : [],
      options: Array.isArray(data.options) ? data.options : [],
      shared_variants: Array.isArray(data.shared_variants) ? data.shared_variants : [],
      customer_upload_config: typeof data.customer_upload_config === 'object' ? data.customer_upload_config : {
        enabled: false,
        maxFileSize: 5,
        allowedFormats: ["pdf", "png", "jpg"],
        description: ""
      },
      optional_fields: Array.isArray(data.optional_fields) ? data.optional_fields : [],
    };

    res.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      error: "Failed to fetch product",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

export const handleImportAdminProduct: RequestHandler = async (req, res) => {
  try {
    const {
      name,
      basePrice,
      sku,
      description,
      images,
      options,
      categories,
      availability,
      customerUploadConfig,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Product name is required" });
    }

    const dbProduct: any = {
      name,
      base_price: basePrice || 0,
      sku: sku || "",
      description: description || "",
      images: images || [],
      options: options || [],
      availability: availability !== false,
      customer_upload_config: customerUploadConfig || {
        enabled: false,
        maxFileSize: 5,
        allowedFormats: ["png", "jpg", "jpeg", "gif"],
        description: "",
      },
      created_at: new Date().toISOString(),
    };

    // Only include categories if it was provided (column may not exist in all schemas)
    if (categories && categories.length > 0) {
      dbProduct.categories = categories;
    }

    const { data, error } = await supabase
      .from("admin_products")
      .insert([dbProduct])
      .select();

    if (error) {
      console.error("Database error creating product:", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      return res.status(500).json({
        error: "Failed to create product",
        details: error.message,
      });
    }

    res.json({
      success: true,
      product: data?.[0],
    });
  } catch (error) {
    console.error("Error importing product:", error);
    res.status(500).json({
      error: "Failed to import product",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};
