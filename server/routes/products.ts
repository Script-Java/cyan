import { RequestHandler } from "express";
import { ecwidAPI } from "../utils/ecwid";

export const handleGetProduct: RequestHandler = async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  try {
    const product = await ecwidAPI.getProductWithVariations(
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
    const variations = await ecwidAPI.getProductVariations(
      parseInt(productId, 10),
    );

    res.json({ data: variations });
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
