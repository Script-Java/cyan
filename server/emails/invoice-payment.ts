export function generateInvoiceEmailHtml(
  customerName: string,
  invoiceNumber: string,
  total: string,
  dueDate: string,
  paymentLink: string,
  invoiceDetails?: {
    company?: string;
    notes?: string;
  },
): string {
  const formattedDueDate = new Date(dueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; color: #000; font-size: 32px; font-weight: bold;">Sticky Slap</h1>
        <p style="margin: 10px 0 0 0; color: #333; font-size: 14px;">Invoice Payment Required</p>
      </div>

      <!-- Main Content -->
      <div style="background: #ffffff; padding: 40px 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
        <!-- Greeting -->
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Hi ${customerName},
        </p>

        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          We've prepared an invoice for you. Please review the details below and complete payment by the due date.
        </p>

        <!-- Invoice Details -->
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 30px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: 600;">Invoice Number</p>
              <p style="color: #1f2937; font-size: 16px; margin: 0; font-weight: 600;">${invoiceNumber}</p>
            </div>
            <div>
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: 600;">Due Date</p>
              <p style="color: #1f2937; font-size: 16px; margin: 0; font-weight: 600;">${formattedDueDate}</p>
            </div>
            <div style="grid-column: 1 / -1;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: 600;">Amount Due</p>
              <p style="color: #059669; font-size: 28px; margin: 0; font-weight: bold;">$${total}</p>
            </div>
          </div>
        </div>

        ${
          invoiceDetails?.notes
            ? `
          <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: 600;">Notes</p>
            <p style="color: #1f2937; font-size: 14px; margin: 0; white-space: pre-wrap;">${invoiceDetails.notes}</p>
          </div>
        `
            : ""
        }

        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${paymentLink}" style="display: inline-block; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #000; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: 600; font-size: 16px; transition: transform 0.2s;">
            Pay Invoice Now
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0; text-align: center;">
          Or copy and paste this link in your browser:
          <br>
          <span style="color: #3b82f6; word-break: break-all;">${paymentLink}</span>
        </p>

        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            If you have any questions about this invoice, please reply to this email or contact our support team.
          </p>
          <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 0 0;">
            © ${new Date().getFullYear()} Sticky Slap. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;
}
