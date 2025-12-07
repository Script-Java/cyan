import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || "",
);

const ShippingOptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  cost: z.number().min(0, "Cost must be positive"),
  processing_time_days: z
    .number()
    .int()
    .min(0, "Processing time must be 0 or more"),
  estimated_delivery_days_min: z
    .number()
    .int()
    .min(1, "Min delivery days must be at least 1"),
  estimated_delivery_days_max: z
    .number()
    .int()
    .min(1, "Max delivery days must be at least 1"),
  is_active: z.boolean().optional(),
  display_order: z.number().int().optional(),
});

type ShippingOption = z.infer<typeof ShippingOptionSchema>;

export const handleGetShippingOptions: RequestHandler = async (_req, res) => {
  try {
    const { data: options, error } = await supabase
      .from("shipping_options")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: options || [],
    });
  } catch (error) {
    console.error("Failed to fetch shipping options:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to fetch shipping options";
    res.status(500).json({ success: false, error: errorMessage });
  }
};

export const handleGetShippingOption: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return res
        .status(400)
        .json({ error: "Invalid shipping option ID format" });
    }

    const { data: option, error } = await supabase
      .from("shipping_options")
      .select("*")
      .eq("id", parsedId)
      .single();

    if (error || !option) {
      return res.status(404).json({ error: "Shipping option not found" });
    }

    res.status(200).json({
      success: true,
      data: option,
    });
  } catch (error) {
    console.error("Failed to fetch shipping option:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to fetch shipping option";
    res.status(500).json({ success: false, error: errorMessage });
  }
};

export const handleCreateShippingOption: RequestHandler = async (req, res) => {
  try {
    const validationResult = ShippingOptionSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationResult.error.errors,
      });
    }

    const optionData = validationResult.data;

    // Validate that max >= min
    if (
      optionData.estimated_delivery_days_max <
      optionData.estimated_delivery_days_min
    ) {
      return res.status(400).json({
        error:
          "Max delivery days must be greater than or equal to min delivery days",
      });
    }

    const { data: option, error } = await supabase
      .from("shipping_options")
      .insert([optionData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: option,
    });
  } catch (error) {
    console.error("Failed to create shipping option:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to create shipping option";
    res.status(500).json({ success: false, error: errorMessage });
  }
};

export const handleUpdateShippingOption: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return res
        .status(400)
        .json({ error: "Invalid shipping option ID format" });
    }

    const validationResult = ShippingOptionSchema.partial().safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationResult.error.errors,
      });
    }

    const updateData = validationResult.data;

    // Validate that max >= min if both are provided
    if (
      updateData.estimated_delivery_days_max &&
      updateData.estimated_delivery_days_min &&
      updateData.estimated_delivery_days_max <
        updateData.estimated_delivery_days_min
    ) {
      return res.status(400).json({
        error:
          "Max delivery days must be greater than or equal to min delivery days",
      });
    }

    const { data: option, error } = await supabase
      .from("shipping_options")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsedId)
      .select()
      .single();

    if (error || !option) {
      return res.status(404).json({ error: "Shipping option not found" });
    }

    res.status(200).json({
      success: true,
      data: option,
    });
  } catch (error) {
    console.error("Failed to update shipping option:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to update shipping option";
    res.status(500).json({ success: false, error: errorMessage });
  }
};

export const handleDeleteShippingOption: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return res
        .status(400)
        .json({ error: "Invalid shipping option ID format" });
    }

    const { error } = await supabase
      .from("shipping_options")
      .delete()
      .eq("id", parsedId);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Shipping option deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete shipping option:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to delete shipping option";
    res.status(500).json({ success: false, error: errorMessage });
  }
};
