import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
import { verifyToken, requireAdmin } from "../middleware/auth";

const router = Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// GET all gallery images (public)
router.get("/gallery", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    res.status(500).json({ error: "Failed to fetch gallery images" });
  }
});

// GET all gallery images (including inactive) - admin only
router.get("/gallery/admin/all", verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    res.status(500).json({ error: "Failed to fetch gallery images" });
  }
});

// POST - Create new gallery image
router.post("/gallery/admin", verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, description, image_url, image_alt, order_index } = req.body;

    if (!title || !image_url) {
      return res.status(400).json({ error: "Title and image_url are required" });
    }

    const { data, error } = await supabase
      .from("gallery_images")
      .insert([
        {
          title,
          description,
          image_url,
          image_alt,
          order_index: order_index || 0,
          is_active: true,
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data?.[0]);
  } catch (error) {
    console.error("Error creating gallery image:", error);
    res.status(500).json({ error: "Failed to create gallery image" });
  }
});

// PUT - Update gallery image
router.put("/gallery/admin/:id", verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, image_url, image_alt, order_index, is_active } =
      req.body;

    const { data, error } = await supabase
      .from("gallery_images")
      .update({
        title,
        description,
        image_url,
        image_alt,
        order_index,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Gallery image not found" });
    }

    res.json(data[0]);
  } catch (error) {
    console.error("Error updating gallery image:", error);
    res.status(500).json({ error: "Failed to update gallery image" });
  }
});

// DELETE - Remove gallery image
router.delete("/gallery/admin/:id", verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("gallery_images")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "Gallery image deleted successfully" });
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    res.status(500).json({ error: "Failed to delete gallery image" });
  }
});

// PATCH - Reorder gallery images
router.patch("/gallery/admin/reorder", verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { images } = req.body;

    if (!Array.isArray(images)) {
      return res.status(400).json({ error: "Images array is required" });
    }

    // Update each image's order_index
    const updates = images.map((img, index) => ({
      id: img.id,
      order_index: index,
    }));

    // Execute updates in sequence
    for (const update of updates) {
      const { error } = await supabase
        .from("gallery_images")
        .update({ order_index: update.order_index })
        .eq("id", update.id);

      if (error) throw error;
    }

    res.json({ message: "Gallery images reordered successfully" });
  } catch (error) {
    console.error("Error reordering gallery images:", error);
    res.status(500).json({ error: "Failed to reorder gallery images" });
  }
});

// POST - Upload gallery image to Cloudinary
router.post("/gallery/upload", verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Compress and optimize image
    const compressedBuffer = await sharp(file.buffer)
      .resize(1200, 800, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    const b64 = compressedBuffer.toString("base64");
    const dataURI = `data:image/jpeg;base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "sticky-slap/gallery",
      resource_type: "auto",
    });

    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error("Error uploading gallery image:", error);
    res.status(500).json({ error: "Failed to upload gallery image" });
  }
});

export default router;
