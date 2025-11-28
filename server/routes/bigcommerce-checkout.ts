import { RequestHandler } from "express";
import { bigCommerceAPI } from "../utils/bigcommerce";

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
 * Create a BigCommerce draft order and return checkout URL
 * Requires: customer_id (authenticated user)
 */
export const handleCreateBigCommerceCheckout: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;
    const checkoutData = req.body as CreateCheckoutRequest;

    // Use customer_id from token (if authenticated) or from request body (if guest)
    const userId = customerId || checkoutData.customer_id || null;

    if (!checkoutData.products || checkoutData.products.length === 0) {
      return res.status(400).json({ error: "No products in checkout" });
    }

    if (!checkoutData.billing_address || !checkoutData.shipping_addresses) {
      return res.status(400).json({ error: "Billing and shipping addresses required" });
    }

    // Get store info first to get the storefront URL
    let storeInfo: any;
    try {
      storeInfo = await bigCommerceAPI.getStoreInfo();
      console.log("Store info retrieved:", {
        name: storeInfo.name,
        url: storeInfo.domain,
      });
    } catch (storeError) {
      console.error("Failed to get store info:", storeError);
      // Continue with draft order creation even if store info fails
      storeInfo = null;
    }

    // Create draft order
    const draftOrderPayload: any = {
      line_items: checkoutData.products.map((product) => ({
        product_id: product.product_id,
        quantity: product.quantity,
        price_inc_tax: product.price_inc_tax,
      })),
      billing_address: {
        first_name: checkoutData.billing_address.first_name,
        last_name: checkoutData.billing_address.last_name,
        street_1: checkoutData.billing_address.street_1,
        street_2: checkoutData.billing_address.street_2 || "",
        city: checkoutData.billing_address.city,
        state_or_province: checkoutData.billing_address.state_or_province,
        postal_code: checkoutData.billing_address.postal_code,
        country_code: checkoutData.billing_address.country_code,
      },
      shipping_addresses: checkoutData.shipping_addresses.map((addr) => ({
        first_name: addr.first_name,
        last_name: addr.last_name,
        street_1: addr.street_1,
        street_2: addr.street_2 || "",
        city: addr.city,
        state_or_province: addr.state_or_province,
        postal_code: addr.postal_code,
        country_code: addr.country_code,
      })),
    };

    // Add customer_id if authenticated
    if (userId) {
      draftOrderPayload.customer_id = userId;
    } else if (checkoutData.customer_email) {
      // For guest checkout, add customer email so BigCommerce can track the order
      draftOrderPayload.customer_email = checkoutData.customer_email;
    }

    console.log("Creating draft order for customer:", userId || "guest");
    const draftOrder = await bigCommerceAPI.createDraftOrder(draftOrderPayload);

    if (!draftOrder || !draftOrder.id) {
      throw new Error("Failed to create draft order - no ID returned");
    }

    // Get the draft order's invoice URL (which is the checkout URL)
    let checkoutUrl: string;
    if (draftOrder.invoice_url) {
      checkoutUrl = draftOrder.invoice_url;
    } else if (storeInfo && storeInfo.domain) {
      // Fallback to construct checkout URL
      checkoutUrl = `https://${storeInfo.domain}/cart.php?action=view&draft_order_id=${draftOrder.id}`;
    } else {
      // Last resort - use store hash to construct URL
      // This might not work in all cases, but provides a fallback
      checkoutUrl = `https://store-${process.env.BIGCOMMERCE_STORE_HASH}.mybigcommerce.com/checkout?draft_order=${draftOrder.id}`;
    }

    console.log("Draft order created with checkout URL:", checkoutUrl);

    res.status(201).json({
      success: true,
      message: "Checkout initiated",
      data: {
        draft_order_id: draftOrder.id,
        checkout_url: checkoutUrl,
        customer_id: customerId,
      },
    });
  } catch (error) {
    console.error("BigCommerce checkout error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create BigCommerce checkout";
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Get BigCommerce checkout URL (for existing draft orders)
 */
export const handleGetBigCommerceCheckoutUrl: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;
    const { draftOrderId } = req.params;

    if (!customerId) {
      return res.status(401).json({ error: "Authentication required" });
    }

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
