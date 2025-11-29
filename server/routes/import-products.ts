import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials not configured for product import");
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

interface EcwidProduct {
  product_internal_id: string;
  product_sku: string;
  product_name: string;
  product_price: string;
  product_description: string;
  product_media_main_image_url: string;
  product_media_main_image_alt: string;
  [key: string]: string;
}

interface EcwidOption {
  product_internal_id: string;
  product_option_name: string;
  product_option_type: string;
  product_option_is_required: string;
  product_option_value: string;
  product_option_markup: string;
}

interface EcwidVariation {
  product_internal_id: string;
  product_price: string;
  product_media_main_image_url: string;
  product_variation_sku?: string;
  [key: string]: string | undefined;
}

interface ParsedProduct {
  product: EcwidProduct;
  options: Map<string, EcwidOption[]>;
  variations: EcwidVariation[];
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

function parseEcwidCSV(csvText: string): ParsedProduct[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/["\s]/g, ""));

  const productMap = new Map<string, ParsedProduct>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length === 0) continue;

    const row: { [key: string]: string } = {};
    headers.forEach((header, index) => {
      if (values[index] !== undefined) {
        row[header] = values[index].trim();
      }
    });

    const type = row.type || "";
    const productId = row.product_internal_id || "";

    if (!productId) continue;

    // Initialize product entry if not exists
    if (!productMap.has(productId)) {
      productMap.set(productId, {
        product: row as EcwidProduct,
        options: new Map(),
        variations: [],
      });
    }

    const parsed = productMap.get(productId)!;

    if (type === "product") {
      parsed.product = row as EcwidProduct;
    } else if (type === "product_option") {
      const optionName = row.product_option_name || "";
      if (optionName) {
        if (!parsed.options.has(optionName)) {
          parsed.options.set(optionName, []);
        }
        parsed.options.get(optionName)!.push(row as EcwidOption);
      }
    } else if (type === "product_variation") {
      parsed.variations.push(row as EcwidVariation);
    }
  }

  return Array.from(productMap.values());
}

function buildProductFromEcwid(parsed: ParsedProduct): any {
  const product = parsed.product;
  const variations = parsed.variations;

  // Calculate price range from variations
  let basePrice = parseFloat(product.product_price) || 0;
  let minPrice = basePrice;
  let maxPrice = basePrice;

  if (variations.length > 0) {
    const prices = variations
      .map((v) => parseFloat(v.product_price) || 0)
      .filter((p) => p > 0);
    if (prices.length > 0) {
      minPrice = Math.min(...prices);
      maxPrice = Math.max(...prices);
      basePrice = minPrice;
    }
  }

  // Build options array
  const options: any[] = [];
  parsed.options.forEach((optionItems, optionName) => {
    const choices = optionItems
      .filter((item) => item.product_option_value)
      .map((item) => ({
        text: item.product_option_value,
        markup: item.product_option_markup || "0",
      }));

    if (choices.length > 0) {
      options.push({
        name: optionName,
        type: optionItems[0]?.product_option_type || "DROPDOWNLIST",
        required: optionItems[0]?.product_option_is_required === "true",
        choices,
      });
    }
  });

  // Build variations array
  const variationsFormatted = variations.map((v) => {
    // Extract variation attribute values from the row
    const variationAttributes: { [key: string]: string } = {};
    Object.keys(v).forEach((key) => {
      if (key.startsWith("product_variation_option_")) {
        const attrName = key
          .replace("product_variation_option_", "")
          .replace(/[{}]/g, "");
        const value = v[key];
        if (value) {
          variationAttributes[attrName] = value;
        }
      }
    });

    return {
      id: v.product_variation_sku || `var-${Object.keys(variationAttributes).join("-")}`,
      price: parseFloat(v.product_price) || 0,
      image_url: v.product_media_main_image_url || "",
      attributes: variationAttributes,
    };
  });

  // Get main image - prefer variation image if available
  let imageUrl = product.product_media_main_image_url || "";
  if (!imageUrl && variationsFormatted.length > 0) {
    imageUrl = variationsFormatted[0].image_url;
  }

  return {
    ecwid_id: parseInt(product.product_internal_id, 10),
    sku: product.product_sku || null,
    name: product.product_name || "",
    description: product.product_description || null,
    price: basePrice,
    base_price: basePrice,
    min_price: minPrice,
    max_price: maxPrice,
    image_url: imageUrl,
    options: options,
    variations: variationsFormatted,
    rating: 0,
    reviews_count: 0,
    is_active: true,
  };
}

export const handleImportProducts: RequestHandler = async (req, res) => {
  try {
    const csvData = req.body?.csv_data;

    if (!csvData || typeof csvData !== "string") {
      return res.status(400).json({
        error:
          "CSV data is required. Send as POST with 'csv_data' (string) in the request body",
        received: typeof csvData,
      });
    }
    const parsedProducts = parseEcwidCSV(csvData);

    if (parsedProducts.length === 0) {
      return res.status(400).json({
        error: "No valid products found in CSV",
      });
    }

    // Convert to database format
    const productsToInsert = parsedProducts.map((parsed) =>
      buildProductFromEcwid(parsed),
    );

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
      .range(
        parseInt(offset as string) || 0,
        (parseInt(offset as string) || 0) + (parseInt(limit as string) || 20) -
          1,
      );

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
