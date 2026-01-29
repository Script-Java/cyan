import { RequestHandler } from "express";
import { supabase } from "../utils/supabase";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

// Types
interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  company?: string;
  billing_address?: any;
  invoice_type: "Standard" | "ArtworkUpload";
  status: "Draft" | "Sent" | "Unpaid" | "Paid" | "Overdue" | "Canceled";
  issue_date: string;
  due_date: string;
  notes?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  shipping: number;
  discount_amount: number;
  discount_type?: "fixed" | "percentage";
  total: number;
  sent_date?: string;
  paid_date?: string;
  canceled_date?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

interface LineItem {
  item_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  tax_enabled?: boolean;
}

// Helper: Generate invoice number
const generateInvoiceNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  
  // Get count of invoices this month
  const { data, error } = await supabase
    .from("invoices")
    .select("id", { count: "exact" })
    .gte("created_at", `${year}-${month}-01`)
    .lte("created_at", `${year}-${month}-31`);
  
  const count = (data?.length || 0) + 1;
  return `INV-${year}${month}-${String(count).padStart(4, "0")}`;
};

// Helper: Generate token for customer payment link
const generateInvoiceToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

// Get all invoices (admin)
export const handleGetInvoices: RequestHandler = async (req, res) => {
  try {
    const { status, type, search, sort_by, sort_order } = req.query;

    let query = supabase
      .from("invoices")
      .select("*, invoice_line_items(*)");

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (type) {
      query = query.eq("invoice_type", type);
    }
    if (search) {
      query = query.or(
        `customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,invoice_number.ilike.%${search}%`
      );
    }

    // Apply sorting
    const orderBy = sort_by || "created_at";
    const order = sort_order === "asc" ? "asc" : "desc";
    query = query.order(orderBy, { ascending: order === "asc" });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Calculate summary stats
    const stats = {
      total_outstanding: 0,
      paid_this_month: 0,
      overdue_count: 0,
      draft_count: 0,
    };

    if (data) {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      data.forEach((inv: any) => {
        if (inv.status === "Unpaid" || inv.status === "Overdue") {
          stats.total_outstanding += inv.total;
        }
        if (inv.status === "Paid" && new Date(inv.paid_date) >= monthStart) {
          stats.paid_this_month += inv.total;
        }
        if (inv.status === "Overdue") {
          stats.overdue_count += 1;
        }
        if (inv.status === "Draft") {
          stats.draft_count += 1;
        }
      });
    }

    res.status(200).json({
      success: true,
      data,
      stats,
    });
  } catch (error) {
    console.error("Get invoices error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch invoices",
    });
  }
};

// Get single invoice (admin)
export const handleGetInvoice: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (invoiceError || !invoice) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      });
    }

    const { data: lineItems } = await supabase
      .from("invoice_line_items")
      .select("*")
      .eq("invoice_id", id);

    const { data: artwork } = await supabase
      .from("invoice_artwork")
      .select("*")
      .eq("invoice_id", id);

    const { data: activity } = await supabase
      .from("invoice_activity")
      .select("*")
      .eq("invoice_id", id)
      .order("timestamp", { ascending: false });

    res.status(200).json({
      success: true,
      data: {
        ...invoice,
        line_items: lineItems || [],
        artwork: artwork || [],
        activity: activity || [],
      },
    });
  } catch (error) {
    console.error("Get invoice error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch invoice",
    });
  }
};

// Create invoice (admin)
export const handleCreateInvoice: RequestHandler = async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      company,
      billing_address,
      invoice_type,
      issue_date,
      due_date,
      notes,
      line_items,
      tax_rate,
      shipping,
      discount_amount,
      discount_type,
    } = req.body;

    // Generate invoice number
    const invoice_number = await generateInvoiceNumber();

    // Calculate totals
    let subtotal = 0;
    if (line_items && Array.isArray(line_items)) {
      subtotal = line_items.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.unit_price);
      }, 0);
    }

    const tax_amount = (subtotal * (tax_rate || 0)) / 100;
    const total = subtotal + tax_amount + (shipping || 0) - (discount_amount || 0);

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        invoice_number,
        customer_name,
        customer_email,
        customer_phone: null,
        invoice_type,
        due_date,
        notes,
        subtotal,
        tax_rate,
        tax_amount,
        shipping: shipping || 0,
        discount_amount: discount_amount || 0,
        total,
        status: "Draft",
        metadata: {
          company,
          billing_address,
          discount_type,
          issue_date,
        },
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      throw invoiceError || new Error("Failed to create invoice");
    }

    // Add line items
    if (line_items && Array.isArray(line_items)) {
      const itemsToInsert = line_items.map((item: LineItem) => ({
        invoice_id: invoice.id,
        item_name: item.item_name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.quantity * item.unit_price,
      }));

      await supabase.from("invoice_line_items").insert(itemsToInsert);
    }

    // Log activity
    await supabase.from("invoice_activity").insert({
      invoice_id: invoice.id,
      action: "created",
      description: "Invoice created",
    });

    res.status(201).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Create invoice error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to create invoice",
    });
  }
};

