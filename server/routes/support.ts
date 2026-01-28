import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import { sendTicketCreationEmail, sendTicketReplyEmail } from "../utils/email";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey || process.env.SUPABASE_ANON_KEY || "",
);

interface SupportSubmission {
  name: string;
  email: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
  customerId?: number;
}

export interface SupportResponse {
  success: boolean;
  message: string;
  ticketId?: string;
}

export const handleSupportSubmit: RequestHandler = async (req, res) => {
  try {
    const { name, email, subject, category, priority, message, customerId } =
      req.body as SupportSubmission;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: name, email, subject, and message",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
      return;
    }

    // Insert ticket into Supabase
    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        customer_id: customerId || 0,
        customer_email: email,
        customer_name: name,
        subject,
        category,
        priority,
        message,
        status: "open",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error inserting ticket:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create support ticket",
      });
      return;
    }

    console.log("Support Ticket Created:", {
      ticketId: data.id,
      timestamp: new Date().toISOString(),
      name,
      email,
      subject,
      category,
      priority,
    });

    // Send confirmation email
    await sendTicketCreationEmail(email, name, data.id, subject);

    res.status(200).json({
      success: true,
      message: "Support request submitted successfully",
      ticketId: data.id,
    });
  } catch (error) {
    console.error("Error handling support submission:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process support request",
    });
  }
};

export const handleGetTickets: RequestHandler = async (req, res) => {
  try {
    const customerId = req.query.customerId as string;

    if (!customerId) {
      res.status(400).json({
        error: "Customer ID is required",
      });
      return;
    }

    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("customer_id", parseInt(customerId))
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tickets from Supabase:", {
        message: error.message,
        code: (error as any).code,
        details: (error as any).details,
      });
      res.status(500).json({
        error: "Failed to fetch tickets",
        details: error.message,
      });
      return;
    }

    console.log(`Successfully fetched ${data?.length || 0} tickets for customer ${customerId}`);
    res.json({ tickets: data || [] });
  } catch (error) {
    console.error("Error in handleGetTickets:", error);
    res.status(500).json({
      error: "Failed to fetch tickets",
    });
  }
};

export const handleGetTicketDetails: RequestHandler = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const customerId = req.query.customerId as string;

    if (!ticketId) {
      res.status(400).json({
        error: "Ticket ID is required",
      });
      return;
    }

    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (ticketError || !ticket) {
      res.status(404).json({
        error: "Ticket not found",
      });
      return;
    }

    // Verify customer owns the ticket (or admin accessing with customerId=0)
    if (customerId && customerId !== "0") {
      if (ticket.customer_id !== parseInt(customerId)) {
        res.status(403).json({
          error: "Unauthorized: You can only view your own tickets",
        });
        return;
      }
    }

    const { data: replies, error: repliesError } = await supabase
      .from("ticket_replies")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (repliesError) {
      console.error("Error fetching replies:", repliesError);
      res.status(500).json({
        error: "Failed to fetch ticket replies",
      });
      return;
    }

    res.json({
      ticket,
      replies: replies || [],
    });
  } catch (error) {
    console.error("Error in handleGetTicketDetails:", error);
    res.status(500).json({
      error: "Failed to fetch ticket details",
    });
  }
};

export const handleAdminGetAllTickets: RequestHandler = async (req, res) => {
  try {
    const { status, priority } = req.query;

    let query = supabase.from("support_tickets").select("*");

    if (status) {
      query = query.eq("status", status);
    }

    if (priority) {
      query = query.eq("priority", priority);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching all tickets:", error);
      res.status(500).json({
        error: "Failed to fetch tickets",
      });
      return;
    }

    res.json(data || []);
  } catch (error) {
    console.error("Error in handleAdminGetAllTickets:", error);
    res.status(500).json({
      error: "Failed to fetch tickets",
    });
  }
};

