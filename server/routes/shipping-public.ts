import { RequestHandler } from "express";
import { supabase } from "../utils/supabase";

export const handleGetPublicShippingOptions: RequestHandler = async (
  _req,
  res,
) => {
  try {
    console.log("Fetching public shipping options from Supabase...");

    const { data: options, error } = await supabase
      .from("shipping_options")
      .select(
        "id, name, description, cost, processing_time_days, estimated_delivery_days_min, estimated_delivery_days_max",
      )
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase query error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log("Successfully fetched shipping options:", options?.length || 0);

    res.status(200).json({
      success: true,
      data: options || [],
    });
  } catch (error) {
    console.error("Failed to fetch public shipping options:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to fetch shipping options";
    res.status(500).json({ success: false, error: errorMessage });
  }
};
