import { RequestHandler } from "express";
import { bigCommerceAPI } from "../utils/bigcommerce";
import { getCustomerOrders, getOrderById } from "../utils/supabase";

/**
 * Get customer's orders
 * Primary: Supabase
 * Fallback: BigCommerce
 * Requires: customerId in JWT token
 */
export const handleGetOrders: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let orders: any[] = [];

    // Try Supabase first (PRIMARY)
    try {
      console.log("Fetching orders from Supabase for customer:", customerId);
      orders = await getCustomerOrders(customerId);

      // Format Supabase orders to match expected format
      const formattedOrders = orders.map((order) => ({
        id: order.id,
        customerId: order.customer_id,
        status: order.status || "paid",
        total: order.total,
        dateCreated: order.created_at,
        itemCount: order.order_items?.length || 0,
        source: "supabase",
      }));

      console.log("Fetched", formattedOrders.length, "orders from Supabase");

      return res.json({
        success: true,
        orders: formattedOrders,
        count: formattedOrders.length,
      });
    } catch (supabaseError) {
      console.error("Supabase fetch failed, trying BigCommerce...", supabaseError);
    }

    // Fallback to BigCommerce if Supabase fails
    try {
      const bcOrders = await bigCommerceAPI.getCustomerOrders(customerId);

      const ordersWithShipments = await Promise.all(
        bcOrders.map(async (order: any) => {
          let shipments = [];
          try {
            shipments = await bigCommerceAPI.getOrderShipments(order.id);
          } catch (e) {
            console.error("Failed to fetch shipments for order:", order.id);
          }

          return {
            id: order.id,
            customerId: order.customer_id,
            status: order.status,
            total: order.total_incl_tax || order.total,
            dateCreated: order.date_created,
            itemCount: order.items_count || 0,
            shipments: shipments.map((shipment: any) => ({
              id: shipment.id,
              status: shipment.status,
              dateCreated: shipment.date_created,
              trackingNumber: shipment.tracking_number,
              shippingProvider: shipment.shipping_provider,
              shippingMethod: shipment.shipping_method,
              comments: shipment.comments,
              itemsCount: shipment.items?.length || 0,
            })),
            source: "bigcommerce",
          };
        }),
      );

      console.log("Fetched", ordersWithShipments.length, "orders from BigCommerce");

      res.json({
        success: true,
        orders: ordersWithShipments,
        count: ordersWithShipments.length,
      });
    } catch (bcError) {
      console.error("BigCommerce fetch also failed:", bcError);
      throw bcError;
    }
  } catch (error) {
    console.error("Get orders error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch orders";
    res.status(500).json({ error: message });
  }
};

/**
 * Get single order details
 * Primary: Supabase
 * Fallback: BigCommerce
 * Requires: customerId in JWT token, orderId in params
 */
export const handleGetOrder: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;
    const { orderId } = req.params;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!orderId) {
      return res.status(400).json({ error: "Order ID required" });
    }

    // Try Supabase first
    try {
      const order = await getOrderById(parseInt(orderId), customerId);

      if (order) {
        return res.json({
          success: true,
          order: {
            id: order.id,
            customerId: order.customer_id,
            status: order.status,
            dateCreated: order.created_at,
            total: order.total,
            subtotal: order.subtotal,
            tax: order.tax,
            shipping: order.shipping,
            items: order.order_items || [],
            shippingAddress: order.shipping_address,
            billingAddress: order.billing_address,
            source: "supabase",
          },
        });
      }
    } catch (supabaseError) {
      console.error("Supabase fetch failed, trying BigCommerce...", supabaseError);
    }

    // Fallback to BigCommerce
    const order = await bigCommerceAPI.getOrder(parseInt(orderId));

    // Verify order belongs to customer
    if (order.customer_id !== customerId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Fetch shipments
    let shipments = [];
    try {
      shipments = await bigCommerceAPI.getOrderShipments(order.id);
    } catch (e) {
      console.error("Failed to fetch shipments:", e);
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        customerId: order.customer_id,
        status: order.status,
        dateCreated: order.date_created,
        total: order.total_incl_tax,
        subtotal: order.subtotal_ex_tax,
        tax: order.total_tax,
        items: order.items || [],
        shippingAddress: order.shipping_addresses?.[0],
        billingAddress: order.billing_address,
        shipments: shipments.map((shipment: any) => ({
          id: shipment.id,
          status: shipment.status,
          dateCreated: shipment.date_created,
          trackingNumber: shipment.tracking_number,
          shippingProvider: shipment.shipping_provider,
          shippingMethod: shipment.shipping_method,
          comments: shipment.comments,
          items: shipment.items || [],
        })),
        source: "bigcommerce",
      },
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

/**
 * Create a new order
 * Requires: customerId in JWT token
 */
export const handleCreateOrder: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { items, shippingAddress, billingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order items required" });
    }

    // Build order payload
    const orderPayload = {
      customer_id: customerId,
      line_items: items.map((item: any) => ({
        product_id: item.productId,
        quantity: item.quantity,
        custom_fields: item.customFields || [],
      })),
      shipping_addresses: shippingAddress ? [shippingAddress] : undefined,
      billing_address: billingAddress,
    };

    const newOrder = await bigCommerceAPI.createOrder(orderPayload);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        id: newOrder.id,
        customerId: newOrder.customer_id,
        status: newOrder.status,
        total: newOrder.total_incl_tax,
        dateCreated: newOrder.date_created,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create order";
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Get order by ID (admin/internal use)
 */
export const handleAdminGetOrder: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID required" });
    }

    const order = await bigCommerceAPI.getOrder(parseInt(orderId));

    res.json({
      success: true,
      order: {
        id: order.id,
        customerId: order.customer_id,
        status: order.status,
        dateCreated: order.date_created,
        total: order.total_incl_tax,
        items: order.items || [],
      },
    });
  } catch (error) {
    console.error("Admin get order error:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};
