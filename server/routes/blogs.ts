import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  featured_image_url?: string;
  tags: string[];
  visibility: "visible" | "hidden";
}

// Get all published blogs (public)
export const handleGetPublishedBlogs: RequestHandler = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("visibility", "visible")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      blogs: data || [],
    });
  } catch (err) {
    console.error("Error fetching published blogs:", err);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

// Get single blog by ID (public)
export const handleGetBlogById: RequestHandler = async (req, res) => {
  try {
    const { blogId } = req.params;

    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("id", blogId)
      .single();

    if (error) throw error;

    if (!data || data.visibility !== "visible") {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Increment views
    await supabase
      .from("blogs")
      .update({ views: (data.views || 0) + 1 })
      .eq("id", blogId);

    res.json(data);
  } catch (err) {
    console.error("Error fetching blog:", err);
    res.status(500).json({ error: "Failed to fetch blog" });
  }
};

// Create blog (admin only)
export const handleCreateBlog: RequestHandler = async (req, res) => {
  try {
    const formData: BlogFormData = req.body;

    // Validate required fields
    if (!formData.title || !formData.content || !formData.excerpt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("blogs")
      .insert([
        {
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          author: formData.author || "Admin",
          featured_image_url: formData.featured_image_url,
          tags: formData.tags || [],
          visibility: formData.visibility || "hidden",
          views: 0,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ error: "Failed to create blog" });
  }
};

// Get all blogs (admin only)
export const handleGetAllBlogs: RequestHandler = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      blogs: data || [],
    });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

// Get single blog by ID (admin only - can see any status)
export const handleGetAdminBlogById: RequestHandler = async (req, res) => {
  try {
    const { blogId } = req.params;

    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("id", blogId)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json(data);
  } catch (err) {
    console.error("Error fetching blog:", err);
    res.status(500).json({ error: "Failed to fetch blog" });
  }
};

// Delete blog (admin only)
export const handleDeleteBlog: RequestHandler = async (req, res) => {
  try {
    const { blogId } = req.params;

    const { error } = await supabase
      .from("blogs")
      .delete()
      .eq("id", blogId);

    if (error) throw error;

    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).json({ error: "Failed to delete blog" });
  }
};

// Update blog (admin only)
export const handleUpdateBlog: RequestHandler = async (req, res) => {
  try {
    const { blogId } = req.params;
    const formData: Partial<BlogFormData> = req.body;

    const { data, error } = await supabase
      .from("blogs")
      .update({
        ...(formData.title && { title: formData.title }),
        ...(formData.content && { content: formData.content }),
        ...(formData.excerpt && { excerpt: formData.excerpt }),
        ...(formData.author && { author: formData.author }),
        ...(formData.featured_image_url && {
          featured_image_url: formData.featured_image_url,
        }),
        ...(formData.tags && { tags: formData.tags }),
        ...(formData.visibility && { visibility: formData.visibility }),
      })
      .eq("id", blogId)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(500).json({ error: "Failed to update blog" });
  }
};

// Upload image (admin only) - placeholder for now
export const handleUploadBlogImage: RequestHandler = async (req, res) => {
  try {
    // This is a placeholder. In production, you would upload to a storage service
    // For now, we'll just return a dummy URL
    const imageUrl = `https://via.placeholder.com/400x300?text=Blog+Image`;

    res.json({ imageUrl });
  } catch (err) {
    console.error("Error uploading image:", err);
    res.status(500).json({ error: "Failed to upload image" });
  }
};
