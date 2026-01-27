import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { randomUUID } from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || "",
);

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const PROOF_EMAIL_FROM = "sticky@stickyslap.com";

export const handleSendProofDirectly: RequestHandler = async (req, res) => {
  try {
    const { email, subject, orderNumber, fileUrl, fileName } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ error: "Customer email is required" });
    }

    if (!subject) {
      return res.status(400).json({ error: "Proof subject is required" });
    }

    if (!fileUrl) {
      return res.status(400).json({ error: "File URL is required" });
    }

    // Generate unique proof ID using UUID
    const proofId = randomUUID();

    // Find or create customer record
    let customerId: number | null = null;

    // Try to find customer by email
    const { data: existingCustomer, error: findError } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (findError) {
      console.error("Error finding customer:", findError);
    }

    if (existingCustomer) {
      customerId = existingCustomer.id;
      console.log("Found existing customer:", customerId);
    } else {
      // Create a temporary customer record for this email
      const emailParts = email.split("@");
      const name = emailParts[0];

      console.log("Creating new customer for email:", email);

      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({
          email,
          first_name: name,
          last_name: "Customer",
        })
        .select("id")
        .single();

      if (customerError) {
        console.error("Error creating customer:", customerError);
        return res.status(500).json({ error: "Failed to create customer record" });
      }

      if (newCustomer) {
        customerId = newCustomer.id;
        console.log("Created new customer with ID:", customerId);
      } else {
        console.error("No customer data returned after insert");
        return res.status(500).json({ error: "Failed to create customer record" });
      }
    }

    // Create proof record in database
    if (!customerId) {
      console.error("Cannot create proof - no customer ID");
      return res.status(500).json({ error: "Failed to resolve customer" });
    }

    console.log("Creating proof record with customer ID:", customerId);

    // Build the proof record - only include order_id if provided
    const proofRecordData: any = {
      id: proofId,
      customer_id: customerId,
      description: subject,
      file_url: fileUrl,
      file_name: fileName,
      status: "pending",
    };

    // Only add order_id if a valid order number is provided
    if (orderNumber && !isNaN(parseInt(orderNumber))) {
      proofRecordData.order_id = parseInt(orderNumber);
    }

    console.log("Proof record data:", JSON.stringify(proofRecordData));

    const { data: proofRecord, error: proofError } = await supabase
      .from("proofs")
      .insert(proofRecordData)
      .select()
      .single();

    if (proofError) {
      console.error("Error creating proof record:", proofError);
      return res.status(500).json({ error: "Failed to create proof record in database" });
    }

    if (!proofRecord) {
      console.error("No proof record returned after insert");
      return res.status(500).json({ error: "Failed to create proof record" });
    }

    console.log("Successfully created proof:", proofId);

    // Generate approval and revision links
    const baseUrl =
      process.env.FRONTEND_URL || "https://stickyslap.app";
    const approvalLink = `${baseUrl}/proof/${proofId}/approve`;
    const revisionLink = `${baseUrl}/proof/${proofId}/request-revisions`;

    // Generate email HTML
    const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; }
          .proof-image { max-width: 100%; height: auto; margin: 20px 0; border: 1px solid #ddd; border-radius: 8px; }
          .button { display: inline-block; padding: 12px 24px; margin: 10px 5px; border-radius: 5px; text-decoration: none; font-weight: bold; }
          .approve-btn { background-color: #22c55e; color: #fff; }
          .revise-btn { background-color: #f59e0b; color: #fff; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Design Proof is Ready</h1>
          </div>
          
          <div class="content">
            <h2>${subject}</h2>
            ${orderNumber ? `<p><strong>Order Reference:</strong> ${orderNumber}</p>` : ""}
            
            <p>We're excited to show you your design proof! Please review the image below.</p>
            
            <img src="${fileUrl}" alt="Design Proof" class="proof-image" />
            
            <p><strong>What's next?</strong></p>
            <p>Please let us know if you approve this design or if you'd like us to make any changes.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${approvalLink}" class="button approve-btn">✓ Approve Design</a>
              <a href="${revisionLink}" class="button revise-btn">✎ Request Changes</a>
            </div>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 Sticky Slap. All rights reserved.</p>
            <p>Questions? Reply to this email or contact us at sticky@stickyslap.com</p>
          </div>
        </div>
      </body>
    </html>
    `;

    // Send email via Resend
    if (!resend) {
      console.error("Resend API key not configured - cannot send email");
      return res.status(500).json({ error: "Email service not configured" });
    }

    console.log("Sending email to:", email);

    const emailResult = await resend.emails.send({
      from: PROOF_EMAIL_FROM,
      to: email,
      subject: `Design Proof Ready: ${subject}`,
      html: emailHtml,
    });

    if (emailResult.error) {
      console.error("Error sending proof email:", emailResult.error);
      return res.status(500).json({ error: "Failed to send email: " + JSON.stringify(emailResult.error) });
    }

    console.log("Proof email sent successfully:", emailResult.data?.id);

    res.json({
      success: true,
      proofId,
      message: "Proof sent to customer successfully",
    });
  } catch (error) {
    console.error("Send proof error:", error);
    res.status(500).json({ error: "Failed to send proof" });
  }
};
