import { RequestHandler } from "express";
import { ecwidAPI } from "../utils/ecwid";

interface CreateCheckoutRequest {
  customer_id?: number | null;
  customer_email?: string;
  products: Array<{
    product_id: number;
    quantity: number;
    price_inc_tax?: number;
  }>;
  product_options?: Record<string, string>;
  billing_address: {
    first_name: string;
    last_name: string;
    street_1: string;
    street_2?: string;
    city: string;
    state_or_province: string;
    postal_code: string;
    country_code: string;
  };
  shipping_addresses: Array<{
    first_name: string;
    last_name: string;
    street_1: string;
    street_2?: string;
    city: string;
    state_or_province: string;
    postal_code: string;
    country_code: string;
  }>;
}

/**
 * Create an Ecwid order and return checkout URL
 * Requires: customer_id (authenticated user)
 */
export const handleCreateBigCommerceCheckout: RequestHandler = async (
  req,
  res,
) => {
  try {
    const customerId = (req as any).customerId;
    const checkoutData = req.body as CreateCheckoutRequest;

    console.log("Ecwid checkout request:", {
      customerId,
      hasProducts: !!checkoutData.products,
      productCount: checkoutData.products?.length,
      hasEmail: !!checkoutData.customer_email,
      hasBilling: !!checkoutData.billing_address,
      hasShipping: !!checkoutData.shipping_addresses,
    });

    // Use customer_id from token (if authenticated) or from request body (if guest)
    const userId = customerId || checkoutData.customer_id || null;

    if (!checkoutData.products || checkoutData.products.length === 0) {
      return res.status(400).json({ error: "No products in checkout" });
    }

    if (!checkoutData.billing_address || !checkoutData.shipping_addresses) {
      return res
        .status(400)
        .json({ error: "Billing and shipping addresses required" });
    }

    // Get store info to construct checkout URL
    let storeInfo: any;
    try {
      storeInfo = await ecwidAPI.getStoreInfo();
      console.log("Store info retrieved:", {
        storeName: storeInfo.name,
        storeId: process.env.ECWID_STORE_ID,
      });
    } catch (storeError) {
      console.error("Failed to get store info:", storeError);
      storeInfo = null;
    }

    console.log("Constructing Ecwid checkout URL...");

    // Ecwid uses a standard checkout URL format
    const storeId = process.env.ECWID_STORE_ID;
    const checkoutUrl = `https://www.ecwid.com/cart?storeid=${storeId}`;

    console.log("Ecwid checkout URL ready:", checkoutUrl);

    res.status(201).json({
      success: true,
      message: "Checkout initiated",
      data: {
        checkout_url: checkoutUrl,
        customer_id: userId,
        customer_email: checkoutData.customer_email,
      },
    });
  } catch (error) {
    console.error("Ecwid checkout error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to create Ecwid checkout";
    const details = error instanceof Error ? error.stack : String(error);
    res.status(500).json({
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? details : undefined,
    });
  }
};

/**
 * Get BigCommerce checkout URL (for existing draft orders)
 */
export const handleGetBigCommerceCheckoutUrl: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { draftOrderId } = req.params;

    if (!draftOrderId) {
      return res.status(400).json({ error: "Draft order ID required" });
    }

    // Get store info to construct checkout URL
    let storeInfo: any;
    try {
      storeInfo = await bigCommerceAPI.getStoreInfo();
    } catch (error) {
      console.error("Failed to get store info:", error);
      storeInfo = null;
    }

    let checkoutUrl: string;
    if (storeInfo && storeInfo.domain) {
      checkoutUrl = `https://${storeInfo.domain}/cart.php?action=view&draft_order_id=${draftOrderId}`;
    } else {
      checkoutUrl = `https://store-${process.env.BIGCOMMERCE_STORE_HASH}.mybigcommerce.com/checkout?draft_order=${draftOrderId}`;
    }

    res.json({
      success: true,
      data: {
        checkout_url: checkoutUrl,
      },
    });
  } catch (error) {
    console.error("Get checkout URL error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to get checkout URL";
    res.status(500).json({ error: errorMessage });
  }
};
