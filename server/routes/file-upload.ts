import { RequestHandler } from "express";
import { supabase } from "../utils/supabase";
import { v4 as uuidv4 } from "crypto";

interface UploadRequest {
  fileName: string;
  fileData: string;
  customerId?: number;
  orderId?: number;
}

export const handleUploadCustomerDesign: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { fileName, fileData, customerId, orderId } = req.body as UploadRequest;

    if (!fileName || !fileData) {
      return res.status(400).json({
        error: "File name and file data are required",
      });
    }

    const fileId = uuidv4();
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
    const customerId = (req as any).customerId;

    if (!fileId) {
      return res.status(400).json({
        error: "File ID required",
      });
    }

    const { data, error } = await supabase.storage
      .from("customer-uploads")
      .list(`customer-designs/${customerId || "guest"}`);

    if (error) {
      console.error("Error listing files:", error);
      return res.status(500).json({
        error: "Failed to retrieve file",
      });
    }

    const file = data?.find((f) => f.name.includes(fileId));

    if (!file) {
      return res.status(404).json({
        error: "File not found",
      });
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("customer-uploads")
      .getPublicUrl(`customer-designs/${customerId || "guest"}/${file.name}`);

    res.json({
      success: true,
      file: {
        id: fileId,
        fileName: file.name,
        url: publicUrl,
        uploadedAt: file.created_at,
      },
    });
  } catch (error) {
    console.error("Get file error:", error);
    res.status(500).json({
      error: "Failed to retrieve file",
    });
  }
};

export const handleDeleteUploadedFile: RequestHandler = async (req, res) => {
  try {
    const { filePath } = req.body;
    const customerId = (req as any).customerId;

    if (!filePath) {
      return res.status(400).json({
        error: "File path required",
      });
    }

    const { error } = await supabase.storage
      .from("customer-uploads")
      .remove([filePath]);

    if (error) {
      console.error("Error deleting file:", error);
      return res.status(500).json({
        error: "Failed to delete file",
      });
    }

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

function getContentType(extension: string): string {
  const contentTypes: { [key: string]: string } = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    zip: "application/zip",
    txt: "text/plain",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };

  return contentTypes[extension.toLowerCase()] || "application/octet-stream";
}