export const handleAdminReplyToTicket: RequestHandler = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message, adminName } = req.body;

    if (!ticketId || !message || !adminName) {
      res.status(400).json({
        error: "Missing required fields: ticketId, message, adminName",
      });
      return;
    }

    // Get ticket details for customer email
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .select("customer_email, customer_name")
      .eq("id", ticketId)
      .single();

    if (ticketError || !ticket) {
      res.status(404).json({
        error: "Ticket not found",
      });
      return;
    }

    // Insert reply
    const { data: reply, error: replyError } = await supabase
      .from("ticket_replies")
      .insert({
        ticket_id: ticketId,
        sender_type: "admin",
        sender_name: adminName,
        sender_email: "support@stickyslap.com",
        message,
      })
      .select("id")
      .single();

    if (replyError) {
      console.error("Error inserting reply:", replyError);
      res.status(500).json({
        error: "Failed to send reply",
      });
      return;
    }

    // Update ticket status to in-progress
    const { data: updatedTicket } = await supabase
      .from("support_tickets")
      .update({ status: "in-progress", updated_at: new Date().toISOString() })
      .eq("id", ticketId)
      .select("subject")
      .single();

    console.log("Admin Reply Created:", {
      ticketId,
      replyId: reply.id,
      customerEmail: ticket.customer_email,
      message,
    });

    // Send email notification to customer
    await sendTicketReplyEmail(
      ticket.customer_email,
      ticket.customer_name,
      ticketId,
      updatedTicket?.subject || "Your Support Ticket",
      message,
      adminName,
    );

    res.json({
      success: true,
      replyId: reply.id,
      message: "Reply sent successfully and customer notified",
    });
  } catch (error) {
    console.error("Error in handleAdminReplyToTicket:", error);
    res.status(500).json({
      error: "Failed to send reply",
    });
  }
};

export const handleCustomerReplyToTicket: RequestHandler = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message, customerId } = req.body;

    if (!ticketId || !message || !customerId) {
      res.status(400).json({
        error: "Missing required fields: ticketId, message, customerId",
      });
      return;
    }

    // Get ticket details to verify ownership
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .select("customer_id, customer_name, customer_email")
      .eq("id", ticketId)
      .single();

    if (ticketError || !ticket) {
      res.status(404).json({
        error: "Ticket not found",
      });
      return;
    }

    // Verify customer owns this ticket
    if (ticket.customer_id !== customerId) {
      res.status(403).json({
        error: "Unauthorized: You can only reply to your own tickets",
      });
      return;
    }

    // Insert reply
    const { data: reply, error: replyError } = await supabase
      .from("ticket_replies")
      .insert({
        ticket_id: ticketId,
        sender_type: "customer",
        sender_name: ticket.customer_name,
        sender_email: ticket.customer_email,
        message,
      })
      .select("id")
      .single();

    if (replyError) {
      console.error("Error inserting customer reply:", replyError);
      res.status(500).json({
        error: "Failed to send reply",
      });
      return;
    }

    // Update ticket updated_at timestamp
    await supabase
      .from("support_tickets")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", ticketId);

    console.log("Customer Reply Created:", {
      ticketId,
      replyId: reply.id,
      customerId,
      message,
    });

    res.json({
      success: true,
      replyId: reply.id,
      message: "Reply sent successfully",
    });
  } catch (error) {
    console.error("Error in handleCustomerReplyToTicket:", error);
    res.status(500).json({
      error: "Failed to send reply",
    });
  }
};

export const handleUpdateTicketStatus: RequestHandler = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!ticketId || !status) {
      res.status(400).json({
        error: "Missing required fields",
      });
      return;
    }

    const validStatuses = ["open", "in-progress", "resolved", "closed"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        error: "Invalid status",
      });
      return;
    }

    const { error } = await supabase
      .from("support_tickets")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", ticketId);

    if (error) {
      console.error("Error updating ticket:", error);
      res.status(500).json({
        error: "Failed to update ticket",
      });
      return;
    }

    res.json({
      success: true,
      message: "Ticket status updated",
    });
  } catch (error) {
    console.error("Error in handleUpdateTicketStatus:", error);
    res.status(500).json({
      error: "Failed to update ticket",
    });
  }
};
