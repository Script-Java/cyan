import { RequestHandler } from "express";

interface SupportSubmission {
  name: string;
  email: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
}

export interface SupportResponse {
  success: boolean;
  message: string;
  referenceId?: string;
}

export const handleSupportSubmit: RequestHandler = async (req, res) => {
  try {
    const { name, email, subject, category, priority, message } =
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

    // Generate reference ID
    const referenceId = `SUP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // TODO: Integrate with email service (SendGrid, Mailgun, Resend, etc.)
    // For now, we'll just log the submission
    console.log("Support Request Received:", {
      referenceId,
      timestamp: new Date().toISOString(),
      name,
      email,
      subject,
      category,
      priority,
      message,
    });

    // Send confirmation response
    const response: SupportResponse = {
      success: true,
      message: "Support request submitted successfully",
      referenceId,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error handling support submission:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process support request",
    });
  }
};
