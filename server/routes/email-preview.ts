import { RequestHandler } from "express";
import { generateProofEmailHtml } from "../emails/generate-proof-email";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const PROOF_EMAIL_FROM = "sticky@stickyslap.com";

export const handleProofEmailPreview: RequestHandler = async (req, res) => {
  try {
    const { email } = req.query;

    const sampleHtml = generateProofEmailHtml({
      customerName: "John Doe",
      orderId: 12345,
      proofDescription: "Custom sticker design with your company logo and tagline.\n\nThe design features:\n- Vibrant color scheme\n- High-resolution graphics\n- Print-ready format\n\nPlease review and let us know if any changes are needed!",
      proofFileUrl: "https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=400&fit=crop",
      approvalLink: "https://51be3d6708344836a6f6586ec48b1e4b-476bca083d854b2a92cc8cfa4.fly.dev/proofs/preview123/approve",
      revisionLink: "https://51be3d6708344836a6f6586ec48b1e4b-476bca083d854b2a92cc8cfa4.fly.dev/proofs/preview123/request-revisions",
    });

    // If email param is provided, send the email
    if (email && typeof email === "string" && process.env.RESEND_API_KEY) {
      try {
        const result = await resend.emails.send({
          from: PROOF_EMAIL_FROM,
          to: email,
          subject: "Preview: Your Design Proof is Ready - Order #12345",
          html: sampleHtml,
        });

        if (result.error) {
          console.error("Error sending preview email:", result.error);
          return res.status(500).json({ error: "Failed to send email", details: result.error });
        }

        return res.json({
          success: true,
          message: `Preview email sent to ${email}`,
          emailId: result.data?.id,
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        return res.status(500).json({
          error: "Failed to send email",
          details: emailError instanceof Error ? emailError.message : "Unknown error",
        });
      }
    }

    // Otherwise, return the HTML preview
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(sampleHtml);
  } catch (error) {
    console.error("Proof email preview error:", error);
    res.status(500).json({
      error: "Failed to process request",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const handleSendProofEmailPreview: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: "Email service not configured" });
    }

    const sampleHtml = generateProofEmailHtml({
      customerName: "John Doe",
      orderId: 12345,
      proofDescription: "Custom sticker design with your company logo and tagline.\n\nThe design features:\n- Vibrant color scheme\n- High-resolution graphics\n- Print-ready format\n\nPlease review and let us know if any changes are needed!",
      proofFileUrl: "https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=400&fit=crop",
      approvalLink: "https://51be3d6708344836a6f6586ec48b1e4b-476bca083d854b2a92cc8cfa4.fly.dev/proofs/preview123/approve",
      revisionLink: "https://51be3d6708344836a6f6586ec48b1e4b-476bca083d854b2a92cc8cfa4.fly.dev/proofs/preview123/request-revisions",
    });

    const result = await resend.emails.send({
      from: PROOF_EMAIL_FROM,
      to: email,
      subject: "Preview: Your Design Proof is Ready - Order #12345",
      html: sampleHtml,
    });

    if (result.error) {
      console.error("Error sending preview email:", result.error);
      return res.status(500).json({ error: "Failed to send email" });
    }

    res.json({
      success: true,
      message: `Preview email sent to ${email}`,
      emailId: result.data?.id,
    });
  } catch (error) {
    console.error("Send preview email error:", error);
    res.status(500).json({
      error: "Failed to send email",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
