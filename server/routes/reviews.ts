import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";
import { processImage } from "../utils/image-processor";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface ReviewData {
  product_id: string;
  reviewer_name: string;
  reviewer_email: string;
  rating: number;
  title?: string;
  comment?: string;
  image_base64?: string[];
}

/**
 * Submit a new product review with optional images
 * Allows guest submissions
 */
export const handleSubmitReview: RequestHandler = async (req, res) => {
  try {
    const {
      product_id,
      reviewer_name,
      reviewer_email,
      rating,
      title,
      comment,
      images,
    } = req.body as ReviewData & { images?: string[] };

    // Validation
    if (!product_id || !reviewer_name || !reviewer_email || !rating) {
      return res.status(400).json({
        error:
          "Missing required fields: product_id, reviewer_name, reviewer_email, rating",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reviewer_email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // Validate image sizes (max 15MB each)
    const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
    if (images && Array.isArray(images)) {
      for (const imageBase64 of images) {
        // Rough estimate: Base64 is ~33% larger than binary, so divide by 1.33
        const estimatedSize = (imageBase64.split(",")[1]?.length || 0) * 0.75;
        if (estimatedSize > MAX_IMAGE_SIZE) {
          return res.status(400).json({
            error: `Image size exceeds 15MB limit`,
          });
        }
      }
    }

    // Upload images to Cloudinary if provided
    const image_urls: string[] = [];
    if (images && Array.isArray(images) && images.length > 0) {
      for (const imageBase64 of images.slice(0, 3)) {
        // Max 3 images per review
        try {
          // If it's already a full data URI, use it; otherwise construct it
          const dataUri = imageBase64.startsWith("data:")
            ? imageBase64
            : `data:image/jpeg;base64,${imageBase64}`;

          // Compress image before uploading
          const buffer = Buffer.from(
            dataUri.split(",")[1] || imageBase64,
            "base64",
          );
          const compressedBuffer = await processImage(buffer, 600, 600);
          const compressedDataUri = `data:image/jpeg;base64,${compressedBuffer.toString("base64")}`;

          const result = await cloudinary.uploader.upload(compressedDataUri, {
            folder: "sticky-slap/reviews",
            resource_type: "auto",
            quality: "auto",
          });

          image_urls.push(result.secure_url);
        } catch (imageError) {
          console.error("Error uploading review image:", imageError);
          // Continue without this image if upload fails
        }
      }
    }

    // Insert review into Supabase
    const { data, error } = await supabase
      .from("product_reviews")
      .insert([
        {
          product_id,
          reviewer_name: reviewer_name.trim(),
          reviewer_email: reviewer_email.toLowerCase().trim(),
          rating,
          title: title?.trim() || null,
          comment: comment?.trim() || null,
          image_urls: image_urls,
          status: "pending", // Require moderation
        },
      ])
      .select();

    if (error) {
      console.error("Database error inserting review:", error);
      return res.status(500).json({ error: "Failed to submit review" });
    }

    res.status(201).json({
      success: true,
      message: "Review submitted successfully and pending approval",
      review: data?.[0] || {},
    });
  } catch (err) {
    console.error("Error submitting review:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
};

/**
 * Get all approved reviews for a product (public endpoint)
 */
export const handleGetProductReviews: RequestHandler = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const { data, error } = await supabase
      .from("product_reviews")
      .select(
        "id, product_id, reviewer_name, rating, title, comment, image_urls, helpful_count, created_at",
      )
      .eq("product_id", productId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      return res.status(500).json({ error: "Failed to fetch reviews" });
    }

    // Calculate average rating
    const reviews = data || [];
    const averageRating =
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1)
        : 0;

    res.json({
      success: true,
      reviews,
      averageRating,
      totalReviews: reviews.length,
    });
  } catch (err) {
    console.error("Error getting product reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

/**
 * Mark a review as helpful (increment helpful count)
 */
export const handleMarkReviewHelpful: RequestHandler = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!reviewId) {
      return res.status(400).json({ error: "Review ID is required" });
    }

    const id = parseInt(reviewId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid review ID format" });
    }

    const { data, error } = await supabase
      .from("product_reviews")
      .update({ helpful_count: supabase.rpc("increment_helpful") })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error marking review as helpful:", error);
      return res
        .status(500)
        .json({ error: "Failed to mark review as helpful" });
    }

    res.json({ success: true, review: data?.[0] || {} });
  } catch (err) {
    console.error("Error marking review as helpful:", err);
    res.status(500).json({ error: "Failed to mark review as helpful" });
  }
};

/**
 * Admin: Get all reviews (approved and pending) for moderation
 */
export const handleGetAdminReviews: RequestHandler = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("product_reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching admin reviews:", error);
      return res.status(500).json({ error: "Failed to fetch reviews" });
    }

    res.json({
      success: true,
      reviews: data || [],
    });
  } catch (err) {
    console.error("Error getting admin reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

/**
 * Admin: Approve or reject a review
 */
export const handleUpdateReviewStatus: RequestHandler = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    if (!reviewId || !status) {
      return res.status(400).json({
        error: "Review ID and status are required",
      });
    }

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Must be 'approved', 'rejected', or 'pending'",
      });
    }

    const id = parseInt(reviewId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid review ID format" });
    }

    const { data, error } = await supabase
      .from("product_reviews")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating review status:", error);
      return res.status(500).json({ error: "Failed to update review" });
    }

    res.json({ success: true, review: data?.[0] || {} });
  } catch (err) {
    console.error("Error updating review status:", err);
    res.status(500).json({ error: "Failed to update review" });
  }
};

/**
 * Admin: Delete a review
 */
export const handleDeleteReview: RequestHandler = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!reviewId) {
      return res.status(400).json({ error: "Review ID is required" });
    }

    const id = parseInt(reviewId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid review ID format" });
    }

    const { error } = await supabase
      .from("product_reviews")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting review:", error);
      return res.status(500).json({ error: "Failed to delete review" });
    }

    res.json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ error: "Failed to delete review" });
  }
};
