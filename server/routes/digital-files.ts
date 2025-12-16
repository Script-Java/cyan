import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import { ecwidAPI } from "../utils/ecwid";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || "",
);

/**
 * Upload a digital file to an order (Supabase or Ecwid)
 * Admin only - requires verifyToken
 * Supports both Supabase orders and Ecwid orders
 */
export const handleUploadDigitalFile: RequestHandler = async (req, res) => {
  try {
    const { orderId, fileName, fileUrl, fileType, fileSize, orderSource } = req.body;
    const adminId = (req as any).customerId;

    if (!orderId || !fileName || !fileUrl) {
      return res.status(400).json({
        error: "Order ID, file name, and file URL are required",
      });
    }

    // Determine order source (default to supabase for backward compatibility)
    const source = orderSource || "supabase";

    // Verify the order exists based on source
    if (source === "supabase") {
      const { data: order } = await supabase
        .from("orders")
        .select("id")
        .eq("id", orderId)
        .single();

      if (!order) {
        return res.status(404).json({ error: "Supabase order not found" });
      }
    } else if (source === "ecwid") {
      // For Ecwid orders, just verify it's a valid order ID (numeric)
      const orderIdNum = parseInt(orderId);
      if (isNaN(orderIdNum)) {
        return res.status(400).json({ error: "Invalid Ecwid order ID" });
      }
      try {
        const order = await ecwidAPI.getOrder(orderIdNum);
        if (!order) {
          return res.status(404).json({ error: "Ecwid order not found" });
        }
      } catch (ecwidError) {
        console.warn("Could not verify Ecwid order:", ecwidError);
        // Continue anyway - the order might exist but API call failed
        // The customer will get an error when trying to view the file if it doesn't exist
      }
    } else {
      return res.status(400).json({ error: "Invalid order source. Must be 'supabase' or 'ecwid'" });
    }

    // Insert digital file record
    // Note: Both Supabase and Ecwid order IDs are stored in order_id field
    // The lookup is done by order_id in the orders fetch logic
    const { data: digitalFile, error } = await supabase
      .from("digital_files")
      .insert({
        order_id: orderId,
        file_name: fileName,
        file_url: fileUrl,
        file_type: fileType,
        file_size: fileSize,
        uploaded_by: adminId,
      })
      .select()
      .single();

    if (error || !digitalFile) {
      console.error("Error uploading digital file:", error);
      return res.status(500).json({ error: "Failed to upload file" });
    }

    res.json({
      success: true,
      file: {
        id: digitalFile.id,
        file_name: digitalFile.file_name,
        file_url: digitalFile.file_url,
        file_type: digitalFile.file_type,
        file_size: digitalFile.file_size,
        uploaded_at: digitalFile.uploaded_at,
      },
    });
  } catch (error) {
    console.error("Upload digital file error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

/**
 * Get all digital files for an order
 * Customer can view their own order's files, admin can view any order's files
 */
export const handleGetOrderFiles: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    const customerId = (req as any).customerId;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID required" });
    }

    // Verify the customer owns the order or is admin
    const { data: order } = await supabase
      .from("orders")
      .select("customer_id")
      .eq("id", orderId)
      .single();

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.customer_id !== customerId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Get digital files
    const { data: files } = await supabase
      .from("digital_files")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    res.json({
      success: true,
      files: (files || []).map((file: any) => ({
        id: file.id,
        file_name: file.file_name,
        file_url: file.file_url,
        file_type: file.file_type,
        file_size: file.file_size,
        uploaded_at: file.uploaded_at,
      })),
    });
  } catch (error) {
    console.error("Get order files error:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

/**
 * Delete a digital file
 * Admin only
 */
export const handleDeleteDigitalFile: RequestHandler = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({ error: "File ID required" });
    }

    const { error } = await supabase
      .from("digital_files")
      .delete()
      .eq("id", fileId);

    if (error) {
      console.error("Error deleting digital file:", error);
      return res.status(500).json({ error: "Failed to delete file" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete digital file error:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
};
