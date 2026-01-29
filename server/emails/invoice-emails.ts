export function generateInvoiceSentEmail(params: {
  customerName: string;
  invoiceNumber: string;
  total: number;
  dueDate: string;
  paymentLink: string;
}): string {
  const { customerName, invoiceNumber, total, dueDate, paymentLink } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h1 style="margin-top: 0; color: #1f2937; font-size: 28px;">Invoice #${invoiceNumber}</h1>
      
      <p style="color: #4b5563; font-size: 16px;">
        Hi ${customerName},
      </p>
      
      <p style="color: #4b5563; line-height: 1.6;">
        We've sent you an invoice for your recent order. Please review the details below and proceed with payment.
      </p>

      <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0; color: #166534; font-size: 18px; font-weight: bold;">
          Total Due: $${total.toFixed(2)}
        </p>
        <p style="margin: 8px 0 0 0; color: #166534; font-size: 14px;">
          Due: ${new Date(dueDate).toLocaleDateString()}
        </p>
      </div>

      <div style="margin: 30px 0;">
        <a href="${paymentLink}" style="display: inline-block; background-color: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
          View & Pay Invoice
        </a>
      </div>

      <p style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
        Questions? Reply to this email or contact our support team.
      </p>

      <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
        © 2024 Sticky Slap. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateInvoicePaidEmail(params: {
  customerName: string;
  invoiceNumber: string;
  total: number;
  paidDate: string;
}): string {
  const { customerName, invoiceNumber, total, paidDate } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Received</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 48px; margin-bottom: 10px;">✓</div>
        <h1 style="margin: 0; color: #10b981; font-size: 28px;">Payment Received</h1>
      </div>

      <p style="color: #4b5563; font-size: 16px; text-align: center;">
        Thank you for your payment!
      </p>

      <div style="background-color: #f0fdf4; border: 1px solid #86efac; padding: 20px; border-radius: 6px; margin: 30px 0;">
        <table style="width: 100%; text-align: left; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #166534;">Invoice #</td>
            <td style="padding: 8px 0; text-align: right; color: #166534; font-weight: bold;">${invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #166534;">Amount Paid</td>
            <td style="padding: 8px 0; text-align: right; color: #166534; font-weight: bold;">$${total.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #166534;">Payment Date</td>
            <td style="padding: 8px 0; text-align: right; color: #166534; font-weight: bold;">${new Date(paidDate).toLocaleDateString()}</td>
          </tr>
        </table>
      </div>

      <p style="color: #4b5563; line-height: 1.6;">
        Your invoice is now marked as paid. You will receive a receipt via email shortly. If you have any questions, please don't hesitate to contact us.
      </p>

      <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
        © 2024 Sticky Slap. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateInvoiceCanceledEmail(params: {
  customerName: string;
  invoiceNumber: string;
  reason?: string;
}): string {
  const { customerName, invoiceNumber, reason } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice Canceled</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h1 style="margin-top: 0; color: #1f2937; font-size: 28px;">Invoice Canceled</h1>

      <p style="color: #4b5563; font-size: 16px;">
        Hi ${customerName},
      </p>

      <p style="color: #4b5563; line-height: 1.6;">
        Invoice #${invoiceNumber} has been canceled. No payment is required.
      </p>

      ${reason ? `
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; color: #7f1d1d; font-size: 14px;">
            <strong>Reason:</strong> ${reason}
          </p>
        </div>
      ` : ''}

      <p style="color: #4b5563; line-height: 1.6;">
        If you have any questions about this cancellation, please contact our support team.
      </p>

      <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
        © 2024 Sticky Slap. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
