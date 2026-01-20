import { RequestHandler } from "express";
import { supabase } from "../utils/supabase";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
 * Get all designs from customer's orders stored in Supabase
 * Requires: customerId in JWT token
 */
export const handleGetDesigns: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get all orders for the customer from Supabase
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, customer_id, status, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Failed to fetch orders from Supabase:", ordersError);
      return res.status(500).json({ error: "Failed to fetch orders" });
    }

    if (!orders || orders.length === 0) {
      return res.json({
        success: true,
        designs: [],
        totalOrders: 0,
        ordersWithDesigns: 0,
      });
    }

    const orderIds = orders.map((o) => o.id);

    // Fetch both order items with designs and proofs in parallel
    const [
      { data: orderItems, error: itemsError },
      { data: proofs, error: proofsError },
    ] = await Promise.all([
      supabase
        .from("order_items")
        .select(
          "id, order_id, product_name, design_file_url, quantity, created_at",
        )
        .in("order_id", orderIds)
        .not("design_file_url", "is", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("proofs")
        .select(
          "id, order_id, file_url, file_name, description, status, created_at",
        )
        .eq("customer_id", customerId)
        .not("file_url", "is", null)
        .order("created_at", { ascending: false }),
    ]);

    if (itemsError) {
      console.error("Failed to fetch order items from Supabase:", itemsError);
      return res.status(500).json({ error: "Failed to fetch designs" });
    }

    if (proofsError) {
      console.error("Failed to fetch proofs from Supabase:", proofsError);
      return res.status(500).json({ error: "Failed to fetch proofs" });
    }

    // Group designs by order
    const designsByOrder: OrderDesign[] = [];
    const ordersWithDesigns = new Set<number>();

    // Add order items (uploaded designs)
    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        const order = orders.find((o) => o.id === item.order_id);
        if (!order) continue;

        ordersWithDesigns.add(item.order_id);

        // Find or create the order design group
        let orderDesignGroup = designsByOrder.find(
          (og) => og.orderId === item.order_id,
        );
        if (!orderDesignGroup) {
          orderDesignGroup = {
            orderId: item.order_id,
            orderDate: order.created_at || new Date().toISOString(),
            orderStatus: order.status || "processing",
            designs: [],
          };
          designsByOrder.push(orderDesignGroup);
        }

        // Add design to the order group
        if (item.design_file_url) {
          orderDesignGroup.designs.push({
            id: `${item.order_id}-${item.id}`,
            name: item.product_name || "Design File",
            url: item.design_file_url,
            description: `Design from order #${item.order_id}`,
            type: "design",
            size: item.quantity ? `Qty: ${item.quantity}` : undefined,
            createdAt: item.created_at || order.created_at,
          });
        }
      }
    }

    // Add proofs (design approvals)
    if (proofs && proofs.length > 0) {
      for (const proof of proofs) {
        const order = orders.find((o) => o.id === proof.order_id);
        if (!order) continue;

        ordersWithDesigns.add(proof.order_id);

        // Find or create the order design group
        let orderDesignGroup = designsByOrder.find(
          (og) => og.orderId === proof.order_id,
        );
        if (!orderDesignGroup) {
          orderDesignGroup = {
            orderId: proof.order_id,
            orderDate: order.created_at || new Date().toISOString(),
            orderStatus: order.status || "processing",
            designs: [],
          };
          designsByOrder.push(orderDesignGroup);
        }

        // Add proof to the order group
        if (proof.file_url) {
          const isDenied = proof.status === "denied";
          orderDesignGroup.designs.push({
            id: `proof-${proof.id}`,
            name: proof.file_name || "Design Proof",
            url: proof.file_url,
            description: proof.description || "Design proof for approval",
            type: isDenied ? "proof_denied" : "proof",
            createdAt: proof.created_at || order.created_at,
            approved: proof.status === "approved",
          });
        }
      }
    }

    // Sort orders by date
    designsByOrder.sort(
      (a, b) =>
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
    );

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
 * Get designs for a specific order from Supabase
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

    // Get the order and verify it belongs to the customer
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, customer_id, status, created_at")
      .eq("id", parseInt(orderId))
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Verify order belongs to customer
    if (order.customer_id !== customerId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Get all order items with design files for this order
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("id, product_name, design_file_url, quantity, created_at")
      .eq("order_id", parseInt(orderId))
      .not("design_file_url", "is", null);

    if (itemsError) {
      console.error("Failed to fetch order items:", itemsError);
      return res.status(500).json({ error: "Failed to fetch designs" });
    }

    const designs: OrderDesign["designs"] = [];

    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        if (item.design_file_url) {
          designs.push({
            id: `${order.id}-${item.id}`,
            name: item.product_name || "Design File",
            url: item.design_file_url,
            description: `Design from order #${order.id}`,
            type: "design",
            size: item.quantity ? `Qty: ${item.quantity}` : undefined,
            createdAt: item.created_at || order.created_at,
          });
        }
      }
    }

    res.json({
      success: true,
      orderId: order.id,
      orderDate: order.created_at || new Date().toISOString(),
      orderStatus: order.status || "processing",
      designs,
    });
  } catch (error) {
    console.error("Get order designs error:", error);
    res.status(500).json({ error: "Failed to fetch order designs" });
  }
};

/**
 * Upload a design file to Supabase Storage
 * Accepts base64-encoded file data and returns a public URL
 * Used during checkout to store customer artwork files
 */
export const handleUploadDesignFile: RequestHandler = async (req, res) => {
  try {
    const { fileData, fileName, fileType } = req.body;

    if (!fileData || !fileName) {
      return res.status(400).json({
        error: "File data and file name are required",
      });
    }

    // Validate file size (50MB max)
    const buffer = Buffer.from(fileData, "base64");
    if (buffer.length > 50 * 1024 * 1024) {
      return res.status(400).json({
        error: "File size exceeds 50MB limit",
      });
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const sanitizedFileName = fileName
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .substring(0, 100);
    const publicId = `sticker-designs/${timestamp}-${randomId}`;

    // Upload to Cloudinary
    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            resource_type: "auto",
            folder: "sticker-designs",
            tags: ["design-upload", "customer"],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        stream.end(buffer);
      });

      const result = uploadResult as any;

      if (!result?.secure_url) {
        return res.status(500).json({
          error: "Failed to upload design file to cloud storage",
        });
      }

      console.log("Design file uploaded successfully to Cloudinary:", {
        fileName,
        publicId,
        url: result.secure_url,
      });

      res.json({
        success: true,
        fileUrl: result.secure_url,
        fileName: sanitizedFileName,
        size: buffer.length,
        uploadedAt: new Date().toISOString(),
      });
    } catch (uploadError) {
      console.error("Error uploading to Cloudinary:", uploadError);
      // If Cloudinary upload fails, return the base64 data URL as fallback
      const dataUrl = `data:${fileType || "image/png"};base64,${fileData}`;
      console.warn(
        "Falling back to base64 data URL for design file (Cloudinary upload failed)",
      );
      return res.json({
        success: true,
        fileUrl: dataUrl,
        fileName: sanitizedFileName,
        size: buffer.length,
        uploadedAt: new Date().toISOString(),
        warning: "File stored locally, not in cloud storage",
      });
    }
  } catch (error) {
    console.error("Upload design file error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to upload design";
    res.status(500).json({ error: message });
  }
};
