export function generateOrderConfirmationEmail(params: {
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
  discount?: number;
  discountCode?: string;
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
}): string {
  const {
    customerName,
    orderNumber,
    orderDate,
    items,
    subtotal,
    tax,
    shipping,
    discount,
    discountCode,
    total,
    estimatedDelivery,
    orderLink,
    shippingAddress,
    policies,
  } = params;

  const itemsHtml = items
    .map(
      (item) => {
        const designThumbnail = item.designFileUrl
          ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #f3f4f6;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Design Preview</p>
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px; text-align: center;">
                ${
                  item.designFileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
                  item.designFileUrl.startsWith("data:image")
                    ? `<img src="${item.designFileUrl}" alt="Design thumbnail" style="max-width: 100%; max-height: 120px; border-radius: 3px;" />`
                    : `<p style="margin: 0; font-size: 12px; color: #9ca3af;">Design file uploaded</p>`
                }
              </div>
            </div>`
          : "";

        const optionsDisplay = item.options && item.options.length > 0
          ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #f3f4f6;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #9ca3af; text-transform: uppercase;">Specifications</p>
              <div style="font-size: 13px; color: #6b7280;">
                ${item.options.map((opt) => `<div>• ${opt.option_value}</div>`).join("")}
              </div>
            </div>`
          : "";

        return `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151;">
        <div>
          <strong>${item.name}</strong>
          ${optionsDisplay}
          ${designThumbnail}
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151; text-align: right;">$${item.price.toFixed(2)}</td>
    </tr>
  `;
      }
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - Sticky Slap</title>
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
      border-bottom: 2px solid #10b981;
      text-align: center;
      margin-bottom: 20px;
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
      border-radius: 8px;
    }
    .order-number {
      background-color: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    .order-number p {
      margin: 0;
      color: #374151;
    }
    .order-number strong {
      color: #059669;
      font-size: 18px;
      display: block;
      margin-top: 5px;
    }
    table {
      width: 100%;
      margin: 20px 0;
      border-collapse: collapse;
    }
    th {
      background-color: #f3f4f6;
      padding: 12px;
      text-align: left;
      color: #374151;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
    }
    .summary {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      color: #374151;
    }
    .summary-row.total {
      border-top: 2px solid #e5e7eb;
      padding-top: 12px;
      margin-top: 12px;
      font-weight: bold;
      font-size: 18px;
      color: #1f2937;
    }
    .cta-button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #10b981;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      text-align: center;
      margin: 20px 0;
    }
    .cta-button:hover {
      background-color: #059669;
    }
    .delivery-info {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .delivery-info p {
      margin: 0;
      color: #1e40af;
      font-size: 14px;
    }
    .delivery-info strong {
      color: #1e40af;
      display: block;
      font-size: 16px;
      margin-bottom: 5px;
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
      <h1>✓ Order Confirmed</h1>
      <p>Thank you for your order! We're preparing your custom stickers.</p>
    </div>

    <!-- Main Content -->
    <div class="content">
      <p>Hi <strong>${customerName}</strong>,</p>

      <div class="order-number">
        <p>Order Number:</p>
        <strong>#${orderNumber}</strong>
        <p style="margin-top: 8px; font-size: 13px;">Placed on ${orderDate}</p>
      </div>

      <p>We've received your order and it's now being prepared for production. Your custom stickers will be carefully crafted with attention to detail and quality.</p>

      <h3 style="color: #1f2937; margin-top: 25px; margin-bottom: 15px;">Order Summary</h3>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping:</span>
          <span>$${shipping.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Tax:</span>
          <span>$${tax.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
          <span>Total:</span>
          <span>$${total.toFixed(2)}</span>
        </div>
      </div>

      <div class="delivery-info">
        <strong>📦 Estimated Delivery</strong>
        <p>${estimatedDelivery}</p>
      </div>

      <a href="${orderLink}" class="cta-button">Track Your Order</a>

      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        <strong>What happens next?</strong><br>
        Our team will prepare your design for production. You'll receive a proof for approval before we begin printing. Once approved, your stickers will be printed, quality checked, and shipped to your address.
      </p>

      ${
        shippingAddress
          ? `
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-top: 30px;">
        <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 15px; font-size: 16px;">📦 Shipping Address</h3>
        <div style="color: #374151; font-size: 14px; line-height: 1.6;">
          <strong>${shippingAddress.firstName} ${shippingAddress.lastName}</strong><br>
          ${shippingAddress.street}${shippingAddress.street2 ? `<br>${shippingAddress.street2}` : ""}<br>
          ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}<br>
          ${shippingAddress.country}
        </div>
      </div>
      `
          : ""
      }

      ${
        policies
          ? `
      <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 20px; margin-top: 30px;">
        <h3 style="color: #166534; margin-top: 0; margin-bottom: 15px; font-size: 16px;">✓ Policies & Agreements</h3>
        <div style="color: #365314; font-size: 13px; line-height: 1.8; space-y: 8px;">
          ${policies.returnAndRefund ? `<div style="margin-bottom: 8px;">✓ Return & Refund Policy acknowledged</div>` : ""}
          ${policies.privacy ? `<div style="margin-bottom: 8px;">✓ Privacy Policy agreed</div>` : ""}
          ${policies.gdpr ? `<div style="margin-bottom: 8px;">✓ GDPR data processing consent confirmed</div>` : ""}
          ${policies.ccpa ? `<div style="margin-bottom: 8px;">✓ CCPA privacy rights acknowledged</div>` : ""}
          ${policies.terms ? `<div style="margin-bottom: 8px;">✓ Terms of Service agreed</div>` : ""}
          ${policies.shipping ? `<div style="margin-bottom: 0;">✓ Shipping Policy agreed</div>` : ""}
        </div>
      </div>
      `
          : ""
      }
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
