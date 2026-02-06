import { RequestHandler } from "express";
import { Request, Response, NextFunction } from "express";
import { supabase } from "../utils/supabase";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import { generateInvoiceEmailHtml } from "../emails/invoice-payment";

// Initialize Resend for email sending
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const INVOICE_EMAIL_FROM = "invoices@stickyslap.com";

// Middleware to verify JWT token for invoices (uses custom JWT format from system)
export const verifySupabaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      res.status(500).json({ error: "Server configuration error" });
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No authorization token provided" });
      return;
    }

    const token = authHeader.substring(7);

    // Verify the JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      customerId: number;
      email: string;
    };

    // Store customer info in request
    (req as any).customerId = decoded.customerId;
    (req as any).email = decoded.email;

    // Check if user is admin
    try {
      const { data: customer } = await supabase
        .from("customers")
        .select("is_admin")
        .eq("id", decoded.customerId)
        .single();

      if (!customer?.is_admin) {
        res.status(403).json({ error: "Admin access required" });
        return;
      }

      (req as any).isAdmin = true;
    } catch (error) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

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
  const lastDay = new Date(year, date.getMonth() + 1, 0).getDate();
  const { data, error } = await supabase
    .from("invoices")
    .select("id", { count: "exact" })
    .gte("created_at", `${year}-${month}-01`)
    .lte("created_at", `${year}-${month}-${lastDay}`);

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
    const { status, type, sort_by, sort_order } = req.query;
    const search = req.query.search as string | undefined;

    let query = supabase.from("invoices").select("*, invoice_line_items(*)");

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (type) {
      query = query.eq("invoice_type", type);
    }
    if (search) {
      query = query.or(
        `customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,invoice_number.ilike.%${search}%`,
      );
    }

    // Apply sorting
    const orderBy = sort_by || "created_at";
    const order = sort_order === "asc" ? "asc" : "desc";
    query = query.order(orderBy, { ascending: order === "asc" });

    const { data, error } = await query;

    // Handle missing table gracefully
    if (
      error &&
      (error.code === "PGRST205" ||
        error.message.includes("Could not find the table"))
    ) {
      console.log("Invoices table not yet created, returning empty list");
      return res.status(200).json({
        success: true,
        data: [],
        stats: {
          total_outstanding: 0,
          paid_this_month: 0,
          overdue_count: 0,
          draft_count: 0,
        },
      });
    }

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
      error:
        error instanceof Error ? error.message : "Failed to fetch invoices",
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

    // Handle missing table gracefully
    if (
      invoiceError &&
      (invoiceError.code === "PGRST205" ||
        invoiceError.message.includes("Could not find the table"))
    ) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      });
    }

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
        return sum + item.quantity * item.unit_price;
      }, 0);
    }

    const tax_amount = (subtotal * (tax_rate || 0)) / 100;
    const total =
      subtotal + tax_amount + (shipping || 0) - (discount_amount || 0);

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

    if (invoiceError) {
      // Handle missing invoices table gracefully
      if (
        invoiceError.code === "PGRST205" ||
        invoiceError.message.includes("Could not find the table")
      ) {
        console.log("Invoices table not yet created");
        return res.status(503).json({
          success: false,
          error:
            "Invoicing system is not yet available. Please contact support.",
        });
      }
      throw invoiceError;
    }

    if (!invoice) {
      throw new Error("Failed to create invoice");
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

      const { error: itemsError } = await supabase
        .from("invoice_line_items")
        .insert(itemsToInsert);

      if (itemsError) {
        console.warn("Failed to add invoice line items:", itemsError);
      }
    }

    // Log activity
    const { error: activityError } = await supabase
      .from("invoice_activity")
      .insert({
        invoice_id: invoice.id,
        action: "created",
        description: "Invoice created",
      });

    if (activityError) {
      console.warn("Failed to log invoice activity:", activityError);
    }

    res.status(201).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Create invoice error:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create invoice",
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
    const { data: existing, error: existingError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    // Handle missing invoices table
    if (
      existingError &&
      (existingError.code === "PGRST205" ||
        existingError.message.includes("Could not find the table"))
    ) {
      return res.status(503).json({
        success: false,
        error: "Invoicing system is not yet available. Please contact support.",
      });
    }

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
        return sum + item.quantity * item.unit_price;
      }, 0);
    }

    const tax_amount = (subtotal * (tax_rate || 0)) / 100;
    const total =
      subtotal + tax_amount + (shipping || 0) - (discount_amount || 0);

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
      error:
        error instanceof Error ? error.message : "Failed to update invoice",
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
      action: "sent",
      description: "Invoice sent to customer",
    });

    // Generate payment link
    const paymentLink = `https://stickyslap.app/invoice/${token}`;

    // Send email via Resend
    let emailSent = false;
    if (resend && process.env.RESEND_API_KEY) {
      try {
        const emailHtml = generateInvoiceEmailHtml(
          invoice.customer_name,
          invoice.invoice_number,
          invoice.total.toFixed(2),
          invoice.due_date,
          paymentLink,
          {
            company: invoice.company,
            notes: invoice.notes,
          },
        );

        const emailResult = await resend.emails.send({
          from: INVOICE_EMAIL_FROM,
          to: invoice.customer_email,
          subject: `Invoice ${invoice.invoice_number} from Sticky Slap - Payment Required`,
          html: emailHtml,
        });

        if (emailResult.data?.id) {
          emailSent = true;
          console.log(
            `Invoice email sent to ${invoice.customer_email} - Email ID: ${emailResult.data.id}`,
          );
        } else {
          console.warn(
            `Failed to send invoice email to ${invoice.customer_email}:`,
            emailResult.error,
          );
        }
      } catch (emailError) {
        console.error(
          `Error sending invoice email to ${invoice.customer_email}:`,
          emailError,
        );
      }
    } else {
      console.warn(
        "Resend API key not configured. Invoice email not sent. Set RESEND_API_KEY environment variable to enable email sending.",
      );
    }

    res.status(200).json({
      success: true,
      data: {
        invoice,
        payment_link: paymentLink,
        token,
        email_sent: emailSent,
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
      action: "paid",
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
      error:
        error instanceof Error ? error.message : "Failed to mark invoice paid",
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
      action: "canceled",
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
      error:
        error instanceof Error ? error.message : "Failed to cancel invoice",
    });
  }
};

