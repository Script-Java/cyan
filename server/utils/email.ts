import { Resend } from "resend";
import { generateOrderConfirmationEmail } from "../emails/order-confirmation";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const ORDER_EMAIL_FROM = "orders@stickyslap.com";

export async function sendTicketCreationEmail(
  customerEmail: string,
  customerName: string,
  ticketId: string,
  subject: string,
): Promise<boolean> {
  try {
    if (!resend) {
      console.warn(
        "Resend API key not configured. Email sending disabled. Set RESEND_API_KEY environment variable to enable.",
      );
      return true; // Return true to not block the ticket creation
    }

    await resend.emails.send({
      from: "support@stickyslap.com",
      to: customerEmail,
      subject: `Support Ticket Confirmation - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Support Ticket Created</h1>
          </div>
          <div style="background: #f9fafb; padding: 40px 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${customerName},</p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Thank you for reaching out! We've received your support request and will get back to you as soon as possible.
            </p>
            
            <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase;">Ticket ID</p>
              <p style="color: #1f2937; font-size: 18px; font-weight: bold; margin: 0; font-family: monospace;">${ticketId}</p>
            </div>
            
            <div style="background: white; border: 1px solid #e5e7eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase;">Subject</p>
              <p style="color: #1f2937; font-size: 16px; margin: 0;">${subject}</p>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Our support team is working on your request. You'll receive an email notification as soon as we have an update.
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Please keep your Ticket ID for reference when following up on this request.
            </p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                Typical response time: 2-4 business hours
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              Best regards,<br>
              <strong>Sticky Slap Support Team</strong>
            </p>
          </div>
        </div>
      `,
    });

    console.log(`Ticket creation email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending ticket creation email:", error);
    return false;
  }
}

export async function sendTicketReplyEmail(
  customerEmail: string,
  customerName: string,
  ticketId: string,
  subject: string,
  replyMessage: string,
  adminName: string,
): Promise<boolean> {
  try {
    if (!resend) {
      console.warn(
        "Resend API key not configured. Email sending disabled. Set RESEND_API_KEY environment variable to enable.",
      );
      return true; // Return true to not block the reply
    }

    await resend.emails.send({
      from: "support@stickyslap.com",
      to: customerEmail,
      subject: `Re: ${subject} - Support Response`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">New Support Response</h1>
          </div>
          <div style="background: #f9fafb; padding: 40px 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${customerName},</p>

            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              ${adminName} from our support team has replied to your ticket:
            </p>

            <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase;">Ticket ID</p>
              <p style="color: #1f2937; font-size: 14px; font-weight: bold; margin: 0; font-family: monospace;">${ticketId}</p>
            </div>

            <div style="background: white; border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #1f2937; font-size: 16px; line-height: 1.8; white-space: pre-wrap;">${replyMessage}</p>
            </div>

            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #1e40af; font-size: 14px; margin: 0;">
                Log in to your account to view the full conversation and respond if needed.
              </p>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              Best regards,<br>
              <strong>Sticky Slap Support Team</strong>
            </p>
          </div>
        </div>
      `,
    });

    console.log(`Ticket reply email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending ticket reply email:", error);
    return false;
  }
}

export async function sendOrderConfirmationEmail(params: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    designFileUrl?: string;
    options?: Array<{ option_id: string; option_value: string }>;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  estimatedDelivery: string;
  orderLink: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    street: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  policies?: {
    returnAndRefund: boolean;
    privacy: boolean;
    gdpr: boolean;
    ccpa: boolean;
    terms: boolean;
    shipping: boolean;
  };
}): Promise<boolean> {
  try {
    if (!resend) {
      console.warn(
        "Resend API key not configured. Email sending disabled. Set RESEND_API_KEY environment variable to enable.",
      );
      return true; // Return true to not block order creation
    }

    const emailHtml = generateOrderConfirmationEmail(params);

    await resend.emails.send({
      from: ORDER_EMAIL_FROM,
      to: params.customerEmail,
      subject: `Order Confirmation - Order #${params.orderNumber}`,
      html: emailHtml,
    });

    console.log(`Order confirmation email sent to ${params.customerEmail}`, {
      orderNumber: params.orderNumber,
      itemCount: params.items.length,
    });
    return true;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return false;
  }
}