// Update invoice (admin)
export const handleUpdateInvoice: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer_name,
      customer_email,
      company,
      billing_address,
      due_date,
      notes,
      line_items,
      tax_rate,
      shipping,
      discount_amount,
      discount_type,
    } = req.body;

    // Get existing invoice
    const { data: existing } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      });
    }

    // Only allow edit if Draft
    if (existing.status !== "Draft") {
      return res.status(400).json({
        success: false,
        error: "Can only edit draft invoices",
      });
    }

    // Recalculate totals
    let subtotal = 0;
    if (line_items && Array.isArray(line_items)) {
      subtotal = line_items.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.unit_price);
      }, 0);
    }

    const tax_amount = (subtotal * (tax_rate || 0)) / 100;
    const total = subtotal + tax_amount + (shipping || 0) - (discount_amount || 0);

    // Update invoice
    const { data: updated, error } = await supabase
      .from("invoices")
      .update({
        customer_name,
        customer_email,
        company,
        billing_address,
        due_date,
        notes,
        subtotal,
        tax_rate,
        tax_amount,
        shipping: shipping || 0,
        discount_amount: discount_amount || 0,
        discount_type,
        total,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !updated) {
      throw error || new Error("Failed to update invoice");
    }

    // Update line items
    await supabase.from("invoice_line_items").delete().eq("invoice_id", id);
    
    if (line_items && Array.isArray(line_items)) {
      const itemsToInsert = line_items.map((item: LineItem) => ({
        invoice_id: id,
        item_name: item.item_name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.quantity * item.unit_price,
        tax_enabled: item.tax_enabled || false,
      }));

      await supabase.from("invoice_line_items").insert(itemsToInsert);
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Update invoice error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update invoice",
    });
  }
};

// Send invoice (admin)
export const handleSendInvoice: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { email_subject, email_message } = req.body;

    // Get invoice
    const { data: invoice } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      });
    }

    // Generate payment token
    const token = generateInvoiceToken();

    // Save token
    const { data: tokenData } = await supabase
      .from("invoice_tokens")
      .insert({
        invoice_id: id,
        token,
      })
      .select()
      .single();

    // Update invoice status to Sent
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        status: "Sent",
        sent_date: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      throw updateError;
    }

    // Log activity
    await supabase.from("invoice_activity").insert({
      invoice_id: id,
      activity_type: "sent",
      description: "Invoice sent to customer",
    });

    // TODO: Send email via Resend with payment link
    const paymentLink = `https://stickyslap.app/invoice/${token}`;

    console.log(
      `Invoice sent to ${invoice.customer_email} - Payment link: ${paymentLink}`
    );

    res.status(200).json({
      success: true,
      data: {
        invoice,
        payment_link: paymentLink,
        token,
      },
    });
  } catch (error) {
    console.error("Send invoice error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to send invoice",
    });
  }
};

// Mark invoice as paid
export const handleMarkInvoicePaid: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("invoices")
      .update({
        status: "Paid",
        paid_date: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw error || new Error("Failed to update invoice");
    }

    // Log activity
    await supabase.from("invoice_activity").insert({
      invoice_id: id,
      activity_type: "paid",
      description: "Invoice marked as paid",
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Mark paid error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark invoice paid",
    });
  }
};

// Cancel invoice
export const handleCancelInvoice: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data, error } = await supabase
      .from("invoices")
      .update({
        status: "Canceled",
        canceled_date: new Date().toISOString(),
        cancellation_reason: reason,
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw error || new Error("Failed to cancel invoice");
    }

    // Log activity
    await supabase.from("invoice_activity").insert({
      invoice_id: id,
      activity_type: "canceled",
      description: `Invoice canceled${reason ? `: ${reason}` : ""}`,
    });

    // TODO: Send cancellation email

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Cancel invoice error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel invoice",
    });
  }
};

// Get invoice by token (customer view)
export const handleGetInvoiceByToken: RequestHandler = async (req, res) => {
  try {
    const { token } = req.params;

    // Get token
    const { data: tokenData } = await supabase
      .from("invoice_tokens")
      .select("invoice_id, views")
      .eq("token", token)
      .single();

    if (!tokenData) {
      return res.status(404).json({
        success: false,
        error: "Invalid invoice link",
      });
    }

    // Update view count
    await supabase
      .from("invoice_tokens")
      .update({
        views: (tokenData.views || 0) + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq("token", token);

    // Get invoice
    const { data: invoice } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", tokenData.invoice_id)
      .single();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      });
    }

    // Get line items
    const { data: lineItems } = await supabase
      .from("invoice_line_items")
      .select("*")
      .eq("invoice_id", invoice.id);

    // Get artwork if needed
    let artwork = null;
    if (invoice.invoice_type === "ArtworkUpload") {
      const { data: artworkData } = await supabase
        .from("invoice_artwork")
        .select("*")
        .eq("invoice_id", invoice.id);
      artwork = artworkData;
    }

    res.status(200).json({
      success: true,
      data: {
        ...invoice,
        line_items: lineItems || [],
        artwork: artwork || [],
      },
    });
  } catch (error) {
    console.error("Get invoice by token error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch invoice",
    });
  }
};