// Get or create payment token for invoice
export const handleGetPaymentToken: RequestHandler = async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId as string;

    // Try to get existing token (most recent one)
    const { data: existingToken, error: fetchError } = await supabase
      .from("invoice_tokens")
      .select("token")
      .eq("invoice_id", invoiceId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Return existing token if found
    if (existingToken && !fetchError) {
      return res.status(200).json({
        success: true,
        data: {
          token: existingToken.token,
        },
      });
    }

    // Create new token if one doesn't exist
    const newToken = generateInvoiceToken();

    const { data: createdToken, error } = await supabase
      .from("invoice_tokens")
      .insert({
        invoice_id: parseInt(invoiceId),
        token: newToken,
      })
      .select()
      .single();

    if (error || !createdToken) {
      throw error || new Error("Failed to create payment token");
    }

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    console.error("Get payment token error:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get payment token",
    });
  }
};

// Get invoice by token (customer view)
export const handleGetInvoiceByToken: RequestHandler = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "No token provided",
      });
    }

    // Get token - handle gracefully if table doesn't exist
    const { data: tokenData, error: tokenError } = await supabase
      .from("invoice_tokens")
      .select("invoice_id, views")
      .eq("token", token)
      .maybeSingle();

    if (tokenError) {
      console.error("Error fetching token:", tokenError);
      // If table doesn't exist, return helpful error
      if (
        tokenError.code === "PGRST204" ||
        tokenError.message.includes("Could not find the table")
      ) {
        return res.status(503).json({
          success: false,
          error: "Invoice system not yet initialized. Please contact support.",
        });
      }
      throw tokenError;
    }

    if (!tokenData) {
      return res.status(404).json({
        success: false,
        error: "Invalid invoice link",
      });
    }

    // Update view count (non-blocking - fire and forget)
    const { error: viewError } = await supabase
      .from("invoice_tokens")
      .update({
        views: (tokenData.views || 0) + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq("token", token);

    if (viewError) {
      console.error("Error updating token views:", viewError);
    }

    // Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", tokenData.invoice_id)
      .maybeSingle();

    if (invoiceError) {
      console.error("Error fetching invoice:", invoiceError);
      throw invoiceError;
    }

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      });
    }

    // Get line items
    const { data: lineItems, error: lineItemsError } = await supabase
      .from("invoice_line_items")
      .select("*")
      .eq("invoice_id", invoice.id);

    if (lineItemsError) {
      console.error("Error fetching line items:", lineItemsError);
      // Don't fail if line items can't be fetched, return empty array
    }

    // Get artwork if needed
    let artwork = null;
    if (invoice.invoice_type === "ArtworkUpload") {
      const { data: artworkData, error: artworkError } = await supabase
        .from("invoice_artwork")
        .select("*")
        .eq("invoice_id", invoice.id);

      if (artworkError) {
        console.error("Error fetching artwork:", artworkError);
        // Don't fail if artwork can't be fetched, return empty array
      } else {
        artwork = artworkData;
      }
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
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch invoice. Please try again later.",
    });
  }
};

