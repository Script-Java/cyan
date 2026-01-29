import { RequestHandler } from "express";
import { supabase } from "../utils/supabase";
import cloudinary from "cloudinary";
import multer from "multer";
import { Readable } from "stream";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer middleware for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/x-pdf",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// Upload artwork to Cloudinary
export const handleUploadArtwork: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file provided",
      });
    }

    const { invoiceId } = req.params;

    // Verify invoice exists
    const { data: invoice } = await supabase
      .from("invoices")
      .select("id")
      .eq("id", invoiceId)
      .single();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      });
    }

    // Upload to Cloudinary with high quality settings
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          folder: "invoice-artwork",
          resource_type: "auto",
          quality: "auto:best", // Maximum quality
          flags: "preserve_transparency",
          format: req.file?.mimetype === "image/png" ? "png" : "jpg",
          fetch_format: "auto",
          secure: true,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Stream the file buffer to Cloudinary
      const bufferStream = Readable.from(Buffer.from(req.file!.buffer));
      bufferStream.pipe(uploadStream);
    });

    const cloudinaryResult: any = await uploadPromise;

    // Save artwork reference to database
    const { data: artwork, error: dbError } = await supabase
      .from("invoice_artwork")
      .insert({
        invoice_id: invoiceId,
        file_url: cloudinaryResult.secure_url,
        file_name: req.file.originalname,
        file_type: req.file.mimetype,
        file_size: req.file.size,
        cloudinary_public_id: cloudinaryResult.public_id,
      })
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    // Log activity
    await supabase.from("invoice_activity").insert({
      invoice_id: invoiceId,
      activity_type: "artwork_uploaded",
      description: `Artwork uploaded: ${req.file.originalname}`,
    });

    res.status(200).json({
      success: true,
      data: {
        id: artwork.id,
        file_url: artwork.file_url,
        file_name: artwork.file_name,
        cloudinary_public_id: artwork.cloudinary_public_id,
        uploaded_at: artwork.uploaded_at,
      },
    });
  } catch (error) {
    console.error("Upload artwork error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload artwork",
    });
  }
};

// Get artwork for invoice
export const handleGetArtwork: RequestHandler = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const { data, error } = await supabase
      .from("invoice_artwork")
      .select("*")
      .eq("invoice_id", invoiceId);

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Get artwork error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch artwork",
    });
  }
};

// Delete artwork
export const handleDeleteArtwork: RequestHandler = async (req, res) => {
  try {
    const { artworkId } = req.params;

    // Get artwork to get Cloudinary public ID
    const { data: artwork, error: fetchError } = await supabase
      .from("invoice_artwork")
      .select("cloudinary_public_id, invoice_id")
      .eq("id", artworkId)
      .single();

    if (fetchError || !artwork) {
      return res.status(404).json({
        success: false,
        error: "Artwork not found",
      });
    }

    // Delete from Cloudinary
    if (artwork.cloudinary_public_id) {
      try {
        await cloudinary.v2.uploader.destroy(artwork.cloudinary_public_id);
      } catch (cloudError) {
        console.error("Cloudinary delete error:", cloudError);
        // Continue anyway - the DB record still needs to be deleted
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("invoice_artwork")
      .delete()
      .eq("id", artworkId);

    if (deleteError) {
      throw deleteError;
    }

    // Log activity
    await supabase.from("invoice_activity").insert({
      invoice_id: artwork.invoice_id,
      activity_type: "artwork_deleted",
      description: "Artwork deleted",
    });

    res.status(200).json({
      success: true,
      message: "Artwork deleted successfully",
    });
  } catch (error) {
    console.error("Delete artwork error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete artwork",
    });
  }
};

export { upload as uploadMiddleware };
