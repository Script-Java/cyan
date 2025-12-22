# PCI DSS Compliance Section for Terms of Service

Add the following section to your Terms of Service in the Admin Legal Pages panel. Go to `/admin/legal-pages` and edit or create your Terms of Service with this content.

---

## Payment Security & PCI Compliance

### 1. Payment Processing
We process all payments securely through Square Payment Systems, a Payment Card Industry Data Security Standard (PCI DSS) Level 1 certified payment processor. Square maintains the highest level of PCI DSS certification, ensuring your payment information is processed with the most stringent security measures.

### 2. No Credit Card Storage
We do not collect, store, transmit, or retain your complete credit card information on our servers. Your credit card data is tokenized and processed directly by Square's secure payment gateway. Only Square has access to your full payment card details, which are protected under PCI DSS Level 1 compliance standards.

### 3. Security Standards
Our website implements the following security measures to protect your personal and financial information:

- **HTTPS/SSL Encryption**: All data transmitted between your browser and our servers is encrypted using industry-standard SSL/TLS encryption protocols.
- **Secure Socket Layer (SSL)**: We use 256-bit SSL encryption to protect payment transactions.
- **Content Security Policy**: We implement strict content security policies to prevent unauthorized access and data interception.
- **Security Headers**: We employ security headers including HSTS (HTTP Strict Transport Security), X-Frame-Options, and X-Content-Type-Options to protect against common web vulnerabilities.
- **No Cache on Sensitive Pages**: Checkout and payment pages implement no-cache headers to prevent sensitive information from being stored in browser caches.

### 4. PCI DSS Compliance Statement
By using our payment services, you acknowledge that:
- Your payment card information is processed exclusively by Square Payment Systems
- Square is certified to PCI DSS Level 1 standards
- We comply with all applicable PCI DSS requirements for handling and protecting payment information
- Your financial data is encrypted and never stored on our infrastructure

### 5. Data Protection
Your personal information (email, address, order history) is stored securely on our servers with the following protections:
- Encrypted database storage
- Access controls and authentication requirements
- Regular security audits and updates
- Compliance with applicable data protection regulations (GDPR, CCPA)

### 6. Third-Party Payment Processor
We use Square Payment Systems for all payment processing. Square's privacy policy and security practices apply to payment information. You can review Square's security practices at: https://squareup.com/en-us/security

### 7. Your Responsibility
You agree to:
- Provide accurate payment information
- Not share your payment card details through email or unsecured channels
- Report any unauthorized transactions immediately
- Use strong, unique passwords for your account
- Keep your payment information up to date

### 8. Limitation of Liability
To the fullest extent permitted by law, we shall not be liable for any unauthorized use of your payment card information that results from your own negligence, failure to protect your account credentials, or use of our services on unsecured networks.

### 9. Contact for Security Issues
If you have concerns about the security of your payment information or detect unauthorized transactions, please contact us immediately at: [support@stickyhub.com](mailto:support@stickyhub.com)

---

## Instructions for Admin Panel

1. Go to `/admin/legal-pages`
2. Click "Create Legal Page" if you don't have a Terms of Service yet
3. Select "Terms of Service" as the page type
4. Add a title: "Terms of Service"
5. Copy and paste the content above into the content field (you can customize it with your contact email and company details)
6. Set visibility to "visible"
7. Save the page

The PCI compliance section will then be displayed to customers at `/terms` and referenced in the checkout flow.

---

## Additional Security Notes

- All of the security headers mentioned above are automatically configured in the server code
- The checkout page displays PCI DSS compliance badges to reassure customers
- Customers are required to acknowledge privacy and data protection terms before checkout
- GDPR and CCPA compliance notices are integrated into the checkout flow