// Create Square payment link for invoice
export const handleCreateInvoicePaymentLink: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { token } = req.params;

    // Get token and invoice
    const { data: tokenData } = await supabase
      .from("invoice_tokens")
      .select("invoice_id")
      .eq("token", token)
      .single();

    if (!tokenData) {
      return res.status(404).json({
        success: false,
        error: "Invalid invoice token",
      });
    }

    // Get invoice details
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

    // Check if invoice is already paid
    if (invoice.status === "Paid") {
      return res.status(400).json({
        success: false,
        error: "Invoice has already been paid",
      });
    }

    // Get line items for description
    const { data: lineItems } = await supabase
      .from("invoice_line_items")
      .select("*")
      .eq("invoice_id", invoice.id);

    // Import Square utilities
    const { createSquarePaymentLink } = await import("../utils/square");

    // Build description from line items
    let description = `Invoice #${invoice.invoice_number}`;
    if (lineItems && lineItems.length > 0) {
      const itemNames = lineItems.slice(0, 3).map((item) => item.item_name);
      description += ` - ${itemNames.join(", ")}`;
      if (lineItems.length > 3) {
        description += ` + ${lineItems.length - 3} more`;
      }
    }

    // Determine redirect URL
    const baseUrl =
      process.env.BASE_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://stickyslap.app"
        : "http://localhost:5173");
    const redirectUrl = `${baseUrl}/invoice/${token}`;

    // Create Square payment link
    const paymentLinkResult = await createSquarePaymentLink({
      orderId: invoice.id.toString(),
      amount: invoice.total,
      currency: "USD",
      description,
      customerEmail: invoice.customer_email,
      customerName: invoice.customer_name,
      redirectUrl,
      subtotal: invoice.subtotal,
      tax: invoice.tax_amount,
      shipping: invoice.shipping || 0,
      discount: invoice.discount_amount || 0,
      items: (lineItems || []).map((item) => ({
        product_name: item.item_name,
        quantity: item.quantity,
        price: item.unit_price,
      })),
    });

    if (!paymentLinkResult.success || !paymentLinkResult.paymentLinkUrl) {
      console.error("Failed to create Square payment link:", paymentLinkResult);
      return res.status(400).json({
        success: false,
        error: paymentLinkResult.error || "Failed to create payment link",
      });
    }

    // Log activity
    await supabase.from("invoice_activity").insert({
      invoice_id: invoice.id,
      action: "payment_initiated",
      description: "Customer initiated Square payment",
    });

    res.status(200).json({
      success: true,
      data: {
        payment_link: paymentLinkResult.paymentLinkUrl,
        invoice_number: invoice.invoice_number,
        amount: invoice.total,
      },
    });
  } catch (error) {
    console.error("Create invoice payment link error:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create payment link",
    });
  }
};
