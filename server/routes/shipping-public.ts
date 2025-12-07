import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || "",
);

export const handleGetPublicShippingOptions: RequestHandler = async (
  _req,
  res,
) => {
  try {
    const { data: options, error } = await supabase
      .from("shipping_options")
      .select("id, name, description, cost, processing_time_days, estimated_delivery_days_min, estimated_delivery_days_max")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: options || [],
    });
  } catch (error) {
    console.error("Failed to fetch public shipping options:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch shipping options";
    res.status(500).json({ success: false, error: errorMessage });
  }
};
