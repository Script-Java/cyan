import { RequestHandler } from "express";
import { supabase } from "../utils/supabase";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import { validate } from "../schemas/validation";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Schema for design file upload requests
 * Validates file data format, size limits, and content type
 */
const UploadDesignRequestSchema = z.object({
  fileData: z.string().min(1, "File data is required"),
  fileName: z.string().min(1, "File name is required").max(255),
  fileType: z.string().optional(),
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
 * VALIDATION: Order ID parameter validated as positive integer
 */
export const handleGetOrderDesigns: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;
    const { orderId } = req.params;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // VALIDATION: Validate orderId is a positive integer
    const orderIdNum = parseInt(orderId, 10);
    if (isNaN(orderIdNum) || orderIdNum <= 0) {
      return res.status(400).json({
        error: "Request validation failed",
        details: [{ field: "orderId", message: "Order ID must be a positive integer" }],
      });
    }

    // Get the order and verify it belongs to the customer
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, customer_id, status, created_at")
      .eq("id", orderIdNum)
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
      .eq("order_id", orderIdNum)
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
 * Upload a design file to Cloudinary
 * Accepts base64-encoded file data and returns a secure cloud URL
 * Used during checkout to store customer artwork files
 *
 * VALIDATION: All request fields validated with Zod schemas
 * SECURITY NOTES:
 * - NEVER fallback to base64 data URLs when upload fails (prevents database bloat)
 * - File size limited to 50MB to prevent large payloads in database
 * - Cloudinary is required for file storage - no local fallback available
 */
export const handleUploadDesignFile: RequestHandler = async (req, res) => {
  try {
    // VALIDATION: Validate request body against schema
    const validationResult = await validate(UploadDesignRequestSchema, req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Request validation failed",
        details: validationResult.errors,
      });
    }

    const { fileData, fileName, fileType } = validationResult.data;

    // Validate file size (50MB max) BEFORE processing
    let buffer: Buffer;
    try {
      buffer = Buffer.from(fileData, "base64");
    } catch (e) {
      return res.status(400).json({
        error: "Request validation failed",
        details: [{ field: "fileData", message: "Invalid base64 file data" }],
      });
    }

    // Guard: Reject oversized files to prevent database bloat
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    if (buffer.length > MAX_FILE_SIZE) {
      console.warn("File size validation failed:", {
        fileName,
        attemptedSize: buffer.length,
        maxSize: MAX_FILE_SIZE,
      });
      return res.status(413).json({
        error: "Request validation failed",
        details: [
          {
            field: "fileData",
            message: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
          },
        ],
      });
    }

    // Validate Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.error("Cloudinary not configured - cannot process uploads");
      return res.status(503).json({
        error: "File upload service is temporarily unavailable",
      });
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const sanitizedFileName = fileName
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .substring(0, 100);
    const publicId = `sticker-designs/${timestamp}-${randomId}`;

    // Upload to Cloudinary (no fallback)
    try {
      const uploadResult = await new Promise<any>((resolve, reject) => {
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

      if (!uploadResult?.secure_url) {
        console.error("Cloudinary upload failed - no URL returned:", {
          fileName,
          publicId,
        });
        return res.status(502).json({
          error: "Failed to upload design file to cloud storage",
          details:
            process.env.NODE_ENV === "development"
              ? "Cloudinary did not return a valid URL"
              : undefined,
        });
      }

      console.log("Design file uploaded successfully to Cloudinary:", {
        fileName,
        publicId,
        url: uploadResult.secure_url,
        size: buffer.length,
      });

      // Success response
      res.status(200).json({
        success: true,
        fileUrl: uploadResult.secure_url,
        fileName: sanitizedFileName,
        size: buffer.length,
        uploadedAt: new Date().toISOString(),
      });
    } catch (uploadError) {
      // Log the error for debugging but don't expose internals
      console.error("Cloudinary upload error:", {
        fileName,
        error:
          uploadError instanceof Error
            ? uploadError.message
            : String(uploadError),
      });

      // Return error - NO fallback to base64 data URLs
      // Client must retry or handle the failure gracefully
      return res.status(502).json({
        error: "Failed to upload design file to cloud storage",
        details:
          process.env.NODE_ENV === "development"
            ? "Check that Cloudinary credentials are configured correctly"
            : undefined,
        code: "CLOUDINARY_UPLOAD_FAILED",
      });
    }
  } catch (error) {
    console.error("Upload design file error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to upload design";
    res.status(500).json({
      error: message,
      code: "DESIGN_UPLOAD_ERROR",
    });
  }
};
