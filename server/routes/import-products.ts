import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials not configured for product import");
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

interface ProductRow {
  id?: string;
  ecwid_id?: string;
  sku?: string;
  name?: string;
  description?: string;
  price?: string;
  image_url?: string;
  rating?: string;
  reviews_count?: string;
}

function parseCSV(csvText: string): ProductRow[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/["\s]/g, ""));

  const products: ProductRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length === 0) continue;

    const product: ProductRow = {};

    headers.forEach((header, index) => {
      if (values[index] !== undefined) {
        product[header as keyof ProductRow] = values[index].trim();
      }
    });

    if (product.name && (product.price || product.sku)) {
      products.push(product);
    }
  }

  return products;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

export const handleImportProducts: RequestHandler = async (req, res) => {
  try {
    if (!req.body || !req.body.csv_data) {
      return res.status(400).json({
        error: "CSV data is required. Send as multipart form data with 'csv_data' field",
      });
    }

    const csvData = req.body.csv_data;
    const products = parseCSV(csvData);

    if (products.length === 0) {
      return res.status(400).json({
        error:
          "No valid products found in CSV. Ensure CSV has headers and at least name and price columns.",
      });
    }

    const productsToInsert = products.map((p) => ({
      ecwid_id: p.ecwid_id ? parseInt(p.ecwid_id, 10) : null,
      sku: p.sku || null,
      name: p.name || "",
      description: p.description || null,
      price: p.price ? parseFloat(p.price) : 0,
      image_url: p.image_url || null,
      rating: p.rating ? parseFloat(p.rating) : 0,
      reviews_count: p.reviews_count ? parseInt(p.reviews_count, 10) : 0,
      is_active: true,
    }));

    const { data, error } = await supabase
      .from("products")
      .insert(productsToInsert)
      .select();

    if (error) {
      console.error("Import error:", error);
      return res.status(500).json({
        error: error.message || "Failed to import products",
      });
    }

    res.json({
      success: true,
      message: `Successfully imported ${data?.length || 0} products`,
      imported_count: data?.length || 0,
      products: data,
    });
  } catch (error) {
    console.error("Import products error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to import products",
    });
  }
};

export const handleGetProducts: RequestHandler = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const { data, error, count } = await supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(parseInt(offset as string) || 0, (parseInt(offset as string) || 0) + (parseInt(limit as string) || 20) - 1);

    if (error) {
      console.error("Fetch products error:", error);
      return res.status(500).json({
        error: error.message || "Failed to fetch products",
      });
    }

    res.json({
      items: data || [],
      count: count || 0,
      limit: parseInt(limit as string) || 20,
      offset: parseInt(offset as string) || 0,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to fetch products",
    });
  }
};

export const handleDeleteAllProducts: RequestHandler = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .delete()
      .neq("id", 0)
      .select();

    if (error) {
      console.error("Delete error:", error);
      return res.status(500).json({
        error: error.message || "Failed to delete products",
      });
    }

    res.json({
      success: true,
      message: `Deleted ${data?.length || 0} products`,
      deleted_count: data?.length || 0,
    });
  } catch (error) {
    console.error("Delete products error:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to delete products",
    });
  }
};
