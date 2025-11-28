import { fetchEcwidProduct, fetchEcwidProducts, searchEcwidProducts } from "../utils/ecwid-api";

export async function handleGetEcwidProduct(req: any, res: any) {
  try {
    const { productId } = req.params;
    const id = parseInt(productId, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await fetchEcwidProduct(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error in handleGetEcwidProduct:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
}

export async function handleListEcwidProducts(req: any, res: any) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const offset = parseInt(req.query.offset || "0", 10);

    const products = await fetchEcwidProducts(limit, offset);
    res.json({ products, count: products.length });
  } catch (error) {
    console.error("Error in handleListEcwidProducts:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}

export async function handleSearchEcwidProducts(req: any, res: any) {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Search query required" });
    }

    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const products = await searchEcwidProducts(q as string, limit);

    res.json({ products, count: products.length });
  } catch (error) {
    console.error("Error in handleSearchEcwidProducts:", error);
    res.status(500).json({ error: "Failed to search products" });
  }
}
