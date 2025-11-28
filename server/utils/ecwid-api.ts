const ECWID_API_BASE = "https://api.ecwid.com/api/v3";
const ECWID_STORE_ID = process.env.ECWID_STORE_ID || "120154275";
const ECWID_API_TOKEN = process.env.ECWID_API_TOKEN || "";

export interface EcwidProduct {
  id: number;
  sku: string;
  name: string;
  price: number;
  description: string;
  options: EcwidOption[];
  images: EcwidImage[];
  defaultImage?: EcwidImage;
}

export interface EcwidOption {
  name: string;
  type: string;
  required: boolean;
  choices?: EcwidChoice[];
}

export interface EcwidChoice {
  text: string;
  priceModifier?: number;
}

export interface EcwidImage {
  id: number;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export async function fetchEcwidProduct(
  productId: number,
): Promise<EcwidProduct | null> {
  try {
    const response = await fetch(
      `${ECWID_API_BASE}/${ECWID_STORE_ID}/products/${productId}?token=${ECWID_API_TOKEN}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch product ${productId}:`,
        response.statusText,
      );
      return null;
    }

    const data = await response.json();
    return transformEcwidProduct(data);
  } catch (error) {
    console.error(`Error fetching Ecwid product ${productId}:`, error);
    return null;
  }
}

export async function searchEcwidProducts(
  query: string,
  limit: number = 20,
): Promise<EcwidProduct[]> {
  try {
    const response = await fetch(
      `${ECWID_API_BASE}/${ECWID_STORE_ID}/products?keyword=${encodeURIComponent(query)}&limit=${limit}&token=${ECWID_API_TOKEN}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      console.error("Failed to search Ecwid products:", response.statusText);
      return [];
    }

    const data = await response.json();
    return (data.items || []).map(transformEcwidProduct);
  } catch (error) {
    console.error("Error searching Ecwid products:", error);
    return [];
  }
}

export async function fetchEcwidProducts(
  limit: number = 20,
  offset: number = 0,
): Promise<EcwidProduct[]> {
  try {
    const response = await fetch(
      `${ECWID_API_BASE}/${ECWID_STORE_ID}/products?limit=${limit}&offset=${offset}&token=${ECWID_API_TOKEN}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      console.error("Failed to fetch Ecwid products:", response.statusText);
      return [];
    }

    const data = await response.json();
    return (data.items || []).map(transformEcwidProduct);
  } catch (error) {
    console.error("Error fetching Ecwid products:", error);
    return [];
  }
}

function transformEcwidProduct(data: any): EcwidProduct {
  const product: EcwidProduct = {
    id: data.id,
    sku: data.sku || "",
    name: data.name || "",
    price: data.price || 0,
    description: data.description || "",
    options: (data.options || []).map((opt: any) => ({
      name: opt.name,
      type: opt.type,
      required: opt.required || false,
      choices: (opt.choices || []).map((choice: any) => ({
        text: choice.text,
        priceModifier: choice.priceModifier || 0,
      })),
    })),
    images: (data.images || []).map((img: any) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      width: img.width,
      height: img.height,
    })),
  };

  if (product.images.length > 0) {
    product.defaultImage = product.images[0];
  }

  return product;
}
