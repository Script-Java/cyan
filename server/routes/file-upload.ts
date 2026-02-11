import { RequestHandler } from "express";
import { v2 as cloudinary } from "cloudinary";

interface UploadRequest {
  fileName: string;
  fileData: string;
  customerId?: number;
  orderId?: number;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const handleUploadCustomerDesign: RequestHandler = async (req, res) => {
  try {
    // SECURITY: Verify authentication
    const authenticatedCustomerId = (req as any).customerId;
    if (!authenticatedCustomerId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { fileName, fileData, customerId, orderId } =
      req.body as UploadRequest;

    if (!fileName || !fileData) {
      return res.status(400).json({
        error: "File name and file data are required",
      });
    }

    // SECURITY: Validate file type
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.svg', '.webp'];
    const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({ error: "Invalid file type. Allowed: JPG, PNG, GIF, PDF, SVG, WebP" });
    }

    const base64Data = fileData.includes("base64,")
      ? fileData.split("base64,")[1]
      : fileData;

    // SECURITY: Validate file size (10MB limit)
    const buffer = Buffer.from(base64Data, "base64");
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (buffer.length > maxSize) {
      return res.status(413).json({ error: "File size exceeds 10MB limit" });
    }

    // SECURITY: Sanitize filename to prevent path traversal
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // SECURITY: Use authenticated customer ID, ignore provided customerId
    const publicId = `customer-designs/${authenticatedCustomerId}/${Date.now()}-${sanitizedFileName.split(".")[0]}`;

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          folder: "customer-designs",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(buffer);
    });

    const uploadResult = result as any;

    res.json({
      success: true,
      file: {
        id: uploadResult.public_id,
        fileName,
        url: uploadResult.secure_url,
        cloudinaryUrl: uploadResult.url,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Upload file to Cloudinary error:", error);
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
