export function generateShippingConfirmationEmail(params: {
  customerName: string;
  orderNumber: string;
  trackingNumber: string;
  carrier: string;
  trackingUrl: string;
  estimatedDelivery: string;
  orderLink: string;
}): string {
  const {
    customerName,
    orderNumber,
    trackingNumber,
    carrier,
    trackingUrl,
    estimatedDelivery,
    orderLink,
  } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Has Shipped - Sticky Slap</title>
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
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
    .tracking-box {
      background-color: #f0fdf4;
      border: 2px solid #10b981;
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
    }
    .tracking-label {
      color: #059669;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .tracking-number {
      color: #1f2937;
      font-size: 24px;
      font-weight: bold;
      font-family: monospace;
      margin-bottom: 15px;
    }
    .tracking-carrier {
      color: #374151;
      font-size: 14px;
    }
    .tracking-button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #10b981;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      text-align: center;
      margin-top: 15px;
      font-size: 14px;
    }
    .tracking-button:hover {
      background-color: #059669;
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
    .next-steps {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .next-steps p {
      color: #92400e;
      margin: 0;
      font-size: 14px;
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
      <h1>📦 Your Order Has Shipped!</h1>
      <p>Your custom stickers are on their way</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p>Hi <strong>${customerName}</strong>,</p>

      <p>Great news! Your order has been printed with care and shipped out. Your custom stickers are now on their way to you.</p>

      <!-- Tracking Information -->
      <div class="tracking-box">
        <div class="tracking-label">Tracking Number</div>
        <div class="tracking-number">${trackingNumber}</div>
        <div class="tracking-carrier">Carrier: ${carrier}</div>
        <a href="${trackingUrl}" class="tracking-button">Track Package →</a>
      </div>

      <!-- Order Details -->
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Order Number</div>
          <div class="info-value">#${orderNumber}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Estimated Delivery</div>
          <div class="info-value">${estimatedDelivery}</div>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="next-steps">
        <p>
          <strong>What's next?</strong> Monitor your shipment using the tracking number above. 
          Your stickers should arrive within the estimated delivery window. If you have any issues, 
          our support team is here to help!
        </p>
      </div>

      <a href="${orderLink}" class="cta-button">View Full Order Details</a>

      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        Thank you for choosing Sticky Slap for your custom sticker needs. We hope you love your designs!
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>© 2024 Sticky Slap. All rights reserved.</p>
      <p>Questions? Contact our support team anytime.</p>
    </div>
  </div>
</body>
</html>
  `;
}
