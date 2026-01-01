import { RequestHandler } from "express";
import { generateProofEmailHtml } from "../emails/generate-proof-email";
import { generateSignupConfirmationEmail } from "../emails/signup-confirmation";
import { generateOrderConfirmationEmail } from "../emails/order-confirmation";
import { generateShippingConfirmationEmail } from "../emails/shipping-confirmation";
import { generatePasswordResetEmail } from "../emails/password-reset";
import { generateSupportTicketReplyEmail } from "../emails/support-ticket-reply";
import { generateOrderStatusUpdateEmail } from "../emails/order-status-update";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
const PROOF_EMAIL_FROM = "sticky@stickyslap.com";

export const handleProofEmailPreview: RequestHandler = async (req, res) => {
  try {
    const { email } = req.query;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const sampleHtml = generateProofEmailHtml({
      customerName: "John Doe",
      orderId: 12345,
      proofDescription: "Custom sticker design with your company logo and tagline.\n\nThe design features:\n- Vibrant color scheme\n- High-resolution graphics\n- Print-ready format\n\nPlease review and let us know if any changes are needed!",
      proofFileUrl: "https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=400&fit=crop",
      approvalLink: `${baseUrl}/proofs/sample_proof_123/approve`,
      revisionLink: `${baseUrl}/proofs/sample_proof_123/request-revisions`,
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

export const handleSignupConfirmationPreview: RequestHandler = (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const html = generateSignupConfirmationEmail({
    customerName: "Sarah Johnson",
    email: "sarah@example.com",
    verificationLink: `${baseUrl}/verify?token=sample_verification_token_123`,
  });
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
};

export const handleOrderConfirmationPreview: RequestHandler = (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const html = generateOrderConfirmationEmail({
    customerName: "John Smith",
    orderNumber: "SS-2024-001",
    orderDate: "December 15, 2024",
    items: [
      {
        name: "Custom Circle Stickers (100 units)",
        quantity: 1,
        price: 29.99,
        designFileUrl:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%2310b981' stroke='%23059669' stroke-width='2'/%3E%3Ctext x='50' y='50' font-size='20' fill='white' text-anchor='middle' dominant-baseline='central'%3EDESIGN%3C/text%3E%3C/svg%3E",
        options: [{ option_id: "size", option_value: "3 inch" }],
      },
      { name: "Glossy Finish", quantity: 1, price: 5.0, options: [] },
    ],
    subtotal: 34.99,
    tax: 2.8,
    shipping: 5.0,
    total: 42.79,
    estimatedDelivery: "Dec 22, 2024",
    orderLink: `${baseUrl}/order-history/12345`,
    shippingAddress: {
      firstName: "John",
      lastName: "Smith",
      street: "123 Main Street",
      street2: "Apt 4B",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "United States",
    },
    policies: {
      returnAndRefund: true,
      privacy: true,
      gdpr: true,
      ccpa: true,
      terms: true,
      shipping: true,
    },
  });
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
};

export const handleShippingConfirmationPreview: RequestHandler = (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const html = generateShippingConfirmationEmail({
    customerName: "John Smith",
    orderNumber: "SS-2024-001",
    trackingNumber: "1Z999AA10123456784",
    carrier: "UPS",
    trackingUrl: "https://www.ups.com/track?tracknum=1Z999AA10123456784",
    estimatedDelivery: "December 22, 2024",
    orderLink: `${baseUrl}/order-history/12345`,
  });
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
};

export const handlePasswordResetPreview: RequestHandler = (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const html = generatePasswordResetEmail({
    customerName: "Sarah Johnson",
    resetLink: `${baseUrl}/reset-password?token=sample_reset_token_abc123def456`,
    expiresIn: "1 hour",
  });
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
};

export const handleSupportTicketReplyPreview: RequestHandler = (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const html = generateSupportTicketReplyEmail({
    customerName: "Michael Chen",
    ticketNumber: "TKT-2024-0042",
    subject: "Question about sticker material options",
    response: `Hi Michael,

Thank you for reaching out! We're happy to help answer your question about our sticker materials.

We offer several options for your custom stickers:

1. Vinyl (Standard): Durable and weather-resistant, perfect for outdoor use
2. Glossy Finish: High-shine appearance with vibrant colors
3. Matte Finish: Subtle, professional look with reduced glare
4. Holographic: Eye-catching reflective surface for premium designs

All materials are high-quality and designed to last. The choice depends on your use case and aesthetic preferences.

Would you like recommendations for your specific project? Feel free to share more details about what you're planning!

Best regards,
Sticky Slap Support Team`,
    viewLink: `${baseUrl}/my-tickets/TKT-2024-0042`,
  });
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
};

export const handleOrderStatusUpdatePreview: RequestHandler = (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const html = generateOrderStatusUpdateEmail({
    customerName: "John Smith",
    orderNumber: "SS-2024-001",
    previousStatus: "Order Confirmed",
    currentStatus: "Processing",
    statusMessage: "Your order is now being prepared for production. Our team is working on bringing your design to life with precision and care.",
    nextSteps: "Your custom stickers will be carefully printed and inspected for quality. Once approved, they will be packaged and shipped to you. You'll receive a notification as soon as your order ships.",
    orderLink: `${baseUrl}/order-history/12345`,
  });
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
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
