import { formatOrderNumber } from "../utils/order";

export function generateProofEmailHtml(params: {
  customerName: string;
  orderId?: number;
  proofDescription: string;
  proofFileUrl?: string;
  approvalLink: string;
  revisionLink: string;
  referenceNumber?: string;
}): string {
  const {
    customerName,
    orderId,
    proofDescription,
    proofFileUrl,
    approvalLink,
    revisionLink,
    referenceNumber,
  } = params;

  const formattedOrderNumber = orderId ? formatOrderNumber(orderId) : null;

  const imageHtml = proofFileUrl
    ? `
        <div style="margin-bottom: 20px; border-radius: 6px; overflow: hidden; border: 1px solid #e5e7eb;">
          <img src="${proofFileUrl}" alt="Design Proof" style="width: 100%; height: auto; display: block;" />
        </div>
      `
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Design Proof is Ready</title>
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
      border-bottom: 2px solid #3b82f6;
      margin-bottom: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      color: #1f2937;
      font-size: 28px;
      font-weight: bold;
    }
    .header p {
      margin: 5px 0 0 0;
      color: #6b7280;
      font-size: 14px;
    }
    .content {
      background-color: #ffffff;
      padding: 30px;
      margin-bottom: 20px;
      border-radius: 0 0 8px 8px;
    }
    .content p {
      margin: 0 0 20px 0;
      color: #374151;
      font-size: 16px;
      line-height: 1.6;
    }
    .proof-box {
      background-color: #f0f9ff;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 20px;
    }
    .proof-box-title {
      margin: 0 0 10px 0;
      color: #1e40af;
      font-size: 14px;
      font-weight: bold;
    }
    .proof-box-text {
      margin: 0;
      color: #374151;
      font-size: 16px;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      font-size: 14px;
      text-align: center;
      border: none;
      cursor: pointer;
    }
    .button-approve {
      background-color: #10b981;
    }
    .button-approve:hover {
      background-color: #059669;
    }
    .button-revise {
      background-color: #f59e0b;
    }
    .button-revise:hover {
      background-color: #d97706;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 12px;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 0 0 10px 0;
    }
    .footer p:last-child {
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🎨 Your Design Proof is Ready</h1>
      <p>Review your design and let us know what you think</p>
    </div>

    <!-- Main Content -->
    <div class="content">
      <p>Hi <strong>${customerName}</strong>,</p>

      <p>Great news! Your design proof${
        referenceNumber
          ? ` for <strong>${referenceNumber}</strong>`
          : formattedOrderNumber
          ? ` for <strong>Order ${formattedOrderNumber}</strong>`
          : ""
      } is ready for review.</p>

      <!-- Proof Description -->
      <div class="proof-box">
        <p class="proof-box-title">Proof Details:</p>
        <p class="proof-box-text">${proofDescription}</p>
      </div>

      <!-- Preview Image -->
      ${imageHtml}

      <!-- Call to Action Buttons -->
      <div class="buttons">
        <a href="${approvalLink}" class="button button-approve">✓ Approve This Design</a>
        <a href="${revisionLink}" class="button button-revise">✎ Request Changes</a>
      </div>

      <p>If you have any questions about this design, please reply to this email and our team will get back to you as soon as possible.</p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>© 2024 Sticky Slap. All rights reserved.</p>
      <p>This is an automated message. Please do not reply to this email address directly.</p>
    </div>
  </div>
</body>
</html>
  `;
}
