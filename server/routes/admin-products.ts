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
  showQuantityPanel: boolean;
  fixedQuantity: number | null;
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

    // Build complete product object with all supported columns
    const dbProduct: any = {
      // Core fields
      name: productData.name,
      base_price: productData.basePrice || 0,
      description: productData.description || "",
      sku: productData.sku || "",
      weight: productData.weight || 0,
      availability: productData.availability !== false,
      created_at: new Date().toISOString(),

      // JSON fields
      images: productData.images || [],
      options: productData.options || [],
      shared_variants: productData.sharedVariants || [],
      pricing_rules: productData.pricingRules || [],
      customer_upload_config: productData.customerUploadConfig || {
        enabled: false,
        maxFileSize: 5,
        allowedFormats: ["png", "jpg", "jpeg", "gif"],
        description: "",
      },
      optional_fields: productData.optionalFields || [],
      categories: productData.categories || [],
      taxes: productData.taxes || [],
      seo: productData.seo || {
        productUrl: "",
        pageTitle: "",
        metaDescription: "",
      },

      // Text fields
      text_area: productData.textArea || "",
      condition_logic: productData.conditionLogic || "all",
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

    // Build complete product object with all supported columns
    const dbProduct: any = {
      // Core fields
      name: productData.name,
      base_price: productData.basePrice || 0,
      description: productData.description || "",
      sku: productData.sku || "",
      weight: productData.weight || 0,
      availability: productData.availability !== false,
      updated_at: new Date().toISOString(),

      // JSON fields
      images: productData.images || [],
      options: productData.options || [],
      shared_variants: productData.sharedVariants || [],
      pricing_rules: productData.pricingRules || [],
      customer_upload_config: productData.customerUploadConfig || {
        enabled: false,
        maxFileSize: 5,
        allowedFormats: ["png", "jpg", "jpeg", "gif"],
        description: "",
      },
      optional_fields: productData.optionalFields || [],
      categories: productData.categories || [],
      taxes: productData.taxes || [],
      seo: productData.seo || {
        productUrl: "",
        pageTitle: "",
        metaDescription: "",
      },

      // Text fields
      text_area: productData.textArea || "",
      condition_logic: productData.conditionLogic || "all",
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
      // Core fields
      name,
      base_price: basePrice || 0,
      sku: sku || "",
      description: description || "",
      availability: availability !== false,
      created_at: new Date().toISOString(),

      // JSON fields
      images: images || [],
      options: options || [],
      customer_upload_config: customerUploadConfig || {
        enabled: false,
        maxFileSize: 5,
        allowedFormats: ["png", "jpg", "jpeg", "gif"],
        description: "",
      },
      categories: categories || [],
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

export const handleGetAdminProductPublic: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const { data, error } = await supabase
      .from("admin_products")
      .select("id, name, base_price, description, images, options, shared_variants, customer_upload_config, optional_fields, availability, created_at, updated_at")
      .eq("id", parseInt(id))
      .eq("availability", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Product not found" });
      }
      console.error("Database error fetching admin product:", error);
      return res.status(500).json({ error: "Failed to fetch product" });
    }

    if (!data) {
      return res.status(404).json({ error: "Product not found or not available" });
    }

    res.json({
      id: data.id,
      name: data.name,
      base_price: data.base_price,
      description: data.description,
      images: Array.isArray(data.images) ? data.images : [],
      options: Array.isArray(data.options) ? data.options : [],
      availability: data.availability,
    });
  } catch (error) {
    console.error("Error fetching admin product:", error);
    res.status(500).json({
      error: "Failed to fetch product",
      details: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

export const handleGetImportedProductPublic: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, min_price, max_price, description, image_url, options, rating, reviews_count")
      .eq("id", parseInt(id))
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Product not found" });
      }
      console.error("Database error fetching imported product:", error);
      return res.status(500).json({ error: "Failed to fetch product" });
    }

    if (!data) {
      return res.status(404).json({ error: "Product not found or not available" });
    }

    res.json({
      id: data.id,
      name: data.name,
      price: data.price,
      min_price: data.min_price,
      max_price: data.max_price,
      description: data.description,
      image_url: data.image_url,
      options: Array.isArray(data.options) ? data.options : [],
      rating: data.rating,
      reviews_count: data.reviews_count,
    });
  } catch (error) {
    console.error("Error fetching imported product:", error);
    res.status(500).json({
      error: "Failed to fetch product",
      details: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

export const handleGetStorefrontProducts: RequestHandler = async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    // Fetch admin products (with group assignments)
    const { data: adminProducts, error: adminError } = await supabase
      .from("admin_products")
      .select("id, name, base_price, sku, images, categories, availability")
      .eq("availability", true)
      .order("created_at", { ascending: false })
      .range(
        parseInt(offset as string) || 0,
        (parseInt(offset as string) || 0) + (parseInt(limit as string) || 100) - 1,
      );

    if (adminError) {
      console.error("Error fetching admin products:", adminError);
      return res.status(500).json({ error: "Failed to fetch admin products" });
    }

    // Format admin products
    const formattedAdminProducts = (adminProducts || []).map((product: any) => ({
      id: `admin_${product.id}`,
      name: product.name,
      price: product.base_price || 0,
      sku: product.sku || "",
      image_url: product.images?.[0]?.url || null,
      group: product.categories?.[0] || null,
      source: "admin",
      availability: product.availability,
    }));

    // Fetch imported products
    const { data: importedProducts, error: importedError } = await supabase
      .from("products")
      .select("id, name, price, min_price, max_price, sku, image_url, rating, reviews_count")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(
        parseInt(offset as string) || 0,
        (parseInt(offset as string) || 0) + (parseInt(limit as string) || 100) - 1,
      );

    if (importedError) {
      console.error("Error fetching imported products:", importedError);
      return res.status(500).json({ error: "Failed to fetch imported products" });
    }

    // Format imported products
    const formattedImportedProducts = (importedProducts || []).map((product: any) => ({
      id: `imported_${product.id}`,
      name: product.name,
      price: product.min_price || product.price || 0,
      min_price: product.min_price,
      max_price: product.max_price,
      sku: product.sku || "",
      image_url: product.image_url || null,
      group: null,
      source: "imported",
      rating: product.rating || 0,
      reviews_count: product.reviews_count || 0,
    }));

    // Combine and return
    const allProducts = [...formattedAdminProducts, ...formattedImportedProducts];

    res.json({
      items: allProducts,
      count: allProducts.length,
      limit: parseInt(limit as string) || 100,
      offset: parseInt(offset as string) || 0,
    });
  } catch (error) {
    console.error("Error fetching storefront products:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to fetch products",
    });
  }
};
