import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface LegalPageFormData {
  page_type: "privacy" | "terms" | "shipping" | "returns" | "legal" | "gdpr" | "ccpa";
  title: string;
  content: string;
  visibility: "visible" | "hidden";
}

// Get all published legal pages (public)
export const handleGetPublishedLegalPages: RequestHandler = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("legal_pages")
      .select("*")
      .eq("visibility", "visible")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      pages: data || [],
    });
  } catch (err) {
    console.error("Error fetching legal pages:", err);
    res.status(500).json({ error: "Failed to fetch legal pages" });
  }
};

// Get all legal pages (admin only)
export const handleGetAllLegalPages: RequestHandler = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("legal_pages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      pages: data || [],
    });
  } catch (err) {
    console.error("Error fetching legal pages:", err);
    res.status(500).json({ error: "Failed to fetch legal pages" });
  }
};

// Get legal page by type (public)
export const handleGetLegalPageByType: RequestHandler = async (req, res) => {
  try {
    const { pageType } = req.params;

    const validTypes = ["privacy", "terms", "shipping", "returns", "legal"];
    if (!validTypes.includes(pageType)) {
      return res.status(400).json({ error: "Invalid page type" });
    }

    const { data, error } = await supabase
      .from("legal_pages")
      .select("*")
      .eq("page_type", pageType)
      .eq("visibility", "visible")
      .single();

    if (error && error.code === "PGRST116") {
      return res.status(404).json({ error: "Page not found" });
    }

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Error fetching legal page:", err);
    res.status(500).json({ error: "Failed to fetch legal page" });
  }
};

// Get legal page by ID (admin only)
export const handleGetAdminLegalPageById: RequestHandler = async (req, res) => {
  try {
    const { pageId } = req.params;

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(pageId)) {
      return res.status(400).json({ error: "Invalid page ID format" });
    }

    const { data, error } = await supabase
      .from("legal_pages")
      .select("*")
      .eq("id", pageId)
      .single();

    if (error && error.code === "PGRST116") {
      return res.status(404).json({ error: "Page not found" });
    }

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Error fetching legal page:", err);
    res.status(500).json({ error: "Failed to fetch legal page" });
  }
};

// Create legal page (admin only)
export const handleCreateLegalPage: RequestHandler = async (req, res) => {
  try {
    const formData: LegalPageFormData = req.body;

    // Validate required fields
    if (!formData.page_type || !formData.title || !formData.content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const validTypes = ["privacy", "terms", "shipping", "returns", "legal"];
    if (!validTypes.includes(formData.page_type)) {
      return res.status(400).json({ error: "Invalid page type" });
    }

    // Check if page type already exists
    const { data: existingPage } = await supabase
      .from("legal_pages")
      .select("id")
      .eq("page_type", formData.page_type)
      .single();

    if (existingPage) {
      return res.status(400).json({
        error: `A ${formData.page_type} page already exists. Please edit the existing page instead.`,
      });
    }

    const { data, error } = await supabase
      .from("legal_pages")
      .insert([
        {
          page_type: formData.page_type,
          title: formData.title,
          content: formData.content,
          visibility: formData.visibility || "visible",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error("Error creating legal page:", err);
    res.status(500).json({ error: "Failed to create legal page" });
  }
};

// Update legal page (admin only)
export const handleUpdateLegalPage: RequestHandler = async (req, res) => {
  try {
    const { pageId } = req.params;
    const formData: Partial<LegalPageFormData> = req.body;

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(pageId)) {
      return res.status(400).json({ error: "Invalid page ID format" });
    }

    const { data, error } = await supabase
      .from("legal_pages")
      .update({
        ...(formData.title && { title: formData.title }),
        ...(formData.content && { content: formData.content }),
        ...(formData.visibility && { visibility: formData.visibility }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", pageId)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Error updating legal page:", err);
    res.status(500).json({ error: "Failed to update legal page" });
  }
};

// Delete legal page (admin only)
export const handleDeleteLegalPage: RequestHandler = async (req, res) => {
  try {
    const { pageId } = req.params;

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(pageId)) {
      return res.status(400).json({ error: "Invalid page ID format" });
    }

    const { error } = await supabase
      .from("legal_pages")
      .delete()
      .eq("id", pageId);

    if (error) throw error;

    res.json({ message: "Legal page deleted successfully" });
  } catch (err) {
    console.error("Error deleting legal page:", err);
    res.status(500).json({ error: "Failed to delete legal page" });
  }
};
