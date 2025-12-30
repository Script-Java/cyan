export function generateSignupConfirmationEmail(params: {
  customerName: string;
  email: string;
  verificationLink?: string;
}): string {
  const { customerName, email, verificationLink } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Sticky Slap</title>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    .content h2 {
      margin: 30px 0 15px 0;
      color: #1f2937;
      font-size: 20px;
    }
    .features {
      background-color: #f3f4f6;
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
    }
    .feature-item {
      margin: 10px 0;
      padding-left: 25px;
      position: relative;
      color: #374151;
    }
    .feature-item:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: bold;
      font-size: 18px;
    }
    .cta-button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      text-align: center;
      margin: 20px 0;
    }
    .cta-button:hover {
      background-color: #5568d3;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 12px;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🎨 Welcome to Sticky Slap</h1>
      <p>Your custom sticker design partner</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p>Hi <strong>${customerName}</strong>,</p>

      <p>Welcome aboard! We're thrilled to have you join the Sticky Slap community. Your account has been successfully created, and you're ready to start designing amazing custom stickers.</p>

      <h2>What you can do now:</h2>
      <div class="features">
        <div class="feature-item">Browse our product catalog</div>
        <div class="feature-item">Design your own custom stickers</div>
        <div class="feature-item">Track your orders in real-time</div>
        <div class="feature-item">Request design proofs and approvals</div>
        <div class="feature-item">Manage your account and preferences</div>
        <div class="feature-item">Build your design portfolio</div>
      </div>

      <p>Your account is associated with the email: <strong>${email}</strong></p>

      ${
        verificationLink
          ? `
      <p>Please confirm your email address to unlock all features:</p>
      <a href="${verificationLink}" class="cta-button">Verify Email Address</a>
      `
          : ""
      }

      <p>If you have any questions or need assistance getting started, don't hesitate to reach out to our support team. We're here to help!</p>

      <p>Happy designing!<br><strong>The Sticky Slap Team</strong></p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>© 2024 Sticky Slap. All rights reserved.</p>
      <p>${email}</p>
    </div>
  </div>
</body>
</html>
  `;
}
