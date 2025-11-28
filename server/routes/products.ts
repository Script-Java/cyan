import { RequestHandler } from "express";
import { bigCommerceAPI } from "../utils/bigcommerce";

export const handleGetProduct: RequestHandler = async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  try {
    const product = await bigCommerceAPI.getProductWithOptions(
      parseInt(productId, 10),
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ data: product });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to get product",
    });
  }
};

export const handleGetProductOptions: RequestHandler = async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  try {
    const options = await bigCommerceAPI.getProductOptions(
      parseInt(productId, 10),
    );

    res.json({ data: options });
  } catch (error) {
    console.error("Get product options error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to get product options",
    });
  }
};
