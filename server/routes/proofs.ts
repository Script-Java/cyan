import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateProofEmailHtml } from "../emails/generate-proof-email";
import { formatOrderNumber } from "../utils/order";

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
 * Admin: Send proof to customer
 * Note: Only allows sending proofs for orders from Supabase database
 */
export const handleSendProofToCustomer: RequestHandler = async (req, res) => {
  try {
    const { orderId, customerId, customerEmail, description, fileData, fileName } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Proof description is required" });
    }

    if (!customerEmail) {
      return res.status(400).json({ error: "Customer email is required" });
    }

    let resolvedCustomerId = customerId;
    let resolvedOrderId = orderId;

    // If orderId is provided, validate it exists
    if (orderId) {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id, customer_id")
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        return res.status(404).json({
          error:
            "Order not found. Only Supabase orders are supported for proofs.",
        });
      }

      resolvedCustomerId = order.customer_id;
    }

    if (!resolvedCustomerId) {
      return res
        .status(400)
        .json({ error: "Could not resolve customer ID" });
    }

    let fileUrl: string | undefined;
    let storedFileName: string | undefined;

    // Handle file upload if provided
    if (fileData && fileName) {
      try {
        // Convert base64 to buffer
        const buffer = Buffer.from(fileData, "base64");

        // Generate unique filename
        const timestamp = Date.now();
        const uniqueFileName = `proof-${orderId}-${customerId}-${timestamp}-${fileName}`;
        const bucketPath = `proofs/${uniqueFileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
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

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("proofs")
          .getPublicUrl(bucketPath);

        fileUrl = publicUrlData.publicUrl;
        storedFileName = fileName;
      } catch (fileError) {
        console.error("Error processing file:", fileError);
        return res.status(500).json({ error: "Failed to process file" });
      }
    }

    // Create proof
    const proofData: any = {
      customer_id: resolvedCustomerId,
      description,
      file_url: fileUrl,
      file_name: storedFileName,
      status: "pending",
    };

    // Add order_id if provided
    if (resolvedOrderId) {
      proofData.order_id = resolvedOrderId;
    }

    const { data: proof, error: proofError } = await supabase
      .from("proofs")
      .insert(proofData)
      .select()
      .single();

    if (proofError) {
      console.error("Error creating proof:", proofError);
      return res.status(500).json({ error: "Failed to send proof" });
    }

    // Create notification for customer
    const notificationMessage = resolvedOrderId
      ? `You have a new proof ready for order #${resolvedOrderId}`
      : "You have a new proof ready";

    const { error: notifError } = await supabase
      .from("proof_notifications")
      .insert({
        customer_id: resolvedCustomerId,
        proof_id: proof.id,
        notification_type: "proof_ready",
        message: notificationMessage,
        is_read: false,
      });

    if (notifError) {
      console.error("Error creating notification:", notifError);
    }

    // Fetch customer email to send proof email
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("email, first_name, last_name")
      .eq("id", resolvedCustomerId)
      .single();

    if (customerError) {
      console.error("Error fetching customer for email:", customerError);
    } else if (
      customer &&
      customer.email &&
      process.env.RESEND_API_KEY &&
      resend
    ) {
      try {
        // Generate approval and revision links
        const baseUrl =
          process.env.FRONTEND_URL ||
          "https://51be3d6708344836a6f6586ec48b1e4b-476bca083d854b2a92cc8cfa4.fly.dev";
        const approvalLink = `${baseUrl}/proofs/${proof.id}/approve`;
        const revisionLink = `${baseUrl}/proofs/${proof.id}/request-revisions`;

        const customerName = customer.first_name
          ? `${customer.first_name}${customer.last_name ? " " + customer.last_name : ""}`
          : "Valued Customer";

        // Generate email HTML
        const emailHtml = generateProofEmailHtml({
          customerName,
          orderId,
          proofDescription: description,
          proofFileUrl: fileUrl,
          approvalLink,
          revisionLink,
        });

        // Send email via Resend
        const emailResult = await resend.emails.send({
          from: PROOF_EMAIL_FROM,
          to: customer.email,
          subject: `Your Design Proof is Ready - Order ${formatOrderNumber(orderId)}`,
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
 * Admin: Get pending proofs for all customers
 */
export const handleGetAdminProofs: RequestHandler = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = 5;
    const offset = (page - 1) * limit;

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from("proofs")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error counting admin proofs:", countError);
      return res.status(500).json({ error: "Failed to fetch proofs" });
    }

    // Get paginated proofs with their customer info
    const { data: proofs, error } = await supabase
      .from("proofs")
      .select(
        `
        *,
        customers:customer_id (id, email, first_name, last_name)
      `,
      )
      .order("created_at", { ascending: false })
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
 * Get a single proof (public - no authentication required)
 * Used for proof review links sent via email
 */
export const handleGetProofDetailPublic: RequestHandler = async (req, res) => {
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

    res.json({
      success: true,
      proof: {
        ...proof,
        comments: comments || [],
      },
    });
  } catch (error) {
    console.error("Get proof detail public error:", error);
    res.status(500).json({ error: "Failed to fetch proof details" });
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
