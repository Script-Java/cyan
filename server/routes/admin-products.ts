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

interface ProductOption {
  id: string;
  name: string;
  type: "select" | "text" | "radio" | "checkbox";
  required: boolean;
  values: string[];
}

interface TaxConfig {
  id: string;
  name: string;
  rate: number;
  enabled: boolean;
}

interface ProductFormData {
  name: string;
  price: number;
  description: string;
  sku: string;
  weight: number;
  images: ProductImage[];
  options: ProductOption[];
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

    // Validation
    if (!productData.name?.trim()) {
      return res
        .status(400)
        .json({ error: "Product name is required" });
    }

    if (productData.price <= 0) {
      return res
        .status(400)
        .json({ error: "Price must be greater than 0" });
    }

    // Prepare data for database
    const dbProduct = {
      name: productData.name,
      price: productData.price,
      description: productData.description || "",
      sku: productData.sku || "",
      weight: productData.weight || 0,
      images: productData.images || [],
      options: productData.options || [],
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
      created_at: new Date().toISOString(),
    };

    // Insert into database
    const { data, error } = await supabase
      .from("admin_products")
      .insert([dbProduct])
      .select();

    if (error) {
      console.error("Database error:", error);
      return res
        .status(500)
        .json({ error: "Failed to create product", details: error.message });
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

    // Validation
    if (!productData.name?.trim()) {
      return res
        .status(400)
        .json({ error: "Product name is required" });
    }

    if (productData.price <= 0) {
      return res
        .status(400)
        .json({ error: "Price must be greater than 0" });
    }

    // Prepare data for database
    const dbProduct = {
      name: productData.name,
      price: productData.price,
      description: productData.description || "",
      sku: productData.sku || "",
      weight: productData.weight || 0,
      images: productData.images || [],
      options: productData.options || [],
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

    // Update in database
    const { data, error } = await supabase
      .from("admin_products")
      .update(dbProduct)
      .eq("id", productId)
      .select();

    if (error) {
      console.error("Database error:", error);
      return res
        .status(500)
        .json({ error: "Failed to update product", details: error.message });
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
      .select("*")
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

    const { data, error } = await supabase
      .from("admin_products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Product not found" });
      }
      console.error("Database error:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch product", details: error.message });
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

    const { error } = await supabase
      .from("admin_products")
      .delete()
      .eq("id", productId);

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
