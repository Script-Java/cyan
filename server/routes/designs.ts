import { RequestHandler } from "express";
import { ecwidAPI } from "../utils/ecwid";

interface OrderDesign {
  orderId: number;
  orderDate: string;
  orderStatus: string;
  designs: Array<{
    id: string;
    name: string;
    url?: string;
    description?: string;
    type: string;
    size?: string;
    createdAt?: string;
  }>;
}

/**
 * Get all designs from customer's orders
 * Requires: customerId in JWT token
 */
export const handleGetDesigns: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get all customer orders from Ecwid
    const orders = await ecwidAPI.getCustomerOrders(customerId);

    // Extract designs from orders
    const designsByOrder: OrderDesign[] = [];

    for (const order of orders) {
      const designs: OrderDesign["designs"] = [];

      // Get detailed order information
      const orderDetails = await ecwidAPI.getOrder(order.id);

      if (orderDetails && orderDetails.items && Array.isArray(orderDetails.items)) {
        // Check each item for design-related information
        for (const item of orderDetails.items) {
          // Check for design attributes or fields
          if (item.attributes && Array.isArray(item.attributes)) {
            for (const attr of item.attributes) {
              // Look for design-related attributes
              if (
                attr.name &&
                (attr.name.toLowerCase().includes("design") ||
                  attr.name.toLowerCase().includes("file") ||
                  attr.name.toLowerCase().includes("artwork"))
              ) {
                designs.push({
                  id: `${order.id}-${item.id}-${attr.id || attr.name}`,
                  name: attr.name || "Design File",
                  description: `From order #${order.id}`,
                  type: attr.name || "design",
                  url: attr.value?.startsWith("http")
                    ? attr.value
                    : undefined,
                  createdAt: order.createDate,
                });
              }
            }
          }

          // Also check product name for design info
          if (item.productName) {
            designs.push({
              id: `${order.id}-${item.id}`,
              name: item.productName,
              description: `Design from order #${order.id}`,
              type: "product",
              createdAt: order.createDate,
              size: item.quantity ? `Qty: ${item.quantity}` : undefined,
            });
          }
        }
      }

      if (designs.length > 0) {
        designsByOrder.push({
          orderId: order.id,
          orderDate: order.createDate,
          orderStatus: order.fulfillmentStatus || order.paymentStatus || "processing",
          designs,
        });
      }
    }

    res.json({
      success: true,
      designs: designsByOrder,
      totalOrders: orders.length,
      ordersWithDesigns: designsByOrder.length,
    });
  } catch (error) {
    console.error("Get designs error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch designs";
    res.status(500).json({ error: message });
  }
};

/**
 * Get designs for a specific order
 * Requires: customerId in JWT token, orderId in params
 */
export const handleGetOrderDesigns: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;
    const { orderId } = req.params;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!orderId) {
      return res.status(400).json({ error: "Order ID required" });
    }

    const order = await bigCommerceAPI.getOrder(parseInt(orderId));

    // Verify order belongs to customer
    if (order.customer_id !== customerId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const designs: OrderDesign["designs"] = [];

    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        if (item.custom_fields && Array.isArray(item.custom_fields)) {
          for (const field of item.custom_fields) {
            if (
              field.name &&
              (field.name.toLowerCase().includes("design") ||
                field.name.toLowerCase().includes("file") ||
                field.name.toLowerCase().includes("artwork"))
            ) {
              designs.push({
                id: `${order.id}-${item.id}-${field.id || field.name}`,
                name: field.name || "Design File",
                description: field.value?.substring(0, 100),
                type: field.name || "design",
                url: field.value?.startsWith("http") ? field.value : undefined,
                createdAt: order.date_created,
              });
            }
          }
        }

        if (item.product_name) {
          designs.push({
            id: `${order.id}-${item.id}`,
            name: item.product_name,
            description: `Design product from order`,
            type: "product",
            createdAt: order.date_created,
          });
        }
      }
    }

    res.json({
      success: true,
      orderId: order.id,
      orderDate: order.date_created,
      orderStatus: order.status,
      designs,
    });
  } catch (error) {
    console.error("Get order designs error:", error);
    res.status(500).json({ error: "Failed to fetch order designs" });
  }
};
