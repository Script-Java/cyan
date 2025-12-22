import { RequestHandler } from "express";
import { supabase } from "../utils/supabase";

interface PolicyContent {
  guarantee_days: number;
  return_conditions: string[];
  how_to_return: string[];
  defective_items_days: number;
  refund_timeline: string;
  non_returnable_items: string[];
  contact_email: string;
  full_policy: string;
}

const DEFAULT_POLICY: PolicyContent = {
  guarantee_days: 30,
  return_conditions: [
    "Stickers must be unused and in original condition",
    "Original packaging must be intact",
    "Proof of purchase (order number) is required",
    "Return shipping is the customer's responsibility",
  ],
  how_to_return: [
    "Contact our support team at support@stickyhub.com with your order number",
    "Provide a reason for your return request",
    "We'll review your request and provide return shipping instructions",
    "Ship the item back to us using the provided address",
    "Once received and inspected, we'll process your refund (5-7 business days)",
  ],
  defective_items_days: 7,
  refund_timeline: "5-7 business days after we receive and inspect your return",
  non_returnable_items: [
    "Used, applied, or partially used stickers",
    "Items without original packaging",
    "Items returned after 30 days",
    "Wholesale or bulk orders (special terms apply)",
  ],
  contact_email: "support@stickyhub.com",
  full_policy: "",
};

// GET policy
export const getReturnRefundPolicy: RequestHandler = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("return_refund_policies")
      .select("*")
      .eq("id", "default")
      .single();

    // Table doesn't exist yet or no data found - return default
    if (error || !data) {
      return res.json({ policy: DEFAULT_POLICY });
    }

    res.json({ policy: data?.content || DEFAULT_POLICY });
  } catch (error) {
    console.error("Error fetching return/refund policy:", error);
    // Return default policy instead of erroring out
    res.json({ policy: DEFAULT_POLICY });
  }
};

// POST/UPDATE policy (admin only)
export const updateReturnRefundPolicy: RequestHandler = async (req, res) => {
  try {
    const policy: PolicyContent = req.body;

    // Validate policy content
    if (!policy.guarantee_days || !policy.contact_email) {
      return res.status(400).json({
        error: "Invalid policy",
        message: "Guarantee days and contact email are required",
      });
    }

    const { data, error: upsertError } = await supabase
      .from("return_refund_policies")
      .upsert(
        {
          id: "default",
          content: policy,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .select()
      .single();

    if (upsertError) throw upsertError;

    res.json({
      success: true,
      message: "Policy updated successfully",
      policy: data?.content,
    });
  } catch (error) {
    console.error("Error updating return/refund policy:", error);
    res.status(500).json({
      error: "Failed to update policy",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
