export function generatePasswordResetEmail(params: {
  customerName: string;
  resetLink: string;
  expiresIn: string;
}): string {
  const { customerName, resetLink, expiresIn } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Sticky Slap</title>
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
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 40px 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: bold;
    }
    .header p {
      margin: 0;
      opacity: 0.9;
      font-size: 14px;
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
    .warning-box {
      background-color: #fef2f2;
      border-left: 4px solid #f87171;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning-box p {
      color: #991b1b;
      font-size: 14px;
      margin: 0;
    }
    .cta-button {
      display: inline-block;
      padding: 14px 35px;
      background-color: #f59e0b;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      text-align: center;
      margin: 25px 0;
      font-size: 16px;
    }
    .cta-button:hover {
      background-color: #d97706;
    }
    .info-box {
      background-color: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box p {
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
      <h1>🔐 Reset Your Password</h1>
      <p>We received a request to reset your Sticky Slap account password</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p>Hi <strong>${customerName}</strong>,</p>

      <p>We received a request to reset the password for your Sticky Slap account. Click the button below to create a new password.</p>

      <a href="${resetLink}" class="cta-button">Reset Password</a>

      <p style="text-align: center; color: #6b7280; font-size: 13px;">
        Or copy and paste this link in your browser:<br>
        <code style="background-color: #f3f4f6; padding: 8px 12px; border-radius: 4px; display: inline-block; word-break: break-all;">${resetLink}</code>
      </p>

      <!-- Warning Box -->
      <div class="warning-box">
        <p>
          <strong>⚠️ Important:</strong> This link will expire in ${expiresIn}. 
          If you didn't request a password reset, you can safely ignore this email. 
          Your account is secure.
        </p>
      </div>

      <!-- Info Box -->
      <div class="info-box">
        <p><strong>Security Tips:</strong></p>
        <p>• Never share your password with anyone</p>
        <p>• Use a strong, unique password</p>
        <p>• Enable two-factor authentication for added security</p>
      </div>

      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        If you have any questions or didn't request this reset, please contact our support team immediately.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>© 2024 Sticky Slap. All rights reserved.</p>
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
}
