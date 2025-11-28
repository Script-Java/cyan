const ECWID_API_BASE = "https://api.ecwid.com/api/v3";
const ECWID_STORE_ID = process.env.ECWID_STORE_ID || "120154275";
const ECWID_API_TOKEN = process.env.ECWID_API_TOKEN || "";

export async function handleGetEcwidProduct(req: any, res: any) {
  try {
    const { productId } = req.params;
    const id = parseInt(productId, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const url = `${ECWID_API_BASE}/${ECWID_STORE_ID}/products/${id}?token=${ECWID_API_TOKEN}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to fetch product ${id}:`, response.statusText);
      return res.status(404).json({ error: "Product not found" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error in handleGetEcwidProduct:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
}

export async function handleListEcwidProducts(req: any, res: any) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const offset = parseInt(req.query.offset || "0", 10);

    const url = `${ECWID_API_BASE}/${ECWID_STORE_ID}/products?limit=${limit}&offset=${offset}&token=${ECWID_API_TOKEN}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error("Failed to fetch products:", response.statusText);
      return res.status(500).json({ error: "Failed to fetch products" });
    }

    const data = await response.json();
    res.json(data);
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
    const url = `${ECWID_API_BASE}/${ECWID_STORE_ID}/products?keyword=${encodeURIComponent(q as string)}&limit=${limit}&token=${ECWID_API_TOKEN}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error("Failed to search products:", response.statusText);
      return res.status(500).json({ error: "Failed to search products" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error in handleSearchEcwidProducts:", error);
    res.status(500).json({ error: "Failed to search products" });
  }
}
