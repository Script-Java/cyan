import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || "",
);

// Validation schema for creating/updating discount codes
const DiscountCodeSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(50, "Code must be at most 50 characters")
    .transform((val) => val.toUpperCase()),
  description: z.string().optional().or(z.null()),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.number().positive("Discount value must be positive"),
  min_order_value: z
    .number()
    .nonnegative("Min order value must be non-negative")
    .optional()
    .default(0),
  max_uses: z
    .number()
    .int()
    .positive("Max uses must be positive")
    .optional()
    .or(z.null()),
  is_active: z.boolean().optional().default(true),
  expires_at: z
    .string()
    .datetime()
    .optional()
    .or(z.null()),
});

type DiscountCode = z.infer<typeof DiscountCodeSchema>;

// Get all discount codes (admin only)
export const handleGetDiscountCodes: RequestHandler = async (_req, res) => {
  try {
    const { data: codes, error } = await supabase
      .from("discount_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: codes || [],
    });
  } catch (error) {
    console.error("Failed to fetch discount codes:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch discount codes";
    res.status(500).json({ success: false, error: errorMessage });
  }
};

// Get single discount code (admin only)
export const handleGetDiscountCode: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "Invalid discount code ID" });
    }

    const { data: code, error } = await supabase
      .from("discount_codes")
      .select("*")
      .eq("id", parsedId)
      .single();

    if (error || !code) {
      return res.status(404).json({ error: "Discount code not found" });
    }

    res.status(200).json({
      success: true,
      data: code,
    });
  } catch (error) {
    console.error("Failed to fetch discount code:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch discount code";
    res.status(500).json({ success: false, error: errorMessage });
  }
};

// Create discount code (admin only)
export const handleCreateDiscountCode: RequestHandler = async (req, res) => {
  try {
    const validationResult = DiscountCodeSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationResult.error.errors,
      });
    }

    const codeData = validationResult.data;

    // Check if code already exists
    const { data: existingCode } = await supabase
      .from("discount_codes")
      .select("id")
      .eq("code", codeData.code)
      .single();

    if (existingCode) {
      return res.status(409).json({ error: "Discount code already exists" });
    }

    const { data: newCode, error } = await supabase
      .from("discount_codes")
      .insert([codeData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: newCode,
    });
  } catch (error) {
    console.error("Failed to create discount code:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create discount code";
    res.status(500).json({ success: false, error: errorMessage });
  }
};

// Update discount code (admin only)
export const handleUpdateDiscountCode: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "Invalid discount code ID" });
    }

    const validationResult = DiscountCodeSchema.partial().safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationResult.error.errors,
      });
    }

    const updates = validationResult.data;

    // Check if updating code and if new code already exists
    if (updates.code) {
      const { data: existingCode } = await supabase
        .from("discount_codes")
        .select("id")
        .eq("code", updates.code)
        .neq("id", parsedId)
        .single();

      if (existingCode) {
        return res.status(409).json({ error: "Discount code already exists" });
      }
    }

    const { data: updatedCode, error } = await supabase
      .from("discount_codes")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsedId)
      .select()
      .single();

    if (error || !updatedCode) {
      return res.status(404).json({ error: "Discount code not found" });
    }

    res.status(200).json({
      success: true,
      data: updatedCode,
    });
  } catch (error) {
    console.error("Failed to update discount code:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update discount code";
    res.status(500).json({ success: false, error: errorMessage });
  }
};

// Delete discount code (admin only)
export const handleDeleteDiscountCode: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "Invalid discount code ID" });
    }

    const { error } = await supabase
      .from("discount_codes")
      .delete()
      .eq("id", parsedId);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Discount code deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete discount code:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete discount code";
    res.status(500).json({ success: false, error: errorMessage });
  }
};

// Validate discount code for checkout (public endpoint)
export const handleValidateDiscountCode: RequestHandler = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Discount code is required" });
    }

    if (orderTotal === undefined || orderTotal === null) {
      return res.status(400).json({ error: "Order total is required" });
    }

    const upperCode = code.toUpperCase();

    // Fetch the discount code
    const { data: discountCode, error } = await supabase
      .from("discount_codes")
      .select("*")
      .eq("code", upperCode)
      .eq("is_active", true)
      .single();

    if (error || !discountCode) {
      return res.status(400).json({ error: "Invalid discount code" });
    }

    // Check if code has expired
    if (
      discountCode.expires_at &&
      new Date(discountCode.expires_at) < new Date()
    ) {
      return res.status(400).json({ error: "Discount code has expired" });
    }

    // Check if max uses reached
    if (
      discountCode.max_uses !== null &&
      discountCode.used_count >= discountCode.max_uses
    ) {
      return res.status(400).json({ error: "Discount code usage limit reached" });
    }

    // Check minimum order value
    if (orderTotal < discountCode.min_order_value) {
      return res.status(400).json({
        error: `Order total must be at least $${discountCode.min_order_value.toFixed(2)} to use this discount`,
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discountCode.discount_type === "percentage") {
      discountAmount = (orderTotal * discountCode.discount_value) / 100;
    } else {
      discountAmount = discountCode.discount_value;
    }

    // Cap discount at order total
    discountAmount = Math.min(discountAmount, orderTotal);

    res.status(200).json({
      success: true,
      discount: {
        code: discountCode.code,
        type: discountCode.discount_type,
        value: discountCode.discount_value,
        amount: parseFloat(discountAmount.toFixed(2)),
        description: discountCode.description,
      },
    });
  } catch (error) {
    console.error("Failed to validate discount code:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to validate discount code";
    res.status(500).json({ success: false, error: errorMessage });
  }
};

// Apply discount code to order (increment used_count)
export const handleApplyDiscountCode: RequestHandler = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Discount code is required" });
    }

    const upperCode = code.toUpperCase();

    // Get the discount code
    const { data: discountCode, error: selectError } = await supabase
      .from("discount_codes")
      .select("*")
      .eq("code", upperCode)
      .single();

    if (selectError || !discountCode) {
      return res.status(400).json({ error: "Invalid discount code" });
    }

    // Increment used count
    const { data: updatedCode, error: updateError } = await supabase
      .from("discount_codes")
      .update({ used_count: discountCode.used_count + 1 })
      .eq("id", discountCode.id)
      .select()
      .single();

    if (updateError || !updatedCode) {
      throw updateError || new Error("Failed to update discount code");
    }

    res.status(200).json({
      success: true,
      message: "Discount code applied successfully",
    });
  } catch (error) {
    console.error("Failed to apply discount code:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to apply discount code";
    res.status(500).json({ success: false, error: errorMessage });
  }
};
