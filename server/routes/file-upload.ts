import { RequestHandler } from "express";
import { supabase } from "../utils/supabase";
import { randomUUID } from "crypto";

interface UploadRequest {
  fileName: string;
  fileData: string;
  customerId?: number;
  orderId?: number;
}

export const handleUploadCustomerDesign: RequestHandler = async (req, res) => {
  try {
    const { fileName, fileData, customerId, orderId } =
      req.body as UploadRequest;

    if (!fileName || !fileData) {
      return res.status(400).json({
        error: "File name and file data are required",
      });
    }

    const fileId = randomUUID();
    const fileExtension = fileName.split(".").pop() || "bin";
    const storagePath = `customer-designs/${customerId || "guest"}/${fileId}.${fileExtension}`;

    const base64Data = fileData.includes("base64,")
      ? fileData.split("base64,")[1]
      : fileData;
    const binaryData = Buffer.from(base64Data, "base64");

    const { data, error } = await supabase.storage
      .from("customer-uploads")
      .upload(storagePath, binaryData, {
        contentType: getContentType(fileExtension),
        upsert: false,
      });

    if (error) {
      console.error("Error uploading file to Supabase Storage:", error);
      return res.status(500).json({
        error: "Failed to upload file",
      });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("customer-uploads").getPublicUrl(storagePath);

    res.json({
      success: true,
      file: {
        id: fileId,
        fileName,
        url: publicUrl,
        path: storagePath,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Upload file error:", error);
    res.status(500).json({
      error: "Failed to upload file",
    });
  }
};

export const handleGetUploadedFile: RequestHandler = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        error: "File ID required",
      });
    }

    try {
      const resource = await cloudinary.api.resource(fileId);

      res.json({
        success: true,
        file: {
          id: resource.public_id,
          fileName: resource.filename || fileId,
          url: resource.secure_url,
          uploadedAt: resource.created_at,
        },
      });
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        return res.status(404).json({
          error: "File not found",
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Get file error:", error);
    res.status(500).json({
      error: "Failed to retrieve file",
    });
  }
};

export const handleDeleteUploadedFile: RequestHandler = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        error: "File ID required",
      });
    }

    await cloudinary.uploader.destroy(fileId);

    res.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({
      error: "Failed to delete file",
    });
  }
};
