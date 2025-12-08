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
    const { fileName, fileData, customerId, orderId } =
      req.body as UploadRequest;

    if (!fileName || !fileData) {
      return res.status(400).json({
        error: "File name and file data are required",
      });
    }

    const base64Data = fileData.includes("base64,")
      ? fileData.split("base64,")[1]
      : fileData;

    const buffer = Buffer.from(base64Data, "base64");

    const publicId = `customer-designs/${customerId || "guest"}/${Date.now()}-${fileName.split(".")[0]}`;

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
