import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateProofEmailHtml } from "../emails/generate-proof-email";
import { formatOrderNumber } from "../utils/order";
import {
  validatePublicAccessToken,
  createPublicAccessToken,
  revokeResourceTokens,
} from "../utils/public-access-tokens";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || "",
);

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
const PROOF_EMAIL_FROM = "sticky@stickyslap.com";

interface ProofComment {
  id: string;
  proof_id: string;
  customer_id?: number;
  admin_id?: string;
  admin_email?: string;
  message: string;
  created_at: string;
}

interface ProofRow {
  id: string;
  order_id: number;
  customer_id: number;
  description?: string;
  file_url?: string;
  file_name?: string;
  status: string;
  revision_notes?: string;
  created_at: string;
  updated_at: string;
}

interface ProofDetail extends ProofRow {
  comments: ProofComment[];
}

/**
 * Get all proofs for the logged-in customer (paginated)
 */
export const handleGetProofs: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = 5;
    const offset = (page - 1) * limit;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from("proofs")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId);

    if (countError) {
      console.error("Error counting proofs:", countError);
      return res.status(500).json({ error: "Failed to fetch proofs" });
    }

    // Get paginated proofs
    const { data: proofs, error } = await supabase
      .from("proofs")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching proofs:", error);
      return res.status(500).json({ error: "Failed to fetch proofs" });
    }

    // Count unread notifications
    const { data: notifications } = await supabase
      .from("proof_notifications")
      .select("*")
      .eq("customer_id", customerId)
      .eq("is_read", false);

    const totalPages = Math.ceil((totalCount || 0) / limit);

    res.json({
      success: true,
      proofs: proofs || [],
      unreadNotifications: notifications?.length || 0,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: totalCount || 0,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Get proofs error:", error);
    res.status(500).json({ error: "Failed to fetch proofs" });
  }
};

/**
 * Get a single proof with its comments
 */
