export async function importAdminProduct(productData: any) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch("/api/admin/products/import", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to import product");
  }

  return await response.json();
}

// The "CREATE A STICKER" product data from Ecwid CSV
export const STICKY_SLAP_STICKER_PRODUCT = {
  name: "CREATE A STICKER",
  basePrice: 0.0,
  sku: "00004",
  description:
    '<p><strong>Sticky Slap</strong> — Custom Stickers That Stick</p><p> We specialize in high-quality <strong>custom sticker printing</strong> with a vibrant <strong>8-color setup</strong> for bold, precise designs.<br> 🌦️ <strong>Durability:</strong> 4–5 years outdoors unlaminated, 5–8 years laminated<br> ⏱️ <strong>Fast Turnaround:</strong> Orders ship within <strong>2 business days after artwork approval</strong><br> Whether it\'s branding, promo drops, or slap tags — <strong>Sticky Slap makes stickers that go hard and last long.</strong></p>',
  images: [
    {
      id: "main",
      url: "https://d2j6dbq0eux0bg.cloudfront.net/images/120154275/5291187387.png",
      name: "Main Image",
    },
    {
      id: "img1",
      url: "https://d2j6dbq0eux0bg.cloudfront.net/images/120154275/5031878273.png",
      name: "Gallery Image 1",
    },
    {
      id: "img2",
      url: "https://d2j6dbq0eux0bg.cloudfront.net/images/120154275/5039449152.webp",
      name: "Gallery Image 2",
    },
    {
      id: "img3",
      url: "https://d2j6dbq0eux0bg.cloudfront.net/images/120154275/5031819081.png",
      name: "Gallery Image 3",
    },
    {
      id: "img4",
      url: "https://d2j6dbq0eux0bg.cloudfront.net/images/120154275/5031819086.jpg",
      name: "Gallery Image 4",
    },
    {
      id: "img5",
      url: "https://d2j6dbq0eux0bg.cloudfront.net/images/120154275/5031819306.png",
      name: "Gallery Image 5",
    },
    {
      id: "img6",
      url: "https://d2j6dbq0eux0bg.cloudfront.net/images/120154275/5031819311.png",
      name: "Gallery Image 6",
    },
  ],
  options: [
    {
      id: "vinyl-finish",
      name: "VINYL FINISH",
      type: "dropdown",
      required: false,
      displayOrder: 1,
      values: [
        {
          id: "vf-1",
          name: "SATIN & LAMINATION",
          priceModifier: 0,
        },
        {
          id: "vf-2",
          name: "GLOSS & LAMINATION",
          priceModifier: 0,
        },
      ],
    },
    {
      id: "sticker-size",
      name: "STICKER SIZE PRICE PER STICKER",
      type: "dropdown",
      required: false,
      displayOrder: 2,
      values: [
        { id: "ss-1", name: "2 x 1", priceModifier: 0.22 },
        { id: "ss-2", name: "2 X 3", priceModifier: 0.23 },
        { id: "ss-3", name: '2.5" x 6', priceModifier: 0.42 },
        { id: "ss-4", name: '3" x 3', priceModifier: 0.31 },
        { id: "ss-5", name: "4'' x 4", priceModifier: 0.33 },
        { id: "ss-6", name: '5"x 5', priceModifier: 0.39 },
        { id: "ss-7", name: '7.5 x 3"', priceModifier: 1.02 },
        { id: "ss-8", name: '6.5 x 2"', priceModifier: 0.95 },
      ],
    },
    {
      id: "border-cut",
      name: "BOARDER CUT:",
      type: "dropdown",
      required: false,
      displayOrder: 3,
      values: [
        {
          id: "bc-1",
          name: "Full bleed cut",
          priceModifier: 0,
        },
        {
          id: "bc-2",
          name: "White boarder cut",
          priceModifier: 0,
        },
      ],
    },
    {
      id: "artwork",
      name: "ARTWORK",
      type: "text",
      required: true,
      displayOrder: 4,
      values: [],
    },
  ],
  categories: ["Sticky Slap Stickers"],
  availability: true,
  customerUploadConfig: {
    enabled: true,
    maxFileSize: 50,
    allowedFormats: ["png", "jpg", "jpeg", "gif", "pdf", "ai", "psd"],
    description: "Upload your artwork for custom stickers",
  },
};
