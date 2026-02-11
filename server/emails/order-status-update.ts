export function generateOrderStatusUpdateEmail(params: {
  customerName: string;
  orderNumber: string;
  previousStatus: string;
  currentStatus: string;
  statusMessage: string;
  nextSteps: string;
  orderLink: string;
}): string {
  const {
    customerName,
    orderNumber,
    previousStatus,
    currentStatus,
    statusMessage,
    nextSteps,
    orderLink,
  } = params;

  const getStatusColor = (status: string): { bgColor: string; textColor: string; emoji: string } => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("pending") || statusLower.includes("received")) {
      return { bgColor: "#fef3c7", textColor: "#92400e", emoji: "⏳" };
    }
    if (statusLower.includes("confirmed") || statusLower.includes("approved")) {
      return { bgColor: "#dbeafe", textColor: "#1e40af", emoji: "✓" };
    }
    if (statusLower.includes("processing") || statusLower.includes("printing")) {
      return { bgColor: "#fce7f3", textColor: "#831843", emoji: "⚙️" };
    }
    if (statusLower.includes("shipped") || statusLower.includes("dispatched")) {
      return { bgColor: "#dcfce7", textColor: "#166534", emoji: "📦" };
    }
    if (statusLower.includes("delivered")) {
      return { bgColor: "#d1fae5", textColor: "#065f46", emoji: "✓" };
    }
    if (statusLower.includes("cancelled") || statusLower.includes("failed")) {
      return { bgColor: "#fee2e2", textColor: "#7f1d1d", emoji: "✕" };
    }
    return { bgColor: "#f3f4f6", textColor: "#374151", emoji: "📋" };
  };

  const statusInfo = getStatusColor(currentStatus);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update - Stickerland</title>
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
      background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
      color: white;
      padding: 40px 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
      font-weight: bold;
    }
    .header p {
      margin: 0;
      opacity: 0.9;
      font-size: 16px;
    }
    .content {
      background-color: #ffffff;
      padding: 40px 30px;
      margin-bottom: 20px;
      border-radius: 0 0 8px 8px;
    }
    .content p {
      margin: 0 0 20px 0;
      color: #374151;
      font-size: 16px;
      line-height: 1.6;
    }
    .status-box {
      background-color: ${statusInfo.bgColor};
      border: 2px solid ${statusInfo.textColor};
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
    }
    .status-label {
      color: ${statusInfo.textColor};
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .status-value {
      color: ${statusInfo.textColor};
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .status-emoji {
      font-size: 28px;
      margin-right: 8px;
      display: inline-block;
    }
    .status-message {
      color: ${statusInfo.textColor};
      font-size: 14px;
      line-height: 1.5;
      margin-top: 12px;
    }
    .status-transition {
      background-color: #f3f4f6;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
      font-size: 13px;
      color: #374151;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 20px 0;
    }
    .info-item {
      background-color: #f9fafb;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #3b82f6;
    }
    .info-label {
      color: #6b7280;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .info-value {
      color: #1f2937;
      font-size: 16px;
      font-weight: bold;
    }
    .next-steps-box {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .next-steps-box h4 {
      margin: 0 0 10px 0;
      color: #1e40af;
      font-size: 14px;
      font-weight: 600;
    }
    .next-steps-box p {
      margin: 0;
      color: #1e40af;
      font-size: 14px;
      line-height: 1.5;
    }
    .cta-button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #3b82f6;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      text-align: center;
      margin: 20px 0;
    }
    .cta-button:hover {
      background-color: #2563eb;
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
      <h1>📋 Order Status Update</h1>
      <p>Your order status has changed</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p>Hi <strong>${customerName}</strong>,</p>

      <p>We have an update on your order. Your current status is shown below:</p>

      <!-- Status Box -->
      <div class="status-box">
        <div class="status-label">Current Order Status</div>
        <div class="status-value">
          <span class="status-emoji">${statusInfo.emoji}</span>
          ${currentStatus}
        </div>
        <div class="status-message">${statusMessage}</div>
      </div>

      <!-- Status Transition -->
      <div class="status-transition">
        <strong>Status Changed:</strong> ${previousStatus} → ${currentStatus}
      </div>

      <!-- Order Details -->
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Order Number</div>
          <div class="info-value">#${orderNumber}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Status</div>
          <div class="info-value">${currentStatus}</div>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="next-steps-box">
        <h4>What's Next?</h4>
        <p>${nextSteps}</p>
      </div>

      <a href="${orderLink}" class="cta-button">View Order Details</a>

      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        <strong>Need help?</strong> If you have any questions about your order or its status, 
        please don't hesitate to reach out to our support team. We're here to help!
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>© 2024 Stickerland. All rights reserved.</p>
      <p>Questions? Contact our support team anytime.</p>
    </div>
  </div>
</body>
</html>
  `;
}