export const handleGetProofDetail: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;
    const { proofId } = req.params;

    if (!customerId || !proofId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get proof
    const { data: proof, error: proofError } = await supabase
      .from("proofs")
      .select("*")
      .eq("id", proofId)
      .single();

    if (proofError || !proof) {
      return res.status(404).json({ error: "Proof not found" });
    }

    // Verify customer owns this proof
    if (proof.customer_id !== customerId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Get comments
    const { data: comments, error: commentsError } = await supabase
      .from("proof_comments")
      .select("*")
      .eq("proof_id", proofId)
      .order("created_at", { ascending: true });

    if (commentsError) {
      console.error("Error fetching comments:", commentsError);
      return res.status(500).json({ error: "Failed to fetch proof details" });
    }

    // Mark notification as read
    const { data: notification } = await supabase
      .from("proof_notifications")
      .select("id")
      .eq("proof_id", proofId)
      .eq("customer_id", customerId)
      .eq("is_read", false)
      .single();

    if (notification) {
      await supabase
        .from("proof_notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notification.id);
    }

    const proofDetail: ProofDetail = {
      ...(proof as ProofRow),
      comments: (comments || []) as ProofComment[],
    };

    res.json({
      success: true,
      proof: proofDetail,
    });
  } catch (error) {
    console.error("Get proof detail error:", error);
    res.status(500).json({ error: "Failed to fetch proof details" });
  }
};

/**
 * Approve a proof
 */
export const handleApproveProof: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;
    const { proofId } = req.params;

    if (!customerId || !proofId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get proof
    const { data: proof, error: proofError } = await supabase
      .from("proofs")
      .select("*")
      .eq("id", proofId)
      .single();

    if (proofError || !proof) {
      return res.status(404).json({ error: "Proof not found" });
    }

    // Verify customer owns this proof
    if (proof.customer_id !== customerId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Update proof status
    const { error: updateError } = await supabase
      .from("proofs")
      .update({
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", proofId);

    if (updateError) {
      console.error("Error approving proof:", updateError);
      return res.status(500).json({ error: "Failed to approve proof" });
    }

    // Create admin notification
    const { data: customerData } = await supabase
      .from("customers")
      .select("email, first_name, last_name")
      .eq("id", customerId)
      .single();

    await supabase.from("proof_notifications").insert({
      customer_id: customerId,
      proof_id: proofId,
      notification_type: "customer_approved",
      message: `${customerData?.first_name} ${customerData?.last_name} has approved their proof for order #${proof.order_id}`,
      is_read: false,
    });

    res.json({
      success: true,
      message: "Proof approved successfully",
      status: "approved",
    });
  } catch (error) {
    console.error("Approve proof error:", error);
    res.status(500).json({ error: "Failed to approve proof" });
  }
};

/**
 * Deny a proof (request revisions)
 */
export const handleDenyProof: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;
    const { proofId } = req.params;
    const { revisionNotes } = req.body;

    if (!customerId || !proofId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get proof
    const { data: proof, error: proofError } = await supabase
      .from("proofs")
      .select("*")
      .eq("id", proofId)
      .single();

    if (proofError || !proof) {
      return res.status(404).json({ error: "Proof not found" });
    }

    // Verify customer owns this proof
    if (proof.customer_id !== customerId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Update proof status
    const { error: updateError } = await supabase
      .from("proofs")
      .update({
        status: "revisions_requested",
        revision_notes: revisionNotes || "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", proofId);

    if (updateError) {
      console.error("Error denying proof:", updateError);
      return res.status(500).json({ error: "Failed to deny proof" });
    }

    res.json({
      success: true,
      message: "Proof denied, revisions requested",
      status: "revisions_requested",
    });
  } catch (error) {
    console.error("Deny proof error:", error);
    res.status(500).json({ error: "Failed to deny proof" });
  }
};

/**
 * Add a comment to a proof
 */
export const handleAddProofComment: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;
    const { proofId } = req.params;
    const { message } = req.body;

    if (!customerId || !proofId || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get proof
    const { data: proof, error: proofError } = await supabase
      .from("proofs")
      .select("*")
      .eq("id", proofId)
      .single();

    if (proofError || !proof) {
      return res.status(404).json({ error: "Proof not found" });
    }

    // Verify customer owns this proof
    if (proof.customer_id !== customerId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Add comment
    const { data: comment, error: commentError } = await supabase
      .from("proof_comments")
      .insert({
        proof_id: proofId,
        customer_id: customerId,
        message,
      })
      .select()
      .single();

    if (commentError) {
      console.error("Error adding comment:", commentError);
      return res.status(500).json({ error: "Failed to add comment" });
    }

    res.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

/**
 * Get unread proof notifications for customer
 */
export const handleGetProofNotifications: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data: notifications, error } = await supabase
      .from("proof_notifications")
      .select("*")
      .eq("customer_id", customerId)
      .eq("is_read", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }

    res.json({
      success: true,
      notifications: notifications || [],
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

/**
 * Admin: Send proof to customer (standalone, not linked to orders)
 */
export const handleSendProofToCustomer: RequestHandler = async (req, res) => {
  try {
    const {
      customerEmail,
      description,
      referenceNumber,
      fileData,
      fileName,
      fileUrl,
    } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Proof subject is required" });
    }

    if (!customerEmail) {
      return res.status(400).json({ error: "Customer email is required" });
    }

    // Find or create customer
    let resolvedCustomerId: number;
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", customerEmail)
      .maybeSingle();

    if (existingCustomer) {
      resolvedCustomerId = existingCustomer.id;
    } else {
      // Create new customer
      const emailParts = customerEmail.split("@");
      const { data: newCustomer, error: createError } = await supabase
        .from("customers")
        .insert({
          email: customerEmail,
          first_name: emailParts[0],
          last_name: "Customer",
        })
        .select("id")
        .single();

      if (!newCustomer) {
        return res
          .status(500)
          .json({ error: "Failed to create customer record" });
      }
      resolvedCustomerId = newCustomer.id;
    }

    let finalFileUrl: string | undefined;
    let storedFileName: string | undefined;

    // If fileUrl is provided directly (from Cloudinary), use it
    if (fileUrl) {
      finalFileUrl = fileUrl;
      storedFileName = fileName;
      console.log("Using pre-uploaded file URL from Cloudinary:", finalFileUrl);
    }
    // Otherwise, handle file upload if base64 data is provided
    else if (fileData && fileName) {
      try {
        const buffer = Buffer.from(fileData, "base64");
        const timestamp = Date.now();
        const uniqueFileName = `proof-${timestamp}-${fileName}`;
        const bucketPath = `proofs/${uniqueFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("proofs")
          .upload(bucketPath, buffer, {
            cacheControl: "3600",
            upsert: false,
            contentType: "application/octet-stream",
          });

        if (uploadError) {
          console.error("Error uploading file:", uploadError);
          return res.status(500).json({ error: "Failed to upload file" });
        }

        const { data: publicUrlData } = supabase.storage
          .from("proofs")
          .getPublicUrl(bucketPath);

        finalFileUrl = publicUrlData.publicUrl;
        storedFileName = fileName;
        console.log("Uploaded file to Supabase Storage:", finalFileUrl);
      } catch (fileError) {
        console.error("Error processing file:", fileError);
        return res.status(500).json({ error: "Failed to process file" });
      }
    }

    // Create or find a placeholder order for this proof
    // (database requires order_id, so we create a dummy one for standalone proofs)
    let resolvedOrderId: number | null = null;

    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("customer_id", resolvedCustomerId)
      .eq("status", "pending")
      .limit(1)
      .maybeSingle();

    if (existingOrder) {
      resolvedOrderId = existingOrder.id;
    } else {
      // Create a placeholder order
      const { data: newOrder } = await supabase
        .from("orders")
        .insert({
          customer_id: resolvedCustomerId,
          status: "pending",
          total: 0,
          items: [],
        })
        .select("id")
        .single();

      if (newOrder) {
        resolvedOrderId = newOrder.id;
      }
    }

    // Create proof record (independent of orders conceptually, but linked for DB constraint)
    // Note: If using reference_number in the future, add it to the description for now
    const proofPayload: any = {
      customer_id: resolvedCustomerId,
      description: referenceNumber
        ? `${referenceNumber} - ${description}`
        : description,
      file_url: finalFileUrl,
      file_name: storedFileName,
      status: "pending",
    };

    // Include order_id if we have one
    if (resolvedOrderId) {
      proofPayload.order_id = resolvedOrderId;
    }

    const { data: proof, error: proofError } = await supabase
      .from("proofs")
      .insert(proofPayload)
      .select()
      .single();

    if (proofError) {
      console.error("Error creating proof:", proofError);
      return res.status(500).json({ error: "Failed to send proof" });
    }

    // Send proof email
    if (process.env.RESEND_API_KEY && resend) {
      try {
        const baseUrl = process.env.FRONTEND_URL || "https://stickyslap.com";
        const approvalLink = `${baseUrl}/proofs/${proof.id}/approve`;
        const revisionLink = `${baseUrl}/proofs/${proof.id}/request-revisions`;

        const { data: customer } = await supabase
          .from("customers")
          .select("first_name, last_name")
          .eq("id", resolvedCustomerId)
          .single();

        const customerName = customer?.first_name
          ? `${customer.first_name}${customer.last_name ? " " + customer.last_name : ""}`
          : "Valued Customer";

        // Generate email HTML
        const emailHtml = generateProofEmailHtml({
          customerName,
          proofDescription: description,
          proofFileUrl: finalFileUrl,
          approvalLink,
          revisionLink,
          referenceNumber,
        });

        // Send email via Resend
        const emailResult = await resend.emails.send({
          from: PROOF_EMAIL_FROM,
          to: customerEmail,
          subject: `Your Design Proof is Ready${referenceNumber ? ` - ${referenceNumber}` : ""}`,
          html: emailHtml,
        });

        if (emailResult.error) {
          console.error("Error sending proof email:", emailResult.error);
        } else {
          console.log("Proof email sent successfully:", emailResult.data);
        }
      } catch (emailError) {
        console.error("Error preparing or sending proof email:", emailError);
      }
    }

    res.json({
      success: true,
      proof,
      message: "Proof sent to customer successfully",
    });
  } catch (error) {
    console.error("Send proof error:", error);
    res.status(500).json({ error: "Failed to send proof" });
  }
};

/**
 * Admin: Get single proof detail
 */
export const handleGetAdminProofDetail: RequestHandler = async (req, res) => {
  try {
    const { proofId } = req.params;

    if (!proofId) {
      return res.status(400).json({ error: "Proof ID is required" });
    }

    const { data: proof, error } = await supabase
      .from("proofs")
      .select(
        `
        *,
        customers:customer_id (id, email, first_name, last_name),
        comments:proof_comments (id, proof_id, customer_id, admin_id, admin_email, message, created_at)
      `,
      )
      .eq("id", proofId)
      .single();

    if (error || !proof) {
      console.error("Error fetching proof detail:", error);
      return res.status(404).json({ error: "Proof not found" });
    }

    res.json({
      success: true,
      proof,
    });
  } catch (error) {
    console.error("Get proof detail error:", error);
    res.status(500).json({ error: "Failed to get proof details" });
  }
};

/**
 * Admin: Get pending proofs for all customers with optional date and status filtering
 */
export const handleGetAdminProofs: RequestHandler = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const sort = (req.query.sort as string) || "newest";
    const limit = Math.max(
      1,
      Math.min(20, parseInt(req.query.limit as string) || 5),
    );
    const offset = (page - 1) * limit;
    const dateFilter = (req.query.date as string) || null;
    const statusFilter = (req.query.status as string) || null;

    // Build the count query
    let countQuery = supabase
      .from("proofs")
      .select("*", { count: "exact", head: true });

    // Get paginated proofs query
    let proofQuery = supabase.from("proofs").select(
      `
        *,
        customers:customer_id (id, email, first_name, last_name)
      `,
    );

    // Apply date filter if provided
    if (dateFilter) {
      const startOfDay = `${dateFilter}T00:00:00.000Z`;
      const endOfDay = `${dateFilter}T23:59:59.999Z`;
      countQuery = countQuery
        .gte("created_at", startOfDay)
        .lte("created_at", endOfDay);
      proofQuery = proofQuery
        .gte("created_at", startOfDay)
        .lte("created_at", endOfDay);
    }

    // Apply status filter if provided
    if (statusFilter) {
      countQuery = countQuery.eq("status", statusFilter);
      proofQuery = proofQuery.eq("status", statusFilter);
    }

    // Get total count
    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error("Error counting admin proofs:", countError);
      return res.status(500).json({ error: "Failed to fetch proofs" });
    }

    // Get paginated proofs with their customer info
    const sortAscending = sort === "oldest" ? true : false;
    const { data: proofs, error } = await proofQuery
      .order("created_at", { ascending: sortAscending })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching admin proofs:", error);
      return res.status(500).json({ error: "Failed to fetch proofs" });
    }

    // Get unread admin notifications
    const { data: notifications } = await supabase
      .from("proof_notifications")
      .select("*")
      .eq("is_read", false);

    const totalPages = Math.ceil((totalCount || 0) / limit);

    res.json({
      success: true,
      proofs: (proofs || []).map((proof: any) => ({
        id: proof.id,
        orderId: proof.order_id,
        customerId: proof.customer_id,
        customerName: proof.customers
          ? `${proof.customers.first_name || ""} ${proof.customers.last_name || ""}`.trim()
          : "Unknown",
        customerEmail: proof.customers?.email || "N/A",
        status: proof.status,
        thumbnailUrl: proof.file_url,
        approvedAt: proof.updated_at,
        createdAt: proof.created_at,
      })),
      unreadNotifications: notifications?.length || 0,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: totalCount || 0,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Get admin proofs error:", error);
    res.status(500).json({ error: "Failed to fetch proofs" });
  }
};

/**
 * Admin: Add comment to proof
 */
export const handleAddAdminProofComment: RequestHandler = async (req, res) => {
  try {
    const { proofId } = req.params;
    const { message, adminId, adminEmail } = req.body;

    if (!proofId || !message || !adminId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get proof
    const { data: proof, error: proofError } = await supabase
      .from("proofs")
      .select("*")
      .eq("id", proofId)
      .single();

    if (proofError || !proof) {
      return res.status(404).json({ error: "Proof not found" });
    }

    // Add comment
    const { data: comment, error: commentError } = await supabase
      .from("proof_comments")
      .insert({
        proof_id: proofId,
        admin_id: adminId,
        admin_email: adminEmail,
        message,
      })
      .select()
      .single();

    if (commentError) {
      console.error("Error adding admin comment:", commentError);
      return res.status(500).json({ error: "Failed to add comment" });
    }

    res.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("Add admin comment error:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

/**
 * Get a single proof (public - requires secure access token)
 * SECURITY: Requires valid public access token instead of guessable proof ID
 * Prevents enumeration attacks and unauthorized access
 *
 * Usage: GET /api/proofs/public/:proofId?token=<secure-token>
 */
export const handleGetProofDetailPublic: RequestHandler = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(404).json({ error: "Proof not found" });
    }

    // SECURITY: Validate token atomically (prevents enumeration)
    const validation = await validatePublicAccessToken(token, "proof");
    if (!validation.success) {
      // Generic 404 - never reveal why token failed
      return res.status(404).json({ error: "Proof not found" });
    }

    const proofId = validation.resourceId;

    // Get proof
    const { data: proof, error: proofError } = await supabase
      .from("proofs")
      .select("*")
      .eq("id", proofId)
      .single();

    if (proofError || !proof) {
      return res.status(404).json({ error: "Proof not found" });
    }

    // Get comments
    const { data: comments, error: commentsError } = await supabase
      .from("proof_comments")
      .select("*")
      .eq("proof_id", proofId)
      .order("created_at", { ascending: true });

    if (commentsError) {
      console.error("Error fetching comments:", commentsError);
      return res.status(404).json({ error: "Proof not found" });
    }

    res.json({
      success: true,
      proof: {
        ...proof,
        comments: comments || [],
      },
    });
  } catch (error) {
    console.error("Get proof detail public error:", error);
    res.status(404).json({ error: "Proof not found" });
  }
};

/**
 * Approve a proof (public - requires secure access token)
 * SECURITY: Requires valid one-time-use public access token
 * Prevents unauthorized approval and enumeration attacks
 *
 * Usage: POST /api/proofs/:proofId/approve?token=<secure-token>
 */
export const handleApproveProofPublicNew: RequestHandler = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(404).json({ error: "Proof not found" });
    }

    // SECURITY: Validate token atomically (prevents enumeration and reuse)
    const validation = await validatePublicAccessToken(token, "proof");
    if (!validation.success) {
      // Generic 404 - never reveal why token failed
      return res.status(404).json({ error: "Proof not found" });
    }

    const proofId = validation.resourceId;

    // Get proof
    const { data: proof, error: proofError } = await supabase
      .from("proofs")
      .select("*")
      .eq("id", proofId)
      .single();

    if (proofError || !proof) {
      return res.status(404).json({ error: "Proof not found" });
    }

    // Update proof status
    const { error: updateError } = await supabase
      .from("proofs")
      .update({
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", proofId);

    if (updateError) {
      console.error("Error approving proof:", updateError);
      return res.status(404).json({ error: "Proof not found" });
    }

    res.json({
      success: true,
      message: "Proof approved successfully",
      status: "approved",
    });
  } catch (error) {
    console.error("Approve proof public error:", error);
    res.status(500).json({ error: "Failed to approve proof" });
  }
};

/**
 * Request revisions on a proof (public - requires secure access token)
 * SECURITY: Requires valid one-time-use public access token
 * Prevents unauthorized revision requests and enumeration attacks
 *
 * Usage: POST /api/proofs/:proofId/revise?token=<secure-token>
 */
export const handleReviseProofPublicNew: RequestHandler = async (req, res) => {
  try {
    const { token } = req.query;
    const { revision_notes } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(404).json({ error: "Proof not found" });
    }

    // SECURITY: Validate token atomically (prevents enumeration and reuse)
    const validation = await validatePublicAccessToken(token, "proof");
    if (!validation.success) {
      // Generic 404 - never reveal why token failed
      return res.status(404).json({ error: "Proof not found" });
    }

    const proofId = validation.resourceId;

    // Get proof
    const { data: proof, error: proofError } = await supabase
      .from("proofs")
      .select("*")
      .eq("id", proofId)
      .single();

    if (proofError || !proof) {
      return res.status(404).json({ error: "Proof not found" });
    }

    // Update proof status
    const { error: updateError } = await supabase
      .from("proofs")
      .update({
        status: "revisions_requested",
        revision_notes: revision_notes || "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", proofId);

    if (updateError) {
      console.error("Error requesting revisions:", updateError);
      return res.status(404).json({ error: "Proof not found" });
    }

    res.json({
      success: true,
      message: "Revision request submitted successfully",
      status: "revisions_requested",
    });
  } catch (error) {
    console.error("Revise proof public error:", error);
    res.status(404).json({ error: "Proof not found" });
  }
};

/**
 * Approve a proof (public - no authentication required)
 * Used for proof review links sent via email
 */
export const handleApproveProofPublic: RequestHandler = async (req, res) => {
  try {
    const { proofId } = req.params;

    if (!proofId) {
      return res.status(400).json({ error: "Proof ID is required" });
    }

    // Get proof
    const { data: proof, error: proofError } = await supabase
      .from("proofs")
      .select("*")
      .eq("id", proofId)
      .single();

    if (proofError || !proof) {
      return res.status(404).json({ error: "Proof not found" });
    }

    // Update proof status
    const { error: updateError } = await supabase
      .from("proofs")
      .update({
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", proofId);

    if (updateError) {
      console.error("Error approving proof:", updateError);
      return res.status(500).json({ error: "Failed to approve proof" });
    }

    // Create admin notification
    const { data: customerData } = await supabase
      .from("customers")
      .select("email, first_name, last_name")
      .eq("id", proof.customer_id)
      .single();

    await supabase.from("proof_notifications").insert({
      customer_id: proof.customer_id,
      proof_id: proofId,
      notification_type: "customer_approved",
      message: `${customerData?.first_name} ${customerData?.last_name} has approved their proof for order #${proof.order_id}`,
      is_read: false,
    });

    res.json({
      success: true,
      message: "Proof approved successfully",
      status: "approved",
    });
  } catch (error) {
    console.error("Approve proof public error:", error);
    res.status(500).json({ error: "Failed to approve proof" });
  }
};

/**
 * Deny a proof - request revisions (public - no authentication required)
 * Used for proof review links sent via email
 */
export const handleDenyProofPublic: RequestHandler = async (req, res) => {
  try {
    const { proofId } = req.params;
    const { revision_notes } = req.body;

    if (!proofId) {
      return res.status(400).json({ error: "Proof ID is required" });
    }

    // Get proof
    const { data: proof, error: proofError } = await supabase
      .from("proofs")
      .select("*")
      .eq("id", proofId)
      .single();

    if (proofError || !proof) {
      return res.status(404).json({ error: "Proof not found" });
    }

    // Update proof status
    const { error: updateError } = await supabase
      .from("proofs")
      .update({
        status: "revisions_requested",
        revision_notes: revision_notes || "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", proofId);

    if (updateError) {
      console.error("Error requesting revisions:", updateError);
      return res.status(500).json({ error: "Failed to request revisions" });
    }

    // Create admin notification
    const { data: customerData } = await supabase
      .from("customers")
      .select("email, first_name, last_name")
      .eq("id", proof.customer_id)
      .single();

    await supabase.from("proof_notifications").insert({
      customer_id: proof.customer_id,
      proof_id: proofId,
      notification_type: "revision_requested",
      message: `${customerData?.first_name} ${customerData?.last_name} has requested revisions for their proof on order #${proof.order_id}`,
      is_read: false,
    });

    res.json({
      success: true,
      message: "Revision request submitted successfully",
      status: "revisions_requested",
    });
  } catch (error) {
    console.error("Deny proof public error:", error);
    res.status(500).json({ error: "Failed to request revisions" });
  }
};
