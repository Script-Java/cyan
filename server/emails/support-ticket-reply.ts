export function generateSupportTicketReplyEmail(params: {
  customerName: string;
  ticketNumber: string;
  subject: string;
  response: string;
  viewLink: string;
}): string {
  const { customerName, ticketNumber, subject, response, viewLink } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support Ticket Reply - Stickerland</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px 8px 0 0;
      border-bottom: 3px solid #8b5cf6;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      color: #1f2937;
      font-size: 24px;
      font-weight: bold;
    }
    .header p {
      margin: 0;
      color: #6b7280;
      font-size: 14px;
    }
    .content {
      background-color: #ffffff;
      padding: 30px;
      margin-bottom: 20px;
      border-radius: 8px;
    }
    .content p {
      margin: 0 0 20px 0;
      color: #374151;
      font-size: 16px;
      line-height: 1.6;
    }
    .ticket-info {
      background-color: #f3f4f6;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      border-left: 4px solid #8b5cf6;
    }
    .ticket-info-row {
      display: grid;
      grid-template-columns: 150px 1fr;
      gap: 15px;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    .ticket-info-row:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    .ticket-label {
      font-weight: 600;
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
    }
    .ticket-value {
      color: #1f2937;
      font-size: 14px;
    }
    .response-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .response-box p {
      color: #78350f;
      margin: 0;
      font-size: 15px;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .cta-button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #8b5cf6;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      text-align: center;
      margin: 20px 0;
    }
    .cta-button:hover {
      background-color: #7c3aed;
    }
    .reply-info {
      background-color: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .reply-info p {
      color: #1e40af;
      font-size: 13px;
      margin: 5px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 12px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>💬 Support Ticket Reply</h1>
      <p>We've responded to your support request</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p>Hi <strong>${customerName}</strong>,</p>

      <p>Thank you for reaching out to our support team. We've reviewed your inquiry and sent you a response. Please see the details below.</p>

      <!-- Ticket Information -->
      <div class="ticket-info">
        <div class="ticket-info-row">
          <div class="ticket-label">Ticket #</div>
          <div class="ticket-value">${ticketNumber}</div>
        </div>
        <div class="ticket-info-row">
          <div class="ticket-label">Subject</div>
          <div class="ticket-value">${subject}</div>
        </div>
      </div>

      <!-- Support Response -->
      <p style="margin-top: 25px; color: #1f2937; font-weight: 600;">Response from our team:</p>
      <div class="response-box">
        <p>${response}</p>
      </div>

      <!-- Reply Information -->
      <div class="reply-info">
        <p><strong>Want to respond?</strong> Click the button below to view your ticket and add a reply directly.</p>
      </div>

      <a href="${viewLink}" class="cta-button">View Ticket & Reply</a>

      <p style="margin-top: 30px; color: #6b7280; font-size: 13px;">
        Thank you for your patience and for choosing Stickerland. 
        If you need further assistance, our support team is always here to help!
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>© 2024 Stickerland. All rights reserved.</p>
      <p>Questions? Reply directly to this email or contact our support team.</p>
    </div>
  </div>
</body>
</html>
  `;
}
