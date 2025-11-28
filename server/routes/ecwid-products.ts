const ECWID_API_BASE = "https://api.ecwid.com/api/v3";
const ECWID_STORE_ID = process.env.ECWID_STORE_ID || "120154275";
const ECWID_API_TOKEN = process.env.ECWID_API_TOKEN || "";

// Mock products for development/demonstration
const MOCK_PRODUCTS = [
  {
    id: 785848122,
    sku: "3-INCH-PROMO",
    name: '3" INCH - 200 CUSTOM STICKER PROMOTION',
    price: 0.26,
    description:
      "Premium vinyl stickers perfect for laptops, phones, and outdoor use. Durable and weather-resistant.",
    images: [
      {
        id: 1,
        url: "https://d2j6dbq0eux0bg.cloudfront.net/images/120154275/5218909281.jpg",
        alt: "3 Inch Sticker Promo",
      },
    ],
    options: [
      {
        name: "Shape",
        type: "select",
        required: true,
        choices: [
          { text: "Square", priceModifier: 0 },
          { text: "Circle", priceModifier: 0 },
          { text: "Custom", priceModifier: 0.5 },
        ],
      },
      {
        name: "Finish",
        type: "select",
        required: true,
        choices: [
          { text: "Glossy", priceModifier: 0 },
          { text: "Matte", priceModifier: 0.05 },
          { text: "Holographic", priceModifier: 0.15 },
        ],
      },
      {
        name: "Size",
        type: "select",
        required: true,
        choices: [
          { text: '2x2"', priceModifier: 0 },
          { text: '3x3"', priceModifier: 0 },
          { text: '4x4"', priceModifier: 0.1 },
        ],
      },
      {
        name: "Quantity",
        type: "select",
        required: true,
        choices: [
          { text: "50 pieces", priceModifier: 0 },
          { text: "100 pieces", priceModifier: 0 },
          { text: "250 pieces", priceModifier: 5 },
        ],
      },
    ],
  },
  {
    id: 790950034,
    sku: "SQAURE-STICKER",
    name: "SQUARE STICKER",
    price: 0.22,
    description:
      "Classic square vinyl stickers with vibrant full-color printing. Perfect for branding and personal use.",
    images: [
      {
        id: 1,
        url: "https://d2j6dbq0eux0bg.cloudfront.net/images/120154275/5291230490.png",
        alt: "Square Sticker",
      },
    ],
    options: [
      {
        name: "Material",
        type: "select",
        required: true,
        choices: [
          { text: "Vinyl", priceModifier: 0 },
          { text: "Paper", priceModifier: -0.05 },
        ],
      },
      {
        name: "Size",
        type: "select",
        required: true,
        choices: [
          { text: '2x2"', priceModifier: 0 },
          { text: '3x3"', priceModifier: 0.05 },
        ],
      },
      {
        name: "Finish",
        type: "select",
        required: true,
        choices: [
          { text: "Gloss", priceModifier: 0 },
          { text: "Matte", priceModifier: 0.05 },
        ],
      },
      {
        name: "Border",
        type: "select",
        required: false,
        choices: [
          { text: "None", priceModifier: 0 },
          { text: "White Border", priceModifier: 0 },
        ],
      },
    ],
  },
  {
    id: 789123456,
    sku: "CIRCLE-STICKER",
    name: "CIRCLE STICKER",
    price: 0.22,
    description:
      "Round stickers with precision cutting for clean edges. Available in various finishes.",
    images: [
      {
        id: 1,
        url: "https://d2j6dbq0eux0bg.cloudfront.net/images/120154275/5291230491.png",
        alt: "Circle Sticker",
      },
    ],
    options: [
      {
        name: "Diameter",
        type: "select",
        required: true,
        choices: [
          { text: "2 inch", priceModifier: 0 },
          { text: "3 inch", priceModifier: 0.05 },
          { text: "4 inch", priceModifier: 0.1 },
        ],
      },
      {
        name: "Finish",
        type: "select",
        required: true,
        choices: [
          { text: "Glossy", priceModifier: 0 },
          { text: "Matte", priceModifier: 0.05 },
        ],
      },
      {
        name: "Lamination",
        type: "select",
        required: false,
        choices: [
          { text: "None", priceModifier: 0 },
          { text: "UV Protective", priceModifier: 0.15 },
        ],
      },
      {
        name: "Quantity",
        type: "select",
        required: true,
        choices: [
          { text: "50", priceModifier: 0 },
          { text: "100", priceModifier: 0 },
          { text: "500", priceModifier: 15 },
        ],
      },
    ],
  },
];

async function fetchFromEcwid(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Ecwid API error: ${response.statusText}`);
  }
  return response.json();
}

export async function handleGetEcwidProduct(req: any, res: any) {
  try {
    const { productId } = req.params;
    const id = parseInt(productId, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    // Try to fetch from Ecwid API first, fallback to mock data
    try {
      const url = `${ECWID_API_BASE}/${ECWID_STORE_ID}/products/${id}?token=${ECWID_API_TOKEN}`;
      const data = await fetchFromEcwid(url);
      return res.json(data);
    } catch (apiError) {
      console.log("Ecwid API unavailable, using mock data");
      const product = MOCK_PRODUCTS.find((p) => p.id === id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.json(product);
    }
  } catch (error) {
    console.error("Error in handleGetEcwidProduct:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
}

export async function handleListEcwidProducts(req: any, res: any) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const offset = parseInt(req.query.offset || "0", 10);

    // Try to fetch from Ecwid API first, fallback to mock data
    try {
      const url = `${ECWID_API_BASE}/${ECWID_STORE_ID}/products?limit=${limit}&offset=${offset}&token=${ECWID_API_TOKEN}`;
      const data = await fetchFromEcwid(url);
      return res.json(data);
    } catch (apiError) {
      console.log("Ecwid API unavailable, using mock data");
      const products = MOCK_PRODUCTS.slice(offset, offset + limit);
      return res.json({ items: products, count: products.length });
    }
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

    // Try to fetch from Ecwid API first, fallback to mock data
    try {
      const url = `${ECWID_API_BASE}/${ECWID_STORE_ID}/products?keyword=${encodeURIComponent(q as string)}&limit=${limit}&token=${ECWID_API_TOKEN}`;
      const data = await fetchFromEcwid(url);
      return res.json(data);
    } catch (apiError) {
      console.log("Ecwid API unavailable, using mock data");
      const query = (q as string).toLowerCase();
      const products = MOCK_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query),
      ).slice(0, limit);
      return res.json({ items: products, count: products.length });
    }
  } catch (error) {
    console.error("Error in handleSearchEcwidProducts:", error);
    res.status(500).json({ error: "Failed to search products" });
  }
}
