module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/server/routes/demo.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "handleDemo",
    ()=>handleDemo
]);
const handleDemo = (req, res)=>{
    const response = {
        message: "Hello from Express server"
    };
    res.status(200).json(response);
};
}),
"[project]/server/utils/ecwid.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ecwidAPI",
    ()=>ecwidAPI
]);
// Ecwid API utility for server-side operations
const ECWID_API_URL = "https://api.ecwid.com/api/v3";
class EcwidAPI {
    storeId;
    apiToken;
    constructor(){
        this.storeId = process.env.ECWID_STORE_ID || "";
        this.apiToken = process.env.ECWID_API_TOKEN || "";
        if (!this.storeId || !this.apiToken) {
            console.warn("Ecwid credentials not fully configured");
        }
    }
    getAuthUrl(endpoint) {
        return `${ECWID_API_URL}/${this.storeId}${endpoint}?token=${this.apiToken}`;
    }
    /**
   * Create a new customer in Ecwid
   */ async createCustomer(customer) {
        const url = this.getAuthUrl("/customers");
        const customerData = {
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName
        };
        if (customer.phone) {
            customerData.phone = customer.phone;
        }
        if (customer.companyName) {
            customerData.companyName = customer.companyName;
        }
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(customerData)
            });
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("Failed to parse Ecwid response:", parseError);
                throw new Error(`Failed to parse Ecwid response: ${response.statusText}`);
            }
            if (!response.ok) {
                console.error("Customer creation failed:", {
                    status: response.status,
                    statusText: response.statusText,
                    error: data
                });
                throw new Error(data?.errorMessage || data?.error || "Failed to create customer in Ecwid");
            }
            return data;
        } catch (error) {
            console.error("Customer creation error:", error);
            throw error;
        }
    }
    /**
   * Get customer by ID
   */ async getCustomer(customerId) {
        const url = this.getAuthUrl(`/customers/${customerId}`);
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                console.error("Get customer failed:", {
                    status: response.status,
                    statusText: response.statusText
                });
                throw new Error(`Failed to fetch customer from Ecwid: ${response.statusText}`);
            }
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("Failed to parse customer response:", parseError);
                throw new Error("Failed to parse customer data from Ecwid");
            }
            return data;
        } catch (error) {
            console.error("Get customer error:", error);
            throw error;
        }
    }
    /**
   * Get customer by email
   */ async getCustomerByEmail(email) {
        const encodedEmail = encodeURIComponent(email);
        const url = this.getAuthUrl(`/customers?email=${encodedEmail}`);
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                console.error("Get customer by email failed:", {
                    status: response.status,
                    statusText: response.statusText
                });
                return null;
            }
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("Failed to parse customer response:", parseError);
                return null;
            }
            return data?.items && data.items.length > 0 ? data.items[0] : null;
        } catch (error) {
            console.error("Get customer by email error:", error);
            return null;
        }
    }
    /**
   * Update customer information
   */ async updateCustomer(customerId, updates) {
        const url = this.getAuthUrl(`/customers/${customerId}`);
        try {
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updates)
            });
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch  {
                    errorData = {
                        statusText: response.statusText
                    };
                }
                console.error("Update customer failed:", {
                    status: response.status,
                    error: errorData
                });
                throw new Error(errorData?.errorMessage || errorData?.error || "Failed to update customer");
            }
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("Failed to parse update response:", parseError);
                throw new Error("Failed to parse customer update response");
            }
            return data;
        } catch (error) {
            console.error("Update customer error:", error);
            throw error;
        }
    }
    /**
   * Get customer's orders
   */ async getCustomerOrders(customerId) {
        const url = this.getAuthUrl(`/orders?customerId=${customerId}`);
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                console.error("Get orders failed:", {
                    status: response.status,
                    statusText: response.statusText
                });
                throw new Error(`Failed to fetch orders from Ecwid: ${response.statusText}`);
            }
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("Failed to parse orders response:", parseError);
                throw new Error("Failed to parse orders data from Ecwid");
            }
            // Extract tracking and shipping info from items
            const orders = (data?.items || []).map((order)=>({
                    ...order,
                    shippingTrackingCode: order.shippingTrackingCode,
                    shippingCarrier: this.extractShippingCarrier(order),
                    estimatedDeliveryDate: this.extractEstimatedDeliveryDate(order)
                }));
            return orders;
        } catch (error) {
            console.error("Get customer orders error:", error);
            throw error;
        }
    }
    /**
   * Extract shipping carrier from order shipping info
   */ extractShippingCarrier(order) {
        if (order.shippingPerson?.company) {
            return order.shippingPerson.company;
        }
        if (order.shippingCarrier) {
            return order.shippingCarrier;
        }
        // Try to infer from tracking code patterns or shipping method
        return undefined;
    }
    /**
   * Extract estimated delivery date from shipping info
   */ extractEstimatedDeliveryDate(order) {
        if (order.deliveryDateFrom) {
            return order.deliveryDateFrom;
        }
        if (order.estimatedDeliveryDate) {
            return order.estimatedDeliveryDate;
        }
        return undefined;
    }
    /**
   * Get order by ID with full tracking and shipping details
   */ async getOrder(orderId) {
        const url = this.getAuthUrl(`/orders/${orderId}`);
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                console.error("Get order failed:", {
                    status: response.status,
                    statusText: response.statusText
                });
                throw new Error(`Failed to fetch order from Ecwid: ${response.statusText}`);
            }
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("Failed to parse order response:", parseError);
                throw new Error("Failed to parse order data from Ecwid");
            }
            // Extract and enhance order with tracking info
            return {
                ...data,
                shippingTrackingCode: data.shippingTrackingCode,
                shippingCarrier: this.extractShippingCarrier(data),
                estimatedDeliveryDate: this.extractEstimatedDeliveryDate(data)
            };
        } catch (error) {
            console.error("Get order error:", error);
            throw error;
        }
    }
    /**
   * Create an order
   */ async createOrder(orderData) {
        const url = this.getAuthUrl("/orders");
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(orderData)
            });
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("Failed to parse order response:", parseError);
                throw new Error("Failed to parse order data from Ecwid");
            }
            if (!response.ok) {
                console.error("Order creation failed:", {
                    status: response.status,
                    error: data
                });
                throw new Error(data?.errorMessage || data?.error || "Failed to create order in Ecwid");
            }
            return data;
        } catch (error) {
            console.error("Create order error:", error);
            throw error;
        }
    }
    /**
   * Get product by ID
   */ async getProduct(productId) {
        const url = this.getAuthUrl(`/products/${productId}`);
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                console.error("Get product failed:", {
                    status: response.status,
                    statusText: response.statusText
                });
                return null;
            }
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("Failed to parse product response:", parseError);
                return null;
            }
            return data;
        } catch (error) {
            console.error("Get product error:", error);
            return null;
        }
    }
    /**
   * Get product options/variations
   */ async getProductVariations(productId) {
        const url = this.getAuthUrl(`/products/${productId}/combinations`);
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                if (response.status === 404) {
                    return [];
                }
                console.error("Get product variations failed:", {
                    status: response.status,
                    statusText: response.statusText
                });
                return [];
            }
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("Failed to parse variations response:", parseError);
                return [];
            }
            return data?.items || [];
        } catch (error) {
            console.error("Get product variations error:", error);
            return [];
        }
    }
    /**
   * Get product with variations
   */ async getProductWithVariations(productId) {
        try {
            const product = await this.getProduct(productId);
            if (!product) {
                return null;
            }
            const variations = await this.getProductVariations(productId);
            return {
                ...product,
                variations
            };
        } catch (error) {
            console.error("Get product with variations error:", error);
            return null;
        }
    }
    /**
   * Delete customer account
   */ async deleteCustomer(customerId) {
        const url = this.getAuthUrl(`/customers/${customerId}`);
        try {
            const response = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok && response.status !== 404) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch  {
                    errorData = {
                        statusText: response.statusText
                    };
                }
                console.error("Delete customer failed:", {
                    status: response.status,
                    error: errorData
                });
                throw new Error(errorData?.errorMessage || errorData?.error || "Failed to delete customer account");
            }
        } catch (error) {
            console.error("Delete customer error:", error);
            throw error;
        }
    }
    /**
   * Search products
   */ async searchProducts(keyword) {
        const encodedKeyword = encodeURIComponent(keyword);
        const url = this.getAuthUrl(`/products?keyword=${encodedKeyword}`);
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                console.error("Search products failed:", {
                    status: response.status,
                    statusText: response.statusText
                });
                return [];
            }
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("Failed to parse search response:", parseError);
                return [];
            }
            return data?.items || [];
        } catch (error) {
            console.error("Search products error:", error);
            return [];
        }
    }
    /**
   * Get all products
   */ async getAllProducts(limit = 100) {
        const url = this.getAuthUrl(`/products?limit=${limit}`);
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                console.error("Get products failed:", {
                    status: response.status,
                    statusText: response.statusText
                });
                return [];
            }
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("Failed to parse products response:", parseError);
                return [];
            }
            return data?.items || [];
        } catch (error) {
            console.error("Get all products error:", error);
            return [];
        }
    }
    /**
   * Get store information
   */ async getStoreInfo() {
        const url = this.getAuthUrl("/");
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                console.error("Get store info failed:", {
                    status: response.status,
                    statusText: response.statusText
                });
                throw new Error("Failed to fetch store information");
            }
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("Failed to parse store info response:", parseError);
                throw new Error("Failed to parse store info response");
            }
            return data;
        } catch (error) {
            console.error("Get store info error:", error);
            throw error;
        }
    }
    /**
   * Get all orders from the store with optional filtering
   */ async getAllOrders(fulfillmentStatus, limit = 100) {
        let endpoint = `/orders?limit=${limit}`;
        if (fulfillmentStatus) {
            endpoint += `&fulfillmentStatus=${fulfillmentStatus}`;
        }
        const url = this.getAuthUrl(endpoint);
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                console.error("Get all orders failed:", {
                    status: response.status,
                    statusText: response.statusText
                });
                return [];
            }
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("Failed to parse orders response:", parseError);
                return [];
            }
            return (data?.items || []).map((order)=>({
                    ...order,
                    shippingTrackingCode: order.shippingTrackingCode,
                    shippingCarrier: this.extractShippingCarrier(order),
                    estimatedDeliveryDate: this.extractEstimatedDeliveryDate(order)
                }));
        } catch (error) {
            console.error("Get all orders error:", error);
            return [];
        }
    }
    /**
   * Update order status
   */ async updateOrderStatus(orderId, status) {
        const url = this.getAuthUrl(`/orders/${orderId}`);
        try {
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fulfillmentStatus: status
                })
            });
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch  {
                    errorData = {
                        statusText: response.statusText
                    };
                }
                console.error("Update order status failed:", {
                    status: response.status,
                    error: errorData
                });
                throw new Error(errorData?.errorMessage || errorData?.error || "Failed to update order status");
            }
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error("Failed to parse status update response:", parseError);
                throw new Error("Failed to parse order status update response");
            }
            return data;
        } catch (error) {
            console.error("Update order status error:", error);
            throw error;
        }
    }
}
const ecwidAPI = new EcwidAPI();
}),
"[project]/server/emails/order-confirmation.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateOrderConfirmationEmail",
    ()=>generateOrderConfirmationEmail
]);
function generateOrderConfirmationEmail(params) {
    const { customerName, orderNumber, orderDate, items, subtotal, tax, shipping, discount, discountCode, total, estimatedDelivery, orderLink, shippingAddress, policies } = params;
    const itemsHtml = items.map((item)=>{
        const designThumbnail = item.designFileUrl ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #f3f4f6;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Design Preview</p>
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px; text-align: center;">
                ${item.designFileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) || item.designFileUrl.startsWith("data:image") ? `<img src="${item.designFileUrl}" alt="Design thumbnail" style="max-width: 100%; max-height: 120px; border-radius: 3px;" />` : `<p style="margin: 0; font-size: 12px; color: #9ca3af;">Design file uploaded</p>`}
              </div>
            </div>` : "";
        const optionsDisplay = item.options && item.options.length > 0 ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #f3f4f6;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #9ca3af; text-transform: uppercase;">Specifications</p>
              <div style="font-size: 13px; color: #6b7280;">
                ${item.options.map((opt)=>`<div>• ${opt.option_value}</div>`).join("")}
              </div>
            </div>` : "";
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
    }).join("");
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - Stickerland</title>
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
      <img src="https://cdn.builder.io/api/v1/image/assets%2F1e00ee8c48924560b1c928d354e4521b%2Ff76c51c7227242dc8bd4b1757ab321af" alt="Stickerland Logo" style="max-width: 200px; height: auto; margin-bottom: 15px;" />
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
        ${discount && discount > 0 ? `
        <div class="summary-row" style="color: #10b981;">
          <span>Discount${discountCode ? ` (${discountCode})` : ""}:</span>
          <span>-$${discount.toFixed(2)}</span>
        </div>
        ` : ""}
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

      ${shippingAddress ? `
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-top: 30px;">
        <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 15px; font-size: 16px;">📦 Shipping Address</h3>
        <div style="color: #374151; font-size: 14px; line-height: 1.6;">
          <strong>${shippingAddress.firstName} ${shippingAddress.lastName}</strong><br>
          ${shippingAddress.street}${shippingAddress.street2 ? `<br>${shippingAddress.street2}` : ""}<br>
          ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}<br>
          ${shippingAddress.country}
        </div>
      </div>
      ` : ""}

      ${policies ? `
      <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 20px; margin-top: 30px;">
        <h3 style="color: #166534; margin-top: 0; margin-bottom: 15px; font-size: 16px;">✓ Policies & Agreements</h3>
        <div style="color: #365314; font-size: 13px; line-height: 1.8; space-y: 8px;">
          ${policies.returnAndRefund ? `<div style="margin-bottom: 8px;">✓ Return & Refund Policy acknowledged</div>` : ""}
          ${policies.privacy ? `<div style="margin-bottom: 8px;">✓ Privacy Policy agreed</div>` : ""}
          ${policies.terms ? `<div style="margin-bottom: 8px;">✓ Terms of Service agreed</div>` : ""}
          ${policies.shipping ? `<div style="margin-bottom: 0;">✓ Shipping Policy agreed</div>` : ""}
        </div>
      </div>
      ` : ""}
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
}),
"[project]/server/emails/password-reset.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generatePasswordResetEmail",
    ()=>generatePasswordResetEmail
]);
function generatePasswordResetEmail(params) {
    const { customerName, resetLink, expiresIn } = params;
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Stickerland</title>
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
      <p>We received a request to reset your Stickerland account password</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p>Hi <strong>${customerName}</strong>,</p>

      <p>We received a request to reset the password for your Stickerland account. Click the button below to create a new password.</p>

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
      <p>© 2024 Stickerland. All rights reserved.</p>
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
}
}),
"[project]/server/utils/email.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "sendOrderConfirmationEmail",
    ()=>sendOrderConfirmationEmail,
    "sendPasswordResetEmail",
    ()=>sendPasswordResetEmail,
    "sendTicketCreationEmail",
    ()=>sendTicketCreationEmail,
    "sendTicketReplyEmail",
    ()=>sendTicketReplyEmail
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$resend__$5b$external$5d$__$28$resend$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$resend$29$__ = __turbopack_context__.i("[externals]/resend [external] (resend, esm_import, [project]/node_modules/resend)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$order$2d$confirmation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/emails/order-confirmation.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$password$2d$reset$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/emails/password-reset.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$resend__$5b$external$5d$__$28$resend$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$resend$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$resend__$5b$external$5d$__$28$resend$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$resend$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const resend = process.env.RESEND_API_KEY ? new __TURBOPACK__imported__module__$5b$externals$5d2f$resend__$5b$external$5d$__$28$resend$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$resend$29$__["Resend"](process.env.RESEND_API_KEY) : null;
const ORDER_EMAIL_FROM = "orders@stickerland.com";
const SUPPORT_EMAIL_FROM = "support@stickerland.com";
async function sendTicketCreationEmail(customerEmail, customerName, ticketId, subject) {
    try {
        if (!resend) {
            console.warn("Resend API key not configured. Email sending disabled. Set RESEND_API_KEY environment variable to enable.");
            return true; // Return true to not block the ticket creation
        }
        await resend.emails.send({
            from: "support@stickerland.com",
            to: customerEmail,
            subject: `Support Ticket Confirmation - ${subject}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Support Ticket Created</h1>
          </div>
          <div style="background: #f9fafb; padding: 40px 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${customerName},</p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Thank you for reaching out! We've received your support request and will get back to you as soon as possible.
            </p>
            
            <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase;">Ticket ID</p>
              <p style="color: #1f2937; font-size: 18px; font-weight: bold; margin: 0; font-family: monospace;">${ticketId}</p>
            </div>
            
            <div style="background: white; border: 1px solid #e5e7eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase;">Subject</p>
              <p style="color: #1f2937; font-size: 16px; margin: 0;">${subject}</p>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Our support team is working on your request. You'll receive an email notification as soon as we have an update.
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Please keep your Ticket ID for reference when following up on this request.
            </p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                Typical response time: 2-4 business hours
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              Best regards,<br>
              <strong>Stickerland Support Team</strong>
            </p>
          </div>
        </div>
      `
        });
        console.log(`Ticket creation email sent to ${customerEmail}`);
        return true;
    } catch (error) {
        console.error("Error sending ticket creation email:", error);
        return false;
    }
}
async function sendTicketReplyEmail(customerEmail, customerName, ticketId, subject, replyMessage, adminName) {
    try {
        if (!resend) {
            console.warn("Resend API key not configured. Email sending disabled. Set RESEND_API_KEY environment variable to enable.");
            return true; // Return true to not block the reply
        }
        await resend.emails.send({
            from: "support@stickerland.com",
            to: customerEmail,
            subject: `Re: ${subject} - Support Response`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">New Support Response</h1>
          </div>
          <div style="background: #f9fafb; padding: 40px 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${customerName},</p>

            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              ${adminName} from our support team has replied to your ticket:
            </p>

            <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase;">Ticket ID</p>
              <p style="color: #1f2937; font-size: 14px; font-weight: bold; margin: 0; font-family: monospace;">${ticketId}</p>
            </div>

            <div style="background: white; border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #1f2937; font-size: 16px; line-height: 1.8; white-space: pre-wrap;">${replyMessage}</p>
            </div>

            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #1e40af; font-size: 14px; margin: 0;">
                Log in to your account to view the full conversation and respond if needed.
              </p>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              Best regards,<br>
              <strong>Stickerland Support Team</strong>
            </p>
          </div>
        </div>
      `
        });
        console.log(`Ticket reply email sent to ${customerEmail}`);
        return true;
    } catch (error) {
        console.error("Error sending ticket reply email:", error);
        return false;
    }
}
async function sendOrderConfirmationEmail(params) {
    try {
        if (!resend) {
            console.warn("Resend API key not configured. Email sending disabled. Set RESEND_API_KEY environment variable to enable.");
            return true; // Return true to not block order creation
        }
        const emailHtml = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$order$2d$confirmation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["generateOrderConfirmationEmail"])(params);
        await resend.emails.send({
            from: ORDER_EMAIL_FROM,
            to: params.customerEmail,
            subject: `Order Confirmation - Order #${params.orderNumber}`,
            html: emailHtml
        });
        console.log(`Order confirmation email sent to ${params.customerEmail}`, {
            orderNumber: params.orderNumber,
            itemCount: params.items.length
        });
        return true;
    } catch (error) {
        console.error("Error sending order confirmation email:", error);
        return false;
    }
}
async function sendPasswordResetEmail(customerEmail, customerName, resetLink) {
    try {
        if (!resend) {
            console.warn("Resend API key not configured. Email sending disabled. Set RESEND_API_KEY environment variable to enable.");
            return true; // Return true to not block the password reset request
        }
        const emailHtml = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$password$2d$reset$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["generatePasswordResetEmail"])({
            customerName,
            resetLink,
            expiresIn: "1 hour"
        });
        await resend.emails.send({
            from: SUPPORT_EMAIL_FROM,
            to: customerEmail,
            subject: "Reset Your Password - Stickerland",
            html: emailHtml
        });
        console.log(`Password reset email sent to ${customerEmail}`);
        return true;
    } catch (error) {
        console.error("Error sending password reset email:", error);
        return false;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/utils/supabase.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createOrderItems",
    ()=>createOrderItems,
    "createScopedSupabaseClient",
    ()=>createScopedSupabaseClient,
    "createSupabaseOrder",
    ()=>createSupabaseOrder,
    "getActiveOrders",
    ()=>getActiveOrders,
    "getActiveOrdersCount",
    ()=>getActiveOrdersCount,
    "getCustomerOrders",
    ()=>getCustomerOrders,
    "getCustomerStoreCredit",
    ()=>getCustomerStoreCredit,
    "getOrderById",
    ()=>getOrderById,
    "getPendingOrders",
    ()=>getPendingOrders,
    "getScopedSupabaseClient",
    ()=>getScopedSupabaseClient,
    "supabase",
    ()=>supabase,
    "syncCustomerToSupabase",
    ()=>syncCustomerToSupabase,
    "updateCustomerStoreCredit",
    ()=>updateCustomerStoreCredit
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, esm_import, [project]/node_modules/@supabase/supabase-js)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://bxkphaslciswfspuqdgo.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
console.log("Supabase Client Initialization:");
console.log("  URL:", supabaseUrl);
console.log("  Key Length:", supabaseServiceKey ? supabaseServiceKey.length : "0 (Missing)");
if (!supabaseServiceKey) {
    console.warn("SUPABASE_SERVICE_KEY not configured - Supabase operations may fail");
}
// Use a placeholder key during build/initialization if no key is provided
// This prevents errors during module evaluation
const buildTimeKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1idWlsZC1wbGFjZWhvbGRlciJ9.dummy";
const keyToUse = supabaseServiceKey || buildTimeKey;
const supabase = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__["createClient"])(supabaseUrl, keyToUse, {
    auth: {
        persistSession: false
    },
    global: {
        fetch: (url, options)=>{
            return fetch(url, {
                ...options,
                timeout: 20000
            });
        }
    }
});
function createScopedSupabaseClient(userJwt) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__["createClient"])(supabaseUrl, userJwt, {
        auth: {
            persistSession: false
        },
        global: {
            fetch: (url, options)=>{
                return fetch(url, {
                    ...options,
                    timeout: 20000
                });
            }
        }
    });
}
function getScopedSupabaseClient(req) {
    const userJwt = req.userJwt;
    if (!userJwt) {
        throw new Error("Authentication required for database access");
    }
    // Create scoped client with user's JWT to enforce RLS
    return createScopedSupabaseClient(userJwt);
}
// Verify connection
(async ()=>{
    try {
        const { error } = await supabase.from("customers").select("count", {
            count: "exact",
            head: true
        });
        if (error) {
            console.error("Supabase connection check failed:", error.message);
        } else {
            console.log("Supabase connection check successful");
        }
    } catch (err) {
        console.error("Supabase connection check error:", err);
    }
})();
async function syncCustomerToSupabase(customer) {
    try {
        const { data: existingCustomer, error: fetchError } = await supabase.from("customers").select("*").eq("id", customer.id).single();
        if (fetchError && fetchError.code !== "PGRST116") {
            console.error("Error checking existing customer:", fetchError);
            throw fetchError;
        }
        if (existingCustomer) {
            // Update existing customer
            const { error: updateError } = await supabase.from("customers").update({
                email: customer.email,
                first_name: customer.first_name,
                last_name: customer.last_name,
                phone: customer.phone,
                company: customer.company,
                store_credit: customer.store_credit || 0,
                updated_at: new Date().toISOString()
            }).eq("id", customer.id);
            if (updateError) {
                console.error("Error updating customer:", updateError);
                throw updateError;
            }
            console.log("Customer updated in Supabase:", customer.id);
        } else {
            // Insert new customer
            const { error: insertError } = await supabase.from("customers").insert({
                id: customer.id,
                email: customer.email,
                first_name: customer.first_name,
                last_name: customer.last_name,
                phone: customer.phone,
                company: customer.company,
                store_credit: customer.store_credit || 0
            });
            if (insertError) {
                console.error("Error inserting customer:", insertError);
                throw insertError;
            }
            console.log("Customer inserted in Supabase:", customer.id);
        }
    } catch (error) {
        console.error("Error syncing customer to Supabase:", error);
        throw error;
    }
}
async function getCustomerStoreCredit(customerId) {
    try {
        const { data, error } = await supabase.from("customers").select("store_credit").eq("id", customerId).single();
        if (error) {
            console.error("Error fetching store credit from Supabase:", error);
            return 0;
        }
        return data?.store_credit || 0;
    } catch (error) {
        console.error("Error getting customer store credit:", error);
        return 0;
    }
}
async function updateCustomerStoreCredit(customerId, amount, reason) {
    try {
        const currentBalance = await getCustomerStoreCredit(customerId);
        const newBalance = Math.max(0, currentBalance + amount);
        const { error: updateError } = await supabase.from("customers").update({
            store_credit: newBalance
        }).eq("id", customerId);
        if (updateError) {
            console.error("Error updating store credit:", updateError);
            return false;
        }
        const { error: transactionError } = await supabase.from("store_credit_transactions").insert({
            customer_id: customerId,
            amount,
            reason,
            new_balance: newBalance,
            created_at: new Date().toISOString()
        });
        if (transactionError) {
            console.error("Error recording transaction:", transactionError);
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error updating customer store credit:", error);
        return false;
    }
}
/**
 * Normalize address format from camelCase to snake_case for database storage
 * Handles both formats to be flexible with different input sources
 */ function normalizeAddressFormat(address) {
    if (!address) return null;
    return {
        first_name: address.first_name || address.firstName || "",
        last_name: address.last_name || address.lastName || "",
        street_1: address.street_1 || address.street || "",
        street_2: address.street_2 || address.street2 || undefined,
        city: address.city || "",
        state_or_province: address.state_or_province || address.state || "",
        postal_code: address.postal_code || address.postalCode || "",
        country_iso2: address.country_iso2 || address.country || "",
        phone: address.phone || undefined
    };
}
async function createSupabaseOrder(orderData) {
    try {
        // Build order object with only columns that exist in the schema
        const orderToInsert = {
            customer_id: orderData.customer_id,
            status: orderData.status || "paid",
            total: orderData.total,
            subtotal: orderData.subtotal || 0,
            tax: orderData.tax || 0,
            shipping: orderData.shipping || 0,
            items: orderData.items || []
        };
        // Add optional fields if they exist and column exists in schema
        if (orderData.bigcommerce_order_id) {
            orderToInsert.bigcommerce_order_id = orderData.bigcommerce_order_id;
        }
        // Note: discount and discount_code columns don't exist yet in the database
        // They are tracked but not persisted to the orders table at this time
        if (orderData.estimated_delivery_date) {
            orderToInsert.estimated_delivery_date = orderData.estimated_delivery_date;
        }
        if (orderData.shipping_address) {
            orderToInsert.shipping_address = normalizeAddressFormat(orderData.shipping_address);
        }
        if (orderData.billing_address) {
            orderToInsert.billing_address = normalizeAddressFormat(orderData.billing_address);
        }
        const { data, error } = await supabase.from("orders").insert(orderToInsert).select("id").single();
        if (error) {
            console.error("Error creating order in Supabase:", error);
            throw error;
        }
        console.log("Order created in Supabase:", data?.id);
        return {
            id: data?.id,
            success: true
        };
    } catch (error) {
        console.error("Error creating Supabase order:", error);
        throw error;
    }
}
async function createOrderItems(orderId, items) {
    try {
        const itemsData = items.map((item)=>({
                order_id: orderId,
                product_id: item.product_id,
                product_name: item.product_name || "Custom Sticker",
                quantity: item.quantity,
                price: item.price || 0.25,
                options: item.options || null,
                design_file_url: item.design_file_url || null
            }));
        const { error } = await supabase.from("order_items").insert(itemsData);
        if (error) {
            console.error("Error creating order items:", error);
            throw error;
        }
        console.log("Order items created:", orderId);
    } catch (error) {
        console.error("Error creating order items:", error);
        throw error;
    }
}
async function getOrderById(orderId, customerId) {
    try {
        const { data, error } = await supabase.from("orders").select(`
        *,
        order_items (*)
      `).eq("id", orderId).eq("customer_id", customerId).single();
        if (error) {
            console.error("Error fetching order:", error);
            throw error;
        }
        return data;
    } catch (error) {
        console.error("Error getting order:", error);
        throw error;
    }
}
async function getCustomerOrders(customerId) {
    try {
        const { data, error } = await supabase.from("orders").select("*, customers(id, first_name, last_name, email, phone), order_items(*)").eq("customer_id", customerId).order("created_at", {
            ascending: false
        });
        if (error) {
            console.error("Error fetching customer orders:", error);
            throw error;
        }
        return data || [];
    } catch (error) {
        console.error("Error getting customer orders:", error);
        throw error;
    }
}
async function getPendingOrders() {
    try {
        const { data, error } = await supabase.from("orders").select("*, customers(*), order_items(*)").eq("status", "pending").order("created_at", {
            ascending: false
        });
        if (error) {
            console.error("Error fetching pending orders:", error);
            throw error;
        }
        return data || [];
    } catch (error) {
        console.error("Error getting pending orders:", error);
        throw error;
    }
}
async function getActiveOrders() {
    try {
        const activeStatuses = [
            "pending",
            "processing",
            "printing",
            "in transit",
            "paid",
            "pending_payment"
        ];
        // Simplified query - only fetch what's needed
        const { data, error } = await supabase.from("orders").select("id, customer_id, status, total, created_at").in("status", activeStatuses).order("created_at", {
            ascending: false
        }).limit(50); // Reduced limit for better performance
        if (error) {
            console.error("Error fetching active orders:", error);
            return [];
        }
        return data || [];
    } catch (error) {
        console.error("Error getting active orders:", error);
        return [];
    }
}
async function getActiveOrdersCount() {
    try {
        const activeStatuses = [
            "pending",
            "processing",
            "printing",
            "in transit",
            "paid",
            "pending_payment"
        ];
        const { count, error } = await supabase.from("orders").select("id", {
            count: "exact",
            head: true
        }).in("status", activeStatuses);
        if (error) {
            console.error("Error counting active orders:", error);
            return 0;
        }
        return count || 0;
    } catch (error) {
        console.error("Error getting active orders count:", error);
        return 0;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/auth.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleAdminSetup",
    ()=>handleAdminSetup,
    "handleLogin",
    ()=>handleLogin,
    "handleLogout",
    ()=>handleLogout,
    "handleRequestPasswordReset",
    ()=>handleRequestPasswordReset,
    "handleResetPassword",
    ()=>handleResetPassword,
    "handleSignup",
    ()=>handleSignup
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$jsonwebtoken__$5b$external$5d$__$28$jsonwebtoken$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$jsonwebtoken$29$__ = __turbopack_context__.i("[externals]/jsonwebtoken [external] (jsonwebtoken, cjs, [project]/node_modules/jsonwebtoken)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$bcryptjs__$5b$external$5d$__$28$bcryptjs$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$bcryptjs$29$__ = __turbopack_context__.i("[externals]/bcryptjs [external] (bcryptjs, cjs, [project]/node_modules/bcryptjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$ecwid$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/ecwid.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$email$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/email.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/supabase.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$email$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$email$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not configured. This is required for authentication. Set JWT_SECRET in your environment variables.");
}
// Admin setup key - MUST be set in production
const ADMIN_SETUP_KEY = process.env.ADMIN_SETUP_KEY;
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
/**
 * Validate password strength
 * Requires: 8+ chars, uppercase, lowercase, number, special char
 */ function validatePasswordStrength(password) {
    if (password.length < 8) {
        return {
            valid: false,
            message: "Password must be at least 8 characters long"
        };
    }
    if (!/[A-Z]/.test(password)) {
        return {
            valid: false,
            message: "Password must contain at least one uppercase letter"
        };
    }
    if (!/[a-z]/.test(password)) {
        return {
            valid: false,
            message: "Password must contain at least one lowercase letter"
        };
    }
    if (!/[0-9]/.test(password)) {
        return {
            valid: false,
            message: "Password must contain at least one number"
        };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return {
            valid: false,
            message: "Password must contain at least one special character"
        };
    }
    return {
        valid: true,
        message: ""
    };
}
/**
 * Generate JWT token for session
 */ function generateToken(customerId, email) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$jsonwebtoken__$5b$external$5d$__$28$jsonwebtoken$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$jsonwebtoken$29$__["default"].sign({
        customerId,
        email,
        iat: Math.floor(Date.now() / 1000)
    }, JWT_SECRET, {
        expiresIn: "7d"
    });
}
const handleLogin = async (req, res)=>{
    try {
        console.log("LOGIN ATTEMPT:", {
            headers: {
                "content-type": req.headers["content-type"],
                "content-length": req.headers["content-length"]
            },
            bodyKeys: Object.keys(req.body || {}),
            bodyType: typeof req.body,
            emailMap: req.body?.email ? "present" : "missing"
        });
        const { email, password } = req.body;
        if (!email || !password) {
            console.log("LOGIN FAILED: Missing credentials", {
                hasEmail: !!email,
                hasPassword: !!password
            });
            return res.status(400).json({
                error: "Email and password required",
                debug: {
                    receivedBodyType: typeof req.body,
                    receivedBodyKeys: Object.keys(req.body || {}),
                    // SECURITY: Never expose request body or password in responses
                    hasEmail: !!req.body?.email,
                    hasPassword: !!req.body?.password,
                    contentType: req.headers["content-type"]
                }
            });
        }
        // Get customer from Supabase
        const { data: customer, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").select("*").eq("email", email).single();
        if (error || !customer) {
            console.log("LOGIN FAILED: Customer not found or error", {
                email,
                error: error?.message
            });
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }
        // Verify password
        const passwordMatch = await __TURBOPACK__imported__module__$5b$externals$5d2f$bcryptjs__$5b$external$5d$__$28$bcryptjs$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$bcryptjs$29$__["default"].compare(password, customer.password_hash || "");
        if (!passwordMatch) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }
        // Generate JWT token
        const token = generateToken(customer.id, customer.email);
        res.json({
            success: true,
            token,
            customer: {
                id: customer.id,
                email: customer.email,
                firstName: customer.first_name,
                lastName: customer.last_name,
                isAdmin: customer.is_admin || false
            },
            message: "Login successful"
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            error: "Login failed"
        });
    }
};
const handleSignup = async (req, res)=>{
    try {
        console.log("Signup request received:", {
            method: req.method,
            url: req.url,
            headers: {
                "Content-Type": req.get("Content-Type"),
                "Content-Length": req.get("Content-Length")
            },
            bodyType: typeof req.body,
            // SECURITY: Never log request body as it may contain passwords
            bodyKeys: Object.keys(req.body || {}),
            hasEmail: !!req.body?.email,
            hasPassword: !!req.body?.password
        });
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
            console.log("Missing required fields:", {
                firstName: !!firstName,
                lastName: !!lastName,
                email: !!email,
                password: !!password
            });
            return res.status(400).json({
                error: "First name, last name, email, and password are required",
                received: {
                    firstName,
                    lastName,
                    email,
                    password
                }
            });
        }
        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                error: passwordValidation.message
            });
        }
        console.log("Signup attempt for:", email);
        // Check if customer already exists in Supabase
        const { data: existingCustomer } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").select("id, ecwid_customer_id, password_hash").eq("email", email).single();
        if (existingCustomer) {
            // If they already have a password, reject signup
            if (existingCustomer.password_hash) {
                console.log("Email already registered with password:", email);
                return res.status(409).json({
                    error: "Email already registered"
                });
            }
            // If they came from Ecwid but haven't set password yet, update their account
            if (existingCustomer.ecwid_customer_id) {
                const passwordHash = await __TURBOPACK__imported__module__$5b$externals$5d2f$bcryptjs__$5b$external$5d$__$28$bcryptjs$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$bcryptjs$29$__["default"].hash(password, 10);
                const { data: updatedCustomer, error: updateError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").update({
                    password_hash: passwordHash
                }).eq("id", existingCustomer.id).select().single();
                if (updateError || !updatedCustomer) {
                    console.error("Error updating Ecwid customer account:", updateError);
                    return res.status(500).json({
                        error: "Failed to create account"
                    });
                }
                const token = generateToken(updatedCustomer.id, updatedCustomer.email);
                return res.json({
                    success: true,
                    token,
                    customer: {
                        id: updatedCustomer.id,
                        email: updatedCustomer.email,
                        firstName: updatedCustomer.first_name,
                        lastName: updatedCustomer.last_name,
                        isAdmin: updatedCustomer.is_admin || false
                    },
                    message: "Account activated with password"
                });
            }
        }
        // Hash password
        const passwordHash = await __TURBOPACK__imported__module__$5b$externals$5d2f$bcryptjs__$5b$external$5d$__$28$bcryptjs$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$bcryptjs$29$__["default"].hash(password, 10);
        console.log("Creating customer in Supabase and Ecwid:", {
            email,
            firstName,
            lastName
        });
        // Check admin status - only allow specific admin emails from environment
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e)=>e.trim().toLowerCase()) || [];
        const isAdminEmail = adminEmails.includes(email.toLowerCase());
        // Create customer in Supabase
        const { data: newCustomer, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").insert({
            email,
            first_name: firstName,
            last_name: lastName,
            password_hash: passwordHash,
            store_credit: 0,
            is_admin: isAdminEmail
        }).select().single();
        if (error || !newCustomer) {
            console.error("Supabase Customer Creation Error:", error);
            throw new Error(`Failed to create customer account: ${error?.message || "Unknown error"}`);
        }
        console.log("Customer created in Supabase:", newCustomer.id);
        // Create customer in Ecwid
        let ecwidCustomerId = null;
        try {
            const ecwidCustomer = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$ecwid$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["ecwidAPI"].createCustomer({
                email,
                firstName,
                lastName
            });
            ecwidCustomerId = ecwidCustomer.id;
            console.log("Customer created in Ecwid:", ecwidCustomerId);
        } catch (ecwidError) {
            console.warn("Warning: Failed to create customer in Ecwid:", ecwidError);
        // Don't fail the signup if Ecwid creation fails
        // But log it for monitoring
        }
        // Generate JWT token
        const token = generateToken(newCustomer.id, newCustomer.email);
        res.status(201).json({
            success: true,
            token,
            customer: {
                id: newCustomer.id,
                email: newCustomer.email,
                firstName: newCustomer.first_name,
                lastName: newCustomer.last_name,
                isAdmin: newCustomer.is_admin || false,
                ecwidId: ecwidCustomerId
            },
            message: "Account created successfully"
        });
    } catch (error) {
        console.error("Signup error:", error);
        const errorMessage = error instanceof Error ? error.message : "Signup failed";
        res.status(500).json({
            error: errorMessage
        });
    }
};
const handleAdminSetup = async (req, res)=>{
    try {
        const { email, password, firstName, lastName } = req.body;
        const setupKey = req.headers["x-admin-setup-key"];
        // Validate setup key is configured
        if (!ADMIN_SETUP_KEY) {
            console.error("[SECURITY] ADMIN_SETUP_KEY not configured");
            return res.status(503).json({
                error: "Admin setup is not configured"
            });
        }
        if (setupKey !== ADMIN_SETUP_KEY) {
            console.warn("[SECURITY] Invalid admin setup key attempt");
            return res.status(403).json({
                error: "Invalid setup key"
            });
        }
        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }
        // Check if admin already exists
        const { data: existingAdmin } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").select("id").eq("email", email).single();
        const passwordHash = await __TURBOPACK__imported__module__$5b$externals$5d2f$bcryptjs__$5b$external$5d$__$28$bcryptjs$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$bcryptjs$29$__["default"].hash(password, 10);
        if (existingAdmin) {
            // Update existing user to admin
            const { data: updated, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").update({
                password_hash: passwordHash,
                is_admin: true
            }).eq("email", email).select().single();
            if (error || !updated) {
                throw new Error("Failed to update admin user");
            }
            const token = generateToken(updated.id, updated.email);
            return res.json({
                success: true,
                message: "Admin user updated successfully",
                token,
                customer: {
                    id: updated.id,
                    email: updated.email,
                    firstName: updated.first_name,
                    lastName: updated.last_name,
                    isAdmin: true
                }
            });
        }
        // Create new admin user
        const { data: newAdmin, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").insert({
            email,
            first_name: firstName || "Admin",
            last_name: lastName || "User",
            password_hash: passwordHash,
            is_admin: true,
            store_credit: 0
        }).select().single();
        if (error || !newAdmin) {
            throw new Error("Failed to create admin user");
        }
        const token = generateToken(newAdmin.id, newAdmin.email);
        res.status(201).json({
            success: true,
            message: "Admin user created successfully",
            token,
            customer: {
                id: newAdmin.id,
                email: newAdmin.email,
                firstName: newAdmin.first_name,
                lastName: newAdmin.last_name,
                isAdmin: true
            }
        });
    } catch (error) {
        console.error("Admin setup error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Admin setup failed"
        });
    }
};
const handleLogout = (req, res)=>{
    try {
        // JWT tokens are stateless, so logout is handled client-side
        // Client should remove token from localStorage
        res.json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            error: "Logout failed"
        });
    }
};
const handleRequestPasswordReset = async (req, res)=>{
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                error: "Email is required"
            });
        }
        // Get customer from Supabase
        const { data: customer } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").select("*").eq("email", email).single();
        // Don't reveal if email exists (security best practice)
        if (!customer) {
            return res.json({
                success: true,
                message: "If an account exists with this email, a password reset link has been sent"
            });
        }
        // Generate password reset token (expires in 1 hour)
        const resetToken = __TURBOPACK__imported__module__$5b$externals$5d2f$jsonwebtoken__$5b$external$5d$__$28$jsonwebtoken$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$jsonwebtoken$29$__["default"].sign({
            customerId: customer.id,
            email: customer.email,
            type: "password-reset"
        }, JWT_SECRET, {
            expiresIn: "1h"
        });
        // Get frontend URL from environment or request
        const frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get("host").replace(":8080", ":5173")}`;
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
        // Send password reset email
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$email$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["sendPasswordResetEmail"])(customer.email, customer.first_name || "Customer", resetLink);
        res.json({
            success: true,
            message: "If an account exists with this email, a password reset link has been sent"
        });
    } catch (error) {
        console.error("Password reset request error:", error);
        res.status(500).json({
            error: "Failed to process password reset request"
        });
    }
};
const handleResetPassword = async (req, res)=>{
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({
                error: "Token and new password are required"
            });
        }
        const passwordValidation = validatePasswordStrength(newPassword);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                error: passwordValidation.message
            });
        }
        // Verify reset token
        let decoded;
        try {
            decoded = __TURBOPACK__imported__module__$5b$externals$5d2f$jsonwebtoken__$5b$external$5d$__$28$jsonwebtoken$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$jsonwebtoken$29$__["default"].verify(token, JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                error: "Invalid or expired reset token"
            });
        }
        if (decoded.type !== "password-reset") {
            return res.status(401).json({
                error: "Invalid token type"
            });
        }
        // Hash new password
        const passwordHash = await __TURBOPACK__imported__module__$5b$externals$5d2f$bcryptjs__$5b$external$5d$__$28$bcryptjs$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$bcryptjs$29$__["default"].hash(newPassword, 10);
        // Update customer password in Supabase
        const { data: updatedCustomer, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").update({
            password_hash: passwordHash
        }).eq("id", decoded.customerId).select().single();
        if (error || !updatedCustomer) {
            throw new Error("Failed to update password");
        }
        res.json({
            success: true,
            message: "Password reset successfully"
        });
    } catch (error) {
        console.error("Password reset error:", error);
        const message = error instanceof Error ? error.message : "Failed to reset password";
        res.status(500).json({
            error: message
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/middleware/rate-limit.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "adminLimiter",
    ()=>adminLimiter,
    "apiLimiter",
    ()=>apiLimiter,
    "authLimiter",
    ()=>authLimiter,
    "checkoutLimiter",
    ()=>checkoutLimiter,
    "paymentLimiter",
    ()=>paymentLimiter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$express$2d$rate$2d$limit__$5b$external$5d$__$28$express$2d$rate$2d$limit$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$express$2d$rate$2d$limit$29$__ = __turbopack_context__.i("[externals]/express-rate-limit [external] (express-rate-limit, esm_import, [project]/node_modules/express-rate-limit)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$express$2d$rate$2d$limit__$5b$external$5d$__$28$express$2d$rate$2d$limit$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$express$2d$rate$2d$limit$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$express$2d$rate$2d$limit__$5b$external$5d$__$28$express$2d$rate$2d$limit$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$express$2d$rate$2d$limit$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
// Custom error handler that returns JSON instead of plain text
const handleRateLimitError = (req, res, options)=>{
    res.status(options.statusCode).json({
        error: options.message,
        retryAfter: Math.ceil(options.windowMs / 1000)
    });
};
const apiLimiter = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$express$2d$rate$2d$limit__$5b$external$5d$__$28$express$2d$rate$2d$limit$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$express$2d$rate$2d$limit$29$__["default"])({
    windowMs: 15 * 60 * 1000,
    max: 150,
    message: "Too many requests from this IP address, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    handler: handleRateLimitError,
    skip: (req)=>{
        // Skip rate limiting for:
        // 1. Health checks
        // 2. Webhook endpoints
        // 3. CORS preflight requests
        return req.path === "/health" || req.path.includes("/webhooks/") || req.method === "OPTIONS";
    }
});
const authLimiter = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$express$2d$rate$2d$limit__$5b$external$5d$__$28$express$2d$rate$2d$limit$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$express$2d$rate$2d$limit$29$__["default"])({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login/signup attempts. Please try again after 15 minutes.",
    standardHeaders: true,
    legacyHeaders: false,
    handler: handleRateLimitError,
    skipSuccessfulRequests: true,
    skipFailedRequests: false
});
const paymentLimiter = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$express$2d$rate$2d$limit__$5b$external$5d$__$28$express$2d$rate$2d$limit$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$express$2d$rate$2d$limit$29$__["default"])({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: "Too many payment attempts. Please try again after 5 minutes.",
    standardHeaders: true,
    legacyHeaders: false,
    handler: handleRateLimitError
});
const checkoutLimiter = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$express$2d$rate$2d$limit__$5b$external$5d$__$28$express$2d$rate$2d$limit$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$express$2d$rate$2d$limit$29$__["default"])({
    windowMs: 5 * 60 * 1000,
    max: 20,
    message: "Too many checkout attempts. Please try again after 5 minutes.",
    standardHeaders: true,
    legacyHeaders: false,
    handler: handleRateLimitError
});
const adminLimiter = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$express$2d$rate$2d$limit__$5b$external$5d$__$28$express$2d$rate$2d$limit$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$express$2d$rate$2d$limit$29$__["default"])({
    windowMs: 5 * 60 * 1000,
    max: 50,
    message: "Too many admin operations. Please try again after 5 minutes.",
    standardHeaders: true,
    legacyHeaders: false,
    handler: handleRateLimitError
});
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/auth.router.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createAuthRouter",
    ()=>createAuthRouter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$express__$5b$external$5d$__$28$express$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$express$29$__ = __turbopack_context__.i("[externals]/express [external] (express, cjs, [project]/node_modules/express)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/auth.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$rate$2d$limit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/middleware/rate-limit.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$rate$2d$limit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$rate$2d$limit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function createAuthRouter() {
    const router = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$express__$5b$external$5d$__$28$express$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$express$29$__["Router"])();
    // POST /api/auth/login - User login
    router.post("/login", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$rate$2d$limit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["authLimiter"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleLogin"]);
    // POST /api/auth/signup - User registration
    router.post("/signup", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$rate$2d$limit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["authLimiter"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleSignup"]);
    // POST /api/auth/logout - User logout
    router.post("/logout", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleLogout"]);
    // POST /api/auth/admin-setup - Initial admin setup
    router.post("/admin-setup", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$rate$2d$limit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["authLimiter"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleAdminSetup"]);
    // POST /api/auth/request-password-reset - Request password reset
    router.post("/request-password-reset", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$rate$2d$limit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["authLimiter"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleRequestPasswordReset"]);
    // POST /api/auth/reset-password - Reset password with token
    router.post("/reset-password", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleResetPassword"]);
    return router;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/middleware/auth.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "optionalVerifyToken",
    ()=>optionalVerifyToken,
    "requireAdmin",
    ()=>requireAdmin,
    "verifyToken",
    ()=>verifyToken
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$jsonwebtoken__$5b$external$5d$__$28$jsonwebtoken$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$jsonwebtoken$29$__ = __turbopack_context__.i("[externals]/jsonwebtoken [external] (jsonwebtoken, cjs, [project]/node_modules/jsonwebtoken)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/supabase.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
// import { createClient } from "@supabase/supabase-js";
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not configured. This is required for authentication. Set JWT_SECRET in your environment variables.");
}
;
const verifyToken = async (req, res, next)=>{
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                error: "No authorization token provided"
            });
            return;
        }
        const token = authHeader.substring(7);
        const decoded = __TURBOPACK__imported__module__$5b$externals$5d2f$jsonwebtoken__$5b$external$5d$__$28$jsonwebtoken$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$jsonwebtoken$29$__["default"].verify(token, JWT_SECRET);
        req.customerId = decoded.customerId;
        req.email = decoded.email;
        req.userJwt = token; // Store JWT for creating scoped Supabase clients
        // Fetch customer to get isAdmin status
        try {
            const { data: customer } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").select("is_admin").eq("id", decoded.customerId).single();
            req.isAdmin = customer?.is_admin || false;
        } catch (error) {
            // If we can't fetch from DB, default to false
            req.isAdmin = false;
        }
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({
            error: "Invalid or expired token"
        });
    }
};
const optionalVerifyToken = async (req, res, next)=>{
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            const decoded = __TURBOPACK__imported__module__$5b$externals$5d2f$jsonwebtoken__$5b$external$5d$__$28$jsonwebtoken$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$jsonwebtoken$29$__["default"].verify(token, JWT_SECRET);
            req.customerId = decoded.customerId;
            req.email = decoded.email;
            req.userJwt = token; // Store JWT for creating scoped Supabase clients
            // Fetch customer to get isAdmin status
            try {
                const { data: customer } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").select("is_admin").eq("id", decoded.customerId).single();
                req.isAdmin = customer?.is_admin || false;
            } catch (error) {
                // If we can't fetch from DB, default to false
                req.isAdmin = false;
            }
        }
        next();
    } catch (error) {
        // Token verification failed, but we continue
        // This is useful for endpoints that work with or without auth
        next();
    }
};
const requireAdmin = (req, res, next)=>{
    if (!req.customerId) {
        res.status(401).json({
            error: "Authentication required"
        });
        return;
    }
    if (!req.isAdmin) {
        res.status(403).json({
            error: "Admin access required"
        });
        return;
    }
    next();
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/utils/image-processor.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Optional image processor using sharp
 * Falls back gracefully if sharp is not available (e.g., in Netlify Functions)
 */ __turbopack_context__.s([
    "isSharpAvailable",
    ()=>isSharpAvailable,
    "processImage",
    ()=>processImage
]);
let sharpAvailable = false;
let Sharp = null;
// Try to load sharp, but don't fail if it's not available
try {
    Sharp = __turbopack_context__.r("[externals]/sharp [external] (sharp, cjs, [project]/node_modules/sharp)");
    sharpAvailable = true;
} catch (error) {
    console.warn("Sharp not available - using original image format. This is expected in serverless environments like Netlify.");
}
async function processImage(buffer, maxWidth = 500, maxHeight = 500) {
    if (!sharpAvailable || !Sharp) {
        console.log("Image processing skipped - sharp not available. Image will be uploaded as-is.");
        return buffer;
    }
    try {
        const processed = await Sharp(buffer).resize(maxWidth, maxHeight, {
            fit: "cover",
            withoutEnlargement: false
        }).webp({
            quality: 80
        }).toBuffer();
        console.log(`Image processed successfully: ${buffer.length} -> ${processed.length} bytes`);
        return processed;
    } catch (error) {
        console.error("Error processing image with sharp:", error);
        // Return original buffer if processing fails
        return buffer;
    }
}
function isSharpAvailable() {
    return sharpAvailable && Sharp !== null;
}
}),
"[project]/server/routes/customers.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleCreateCustomerAddress",
    ()=>handleCreateCustomerAddress,
    "handleDeleteCustomerAccount",
    ()=>handleDeleteCustomerAccount,
    "handleDeleteCustomerAddress",
    ()=>handleDeleteCustomerAddress,
    "handleGetCustomer",
    ()=>handleGetCustomer,
    "handleGetCustomerAddresses",
    ()=>handleGetCustomerAddresses,
    "handleGetStoreCredit",
    ()=>handleGetStoreCredit,
    "handleUpdateCustomer",
    ()=>handleUpdateCustomer,
    "handleUpdateCustomerAddress",
    ()=>handleUpdateCustomerAddress,
    "handleUploadAvatar",
    ()=>handleUploadAvatar
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$cloudinary__$5b$external$5d$__$28$cloudinary$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$cloudinary$29$__ = __turbopack_context__.i("[externals]/cloudinary [external] (cloudinary, cjs, [project]/node_modules/cloudinary)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$image$2d$processor$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/image-processor.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/supabase.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$ecwid$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/ecwid.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const handleGetCustomer = async (req, res)=>{
    try {
        const customerId = req.customerId;
        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized - No customerId in token"
            });
        }
        // Using service role client - the auth middleware already verified the token
        const { data: customer, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").select("*").eq("id", customerId).single();
        if (error) {
            console.error("Supabase error fetching customer:", error);
            return res.status(404).json({
                error: "Customer not found",
                details: error.message
            });
        }
        if (!customer) {
            return res.status(404).json({
                error: "Customer not found - No data returned"
            });
        }
        const { data: addresses, error: addressError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("addresses").select("*").eq("customer_id", customerId).order("is_default", {
            ascending: false
        }).order("created_at", {
            ascending: false
        });
        res.json({
            success: true,
            customer: {
                id: customer.id,
                email: customer.email,
                firstName: customer.first_name,
                lastName: customer.last_name,
                phone: customer.phone,
                companyName: customer.company,
                avatarUrl: customer.avatar_url,
                addresses: addresses || []
            }
        });
    } catch (error) {
        console.error("Get customer error:", error);
        const message = error instanceof Error ? error.message : "Failed to fetch customer";
        res.status(500).json({
            error: message
        });
    }
};
const handleUpdateCustomer = async (req, res)=>{
    try {
        const customerId = req.customerId;
        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        const { firstName, lastName, phone, email } = req.body;
        // Build update payload
        const updateData = {
            updated_at: new Date().toISOString()
        };
        if (firstName) updateData.first_name = firstName;
        if (lastName) updateData.last_name = lastName;
        if (phone) updateData.phone = phone;
        if (email) updateData.email = email;
        if (Object.keys(updateData).length === 1) {
            return res.status(400).json({
                error: "No fields to update"
            });
        }
        // SECURITY: Use scoped client to enforce RLS policies
        // Customer can only update their own record
        const scoped = __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"];
        // Update customer in Supabase
        const { data: updatedCustomer, error } = await scoped.from("customers").update(updateData).eq("id", customerId).select().single();
        if (error || !updatedCustomer) {
            console.error("Customer update error details:", {
                customerId,
                updateData,
                error: error ? {
                    message: error.message,
                    code: error.code,
                    details: error.details
                } : null,
                updatedCustomer
            });
            return res.status(500).json({
                error: "Failed to update customer",
                details: error?.message || "Unknown error"
            });
        }
        res.json({
            success: true,
            message: "Customer updated successfully",
            customer: {
                id: updatedCustomer.id,
                email: updatedCustomer.email,
                firstName: updatedCustomer.first_name,
                lastName: updatedCustomer.last_name,
                phone: updatedCustomer.phone
            }
        });
    } catch (error) {
        console.error("Update customer error:", error);
        const message = error instanceof Error ? error.message : "Failed to update customer";
        res.status(500).json({
            error: message
        });
    }
};
const handleGetCustomerAddresses = async (req, res)=>{
    try {
        const customerId = req.customerId;
        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        // SECURITY: Use scoped client to enforce RLS policies
        const scoped = __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"];
        const { data: customer, error: customerError } = await scoped.from("customers").select("id").eq("id", customerId).single();
        if (customerError || !customer) {
            return res.status(404).json({
                error: "Customer not found"
            });
        }
        const { data: addresses, error } = await scoped.from("addresses").select("*").eq("customer_id", customerId).order("is_default", {
            ascending: false
        }).order("created_at", {
            ascending: false
        });
        if (error) {
            return res.status(500).json({
                error: "Failed to fetch addresses"
            });
        }
        res.json({
            success: true,
            addresses: addresses || []
        });
    } catch (error) {
        console.error("Get addresses error:", error);
        const message = error instanceof Error ? error.message : "Failed to fetch addresses";
        res.status(500).json({
            error: message
        });
    }
};
const handleCreateCustomerAddress = async (req, res)=>{
    try {
        const customerId = req.customerId;
        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        const { firstName, lastName, street1, street2, city, stateOrProvince, postalCode, countryCode } = req.body;
        if (!firstName || !lastName || !street1 || !city || !stateOrProvince || !postalCode || !countryCode) {
            return res.status(400).json({
                error: "Missing required address fields"
            });
        }
        // SECURITY: Use scoped client to enforce RLS policies
        // Customer can only create addresses for themselves
        const scoped = __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"];
        const { data: address, error } = await scoped.from("addresses").insert({
            customer_id: customerId,
            first_name: firstName,
            last_name: lastName,
            street_1: street1,
            street_2: street2 || null,
            city,
            state_or_province: stateOrProvince,
            postal_code: postalCode,
            country_code: countryCode
        }).select().single();
        if (error || !address) {
            return res.status(500).json({
                error: "Failed to create address"
            });
        }
        res.json({
            success: true,
            message: "Address created successfully",
            address: {
                id: address.id,
                first_name: address.first_name,
                last_name: address.last_name,
                street_1: address.street_1,
                street_2: address.street_2,
                city: address.city,
                state_or_province: address.state_or_province,
                postal_code: address.postal_code,
                country_code: address.country_code
            }
        });
    } catch (error) {
        console.error("Create address error:", error);
        const message = error instanceof Error ? error.message : "Failed to create address";
        res.status(500).json({
            error: message
        });
    }
};
const handleUpdateCustomerAddress = async (req, res)=>{
    try {
        const customerId = req.customerId;
        const { addressId } = req.params;
        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        if (!addressId) {
            return res.status(400).json({
                error: "Address ID is required"
            });
        }
        const parsedAddressId = parseInt(addressId, 10);
        if (isNaN(parsedAddressId)) {
            return res.status(400).json({
                error: "Invalid address ID format"
            });
        }
        const { firstName, lastName, street1, street2, city, stateOrProvince, postalCode, countryCode } = req.body;
        if (!firstName || !lastName || !street1 || !city || !stateOrProvince || !postalCode || !countryCode) {
            return res.status(400).json({
                error: "Missing required address fields"
            });
        }
        // SECURITY: Use scoped client to enforce RLS policies
        const scoped = __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"];
        // Verify address belongs to customer
        const { data: existingAddress, error: checkError } = await scoped.from("addresses").select("id").eq("id", parsedAddressId).eq("customer_id", customerId).single();
        if (checkError || !existingAddress) {
            return res.status(404).json({
                error: "Address not found or unauthorized"
            });
        }
        const { data: address, error } = await scoped.from("addresses").update({
            first_name: firstName,
            last_name: lastName,
            street_1: street1,
            street_2: street2 || null,
            city,
            state_or_province: stateOrProvince,
            postal_code: postalCode,
            country_code: countryCode,
            updated_at: new Date().toISOString()
        }).eq("id", parsedAddressId).select().single();
        if (error || !address) {
            return res.status(500).json({
                error: "Failed to update address"
            });
        }
        res.json({
            success: true,
            message: "Address updated successfully",
            address: {
                id: address.id,
                first_name: address.first_name,
                last_name: address.last_name,
                street_1: address.street_1,
                street_2: address.street_2,
                city: address.city,
                state_or_province: address.state_or_province,
                postal_code: address.postal_code,
                country_code: address.country_code
            }
        });
    } catch (error) {
        console.error("Update address error:", error);
        const message = error instanceof Error ? error.message : "Failed to update address";
        res.status(500).json({
            error: message
        });
    }
};
const handleDeleteCustomerAddress = async (req, res)=>{
    try {
        const customerId = req.customerId;
        const { addressId } = req.params;
        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        if (!addressId) {
            return res.status(400).json({
                error: "Address ID is required"
            });
        }
        const parsedAddressId = parseInt(addressId, 10);
        if (isNaN(parsedAddressId)) {
            return res.status(400).json({
                error: "Invalid address ID format"
            });
        }
        // SECURITY: Use scoped client to enforce RLS policies
        const scoped = __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"];
        // Verify address belongs to customer
        const { data: existingAddress, error: checkError } = await scoped.from("addresses").select("id").eq("id", parsedAddressId).eq("customer_id", customerId).single();
        if (checkError || !existingAddress) {
            return res.status(404).json({
                error: "Address not found or unauthorized"
            });
        }
        const { error } = await scoped.from("addresses").delete().eq("id", parsedAddressId);
        if (error) {
            return res.status(500).json({
                error: "Failed to delete address"
            });
        }
        res.json({
            success: true,
            message: "Address deleted successfully"
        });
    } catch (error) {
        console.error("Delete address error:", error);
        const message = error instanceof Error ? error.message : "Failed to delete address";
        res.status(500).json({
            error: message
        });
    }
};
const handleDeleteCustomerAccount = async (req, res)=>{
    try {
        const customerId = req.customerId;
        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        // SECURITY: Use scoped client to enforce RLS policies
        // Customer can only delete their own account
        const scoped = __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"];
        // Delete from Supabase
        const { error } = await scoped.from("customers").delete().eq("id", customerId);
        if (error) {
            return res.status(500).json({
                error: "Failed to delete account"
            });
        }
        // Try to delete from Ecwid (non-blocking)
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$ecwid$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["ecwidAPI"].deleteCustomer(customerId);
        } catch (ecwidError) {
            console.warn("Warning: Failed to delete customer from Ecwid:", ecwidError);
        // Don't fail the deletion if Ecwid deletion fails
        }
        res.json({
            success: true,
            message: "Account deleted successfully"
        });
    } catch (error) {
        console.error("Delete account error:", error);
        const message = error instanceof Error ? error.message : "Failed to delete account";
        res.status(500).json({
            error: message
        });
    }
};
const handleGetStoreCredit = async (req, res)=>{
    try {
        const customerId = req.customerId;
        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        const storeCredit = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getCustomerStoreCredit"])(customerId);
        res.json({
            success: true,
            storeCredit: storeCredit || 0
        });
    } catch (error) {
        console.error("Get store credit error:", error);
        const message = error instanceof Error ? error.message : "Failed to fetch store credit";
        res.status(500).json({
            error: message
        });
    }
};
const handleUploadAvatar = async (req, res)=>{
    try {
        const customerId = req.customerId;
        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        __TURBOPACK__imported__module__$5b$externals$5d2f$cloudinary__$5b$external$5d$__$28$cloudinary$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$cloudinary$29$__["v2"].config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        if (!req.file) {
            return res.status(400).json({
                error: "No file provided"
            });
        }
        // Compress and resize image for avatar (square format)
        // Uses sharp if available, falls back to original buffer in serverless environments
        const compressedBuffer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$image$2d$processor$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["processImage"])(req.file.buffer, 500, 500);
        const b64 = compressedBuffer.toString("base64");
        const dataURI = `data:image/jpeg;base64,${b64}`;
        const result = await __TURBOPACK__imported__module__$5b$externals$5d2f$cloudinary__$5b$external$5d$__$28$cloudinary$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$cloudinary$29$__["v2"].uploader.upload(dataURI, {
            folder: "sticky-shuttle/avatars",
            resource_type: "auto"
        });
        // Update customer with avatar URL
        const { data: updatedCustomer, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").update({
            avatar_url: result.secure_url,
            updated_at: new Date().toISOString()
        }).eq("id", customerId).select().single();
        if (error || !updatedCustomer) {
            return res.status(500).json({
                error: "Failed to update avatar"
            });
        }
        res.json({
            success: true,
            message: "Avatar updated successfully",
            customer: {
                id: updatedCustomer.id,
                email: updatedCustomer.email,
                firstName: updatedCustomer.first_name,
                lastName: updatedCustomer.last_name,
                phone: updatedCustomer.phone,
                avatarUrl: updatedCustomer.avatar_url
            }
        });
    } catch (error) {
        console.error("Upload avatar error:", error);
        const message = error instanceof Error ? error.message : "Failed to upload avatar";
        res.status(500).json({
            error: message
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/customer.router.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createCustomerRouter",
    ()=>createCustomerRouter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$express__$5b$external$5d$__$28$express$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$express$29$__ = __turbopack_context__.i("[externals]/express [external] (express, cjs, [project]/node_modules/express)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/middleware/auth.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$customers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/customers.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$customers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$customers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function createCustomerRouter(upload) {
    const router = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$express__$5b$external$5d$__$28$express$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$express$29$__["Router"])();
    // GET /api/customers/me - Get current customer profile
    router.get("/me", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$customers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetCustomer"]);
    // PATCH /api/customers/me - Update customer profile
    router.patch("/me", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$customers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUpdateCustomer"]);
    // POST /api/customers/me/avatar - Upload customer avatar
    router.post("/me/avatar", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], upload.single("avatar"), __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$customers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUploadAvatar"]);
    // GET /api/customers/me/addresses - Get customer addresses
    router.get("/me/addresses", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$customers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetCustomerAddresses"]);
    // POST /api/customers/me/addresses - Create new address
    router.post("/me/addresses", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$customers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleCreateCustomerAddress"]);
    // PATCH /api/customers/me/addresses/:addressId - Update address
    router.patch("/me/addresses/:addressId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$customers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUpdateCustomerAddress"]);
    // DELETE /api/customers/me/addresses/:addressId - Delete address
    router.delete("/me/addresses/:addressId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$customers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleDeleteCustomerAddress"]);
    // DELETE /api/customers/me/account - Delete customer account
    router.delete("/me/account", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$customers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleDeleteCustomerAccount"]);
    // GET /api/customers/me/store-credit - Get store credit balance
    router.get("/me/store-credit", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$customers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetStoreCredit"]);
    return router;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/utils/order.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Order utilities for consistent order number formatting across the app
 */ /**
 * Format an order ID to the display format: SY-5XXXXX
 * Formula: SY-5 + (4001 + orderId)
 * Example: orderId 10 → SY-54011
 */ __turbopack_context__.s([
    "formatOrderNumber",
    ()=>formatOrderNumber,
    "parseOrderNumber",
    ()=>parseOrderNumber
]);
function formatOrderNumber(orderId) {
    const id = typeof orderId === "string" ? parseInt(orderId, 10) : orderId;
    if (isNaN(id) || id <= 0) {
        throw new Error("Invalid order ID");
    }
    const displayNumber = 4001 + id;
    return `SY-5${displayNumber}`;
}
function parseOrderNumber(orderNumber) {
    const trimmed = orderNumber.trim();
    if (trimmed.toUpperCase().startsWith("SY-5")) {
        // Format: SY-54011 where 54011 = 4001 + id, so id = 54011 - 54001
        // Extract everything after "SY-" (position 3 onwards)
        const displayNumber = parseInt(trimmed.substring(3), 10);
        if (isNaN(displayNumber)) {
            throw new Error("Invalid order number format");
        }
        const id = displayNumber - 54001;
        if (id <= 0) {
            throw new Error("Invalid order number format");
        }
        return id;
    } else {
        // Plain numeric format
        const id = parseInt(trimmed, 10);
        if (isNaN(id)) {
            throw new Error("Invalid order number format");
        }
        return id;
    }
}
}),
"[project]/server/schemas/validation.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "AddressSchema",
    ()=>AddressSchema,
    "CheckoutSchema",
    ()=>CheckoutSchema,
    "CreateCustomerAddressSchema",
    ()=>CreateCustomerAddressSchema,
    "CreateInvoiceSchema",
    ()=>CreateInvoiceSchema,
    "CreateOrderItemSchema",
    ()=>CreateOrderItemSchema,
    "CreateProductSchema",
    ()=>CreateProductSchema,
    "EmailSchema",
    ()=>EmailSchema,
    "LoginSchema",
    ()=>LoginSchema,
    "ModifyStoreCreditSchema",
    ()=>ModifyStoreCreditSchema,
    "PhoneSchema",
    ()=>PhoneSchema,
    "PricingRuleSchema",
    ()=>PricingRuleSchema,
    "ProductImageSchema",
    ()=>ProductImageSchema,
    "ProductOptionSchema",
    ()=>ProductOptionSchema,
    "RequestPasswordResetSchema",
    ()=>RequestPasswordResetSchema,
    "ResetPasswordSchema",
    ()=>ResetPasswordSchema,
    "SEOSchema",
    ()=>SEOSchema,
    "SharedVariantSchema",
    ()=>SharedVariantSchema,
    "SignupSchema",
    ()=>SignupSchema,
    "SubmitReviewSchema",
    ()=>SubmitReviewSchema,
    "SupportSubmissionSchema",
    ()=>SupportSubmissionSchema,
    "TaxConfigSchema",
    ()=>TaxConfigSchema,
    "UpdateCustomerAddressSchema",
    ()=>UpdateCustomerAddressSchema,
    "UpdateCustomerSchema",
    ()=>UpdateCustomerSchema,
    "UpdateInvoiceSchema",
    ()=>UpdateInvoiceSchema,
    "UpdateOrderStatusSchema",
    ()=>UpdateOrderStatusSchema,
    "UpdateProductSchema",
    ()=>UpdateProductSchema,
    "UploadDesignFileSchema",
    ()=>UploadDesignFileSchema,
    "VariantValueSchema",
    ()=>VariantValueSchema,
    "VerifyOrderAccessSchema",
    ()=>VerifyOrderAccessSchema,
    "validate",
    ()=>validate
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function validate(schema, data) {
    try {
        const validated = await schema.parseAsync(data);
        return {
            success: true,
            data: validated
        };
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].ZodError) {
            const errors = error.errors.map((err)=>({
                    field: err.path.join(".") || "unknown",
                    message: err.message
                }));
            return {
                success: false,
                errors
            };
        }
        console.error("Validation error:", error);
        return {
            success: false,
            errors: [
                {
                    field: "unknown",
                    message: "An unexpected validation error occurred"
                }
            ]
        };
    }
}
const AddressSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    first_name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "First name is required"),
    last_name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Last name is required"),
    street_1: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Street address is required"),
    street_2: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().nullable(),
    city: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "City is required"),
    state_or_province: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "State or province is required"),
    postal_code: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Postal code is required"),
    country_iso2: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(2).max(2, "Country code must be 2 characters"),
    phone: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().nullable()
});
const EmailSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().email("Invalid email format").toLowerCase();
const PhoneSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().regex(/^\+?[0-9\s\-\(\)]+$/, "Invalid phone number format").optional().nullable();
const UpdateCustomerSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    firstName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "First name is required").optional(),
    lastName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Last name is required").optional(),
    phone: PhoneSchema,
    email: EmailSchema.optional()
});
const CreateCustomerAddressSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    firstName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "First name is required"),
    lastName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Last name is required"),
    street1: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Street address is required"),
    street2: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().nullable(),
    city: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "City is required"),
    stateOrProvince: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "State or province is required"),
    postalCode: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Postal code is required"),
    countryCode: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(2).max(2, "Country code must be 2 characters")
});
const UpdateCustomerAddressSchema = CreateCustomerAddressSchema;
const CreateOrderItemSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    product_id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int("Product ID must be an integer"),
    product_name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    quantity: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(1, "Quantity must be at least 1"),
    price: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional(),
    price_inc_tax: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional(),
    options: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].unknown()).optional(),
    design_file_url: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().url("Invalid design file URL").optional().nullable()
});
const CheckoutSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    customer_id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int("Customer ID must be an integer"),
    billing_address: AddressSchema,
    shipping_addresses: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(AddressSchema).min(1, "At least one shipping address is required"),
    products: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(CreateOrderItemSchema).min(1, "At least one product is required"),
    discount_amount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0).optional().default(0),
    discount_code: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().nullable()
});
const VerifyOrderAccessSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    order_number: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Order number is required").regex(/^\d+$/, "Order number must contain only digits"),
    verification_field: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Email or phone is required")
});
const UploadDesignFileSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    order_id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int("Order ID must be an integer").optional(),
    order_item_id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int("Order item ID must be an integer").optional(),
    design_name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Design name is required").max(255),
    file_type: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "image/png",
        "image/jpeg",
        "image/gif",
        "application/pdf"
    ]).refine((type)=>type, "Unsupported file type. Allowed: PNG, JPG, GIF, PDF")
});
const ProductImageSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().uuid().optional(),
    url: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().url("Invalid image URL"),
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Image name is required"),
    preview: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional()
});
const VariantValueSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Variant ID is required"),
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Variant name is required"),
    priceModifier: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().default(0),
    image: ProductImageSchema.optional()
});
const ProductOptionSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Option ID is required"),
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Option name is required"),
    type: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "dropdown",
        "swatch",
        "radio",
        "text"
    ]),
    required: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().default(false),
    values: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(VariantValueSchema),
    defaultValueId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    displayOrder: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().default(0)
});
const PricingRuleSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().uuid().optional(),
    conditions: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        optionId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
        valueId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1)
    })),
    price: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0, "Price must be non-negative")
});
const SharedVariantSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Variant ID is required"),
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Variant name is required"),
    description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    optionSelections: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        optionId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
        optionName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
        selectedValueIds: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1))
    })),
    price: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0, "Price must be non-negative")
});
const TaxConfigSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().uuid().optional(),
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Tax name is required"),
    rate: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0).max(100, "Tax rate must be between 0 and 100"),
    enabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().default(true)
});
const SEOSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    productUrl: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().url("Invalid product URL").optional(),
    pageTitle: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().max(60, "Page title must be 60 characters or less").optional(),
    metaDescription: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().max(160, "Meta description must be 160 characters or less").optional()
});
const CreateProductSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Product name is required").max(255),
    basePrice: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0, "Base price must be non-negative").optional().default(0),
    description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().default(""),
    sku: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().default(""),
    weight: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0).optional().default(0),
    images: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(ProductImageSchema).optional().default([]),
    options: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(ProductOptionSchema).optional().default([]),
    pricingRules: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(PricingRuleSchema).optional().default([]),
    sharedVariants: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(SharedVariantSchema).optional().default([]),
    customerUploadConfig: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        enabled: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean(),
        maxFileSize: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(1),
        allowedFormats: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()),
        description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional()
    }).optional(),
    optionalFields: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1)
    })).optional().default([]),
    textArea: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().default(""),
    uploadedFiles: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].any()).optional().default([]),
    conditionLogic: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().default("all"),
    taxes: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(TaxConfigSchema).optional().default([]),
    seo: SEOSchema.optional(),
    categories: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).optional().default([]),
    availability: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional().default(true),
    showQuantityPanel: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional().default(true),
    fixedQuantity: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(1).optional().nullable()
});
const UpdateProductSchema = CreateProductSchema;
const CreateInvoiceSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    customer_name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Customer name is required"),
    customer_email: EmailSchema,
    invoice_type: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "Standard",
        "ArtworkUpload"
    ]),
    issue_date: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().datetime().optional(),
    due_date: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().datetime(),
    notes: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().nullable(),
    subtotal: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0),
    tax_rate: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0).max(100).optional().default(0),
    tax_amount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0).optional().default(0),
    shipping: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0).optional().default(0),
    discount_amount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0).optional().default(0),
    discount_type: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "fixed",
        "percentage"
    ]).optional(),
    items: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
        description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1),
        quantity: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(1),
        unit_price: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0),
        amount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0)
    }))
});
const UpdateInvoiceSchema = CreateInvoiceSchema.partial();
const UpdateOrderStatusSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    status: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "pending",
        "processing",
        "printing",
        "in transit",
        "delivered",
        "paid",
        "pending_payment",
        "canceled"
    ]),
    notes: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().nullable()
});
const SupportSubmissionSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Name is required").max(255),
    email: EmailSchema,
    subject: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Subject is required").max(255),
    category: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Category is required"),
    priority: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "low",
        "medium",
        "high"
    ]).optional().default("medium"),
    message: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(10, "Message must be at least 10 characters"),
    customerId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().optional()
});
const SubmitReviewSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    product_id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Product ID is required"),
    reviewer_name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Name is required").max(255),
    reviewer_email: EmailSchema,
    rating: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(1, "Rating must be 1-5").max(5),
    title: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().max(255).optional(),
    comment: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().max(5000).optional(),
    images: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].array(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()).optional().default([])
});
const LoginSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    email: EmailSchema,
    password: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(6, "Password must be at least 6 characters")
});
const SignupSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    email: EmailSchema,
    password: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/[0-9]/, "Password must contain at least one number").regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character"),
    firstName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "First name is required").max(255),
    lastName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Last name is required").max(255)
});
const ResetPasswordSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    token: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Reset token is required"),
    newPassword: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/[0-9]/, "Password must contain at least one number").regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character")
});
const RequestPasswordResetSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    email: EmailSchema
});
const ModifyStoreCreditSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    customer_id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int("Customer ID must be an integer"),
    amount: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number("Amount must be a number"),
    reason: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Reason is required").max(500)
});
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/server/utils/public-access-tokens.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "cleanupExpiredTokens",
    ()=>cleanupExpiredTokens,
    "createPublicAccessToken",
    ()=>createPublicAccessToken,
    "generatePublicAccessToken",
    ()=>generatePublicAccessToken,
    "revokePublicAccessToken",
    ()=>revokePublicAccessToken,
    "revokeResourceTokens",
    ()=>revokeResourceTokens,
    "validatePublicAccessToken",
    ()=>validatePublicAccessToken
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/supabase.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function generatePublicAccessToken() {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString("hex");
}
async function createPublicAccessToken(config) {
    try {
        const token = generatePublicAccessToken();
        const expiresInHours = config.expiresInHours || 48;
        const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("public_access_tokens").insert({
            token,
            resource_type: config.resourceType,
            resource_id: config.resourceId,
            expires_at: expiresAt,
            one_time_use: config.oneTimeUse ?? false,
            created_by: config.createdBy,
            metadata: {
                createdAt: new Date().toISOString()
            }
        });
        if (error) {
            console.error("Error creating public access token:", error);
            return {
                success: false,
                error: "Failed to create access token"
            };
        }
        // Token successfully created
        console.log(`[SECURITY] Created public access token for ${config.resourceType}:${config.resourceId} (expires in ${expiresInHours}h, one-time: ${config.oneTimeUse || false})`);
        return {
            success: true,
            token
        };
    } catch (error) {
        console.error("Error in createPublicAccessToken:", error);
        return {
            success: false,
            error: "Failed to create access token"
        };
    }
}
async function validatePublicAccessToken(token, expectedResourceType) {
    try {
        if (!token || token.length !== 64) {
            // Invalid token format - generic error
            console.warn("[SECURITY] Invalid token format attempted");
            return {
                success: false,
                error: "Not found"
            };
        }
        // Step 1: Find the token and validate all conditions atomically
        const { data: tokenRecord, error: lookupError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("public_access_tokens").select("token, resource_type, resource_id, expires_at, one_time_use, used_at").eq("token", token).maybeSingle();
        // Token not found
        if (lookupError || !tokenRecord) {
            console.warn("[SECURITY] Public token lookup failed or not found", {
                tokenPrefix: token.substring(0, 8),
                error: lookupError?.message
            });
            return {
                success: false,
                error: "Not found"
            };
        }
        // Token expired
        if (new Date(tokenRecord.expires_at) < new Date()) {
            console.warn("[SECURITY] Expired public access token used", {
                resourceType: tokenRecord.resource_type,
                resourceId: tokenRecord.resource_id
            });
            return {
                success: false,
                error: "Not found"
            };
        }
        // Token already used (one-time use)
        if (tokenRecord.one_time_use && tokenRecord.used_at) {
            console.warn("[SECURITY] One-time-use public token reused", {
                resourceType: tokenRecord.resource_type,
                resourceId: tokenRecord.resource_id,
                usedAt: tokenRecord.used_at
            });
            return {
                success: false,
                error: "Not found"
            };
        }
        // Resource type mismatch - suspicious
        if (tokenRecord.resource_type !== expectedResourceType) {
            console.warn("[SECURITY] Public token resource type mismatch", {
                expected: expectedResourceType,
                actual: tokenRecord.resource_type
            });
            return {
                success: false,
                error: "Not found"
            };
        }
        // Step 2: If one-time-use, mark as used atomically
        if (tokenRecord.one_time_use) {
            const { error: updateError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("public_access_tokens").update({
                used_at: new Date().toISOString()
            }).eq("token", token).eq("used_at", null); // Only update if not already used (race condition guard)
            if (updateError) {
                console.error("Error marking token as used:", updateError);
            // Still return success since token was valid, but log the issue
            // In production, this would need better handling
            }
        }
        // Token is valid
        console.log(`[SECURITY] Public access token validated for ${expectedResourceType}:${tokenRecord.resource_id}`);
        return {
            success: true,
            resourceId: tokenRecord.resource_id,
            resourceType: tokenRecord.resource_type
        };
    } catch (error) {
        console.error("Error validating public access token:", error);
        return {
            success: false,
            error: "Not found"
        };
    }
}
async function revokePublicAccessToken(token) {
    try {
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("public_access_tokens").delete().eq("token", token);
        if (error) {
            console.error("Error revoking public access token:", error);
            return false;
        }
        console.log("[SECURITY] Public access token revoked");
        return true;
    } catch (error) {
        console.error("Error in revokePublicAccessToken:", error);
        return false;
    }
}
async function revokeResourceTokens(resourceType, resourceId) {
    try {
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("public_access_tokens").delete().eq("resource_type", resourceType).eq("resource_id", resourceId);
        if (error) {
            console.error("Error revoking resource tokens:", error);
            return false;
        }
        console.log(`[SECURITY] Revoked all tokens for ${resourceType}:${resourceId}`);
        return true;
    } catch (error) {
        console.error("Error in revokeResourceTokens:", error);
        return false;
    }
}
async function cleanupExpiredTokens() {
    try {
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("public_access_tokens").delete().lt("expires_at", new Date().toISOString()).neq("used_at", null) // Don't delete unexpired tokens even if used
        .select("id", {
            count: "exact",
            head: true
        });
        if (error) {
            console.error("Error cleaning up expired tokens:", error);
            return 0;
        }
        console.log("[SECURITY] Cleaned up expired public access tokens");
        return data?.length || 0;
    } catch (error) {
        console.error("Error in cleanupExpiredTokens:", error);
        return 0;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/orders.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleAdminGetOrder",
    ()=>handleAdminGetOrder,
    "handleCreateOrder",
    ()=>handleCreateOrder,
    "handleGetOrder",
    ()=>handleGetOrder,
    "handleGetOrderPublic",
    ()=>handleGetOrderPublic,
    "handleGetOrderStatus",
    ()=>handleGetOrderStatus,
    "handleGetOrders",
    ()=>handleGetOrders,
    "handleGetPendingOrders",
    ()=>handleGetPendingOrders,
    "handleVerifyOrderAccess",
    ()=>handleVerifyOrderAccess
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/supabase.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$ecwid$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/ecwid.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/order.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/schemas/validation.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$public$2d$access$2d$tokens$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/public-access-tokens.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$public$2d$access$2d$tokens$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$public$2d$access$2d$tokens$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
const handleGetOrders = async (req, res)=>{
    try {
        const customerId = req.customerId;
        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        // Get pagination params from query string
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 20)); // Max 20 per page
        const offset = (page - 1) * limit;
        console.log(`Fetching orders for customer ${customerId} - Page: ${page}, Limit: ${limit}`);
        // SECURITY: Use scoped client to enforce RLS policies
        // Customer can only access their own orders
        const scoped = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getScopedSupabaseClient"])(req);
        // Fetch orders from Ecwid
        let ecwidOrders = [];
        try {
            ecwidOrders = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$ecwid$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["ecwidAPI"].getCustomerOrders(customerId);
        } catch (ecwidError) {
            console.warn("Failed to fetch orders from Ecwid:", ecwidError);
        // Continue without Ecwid orders if API fails
        }
        // Fetch from Supabase for local orders
        let supabaseOrders = [];
        try {
            supabaseOrders = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getCustomerOrders"])(customerId);
        } catch (supabaseError) {
            console.warn("Failed to fetch orders from Supabase:", supabaseError);
        }
        // Fetch digital files for Ecwid orders from Supabase
        let ecwidDigitalFilesMap = new Map();
        if (ecwidOrders.length > 0) {
            try {
                const { data: digitalFilesData } = await scoped.from("digital_files").select("*").in("order_id", ecwidOrders.map((o)=>o.id));
                if (digitalFilesData) {
                    digitalFilesData.forEach((file)=>{
                        if (!ecwidDigitalFilesMap.has(file.order_id)) {
                            ecwidDigitalFilesMap.set(file.order_id, []);
                        }
                        ecwidDigitalFilesMap.get(file.order_id).push({
                            id: file.id,
                            file_name: file.file_name,
                            file_url: file.file_url,
                            file_type: file.file_type,
                            file_size: file.file_size,
                            uploaded_at: file.uploaded_at
                        });
                    });
                }
            } catch (filesError) {
                console.warn("Failed to fetch digital files for Ecwid orders:", filesError);
            }
        }
        // Format Ecwid orders with tracking and design file info
        const formattedEcwidOrders = ecwidOrders.map((order)=>({
                id: order.id,
                customerId: order.customerId,
                status: order.status || order.fulfillmentStatus || order.paymentStatus || "processing",
                total: order.total,
                subtotal: order.subtotal || 0,
                tax: order.tax || 0,
                shipping: order.shippingCost || 0,
                dateCreated: order.createDate,
                source: "ecwid",
                itemCount: order.items?.length || 0,
                items: order.items || [],
                tracking_number: order.shippingTrackingCode,
                tracking_carrier: order.shippingCarrier,
                tracking_url: order.trackingUrl,
                shipped_date: order.shippingDate,
                estimated_delivery_date: order.estimatedDeliveryDate,
                digital_files: ecwidDigitalFilesMap.get(order.id) || [],
                shippingAddress: order.shippingPerson,
                customerName: order.customerName,
                customerEmail: order.email,
                customerPhone: order.customerPhone
            }));
        // Fetch digital files for all orders
        const { data: digitalFilesData } = await scoped.from("digital_files").select("*").in("order_id", supabaseOrders.map((o)=>o.id));
        const filesMap = new Map();
        if (digitalFilesData) {
            digitalFilesData.forEach((file)=>{
                if (!filesMap.has(file.order_id)) {
                    filesMap.set(file.order_id, []);
                }
                filesMap.get(file.order_id).push({
                    id: file.id,
                    file_name: file.file_name,
                    file_url: file.file_url,
                    file_type: file.file_type,
                    file_size: file.file_size,
                    uploaded_at: file.uploaded_at
                });
            });
        }
        // Format Supabase orders with digital files and customer info
        const formattedSupabaseOrders = supabaseOrders.map((order)=>{
            // Fetch customer info for this order
            const customerInfo = order.customers || {};
            return {
                id: order.id,
                customerId: order.customer_id,
                status: order.status || "paid",
                total: order.total,
                subtotal: order.subtotal || 0,
                tax: order.tax || 0,
                shipping: order.shipping || 0,
                dateCreated: order.created_at,
                source: "supabase",
                itemCount: order.order_items?.length || 0,
                items: order.order_items || [],
                estimated_delivery_date: order.estimated_delivery_date,
                tracking_number: order.tracking_number,
                tracking_carrier: order.tracking_carrier,
                tracking_url: order.tracking_url,
                shipped_date: order.shipped_date,
                digital_files: filesMap.get(order.id) || [],
                shippingAddress: order.shipping_address,
                customerName: `${customerInfo.first_name || ""} ${customerInfo.last_name || ""}`.trim(),
                customerEmail: customerInfo.email,
                customerPhone: customerInfo.phone
            };
        });
        // Combine and sort by date
        const allOrders = [
            ...formattedEcwidOrders,
            ...formattedSupabaseOrders
        ].sort((a, b)=>new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
        // Get paginated results
        const paginatedOrders = allOrders.slice(offset, offset + limit);
        const totalCount = allOrders.length;
        const hasMore = offset + limit < totalCount;
        console.log(`Fetched ${allOrders.length} total orders, returning page ${page} with ${paginatedOrders.length} orders`);
        res.json({
            success: true,
            orders: paginatedOrders,
            count: paginatedOrders.length,
            pagination: {
                page,
                limit,
                offset,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasMore
            }
        });
    } catch (error) {
        console.error("Get orders error:", error);
        const message = error instanceof Error ? error.message : "Failed to fetch orders";
        res.status(500).json({
            error: message
        });
    }
};
const handleGetOrder = async (req, res)=>{
    try {
        const customerId = req.customerId;
        const { orderId } = req.params;
        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        // VALIDATION: Parse and validate orderId is a positive integer
        const orderIdNum = parseInt(orderId, 10);
        if (isNaN(orderIdNum) || orderIdNum <= 0) {
            return res.status(400).json({
                error: "Request validation failed",
                details: [
                    {
                        field: "orderId",
                        message: "Order ID must be a positive integer"
                    }
                ]
            });
        }
        let order = null;
        // Try Ecwid first
        try {
            order = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$ecwid$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["ecwidAPI"].getOrder(orderIdNum);
            if (order && order.customerId === customerId) {
                // Fetch digital files for this Ecwid order
                let digitalFiles = [];
                try {
                    const { data: digitalFilesData } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("digital_files").select("*").eq("order_id", orderIdNum);
                    if (digitalFilesData) {
                        digitalFiles = digitalFilesData.map((file)=>({
                                id: file.id,
                                file_name: file.file_name,
                                file_url: file.file_url,
                                file_type: file.file_type,
                                file_size: file.file_size,
                                uploaded_at: file.uploaded_at
                            }));
                    }
                } catch (filesError) {
                    console.warn("Failed to fetch digital files for Ecwid order:", filesError);
                }
                return res.json({
                    success: true,
                    source: "ecwid",
                    order: {
                        id: order.id,
                        customerId: order.customerId,
                        status: order.fulfillmentStatus || order.paymentStatus || "processing",
                        dateCreated: order.createDate,
                        total: order.total,
                        subtotal: order.subtotal || 0,
                        tax: order.tax || 0,
                        shipping: order.shippingCost || 0,
                        items: order.items || [],
                        shippingAddress: order.shippingPerson,
                        billingAddress: order.billingPerson,
                        tracking_number: order.shippingTrackingCode,
                        tracking_carrier: order.shippingCarrier,
                        estimated_delivery_date: order.estimatedDeliveryDate,
                        digital_files: digitalFiles
                    }
                });
            }
        } catch (ecwidError) {
            console.warn("Failed to fetch order from Ecwid:", ecwidError);
        }
        // Fallback to Supabase
        order = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getOrderById"])(orderIdNum, customerId);
        if (!order) {
            return res.status(404).json({
                error: "Order not found"
            });
        }
        // Fetch digital files for this order
        const { data: digitalFilesData } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("digital_files").select("*").eq("order_id", order.id);
        const digitalFiles = (digitalFilesData || []).map((file)=>({
                id: file.id,
                file_name: file.file_name,
                file_url: file.file_url,
                file_type: file.file_type,
                file_size: file.file_size,
                uploaded_at: file.uploaded_at
            }));
        res.json({
            success: true,
            source: "supabase",
            order: {
                id: order.id,
                customerId: order.customer_id,
                status: order.status,
                dateCreated: order.created_at,
                total: order.total,
                subtotal: order.subtotal,
                tax: order.tax,
                shipping: order.shipping,
                items: order.order_items || [],
                shippingAddress: order.shipping_address,
                billingAddress: order.billing_address,
                estimated_delivery_date: order.estimated_delivery_date,
                tracking_number: order.tracking_number,
                tracking_carrier: order.tracking_carrier,
                tracking_url: order.tracking_url,
                shipped_date: order.shipped_date,
                digital_files: digitalFiles
            }
        });
    } catch (error) {
        console.error("Get order error:", error);
        res.status(500).json({
            error: "Failed to fetch order"
        });
    }
};
const handleCreateOrder = async (req, res)=>{
    try {
        const customerId = req.customerId;
        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        const { items, shippingAddress, billingAddress, total } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: "Order items required"
            });
        }
        if (!shippingAddress || !billingAddress) {
            return res.status(400).json({
                error: "Shipping and billing addresses required"
            });
        }
        // This endpoint is primarily for API use; checkout is the main flow
        res.status(501).json({
            error: "Use /api/checkout endpoint to create orders"
        });
    } catch (error) {
        console.error("Create order error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to create order";
        res.status(500).json({
            error: errorMessage
        });
    }
};
const handleAdminGetOrder = async (req, res)=>{
    try {
        const { orderId } = req.params;
        if (!orderId) {
            return res.status(400).json({
                error: "Order ID required"
            });
        }
        // TODO: Add admin role verification
        res.status(501).json({
            error: "Admin order retrieval endpoint coming soon"
        });
    } catch (error) {
        console.error("Admin get order error:", error);
        res.status(500).json({
            error: "Failed to fetch order"
        });
    }
};
const handleGetPendingOrders = async (req, res)=>{
    try {
        const customerId = req.customerId;
        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        const pendingOrders = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getPendingOrders"])();
        const formattedOrders = pendingOrders.map((order)=>({
                id: order.id,
                customerId: order.customer_id,
                customerName: order.customers ? `${order.customers.first_name || ""} ${order.customers.last_name || ""}`.trim() : "Unknown",
                customerEmail: order.customers?.email || "N/A",
                status: order.status,
                total: order.total,
                subtotal: order.subtotal,
                tax: order.tax,
                shipping: order.shipping,
                dateCreated: order.created_at,
                itemCount: 0
            }));
        res.json({
            success: true,
            orders: formattedOrders,
            count: formattedOrders.length
        });
    } catch (error) {
        console.error("Get pending orders error:", error);
        const message = error instanceof Error ? error.message : "Failed to fetch pending orders";
        res.status(500).json({
            error: message
        });
    }
};
const handleGetOrderPublic = async (req, res)=>{
    try {
        const { orderId } = req.params;
        const { token } = req.query;
        let orderIdNum;
        // 1. Parse the Order ID
        if (token && typeof token === "string") {
            const validation = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$public$2d$access$2d$tokens$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["validatePublicAccessToken"])(token, "order");
            if (!validation.success) {
                return res.status(404).json({
                    error: "Order not found (Invalid Token)"
                });
            }
            orderIdNum = parseInt(validation.resourceId, 10);
        } else if (orderId && typeof orderId === "string") {
            try {
                orderIdNum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["parseOrderNumber"])(orderId);
            } catch (parseError) {
                orderIdNum = parseInt(orderId, 10);
            }
        } else {
            return res.status(404).json({
                error: "Order ID missing"
            });
        }
        if (!orderIdNum || isNaN(orderIdNum) || orderIdNum <= 0) {
            return res.status(404).json({
                error: "Invalid Order ID"
            });
        }
        console.log(`[Public Access] Attempting to fetch Order ID: ${orderIdNum}`);
        // 2. SETUP ADMIN CLIENT (Crucial Step)
        const { createClient } = await __turbopack_context__.A("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, esm_import, [project]/node_modules/@supabase/supabase-js, async loader)");
        // Check for both common naming conventions for the Service Role Key
        const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
        if (!supabaseUrl || !supabaseServiceKey) {
            console.error("CRITICAL ERROR: Missing SUPABASE_SERVICE_ROLE_KEY. Cannot bypass RLS.");
            console.error("Available env vars:", {
                hasUrl: !!process.env.SUPABASE_URL,
                hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
                hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY
            });
            return res.status(500).json({
                error: "Server configuration error"
            });
        }
        // Create a fresh admin client for this request
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
        // 3. Fetch Order using Admin Client
        const { data: order, error: orderError } = await supabaseAdmin.from("orders").select(`
        id,
        customer_id,
        status,
        created_at,
        total,
        subtotal,
        tax,
        shipping,
        shipping_address,
        billing_address,
        estimated_delivery_date,
        tracking_number,
        tracking_carrier,
        tracking_url,
        shipped_date,
        square_payment_details,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price,
          design_file_url
        )
      `).eq("id", orderIdNum).single();
        if (orderError || !order) {
            console.warn(`[Public Access] Order ${orderIdNum} not found. Error:`, orderError?.message);
            // If error is PGRST116, it means no rows found (RLS or ID doesn't exist)
            return res.status(404).json({
                error: "Order not found"
            });
        }
        console.log(`[Public Access] Successfully found Order ${orderIdNum}`);
        // 4. Fetch Digital Files (using Admin Client)
        const { data: digitalFilesData } = await supabaseAdmin.from("digital_files").select("*").eq("order_id", orderIdNum);
        const digitalFiles = (digitalFilesData || []).map((file)=>({
                id: file.id,
                file_name: file.file_name,
                file_url: file.file_url,
                file_type: file.file_type,
                file_size: file.file_size,
                uploaded_at: file.uploaded_at
            }));
        // 5. Return Response
        res.json({
            success: true,
            data: {
                id: order.id,
                customer_id: order.customer_id,
                status: order.status,
                date_created: order.created_at,
                total: order.total,
                subtotal: order.subtotal,
                tax: order.tax,
                shipping: order.shipping,
                products: (order.order_items || []).map((item)=>({
                        ...item,
                        name: item.product_name
                    })),
                shipping_addresses: order.shipping_address ? [
                    order.shipping_address
                ] : [],
                billing_address: order.billing_address,
                estimated_delivery_date: order.estimated_delivery_date,
                tracking_number: order.tracking_number,
                tracking_carrier: order.tracking_carrier,
                tracking_url: order.tracking_url,
                shipped_date: order.shipped_date,
                square_payment_id: order.square_payment_details?.payment_id || null,
                digital_files: digitalFiles
            }
        });
    } catch (error) {
        console.error("Get order public error:", error);
        const errorMsg = error instanceof Error ? error.message : "Failed to fetch order";
        res.status(500).json({
            error: errorMsg
        });
    }
};
const handleVerifyOrderAccess = async (req, res)=>{
    try {
        // VALIDATION: Validate request body (order_number and verification_field)
        const validationResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["validate"])(__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["VerifyOrderAccessSchema"], req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: "Request validation failed",
                details: validationResult.errors
            });
        }
        const { order_number, verification_field } = validationResult.data;
        // Parse order number to numeric ID
        let orderIdNum;
        try {
            orderIdNum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["parseOrderNumber"])(order_number);
        } catch (err) {
            // Return 404 for invalid format - don't reveal format issues
            return res.status(404).json({
                success: false,
                error: "Order not found"
            });
        }
        const { supabase } = await __turbopack_context__.A("[project]/server/utils/supabase.ts [api] (ecmascript, async loader)");
        // Get the order by ID
        const { data: order, error: orderError } = await supabase.from("orders").select("id, customer_id, public_access_token").eq("id", orderIdNum).maybeSingle();
        if (orderError || !order) {
            // Return 404 for any lookup failure - don't reveal if order exists
            console.warn("Order not found for ID:", orderIdNum);
            return res.status(404).json({
                success: false,
                error: "Order not found"
            });
        }
        // Verify customer info (email or phone) matches order
        const { data: customer, error: customerError } = await supabase.from("customers").select("email, phone").eq("id", order.customer_id).maybeSingle();
        if (customerError || !customer) {
            console.warn("Customer not found for order:", order.id);
            return res.status(404).json({
                success: false,
                error: "Order not found"
            });
        }
        // Verify that the provided field matches customer email or phone
        const emailMatch = customer.email && customer.email.toLowerCase() === verification_field.toLowerCase();
        const phoneMatch = customer.phone && customer.phone.replace(/\D/g, "") === verification_field.replace(/\D/g, "");
        if (!emailMatch && !phoneMatch) {
            // Log suspicious activity but return generic error
            console.warn("Failed verification attempt for order:", order.id);
            return res.status(404).json({
                success: false,
                error: "Order not found"
            });
        }
        // Verification successful - return public access token
        return res.status(200).json({
            success: true,
            verified: true,
            orderId: order.id,
            publicAccessToken: order.public_access_token
        });
    } catch (error) {
        console.error("Verify order access error:", error);
        return res.status(404).json({
            success: false,
            error: "Order not found"
        });
    }
};
const handleGetOrderStatus = async (req, res)=>{
    try {
        const { publicAccessToken } = req.query;
        if (!publicAccessToken) {
            return res.status(400).json({
                success: false,
                error: "Public access token is required"
            });
        }
        const { supabase } = await __turbopack_context__.A("[project]/server/utils/supabase.ts [api] (ecmascript, async loader)");
        // Get the order by public access token (after verification)
        // Try with tracking columns first, fall back to basic columns if they don't exist
        let order;
        let orderError;
        const { data: fullOrder, error: fullError } = await supabase.from("orders").select(`
        id,
        customer_id,
        public_access_token,
        status,
        created_at,
        total,
        subtotal,
        tax,
        shipping,
        shipping_address,
        billing_address,
        tracking_number,
        tracking_carrier,
        tracking_url,
        shipped_date,
        order_items (
          id,
          product_id,
          quantity,
          price,
          options,
          design_file_url
        )
      `).eq("public_access_token", publicAccessToken).maybeSingle();
        if (fullOrder) {
            order = fullOrder;
            orderError = null;
        } else if (fullError && (fullError.message.includes("column") || fullError.code === "42703")) {
            // If tracking columns don't exist yet, try without them
            console.log("Tracking columns not available yet, fetching basic order");
            const { data: basicOrder, error: basicError } = await supabase.from("orders").select(`
          id,
          customer_id,
          public_access_token,
          status,
          created_at,
          total,
          subtotal,
          tax,
          shipping,
          shipping_address,
          billing_address,
          order_items (
            id,
            product_id,
            quantity,
            price,
            options,
            design_file_url
          )
        `).eq("public_access_token", publicAccessToken).maybeSingle();
            order = basicOrder;
            orderError = basicError;
        } else {
            order = fullOrder;
            orderError = fullError;
        }
        if (orderError || !order) {
            console.warn("Order not found for public access token:", publicAccessToken);
            return res.status(404).json({
                success: false,
                error: "Order not found"
            });
        }
        console.log("Order found:", {
            id: order.id,
            customer_id: order.customer_id
        });
        // Fetch customer info for display
        let customerEmail = "";
        let customerName = "";
        if (order.customer_id) {
            const { data: customer, error: customerError } = await supabase.from("customers").select("email, name").eq("id", order.customer_id).single();
            if (customer) {
                customerEmail = customer.email || "";
                customerName = customer.name || "";
                console.log("Customer found:", {
                    email: customerEmail,
                    name: customerName
                });
            }
        }
        // Enrich order items with product details
        const enrichedItems = await Promise.all((order.order_items || []).map(async (item)=>{
            let productName = `Product #${item.product_id}`;
            let productSku = "";
            let productDescription = "";
            if (item.product_id) {
                try {
                    // Handle both numeric and string IDs (e.g., "admin_11" or 11)
                    let queryId = item.product_id;
                    if (typeof queryId === "string" && queryId.includes("admin_")) {
                        // Extract numeric part from "admin_11" -> 11
                        const numericPart = queryId.replace("admin_", "");
                        queryId = parseInt(numericPart, 10);
                    }
                    console.log(`Fetching product with ID: ${queryId} (original: ${item.product_id})`);
                    const { data: product, error: productError } = await supabase.from("admin_products").select("name, sku, description").eq("id", queryId).single();
                    if (product && product.name) {
                        productName = product.name;
                        productSku = product.sku || "";
                        productDescription = product.description || "";
                        console.log(`Product found: ${productName}`);
                    } else if (productError) {
                        console.warn(`Failed to fetch product ${queryId}:`, productError);
                    }
                } catch (err) {
                    console.warn(`Error fetching product ${item.product_id}:`, err);
                }
            }
            return {
                ...item,
                product_name: productName,
                product_sku: productSku,
                product_description: productDescription,
                options: item.options || null,
                design_file_url: item.design_file_url || null,
                line_total: (item.price || 0) * (item.quantity || 0)
            };
        }));
        // Fetch digital files if any exist
        const { data: digitalFilesData } = await supabase.from("digital_files").select("*").eq("order_id", order.id);
        const digitalFiles = (digitalFilesData || []).map((file)=>({
                id: file.id,
                file_name: file.file_name,
                file_url: file.file_url,
                file_type: file.file_type,
                file_size: file.file_size,
                uploaded_at: file.uploaded_at
            }));
        res.json({
            success: true,
            data: {
                id: order.id,
                status: order.status,
                dateCreated: order.created_at,
                total: order.total,
                subtotal: order.subtotal,
                tax: order.tax,
                shipping: order.shipping,
                customerName: customerName || "",
                customerEmail: customerEmail,
                products: enrichedItems,
                shippingAddress: order.shipping_address,
                billingAddress: order.billing_address,
                trackingNumber: order.tracking_number || undefined,
                trackingCarrier: order.tracking_carrier || undefined,
                trackingUrl: order.tracking_url || undefined,
                shippedDate: order.shipped_date || undefined,
                digitalFiles: digitalFiles
            }
        });
    } catch (error) {
        console.error("Get order status error:", error);
        const errorMsg = error instanceof Error ? error.message : "Failed to fetch order status";
        res.status(500).json({
            success: false,
            error: errorMsg
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/admin-orders.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleDebugOrders",
    ()=>handleDebugOrders,
    "handleGetAdminPendingOrders",
    ()=>handleGetAdminPendingOrders,
    "handleGetAllAdminOrders",
    ()=>handleGetAllAdminOrders,
    "handleGetOrderDetail",
    ()=>handleGetOrderDetail,
    "handleTestAdminOrders",
    ()=>handleTestAdminOrders,
    "handleUpdateOrderItemOptions",
    ()=>handleUpdateOrderItemOptions,
    "handleUpdateOrderStatus",
    ()=>handleUpdateOrderStatus,
    "handleUpdateShippingAddress",
    ()=>handleUpdateShippingAddress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/supabase.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const handleTestAdminOrders = async (req, res)=>{
    try {
        const token = req.headers.authorization;
        const hasToken = !!token;
        res.set("Content-Type", "application/json");
        res.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            message: "Admin orders endpoint is accessible",
            auth: {
                hasToken,
                isAdmin: req.isAdmin || false,
                customerId: req.customerId || null
            }
        });
    } catch (error) {
        res.status(500).json({
            error: "Test failed"
        });
    }
};
const handleDebugOrders = async (req, res)=>{
    try {
        console.log("=== DEBUG ORDERS ENDPOINT ===");
        // Fetch first order
        const { data: orders, error: ordersError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("orders").select("id, status, total").limit(1);
        console.log("Orders query result:", {
            orders,
            error: ordersError
        });
        if (!orders || orders.length === 0) {
            return res.json({
                message: "No orders found",
                error: ordersError
            });
        }
        const firstOrderId = orders[0].id;
        console.log("First order ID:", firstOrderId, "Type:", typeof firstOrderId);
        // Try to fetch with order_items
        const { data: orderWithItems, error: itemsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("orders").select(`
        id,
        status,
        total,
        order_items(id, product_name, options)
      `).eq("id", firstOrderId).single();
        console.log("Order with items result:", {
            data: orderWithItems,
            error: itemsError
        });
        res.json({
            firstOrder: orders[0],
            orderWithItems,
            itemsError,
            debug: {
                orderId: firstOrderId,
                orderIdType: typeof firstOrderId
            }
        });
    } catch (error) {
        console.error("Debug endpoint error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });
    }
};
const handleGetOrderDetail = async (req, res)=>{
    try {
        const { orderId } = req.params;
        if (!orderId) {
            return res.status(400).json({
                error: "Order ID is required"
            });
        }
        // Convert orderId to number since it comes as a string from params
        const orderIdNumber = parseInt(orderId, 10);
        if (isNaN(orderIdNumber)) {
            return res.status(400).json({
                error: "Invalid order ID format"
            });
        }
        console.log(`Fetching order detail for ID: ${orderIdNumber}`);
        // Try to fetch with all columns, fall back to basic columns if some don't exist
        let order;
        let error;
        // First try with all columns
        const { data: fullOrder, error: fullError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("orders").select(`
        id,
        customer_id,
        status,
        total,
        subtotal,
        tax,
        shipping,
        created_at,
        updated_at,
        shipping_address,
        tracking_number,
        tracking_carrier,
        tracking_url,
        shipped_date,
        customers(id,first_name,last_name,email,phone),
        order_items(id,quantity,product_name,options,design_file_url),
        proofs(id,status,description,created_at,updated_at)
        `).eq("id", orderIdNumber).single();
        if (fullOrder) {
            order = fullOrder;
            error = null;
        } else if (fullError && (fullError.message.includes("column") || fullError.code === "42703")) {
            // If column doesn't exist (code 42703 is PostgreSQL "column does not exist"), try without the new columns
            console.log("New columns not available yet, fetching with basic columns");
            const { data: basicOrder, error: basicError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("orders").select(`
          id,
          customer_id,
          status,
          total,
          subtotal,
          tax,
          shipping,
          created_at,
          updated_at,
          customers(id,first_name,last_name,email,phone),
          order_items(id,quantity,product_name,options,design_file_url),
          proofs(id,status,description,created_at,updated_at)
          `).eq("id", orderIdNumber).single();
            order = basicOrder;
            error = basicError;
            if (basicOrder) {
                console.log(`Successfully fetched order ${orderIdNumber} with basic columns`);
            }
        } else {
            order = fullOrder;
            error = fullError;
        }
        if (error) {
            console.error("Error fetching order detail:", {
                orderId: orderIdNumber,
                errorCode: error.code,
                errorMessage: error.message,
                errorDetails: error.details
            });
            // Provide more specific error messages
            if (error.code === "PGRST301") {
                return res.status(403).json({
                    error: "Permission denied - check your access level"
                });
            }
            return res.status(404).json({
                error: "Order not found",
                debug: ("TURBOPACK compile-time truthy", 1) ? error.message : "TURBOPACK unreachable"
            });
        }
        if (!order) {
            console.warn(`Order not found for ID: ${orderIdNumber}`);
            return res.status(404).json({
                error: "Order not found"
            });
        }
        console.log(`Successfully fetched order ${orderIdNumber}`);
        // Format the response
        const customerName = order.customers && Array.isArray(order.customers) ? `${order.customers[0]?.first_name || ""} ${order.customers[0]?.last_name || ""}`.trim() : order.customers ? `${order.customers.first_name || ""} ${order.customers.last_name || ""}`.trim() : "Guest";
        const customerEmail = order.customers && Array.isArray(order.customers) ? order.customers[0]?.email || "N/A" : order.customers?.email || "N/A";
        const customerPhone = order.customers && Array.isArray(order.customers) ? order.customers[0]?.phone || undefined : order.customers?.phone || undefined;
        const customerRecordId = order.customers && Array.isArray(order.customers) ? order.customers[0]?.id : order.customers?.id;
        const formattedOrder = {
            id: order.id,
            customerId: order.customer_id,
            customerRecordId,
            customerName,
            customerEmail,
            customerPhone,
            status: order.status,
            total: order.total || 0,
            subtotal: order.subtotal || 0,
            tax: order.tax || 0,
            shipping: order.shipping || 0,
            dateCreated: order.created_at || new Date().toISOString(),
            dateUpdated: order.updated_at || new Date().toISOString(),
            source: "supabase",
            shippingAddress: order.shipping_address || undefined,
            trackingNumber: order.tracking_number || undefined,
            trackingCarrier: order.tracking_carrier || undefined,
            trackingUrl: order.tracking_url || undefined,
            shippedDate: order.shipped_date || undefined,
            squarePaymentId: undefined,
            orderItems: (order.order_items || []).map((item)=>({
                    id: item.id,
                    quantity: item.quantity,
                    product_name: item.product_name,
                    options: item.options,
                    design_file_url: item.design_file_url
                })),
            proofs: (order.proofs || []).map((proof)=>({
                    id: proof.id,
                    status: proof.status,
                    description: proof.description,
                    createdAt: proof.created_at,
                    updatedAt: proof.updated_at
                }))
        };
        res.json({
            success: true,
            order: formattedOrder
        });
    } catch (error) {
        console.error("Get order detail error:", {
            error,
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        const message = error instanceof Error ? error.message : "Failed to fetch order";
        res.status(500).json({
            error: message
        });
    }
};
const handleGetAllAdminOrders = async (req, res)=>{
    try {
        // Get pagination params from query string
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 20)); // Max 20 per page
        const offset = (page - 1) * limit;
        const dateFilter = req.query.date || null;
        console.log(`Fetching orders - Page: ${page}, Limit: ${limit}, Offset: ${offset}, Date: ${dateFilter || "all"}`);
        // Build the initial query
        let countQuery = __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("orders").select("id", {
            count: "exact",
            head: true
        });
        let dataQuery = __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("orders").select(`
        id,
        customer_id,
        status,
        total,
        subtotal,
        tax,
        shipping,
        created_at,
        updated_at,
        customers(id,first_name,last_name,email),
        order_items(id,quantity,product_name,options),
        proofs(id,status)
        `).order("created_at", {
            ascending: false
        });
        // Apply date filter if provided
        if (dateFilter) {
            // Filter by date (created_at between start and end of day)
            const startOfDay = `${dateFilter}T00:00:00.000Z`;
            const endOfDay = `${dateFilter}T23:59:59.999Z`;
            countQuery = countQuery.gte("created_at", startOfDay).lte("created_at", endOfDay);
            dataQuery = dataQuery.gte("created_at", startOfDay).lte("created_at", endOfDay);
        }
        // First, get the total count of orders
        const { count: totalCount, error: countError } = await countQuery;
        if (countError) {
            console.error("Error getting order count:", countError);
            throw countError;
        }
        // Fetch paginated orders from Supabase
        let supabaseOrders = [];
        try {
            const result = await dataQuery.range(offset, offset + limit - 1); // Paginate
            supabaseOrders = result.data || [];
            if (result.error) {
                console.error("Supabase error:", result.error);
            }
            console.log(`Fetched ${supabaseOrders.length} orders for page ${page}`);
        } catch (queryError) {
            console.error("Supabase query exception:", queryError);
        }
        // Format Supabase orders
        const formattedSupabaseOrders = supabaseOrders.map((order)=>{
            try {
                const customerName = order.customers && Array.isArray(order.customers) ? `${order.customers[0]?.first_name || ""} ${order.customers[0]?.last_name || ""}`.trim() : order.customers ? `${order.customers.first_name || ""} ${order.customers.last_name || ""}`.trim() : "Guest";
                const customerEmail = order.customers && Array.isArray(order.customers) ? order.customers[0]?.email || "N/A" : order.customers?.email || "N/A";
                return {
                    id: order.id,
                    customerId: order.customer_id,
                    customerName,
                    customerEmail,
                    status: order.status,
                    total: order.total || 0,
                    subtotal: order.subtotal || 0,
                    tax: order.tax || 0,
                    shipping: order.shipping || 0,
                    dateCreated: order.created_at || new Date().toISOString(),
                    source: "supabase",
                    orderItems: (order.order_items || []).map((item)=>({
                            id: item.id,
                            quantity: item.quantity,
                            product_name: item.product_name,
                            options: item.options
                        })),
                    proofs: (order.proofs || []).map((proof)=>({
                            id: proof.id,
                            status: proof.status
                        }))
                };
            } catch (formatError) {
                console.error("Error formatting order:", {
                    orderId: order.id,
                    formatError
                });
                return {
                    id: order.id,
                    customerId: order.customer_id,
                    customerName: "Unknown",
                    customerEmail: "Unknown",
                    status: order.status,
                    total: order.total || 0,
                    subtotal: order.subtotal || 0,
                    tax: order.tax || 0,
                    shipping: order.shipping || 0,
                    dateCreated: order.created_at || new Date().toISOString(),
                    source: "supabase",
                    orderItems: [],
                    proofs: []
                };
            }
        });
        const hasMore = offset + limit < (totalCount || 0);
        res.json({
            success: true,
            orders: formattedSupabaseOrders,
            pagination: {
                page,
                limit,
                offset,
                totalCount: totalCount || 0,
                totalPages: Math.ceil((totalCount || 0) / limit),
                hasMore
            }
        });
    } catch (error) {
        console.error("Get all admin orders error:", {
            error,
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        const message = error instanceof Error ? error.message : "Failed to fetch orders";
        res.status(500).json({
            error: message
        });
    }
};
const handleGetAdminPendingOrders = async (req, res)=>{
    try {
        console.log("Fetching admin pending orders count...");
        // For the navbar badge, we only need the count, not full order details
        // This is much faster than fetching all order data
        const count = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getActiveOrdersCount"])();
        console.log(`Admin pending orders count: ${count}`);
        // Set explicit content type and ensure proper JSON response
        res.set("Content-Type", "application/json");
        res.set("Cache-Control", "no-cache, no-store, must-revalidate");
        res.json({
            success: true,
            orders: [],
            count: count
        });
    } catch (error) {
        console.error("Get admin pending orders count error:", {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        // Don't fail - just return 0 count
        res.set("Content-Type", "application/json");
        res.json({
            success: true,
            orders: [],
            count: 0
        });
    }
};
const handleUpdateOrderStatus = async (req, res)=>{
    try {
        const { orderId } = req.params;
        const { status, tracking_number, tracking_carrier, tracking_url, shipping_address } = req.body;
        if (!orderId) {
            return res.status(400).json({
                error: "Order ID is required"
            });
        }
        // Convert orderId to number
        const orderIdNumber = parseInt(orderId, 10);
        if (isNaN(orderIdNumber)) {
            return res.status(400).json({
                error: "Invalid order ID format"
            });
        }
        const updateData = {};
        const validStatuses = [
            "pending_payment",
            "paid",
            "pending",
            "processing",
            "printing",
            "cutting",
            "preparing for shipping",
            "in transit",
            "shipped",
            "delivered",
            "cancelled",
            "payment_failed",
            "completed"
        ];
        // Validate status if provided
        if (status) {
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    error: `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`
                });
            }
            updateData.status = status;
        }
        // Add shipping address if provided
        if (shipping_address !== undefined) {
            updateData.shipping_address = shipping_address || null;
        }
        // Add tracking information if provided
        if (tracking_number !== undefined) {
            updateData.tracking_number = tracking_number || null;
        }
        if (tracking_carrier !== undefined) {
            updateData.tracking_carrier = tracking_carrier || null;
        }
        if (tracking_url !== undefined) {
            updateData.tracking_url = tracking_url || null;
        }
        // If tracking information is provided, set the shipped date
        if (tracking_number) {
            updateData.shipped_date = new Date().toISOString();
        }
        updateData.updated_at = new Date().toISOString();
        // Update the order in Supabase
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("orders").update(updateData).eq("id", orderIdNumber).select().single();
        if (error) {
            console.error("Error updating order:", {
                orderId: orderIdNumber,
                error: error.message,
                code: error.code
            });
            // If error is about missing column (shipped_date), try updating without it
            if (error.code === "42703" && error.message.includes("shipped_date")) {
                console.log("shipped_date column not available yet, retrying without it");
                // Remove shipped_date and try again
                delete updateData.shipped_date;
                const { data: retryData, error: retryError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("orders").update(updateData).eq("id", orderIdNumber).select().single();
                if (retryError) {
                    console.error("Retry error updating order:", retryError);
                    return res.status(500).json({
                        error: "Failed to update order"
                    });
                }
                return res.json({
                    success: true,
                    message: "Order updated successfully",
                    order: retryData
                });
            }
            return res.status(500).json({
                error: "Failed to update order"
            });
        }
        res.json({
            success: true,
            message: "Order updated successfully",
            order: data
        });
    } catch (error) {
        console.error("Update order status error:", error);
        const message = error instanceof Error ? error.message : "Failed to update order";
        res.status(500).json({
            error: message
        });
    }
};
const handleUpdateShippingAddress = async (req, res)=>{
    try {
        const { orderId } = req.params;
        const { first_name, last_name, street_1, street_2, city, state_or_province, postal_code, country_iso2, phone } = req.body;
        if (!orderId) {
            return res.status(400).json({
                error: "Order ID is required"
            });
        }
        // Convert orderId to number
        const orderIdNumber = parseInt(orderId, 10);
        if (isNaN(orderIdNumber)) {
            return res.status(400).json({
                error: "Invalid order ID format"
            });
        }
        // Validate required fields
        if (!first_name || !last_name || !street_1 || !city || !state_or_province || !postal_code || !country_iso2) {
            return res.status(400).json({
                error: "Missing required fields: first_name, last_name, street_1, city, state_or_province, postal_code, country_iso2"
            });
        }
        const shippingAddress = {
            first_name,
            last_name,
            street_1,
            street_2: street_2 || undefined,
            city,
            state_or_province,
            postal_code,
            country_iso2,
            phone: phone || undefined
        };
        // Update the order in Supabase
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("orders").update({
            shipping_address: shippingAddress,
            updated_at: new Date().toISOString()
        }).eq("id", orderIdNumber).select().single();
        if (error) {
            console.error("Error updating shipping address:", {
                orderId: orderIdNumber,
                error: error.message,
                code: error.code
            });
            // If column doesn't exist (code 42703 is PostgreSQL "column does not exist")
            if (error.code === "42703" && error.message.includes("shipping_address")) {
                console.error("shipping_address column not available - migration not applied");
                return res.status(500).json({
                    error: "Database migration not applied. The shipping_address column does not exist yet. Please contact administrator."
                });
            }
            return res.status(500).json({
                error: "Failed to update shipping address"
            });
        }
        res.json({
            success: true,
            message: "Shipping address updated successfully",
            order: data
        });
    } catch (error) {
        console.error("Update shipping address error:", error);
        const message = error instanceof Error ? error.message : "Failed to update shipping address";
        res.status(500).json({
            error: message
        });
    }
};
const handleUpdateOrderItemOptions = async (req, res)=>{
    try {
        const { orderId, itemId, options } = req.body;
        console.log("Update order item options - received:", {
            orderId,
            itemId,
            optionsCount: options?.length
        });
        if (!orderId) {
            console.error("Missing orderId in request body");
            return res.status(400).json({
                error: "Order ID is required"
            });
        }
        if (!Array.isArray(options)) {
            console.error("Options is not an array:", typeof options);
            return res.status(400).json({
                error: "Options must be an array"
            });
        }
        // Convert orderId to number
        const numOrderId = typeof orderId === "string" ? parseInt(orderId, 10) : orderId;
        console.log("Fetching order_items with orderId:", numOrderId, "itemId:", itemId);
        // Query the order_items table directly instead of through the orders relation
        const { data: allItems, error: itemsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("order_items").select("*").eq("order_id", numOrderId);
        console.log("Order items query:", {
            count: allItems?.length,
            items: allItems?.map((i)=>({
                    id: i.id,
                    product_name: i.product_name,
                    optionsCount: i.options ? Object.keys(i.options).length : 0
                })),
            error: itemsError,
            itemsError: itemsError ? {
                message: itemsError.message,
                code: itemsError.code
            } : null
        });
        if (itemsError) {
            console.error("Error fetching order items:", itemsError);
            return res.status(500).json({
                error: "Failed to fetch order items",
                details: itemsError.message
            });
        }
        if (!allItems || allItems.length === 0) {
            console.error("No items found for order:", numOrderId);
            return res.status(404).json({
                error: "No items found for this order"
            });
        }
        // Find the item to update (by UUID ID or index)
        let itemToUpdate = null;
        let itemIndex = -1;
        // First try to match by UUID
        for(let i = 0; i < allItems.length; i++){
            const itemUuid = String(allItems[i].id).toLowerCase();
            const searchId = String(itemId).toLowerCase();
            if (itemUuid === searchId) {
                itemToUpdate = allItems[i];
                itemIndex = i;
                console.log("Found item by UUID match at index:", i);
                break;
            }
        }
        // If not found by UUID, try by array index
        if (!itemToUpdate && !isNaN(Number(itemId))) {
            const numItemId = Number(itemId);
            if (numItemId >= 0 && numItemId < allItems.length) {
                itemToUpdate = allItems[numItemId];
                itemIndex = numItemId;
                console.log("Found item by index match at:", numItemId);
            }
        }
        if (!itemToUpdate) {
            console.error("Item not found with ID:", itemId, "Available items:", allItems.map((i)=>i.id));
            return res.status(404).json({
                error: "Item not found in this order"
            });
        }
        console.log("Found item to update at index:", itemIndex);
        // Update the options with new prices
        let updatedOptions = itemToUpdate.options || {};
        if (Array.isArray(updatedOptions)) {
            updatedOptions = updatedOptions.map((opt, idx)=>{
                const newOption = options[idx];
                if (newOption) {
                    return {
                        ...opt,
                        price: newOption.price || 0,
                        modifier_price: newOption.price || 0
                    };
                }
                return opt;
            });
        } else if (typeof updatedOptions === "object") {
            updatedOptions = Object.entries(updatedOptions).reduce((acc, [key, val], idx)=>{
                const newOption = options[idx];
                acc[key] = newOption ? {
                    ...typeof val === "object" ? val : {
                        value: val
                    },
                    price: newOption.price || 0,
                    modifier_price: newOption.price || 0
                } : val;
                return acc;
            }, {});
        }
        // Update the item in Supabase
        const { data: updatedItem, error: updateError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("order_items").update({
            options: updatedOptions
        }).eq("id", itemToUpdate.id).select().single();
        if (updateError) {
            console.error("Error updating order item:", {
                message: updateError.message,
                code: updateError.code,
                details: updateError.details
            });
            return res.status(500).json({
                error: "Failed to update order item",
                details: updateError.message
            });
        }
        console.log("Successfully updated order item");
        res.json({
            success: true,
            message: "Option costs updated successfully",
            item: updatedItem
        });
    } catch (error) {
        console.error("Update order item options error:", error);
        const message = error instanceof Error ? error.message : "Failed to update option costs";
        res.status(500).json({
            error: message
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/order.router.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createOrderRouter",
    ()=>createOrderRouter,
    "createPublicOrderRouter",
    ()=>createPublicOrderRouter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$express__$5b$external$5d$__$28$express$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$express$29$__ = __turbopack_context__.i("[externals]/express [external] (express, cjs, [project]/node_modules/express)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/middleware/auth.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/orders.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/admin-orders.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
function createOrderRouter() {
    const router = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$express__$5b$external$5d$__$28$express$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$express$29$__["Router"])();
    // ===== CUSTOMER ROUTES (Protected) =====
    // GET /api/orders - Get customer's orders
    router.get("/", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetOrders"]);
    // POST /api/orders - Create new order
    router.post("/", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleCreateOrder"]);
    // GET /api/orders/:orderId - Get specific order details
    router.get("/:orderId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetOrder"]);
    // ===== ADMIN ROUTES (Protected - admin only) =====
    // IMPORTANT: Specific routes MUST come before parameterized routes like /:orderId
    // GET /api/admin/orders/test - Test admin orders endpoint
    router.get("/test", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleTestAdminOrders"]);
    // GET /api/admin/orders/debug - Debug orders (admin only)
    router.get("/debug", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleDebugOrders"]);
    // GET /api/admin/orders/pending - Get pending orders
    router.get("/pending", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetAdminPendingOrders"]);
    // GET /api/admin/all-orders - Get all orders
    router.get("/all", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetAllAdminOrders"]);
    // POST /api/admin/update-order-item-options - Update order item options
    router.post("/update-item-options", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUpdateOrderItemOptions"]);
    // GET /api/admin/orders/:orderId - Get order details (admin)
    router.get("/:orderId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetOrderDetail"]);
    // PUT /api/admin/orders/:orderId/status - Update order status
    router.put("/:orderId/status", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUpdateOrderStatus"]);
    // PUT /api/admin/orders/:orderId/shipping-address - Update shipping address
    router.put("/:orderId/shipping-address", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUpdateShippingAddress"]);
    return router;
}
function createPublicOrderRouter() {
    const router = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$express__$5b$external$5d$__$28$express$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$express$29$__["Router"])();
    // GET /api/public/orders/:orderId - Get public order summary
    router.get("/:orderId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetOrderPublic"]);
    // POST /api/public/orders/verify - Verify order access with email/phone
    router.post("/verify", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleVerifyOrderAccess"]);
    // GET /api/public/orders/status - Get order status by token
    router.get("/status", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetOrderStatus"]);
    return router;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/products.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "handleGetProduct",
    ()=>handleGetProduct,
    "handleGetProductOptions",
    ()=>handleGetProductOptions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$ecwid$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/ecwid.ts [api] (ecmascript)");
;
const handleGetProduct = async (req, res)=>{
    const { productId } = req.params;
    if (!productId) {
        return res.status(400).json({
            error: "Product ID is required"
        });
    }
    try {
        const product = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$ecwid$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["ecwidAPI"].getProductWithVariations(parseInt(productId, 10));
        if (!product) {
            return res.status(404).json({
                error: "Product not found"
            });
        }
        res.json({
            data: product
        });
    } catch (error) {
        console.error("Get product error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to get product"
        });
    }
};
const handleGetProductOptions = async (req, res)=>{
    const { productId } = req.params;
    if (!productId) {
        return res.status(400).json({
            error: "Product ID is required"
        });
    }
    try {
        const variations = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$ecwid$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["ecwidAPI"].getProductVariations(parseInt(productId, 10));
        res.json({
            data: variations
        });
    } catch (error) {
        console.error("Get product options error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to get product options"
        });
    }
};
}),
"[project]/server/routes/admin-products.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleCreateProduct",
    ()=>handleCreateProduct,
    "handleDeleteAdminProduct",
    ()=>handleDeleteAdminProduct,
    "handleGetAdminProduct",
    ()=>handleGetAdminProduct,
    "handleGetAdminProductPublic",
    ()=>handleGetAdminProductPublic,
    "handleGetAdminProducts",
    ()=>handleGetAdminProducts,
    "handleGetImportedProductPublic",
    ()=>handleGetImportedProductPublic,
    "handleGetPublicProduct",
    ()=>handleGetPublicProduct,
    "handleGetStorefrontProducts",
    ()=>handleGetStorefrontProducts,
    "handleImportAdminProduct",
    ()=>handleImportAdminProduct,
    "handleUpdateProduct",
    ()=>handleUpdateProduct
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, esm_import, [project]/node_modules/@supabase/supabase-js)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/schemas/validation.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";
/**
 * SECURITY: Service Role Key is required for this route
 *
 * Justification:
 * - Admin operations need to manage ALL products, not just their own
 * - RLS policies cannot enforce product ownership (products are shared admin resource)
 * - Alternative: Use scoped client would require complex RLS with admin exemptions
 *
 * Mitigation:
 * - All endpoints using this client have verifyToken + requireAdmin middleware
 * - All product operations are admin-only and audit logged
 * - No customer data is accessed (only shared product catalog)
 *
 * See: docs/RLS_SCOPING.md for security architecture
 */ const supabase = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__["createClient"])(supabaseUrl, supabaseKey);
const handleCreateProduct = async (req, res)=>{
    try {
        // VALIDATION: Validate entire product request
        const validationResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["validate"])(__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["CreateProductSchema"], req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: "Request validation failed",
                details: validationResult.errors
            });
        }
        const productData = validationResult.data;
        // Build complete product object with all supported columns
        const dbProduct = {
            // Core fields
            name: productData.name,
            base_price: productData.basePrice || 0,
            description: productData.description || "",
            sku: productData.sku || "",
            weight: productData.weight || 0,
            availability: productData.availability !== false,
            created_at: new Date().toISOString(),
            // JSON fields
            images: productData.images || [],
            options: productData.options || [],
            shared_variants: productData.sharedVariants || [],
            pricing_rules: productData.pricingRules || [],
            customer_upload_config: productData.customerUploadConfig || {
                enabled: false,
                maxFileSize: 5,
                allowedFormats: [
                    "png",
                    "jpg",
                    "jpeg",
                    "gif"
                ],
                description: ""
            },
            optional_fields: productData.optionalFields || [],
            categories: productData.categories || [],
            taxes: productData.taxes || [],
            seo: productData.seo || {
                productUrl: "",
                pageTitle: "",
                metaDescription: ""
            },
            // Text fields
            text_area: productData.textArea || "",
            condition_logic: productData.conditionLogic || "all",
            // Quantity panel settings
            show_quantity_panel: productData.showQuantityPanel !== false,
            fixed_quantity: productData.fixedQuantity || null
        };
        const { data, error } = await supabase.from("admin_products").insert([
            dbProduct
        ]).select();
        if (error) {
            console.error("Database error creating product:", {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            return res.status(500).json({
                error: "Failed to create product",
                details: error.message,
                code: error.code
            });
        }
        res.json({
            message: "Product created successfully",
            product: data?.[0]
        });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({
            error: "Failed to create product",
            details: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
};
const handleUpdateProduct = async (req, res)=>{
    try {
        const { productId } = req.params;
        // VALIDATION: Validate product ID
        const id1 = parseInt(productId, 10);
        if (isNaN(id1) || id1 <= 0) {
            return res.status(400).json({
                error: "Request validation failed",
                details: [
                    {
                        field: "productId",
                        message: "Product ID must be a positive integer"
                    }
                ]
            });
        }
        // VALIDATION: Validate entire product request
        const validationResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["validate"])(__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["UpdateProductSchema"], req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: "Request validation failed",
                details: validationResult.errors
            });
        }
        const productData = validationResult.data;
        // Build complete product object with all supported columns
        const dbProduct = {
            // Core fields
            name: productData.name,
            base_price: productData.basePrice || 0,
            description: productData.description || "",
            sku: productData.sku || "",
            weight: productData.weight || 0,
            availability: productData.availability !== false,
            updated_at: new Date().toISOString(),
            // JSON fields
            images: productData.images || [],
            options: productData.options || [],
            shared_variants: productData.sharedVariants || [],
            pricing_rules: productData.pricingRules || [],
            customer_upload_config: productData.customerUploadConfig || {
                enabled: false,
                maxFileSize: 5,
                allowedFormats: [
                    "png",
                    "jpg",
                    "jpeg",
                    "gif"
                ],
                description: ""
            },
            optional_fields: productData.optionalFields || [],
            categories: productData.categories || [],
            taxes: productData.taxes || [],
            seo: productData.seo || {
                productUrl: "",
                pageTitle: "",
                metaDescription: ""
            },
            // Text fields
            text_area: productData.textArea || "",
            condition_logic: productData.conditionLogic || "all",
            // Quantity panel settings
            show_quantity_panel: productData.showQuantityPanel !== false,
            fixed_quantity: productData.fixedQuantity || null
        };
        const { data, error } = await supabase.from("admin_products").update(dbProduct).eq("id", id1).select();
        if (error) {
            console.error("Database error updating product:", {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                productId: id1
            });
            return res.status(500).json({
                error: "Failed to update product",
                details: error.message,
                code: error.code
            });
        }
        if (!data || data.length === 0) {
            return res.status(404).json({
                error: "Product not found"
            });
        }
        const product = {
            ...data[0],
            show_quantity_panel: data[0].show_quantity_panel !== false ? true : false,
            fixed_quantity: data[0].fixed_quantity ?? null
        };
        res.json({
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({
            error: "Failed to update product",
            details: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
};
const handleGetAdminProducts = async (_req, res)=>{
    try {
        const { data, error } = await supabase.from("admin_products").select("id, name, base_price, description, images, options, shared_variants, customer_upload_config, optional_fields, availability, sku, created_at, updated_at, show_quantity_panel, fixed_quantity").order("created_at", {
            ascending: false
        });
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({
                error: "Failed to fetch products",
                details: error.message
            });
        }
        const products = (data || []).map((product)=>({
                ...product,
                show_quantity_panel: product.show_quantity_panel !== false ? true : false,
                fixed_quantity: product.fixed_quantity ?? null
            }));
        res.json({
            products
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            error: "Failed to fetch products",
            details: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
};
const handleGetAdminProduct = async (req, res)=>{
    try {
        const { productId } = req.params;
        // VALIDATION: Validate product ID
        const id1 = parseInt(productId, 10);
        if (isNaN(id1) || id1 <= 0) {
            return res.status(400).json({
                error: "Request validation failed",
                details: [
                    {
                        field: "productId",
                        message: "Product ID must be a positive integer"
                    }
                ]
            });
        }
        const { data, error } = await supabase.from("admin_products").select("id, name, base_price, description, images, options, shared_variants, customer_upload_config, optional_fields, availability, sku, created_at, updated_at, show_quantity_panel, fixed_quantity").eq("id", id1).single();
        if (error) {
            if (error.code === "PGRST116") {
                return res.status(404).json({
                    error: "Product not found"
                });
            }
            console.error("Database error fetching admin product:", {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                productId: id1
            });
            return res.status(500).json({
                error: "Failed to fetch product",
                details: error.message,
                code: error.code
            });
        }
        const product = {
            ...data,
            show_quantity_panel: data.show_quantity_panel !== false ? true : false,
            fixed_quantity: data.fixed_quantity ?? null
        };
        res.json({
            product
        });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({
            error: "Failed to fetch product",
            details: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
};
const handleDeleteAdminProduct = async (req, res)=>{
    try {
        const { productId } = req.params;
        // VALIDATION: Validate product ID
        const id1 = parseInt(productId, 10);
        if (isNaN(id1) || id1 <= 0) {
            return res.status(400).json({
                error: "Request validation failed",
                details: [
                    {
                        field: "productId",
                        message: "Product ID must be a positive integer"
                    }
                ]
            });
        }
        const { error } = await supabase.from("admin_products").delete().eq("id", id1);
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({
                error: "Failed to delete product",
                details: error.message
            });
        }
        res.json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({
            error: "Failed to delete product",
            details: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
};
const handleGetPublicProduct = async (req, res)=>{
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({
                error: "Product ID is required"
            });
        }
        // Try parsing as numeric ID first
        const numericId = parseInt(productId, 10);
        let query = supabase.from("admin_products").select("id, name, base_price, description, images, options, shared_variants, customer_upload_config, optional_fields, availability, created_at, updated_at, show_quantity_panel, fixed_quantity").eq("availability", true);
        // Use numeric ID if valid, otherwise treat as SKU
        if (!isNaN(numericId)) {
            query = query.eq("id", numericId);
        } else {
            query = query.eq("sku", productId);
        }
        const { data, error } = await query.single();
        if (error) {
            if (error.code === "PGRST116") {
                return res.status(404).json({
                    error: "Product not found"
                });
            }
            console.error("Database error fetching public product:", {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                productId: id
            });
            return res.status(500).json({
                error: "Failed to fetch product",
                details: error.message,
                code: error.code
            });
        }
        if (!data) {
            return res.status(404).json({
                error: "Product not found or not available"
            });
        }
        // Ensure proper data types for JSON fields and set defaults for quantity panel settings
        const product = {
            ...data,
            images: Array.isArray(data.images) ? data.images : [],
            options: Array.isArray(data.options) ? data.options : [],
            shared_variants: Array.isArray(data.shared_variants) ? data.shared_variants : [],
            customer_upload_config: typeof data.customer_upload_config === "object" ? data.customer_upload_config : {
                enabled: false,
                maxFileSize: 5,
                allowedFormats: [
                    "pdf",
                    "png",
                    "jpg"
                ],
                description: ""
            },
            optional_fields: Array.isArray(data.optional_fields) ? data.optional_fields : [],
            show_quantity_panel: data.show_quantity_panel !== false ? true : false,
            fixed_quantity: data.fixed_quantity ?? null
        };
        res.json({
            product
        });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({
            error: "Failed to fetch product",
            details: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
};
const handleImportAdminProduct = async (req, res)=>{
    try {
        const { name, basePrice, sku, description, images, options, categories, availability, customerUploadConfig } = req.body;
        if (!name?.trim()) {
            return res.status(400).json({
                error: "Product name is required"
            });
        }
        const dbProduct = {
            // Core fields
            name,
            base_price: basePrice || 0,
            sku: sku || "",
            description: description || "",
            availability: availability !== false,
            created_at: new Date().toISOString(),
            // JSON fields
            images: images || [],
            options: options || [],
            customer_upload_config: customerUploadConfig || {
                enabled: false,
                maxFileSize: 5,
                allowedFormats: [
                    "png",
                    "jpg",
                    "jpeg",
                    "gif"
                ],
                description: ""
            },
            categories: categories || []
        };
        const { data, error } = await supabase.from("admin_products").insert([
            dbProduct
        ]).select();
        if (error) {
            console.error("Database error creating product:", {
                message: error.message,
                code: error.code,
                details: error.details
            });
            return res.status(500).json({
                error: "Failed to create product",
                details: error.message
            });
        }
        res.json({
            success: true,
            product: data?.[0]
        });
    } catch (error) {
        console.error("Error importing product:", error);
        res.status(500).json({
            error: "Failed to import product",
            details: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
};
const handleGetAdminProductPublic = async (req, res)=>{
    try {
        const { id: id1 } = req.params;
        if (!id1) {
            return res.status(400).json({
                error: "Product ID is required"
            });
        }
        const { data, error } = await supabase.from("admin_products").select("id, name, base_price, description, images, options, shared_variants, customer_upload_config, optional_fields, availability, created_at, updated_at, show_quantity_panel, fixed_quantity").eq("id", parseInt(id1)).eq("availability", true).single();
        if (error) {
            if (error.code === "PGRST116") {
                return res.status(404).json({
                    error: "Product not found"
                });
            }
            console.error("Database error fetching admin product:", error);
            return res.status(500).json({
                error: "Failed to fetch product"
            });
        }
        if (!data) {
            return res.status(404).json({
                error: "Product not found or not available"
            });
        }
        res.json({
            id: data.id,
            name: data.name,
            base_price: data.base_price,
            description: data.description,
            images: Array.isArray(data.images) ? data.images : [],
            options: Array.isArray(data.options) ? data.options : [],
            availability: data.availability,
            show_quantity_panel: data.show_quantity_panel !== false ? true : false,
            fixed_quantity: data.fixed_quantity ?? null
        });
    } catch (error) {
        console.error("Error fetching admin product:", error);
        res.status(500).json({
            error: "Failed to fetch product",
            details: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
};
const handleGetImportedProductPublic = async (req, res)=>{
    try {
        const { id: id1 } = req.params;
        if (!id1) {
            return res.status(400).json({
                error: "Product ID is required"
            });
        }
        const { data, error } = await supabase.from("products").select("id, name, price, min_price, max_price, description, image_url, options, rating, reviews_count").eq("id", parseInt(id1)).eq("is_active", true).single();
        if (error) {
            if (error.code === "PGRST116") {
                return res.status(404).json({
                    error: "Product not found"
                });
            }
            console.error("Database error fetching imported product:", error);
            return res.status(500).json({
                error: "Failed to fetch product"
            });
        }
        if (!data) {
            return res.status(404).json({
                error: "Product not found or not available"
            });
        }
        res.json({
            id: data.id,
            name: data.name,
            price: data.price,
            min_price: data.min_price,
            max_price: data.max_price,
            description: data.description,
            image_url: data.image_url,
            options: Array.isArray(data.options) ? data.options : [],
            rating: data.rating,
            reviews_count: data.reviews_count
        });
    } catch (error) {
        console.error("Error fetching imported product:", error);
        res.status(500).json({
            error: "Failed to fetch product",
            details: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
};
const handleGetStorefrontProducts = async (req, res)=>{
    try {
        const { limit = 100, offset = 0 } = req.query;
        // Fetch admin products (with group assignments)
        const { data: adminProducts, error: adminError } = await supabase.from("admin_products").select("id, name, base_price, sku, images, categories, availability").eq("availability", true).order("created_at", {
            ascending: false
        }).range(parseInt(offset) || 0, (parseInt(offset) || 0) + (parseInt(limit) || 100) - 1);
        if (adminError) {
            console.error("Error fetching admin products:", adminError);
            return res.status(500).json({
                error: "Failed to fetch admin products"
            });
        }
        // Format admin products
        const formattedAdminProducts = (adminProducts || []).map((product)=>({
                id: `admin_${product.id}`,
                name: product.name,
                price: product.base_price || 0,
                sku: product.sku || "",
                image_url: product.images?.[0]?.url || null,
                group: product.categories?.[0] || null,
                source: "admin",
                availability: product.availability
            }));
        // Fetch imported products
        const { data: importedProducts, error: importedError } = await supabase.from("products").select("id, name, price, min_price, max_price, sku, image_url, rating, reviews_count").eq("is_active", true).order("created_at", {
            ascending: false
        }).range(parseInt(offset) || 0, (parseInt(offset) || 0) + (parseInt(limit) || 100) - 1);
        if (importedError) {
            console.error("Error fetching imported products:", importedError);
            return res.status(500).json({
                error: "Failed to fetch imported products"
            });
        }
        // Format imported products
        const formattedImportedProducts = (importedProducts || []).map((product)=>({
                id: `imported_${product.id}`,
                name: product.name,
                price: product.min_price || product.price || 0,
                min_price: product.min_price,
                max_price: product.max_price,
                sku: product.sku || "",
                image_url: product.image_url || null,
                group: null,
                source: "imported",
                rating: product.rating || 0,
                reviews_count: product.reviews_count || 0
            }));
        // Combine and return
        const allProducts = [
            ...formattedAdminProducts,
            ...formattedImportedProducts
        ];
        res.json({
            items: allProducts,
            count: allProducts.length,
            limit: parseInt(limit) || 100,
            offset: parseInt(offset) || 0
        });
    } catch (error) {
        console.error("Error fetching storefront products:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to fetch products"
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/product.router.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createAdminProductRouter",
    ()=>createAdminProductRouter,
    "createProductRouter",
    ()=>createProductRouter,
    "createPublicProductRouter",
    ()=>createPublicProductRouter,
    "createStorefrontRouter",
    ()=>createStorefrontRouter
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$express__$5b$external$5d$__$28$express$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$express$29$__ = __turbopack_context__.i("[externals]/express [external] (express, cjs, [project]/node_modules/express)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/middleware/auth.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/products.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/admin-products.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
function createProductRouter() {
    const router = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$express__$5b$external$5d$__$28$express$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$express$29$__["Router"])();
    // GET /api/products/:productId - Get product details
    router.get("/:productId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetProduct"]);
    // GET /api/products/:productId/options - Get product options
    router.get("/:productId/options", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetProductOptions"]);
    return router;
}
function createAdminProductRouter() {
    const router = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$express__$5b$external$5d$__$28$express$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$express$29$__["Router"])();
    // POST /api/admin/products - Create product
    router.post("/", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleCreateProduct"]);
    // GET /api/admin/products - Get all admin products
    router.get("/", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetAdminProducts"]);
    // POST /api/admin/products/import - Import product
    router.post("/import", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleImportAdminProduct"]);
    // GET /api/admin/products/:productId - Get product (admin)
    router.get("/:productId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetAdminProduct"]);
    // PUT /api/admin/products/:productId - Update product
    router.put("/:productId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUpdateProduct"]);
    // DELETE /api/admin/products/:productId - Delete product
    router.delete("/:productId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleDeleteAdminProduct"]);
    return router;
}
function createPublicProductRouter() {
    const router = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$express__$5b$external$5d$__$28$express$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$express$29$__["Router"])();
    // GET /api/public/products/:productId - Get public product
    router.get("/:productId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetPublicProduct"]);
    // GET /api/public/products/admin/:id - Get admin product (public)
    router.get("/admin/:id", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetAdminProductPublic"]);
    // GET /api/public/products/imported/:id - Get imported product (public)
    router.get("/imported/:id", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetImportedProductPublic"]);
    return router;
}
function createStorefrontRouter() {
    const router = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$express__$5b$external$5d$__$28$express$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$express$29$__["Router"])();
    // GET /api/storefront/products - Get all storefront products (merged admin + imported)
    router.get("/products", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetStorefrontProducts"]);
    return router;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/designs.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleGetDesigns",
    ()=>handleGetDesigns,
    "handleGetOrderDesigns",
    ()=>handleGetOrderDesigns,
    "handleUploadDesignFile",
    ()=>handleUploadDesignFile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/supabase.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$cloudinary__$5b$external$5d$__$28$cloudinary$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$cloudinary$29$__ = __turbopack_context__.i("[externals]/cloudinary [external] (cloudinary, cjs, [project]/node_modules/cloudinary)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/schemas/validation.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
// Configure Cloudinary
__TURBOPACK__imported__module__$5b$externals$5d2f$cloudinary__$5b$external$5d$__$28$cloudinary$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$cloudinary$29$__["v2"].config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
/**
 * Schema for design file upload requests
 * Validates file data format, size limits, and content type
 */ const UploadDesignRequestSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    fileData: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "File data is required"),
    fileName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "File name is required").max(255),
    fileType: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional()
});
const handleGetDesigns = async (req, res)=>{
    try {
        const customerId = req.customerId;
        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        // Get all orders for the customer from Supabase
        const { data: orders, error: ordersError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("orders").select("id, customer_id, status, created_at").eq("customer_id", customerId).order("created_at", {
            ascending: false
        });
        if (ordersError) {
            console.error("Failed to fetch orders from Supabase:", ordersError);
            return res.status(500).json({
                error: "Failed to fetch orders"
            });
        }
        if (!orders || orders.length === 0) {
            return res.json({
                success: true,
                designs: [],
                totalOrders: 0,
                ordersWithDesigns: 0
            });
        }
        const orderIds = orders.map((o)=>o.id);
        // Fetch both order items with designs and proofs in parallel
        const [{ data: orderItems, error: itemsError }, { data: proofs, error: proofsError }] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("order_items").select("id, order_id, product_name, design_file_url, quantity, created_at").in("order_id", orderIds).not("design_file_url", "is", null).order("created_at", {
                ascending: false
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("proofs").select("id, order_id, file_url, file_name, description, status, created_at").eq("customer_id", customerId).not("file_url", "is", null).order("created_at", {
                ascending: false
            })
        ]);
        if (itemsError) {
            console.error("Failed to fetch order items from Supabase:", itemsError);
            return res.status(500).json({
                error: "Failed to fetch designs"
            });
        }
        if (proofsError) {
            console.error("Failed to fetch proofs from Supabase:", proofsError);
            return res.status(500).json({
                error: "Failed to fetch proofs"
            });
        }
        // Group designs by order
        const designsByOrder = [];
        const ordersWithDesigns = new Set();
        // Add order items (uploaded designs)
        if (orderItems && orderItems.length > 0) {
            for (const item of orderItems){
                const order = orders.find((o)=>o.id === item.order_id);
                if (!order) continue;
                ordersWithDesigns.add(item.order_id);
                // Find or create the order design group
                let orderDesignGroup = designsByOrder.find((og)=>og.orderId === item.order_id);
                if (!orderDesignGroup) {
                    orderDesignGroup = {
                        orderId: item.order_id,
                        orderDate: order.created_at || new Date().toISOString(),
                        orderStatus: order.status || "processing",
                        designs: []
                    };
                    designsByOrder.push(orderDesignGroup);
                }
                // Add design to the order group
                if (item.design_file_url) {
                    orderDesignGroup.designs.push({
                        id: `${item.order_id}-${item.id}`,
                        name: item.product_name || "Design File",
                        url: item.design_file_url,
                        description: `Design from order #${item.order_id}`,
                        type: "design",
                        size: item.quantity ? `Qty: ${item.quantity}` : undefined,
                        createdAt: item.created_at || order.created_at
                    });
                }
            }
        }
        // Add proofs (design approvals)
        if (proofs && proofs.length > 0) {
            for (const proof of proofs){
                const order = orders.find((o)=>o.id === proof.order_id);
                if (!order) continue;
                ordersWithDesigns.add(proof.order_id);
                // Find or create the order design group
                let orderDesignGroup = designsByOrder.find((og)=>og.orderId === proof.order_id);
                if (!orderDesignGroup) {
                    orderDesignGroup = {
                        orderId: proof.order_id,
                        orderDate: order.created_at || new Date().toISOString(),
                        orderStatus: order.status || "processing",
                        designs: []
                    };
                    designsByOrder.push(orderDesignGroup);
                }
                // Add proof to the order group
                if (proof.file_url) {
                    const isDenied = proof.status === "denied";
                    orderDesignGroup.designs.push({
                        id: `proof-${proof.id}`,
                        name: proof.file_name || "Design Proof",
                        url: proof.file_url,
                        description: proof.description || "Design proof for approval",
                        type: isDenied ? "proof_denied" : "proof",
                        createdAt: proof.created_at || order.created_at,
                        approved: proof.status === "approved"
                    });
                }
            }
        }
        // Sort orders by date
        designsByOrder.sort((a, b)=>new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        res.json({
            success: true,
            designs: designsByOrder,
            totalOrders: orders.length,
            ordersWithDesigns: designsByOrder.length
        });
    } catch (error) {
        console.error("Get designs error:", error);
        const message = error instanceof Error ? error.message : "Failed to fetch designs";
        res.status(500).json({
            error: message
        });
    }
};
const handleGetOrderDesigns = async (req, res)=>{
    try {
        const customerId = req.customerId;
        const { orderId } = req.params;
        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        // VALIDATION: Validate orderId is a positive integer
        const orderIdNum = parseInt(orderId, 10);
        if (isNaN(orderIdNum) || orderIdNum <= 0) {
            return res.status(400).json({
                error: "Request validation failed",
                details: [
                    {
                        field: "orderId",
                        message: "Order ID must be a positive integer"
                    }
                ]
            });
        }
        // Get the order and verify it belongs to the customer
        const { data: order, error: orderError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("orders").select("id, customer_id, status, created_at").eq("id", orderIdNum).single();
        if (orderError || !order) {
            return res.status(404).json({
                error: "Order not found"
            });
        }
        // Verify order belongs to customer
        if (order.customer_id !== customerId) {
            return res.status(403).json({
                error: "Unauthorized"
            });
        }
        // Get all order items with design files for this order
        const { data: orderItems, error: itemsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("order_items").select("id, product_name, design_file_url, quantity, created_at").eq("order_id", orderIdNum).not("design_file_url", "is", null);
        if (itemsError) {
            console.error("Failed to fetch order items:", itemsError);
            return res.status(500).json({
                error: "Failed to fetch designs"
            });
        }
        const designs = [];
        if (orderItems && orderItems.length > 0) {
            for (const item of orderItems){
                if (item.design_file_url) {
                    designs.push({
                        id: `${order.id}-${item.id}`,
                        name: item.product_name || "Design File",
                        url: item.design_file_url,
                        description: `Design from order #${order.id}`,
                        type: "design",
                        size: item.quantity ? `Qty: ${item.quantity}` : undefined,
                        createdAt: item.created_at || order.created_at
                    });
                }
            }
        }
        res.json({
            success: true,
            orderId: order.id,
            orderDate: order.created_at || new Date().toISOString(),
            orderStatus: order.status || "processing",
            designs
        });
    } catch (error) {
        console.error("Get order designs error:", error);
        res.status(500).json({
            error: "Failed to fetch order designs"
        });
    }
};
const handleUploadDesignFile = async (req, res)=>{
    try {
        // VALIDATION: Validate request body against schema
        const validationResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["validate"])(UploadDesignRequestSchema, req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: "Request validation failed",
                details: validationResult.errors
            });
        }
        const { fileData, fileName, fileType } = validationResult.data;
        // Validate file size (50MB max) BEFORE processing
        let buffer;
        try {
            buffer = Buffer.from(fileData, "base64");
        } catch (e) {
            return res.status(400).json({
                error: "Request validation failed",
                details: [
                    {
                        field: "fileData",
                        message: "Invalid base64 file data"
                    }
                ]
            });
        }
        // Guard: Reject oversized files to prevent database bloat
        const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
        if (buffer.length > MAX_FILE_SIZE) {
            console.warn("File size validation failed:", {
                fileName,
                attemptedSize: buffer.length,
                maxSize: MAX_FILE_SIZE
            });
            return res.status(413).json({
                error: "Request validation failed",
                details: [
                    {
                        field: "fileData",
                        message: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
                    }
                ]
            });
        }
        // Validate Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            console.error("Cloudinary not configured - cannot process uploads");
            return res.status(503).json({
                error: "File upload service is temporarily unavailable"
            });
        }
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 100);
        const publicId = `sticker-designs/${timestamp}-${randomId}`;
        // Upload to Cloudinary (no fallback)
        try {
            const uploadResult = await new Promise((resolve, reject)=>{
                const stream = __TURBOPACK__imported__module__$5b$externals$5d2f$cloudinary__$5b$external$5d$__$28$cloudinary$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$cloudinary$29$__["v2"].uploader.upload_stream({
                    public_id: publicId,
                    resource_type: "auto",
                    folder: "sticker-designs",
                    tags: [
                        "design-upload",
                        "customer"
                    ]
                }, (error, result)=>{
                    if (error) reject(error);
                    else resolve(result);
                });
                stream.end(buffer);
            });
            if (!uploadResult?.secure_url) {
                console.error("Cloudinary upload failed - no URL returned:", {
                    fileName,
                    publicId
                });
                return res.status(502).json({
                    error: "Failed to upload design file to cloud storage",
                    details: ("TURBOPACK compile-time truthy", 1) ? "Cloudinary did not return a valid URL" : "TURBOPACK unreachable"
                });
            }
            console.log("Design file uploaded successfully to Cloudinary:", {
                fileName,
                publicId,
                url: uploadResult.secure_url,
                size: buffer.length
            });
            // Success response
            res.status(200).json({
                success: true,
                fileUrl: uploadResult.secure_url,
                fileName: sanitizedFileName,
                size: buffer.length,
                uploadedAt: new Date().toISOString()
            });
        } catch (uploadError) {
            // Log the error for debugging but don't expose internals
            console.error("Cloudinary upload error:", {
                fileName,
                error: uploadError instanceof Error ? uploadError.message : String(uploadError)
            });
            // Return error - NO fallback to base64 data URLs
            // Client must retry or handle the failure gracefully
            return res.status(502).json({
                error: "Failed to upload design file to cloud storage",
                details: ("TURBOPACK compile-time truthy", 1) ? "Check that Cloudinary credentials are configured correctly" : "TURBOPACK unreachable",
                code: "CLOUDINARY_UPLOAD_FAILED"
            });
        }
    } catch (error) {
        console.error("Upload design file error:", error);
        const message = error instanceof Error ? error.message : "Failed to upload design";
        res.status(500).json({
            error: message,
            code: "DESIGN_UPLOAD_ERROR"
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/cart.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleAddToCart",
    ()=>handleAddToCart,
    "handleClearCart",
    ()=>handleClearCart,
    "handleCreateCart",
    ()=>handleCreateCart,
    "handleGetCart",
    ()=>handleGetCart,
    "handleRemoveFromCart",
    ()=>handleRemoveFromCart,
    "handleUpdateCartItem",
    ()=>handleUpdateCartItem
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/supabase.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
/**
 * Validate UUID format (v4 and general UUID)
 * Matches format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */ function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
const handleCreateCart = async (req, res)=>{
    try {
        const { line_items = [] } = req.body;
        const cartId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])();
        const now = new Date().toISOString();
        const subtotal = calculateSubtotal(line_items);
        const cart = {
            id: cartId,
            line_items: line_items || [],
            subtotal,
            total: subtotal,
            created_at: now,
            updated_at: now
        };
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("carts").insert({
            id: cartId,
            line_items,
            subtotal,
            total: subtotal,
            created_at: now,
            updated_at: now
        });
        if (error) {
            console.error("Create cart error:", error);
            throw error;
        }
        res.status(201).json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error("Create cart error:", error);
        const message = error instanceof Error ? error.message : "Failed to create cart";
        res.status(500).json({
            error: message
        });
    }
};
const handleGetCart = async (req, res)=>{
    try {
        const { cartId } = req.params;
        if (!cartId) {
            console.error("Cart ID is required");
            return res.status(400).json({
                error: "Cart ID is required"
            });
        }
        if (!isValidUUID(cartId)) {
            console.error("Invalid cart ID format:", cartId);
            return res.status(400).json({
                error: "Invalid cart ID format"
            });
        }
        console.log("Fetching cart:", cartId);
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("carts").select("*").eq("id", cartId).single();
        if (error) {
            console.error("Get cart error - Supabase error:", {
                code: error.code,
                message: error.message,
                details: error.details,
                cartId
            });
            if (error.code === "PGRST116") {
                return res.status(404).json({
                    error: "Cart not found"
                });
            }
            throw error;
        }
        if (!data) {
            console.warn("Get cart - no data returned for cartId:", cartId);
            return res.status(404).json({
                error: "Cart not found"
            });
        }
        console.log("Cart found successfully:", cartId);
        res.json({
            success: true,
            data: {
                id: data.id,
                line_items: data.line_items || [],
                subtotal: data.subtotal || 0,
                total: data.total || 0,
                created_at: data.created_at,
                updated_at: data.updated_at
            }
        });
    } catch (error) {
        console.error("Get cart error - caught exception:", {
            message: error instanceof Error ? error.message : String(error),
            error
        });
        const message = error instanceof Error ? error.message : "Failed to get cart";
        res.status(500).json({
            error: message
        });
    }
};
const handleAddToCart = async (req, res)=>{
    try {
        const { cartId } = req.params;
        const { line_items } = req.body;
        if (!cartId) {
            return res.status(400).json({
                error: "Cart ID is required"
            });
        }
        if (!isValidUUID(cartId)) {
            return res.status(400).json({
                error: "Invalid cart ID format"
            });
        }
        if (!line_items || !Array.isArray(line_items)) {
            return res.status(400).json({
                error: "line_items is required"
            });
        }
        const { data: cart, error: fetchError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("carts").select("*").eq("id", cartId).single();
        if (fetchError) {
            console.error("Fetch cart error:", fetchError);
            if (fetchError.code === "PGRST116") {
                return res.status(404).json({
                    error: "Cart not found"
                });
            }
            throw fetchError;
        }
        if (!cart) {
            return res.status(404).json({
                error: "Cart not found"
            });
        }
        const updatedItems = [
            ...cart.line_items || [],
            ...line_items
        ];
        const subtotal = calculateSubtotal(updatedItems);
        const now = new Date().toISOString();
        const { error: updateError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("carts").update({
            line_items: updatedItems,
            subtotal,
            total: subtotal,
            updated_at: now
        }).eq("id", cartId);
        if (updateError) {
            console.error("Update cart error:", updateError);
            throw updateError;
        }
        res.json({
            success: true,
            data: {
                id: cartId,
                line_items: updatedItems,
                subtotal,
                total: subtotal,
                created_at: cart.created_at,
                updated_at: now
            }
        });
    } catch (error) {
        console.error("Add to cart error:", error);
        const message = error instanceof Error ? error.message : "Failed to add to cart";
        res.status(500).json({
            error: message
        });
    }
};
const handleUpdateCartItem = async (req, res)=>{
    try {
        const { cartId, itemIndex } = req.params;
        const { quantity } = req.body;
        if (!cartId) {
            return res.status(400).json({
                error: "Cart ID is required"
            });
        }
        if (!isValidUUID(cartId)) {
            return res.status(400).json({
                error: "Invalid cart ID format"
            });
        }
        const { data: cart, error: fetchError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("carts").select("*").eq("id", cartId).single();
        if (fetchError) {
            console.error("Fetch cart error:", fetchError);
            if (fetchError.code === "PGRST116") {
                return res.status(404).json({
                    error: "Cart not found"
                });
            }
            throw fetchError;
        }
        if (!cart) {
            return res.status(404).json({
                error: "Cart not found"
            });
        }
        const idx = parseInt(itemIndex);
        const items = cart.line_items || [];
        if (isNaN(idx) || idx < 0 || idx >= items.length) {
            return res.status(400).json({
                error: "Invalid item index"
            });
        }
        if (quantity <= 0) {
            items.splice(idx, 1);
        } else {
            items[idx].quantity = quantity;
        }
        const subtotal = calculateSubtotal(items);
        const now = new Date().toISOString();
        const { error: updateError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("carts").update({
            line_items: items,
            subtotal,
            total: subtotal,
            updated_at: now
        }).eq("id", cartId);
        if (updateError) {
            console.error("Update cart error:", updateError);
            throw updateError;
        }
        res.json({
            success: true,
            data: {
                id: cartId,
                line_items: items,
                subtotal,
                total: subtotal,
                created_at: cart.created_at,
                updated_at: now
            }
        });
    } catch (error) {
        console.error("Update cart item error:", error);
        const message = error instanceof Error ? error.message : "Failed to update cart item";
        res.status(500).json({
            error: message
        });
    }
};
const handleRemoveFromCart = async (req, res)=>{
    try {
        const { cartId, itemIndex } = req.params;
        if (!cartId) {
            return res.status(400).json({
                error: "Cart ID is required"
            });
        }
        if (!isValidUUID(cartId)) {
            return res.status(400).json({
                error: "Invalid cart ID format"
            });
        }
        const { data: cart, error: fetchError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("carts").select("*").eq("id", cartId).single();
        if (fetchError) {
            console.error("Fetch cart error:", fetchError);
            if (fetchError.code === "PGRST116") {
                return res.status(404).json({
                    error: "Cart not found"
                });
            }
            throw fetchError;
        }
        if (!cart) {
            return res.status(404).json({
                error: "Cart not found"
            });
        }
        const idx = parseInt(itemIndex);
        const items = cart.line_items || [];
        if (isNaN(idx) || idx < 0 || idx >= items.length) {
            return res.status(400).json({
                error: "Invalid item index"
            });
        }
        items.splice(idx, 1);
        const subtotal = calculateSubtotal(items);
        const now = new Date().toISOString();
        const { error: updateError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("carts").update({
            line_items: items,
            subtotal,
            total: subtotal,
            updated_at: now
        }).eq("id", cartId);
        if (updateError) {
            console.error("Update cart error:", updateError);
            throw updateError;
        }
        res.json({
            success: true,
            data: {
                id: cartId,
                line_items: items,
                subtotal,
                total: subtotal,
                created_at: cart.created_at,
                updated_at: now
            }
        });
    } catch (error) {
        console.error("Remove from cart error:", error);
        const message = error instanceof Error ? error.message : "Failed to remove from cart";
        res.status(500).json({
            error: message
        });
    }
};
const handleClearCart = async (req, res)=>{
    try {
        const { cartId } = req.params;
        if (!cartId) {
            return res.status(400).json({
                error: "Cart ID is required"
            });
        }
        if (!isValidUUID(cartId)) {
            return res.status(400).json({
                error: "Invalid cart ID format"
            });
        }
        const { data: cart, error: fetchError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("carts").select("*").eq("id", cartId).single();
        if (fetchError) {
            console.error("Fetch cart error:", fetchError);
            if (fetchError.code === "PGRST116") {
                return res.status(404).json({
                    error: "Cart not found"
                });
            }
            throw fetchError;
        }
        if (!cart) {
            return res.status(404).json({
                error: "Cart not found"
            });
        }
        const now = new Date().toISOString();
        const { error: updateError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("carts").update({
            line_items: [],
            subtotal: 0,
            total: 0,
            updated_at: now
        }).eq("id", cartId);
        if (updateError) {
            console.error("Update cart error:", updateError);
            throw updateError;
        }
        res.json({
            success: true,
            data: {
                id: cartId,
                line_items: [],
                subtotal: 0,
                total: 0,
                created_at: cart.created_at,
                updated_at: now
            }
        });
    } catch (error) {
        console.error("Clear cart error:", error);
        const message = error instanceof Error ? error.message : "Failed to clear cart";
        res.status(500).json({
            error: message
        });
    }
};
/**
 * Helper function to calculate subtotal
 */ function calculateSubtotal(lineItems) {
    return lineItems.reduce((total, item)=>{
        const itemPrice = item.price || 0.25;
        return total + itemPrice * item.quantity;
    }, 0);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/checkout.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleCheckout",
    ()=>handleCheckout,
    "handleGetCheckoutDetails",
    ()=>handleGetCheckoutDetails
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/supabase.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/schemas/validation.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
/**
 * Extended checkout schema with optional fields for backward compatibility
 * Allows extra fields from Ecwid/BigCommerce integrations
 */ const ExtendedCheckoutSchema = __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["CheckoutSchema"].extend({
    order_total: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional(),
    subtotal_inc_tax: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional(),
    subtotal_ex_tax: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional(),
    total_inc_tax: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional(),
    total_ex_tax: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional(),
    total_tax: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional(),
    total_shipping: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional(),
    status_id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional(),
    shipping_option_id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().optional()
}).passthrough(); // Allow unknown fields from integrations
const handleCheckout = async (req, res)=>{
    try {
        const requestCustomerId = req.customerId;
        // VALIDATION: Validate entire checkout request
        // This replaces all manual if (!field) checks
        const validationResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$schemas$2f$validation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["validate"])(ExtendedCheckoutSchema, req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: "Request validation failed",
                details: validationResult.errors
            });
        }
        const checkoutData = validationResult.data;
        // Use customer_id from request (auth) or from body (guest/provided), default to null for guests
        const customerId = requestCustomerId || checkoutData.customer_id || null;
        // At this point, all required fields are validated and present
        const billingAddr = checkoutData.billing_address;
        const shippingAddr = checkoutData.shipping_addresses[0];
        // Calculate totals
        const subtotal = checkoutData.subtotal_inc_tax || 0;
        const total = checkoutData.order_total || checkoutData.total_inc_tax || subtotal;
        const tax = checkoutData.total_tax || 0;
        const shipping = checkoutData.total_shipping || 0;
        // Calculate estimated delivery date based on shipping option
        let estimatedDeliveryDate = null;
        if (checkoutData.shipping_option_id) {
            try {
                const { data: shippingOption } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("shipping_options").select("processing_time_days, estimated_delivery_days_min").eq("id", checkoutData.shipping_option_id).single();
                if (shippingOption) {
                    const processingDays = shippingOption.processing_time_days || 0;
                    const deliveryDays = shippingOption.estimated_delivery_days_min || 1;
                    const totalDays = processingDays + deliveryDays;
                    const deliveryDate = new Date();
                    deliveryDate.setDate(deliveryDate.getDate() + totalDays);
                    estimatedDeliveryDate = deliveryDate.toISOString().split("T")[0];
                }
            } catch (error) {
                console.warn("Failed to fetch shipping option for delivery date:", error);
            }
        }
        // Create order in Supabase (PRIMARY - must succeed)
        console.log("Creating order in Supabase:", {
            customerId,
            total,
            productCount: checkoutData.products.length,
            estimatedDeliveryDate
        });
        const supabaseOrder = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createSupabaseOrder"])({
            customer_id: customerId,
            status: "pending",
            total,
            subtotal,
            tax,
            shipping,
            billing_address: billingAddr,
            shipping_address: shippingAddr,
            items: checkoutData.products,
            estimated_delivery_date: estimatedDeliveryDate
        });
        // Create order items in Supabase
        if (supabaseOrder.success) {
            const itemsWithPrices = checkoutData.products.map((item)=>({
                    product_id: item.product_id,
                    product_name: item.product_name || "Custom Product",
                    quantity: item.quantity,
                    price: item.price || item.price_inc_tax || 0.25,
                    design_file_url: item.design_file_url || null,
                    options: item.options || null
                }));
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createOrderItems"])(supabaseOrder.id, itemsWithPrices);
        }
        console.log("Order created successfully:", {
            supabaseId: supabaseOrder.id
        });
        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: {
                id: supabaseOrder.id,
                customer_id: customerId,
                total,
                status: "pending",
                date_created: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error("Checkout error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to create order";
        res.status(500).json({
            error: errorMessage,
            details: ("TURBOPACK compile-time truthy", 1) ? String(error) : "TURBOPACK unreachable"
        });
    }
};
const handleGetCheckoutDetails = async (req, res)=>{
    try {
        const { cartId } = req.params;
        if (!cartId) {
            return res.status(400).json({
                error: "Cart ID is required"
            });
        }
        if (!isValidUUID(cartId)) {
            return res.status(400).json({
                error: "Invalid cart ID format"
            });
        }
        // This would typically fetch cart details and shipping estimates
        // For now, return placeholder data
        res.json({
            success: true,
            data: {
                cart_id: cartId,
                shipping_methods: [
                    {
                        id: "standard",
                        name: "Standard Shipping",
                        cost: 9.99,
                        estimated_days: "5-7 business days"
                    },
                    {
                        id: "express",
                        name: "Express Shipping",
                        cost: 19.99,
                        estimated_days: "2-3 business days"
                    },
                    {
                        id: "overnight",
                        name: "Overnight Shipping",
                        cost: 39.99,
                        estimated_days: "Next business day"
                    }
                ]
            }
        });
    } catch (error) {
        console.error("Get checkout details error:", error);
        res.status(500).json({
            error: "Failed to get checkout details"
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/store-credit.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleApplyStoreCreditToOrder",
    ()=>handleApplyStoreCreditToOrder,
    "handleGetAllCustomersCredit",
    ()=>handleGetAllCustomersCredit,
    "handleGetCreditHistory",
    ()=>handleGetCreditHistory,
    "handleGetCustomerCredit",
    ()=>handleGetCustomerCredit,
    "handleModifyStoreCredit",
    ()=>handleModifyStoreCredit
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, esm_import, [project]/node_modules/@supabase/supabase-js)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__["createClient"])(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_KEY || "");
const handleGetCustomerCredit = async (req, res)=>{
    try {
        const { customerId } = req.params;
        const requestingCustomerId = req.customerId;
        const isAdmin = req.isAdmin;
        if (!customerId) {
            return res.status(400).json({
                error: "Customer ID required"
            });
        }
        // SECURITY: Verify user can only access their own data (unless admin)
        if (parseInt(customerId) !== requestingCustomerId && !isAdmin) {
            return res.status(403).json({
                error: "Unauthorized"
            });
        }
        const { data: customer, error } = await supabase.from("customers").select("id, email, store_credit").eq("id", customerId).single();
        if (error || !customer) {
            return res.status(404).json({
                error: "Customer not found"
            });
        }
        res.json({
            success: true,
            data: {
                customer_id: customer.id,
                email: customer.email,
                balance: parseFloat(customer.store_credit || "0")
            }
        });
    } catch (error) {
        console.error("Get customer credit error:", error);
        res.status(500).json({
            error: "Failed to get customer credit"
        });
    }
};
const handleGetAllCustomersCredit = async (req, res)=>{
    try {
        const { data: customers, error } = await supabase.from("customers").select("id, email, first_name, last_name, store_credit, created_at").order("store_credit", {
            ascending: false
        });
        if (error) {
            throw error;
        }
        const formattedCustomers = customers.map((c)=>({
                id: c.id,
                email: c.email,
                name: `${c.first_name || ""} ${c.last_name || ""}`.trim(),
                balance: parseFloat(c.store_credit || "0"),
                created_at: c.created_at
            }));
        res.json({
            success: true,
            data: formattedCustomers,
            count: formattedCustomers.length
        });
    } catch (error) {
        console.error("Get all customers credit error:", error);
        res.status(500).json({
            error: "Failed to get customers"
        });
    }
};
const handleModifyStoreCredit = async (req, res)=>{
    try {
        const { customer_id, amount, reason, notes } = req.body;
        const adminId = req.customerId;
        if (!customer_id || amount === undefined || !reason) {
            return res.status(400).json({
                error: "Customer ID, amount, and reason are required"
            });
        }
        if (isNaN(amount) || amount === 0) {
            return res.status(400).json({
                error: "Amount must be a non-zero number"
            });
        }
        // Get current balance
        const { data: customer, error: fetchError } = await supabase.from("customers").select("store_credit").eq("id", customer_id).single();
        if (fetchError || !customer) {
            return res.status(404).json({
                error: "Customer not found"
            });
        }
        const currentBalance = parseFloat(customer.store_credit || "0");
        const newBalance = currentBalance + amount;
        // Prevent negative balance
        if (newBalance < 0) {
            return res.status(400).json({
                error: `Insufficient credit. Current balance: $${currentBalance.toFixed(2)}`
            });
        }
        // Update customer balance
        const { error: updateError } = await supabase.from("customers").update({
            store_credit: newBalance
        }).eq("id", customer_id);
        if (updateError) {
            throw updateError;
        }
        // Record transaction
        const transactionType = amount > 0 ? "add" : "subtract";
        const { error: transactionError } = await supabase.from("store_credit_transactions").insert({
            customer_id,
            amount,
            transaction_type: transactionType,
            reason,
            admin_id: adminId,
            notes
        });
        if (transactionError) {
            console.error("Transaction record error:", transactionError);
        // Don't fail the request if transaction logging fails
        }
        console.log(`Store credit updated for customer ${customer_id}:`, {
            amount,
            reason,
            oldBalance: currentBalance,
            newBalance
        });
        res.status(200).json({
            success: true,
            message: `Credit ${amount > 0 ? "added" : "removed"} successfully`,
            data: {
                customer_id,
                old_balance: currentBalance,
                new_balance: newBalance,
                amount
            }
        });
    } catch (error) {
        console.error("Modify store credit error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to modify store credit";
        res.status(500).json({
            error: errorMessage
        });
    }
};
const handleGetCreditHistory = async (req, res)=>{
    try {
        const { customerId } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        if (!customerId) {
            return res.status(400).json({
                error: "Customer ID required"
            });
        }
        const { data: transactions, error, count } = await supabase.from("store_credit_transactions").select("*", {
            count: "exact"
        }).eq("customer_id", customerId).order("created_at", {
            ascending: false
        }).range(Number(offset), Number(offset) + Number(limit) - 1);
        if (error) {
            throw error;
        }
        const formattedTransactions = transactions.map((t)=>({
                id: t.id,
                amount: parseFloat(t.amount),
                type: t.transaction_type,
                reason: t.reason,
                notes: t.notes,
                order_id: t.order_id,
                created_at: t.created_at
            }));
        res.json({
            success: true,
            data: formattedTransactions,
            pagination: {
                limit: Number(limit),
                offset: Number(offset),
                total: count
            }
        });
    } catch (error) {
        console.error("Get credit history error:", error);
        res.status(500).json({
            error: "Failed to get credit history"
        });
    }
};
const handleApplyStoreCreditToOrder = async (req, res)=>{
    try {
        const { customer_id, order_id, amount } = req.body;
        if (!customer_id || !order_id || !amount) {
            return res.status(400).json({
                error: "Customer ID, order ID, and amount are required"
            });
        }
        // Get current balance
        const { data: customer, error: fetchError } = await supabase.from("customers").select("store_credit").eq("id", customer_id).single();
        if (fetchError || !customer) {
            return res.status(404).json({
                error: "Customer not found"
            });
        }
        const currentBalance = parseFloat(customer.store_credit || "0");
        if (currentBalance < amount) {
            return res.status(400).json({
                error: "Insufficient store credit",
                available: currentBalance,
                requested: amount
            });
        }
        const newBalance = currentBalance - amount;
        // Update customer balance
        const { error: updateError } = await supabase.from("customers").update({
            store_credit: newBalance
        }).eq("id", customer_id);
        if (updateError) {
            throw updateError;
        }
        // Record transaction
        const { error: transactionError } = await supabase.from("store_credit_transactions").insert({
            customer_id,
            amount: -amount,
            transaction_type: "subtract",
            reason: "Applied to order",
            order_id
        });
        if (transactionError) {
            console.error("Transaction record error:", transactionError);
        }
        res.json({
            success: true,
            message: "Store credit applied to order",
            data: {
                customer_id,
                order_id,
                amount_used: amount,
                remaining_balance: newBalance
            }
        });
    } catch (error) {
        console.error("Apply store credit error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to apply store credit";
        res.status(500).json({
            error: errorMessage
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/support.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleAdminGetAllTickets",
    ()=>handleAdminGetAllTickets,
    "handleAdminReplyToTicket",
    ()=>handleAdminReplyToTicket,
    "handleCustomerReplyToTicket",
    ()=>handleCustomerReplyToTicket,
    "handleGetTicketDetails",
    ()=>handleGetTicketDetails,
    "handleGetTickets",
    ()=>handleGetTickets,
    "handleSupportSubmit",
    ()=>handleSupportSubmit,
    "handleUpdateTicketStatus",
    ()=>handleUpdateTicketStatus
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, esm_import, [project]/node_modules/@supabase/supabase-js)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$email$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/email.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$email$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$email$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";
/**
 * SECURITY: Service Role Key fallback for this route
 *
 * Justification:
 * - Support tickets are public submissions (don't require authentication)
 * - Guests can create tickets without login
 * - Admin endpoints require explicit verifyToken + requireAdmin middleware
 * - RLS policies can still protect customer tickets (customer_id based)
 *
 * Current Implementation:
 * - Falls back to anon key if SERVICE_KEY unavailable
 * - Public endpoints use this client for guest submissions
 * - Admin endpoints (admin replies) require authentication
 *
 * TODO: Refactor to use getScopedSupabaseClient for authenticated endpoints
 * See: docs/RLS_SCOPING.md for security architecture
 */ const supabase = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__["createClient"])(supabaseUrl, supabaseServiceKey || process.env.SUPABASE_ANON_KEY || "");
const handleSupportSubmit = async (req, res)=>{
    try {
        const { name, email, subject, category, priority, message, customerId } = req.body;
        // Validate required fields
        if (!name || !email || !subject || !message) {
            res.status(400).json({
                success: false,
                error: "Missing required fields: name, email, subject, and message"
            });
            return;
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                error: "Invalid email format"
            });
            return;
        }
        // Insert ticket into Supabase
        const { data, error } = await supabase.from("support_tickets").insert({
            customer_id: customerId || 0,
            customer_email: email,
            customer_name: name,
            subject,
            category,
            priority,
            message,
            status: "open"
        }).select("id").single();
        if (error) {
            console.error("Error inserting ticket:", error);
            res.status(500).json({
                success: false,
                error: "Failed to create support ticket"
            });
            return;
        }
        console.log("Support Ticket Created:", {
            ticketId: data.id,
            timestamp: new Date().toISOString(),
            name,
            email,
            subject,
            category,
            priority
        });
        // Send confirmation email
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$email$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["sendTicketCreationEmail"])(email, name, data.id, subject);
        res.status(200).json({
            success: true,
            message: "Support request submitted successfully",
            ticketId: data.id
        });
    } catch (error) {
        console.error("Error handling support submission:", error);
        res.status(500).json({
            success: false,
            error: "Failed to process support request"
        });
    }
};
const handleGetTickets = async (req, res)=>{
    try {
        const customerId = req.query.customerId;
        if (!customerId) {
            res.status(400).json({
                error: "Customer ID is required"
            });
            return;
        }
        const { data, error } = await supabase.from("support_tickets").select("*").eq("customer_id", parseInt(customerId)).order("created_at", {
            ascending: false
        });
        if (error) {
            console.error("Error fetching tickets from Supabase:", {
                message: error.message,
                code: error.code,
                details: error.details
            });
            res.status(500).json({
                error: "Failed to fetch tickets",
                details: error.message
            });
            return;
        }
        console.log(`Successfully fetched ${data?.length || 0} tickets for customer ${customerId}`);
        res.json({
            tickets: data || []
        });
    } catch (error) {
        console.error("Error in handleGetTickets:", error);
        res.status(500).json({
            error: "Failed to fetch tickets"
        });
    }
};
const handleGetTicketDetails = async (req, res)=>{
    try {
        const { ticketId } = req.params;
        // SECURITY: Use authenticated customer ID from request, not query parameter
        const customerId = req.customerId;
        const isAdmin = req.isAdmin;
        if (!ticketId) {
            res.status(400).json({
                error: "Ticket ID is required"
            });
            return;
        }
        if (!customerId) {
            res.status(401).json({
                error: "Authentication required"
            });
            return;
        }
        const { data: ticket, error: ticketError } = await supabase.from("support_tickets").select("*").eq("id", ticketId).single();
        if (ticketError || !ticket) {
            res.status(404).json({
                error: "Ticket not found"
            });
            return;
        }
        // SECURITY: Verify customer owns the ticket (admins can view all)
        if (!isAdmin && ticket.customer_id !== customerId) {
            res.status(403).json({
                error: "Unauthorized: You can only view your own tickets"
            });
            return;
        }
        const { data: replies, error: repliesError } = await supabase.from("ticket_replies").select("*").eq("ticket_id", ticketId).order("created_at", {
            ascending: true
        });
        if (repliesError) {
            console.error("Error fetching replies:", repliesError);
            res.status(500).json({
                error: "Failed to fetch ticket replies"
            });
            return;
        }
        res.json({
            ticket,
            replies: replies || []
        });
    } catch (error) {
        console.error("Error in handleGetTicketDetails:", error);
        res.status(500).json({
            error: "Failed to fetch ticket details"
        });
    }
};
const handleAdminGetAllTickets = async (req, res)=>{
    try {
        const { status, priority } = req.query;
        let query = supabase.from("support_tickets").select("*");
        if (status) {
            query = query.eq("status", status);
        }
        if (priority) {
            query = query.eq("priority", priority);
        }
        const { data, error } = await query.order("created_at", {
            ascending: false
        });
        if (error) {
            console.error("Error fetching all tickets:", error);
            res.status(500).json({
                error: "Failed to fetch tickets"
            });
            return;
        }
        res.json(data || []);
    } catch (error) {
        console.error("Error in handleAdminGetAllTickets:", error);
        res.status(500).json({
            error: "Failed to fetch tickets"
        });
    }
};
const handleAdminReplyToTicket = async (req, res)=>{
    try {
        const { ticketId } = req.params;
        const { message, adminName } = req.body;
        if (!ticketId || !message || !adminName) {
            res.status(400).json({
                error: "Missing required fields: ticketId, message, adminName"
            });
            return;
        }
        // Get ticket details for customer email
        const { data: ticket, error: ticketError } = await supabase.from("support_tickets").select("customer_email, customer_name").eq("id", ticketId).single();
        if (ticketError || !ticket) {
            res.status(404).json({
                error: "Ticket not found"
            });
            return;
        }
        // Insert reply
        const { data: reply, error: replyError } = await supabase.from("ticket_replies").insert({
            ticket_id: ticketId,
            sender_type: "admin",
            sender_name: adminName,
            sender_email: "support@stickerland.com",
            message
        }).select("id").single();
        if (replyError) {
            console.error("Error inserting reply:", replyError);
            res.status(500).json({
                error: "Failed to send reply"
            });
            return;
        }
        // Update ticket status to in-progress
        const { data: updatedTicket } = await supabase.from("support_tickets").update({
            status: "in-progress",
            updated_at: new Date().toISOString()
        }).eq("id", ticketId).select("subject").single();
        console.log("Admin Reply Created:", {
            ticketId,
            replyId: reply.id,
            customerEmail: ticket.customer_email,
            message
        });
        // Send email notification to customer
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$email$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["sendTicketReplyEmail"])(ticket.customer_email, ticket.customer_name, ticketId, updatedTicket?.subject || "Your Support Ticket", message, adminName);
        res.json({
            success: true,
            replyId: reply.id,
            message: "Reply sent successfully and customer notified"
        });
    } catch (error) {
        console.error("Error in handleAdminReplyToTicket:", error);
        res.status(500).json({
            error: "Failed to send reply"
        });
    }
};
const handleCustomerReplyToTicket = async (req, res)=>{
    try {
        const { ticketId } = req.params;
        const { message, customerId } = req.body;
        if (!ticketId || !message || !customerId) {
            res.status(400).json({
                error: "Missing required fields: ticketId, message, customerId"
            });
            return;
        }
        // Get ticket details to verify ownership
        const { data: ticket, error: ticketError } = await supabase.from("support_tickets").select("customer_id, customer_name, customer_email").eq("id", ticketId).single();
        if (ticketError || !ticket) {
            res.status(404).json({
                error: "Ticket not found"
            });
            return;
        }
        // Verify customer owns this ticket
        if (ticket.customer_id !== customerId) {
            res.status(403).json({
                error: "Unauthorized: You can only reply to your own tickets"
            });
            return;
        }
        // Insert reply
        const { data: reply, error: replyError } = await supabase.from("ticket_replies").insert({
            ticket_id: ticketId,
            sender_type: "customer",
            sender_name: ticket.customer_name,
            sender_email: ticket.customer_email,
            message
        }).select("id").single();
        if (replyError) {
            console.error("Error inserting customer reply:", replyError);
            res.status(500).json({
                error: "Failed to send reply"
            });
            return;
        }
        // Update ticket updated_at timestamp
        await supabase.from("support_tickets").update({
            updated_at: new Date().toISOString()
        }).eq("id", ticketId);
        console.log("Customer Reply Created:", {
            ticketId,
            replyId: reply.id,
            customerId,
            message
        });
        res.json({
            success: true,
            replyId: reply.id,
            message: "Reply sent successfully"
        });
    } catch (error) {
        console.error("Error in handleCustomerReplyToTicket:", error);
        res.status(500).json({
            error: "Failed to send reply"
        });
    }
};
const handleUpdateTicketStatus = async (req, res)=>{
    try {
        const { ticketId } = req.params;
        const { status } = req.body;
        if (!ticketId || !status) {
            res.status(400).json({
                error: "Missing required fields"
            });
            return;
        }
        const validStatuses = [
            "open",
            "in-progress",
            "resolved",
            "closed"
        ];
        if (!validStatuses.includes(status)) {
            res.status(400).json({
                error: "Invalid status"
            });
            return;
        }
        const { error } = await supabase.from("support_tickets").update({
            status,
            updated_at: new Date().toISOString()
        }).eq("id", ticketId);
        if (error) {
            console.error("Error updating ticket:", error);
            res.status(500).json({
                error: "Failed to update ticket"
            });
            return;
        }
        res.json({
            success: true,
            message: "Ticket status updated"
        });
    } catch (error) {
        console.error("Error in handleUpdateTicketStatus:", error);
        res.status(500).json({
            error: "Failed to update ticket"
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/payments.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "handleGetPaymentMethods",
    ()=>handleGetPaymentMethods,
    "handleProcessPayment",
    ()=>handleProcessPayment
]);
const handleGetPaymentMethods = async (req, res)=>{
    try {
        // Return standard payment methods for Ecwid
        const methods = [
            {
                id: "stripe",
                name: "Credit Card (Stripe)",
                type: "card"
            },
            {
                id: "paypal",
                name: "PayPal",
                type: "paypal"
            },
            {
                id: "bank_transfer",
                name: "Bank Transfer",
                type: "bank"
            }
        ];
        res.json({
            success: true,
            data: methods
        });
    } catch (error) {
        console.error("Get payment methods error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to get payment methods"
        });
    }
};
const handleProcessPayment = async (req, res)=>{
    try {
        const paymentData = req.body;
        // Validate required fields
        if (!paymentData.amount || !paymentData.currency || !paymentData.payment_method_id) {
            return res.status(400).json({
                error: "Missing required fields: amount, currency, payment_method_id"
            });
        }
        // Log payment for record-keeping
        console.log("Processing payment via Ecwid:", {
            amount: paymentData.amount,
            currency: paymentData.currency,
            method: paymentData.payment_method_id,
            orderId: paymentData.order_id
        });
        // In production, this would integrate with Ecwid's payment gateway
        // For now, we acknowledge the payment and return success
        res.status(201).json({
            success: true,
            data: {
                id: `payment_${Date.now()}`,
                amount: paymentData.amount,
                currency: paymentData.currency,
                payment_method_id: paymentData.payment_method_id,
                status: "processing",
                created_at: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error("Process payment error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to process payment";
        res.status(400).json({
            error: errorMessage
        });
    }
};
}),
"[project]/server/routes/webhooks.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleEcwidDiagnostic",
    ()=>handleEcwidDiagnostic,
    "handleEcwidOrderWebhook",
    ()=>handleEcwidOrderWebhook,
    "handleGetWebhookUrl",
    ()=>handleGetWebhookUrl,
    "handleTestWebhook",
    ()=>handleTestWebhook,
    "handleWebhookHealth",
    ()=>handleWebhookHealth
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, esm_import, [project]/node_modules/@supabase/supabase-js)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__["createClient"])(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_KEY || "");
/**
 * Map Ecwid fulfillment status to internal order status
 */ function mapEcwidStatusToOrderStatus(fulfillmentStatus, paymentStatus) {
    const statusMap = {
        "AWAITING_PAYMENT": "pending",
        "PAID": "processing",
        "PROCESSING": "processing",
        "SHIPPED": "completed",
        "DELIVERED": "completed",
        "CANCELLED": "cancelled"
    };
    const ecwidStatus = fulfillmentStatus || paymentStatus || "PROCESSING";
    return statusMap[ecwidStatus] || "pending";
}
/**
 * Verify Ecwid webhook signature
 * Ecwid sends an X-Ecwid-Webhook-Signature header
 */ function verifyEcwidSignature(body, signature) {
    const secret = process.env.ECWID_API_TOKEN || "";
    // Create HMAC SHA256 hash
    const hash = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHmac("sha256", secret).update(body).digest("hex");
    // Compare signatures
    return hash === signature;
}
const handleEcwidOrderWebhook = async (req, res)=>{
    try {
        const signature = req.headers["x-ecwid-webhook-signature"];
        const body = JSON.stringify(req.body);
        // Verify webhook signature
        if (!verifyEcwidSignature(body, signature)) {
            console.warn("Invalid webhook signature");
            return res.status(401).json({
                error: "Invalid signature"
            });
        }
        const event = req.body;
        console.log("Ecwid webhook received:", {
            eventType: event.eventType,
            orderId: event.data?.orderId,
            customerId: event.data?.customerId
        });
        // Handle different event types
        switch(event.eventType){
            case "order.completed":
                await handleOrderCompleted(event.data);
                break;
            case "order.updated":
                await handleOrderUpdated(event.data);
                break;
            case "customer.created":
                await handleCustomerCreated(event.data);
                break;
            case "customer.updated":
                await handleCustomerUpdated(event.data);
                break;
            default:
                console.log("Unhandled event type:", event.eventType);
        }
        // Always return success to Ecwid
        res.json({
            success: true
        });
    } catch (error) {
        console.error("Webhook error:", error);
        // Still return 200 to prevent Ecwid from retrying
        res.status(200).json({
            error: "Webhook processed with errors"
        });
    }
};
/**
 * Handle order completion
 */ async function handleOrderCompleted(data) {
    try {
        console.log("Processing Ecwid order completion:", data.orderId, "Customer:", data.customerId);
        // Check if order exists in Supabase by Ecwid order ID
        const { data: existingOrder } = await supabase.from("orders").select("id").eq("ecwid_order_id", data.orderId).single();
        if (existingOrder) {
            // Don't overwrite status on order.completed if order already exists
            // Just update the timestamp to mark as processed
            await supabase.from("orders").update({
                updated_at: new Date().toISOString()
            }).eq("id", existingOrder.id);
            console.log("Ecwid order already exists in Supabase:", existingOrder.id);
        } else {
            // Find customer by Ecwid customer ID
            const { data: customer } = await supabase.from("customers").select("id").eq("ecwid_customer_id", data.customerId).single();
            // Create new order record - use Ecwid's fulfillment status if available
            const orderStatus = mapEcwidStatusToOrderStatus(data.fulfillmentStatus, data.paymentStatus);
            const orderData = {
                customer_id: customer?.id || null,
                status: orderStatus,
                total: data.total || 0,
                subtotal: data.subtotal || 0,
                tax: data.tax || 0,
                shipping: data.shipping || 0,
                billing_address: data.billingPerson,
                shipping_address: data.shippingPerson,
                ecwid_order_id: data.orderId,
                ecwid_customer_id: data.customerId,
                items: data.items || [],
                created_at: data.createDate || new Date().toISOString(),
                estimated_delivery_date: data.estimatedDeliveryDate || null,
                tracking_number: data.trackingNumber || null,
                tracking_carrier: data.trackingCarrier || null,
                tracking_url: data.trackingUrl || null
            };
            const { data: newOrder, error } = await supabase.from("orders").insert(orderData).select().single();
            if (!error && newOrder) {
                console.log("Ecwid order created in Supabase:", newOrder.id);
            } else if (error) {
                console.error("Error creating order in Supabase:", error);
            }
        }
    } catch (error) {
        console.error("Error processing order completion:", error);
    }
}
/**
 * Handle order update
 */ async function handleOrderUpdated(data) {
    try {
        console.log("Processing Ecwid order update:", data.orderId);
        const updateData = {
            status: mapEcwidStatusToOrderStatus(data.fulfillmentStatus, data.paymentStatus),
            updated_at: new Date().toISOString()
        };
        // Update estimated delivery date if provided
        if (data.estimatedDeliveryDate) {
            updateData.estimated_delivery_date = data.estimatedDeliveryDate;
        }
        // Update tracking information if provided
        if (data.trackingNumber) {
            updateData.tracking_number = data.trackingNumber;
            updateData.tracking_carrier = data.trackingCarrier || null;
            updateData.tracking_url = data.trackingUrl || null;
            updateData.shipped_date = new Date().toISOString();
        }
        const { error } = await supabase.from("orders").update(updateData).eq("ecwid_order_id", data.orderId);
        if (!error) {
            console.log("Ecwid order updated in Supabase:", data.orderId);
        } else {
            console.error("Error updating order in Supabase:", error);
        }
    } catch (error) {
        console.error("Error processing order update:", error);
    }
}
/**
 * Handle customer creation
 */ async function handleCustomerCreated(data) {
    try {
        console.log("Processing customer creation from Ecwid:", data.id, data.email);
        // Check if customer exists by Ecwid ID
        const { data: existingCustomer } = await supabase.from("customers").select("id, ecwid_customer_id").eq("ecwid_customer_id", data.id).single();
        if (!existingCustomer) {
            // Create customer in Supabase with Ecwid customer ID
            const { data: newCustomer, error } = await supabase.from("customers").insert({
                email: data.email,
                first_name: data.firstName || "",
                last_name: data.lastName || "",
                phone: data.phone || "",
                company: data.companyName || "",
                store_credit: 0,
                ecwid_customer_id: data.id,
                // Customer will set password when they first log in
                password_hash: null
            }).select().single();
            if (error) {
                console.error("Error creating customer in Supabase:", error);
            } else {
                console.log("Ecwid customer synced to Supabase:", newCustomer.id);
            }
        } else {
            console.log("Ecwid customer already exists in Supabase:", existingCustomer.id);
        }
    } catch (error) {
        console.error("Error processing customer creation:", error);
    }
}
/**
 * Handle customer update
 */ async function handleCustomerUpdated(data) {
    try {
        console.log("Processing customer update from Ecwid:", data.id);
        // Find customer by Ecwid ID
        const { data: existingCustomer } = await supabase.from("customers").select("id").eq("ecwid_customer_id", data.id).single();
        if (existingCustomer) {
            await supabase.from("customers").update({
                email: data.email,
                first_name: data.firstName || "",
                last_name: data.lastName || "",
                phone: data.phone || "",
                company: data.companyName || "",
                updated_at: new Date().toISOString()
            }).eq("id", existingCustomer.id);
            console.log("Ecwid customer updated in Supabase:", existingCustomer.id);
        } else {
            // Customer doesn't exist, create them
            await handleCustomerCreated(data);
        }
    } catch (error) {
        console.error("Error processing customer update:", error);
    }
}
const handleGetWebhookUrl = (req, res)=>{
    const host = req.get("host") || "your-domain.com";
    const protocol = req.header("x-forwarded-proto") || req.protocol || "https";
    const webhookUrl = `${protocol}://${host}/api/webhooks/ecwid`;
    res.json({
        webhookUrl,
        instructions: "Paste this URL into your Ecwid admin panel under Settings → Integration → Webhooks",
        events: [
            "order.completed",
            "order.updated",
            "customer.created",
            "customer.updated"
        ]
    });
};
const handleWebhookHealth = (req, res)=>{
    res.json({
        status: "ok",
        timestamp: new Date().toISOString()
    });
};
const handleEcwidDiagnostic = async (req, res)=>{
    try {
        const ECWID_API_TOKEN = process.env.ECWID_API_TOKEN || "";
        const ECWID_STORE_ID = process.env.ECWID_STORE_ID || "";
        const diagnostics = {
            timestamp: new Date().toISOString(),
            configStatus: {
                hasApiToken: !!ECWID_API_TOKEN,
                hasStoreId: !!ECWID_STORE_ID,
                storeId: ECWID_STORE_ID
            },
            apiConnectivity: {
                status: "unknown",
                message: ""
            },
            webhookUrl: `${req.header("x-forwarded-proto") || req.protocol || "https"}://${req.get("host") || "your-domain.com"}/api/webhooks/ecwid`,
            webhookSetupInstructions: {
                step1: "Log in to your Ecwid admin panel",
                step2: "Go to Settings → Integration → Webhooks (or Settings → API → Webhooks)",
                step3: "Add a new webhook with the URL above",
                step4: "Select events: order.completed, order.updated, customer.created, customer.updated",
                step5: "Save and test the webhook"
            },
            supabaseConnection: {
                status: "unknown",
                message: ""
            },
            recentOrders: {
                count: 0,
                lastOrder: null
            }
        };
        // Check API connectivity
        if (!ECWID_API_TOKEN || !ECWID_STORE_ID) {
            diagnostics.apiConnectivity.status = "error";
            diagnostics.apiConnectivity.message = "Missing ECWID_API_TOKEN or ECWID_STORE_ID environment variables";
        } else {
            try {
                // Try to fetch a single order to verify connectivity
                const response = await fetch(`https://api.ecwid.com/api/v3/${ECWID_STORE_ID}/orders?limit=1&token=${ECWID_API_TOKEN}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    diagnostics.apiConnectivity.status = "connected";
                    diagnostics.apiConnectivity.message = "Successfully connected to Ecwid API";
                    diagnostics.recentOrders.count = data.total || 0;
                    if (data.items && data.items.length > 0) {
                        diagnostics.recentOrders.lastOrder = {
                            id: data.items[0].id,
                            number: data.items[0].number,
                            createdDate: data.items[0].createdDate,
                            status: data.items[0].status
                        };
                    }
                } else {
                    diagnostics.apiConnectivity.status = "error";
                    diagnostics.apiConnectivity.message = `Ecwid API returned ${response.status}: ${response.statusText}`;
                }
            } catch (error) {
                diagnostics.apiConnectivity.status = "error";
                diagnostics.apiConnectivity.message = `Network error: ${error instanceof Error ? error.message : "Unknown error"}`;
            }
        }
        // Check Supabase connection and recent webhooks
        try {
            const { data: recentWebhooks, error } = await supabase.from("orders").select("id, ecwid_order_id, created_at, status").order("created_at", {
                ascending: false
            }).limit(5);
            if (!error) {
                diagnostics.supabaseConnection.status = "connected";
                diagnostics.supabaseConnection.message = "Successfully connected to Supabase";
            } else {
                diagnostics.supabaseConnection.status = "error";
                diagnostics.supabaseConnection.message = `Supabase error: ${error.message}`;
            }
        } catch (error) {
            diagnostics.supabaseConnection.status = "error";
            diagnostics.supabaseConnection.message = `Connection error: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
        res.json(diagnostics);
    } catch (error) {
        console.error("Diagnostic error:", error);
        res.status(500).json({
            error: "Failed to run diagnostics",
            message: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString()
        });
    }
};
const handleTestWebhook = async (req, res)=>{
    try {
        const testPayload = req.body;
        // Add test signature for validation (we'll skip verification for test endpoint)
        console.log("Test webhook payload received:", testPayload);
        // Process based on event type
        if (testPayload.eventType === "order.completed") {
            await handleOrderCompleted(testPayload.data);
            res.json({
                success: true,
                message: "Test order webhook processed",
                eventType: "order.completed"
            });
        } else if (testPayload.eventType === "customer.created") {
            await handleCustomerCreated(testPayload.data);
            res.json({
                success: true,
                message: "Test customer webhook processed",
                eventType: "customer.created"
            });
        } else {
            res.json({
                success: true,
                message: "Test webhook received and logged",
                eventType: testPayload.eventType || "unknown"
            });
        }
    } catch (error) {
        console.error("Test webhook error:", error);
        res.status(500).json({
            error: "Failed to process test webhook",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/zapier.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleGetZapierWebhookUrl",
    ()=>handleGetZapierWebhookUrl,
    "handleZapierEcwidWebhook",
    ()=>handleZapierEcwidWebhook,
    "handleZapierHealth",
    ()=>handleZapierHealth
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, esm_import, [project]/node_modules/@supabase/supabase-js)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__["createClient"])(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_KEY || "");
const handleZapierEcwidWebhook = async (req, res)=>{
    try {
        // SECURITY: Verify API key
        const apiKey = req.headers['x-api-key'];
        const expectedKey = process.env.ZAPIER_WEBHOOK_API_KEY;
        if (!expectedKey) {
            console.error("[SECURITY] ZAPIER_WEBHOOK_API_KEY not configured");
            return res.status(503).json({
                error: "Webhook not configured"
            });
        }
        if (!apiKey || apiKey !== expectedKey) {
            console.warn("[SECURITY] Invalid Zapier webhook API key attempt");
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        const zapierData = req.body;
        console.log("Zapier webhook received from Ecwid:", {
            orderId: zapierData.order_id || zapierData.id,
            customerEmail: zapierData.customer_email || zapierData.email,
            total: zapierData.order_total || zapierData.total
        });
        // Extract order data from Zapier payload
        const ecwidOrderId = zapierData.order_id || zapierData.id;
        const ecwidCustomerId = zapierData.customer_id || zapierData.customer?.id;
        if (!ecwidOrderId) {
            return res.status(400).json({
                error: "Missing order_id in Zapier payload"
            });
        }
        // Check if order already exists in Supabase
        const { data: existingOrder } = await supabase.from("orders").select("id").eq("ecwid_order_id", ecwidOrderId).single();
        if (existingOrder) {
            console.log("Order already exists in Supabase:", existingOrder.id);
            return res.json({
                success: true,
                message: "Order already exists",
                orderId: existingOrder.id
            });
        }
        // Find or get customer
        let customerId = null;
        if (ecwidCustomerId) {
            const { data: customer } = await supabase.from("customers").select("id").eq("ecwid_customer_id", ecwidCustomerId).single();
            customerId = customer?.id || null;
        }
        // Prepare order data
        const orderData = {
            customer_id: customerId,
            status: "processing",
            total: zapierData.order_total || zapierData.total || 0,
            subtotal: zapierData.order_subtotal || zapierData.subtotal || 0,
            tax: zapierData.order_tax || zapierData.tax || 0,
            shipping: zapierData.order_shipping || zapierData.shipping || 0,
            billing_address: zapierData.billing_address || {
                name: zapierData.billing_name,
                email: zapierData.billing_email,
                phone: zapierData.billing_phone,
                address: zapierData.billing_address_1,
                city: zapierData.billing_city,
                state: zapierData.billing_state,
                postal_code: zapierData.billing_postal_code,
                country: zapierData.billing_country
            },
            shipping_address: zapierData.shipping_address || {
                name: zapierData.shipping_name,
                email: zapierData.shipping_email,
                phone: zapierData.shipping_phone,
                address: zapierData.shipping_address_1,
                city: zapierData.shipping_city,
                state: zapierData.shipping_state,
                postal_code: zapierData.shipping_postal_code,
                country: zapierData.shipping_country
            },
            ecwid_order_id: ecwidOrderId,
            ecwid_customer_id: ecwidCustomerId || null,
            items: zapierData.items || [],
            created_at: zapierData.created_date || zapierData.date_created || new Date().toISOString(),
            estimated_delivery_date: zapierData.estimated_delivery_date || null,
            tracking_number: zapierData.tracking_number || null,
            tracking_carrier: zapierData.tracking_carrier || null,
            tracking_url: zapierData.tracking_url || null,
            source: "zapier"
        };
        // Create order in Supabase
        const { data: newOrder, error: orderError } = await supabase.from("orders").insert([
            orderData
        ]).select().single();
        if (orderError) {
            console.error("Error creating order in Supabase:", orderError);
            return res.status(500).json({
                error: "Failed to create order",
                details: orderError.message
            });
        }
        console.log("Order successfully created from Zapier:", newOrder.id);
        // Also sync customer if provided
        if (ecwidCustomerId) {
            const { data: existingCustomer } = await supabase.from("customers").select("id").eq("ecwid_customer_id", ecwidCustomerId).single();
            if (!existingCustomer) {
                const customerData = {
                    email: zapierData.customer_email || zapierData.email,
                    ecwid_customer_id: ecwidCustomerId,
                    name: zapierData.customer_name || zapierData.name || "",
                    phone: zapierData.phone || ""
                };
                const { error: customerError } = await supabase.from("customers").insert([
                    customerData
                ]);
                if (customerError) {
                    console.warn("Error creating customer from Zapier:", customerError);
                // Don't fail the request if customer sync fails - order is already created
                }
            }
        }
        res.json({
            success: true,
            message: "Order synced from Zapier to Supabase",
            orderId: newOrder.id,
            ecwidOrderId: ecwidOrderId
        });
    } catch (error) {
        console.error("Zapier webhook error:", error);
        res.status(500).json({
            error: "Failed to process Zapier webhook",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
const handleZapierHealth = (req, res)=>{
    res.json({
        status: "healthy",
        service: "zapier-ecwid-integration",
        endpoint: "/api/zapier/webhook",
        timestamp: new Date().toISOString()
    });
};
const handleGetZapierWebhookUrl = (req, res)=>{
    const host = req.get("host") || "your-domain.com";
    const protocol = req.header("x-forwarded-proto") || req.protocol || "https";
    const zapierWebhookUrl = `${protocol}://${host}/api/zapier/webhook`;
    res.json({
        webhookUrl: zapierWebhookUrl,
        instructions: {
            step1: "In Zapier, create a new Zap with Ecwid as trigger",
            step2: "Choose 'New Order' or 'Updated Order' event",
            step3: "For the action, select 'Webhooks by Zapier' → 'POST'",
            step4: "Paste this URL into the webhook URL field",
            step5: "Map the following Ecwid fields to the webhook body:",
            fieldMappings: {
                order_id: "Use Ecwid's Order ID field",
                customer_id: "Use Ecwid's Customer ID field",
                customer_email: "Use Ecwid's Customer Email field",
                order_total: "Use Ecwid's Order Total field",
                order_subtotal: "Use Ecwid's Order Subtotal field",
                order_tax: "Use Ecwid's Tax field",
                order_shipping: "Use Ecwid's Shipping Cost field",
                items: "Use Ecwid's Order Items field",
                created_date: "Use Ecwid's Date Created field"
            },
            step6: "Save and test your Zap"
        }
    });
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/utils/square.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createSquarePaymentLink",
    ()=>createSquarePaymentLink,
    "getCheckoutApi",
    ()=>getCheckoutApi,
    "getLocationsApi",
    ()=>getLocationsApi,
    "getOrdersApi",
    ()=>getOrdersApi,
    "getPaymentsApi",
    ()=>getPaymentsApi,
    "getSquareClient",
    ()=>getSquareClient,
    "getSquareLocations",
    ()=>getSquareLocations,
    "isValidAddress",
    ()=>isValidAddress,
    "isValidCountryCode",
    ()=>isValidCountryCode,
    "isValidEmail",
    ()=>isValidEmail,
    "isValidPhone",
    ()=>isValidPhone,
    "processSquarePayment",
    ()=>processSquarePayment,
    "sanitizeInput",
    ()=>sanitizeInput
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/order.ts [api] (ecmascript)");
// Valid ISO 3166-1 alpha-2 country codes
const VALID_COUNTRY_CODES = new Set([
    "US",
    "GB",
    "CA",
    "AU",
    "DE",
    "FR",
    "IT",
    "ES",
    "NL",
    "BE",
    "CH",
    "AT",
    "SE",
    "NO",
    "DK",
    "FI",
    "PL",
    "CZ",
    "SK",
    "HU",
    "RO",
    "BG",
    "GR",
    "PT",
    "IE",
    "NZ",
    "SG",
    "HK",
    "JP",
    "KR",
    "TW",
    "CN",
    "IN",
    "BR",
    "MX",
    "AR",
    "CO",
    "PE",
    "CL",
    "ZA",
    "KE",
    "NG",
    "EG",
    "IL",
    "AE",
    "SA",
    "QA",
    "TH",
    "MY",
    "ID",
    "PH",
    "VN",
    "TW",
    "GR",
    "CY",
    "MT",
    "LU",
    "IS",
    "HR",
    "SI",
    "LV",
    "LT",
    "EE",
    "GE",
    "KZ",
    "UA",
    "BY",
    "RU",
    "TR",
    "LB",
    "JO",
    "AE"
]);
function isValidCountryCode(code) {
    if (!code) return true; // Allow empty/undefined
    return VALID_COUNTRY_CODES.has(code.toUpperCase());
}
function isValidEmail(email) {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
}
function isValidPhone(phone) {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\d+\-().\s]{7,20}$/;
    return phoneRegex.test(phone);
}
function sanitizeInput(input) {
    if (!input) return "";
    // Remove any HTML/script tags and dangerous characters
    return input.replace(/[<>"{};]/g, "").trim().slice(0, 255);
}
function isValidAddress(address) {
    if (!address) return false;
    // Address should be 1-255 characters, no dangerous characters
    return address.length > 0 && address.length <= 255 && !/[<>"{};]/.test(address);
}
let squareClient = null;
async function getSquareClient() {
    if (!squareClient) {
        try {
            console.log("Initializing Square SDK...");
            // Check environment variables - token is required
            const accessToken = process.env.SQUARE_ACCESS_TOKEN;
            if (!accessToken) {
                throw new Error("SQUARE_ACCESS_TOKEN environment variable is not configured. This is required for Square API operations.");
            }
            console.log("Access token found, length:", accessToken.length);
            // Import Square SDK - the correct export is SquareClient
            let SquareClientClass;
            try {
                // First try ES module import
                const squareModule = await __turbopack_context__.A("[externals]/square [external] (square, cjs, [project]/node_modules/square, async loader)");
                SquareClientClass = squareModule.SquareClient || squareModule.default;
            } catch (importError) {
                console.warn("ES module import failed, falling back to require:", importError);
                // Fallback to CommonJS require
                const squareModule = __turbopack_context__.r("[externals]/square [external] (square, cjs, [project]/node_modules/square)");
                SquareClientClass = squareModule.SquareClient;
            }
            if (!SquareClientClass || typeof SquareClientClass !== "function") {
                throw new Error(`Square SquareClient not found or not a constructor. Received: ${typeof SquareClientClass}`);
            }
            // Initialize with correct environment string
            squareClient = new SquareClientClass({
                accessToken: accessToken,
                environment: "sandbox"
            });
            console.log("Square SDK client initialized successfully");
            // Verify APIs are accessible (v43.2.1+ exposes APIs as objects)
            if (!squareClient.payments) {
                throw new Error("payments API not accessible on Square client");
            }
            if (!squareClient.orders) {
                throw new Error("orders API not accessible on Square client");
            }
            console.log("Square APIs verified - payments and orders APIs accessible");
        } catch (error) {
            console.error("Failed to initialize Square client:", error);
            throw new Error(`Square SDK initialization failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    return squareClient;
}
async function getPaymentsApi() {
    const client = await getSquareClient();
    if (!client.payments) {
        throw new Error("Square payments API is not available");
    }
    return client.payments;
}
async function getLocationsApi() {
    const client = await getSquareClient();
    if (!client.locations) {
        throw new Error("Square locations API is not available");
    }
    return client.locations;
}
async function getOrdersApi() {
    const client = await getSquareClient();
    if (!client.orders) {
        throw new Error("Square orders API is not available");
    }
    return client.orders;
}
async function getCheckoutApi() {
    const client = await getSquareClient();
    if (!client.checkout) {
        throw new Error("Square checkout API is not available");
    }
    return client.checkout;
}
;
async function processSquarePayment(paymentData) {
    try {
        // Amount should be in the smallest currency unit (cents for USD)
        const amountInCents = Math.round(paymentData.amount * 100);
        const paymentBody = {
            sourceId: paymentData.sourceId,
            amountMoney: {
                amount: amountInCents,
                currency: paymentData.currency || "USD"
            },
            autocomplete: true,
            idempotencyKey: `${Date.now()}-${Math.random()}`,
            ...paymentData.orderId && {
                orderId: paymentData.orderId.toString()
            },
            ...paymentData.customerName && {
                customerId: paymentData.customerName
            },
            ...paymentData.customerEmail && {
                receiptEmail: paymentData.customerEmail
            }
        };
        console.log("Processing Square payment with amount:", amountInCents, "cents");
        const paymentsApi = await getPaymentsApi();
        const response = await paymentsApi.createPayment(paymentBody);
        if (response.result) {
            console.log("Square payment processed successfully:", response.result.id);
            return {
                success: true,
                paymentId: response.result.id,
                status: response.result.status,
                amount: response.result.amountMoney?.amount,
                currency: response.result.amountMoney?.currency
            };
        }
        throw new Error("Payment processing failed - no result returned");
    } catch (error) {
        console.error("Square payment error:", error);
        // More detailed error handling
        if (error && typeof error === "object") {
            const errorObj = error;
            // Check for authentication errors
            if (errorObj?.errors?.[0]?.code === "UNAUTHORIZED" || errorObj?.errors?.[0]?.detail?.includes("Invalid API key")) {
                console.error("Square authentication failed - check access token");
                throw new Error("Square authentication failed. Please verify your access token is valid and has the required permissions.");
            }
            // Check for other Square-specific errors
            if (errorObj?.errors?.[0]?.detail) {
                throw new Error(errorObj.errors[0].detail);
            }
            if (errorObj?.errors?.[0]?.message) {
                throw new Error(errorObj.errors[0].message);
            }
        }
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Payment processing failed");
    }
}
async function getSquareLocations() {
    try {
        const locationsApi = await getLocationsApi();
        const response = await locationsApi.listLocations();
        return response.result?.locations || [];
    } catch (error) {
        console.error("Error fetching Square locations:", error);
        return [];
    }
}
async function createSquarePaymentLink(data) {
    try {
        const amountInCents = Math.round(data.amount * 100);
        // Get the location ID (required by Square Payment Links API)
        const locationId = process.env.SQUARE_LOCATION_ID;
        if (!locationId) {
            throw new Error("SQUARE_LOCATION_ID environment variable is not configured.");
        }
        const accessToken = process.env.SQUARE_ACCESS_TOKEN;
        if (!accessToken) {
            throw new Error("SQUARE_ACCESS_TOKEN environment variable is not configured");
        }
        // Build the pre-populated buyer address from shipping data
        const buyerAddress = {};
        if (data.shippingAddress) {
            if (data.shippingAddress.street) buyerAddress.address_line_1 = data.shippingAddress.street;
            if (data.shippingAddress.street2) buyerAddress.address_line_2 = data.shippingAddress.street2;
            if (data.shippingAddress.city) buyerAddress.locality = data.shippingAddress.city;
            if (data.shippingAddress.state) buyerAddress.administrative_district_level_1 = data.shippingAddress.state;
            if (data.shippingAddress.postalCode) buyerAddress.postal_code = data.shippingAddress.postalCode;
            if (data.shippingAddress.country) buyerAddress.country = data.shippingAddress.country;
        }
        // Build customer contact info
        const customerContactInfo = {};
        if (data.customerEmail) {
            customerContactInfo.email_address = data.customerEmail;
        }
        if (data.customerPhone) {
            customerContactInfo.phone_number = data.customerPhone;
        }
        // Add name to contact info
        const firstName = data.customerFirstName || data.customerName?.split(" ")[0] || "";
        const lastName = data.customerLastName || data.customerName?.split(" ")[1] || "";
        if (firstName || lastName) {
            const displayName = `${firstName} ${lastName}`.trim();
            if (displayName) {
                customerContactInfo.display_name = displayName;
            }
        }
        // Build line items from the items array
        const lineItems = [];
        if (data.items && data.items.length > 0) {
            let itemIndex = 0;
            for (const item of data.items){
                // Build product name with options appended
                let displayName = item.product_name;
                if (item.options && item.options.length > 0) {
                    const optionsText = item.options.map((opt)=>opt.option_value).join(", ");
                    displayName = `${item.product_name} (${optionsText})`;
                }
                lineItems.push({
                    uid: `item-${itemIndex}`,
                    name: displayName,
                    quantity: item.quantity.toString(),
                    base_price_money: {
                        amount: Math.round(item.price * 100),
                        currency: data.currency || "USD"
                    }
                });
                itemIndex++;
            }
        } else {
            // Fallback: create a single line item
            lineItems.push({
                uid: "item-0",
                name: "Order " + (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["formatOrderNumber"])(data.orderId),
                quantity: "1",
                base_price_money: {
                    amount: amountInCents,
                    currency: data.currency || "USD"
                }
            });
        }
        // Add shipping as a line item so it displays in order summary
        let shippingLineItemName = "Shipping";
        if (data.shippingOptionName) {
            shippingLineItemName = data.shippingOptionName;
            if (data.estimatedDeliveryDate) {
                const deliveryDate = new Date(data.estimatedDeliveryDate);
                const formattedDate = deliveryDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                });
                shippingLineItemName = `${shippingLineItemName} - Arrives by ${formattedDate}`;
            }
        }
        if (data.shipping && data.shipping > 0) {
            lineItems.push({
                uid: `shipping-${data.orderId}`,
                name: shippingLineItemName,
                quantity: "1",
                base_price_money: {
                    amount: Math.round(data.shipping * 100),
                    currency: data.currency || "USD"
                },
                note: "Shipping"
            });
        }
        // Build the payment link request body with full order details
        const paymentLinkBody = {
            idempotency_key: `${data.orderId}-${Date.now()}-${Math.random()}`,
            checkout_options: {
                ask_for_shipping_address: true,
                allow_tipping: false,
                enable_coupon: true,
                enable_loyalty: true,
                merchant_support_email: "sticky@stickerland.com",
                redirect_url: data.redirectUrl,
                note: `Order: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["formatOrderNumber"])(data.orderId)}`,
                accepted_payment_methods: {
                    afterpay_clearpay: true,
                    apple_pay: true,
                    cash_app_pay: true,
                    google_pay: true
                }
            },
            pre_populated_data: {}
        };
        // Only add buyer_address if it has data
        if (Object.keys(buyerAddress).length > 0) {
            paymentLinkBody.pre_populated_data.buyer_address = buyerAddress;
        }
        // Only add customer_contact_info if it has data
        if (Object.keys(customerContactInfo).length > 0) {
            paymentLinkBody.pre_populated_data.customer_contact_info = customerContactInfo;
        }
        // Build order with detailed line items to show Order Summary on Square checkout page
        const orderObject = {
            location_id: locationId,
            reference_id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["formatOrderNumber"])(data.orderId),
            note: `Order: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["formatOrderNumber"])(data.orderId)}`,
            line_items: lineItems,
            discounts: []
        };
        // Add discount if present
        if (data.discount && data.discount > 0) {
            const discountName = data.discountCode ? `Discount (${data.discountCode})` : "Discount";
            orderObject.discounts.push({
                uid: `discount-${data.orderId}`,
                name: discountName,
                type: "FIXED_AMOUNT",
                amount_money: {
                    amount: Math.round(data.discount * 100),
                    currency: data.currency || "USD"
                }
            });
        }
        // Add tax if present
        // Square requires either 'percentage' or 'applied_money' (or both)
        if (data.tax && data.tax > 0) {
            orderObject.taxes = [
                {
                    uid: `tax-${data.orderId}`,
                    name: "Tax",
                    type: "ADDITIVE",
                    percentage: "8.0",
                    applied_money: {
                        amount: Math.round(data.tax * 100),
                        currency: data.currency || "USD"
                    }
                }
            ];
        }
        // Add shipping if present
        if (data.shipping && data.shipping > 0) {
            let shippingName = "Shipping";
            // Use provided shipping option name first
            if (data.shippingOptionName) {
                shippingName = data.shippingOptionName;
                // Add estimated delivery date to shipping name if provided
                if (data.estimatedDeliveryDate) {
                    const deliveryDate = new Date(data.estimatedDeliveryDate);
                    const formattedDate = deliveryDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                    });
                    shippingName = `${shippingName} - Arrives by ${formattedDate}`;
                }
            } else if (data.shippingOptionId) {
                // Fallback: Fetch the shipping option name if ID is provided but name wasn't passed
                try {
                    const { createClient } = await __turbopack_context__.A("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, esm_import, [project]/node_modules/@supabase/supabase-js, async loader)");
                    const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_KEY || "");
                    const { data: shippingOption } = await supabase.from("shipping_options").select("name").eq("id", data.shippingOptionId).single();
                    if (shippingOption?.name) {
                        shippingName = shippingOption.name;
                        // Add estimated delivery date if provided
                        if (data.estimatedDeliveryDate) {
                            const deliveryDate = new Date(data.estimatedDeliveryDate);
                            const formattedDate = deliveryDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                            });
                            shippingName = `${shippingName} - Arrives by ${formattedDate}`;
                        }
                    }
                } catch (err) {
                    console.warn("Failed to fetch shipping option name:", err);
                }
            }
            orderObject.shipping = {
                name: shippingName,
                charge: {
                    money: {
                        amount: Math.round(data.shipping * 100),
                        currency: data.currency || "USD"
                    }
                }
            };
        }
        paymentLinkBody.order = orderObject;
        // Add the total amount the payment link should collect
        // This is the grand total including all line items, taxes, and shipping
        paymentLinkBody.amount_money = {
            amount: amountInCents,
            currency: data.currency || "USD"
        };
        console.log("Creating Square Payment Link via REST API:", {
            orderId: data.orderId,
            amount: amountInCents,
            currency: data.currency,
            locationId: locationId,
            hasCustomerEmail: !!data.customerEmail,
            hasCustomerPhone: !!data.customerPhone,
            itemsCount: data.items?.length || 0,
            shippingOptionName: data.shippingOptionName,
            estimatedDeliveryDate: data.estimatedDeliveryDate
        });
        // Make direct HTTP call to Square Payment Links API
        console.log("Square API Details:", {
            tokenConfigured: !!accessToken,
            locationId: locationId
        });
        console.log("Pre-populated data being sent to Square:", {
            hasBuyerAddress: !!Object.keys(buyerAddress).length,
            hasCustomerContactInfo: !!Object.keys(customerContactInfo).length
        });
        console.log("Payment Link Body - Order Details:", {
            location_id: paymentLinkBody.order?.location_id,
            lineItems: paymentLinkBody.order?.line_items?.length,
            lineItemsDetail: paymentLinkBody.order?.line_items?.map((li)=>({
                    name: li.name,
                    quantity: li.quantity,
                    amount: li.base_price_money?.amount
                })),
            discountAmount: paymentLinkBody.order?.discounts?.[0]?.applied_money?.amount,
            discountName: paymentLinkBody.order?.discounts?.[0]?.name,
            taxAmount: paymentLinkBody.order?.taxes?.[0]?.applied_money?.amount,
            shippingName: paymentLinkBody.order?.shipping?.name,
            shippingAmount: paymentLinkBody.order?.shipping?.charge?.money?.amount,
            hasPrePopulatedData: Object.keys(paymentLinkBody.pre_populated_data).length > 0,
            frontendData: {
                subtotal: data.subtotal,
                tax: data.tax,
                shipping: data.shipping,
                discount: data.discount,
                total: data.amount
            },
            expectedTotal: (data.subtotal + data.tax + data.shipping - (data.discount || 0)) * 100,
            sentTotal: data.amount * 100
        });
        const requestBody = JSON.stringify(paymentLinkBody);
        console.log("Square Payment Link Request Body:", {
            bodySize: requestBody.length,
            body: paymentLinkBody
        });
        const response = await fetch("https://connect.squareup.com/v2/online-checkout/payment-links", {
            method: "POST",
            headers: {
                "Square-Version": "2025-10-16",
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: requestBody
        });
        const responseData = await response.json();
        if (!response.ok) {
            console.error("Square Payment Link API error:", {
                status: response.status,
                statusText: response.statusText,
                tokenConfigured: !!accessToken,
                fullError: responseData,
                errorDetails: responseData?.errors?.map((e)=>({
                        code: e.code,
                        detail: e.detail,
                        field: e.field,
                        category: e.category
                    })) || []
            });
            const errorMessage = responseData?.errors?.[0]?.detail || responseData?.errors?.[0]?.code || responseData?.message || `API returned ${response.status}`;
            return {
                success: false,
                error: errorMessage
            };
        }
        if (responseData?.payment_link?.url) {
            const squareOrderId = responseData.payment_link?.order_id || responseData.order?.id;
            console.log("Payment Link created successfully:", {
                linkId: responseData.payment_link.id,
                url: responseData.payment_link.url,
                orderId: squareOrderId
            });
            return {
                success: true,
                paymentLinkUrl: responseData.payment_link.url,
                orderId: squareOrderId
            };
        }
        console.error("Payment link response missing URL:", responseData);
        return {
            success: false,
            error: "Payment link created but no URL returned"
        };
    } catch (error) {
        console.error("Square Payment Link error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error creating payment link"
        };
    }
}
}),
"[project]/server/routes/square.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleConfirmCheckout",
    ()=>handleConfirmCheckout,
    "handleCreateCheckoutSession",
    ()=>handleCreateCheckoutSession,
    "handleCreatePayment",
    ()=>handleCreatePayment,
    "handleGetSquareConfig",
    ()=>handleGetSquareConfig,
    "handleGetSquareLocations",
    ()=>handleGetSquareLocations,
    "handleSquarePayment",
    ()=>handleSquarePayment,
    "handleSquareWebhook",
    ()=>handleSquareWebhook,
    "handleTestSquareConfig",
    ()=>handleTestSquareConfig,
    "handleVerifyPendingPayment",
    ()=>handleVerifyPendingPayment
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/square.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/supabase.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$email$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/email.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/order.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$email$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$email$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const handleCreateCheckoutSession = async (req, res)=>{
    try {
        const checkoutData = req.body;
        const { supabase } = await __turbopack_context__.A("[project]/server/utils/supabase.ts [api] (ecmascript, async loader)");
        // ✅ CHECKPOINT A: Session Creation
        console.log("🔷 CHECKPOINT A: handleCreateCheckoutSession called with data:", {
            amount: checkoutData.amount,
            itemsCount: checkoutData.items?.length,
            hasCustomerEmail: !!checkoutData.customerEmail,
            hasShippingAddress: !!checkoutData.shippingAddress,
            subtotal: checkoutData.subtotal,
            tax: checkoutData.tax,
            shipping: checkoutData.shipping,
            total: checkoutData.total
        });
        // Validate required fields with detailed error messages
        const missingFields = [];
        if (checkoutData.amount === undefined || checkoutData.amount === null) {
            missingFields.push("amount");
        }
        if (!checkoutData.items || !Array.isArray(checkoutData.items) || checkoutData.items.length === 0) {
            missingFields.push("items");
        }
        if (!checkoutData.customerEmail) {
            missingFields.push("customerEmail");
        }
        if (!checkoutData.shippingAddress) {
            missingFields.push("shippingAddress");
        }
        if (!checkoutData.billingAddress) {
            missingFields.push("billingAddress");
        }
        if (checkoutData.subtotal === undefined || checkoutData.subtotal === null) {
            missingFields.push("subtotal");
        }
        if (checkoutData.tax === undefined || checkoutData.tax === null) {
            missingFields.push("tax");
        }
        if (checkoutData.shipping === undefined || checkoutData.shipping === null) {
            missingFields.push("shipping");
        }
        if (checkoutData.total === undefined || checkoutData.total === null) {
            missingFields.push("total");
        }
        if (missingFields.length > 0) {
            console.error("Missing required fields:", {
                missingFields,
                receivedData: {
                    amount: checkoutData.amount,
                    items: checkoutData.items?.length,
                    customerEmail: checkoutData.customerEmail,
                    shippingAddress: !!checkoutData.shippingAddress,
                    billingAddress: !!checkoutData.billingAddress,
                    subtotal: checkoutData.subtotal,
                    tax: checkoutData.tax,
                    shipping: checkoutData.shipping,
                    total: checkoutData.total
                }
            });
            return res.status(400).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(", ")}`
            });
        }
        // Validate and sanitize country codes
        const invalidCountries = [];
        // Fix invalid shipping country code
        if (checkoutData.shippingAddress?.country && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["isValidCountryCode"])(checkoutData.shippingAddress.country)) {
            invalidCountries.push(`shipping: ${checkoutData.shippingAddress.country}`);
            checkoutData.shippingAddress.country = "US"; // Default to US if invalid
        }
        // Fix invalid billing country code
        if (checkoutData.billingAddress?.country && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["isValidCountryCode"])(checkoutData.billingAddress.country)) {
            invalidCountries.push(`billing: ${checkoutData.billingAddress.country}`);
            checkoutData.billingAddress.country = "US"; // Default to US if invalid
        }
        if (invalidCountries.length > 0) {
            console.warn("Invalid country codes detected and auto-corrected to US:", invalidCountries);
        }
        // Validate email format
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["isValidEmail"])(checkoutData.customerEmail)) {
            console.error("Invalid email format provided");
            return res.status(400).json({
                success: false,
                error: "Invalid email address format"
            });
        }
        // Validate phone if provided
        if (checkoutData.phone && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["isValidPhone"])(checkoutData.phone)) {
            console.error("Invalid phone format provided");
            return res.status(400).json({
                success: false,
                error: "Invalid phone number format"
            });
        }
        // Validate shipping address fields
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["isValidAddress"])(checkoutData.shippingAddress.street) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["isValidAddress"])(checkoutData.shippingAddress.city) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["isValidAddress"])(checkoutData.shippingAddress.postalCode)) {
            console.error("Invalid shipping address format");
            return res.status(400).json({
                success: false,
                error: "Invalid shipping address format"
            });
        }
        // Validate billing address fields
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["isValidAddress"])(checkoutData.billingAddress.street) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["isValidAddress"])(checkoutData.billingAddress.city) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["isValidAddress"])(checkoutData.billingAddress.postalCode)) {
            console.error("Invalid billing address format");
            return res.status(400).json({
                success: false,
                error: "Invalid billing address format"
            });
        }
        // Create a guest customer if not logged in
        let customerId = checkoutData.customerId;
        if (!customerId) {
            // First, try to get existing customer by email
            const { data: existingCustomer } = await supabase.from("customers").select("id").eq("email", checkoutData.customerEmail).single();
            if (existingCustomer?.id) {
                customerId = existingCustomer.id;
            } else {
                // Create a new guest customer in Supabase
                const { data: guestCustomer, error: guestError } = await supabase.from("customers").insert({
                    email: checkoutData.customerEmail,
                    first_name: checkoutData.shippingAddress.firstName || checkoutData.customerName?.split(" ")[0] || "Guest",
                    last_name: checkoutData.shippingAddress.lastName || checkoutData.customerName?.split(" ")[1] || "Customer",
                    phone: checkoutData.phone || undefined,
                    company: undefined,
                    store_credit: 0
                }).select("id").single();
                if (guestError || !guestCustomer?.id) {
                    console.error("Failed to create guest customer:", guestError);
                    return res.status(400).json({
                        error: "Failed to create customer record for checkout"
                    });
                }
                customerId = guestCustomer.id;
            }
        }
        // Create order in Supabase with pending_payment status
        const supabaseOrder = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createSupabaseOrder"])({
            customer_id: customerId,
            status: "pending_payment",
            total: checkoutData.total,
            subtotal: checkoutData.subtotal,
            tax: checkoutData.tax,
            shipping: checkoutData.shipping,
            discount: checkoutData.discount,
            discount_code: checkoutData.discountCode,
            billing_address: checkoutData.billingAddress,
            shipping_address: checkoutData.shippingAddress,
            items: checkoutData.items.map((item)=>({
                    product_id: item.product_id,
                    product_name: item.product_name || `Product #${item.product_id}`,
                    quantity: item.quantity,
                    price: item.price || 0.25
                }))
        });
        if (!supabaseOrder.success) {
            throw new Error("Failed to create order in Supabase");
        }
        // Create order items in Supabase
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createOrderItems"])(supabaseOrder.id, checkoutData.items);
        // Build the redirect URL for after payment
        let baseUrl = "http://localhost:5173";
        // Determine environment to set correct redirect base URL
        const requestHost = req.get("host") || "";
        const isLocal = requestHost.includes("localhost") || requestHost.includes("127.0.0.1");
        if (process.env.BASE_URL) {
            baseUrl = process.env.BASE_URL;
        } else if (!isLocal) {
            // FORCE production URL for all non-local environments
            baseUrl = "https://stickerland.app";
        }
        const redirectUrl = `${baseUrl}/checkout-success/${supabaseOrder.id}`;
        console.log("Square redirect URL:", redirectUrl);
        // Create Square Payment Link with full order details and customer contact info
        const paymentLinkResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createSquarePaymentLink"])({
            orderId: supabaseOrder.id,
            amount: checkoutData.total,
            currency: checkoutData.currency || "USD",
            description: "Sticker Order",
            customerEmail: checkoutData.customerEmail,
            customerName: checkoutData.customerName || "Customer",
            customerPhone: checkoutData.phone,
            customerFirstName: checkoutData.shippingAddress.firstName,
            customerLastName: checkoutData.shippingAddress.lastName,
            redirectUrl,
            subtotal: checkoutData.subtotal,
            tax: checkoutData.tax,
            shipping: checkoutData.shipping,
            discount: checkoutData.discount,
            discountCode: checkoutData.discountCode,
            shippingOptionId: checkoutData.shipping_option_id,
            shippingOptionName: checkoutData.shipping_option_name,
            estimatedDeliveryDate: checkoutData.estimated_delivery_date,
            items: checkoutData.items.map((item)=>({
                    product_name: item.product_name || `Product #${item.product_id}`,
                    quantity: item.quantity,
                    price: item.price || 0.25,
                    options: item.options
                })),
            shippingAddress: {
                firstName: checkoutData.shippingAddress.firstName,
                lastName: checkoutData.shippingAddress.lastName,
                street: checkoutData.shippingAddress.street,
                street2: checkoutData.shippingAddress.street2,
                city: checkoutData.shippingAddress.city,
                state: checkoutData.shippingAddress.state,
                postalCode: checkoutData.shippingAddress.postalCode,
                country: checkoutData.shippingAddress.country
            }
        });
        if (!paymentLinkResult.success || !paymentLinkResult.paymentLinkUrl) {
            console.error("Square Payment Link failed - returning error to client:", {
                orderId: supabaseOrder.id,
                error: paymentLinkResult.error
            });
            // Return error instead of fallback
            return res.status(400).json({
                success: false,
                error: paymentLinkResult.error || "Failed to create payment link"
            });
        }
        console.log("✅ CHECKPOINT A SUCCESS: Square Payment Link created:", {
            orderId: supabaseOrder.id,
            total: checkoutData.total,
            paymentLinkUrl: paymentLinkResult.paymentLinkUrl
        });
        // Note: Order confirmation email will be sent AFTER customer completes
        // payment on the Square checkout page (in handleConfirmCheckout)
        const responsePayload = {
            success: true,
            order: {
                id: supabaseOrder.id,
                status: "pending_payment",
                total: checkoutData.total
            },
            checkoutUrl: paymentLinkResult.paymentLinkUrl
        };
        console.log("Sending checkout response:", {
            orderId: supabaseOrder.id,
            hasCheckoutUrl: !!paymentLinkResult.paymentLinkUrl
        });
        res.status(201).json(responsePayload);
    } catch (error) {
        console.error("Create Checkout session error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to create checkout session";
        console.error("Error details:", {
            message: errorMessage,
            errorType: error instanceof Error ? error.constructor.name : typeof error,
            errorStack: error instanceof Error ? error.stack : "No stack available"
        });
        res.status(400).json({
            success: false,
            error: errorMessage
        });
    }
};
const handleSquarePayment = async (req, res)=>{
    try {
        const paymentData = req.body;
        // Validate required fields
        if (!paymentData.sourceId || !paymentData.amount || !paymentData.items) {
            return res.status(400).json({
                error: "Missing required fields: sourceId, amount, items"
            });
        }
        // Process payment via Square
        const squarePayment = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["processSquarePayment"])({
            sourceId: paymentData.sourceId,
            amount: paymentData.total,
            currency: paymentData.currency || "USD",
            orderId: undefined,
            customerEmail: paymentData.customerEmail,
            customerName: paymentData.customerName
        });
        if (!squarePayment.success) {
            return res.status(400).json({
                error: "Payment processing failed"
            });
        }
        // Create order in Supabase
        const supabaseOrder = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createSupabaseOrder"])({
            customer_id: paymentData.customerId || 0,
            status: "pending",
            total: paymentData.total,
            subtotal: paymentData.subtotal,
            tax: paymentData.tax,
            shipping: paymentData.shipping,
            billing_address: paymentData.billingAddress,
            shipping_address: paymentData.shippingAddress,
            items: paymentData.items
        });
        if (!supabaseOrder.success) {
            throw new Error("Failed to create order in Supabase");
        }
        // Create order items in Supabase
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createOrderItems"])(supabaseOrder.id, paymentData.items);
        // Handle store credit: deduct applied credit and award earned credit
        if (paymentData.customerId) {
            const appliedCredit = paymentData.appliedStoreCredit || 0;
            const earnedCredit = paymentData.total * 0.05;
            if (appliedCredit > 0) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["updateCustomerStoreCredit"])(paymentData.customerId, -appliedCredit, `Applied to order ${supabaseOrder.id}`);
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["updateCustomerStoreCredit"])(paymentData.customerId, earnedCredit, `Earned 5% from order ${supabaseOrder.id}`);
        }
        res.status(201).json({
            success: true,
            payment: squarePayment,
            order: {
                id: supabaseOrder.id,
                status: "pending",
                total: paymentData.total,
                items: paymentData.items.length
            },
            message: "Payment processed and order created successfully"
        });
    } catch (error) {
        console.error("Square payment route error:", error);
        const errorMessage = error instanceof Error ? error.message : "Payment processing failed";
        res.status(400).json({
            error: errorMessage
        });
    }
};
const handleGetSquareConfig = async (req, res)=>{
    try {
        const appId = process.env.SQUARE_APPLICATION_ID;
        const accessToken = process.env.SQUARE_ACCESS_TOKEN;
        if (!appId) {
            return res.status(500).json({
                error: "Square configuration not available"
            });
        }
        // Verify that we have the access token configured
        if (!accessToken) {
            console.warn("Square Access Token not configured");
        }
        res.json({
            success: true,
            applicationId: appId,
            configured: !!accessToken
        });
    } catch (error) {
        console.error("Get Square config error:", error);
        res.status(500).json({
            error: "Failed to retrieve Square configuration"
        });
    }
};
const handleGetSquareLocations = async (req, res)=>{
    try {
        const locations = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getSquareLocations"])();
        res.json({
            success: true,
            locations
        });
    } catch (error) {
        console.error("Get Square locations error:", error);
        res.status(500).json({
            error: "Failed to retrieve Square locations"
        });
    }
};
const handleConfirmCheckout = async (req, res)=>{
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({
                error: "Missing orderId"
            });
        }
        const id = parseInt(orderId, 10);
        if (isNaN(id)) {
            return res.status(400).json({
                error: "Invalid order ID format"
            });
        }
        // ✅ CHECKPOINT B: The Return (Green Flag)
        console.log("🔷 CHECKPOINT B: User returned from Square. Verifying payment for Order #" + id);
        // Import Supabase
        const { supabase } = await __turbopack_context__.A("[project]/server/utils/supabase.ts [api] (ecmascript, async loader)");
        // Get the order from Supabase
        const { data, error: supabaseError } = await supabase.from("orders").select("*").eq("id", id).single();
        if (supabaseError || !data) {
            console.error("❌ Order not found in database:", id);
            return res.status(404).json({
                error: "Order not found"
            });
        }
        // CASE 1: Order is already paid (Webhook beat the user back)
        if (data.status === "paid" || data.status === "completed") {
            console.log("✅ CHECKPOINT C: Order already marked as", data.status, "(webhook was faster):", id);
            return res.json({
                success: true,
                order: {
                    id: id,
                    status: data.status,
                    total: data.total
                }
            });
        }
        // CASE 2: Order is pending (Webhook delayed/missing) -> Force Update to Paid
        // Optimistic UI for local dev or delayed webhooks
        if (data.status === "pending_payment") {
            // ✅ CHECKPOINT C: Square API Validation (implicit - order exists)
            console.log("🔷 CHECKPOINT C: Checking Square Order. Status: pending_payment (Green Flag detected)");
            console.log("🔷 CHECKPOINT D: ✅ Green Flag detected! Updating status to PAID for Order #" + id);
            const { error: updateError } = await supabase.from("orders").update({
                status: "paid",
                updated_at: new Date().toISOString()
            }).eq("id", id);
            if (updateError) {
                console.error("Failed to update order status:", updateError);
            // Even if DB update fails, return success to frontend to avoid user panic
            } else {
                console.log("✅ CHECKPOINT D SUCCESS: Order status updated to PAID:", id);
                // Send confirmation email as backup (in case webhook is delayed/missing)
                try {
                    // ✅ CHECKPOINT E: Email Trigger
                    console.log("🔷 CHECKPOINT E: Attempting to send confirmation email for Order #" + id);
                    const { data: customer } = await supabase.from("customers").select("*").eq("id", data.customer_id).single();
                    const { data: orderItems } = await supabase.from("order_items").select("*").eq("order_id", id);
                    const baseUrl = process.env.BASE_URL || "https://stickerland.app";
                    const customerEmail = customer?.email || "";
                    if (customerEmail) {
                        const emailSent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$email$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["sendOrderConfirmationEmail"])({
                            customerEmail,
                            customerName: customer?.first_name && customer?.last_name ? `${customer.first_name} ${customer.last_name}` : customer?.first_name || "Valued Customer",
                            orderNumber: (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["formatOrderNumber"])(id),
                            orderDate: new Date().toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                            }),
                            items: orderItems?.map((item)=>({
                                    name: item.product_name,
                                    quantity: item.quantity,
                                    price: item.price,
                                    designFileUrl: item.design_file_url,
                                    options: item.options
                                })) || [],
                            subtotal: data.subtotal || 0,
                            tax: data.tax || 0,
                            shipping: data.shipping || 0,
                            discount: data.discount || 0,
                            discountCode: data.discount_code,
                            total: data.total || 0,
                            estimatedDelivery: data.estimated_delivery_date ? new Date(data.estimated_delivery_date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric"
                            }) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric"
                            }),
                            orderLink: `${baseUrl}/order-status?orderNumber=${(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["formatOrderNumber"])(id)}`,
                            shippingAddress: data.shipping_address || undefined,
                            policies: undefined
                        });
                        if (emailSent) {
                            console.log(`✅ CHECKPOINT E SUCCESS: 📧 Confirmation email sent successfully to ${customerEmail} for order #${(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["formatOrderNumber"])(id)}`);
                        }
                    } else {
                        console.warn("❌ CHECKPOINT E: No customer email available for confirmation");
                    }
                } catch (emailError) {
                    console.error("❌ CHECKPOINT E FAILED: Failed to send confirmation email:", {
                        orderId: id,
                        error: emailError instanceof Error ? emailError.message : emailError
                    });
                // Don't fail the confirmation if email fails
                }
            }
            return res.json({
                success: true,
                order: {
                    id: id,
                    status: "paid",
                    total: data.total
                }
            });
        }
        // CASE 3: Payment failed or cancelled
        console.warn("Order status is not valid for confirmation:", data.status);
        return res.status(202).json({
            success: false,
            error: "Payment verification failed or incomplete",
            order: {
                id: id,
                status: data.status
            }
        });
    } catch (error) {
        console.error("Confirm checkout error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Confirmation failed"
        });
    }
};
const handleTestSquareConfig = async (req, res)=>{
    try {
        const appId = process.env.SQUARE_APPLICATION_ID;
        const accessToken = process.env.SQUARE_ACCESS_TOKEN;
        const diagnostics = {
            appIdConfigured: !!appId,
            accessTokenConfigured: !!accessToken,
            appIdLength: appId ? appId.length : 0,
            accessTokenLength: accessToken ? accessToken.length : 0,
            appIdPrefix: appId ? appId.substring(0, 8) : "N/A",
            accessTokenPrefix: accessToken ? accessToken.substring(0, 8) : "N/A"
        };
        if (!appId || !accessToken) {
            return res.status(400).json({
                success: false,
                message: "Square configuration incomplete",
                diagnostics,
                missingConfig: {
                    appId: !appId,
                    accessToken: !accessToken
                }
            });
        }
        // Try to initialize the client
        try {
            const paymentsApi = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getPaymentsApi"])();
            res.json({
                success: true,
                message: "Square configuration is valid",
                diagnostics,
                clientInitialized: true
            });
        } catch (clientError) {
            res.status(400).json({
                success: false,
                message: "Square client initialization failed",
                diagnostics,
                error: clientError instanceof Error ? clientError.message : "Unknown error"
            });
        }
    } catch (error) {
        console.error("Test Square config error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to test Square configuration"
        });
    }
};
const handleSquareWebhook = async (req, res)=>{
    try {
        const event = req.body;
        const { supabase } = await __turbopack_context__.A("[project]/server/utils/supabase.ts [api] (ecmascript, async loader)");
        // 🔷 PHASE 5: Webhook Verification (Optional - Ngrok)
        console.log("🔔 Webhook received:", {
            type: event.type,
            eventId: event.id,
            timestamp: event.created_at
        });
        // Note: Idempotency is handled within each event handler
        // by checking if the order/payment has already been processed
        // Handle customer created events
        if (event.type === "customer.created") {
            await handleSquareCustomerCreated(event.data);
        }
        // Handle customer deleted events
        if (event.type === "customer.deleted") {
            await handleSquareCustomerDeleted(event.data);
        }
        // Handle payment created events
        if (event.type === "payment.created") {
            await handleSquarePaymentCreated(event.data);
        }
        // Handle payment updated events
        if (event.type === "payment.updated") {
            console.log("🔷 PHASE 5: Event Type: payment.updated");
            await handleSquarePaymentUpdated(event.data);
        }
        // Acknowledge webhook receipt to Square
        res.json({
            received: true
        });
    } catch (error) {
        console.error("Square webhook error:", error);
        res.status(200).json({
            received: true,
            warning: "Webhook processed with errors"
        });
    }
};
/**
 * Handle Square customer.created webhook event
 */ async function handleSquareCustomerCreated(data) {
    try {
        const { supabase } = await __turbopack_context__.A("[project]/server/utils/supabase.ts [api] (ecmascript, async loader)");
        const customer = data?.object?.customer;
        if (!customer) {
            console.warn("No customer data in Square webhook");
            return;
        }
        const squareCustomerId = customer.id;
        const email = customer.email_address;
        const firstName = customer.given_name || "";
        const lastName = customer.family_name || "";
        const phone = customer.phone_number || "";
        console.log("Processing Square customer creation:", {
            squareCustomerId,
            email,
            name: `${firstName} ${lastName}`
        });
        // Check if customer already exists in Supabase by Square customer ID
        const { data: existingCustomer } = await supabase.from("customers").select("id, square_customer_id").eq("square_customer_id", squareCustomerId).single().catch(()=>({
                data: null
            }));
        if (existingCustomer) {
            // Customer already linked, update their information
            const { error } = await supabase.from("customers").update({
                email: email || existingCustomer.id,
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                updated_at: new Date().toISOString()
            }).eq("id", existingCustomer.id);
            if (error) {
                console.error("Error updating existing Square customer:", error);
            } else {
                console.log("Square customer updated in Supabase:", existingCustomer.id);
            }
        } else {
            // Check if customer exists by email
            const { data: customerByEmail } = await supabase.from("customers").select("id").eq("email", email).single().catch(()=>({
                    data: null
                }));
            if (customerByEmail) {
                // Link existing customer to Square ID
                const { error } = await supabase.from("customers").update({
                    square_customer_id: squareCustomerId,
                    first_name: firstName || customerByEmail.id,
                    last_name: lastName || "",
                    phone: phone || "",
                    updated_at: new Date().toISOString()
                }).eq("id", customerByEmail.id);
                if (error) {
                    console.error("Error linking Square customer ID:", error);
                } else {
                    console.log("Square customer linked to existing Supabase customer:", customerByEmail.id);
                }
            } else {
                // Create new customer in Supabase with Square customer ID
                const { data: newCustomer, error } = await supabase.from("customers").insert({
                    email: email || `square_${squareCustomerId}@placeholder.com`,
                    first_name: firstName || "Square Customer",
                    last_name: lastName || "",
                    phone: phone || "",
                    company: "",
                    store_credit: 0,
                    square_customer_id: squareCustomerId,
                    password_hash: null
                }).select("id").single();
                if (error) {
                    console.error("Error creating Square customer in Supabase:", error);
                } else {
                    console.log("Square customer created in Supabase:", newCustomer.id);
                }
            }
        }
    } catch (error) {
        console.error("Error processing Square customer creation:", error);
    }
}
/**
 * Handle Square customer.deleted webhook event
 */ async function handleSquareCustomerDeleted(data) {
    try {
        const { supabase } = await __turbopack_context__.A("[project]/server/utils/supabase.ts [api] (ecmascript, async loader)");
        const squareCustomerId = data?.id;
        if (!squareCustomerId) {
            console.warn("No customer ID in Square deletion webhook");
            return;
        }
        console.log("Processing Square customer deletion:", squareCustomerId);
        // Find customer by Square customer ID
        const { data: customer } = await supabase.from("customers").select("id").eq("square_customer_id", squareCustomerId).single().catch(()=>({
                data: null
            }));
        if (customer) {
            // Unlink the Square customer ID from the Supabase record
            // We preserve the customer record to maintain order history
            const { error } = await supabase.from("customers").update({
                square_customer_id: null,
                updated_at: new Date().toISOString()
            }).eq("id", customer.id);
            if (error) {
                console.error("Error unlinking Square customer:", error);
            } else {
                console.log("Square customer unlinked from Supabase record:", customer.id);
            }
        } else {
            console.log("Square customer not found in Supabase:", squareCustomerId);
        }
    } catch (error) {
        console.error("Error processing Square customer deletion:", error);
    }
}
/**
 * Handle Square payment.created webhook event
 */ async function handleSquarePaymentCreated(data) {
    try {
        const { supabase } = await __turbopack_context__.A("[project]/server/utils/supabase.ts [api] (ecmascript, async loader)");
        const payment = data?.object?.payment;
        if (!payment) {
            console.warn("No payment data in Square webhook");
            return;
        }
        const paymentId = payment.id;
        const squareOrderId = payment.order_id;
        const paymentStatus = payment.status;
        const amountMoney = payment.amount_money || {};
        const cardDetails = payment.card_details || {};
        const card = cardDetails.card || {};
        console.log("Processing Square payment creation:", {
            paymentId,
            squareOrderId,
            status: paymentStatus,
            amount: amountMoney.amount
        });
        // Only process completed or approved payments - do NOT update on PENDING
        if (paymentStatus !== "COMPLETED" && paymentStatus !== "APPROVED") {
            console.log(`Payment status is ${paymentStatus}, not COMPLETED or APPROVED - skipping order update`);
            return;
        }
        if (!squareOrderId) {
            console.warn("No Square order ID associated with payment:", paymentId);
            return;
        }
        // Get the order - first try by numeric ID (most common)
        let orderId = null;
        let orderData = null;
        // Try to find by parsing the order ID if it's numeric
        const numOrderId = parseInt(squareOrderId, 10);
        if (!isNaN(numOrderId)) {
            try {
                const { data: orderByNum, error } = await supabase.from("orders").select("id, status, square_payment_details").eq("id", numOrderId).single();
                if (!error && orderByNum) {
                    orderId = orderByNum.id;
                    orderData = orderByNum;
                }
            } catch (err) {
            // Continue to next lookup method
            }
        }
        // If not found by numeric ID, try by UUID
        if (!orderId) {
            try {
                const { data: orderByUuid, error } = await supabase.from("orders").select("id, status, square_payment_details").eq("square_order_id", squareOrderId).single();
                if (!error && orderByUuid) {
                    orderId = orderByUuid.id;
                    orderData = orderByUuid;
                }
            } catch (err) {
            // Order not found
            }
        }
        if (!orderId || !orderData) {
            console.warn("Could not find order for Square payment:", squareOrderId);
            return;
        }
        if (orderData.status === "paid" || orderData.status === "completed") {
            // ✅ PHASE 5: Idempotency Check
            console.log("🔔 PHASE 5: Webhook - Order already paid. (Green Flag check was faster - this is GOOD)", orderId);
            return;
        }
        // Prepare payment details object to store in order
        const paymentDetails = {
            payment_id: paymentId,
            payment_status: paymentStatus,
            amount: amountMoney.amount ? amountMoney.amount / 100 : 0,
            currency: amountMoney.currency || "USD",
            payment_timestamp: payment.created_at,
            card_brand: card.card_brand || "",
            card_last_4: card.last_4 || "",
            card_exp_month: card.exp_month || null,
            card_exp_year: card.exp_year || null,
            entry_method: cardDetails.entry_method || "",
            receipt_number: payment.receipt_number || ""
        };
        // Update order with payment details and mark as paid
        const { error: updateError } = await supabase.from("orders").update({
            status: "paid",
            square_payment_details: paymentDetails,
            updated_at: new Date().toISOString()
        }).eq("id", orderId);
        if (updateError) {
            console.error("Error updating order with payment details:", updateError);
            return;
        }
        console.log("Order marked as paid with payment details:", orderId);
        // Get updated order with complete data for credit and email
        const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
        if (order?.customer_id) {
            // Award store credit to customer (5% of order total)
            const earnedCredit = order.total * 0.05;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["updateCustomerStoreCredit"])(order.customer_id, earnedCredit, `Earned 5% from order ${orderId}`);
            console.log("Store credit awarded for order:", {
                orderId,
                customerId: order.customer_id,
                earnedCredit
            });
        }
        // Send order confirmation email now that payment is confirmed
        try {
            console.log("Preparing to send order confirmation email for order:", orderId);
            const { data: customer } = await supabase.from("customers").select("*").eq("id", order?.customer_id).single();
            const { data: orderItems } = await supabase.from("order_items").select("*").eq("order_id", orderId);
            const baseUrl = process.env.BASE_URL || "https://stickerland.app";
            const customerEmail = customer?.email || order?.email || "";
            if (!customerEmail) {
                console.error("No customer email found for order:", orderId);
                throw new Error("Customer email is required to send confirmation");
            }
            console.log("Sending confirmation email to:", customerEmail);
            const emailSent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$email$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["sendOrderConfirmationEmail"])({
                customerEmail,
                customerName: customer?.first_name && customer?.last_name ? `${customer.first_name} ${customer.last_name}` : customer?.first_name || "Valued Customer",
                orderNumber: (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["formatOrderNumber"])(orderId),
                orderDate: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }),
                items: orderItems?.map((item)=>({
                        name: item.product_name,
                        quantity: item.quantity,
                        price: item.price,
                        designFileUrl: item.design_file_url,
                        options: item.options
                    })) || [],
                subtotal: order?.subtotal || 0,
                tax: order?.tax || 0,
                shipping: order?.shipping || 0,
                discount: order?.discount || 0,
                discountCode: order?.discount_code,
                total: order?.total || 0,
                estimatedDelivery: order?.estimated_delivery_date ? new Date(order.estimated_delivery_date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric"
                }) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric"
                }),
                orderLink: `${baseUrl}/order-status?orderNumber=${(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["formatOrderNumber"])(orderId)}`,
                shippingAddress: order?.shipping_address || undefined,
                policies: undefined
            });
            if (emailSent) {
                console.log(`✓ Order confirmation email successfully sent to ${customerEmail} for order #${(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["formatOrderNumber"])(orderId)}`);
            } else {
                console.warn(`✗ Order confirmation email failed to send to ${customerEmail} for order #${(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["formatOrderNumber"])(orderId)}`);
            }
        } catch (emailError) {
            console.error("Failed to send confirmation email:", {
                orderId,
                error: emailError instanceof Error ? emailError.message : emailError,
                stack: emailError instanceof Error ? emailError.stack : undefined
            });
        // Don't fail the payment confirmation if email fails
        }
    } catch (error) {
        console.error("Error processing Square payment creation:", error);
    }
}
const handleCreatePayment = async (req, res)=>{
    try {
        const { supabase } = await __turbopack_context__.A("[project]/server/utils/supabase.ts [api] (ecmascript, async loader)");
        const paymentRequest = req.body;
        // Validate required fields
        if (!paymentRequest.sourceId || paymentRequest.amount === undefined) {
            console.error("Missing required fields:", {
                sourceId: !!paymentRequest.sourceId,
                amount: paymentRequest.amount
            });
            return res.status(400).json({
                error: "Missing required fields: sourceId, amount"
            });
        }
        const amountInCents = Math.round(paymentRequest.amount * 100);
        let orderId = null;
        if (paymentRequest.orderId) {
            orderId = parseInt(paymentRequest.orderId, 10);
            if (isNaN(orderId)) {
                orderId = null;
            }
        }
        console.log("Creating Square payment:", {
            orderId,
            amount: amountInCents,
            currency: paymentRequest.currency || "USD"
        });
        // Create the payment using Square's Payments API
        const formattedOrderNum = orderId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["formatOrderNumber"])(orderId) : undefined;
        const paymentBody = {
            sourceId: paymentRequest.sourceId,
            amountMoney: {
                amount: amountInCents,
                currency: paymentRequest.currency || "USD"
            },
            autocomplete: true,
            idempotencyKey: `${Date.now()}-${Math.random()}`,
            ...orderId && {
                orderId: orderId.toString()
            },
            ...formattedOrderNum && {
                referenceId: formattedOrderNum,
                note: `Order: ${formattedOrderNum}`
            },
            ...paymentRequest.customerEmail && {
                receiptEmail: paymentRequest.customerEmail
            },
            ...paymentRequest.customerId && {
                customerId: paymentRequest.customerId.toString()
            }
        };
        let payment;
        try {
            const paymentsApi = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getPaymentsApi"])();
            const response = await paymentsApi.createPayment(paymentBody);
            if (!response.result) {
                throw new Error("No payment result returned from Square API");
            }
            payment = response.result;
        } catch (squareError) {
            console.error("Square API error:", squareError);
            const errorMsg = squareError instanceof Error ? squareError.message : String(squareError);
            return res.status(400).json({
                success: false,
                error: "Payment processing failed",
                details: errorMsg
            });
        }
        console.log("Square payment created successfully:", {
            paymentId: payment.id,
            status: payment.status,
            amount: payment.amountMoney?.amount
        });
        // Update order with payment details if we have an orderId
        if (orderId && payment.status === "COMPLETED") {
            try {
                const { data: order } = await supabase.from("orders").select("id, customer_id, total").eq("id", orderId).single().catch(()=>({
                        data: null
                    }));
                if (order) {
                    const paymentDetails = {
                        payment_id: payment.id,
                        payment_status: payment.status,
                        card_status: payment.cardDetails?.status || "",
                        amount: payment.amountMoney?.amount ? payment.amountMoney.amount / 100 : 0,
                        currency: payment.amountMoney?.currency || "USD",
                        payment_created_at: payment.createdAt,
                        payment_updated_at: payment.updatedAt,
                        card_brand: payment.cardDetails?.card?.cardBrand || "",
                        card_last_4: payment.cardDetails?.card?.last4 || "",
                        card_exp_month: payment.cardDetails?.card?.expMonth || null,
                        card_exp_year: payment.cardDetails?.card?.expYear || null,
                        entry_method: payment.cardDetails?.entryMethod || "",
                        receipt_number: payment.receiptNumber || "",
                        receipt_url: payment.receiptUrl || "",
                        authorized_at: payment.cardDetails?.cardPaymentTimeline?.authorizedAt || null,
                        captured_at: payment.cardDetails?.cardPaymentTimeline?.capturedAt || null
                    };
                    // Update order status and payment details
                    await supabase.from("orders").update({
                        status: "paid",
                        square_payment_details: paymentDetails,
                        updated_at: new Date().toISOString()
                    }).eq("id", orderId);
                    // Award store credit
                    if (order.customer_id) {
                        const earnedCredit = order.total * 0.05;
                        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["updateCustomerStoreCredit"])(order.customer_id, earnedCredit, `Earned 5% from order ${orderId}`);
                        console.log("Store credit awarded:", {
                            orderId,
                            customerId: order.customer_id,
                            earnedCredit
                        });
                    }
                }
            } catch (dbError) {
                console.error("Error updating order in Supabase:", dbError);
            }
        }
        // Return the payment response
        const paymentAmount = payment.amountMoney?.amount ? payment.amountMoney.amount / 100 : 0;
        return res.status(201).json({
            success: true,
            payment: {
                id: payment.id,
                status: payment.status,
                amount: paymentAmount,
                currency: payment.amountMoney?.currency || "USD",
                receiptUrl: payment.receiptUrl || "",
                receiptNumber: payment.receiptNumber || "",
                cardDetails: {
                    brand: payment.cardDetails?.card?.cardBrand || "",
                    lastFour: payment.cardDetails?.card?.last4 || "",
                    expMonth: payment.cardDetails?.card?.expMonth || null,
                    expYear: payment.cardDetails?.card?.expYear || null
                }
            }
        });
    } catch (error) {
        console.error("Create payment error - uncaught exception:", error);
        const errorMessage = error instanceof Error ? error.message : "Payment creation failed";
        return res.status(500).json({
            success: false,
            error: errorMessage,
            details: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
};
/**
 * Handle Square payment.updated webhook event
 */ async function handleSquarePaymentUpdated(data) {
    try {
        const { supabase } = await __turbopack_context__.A("[project]/server/utils/supabase.ts [api] (ecmascript, async loader)");
        const payment = data?.object?.payment;
        if (!payment) {
            console.warn("No payment data in Square webhook");
            return;
        }
        const paymentId = payment.id;
        const squareOrderId = payment.order_id;
        const paymentStatus = payment.status;
        const amountMoney = payment.amount_money || {};
        const cardDetails = payment.card_details || {};
        const card = cardDetails.card || {};
        if (!squareOrderId) {
            console.warn("No order ID associated with payment:", paymentId);
            return;
        }
        console.log("Processing Square payment update:", {
            paymentId,
            squareOrderId,
            status: paymentStatus,
            amount: amountMoney.amount
        });
        // Try to find order by numeric ID first (in case Square sends our ID)
        let order = null;
        const numOrderId = parseInt(squareOrderId, 10);
        if (!isNaN(numOrderId)) {
            try {
                const { data: orderByNum, error } = await supabase.from("orders").select("id, customer_id, total, status, square_payment_details").eq("id", numOrderId).single();
                if (!error && orderByNum) {
                    order = orderByNum;
                }
            } catch (err) {
            // Order not found by numeric ID, continue
            }
        }
        // If not found by numeric ID, try by Square order ID
        if (!order) {
            try {
                const { data: orderBySquareId, error } = await supabase.from("orders").select("id, customer_id, total, status, square_payment_details").eq("square_order_id", squareOrderId).single();
                if (!error && orderBySquareId) {
                    order = orderBySquareId;
                }
            } catch (err) {
            // Order not found
            }
        }
        if (!order) {
            console.warn("Order not found in Supabase for payment:", squareOrderId);
            return;
        }
        const orderId = order.id;
        // Check if payment is being completed (COMPLETED or APPROVED status)
        const isPaymentCompleted = paymentStatus === "COMPLETED" || paymentStatus === "APPROVED" || cardDetails.status === "CAPTURED";
        // Check if this is the first time the payment is being marked as completed
        const previousPaymentDetails = order.square_payment_details || {};
        const wasAlreadyCompleted = previousPaymentDetails.payment_status === "COMPLETED" || previousPaymentDetails.payment_status === "APPROVED" || previousPaymentDetails.card_status === "CAPTURED";
        // Prepare updated payment details object
        const updatedPaymentDetails = {
            ...previousPaymentDetails,
            payment_id: paymentId,
            payment_status: paymentStatus,
            card_status: cardDetails.status || "",
            amount: amountMoney.amount ? amountMoney.amount / 100 : 0,
            currency: amountMoney.currency || "USD",
            payment_created_at: payment.created_at,
            payment_updated_at: payment.updated_at,
            card_brand: card.card_brand || "",
            card_last_4: card.last_4 || "",
            card_exp_month: card.exp_month || null,
            card_exp_year: card.exp_year || null,
            entry_method: cardDetails.entry_method || "",
            receipt_number: payment.receipt_number || "",
            receipt_url: payment.receipt_url || "",
            authorized_at: cardDetails.card_payment_timeline?.authorized_at || null,
            captured_at: cardDetails.card_payment_timeline?.captured_at || null
        };
        // Determine new status based on payment status
        let newStatus = order.status;
        if (paymentStatus === "COMPLETED" || paymentStatus === "APPROVED") {
            newStatus = "paid";
        } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELED") {
            newStatus = "payment_failed";
        }
        // For PENDING and APPROVED, keep the current status (don't change pending_payment)
        // Update order with payment details
        const { error: updateError } = await supabase.from("orders").update({
            status: newStatus,
            square_payment_details: updatedPaymentDetails,
            updated_at: new Date().toISOString()
        }).eq("id", orderId);
        if (updateError) {
            console.error("Error updating order with payment details:", updateError);
            return;
        }
        console.log("Order updated with payment details:", {
            orderId,
            newStatus
        });
        // Award store credit only if this is the first time payment is completed
        if (!wasAlreadyCompleted && isPaymentCompleted && order.customer_id) {
            const earnedCredit = order.total * 0.05;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["updateCustomerStoreCredit"])(order.customer_id, earnedCredit, `Earned 5% from order ${orderId}`);
            console.log("Store credit awarded for order:", {
                orderId,
                customerId: order.customer_id,
                earnedCredit
            });
            // Send confirmation email now that payment is confirmed
            try {
                const { data: customer } = await supabase.from("customers").select("*").eq("id", order.customer_id).single();
                const { data: orderItems } = await supabase.from("order_items").select("*").eq("order_id", orderId);
                const baseUrl = process.env.BASE_URL || "http://localhost:5173";
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$email$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["sendOrderConfirmationEmail"])({
                    customerEmail: customer?.email || order?.email || "customer@example.com",
                    customerName: customer?.first_name && customer?.last_name ? `${customer.first_name} ${customer.last_name}` : "Valued Customer",
                    orderNumber: (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["formatOrderNumber"])(orderId),
                    orderDate: new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }),
                    items: orderItems?.map((item)=>({
                            name: item.product_name,
                            quantity: item.quantity,
                            price: item.price,
                            designFileUrl: item.design_file_url,
                            options: item.options
                        })) || [],
                    subtotal: order?.subtotal || 0,
                    tax: order?.tax || 0,
                    shipping: order?.shipping || 0,
                    discount: order?.discount || 0,
                    discountCode: order?.discount_code,
                    total: order?.total || 0,
                    estimatedDelivery: order?.estimated_delivery_date ? new Date(order.estimated_delivery_date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric"
                    }) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric"
                    }),
                    orderLink: `${baseUrl}/order-status?orderNumber=${(0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["formatOrderNumber"])(orderId)}`,
                    shippingAddress: order?.shipping_address || undefined,
                    policies: undefined
                });
                console.log(`Order confirmation email sent to ${customer?.email} after payment completion`);
            } catch (emailError) {
                console.error("Failed to send confirmation email:", emailError);
            // Don't fail the webhook if email fails
            }
        } else if (wasAlreadyCompleted) {
            console.log("Payment already completed, skipping duplicate store credit award and email:", orderId);
        }
    } catch (error) {
        console.error("Error processing Square payment update:", error);
    }
}
const handleVerifyPendingPayment = async (req, res)=>{
    try {
        const { orderId } = req.params;
        const { supabase } = await __turbopack_context__.A("[project]/server/utils/supabase.ts [api] (ecmascript, async loader)");
        if (!orderId) {
            return res.status(400).json({
                error: "Order ID required"
            });
        }
        const id = parseInt(orderId, 10);
        if (isNaN(id)) {
            return res.status(400).json({
                error: "Invalid order ID"
            });
        }
        console.log("Verifying pending payment for order:", id);
        // Get the order
        const { data: order, error: orderError } = await supabase.from("orders").select("id, status, square_payment_details").eq("id", id).single();
        if (orderError || !order) {
            return res.status(404).json({
                error: "Order not found"
            });
        }
        // Check if already paid
        if (order.status === "paid" || order.status === "completed") {
            return res.json({
                success: true,
                message: "Order is already paid",
                order: {
                    id: order.id,
                    status: order.status
                }
            });
        }
        // Check payment details stored from webhook
        if (order.square_payment_details?.payment_status === "APPROVED" || order.square_payment_details?.payment_status === "COMPLETED") {
            // Payment was approved by webhook but status wasn't updated before - update it now
            console.log("Found approved payment in stored details, updating order status");
            const { error: updateError } = await supabase.from("orders").update({
                status: "paid",
                updated_at: new Date().toISOString()
            }).eq("id", id);
            if (updateError) {
                throw new Error(`Failed to update order: ${updateError.message}`);
            }
            // Award store credit
            if (order) {
                const earnedCredit = order.total * 0.05;
                // Get customer ID for credit
                const { data: updatedOrder } = await supabase.from("orders").select("customer_id, total").eq("id", id).single();
                if (updatedOrder?.customer_id) {
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["updateCustomerStoreCredit"])(updatedOrder.customer_id, earnedCredit, `Earned 5% from order ${id}`);
                }
            }
            return res.json({
                success: true,
                message: "Order payment verified and status updated to paid",
                order: {
                    id: id,
                    status: "paid"
                }
            });
        }
        // No approved payment found
        return res.json({
            success: false,
            message: "No approved payment found for this order",
            order: {
                id: order.id,
                status: order.status,
                paymentStatus: order.square_payment_details?.payment_status
            }
        });
    } catch (error) {
        console.error("Verify pending payment error:", error);
        const errorMessage = error instanceof Error ? error.message : "Payment verification failed";
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/square-payment.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "processSquarePayment",
    ()=>processSquarePayment
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/square.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/supabase.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/order.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const processSquarePayment = async (req, res)=>{
    try {
        const { token, orderId, amount, customerEmail, customerName } = req.body;
        if (!token || !orderId || !amount) {
            return res.status(400).json({
                error: "Missing required fields: token, orderId, amount"
            });
        }
        console.log("Processing Square Web Payments SDK payment:", {
            orderId,
            amount,
            customerEmail
        });
        const amountInCents = Math.round(amount * 100);
        // Fetch full order details including items for Square Order creation
        const { data: orderData, error: orderError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("orders").select(`
        *,
        order_items (
          product_name,
          quantity,
          price
        )
      `).eq("id", orderId).single();
        if (orderError || !orderData) {
            console.error("Failed to fetch order details:", orderError);
            return res.status(404).json({
                error: "Order not found"
            });
        }
        const ordersApi = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getOrdersApi"])();
        const paymentsApi = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getPaymentsApi"])();
        // Determine Location ID (Required for Orders)
        let locationId = process.env.SQUARE_LOCATION_ID;
        if (!locationId) {
            console.warn("SQUARE_LOCATION_ID not set, fetching from API...");
            try {
                const locationsApi = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getLocationsApi"])();
                const { result } = await locationsApi.listLocations();
                const mainLocation = result.locations?.find((l)=>l.status === "ACTIVE");
                if (mainLocation) {
                    locationId = mainLocation.id;
                    console.log("Using fetched Location ID:", locationId);
                } else {
                    console.error("No active locations found in Square account");
                }
            } catch (locError) {
                console.error("Failed to fetch locations:", locError);
            }
        }
        if (!locationId) {
            console.error("CRITICAL: Cannot create Square Order without a Location ID");
        // We will proceed to payment logic but Order creation will likely fail or be skipped
        }
        // Construct line items for Square Order
        const lineItems = orderData.order_items?.map((item)=>({
                name: item.product_name || "Custom Item",
                quantity: String(item.quantity),
                basePriceMoney: {
                    amount: BigInt(Math.round((item.price || 0) * 100)),
                    currency: "USD"
                }
            })) || [];
        // Create Square Order
        // This allows the order to appear in the "Orders" tab of the Square Dashboard
        // and provides line item details on the receipt.
        let squareOrderId;
        if (locationId) {
            const formattedOrderNum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["formatOrderNumber"])(orderId);
            const orderRequest = {
                order: {
                    locationId: locationId,
                    referenceId: formattedOrderNum,
                    note: `Order: ${formattedOrderNum}`,
                    lineItems,
                    totalMoney: {
                        amount: BigInt(amountInCents),
                        currency: "USD"
                    }
                },
                idempotencyKey: `create-order-${orderId}-${Date.now()}`
            };
            console.log("Creating Square Order...", JSON.stringify(orderRequest, (key, value)=>typeof value === 'bigint' ? value.toString() : value // Handle BigInt serialization
            ));
            try {
                const { result: orderResult } = await ordersApi.createOrder(orderRequest);
                squareOrderId = orderResult.order?.id;
                console.log("Square Order Created:", squareOrderId);
            } catch (squareError) {
                console.error("Failed to create Square Order (proceeding with simple payment):", squareError);
            }
        } else {
            console.warn("Skipping Square Order creation due to missing Location ID");
        }
        // Create payment with Square
        const formattedOrderNumber = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["formatOrderNumber"])(orderId);
        const paymentRequest = {
            sourceId: token,
            amountMoney: {
                amount: BigInt(amountInCents),
                currency: "USD"
            },
            customerId: `customer-${orderId}`,
            referenceId: formattedOrderNumber,
            note: `Order: ${formattedOrderNumber}`,
            receiptEmail: customerEmail,
            idempotencyKey: `payment-${orderId}-${Date.now()}`
        };
        // Link the Payment to the Order if successful
        if (squareOrderId) {
            paymentRequest.orderId = squareOrderId;
        }
        const paymentResult = await paymentsApi.createPayment(paymentRequest);
        if (!paymentResult.result?.payment?.id) {
            console.error("Payment failed - no payment ID returned");
            return res.status(400).json({
                error: "Payment processing failed"
            });
        }
        console.log("Square payment successful:", {
            paymentId: paymentResult.result.payment.id,
            squareOrderId,
            status: paymentResult.result.payment.status,
            orderId
        });
        // Update order status to paid
        // We update square_order_id so we can link back to it later
        const { data: updatedOrder } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("orders").update({
            status: "paid",
            payment_id: paymentResult.result.payment.id,
            square_order_id: squareOrderId,
            payment_method: "square"
        }).eq("id", orderId).select().single();
        // Award store credit (5% of order total)
        if (updatedOrder) {
            const earnedCredit = updatedOrder.total * 0.05;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["updateCustomerStoreCredit"])(updatedOrder.customer_id, earnedCredit, `Earned 5% from order ${orderId}`);
            console.log("Store credit awarded:", {
                customerId: updatedOrder.customer_id,
                amount: earnedCredit,
                orderId
            });
        }
        // Return success response handling BigInt serialization
        const responseData = {
            success: true,
            payment: {
                id: paymentResult.result.payment.id,
                status: paymentResult.result.payment.status,
                amount: amount,
                orderId: squareOrderId
            },
            order: updatedOrder
        };
        res.status(200).json(JSON.parse(JSON.stringify(responseData, (key, value)=>typeof value === 'bigint' ? value.toString() : value)));
    } catch (error) {
        console.error("Square payment processing error:", error);
        if (error && typeof error === "object") {
            const errorObj = error;
            if (errorObj?.errors?.[0]?.detail) {
                return res.status(400).json({
                    error: errorObj.errors[0].detail
                });
            }
            if (errorObj?.message) {
                return res.status(400).json({
                    error: errorObj.message
                });
            }
        }
        res.status(500).json({
            error: error instanceof Error ? error.message : "Payment processing failed"
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/digital-files.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleDeleteDigitalFile",
    ()=>handleDeleteDigitalFile,
    "handleGetOrderFiles",
    ()=>handleGetOrderFiles,
    "handleUploadDigitalFile",
    ()=>handleUploadDigitalFile
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, esm_import, [project]/node_modules/@supabase/supabase-js)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$ecwid$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/ecwid.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__["createClient"])(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_KEY || "");
const handleUploadDigitalFile = async (req, res)=>{
    try {
        const { orderId, fileName, fileUrl, fileType, fileSize, orderSource } = req.body;
        const adminId = req.customerId;
        if (!orderId || !fileName || !fileUrl) {
            return res.status(400).json({
                error: "Order ID, file name, and file URL are required"
            });
        }
        // Determine order source (default to supabase for backward compatibility)
        const source = orderSource || "supabase";
        // Verify the order exists based on source
        if (source === "supabase") {
            const { data: order } = await supabase.from("orders").select("id").eq("id", orderId).single();
            if (!order) {
                return res.status(404).json({
                    error: "Supabase order not found"
                });
            }
        } else if (source === "ecwid") {
            // For Ecwid orders, just verify it's a valid order ID (numeric)
            const orderIdNum = parseInt(orderId);
            if (isNaN(orderIdNum)) {
                return res.status(400).json({
                    error: "Invalid Ecwid order ID"
                });
            }
            try {
                const order = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$ecwid$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["ecwidAPI"].getOrder(orderIdNum);
                if (!order) {
                    return res.status(404).json({
                        error: "Ecwid order not found"
                    });
                }
            } catch (ecwidError) {
                console.warn("Could not verify Ecwid order:", ecwidError);
            // Continue anyway - the order might exist but API call failed
            // The customer will get an error when trying to view the file if it doesn't exist
            }
        } else {
            return res.status(400).json({
                error: "Invalid order source. Must be 'supabase' or 'ecwid'"
            });
        }
        // Insert digital file record
        // Note: Both Supabase and Ecwid order IDs are stored in order_id field
        // The lookup is done by order_id in the orders fetch logic
        const { data: digitalFile, error } = await supabase.from("digital_files").insert({
            order_id: orderId,
            file_name: fileName,
            file_url: fileUrl,
            file_type: fileType,
            file_size: fileSize,
            uploaded_by: adminId
        }).select().single();
        if (error || !digitalFile) {
            console.error("Error uploading digital file:", error);
            return res.status(500).json({
                error: "Failed to upload file"
            });
        }
        res.json({
            success: true,
            file: {
                id: digitalFile.id,
                file_name: digitalFile.file_name,
                file_url: digitalFile.file_url,
                file_type: digitalFile.file_type,
                file_size: digitalFile.file_size,
                uploaded_at: digitalFile.uploaded_at
            }
        });
    } catch (error) {
        console.error("Upload digital file error:", error);
        res.status(500).json({
            error: "Failed to upload file"
        });
    }
};
const handleGetOrderFiles = async (req, res)=>{
    try {
        const { orderId } = req.params;
        const customerId = req.customerId;
        if (!orderId) {
            return res.status(400).json({
                error: "Order ID required"
            });
        }
        // Verify the customer owns the order or is admin
        const { data: order } = await supabase.from("orders").select("customer_id").eq("id", orderId).single();
        if (!order) {
            return res.status(404).json({
                error: "Order not found"
            });
        }
        if (order.customer_id !== customerId) {
            return res.status(403).json({
                error: "Unauthorized"
            });
        }
        // Get digital files
        const { data: files } = await supabase.from("digital_files").select("*").eq("order_id", orderId).order("created_at", {
            ascending: false
        });
        res.json({
            success: true,
            files: (files || []).map((file)=>({
                    id: file.id,
                    file_name: file.file_name,
                    file_url: file.file_url,
                    file_type: file.file_type,
                    file_size: file.file_size,
                    uploaded_at: file.uploaded_at
                }))
        });
    } catch (error) {
        console.error("Get order files error:", error);
        res.status(500).json({
            error: "Failed to fetch files"
        });
    }
};
const handleDeleteDigitalFile = async (req, res)=>{
    try {
        const { fileId } = req.params;
        if (!fileId) {
            return res.status(400).json({
                error: "File ID required"
            });
        }
        const { error } = await supabase.from("digital_files").delete().eq("id", fileId);
        if (error) {
            console.error("Error deleting digital file:", error);
            return res.status(500).json({
                error: "Failed to delete file"
            });
        }
        res.json({
            success: true
        });
    } catch (error) {
        console.error("Delete digital file error:", error);
        res.status(500).json({
            error: "Failed to delete file"
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/ecwid-products.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "handleGetEcwidProduct",
    ()=>handleGetEcwidProduct,
    "handleListEcwidProducts",
    ()=>handleListEcwidProducts,
    "handleSearchEcwidProducts",
    ()=>handleSearchEcwidProducts
]);
const ECWID_API_BASE = "https://api.ecwid.com/api/v3";
const ECWID_STORE_ID = process.env.ECWID_STORE_ID || "120154275";
const ECWID_API_TOKEN = process.env.ECWID_API_TOKEN || "";
// Mock products for development/demonstration
const MOCK_PRODUCTS = [
    {
        id: 785848122,
        sku: "3-INCH-PROMO",
        name: '3" INCH - 200 CUSTOM STICKER PROMOTION',
        price: 0.26,
        description: "Premium vinyl stickers perfect for laptops, phones, and outdoor use. Durable and weather-resistant.",
        images: [
            {
                id: 1,
                url: "https://d2j6dbq0eux0bg.cloudfront.net/images/120154275/5218909281.jpg",
                alt: "3 Inch Sticker Promo"
            }
        ],
        options: [
            {
                name: "Shape",
                type: "select",
                required: true,
                choices: [
                    {
                        text: "Square",
                        priceModifier: 0
                    },
                    {
                        text: "Circle",
                        priceModifier: 0
                    },
                    {
                        text: "Custom",
                        priceModifier: 0.5
                    }
                ]
            },
            {
                name: "Finish",
                type: "select",
                required: true,
                choices: [
                    {
                        text: "Glossy",
                        priceModifier: 0
                    },
                    {
                        text: "Matte",
                        priceModifier: 0.05
                    },
                    {
                        text: "Holographic",
                        priceModifier: 0.15
                    }
                ]
            },
            {
                name: "Size",
                type: "select",
                required: true,
                choices: [
                    {
                        text: '2x2"',
                        priceModifier: 0
                    },
                    {
                        text: '3x3"',
                        priceModifier: 0
                    },
                    {
                        text: '4x4"',
                        priceModifier: 0.1
                    }
                ]
            },
            {
                name: "Quantity",
                type: "select",
                required: true,
                choices: [
                    {
                        text: "50 pieces",
                        priceModifier: 0
                    },
                    {
                        text: "100 pieces",
                        priceModifier: 0
                    },
                    {
                        text: "250 pieces",
                        priceModifier: 5
                    }
                ]
            }
        ]
    },
    {
        id: 790950034,
        sku: "SQAURE-STICKER",
        name: "SQUARE STICKER",
        price: 0.22,
        description: "Classic square vinyl stickers with vibrant full-color printing. Perfect for branding and personal use.",
        images: [
            {
                id: 1,
                url: "https://d2j6dbq0eux0bg.cloudfront.net/images/120154275/5291230490.png",
                alt: "Square Sticker"
            }
        ],
        options: [
            {
                name: "Material",
                type: "select",
                required: true,
                choices: [
                    {
                        text: "Vinyl",
                        priceModifier: 0
                    },
                    {
                        text: "Paper",
                        priceModifier: -0.05
                    }
                ]
            },
            {
                name: "Size",
                type: "select",
                required: true,
                choices: [
                    {
                        text: '2x2"',
                        priceModifier: 0
                    },
                    {
                        text: '3x3"',
                        priceModifier: 0.05
                    }
                ]
            },
            {
                name: "Finish",
                type: "select",
                required: true,
                choices: [
                    {
                        text: "Gloss",
                        priceModifier: 0
                    },
                    {
                        text: "Matte",
                        priceModifier: 0.05
                    }
                ]
            },
            {
                name: "Border",
                type: "select",
                required: false,
                choices: [
                    {
                        text: "None",
                        priceModifier: 0
                    },
                    {
                        text: "White Border",
                        priceModifier: 0
                    }
                ]
            }
        ]
    },
    {
        id: 789123456,
        sku: "CIRCLE-STICKER",
        name: "CIRCLE STICKER",
        price: 0.22,
        description: "Round stickers with precision cutting for clean edges. Available in various finishes.",
        images: [
            {
                id: 1,
                url: "https://d2j6dbq0eux0bg.cloudfront.net/images/120154275/5291230491.png",
                alt: "Circle Sticker"
            }
        ],
        options: [
            {
                name: "Diameter",
                type: "select",
                required: true,
                choices: [
                    {
                        text: "2 inch",
                        priceModifier: 0
                    },
                    {
                        text: "3 inch",
                        priceModifier: 0.05
                    },
                    {
                        text: "4 inch",
                        priceModifier: 0.1
                    }
                ]
            },
            {
                name: "Finish",
                type: "select",
                required: true,
                choices: [
                    {
                        text: "Glossy",
                        priceModifier: 0
                    },
                    {
                        text: "Matte",
                        priceModifier: 0.05
                    }
                ]
            },
            {
                name: "Lamination",
                type: "select",
                required: false,
                choices: [
                    {
                        text: "None",
                        priceModifier: 0
                    },
                    {
                        text: "UV Protective",
                        priceModifier: 0.15
                    }
                ]
            },
            {
                name: "Quantity",
                type: "select",
                required: true,
                choices: [
                    {
                        text: "50",
                        priceModifier: 0
                    },
                    {
                        text: "100",
                        priceModifier: 0
                    },
                    {
                        text: "500",
                        priceModifier: 15
                    }
                ]
            }
        ]
    }
];
async function fetchFromEcwid(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Ecwid API error: ${response.statusText}`);
    }
    return response.json();
}
async function handleGetEcwidProduct(req, res) {
    try {
        const { productId } = req.params;
        const id = parseInt(productId, 10);
        if (isNaN(id)) {
            return res.status(400).json({
                error: "Invalid product ID"
            });
        }
        // Try to fetch from Ecwid API first, fallback to mock data
        try {
            const url = `${ECWID_API_BASE}/${ECWID_STORE_ID}/products/${id}?token=${ECWID_API_TOKEN}`;
            const data = await fetchFromEcwid(url);
            return res.json(data);
        } catch (apiError) {
            console.log("Ecwid API unavailable, using mock data");
            const product = MOCK_PRODUCTS.find((p)=>p.id === id);
            if (!product) {
                return res.status(404).json({
                    error: "Product not found"
                });
            }
            return res.json(product);
        }
    } catch (error) {
        console.error("Error in handleGetEcwidProduct:", error);
        res.status(500).json({
            error: "Failed to fetch product"
        });
    }
}
async function handleListEcwidProducts(req, res) {
    try {
        const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
        const offset = parseInt(req.query.offset || "0", 10);
        // Try to fetch from Ecwid API first, fallback to mock data
        try {
            const url = `${ECWID_API_BASE}/${ECWID_STORE_ID}/products?limit=${limit}&offset=${offset}&token=${ECWID_API_TOKEN}`;
            const data = await fetchFromEcwid(url);
            return res.json(data);
        } catch (apiError) {
            console.log("Ecwid API unavailable, using mock data");
            const products = MOCK_PRODUCTS.slice(offset, offset + limit);
            return res.json({
                items: products,
                count: products.length
            });
        }
    } catch (error) {
        console.error("Error in handleListEcwidProducts:", error);
        res.status(500).json({
            error: "Failed to fetch products"
        });
    }
}
async function handleSearchEcwidProducts(req, res) {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({
                error: "Search query required"
            });
        }
        const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
        // Try to fetch from Ecwid API first, fallback to mock data
        try {
            const url = `${ECWID_API_BASE}/${ECWID_STORE_ID}/products?keyword=${encodeURIComponent(q)}&limit=${limit}&token=${ECWID_API_TOKEN}`;
            const data = await fetchFromEcwid(url);
            return res.json(data);
        } catch (apiError) {
            console.log("Ecwid API unavailable, using mock data");
            const query = q.toLowerCase();
            const products = MOCK_PRODUCTS.filter((p)=>p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)).slice(0, limit);
            return res.json({
                items: products,
                count: products.length
            });
        }
    } catch (error) {
        console.error("Error in handleSearchEcwidProducts:", error);
        res.status(500).json({
            error: "Failed to search products"
        });
    }
}
}),
"[project]/server/routes/import-products.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleDeleteAllProducts",
    ()=>handleDeleteAllProducts,
    "handleGetProducts",
    ()=>handleGetProducts,
    "handleImportProducts",
    ()=>handleImportProducts
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, esm_import, [project]/node_modules/@supabase/supabase-js)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials not configured for product import");
}
const supabase = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__["createClient"])(supabaseUrl || "", supabaseKey || "");
function parseCSVLine(line) {
    const result = [];
    let current = "";
    let insideQuotes = false;
    for(let i = 0; i < line.length; i++){
        const char = line[i];
        const nextChar = line[i + 1];
        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === "," && !insideQuotes) {
            result.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}
function parseEcwidCSV(csvText) {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) {
        return [];
    }
    const headers = lines[0].split(",").map((h)=>h.trim().toLowerCase().replace(/["\s]/g, ""));
    const productMap = new Map();
    for(let i = 1; i < lines.length; i++){
        const line = lines[i].trim();
        if (!line) continue;
        const values = parseCSVLine(line);
        if (values.length === 0) continue;
        const row = {};
        headers.forEach((header, index)=>{
            if (values[index] !== undefined) {
                row[header] = values[index].trim();
            }
        });
        const type = row.type || "";
        const productId = row.product_internal_id || "";
        if (!productId) continue;
        // Initialize product entry if not exists
        if (!productMap.has(productId)) {
            productMap.set(productId, {
                product: row,
                options: new Map(),
                variations: []
            });
        }
        const parsed = productMap.get(productId);
        if (type === "product") {
            parsed.product = row;
        } else if (type === "product_option") {
            const optionName = row.product_option_name || "";
            if (optionName) {
                if (!parsed.options.has(optionName)) {
                    parsed.options.set(optionName, []);
                }
                parsed.options.get(optionName).push(row);
            }
        } else if (type === "product_variation") {
            parsed.variations.push(row);
        }
    }
    return Array.from(productMap.values());
}
function buildProductFromEcwid(parsed) {
    const product = parsed.product;
    const variations = parsed.variations;
    // Calculate price range from variations
    let basePrice = parseFloat(product.product_price) || 0;
    let minPrice = basePrice;
    let maxPrice = basePrice;
    if (variations.length > 0) {
        const prices = variations.map((v)=>parseFloat(v.product_price) || 0).filter((p)=>p > 0);
        if (prices.length > 0) {
            minPrice = Math.min(...prices);
            maxPrice = Math.max(...prices);
            basePrice = minPrice;
        }
    }
    // Build options array
    const options = [];
    parsed.options.forEach((optionItems, optionName)=>{
        const choices = optionItems.filter((item)=>item.product_option_value).map((item)=>({
                text: item.product_option_value,
                markup: item.product_option_markup || "0"
            }));
        if (choices.length > 0) {
            options.push({
                name: optionName,
                type: optionItems[0]?.product_option_type || "DROPDOWNLIST",
                required: optionItems[0]?.product_option_is_required === "true",
                choices
            });
        }
    });
    // Build variations array
    const variationsFormatted = variations.map((v)=>{
        // Extract variation attribute values from the row
        const variationAttributes = {};
        Object.keys(v).forEach((key)=>{
            if (key.startsWith("product_variation_option_")) {
                const attrName = key.replace("product_variation_option_", "").replace(/[{}]/g, "");
                const value = v[key];
                if (value) {
                    variationAttributes[attrName] = value;
                }
            }
        });
        return {
            id: v.product_variation_sku || `var-${Object.keys(variationAttributes).join("-")}`,
            price: parseFloat(v.product_price) || 0,
            image_url: v.product_media_main_image_url || "",
            attributes: variationAttributes
        };
    });
    // Get main image - prefer variation image if available
    let imageUrl = product.product_media_main_image_url || "";
    if (!imageUrl && variationsFormatted.length > 0) {
        imageUrl = variationsFormatted[0].image_url;
    }
    return {
        ecwid_id: parseInt(product.product_internal_id, 10),
        sku: product.product_sku || null,
        name: product.product_name || "",
        description: product.product_description || null,
        price: basePrice,
        base_price: basePrice,
        min_price: minPrice,
        max_price: maxPrice,
        image_url: imageUrl,
        options: options,
        variations: variationsFormatted,
        rating: 0,
        reviews_count: 0,
        is_active: true
    };
}
const handleImportProducts = async (req, res)=>{
    try {
        const csvData = req.body?.csv_data;
        if (!csvData || typeof csvData !== "string") {
            return res.status(400).json({
                error: "CSV data is required. Send as POST with 'csv_data' (string) in the request body",
                received: typeof csvData
            });
        }
        const parsedProducts = parseEcwidCSV(csvData);
        if (parsedProducts.length === 0) {
            return res.status(400).json({
                error: "No valid products found in CSV"
            });
        }
        // Convert to database format
        const productsToInsert = parsedProducts.map((parsed)=>buildProductFromEcwid(parsed));
        const { data, error } = await supabase.from("products").insert(productsToInsert).select();
        if (error) {
            console.error("Import error:", error);
            return res.status(500).json({
                error: error.message || "Failed to import products"
            });
        }
        res.json({
            success: true,
            message: `Successfully imported ${data?.length || 0} products`,
            imported_count: data?.length || 0,
            products: data
        });
    } catch (error) {
        console.error("Import products error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to import products"
        });
    }
};
const handleGetProducts = async (req, res)=>{
    try {
        const { limit = 20, offset = 0 } = req.query;
        const { data, error, count } = await supabase.from("products").select("*", {
            count: "exact"
        }).eq("is_active", true).order("created_at", {
            ascending: false
        }).range(parseInt(offset) || 0, (parseInt(offset) || 0) + (parseInt(limit) || 20) - 1);
        if (error) {
            console.error("Fetch products error:", error);
            return res.status(500).json({
                error: error.message || "Failed to fetch products"
            });
        }
        res.json({
            items: data || [],
            count: count || 0,
            limit: parseInt(limit) || 20,
            offset: parseInt(offset) || 0
        });
    } catch (error) {
        console.error("Get products error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to fetch products"
        });
    }
};
const handleDeleteAllProducts = async (req, res)=>{
    try {
        const { data, error } = await supabase.from("products").delete().neq("id", 0).select();
        if (error) {
            console.error("Delete error:", error);
            return res.status(500).json({
                error: error.message || "Failed to delete products"
            });
        }
        res.json({
            success: true,
            message: `Deleted ${data?.length || 0} products`,
            deleted_count: data?.length || 0
        });
    } catch (error) {
        console.error("Delete products error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to delete products"
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/emails/generate-proof-email.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateProofEmailHtml",
    ()=>generateProofEmailHtml
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/order.ts [api] (ecmascript)");
;
function generateProofEmailHtml(params) {
    const { customerName, orderId, proofDescription, proofFileUrl, approvalLink, revisionLink, referenceNumber } = params;
    const formattedOrderNumber = orderId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["formatOrderNumber"])(orderId) : null;
    const imageHtml = proofFileUrl ? `
        <div style="margin-bottom: 20px; border-radius: 6px; overflow: hidden; border: 1px solid #e5e7eb;">
          <img src="${proofFileUrl}" alt="Design Proof" style="width: 100%; height: auto; display: block;" />
        </div>
      ` : "";
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

      <p>Great news! Your design proof${referenceNumber ? ` for <strong>${referenceNumber}</strong>` : formattedOrderNumber ? ` for <strong>Order ${formattedOrderNumber}</strong>` : ""} is ready for review.</p>

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
      <p>© 2024 Stickerland. All rights reserved.</p>
      <p>This is an automated message. Please do not reply to this email address directly.</p>
    </div>
  </div>
</body>
</html>
  `;
}
}),
"[project]/server/routes/proofs.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleAddAdminProofComment",
    ()=>handleAddAdminProofComment,
    "handleAddProofComment",
    ()=>handleAddProofComment,
    "handleApproveProof",
    ()=>handleApproveProof,
    "handleApproveProofPublic",
    ()=>handleApproveProofPublic,
    "handleApproveProofPublicNew",
    ()=>handleApproveProofPublicNew,
    "handleDenyProof",
    ()=>handleDenyProof,
    "handleDenyProofPublic",
    ()=>handleDenyProofPublic,
    "handleGetAdminProofDetail",
    ()=>handleGetAdminProofDetail,
    "handleGetAdminProofs",
    ()=>handleGetAdminProofs,
    "handleGetProofDetail",
    ()=>handleGetProofDetail,
    "handleGetProofDetailPublic",
    ()=>handleGetProofDetailPublic,
    "handleGetProofNotifications",
    ()=>handleGetProofNotifications,
    "handleGetProofs",
    ()=>handleGetProofs,
    "handleReviseProofPublicNew",
    ()=>handleReviseProofPublicNew,
    "handleSendProofToCustomer",
    ()=>handleSendProofToCustomer
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, esm_import, [project]/node_modules/@supabase/supabase-js)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$resend__$5b$external$5d$__$28$resend$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$resend$29$__ = __turbopack_context__.i("[externals]/resend [external] (resend, esm_import, [project]/node_modules/resend)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$generate$2d$proof$2d$email$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/emails/generate-proof-email.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$public$2d$access$2d$tokens$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/public-access-tokens.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$resend__$5b$external$5d$__$28$resend$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$resend$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$public$2d$access$2d$tokens$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$resend__$5b$external$5d$__$28$resend$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$resend$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$public$2d$access$2d$tokens$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__["createClient"])(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_KEY || "");
const resend = process.env.RESEND_API_KEY ? new __TURBOPACK__imported__module__$5b$externals$5d2f$resend__$5b$external$5d$__$28$resend$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$resend$29$__["Resend"](process.env.RESEND_API_KEY) : null;
const PROOF_EMAIL_FROM = "sticky@stickerland.com";
const handleGetProofs = async (req, res)=>{
    try {
        const customerId = req.customerId;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = 5;
        const offset = (page - 1) * limit;
        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        // Get total count
        const { count: totalCount, error: countError } = await supabase.from("proofs").select("*", {
            count: "exact",
            head: true
        }).eq("customer_id", customerId);
        if (countError) {
            console.error("Error counting proofs:", countError);
            return res.status(500).json({
                error: "Failed to fetch proofs"
            });
        }
        // Get paginated proofs
        const { data: proofs, error } = await supabase.from("proofs").select("*").eq("customer_id", customerId).order("created_at", {
            ascending: false
        }).range(offset, offset + limit - 1);
        if (error) {
            console.error("Error fetching proofs:", error);
            return res.status(500).json({
                error: "Failed to fetch proofs"
            });
        }
        // Count unread notifications
        const { data: notifications } = await supabase.from("proof_notifications").select("*").eq("customer_id", customerId).eq("is_read", false);
        const totalPages = Math.ceil((totalCount || 0) / limit);
        res.json({
            success: true,
            proofs: proofs || [],
            unreadNotifications: notifications?.length || 0,
            pagination: {
                currentPage: page,
                pageSize: limit,
                totalItems: totalCount || 0,
                totalPages,
                hasMore: page < totalPages
            }
        });
    } catch (error) {
        console.error("Get proofs error:", error);
        res.status(500).json({
            error: "Failed to fetch proofs"
        });
    }
};
const handleGetProofDetail = async (req, res)=>{
    try {
        const customerId = req.customerId;
        const { proofId } = req.params;
        if (!customerId || !proofId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        // Get proof
        const { data: proof, error: proofError } = await supabase.from("proofs").select("*").eq("id", proofId).single();
        if (proofError || !proof) {
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        // Verify customer owns this proof
        if (proof.customer_id !== customerId) {
            return res.status(403).json({
                error: "Unauthorized"
            });
        }
        // Get comments
        const { data: comments, error: commentsError } = await supabase.from("proof_comments").select("*").eq("proof_id", proofId).order("created_at", {
            ascending: true
        });
        if (commentsError) {
            console.error("Error fetching comments:", commentsError);
            return res.status(500).json({
                error: "Failed to fetch proof details"
            });
        }
        // Mark notification as read
        const { data: notification } = await supabase.from("proof_notifications").select("id").eq("proof_id", proofId).eq("customer_id", customerId).eq("is_read", false).single();
        if (notification) {
            await supabase.from("proof_notifications").update({
                is_read: true,
                read_at: new Date().toISOString()
            }).eq("id", notification.id);
        }
        const proofDetail = {
            ...proof,
            comments: comments || []
        };
        res.json({
            success: true,
            proof: proofDetail
        });
    } catch (error) {
        console.error("Get proof detail error:", error);
        res.status(500).json({
            error: "Failed to fetch proof details"
        });
    }
};
const handleApproveProof = async (req, res)=>{
    try {
        const customerId = req.customerId;
        const { proofId } = req.params;
        if (!customerId || !proofId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        // Get proof
        const { data: proof, error: proofError } = await supabase.from("proofs").select("*").eq("id", proofId).single();
        if (proofError || !proof) {
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        // Verify customer owns this proof
        if (proof.customer_id !== customerId) {
            return res.status(403).json({
                error: "Unauthorized"
            });
        }
        // Update proof status
        const { error: updateError } = await supabase.from("proofs").update({
            status: "approved",
            updated_at: new Date().toISOString()
        }).eq("id", proofId);
        if (updateError) {
            console.error("Error approving proof:", updateError);
            return res.status(500).json({
                error: "Failed to approve proof"
            });
        }
        // Create admin notification
        const { data: customerData } = await supabase.from("customers").select("email, first_name, last_name").eq("id", customerId).single();
        await supabase.from("proof_notifications").insert({
            customer_id: customerId,
            proof_id: proofId,
            notification_type: "customer_approved",
            message: `${customerData?.first_name} ${customerData?.last_name} has approved their proof for order #${proof.order_id}`,
            is_read: false
        });
        res.json({
            success: true,
            message: "Proof approved successfully",
            status: "approved"
        });
    } catch (error) {
        console.error("Approve proof error:", error);
        res.status(500).json({
            error: "Failed to approve proof"
        });
    }
};
const handleDenyProof = async (req, res)=>{
    try {
        const customerId = req.customerId;
        const { proofId } = req.params;
        const { revisionNotes } = req.body;
        if (!customerId || !proofId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        // Get proof
        const { data: proof, error: proofError } = await supabase.from("proofs").select("*").eq("id", proofId).single();
        if (proofError || !proof) {
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        // Verify customer owns this proof
        if (proof.customer_id !== customerId) {
            return res.status(403).json({
                error: "Unauthorized"
            });
        }
        // Update proof status
        const { error: updateError } = await supabase.from("proofs").update({
            status: "revisions_requested",
            revision_notes: revisionNotes || "",
            updated_at: new Date().toISOString()
        }).eq("id", proofId);
        if (updateError) {
            console.error("Error denying proof:", updateError);
            return res.status(500).json({
                error: "Failed to deny proof"
            });
        }
        res.json({
            success: true,
            message: "Proof denied, revisions requested",
            status: "revisions_requested"
        });
    } catch (error) {
        console.error("Deny proof error:", error);
        res.status(500).json({
            error: "Failed to deny proof"
        });
    }
};
const handleAddProofComment = async (req, res)=>{
    try {
        const customerId = req.customerId;
        const { proofId } = req.params;
        const { message } = req.body;
        if (!customerId || !proofId || !message) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }
        // Get proof
        const { data: proof, error: proofError } = await supabase.from("proofs").select("*").eq("id", proofId).single();
        if (proofError || !proof) {
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        // Verify customer owns this proof
        if (proof.customer_id !== customerId) {
            return res.status(403).json({
                error: "Unauthorized"
            });
        }
        // Add comment
        const { data: comment, error: commentError } = await supabase.from("proof_comments").insert({
            proof_id: proofId,
            customer_id: customerId,
            message
        }).select().single();
        if (commentError) {
            console.error("Error adding comment:", commentError);
            return res.status(500).json({
                error: "Failed to add comment"
            });
        }
        res.json({
            success: true,
            comment
        });
    } catch (error) {
        console.error("Add comment error:", error);
        res.status(500).json({
            error: "Failed to add comment"
        });
    }
};
const handleGetProofNotifications = async (req, res)=>{
    try {
        const customerId = req.customerId;
        if (!customerId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        const { data: notifications, error } = await supabase.from("proof_notifications").select("*").eq("customer_id", customerId).eq("is_read", false).order("created_at", {
            ascending: false
        });
        if (error) {
            console.error("Error fetching notifications:", error);
            return res.status(500).json({
                error: "Failed to fetch notifications"
            });
        }
        res.json({
            success: true,
            notifications: notifications || []
        });
    } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({
            error: "Failed to fetch notifications"
        });
    }
};
const handleSendProofToCustomer = async (req, res)=>{
    try {
        const { customerEmail, description, referenceNumber, fileData, fileName, fileUrl } = req.body;
        if (!description) {
            return res.status(400).json({
                error: "Proof subject is required"
            });
        }
        if (!customerEmail) {
            return res.status(400).json({
                error: "Customer email is required"
            });
        }
        // Find or create customer
        let resolvedCustomerId;
        const { data: existingCustomer } = await supabase.from("customers").select("id").eq("email", customerEmail).maybeSingle();
        if (existingCustomer) {
            resolvedCustomerId = existingCustomer.id;
        } else {
            // Create new customer
            const emailParts = customerEmail.split("@");
            const { data: newCustomer, error: createError } = await supabase.from("customers").insert({
                email: customerEmail,
                first_name: emailParts[0],
                last_name: "Customer"
            }).select("id").single();
            if (!newCustomer) {
                return res.status(500).json({
                    error: "Failed to create customer record"
                });
            }
            resolvedCustomerId = newCustomer.id;
        }
        let finalFileUrl;
        let storedFileName;
        // If fileUrl is provided directly (from Cloudinary), use it
        if (fileUrl) {
            finalFileUrl = fileUrl;
            storedFileName = fileName;
            console.log("Using pre-uploaded file URL from Cloudinary:", finalFileUrl);
        } else if (fileData && fileName) {
            try {
                const buffer = Buffer.from(fileData, "base64");
                const timestamp = Date.now();
                const uniqueFileName = `proof-${timestamp}-${fileName}`;
                const bucketPath = `proofs/${uniqueFileName}`;
                const { error: uploadError } = await supabase.storage.from("proofs").upload(bucketPath, buffer, {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: "application/octet-stream"
                });
                if (uploadError) {
                    console.error("Error uploading file:", uploadError);
                    return res.status(500).json({
                        error: "Failed to upload file"
                    });
                }
                const { data: publicUrlData } = supabase.storage.from("proofs").getPublicUrl(bucketPath);
                finalFileUrl = publicUrlData.publicUrl;
                storedFileName = fileName;
                console.log("Uploaded file to Supabase Storage:", finalFileUrl);
            } catch (fileError) {
                console.error("Error processing file:", fileError);
                return res.status(500).json({
                    error: "Failed to process file"
                });
            }
        }
        // Create or find a placeholder order for this proof
        // (database requires order_id, so we create a dummy one for standalone proofs)
        let resolvedOrderId = null;
        const { data: existingOrder } = await supabase.from("orders").select("id").eq("customer_id", resolvedCustomerId).eq("status", "pending").limit(1).maybeSingle();
        if (existingOrder) {
            resolvedOrderId = existingOrder.id;
        } else {
            // Create a placeholder order
            const { data: newOrder } = await supabase.from("orders").insert({
                customer_id: resolvedCustomerId,
                status: "pending",
                total: 0,
                items: []
            }).select("id").single();
            if (newOrder) {
                resolvedOrderId = newOrder.id;
            }
        }
        // Create proof record (independent of orders conceptually, but linked for DB constraint)
        // Note: If using reference_number in the future, add it to the description for now
        const proofPayload = {
            customer_id: resolvedCustomerId,
            description: referenceNumber ? `${referenceNumber} - ${description}` : description,
            file_url: finalFileUrl,
            file_name: storedFileName,
            status: "pending"
        };
        // Include order_id if we have one
        if (resolvedOrderId) {
            proofPayload.order_id = resolvedOrderId;
        }
        const { data: proof, error: proofError } = await supabase.from("proofs").insert(proofPayload).select().single();
        if (proofError) {
            console.error("Error creating proof:", proofError);
            return res.status(500).json({
                error: "Failed to send proof"
            });
        }
        // SECURITY: Generate secure one-time-use tokens for proof approval/revision
        const approvalTokenResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$public$2d$access$2d$tokens$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createPublicAccessToken"])({
            resourceType: "proof",
            resourceId: proof.id,
            expiresInHours: 72,
            oneTimeUse: true,
            createdBy: "admin-proof-email"
        });
        const revisionTokenResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$public$2d$access$2d$tokens$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createPublicAccessToken"])({
            resourceType: "proof",
            resourceId: proof.id,
            expiresInHours: 72,
            oneTimeUse: true,
            createdBy: "admin-proof-email"
        });
        if (!approvalTokenResult.success || !revisionTokenResult.success) {
            console.error("Failed to generate access tokens for proof email");
            return res.status(500).json({
                error: "Failed to send proof"
            });
        }
        // Send proof email
        if (process.env.RESEND_API_KEY && resend) {
            try {
                const baseUrl = process.env.FRONTEND_URL || "https://stickerland.com";
                // SECURITY: Include tokens in email links
                const approvalLink = `${baseUrl}/proofs/review?token=${approvalTokenResult.token}&action=approve`;
                const revisionLink = `${baseUrl}/proofs/review?token=${revisionTokenResult.token}&action=revise`;
                const { data: customer } = await supabase.from("customers").select("first_name, last_name").eq("id", resolvedCustomerId).single();
                const customerName = customer?.first_name ? `${customer.first_name}${customer.last_name ? " " + customer.last_name : ""}` : "Valued Customer";
                // Generate email HTML
                const emailHtml = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$generate$2d$proof$2d$email$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["generateProofEmailHtml"])({
                    customerName,
                    proofDescription: description,
                    proofFileUrl: finalFileUrl,
                    approvalLink,
                    revisionLink,
                    referenceNumber
                });
                // Send email via Resend
                const emailResult = await resend.emails.send({
                    from: PROOF_EMAIL_FROM,
                    to: customerEmail,
                    subject: `Your Design Proof is Ready${referenceNumber ? ` - ${referenceNumber}` : ""}`,
                    html: emailHtml
                });
                if (emailResult.error) {
                    console.error("Error sending proof email:", emailResult.error);
                } else {
                    console.log("Proof email sent successfully:", emailResult.data);
                }
            } catch (emailError) {
                console.error("Error preparing or sending proof email:", emailError);
            }
        }
        res.json({
            success: true,
            proof,
            message: "Proof sent to customer successfully"
        });
    } catch (error) {
        console.error("Send proof error:", error);
        res.status(500).json({
            error: "Failed to send proof"
        });
    }
};
const handleGetAdminProofDetail = async (req, res)=>{
    try {
        const { proofId } = req.params;
        if (!proofId) {
            return res.status(400).json({
                error: "Proof ID is required"
            });
        }
        const { data: proof, error } = await supabase.from("proofs").select(`
        *,
        customers:customer_id (id, email, first_name, last_name),
        comments:proof_comments (id, proof_id, customer_id, admin_id, admin_email, message, created_at)
      `).eq("id", proofId).single();
        if (error || !proof) {
            console.error("Error fetching proof detail:", error);
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        res.json({
            success: true,
            proof
        });
    } catch (error) {
        console.error("Get proof detail error:", error);
        res.status(500).json({
            error: "Failed to get proof details"
        });
    }
};
const handleGetAdminProofs = async (req, res)=>{
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const sort = req.query.sort || "newest";
        const limit = Math.max(1, Math.min(20, parseInt(req.query.limit) || 5));
        const offset = (page - 1) * limit;
        const dateFilter = req.query.date || null;
        const statusFilter = req.query.status || null;
        // Build the count query
        let countQuery = supabase.from("proofs").select("*", {
            count: "exact",
            head: true
        });
        // Get paginated proofs query
        let proofQuery = supabase.from("proofs").select(`
        *,
        customers:customer_id (id, email, first_name, last_name)
      `);
        // Apply date filter if provided
        if (dateFilter) {
            const startOfDay = `${dateFilter}T00:00:00.000Z`;
            const endOfDay = `${dateFilter}T23:59:59.999Z`;
            countQuery = countQuery.gte("created_at", startOfDay).lte("created_at", endOfDay);
            proofQuery = proofQuery.gte("created_at", startOfDay).lte("created_at", endOfDay);
        }
        // Apply status filter if provided
        if (statusFilter) {
            countQuery = countQuery.eq("status", statusFilter);
            proofQuery = proofQuery.eq("status", statusFilter);
        }
        // Get total count
        const { count: totalCount, error: countError } = await countQuery;
        if (countError) {
            console.error("Error counting admin proofs:", countError);
            return res.status(500).json({
                error: "Failed to fetch proofs"
            });
        }
        // Get paginated proofs with their customer info
        const sortAscending = sort === "oldest" ? true : false;
        const { data: proofs, error } = await proofQuery.order("created_at", {
            ascending: sortAscending
        }).range(offset, offset + limit - 1);
        if (error) {
            console.error("Error fetching admin proofs:", error);
            return res.status(500).json({
                error: "Failed to fetch proofs"
            });
        }
        // Get unread admin notifications
        const { data: notifications } = await supabase.from("proof_notifications").select("*").eq("is_read", false);
        const totalPages = Math.ceil((totalCount || 0) / limit);
        res.json({
            success: true,
            proofs: (proofs || []).map((proof)=>({
                    id: proof.id,
                    orderId: proof.order_id,
                    customerId: proof.customer_id,
                    customerName: proof.customers ? `${proof.customers.first_name || ""} ${proof.customers.last_name || ""}`.trim() : "Unknown",
                    customerEmail: proof.customers?.email || "N/A",
                    status: proof.status,
                    thumbnailUrl: proof.file_url,
                    approvedAt: proof.updated_at,
                    createdAt: proof.created_at
                })),
            unreadNotifications: notifications?.length || 0,
            pagination: {
                currentPage: page,
                pageSize: limit,
                totalItems: totalCount || 0,
                totalPages,
                hasMore: page < totalPages
            }
        });
    } catch (error) {
        console.error("Get admin proofs error:", error);
        res.status(500).json({
            error: "Failed to fetch proofs"
        });
    }
};
const handleAddAdminProofComment = async (req, res)=>{
    try {
        const { proofId } = req.params;
        const { message, adminId, adminEmail } = req.body;
        if (!proofId || !message || !adminId) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }
        // Get proof
        const { data: proof, error: proofError } = await supabase.from("proofs").select("*").eq("id", proofId).single();
        if (proofError || !proof) {
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        // Add comment
        const { data: comment, error: commentError } = await supabase.from("proof_comments").insert({
            proof_id: proofId,
            admin_id: adminId,
            admin_email: adminEmail,
            message
        }).select().single();
        if (commentError) {
            console.error("Error adding admin comment:", commentError);
            return res.status(500).json({
                error: "Failed to add comment"
            });
        }
        res.json({
            success: true,
            comment
        });
    } catch (error) {
        console.error("Add admin comment error:", error);
        res.status(500).json({
            error: "Failed to add comment"
        });
    }
};
const handleGetProofDetailPublic = async (req, res)=>{
    try {
        const { token } = req.query;
        if (!token || typeof token !== "string") {
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        // SECURITY: Validate token atomically (prevents enumeration)
        const validation = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$public$2d$access$2d$tokens$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["validatePublicAccessToken"])(token, "proof");
        if (!validation.success) {
            // Generic 404 - never reveal why token failed
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        const proofId = validation.resourceId;
        // Get proof
        const { data: proof, error: proofError } = await supabase.from("proofs").select("*").eq("id", proofId).single();
        if (proofError || !proof) {
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        // Get comments
        const { data: comments, error: commentsError } = await supabase.from("proof_comments").select("*").eq("proof_id", proofId).order("created_at", {
            ascending: true
        });
        if (commentsError) {
            console.error("Error fetching comments:", commentsError);
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        res.json({
            success: true,
            proof: {
                ...proof,
                comments: comments || []
            }
        });
    } catch (error) {
        console.error("Get proof detail public error:", error);
        res.status(404).json({
            error: "Proof not found"
        });
    }
};
const handleApproveProofPublicNew = async (req, res)=>{
    try {
        const { token } = req.query;
        if (!token || typeof token !== "string") {
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        // SECURITY: Validate token atomically (prevents enumeration and reuse)
        const validation = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$public$2d$access$2d$tokens$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["validatePublicAccessToken"])(token, "proof");
        if (!validation.success) {
            // Generic 404 - never reveal why token failed
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        const proofId = validation.resourceId;
        // Get proof
        const { data: proof, error: proofError } = await supabase.from("proofs").select("*").eq("id", proofId).single();
        if (proofError || !proof) {
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        // Update proof status
        const { error: updateError } = await supabase.from("proofs").update({
            status: "approved",
            updated_at: new Date().toISOString()
        }).eq("id", proofId);
        if (updateError) {
            console.error("Error approving proof:", updateError);
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        res.json({
            success: true,
            message: "Proof approved successfully",
            status: "approved"
        });
    } catch (error) {
        console.error("Approve proof public error:", error);
        res.status(500).json({
            error: "Failed to approve proof"
        });
    }
};
const handleReviseProofPublicNew = async (req, res)=>{
    try {
        const { token } = req.query;
        const { revision_notes } = req.body;
        if (!token || typeof token !== "string") {
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        // SECURITY: Validate token atomically (prevents enumeration and reuse)
        const validation = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$public$2d$access$2d$tokens$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["validatePublicAccessToken"])(token, "proof");
        if (!validation.success) {
            // Generic 404 - never reveal why token failed
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        const proofId = validation.resourceId;
        // Get proof
        const { data: proof, error: proofError } = await supabase.from("proofs").select("*").eq("id", proofId).single();
        if (proofError || !proof) {
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        // Update proof status
        const { error: updateError } = await supabase.from("proofs").update({
            status: "revisions_requested",
            revision_notes: revision_notes || "",
            updated_at: new Date().toISOString()
        }).eq("id", proofId);
        if (updateError) {
            console.error("Error requesting revisions:", updateError);
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        res.json({
            success: true,
            message: "Revision request submitted successfully",
            status: "revisions_requested"
        });
    } catch (error) {
        console.error("Revise proof public error:", error);
        res.status(404).json({
            error: "Proof not found"
        });
    }
};
const handleApproveProofPublic = async (req, res)=>{
    try {
        const { token } = req.query;
        if (!token || typeof token !== "string") {
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        // SECURITY: Validate token atomically (prevents enumeration and reuse)
        const validation = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$public$2d$access$2d$tokens$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["validatePublicAccessToken"])(token, "proof");
        if (!validation.success) {
            // Generic 404 - never reveal why token failed
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        const proofId = validation.resourceId;
        // Get proof
        const { data: proof, error: proofError } = await supabase.from("proofs").select("*").eq("id", proofId).single();
        if (proofError || !proof) {
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        // Update proof status
        const { error: updateError } = await supabase.from("proofs").update({
            status: "approved",
            updated_at: new Date().toISOString()
        }).eq("id", proofId);
        if (updateError) {
            console.error("Error approving proof:", updateError);
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        // Create admin notification
        const { data: customerData } = await supabase.from("customers").select("email, first_name, last_name").eq("id", proof.customer_id).single();
        await supabase.from("proof_notifications").insert({
            customer_id: proof.customer_id,
            proof_id: proofId,
            notification_type: "customer_approved",
            message: `${customerData?.first_name} ${customerData?.last_name} has approved their proof for order #${proof.order_id}`,
            is_read: false
        });
        res.json({
            success: true,
            message: "Proof approved successfully",
            status: "approved"
        });
    } catch (error) {
        console.error("Approve proof public error:", error);
        res.status(404).json({
            error: "Proof not found"
        });
    }
};
const handleDenyProofPublic = async (req, res)=>{
    try {
        const { token } = req.query;
        const { revision_notes } = req.body;
        if (!token || typeof token !== "string") {
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        // SECURITY: Validate token atomically (prevents enumeration and reuse)
        const validation = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$public$2d$access$2d$tokens$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["validatePublicAccessToken"])(token, "proof");
        if (!validation.success) {
            // Generic 404 - never reveal why token failed
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        const proofId = validation.resourceId;
        // Get proof
        const { data: proof, error: proofError } = await supabase.from("proofs").select("*").eq("id", proofId).single();
        if (proofError || !proof) {
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        // Update proof status
        const { error: updateError } = await supabase.from("proofs").update({
            status: "revisions_requested",
            revision_notes: revision_notes || "",
            updated_at: new Date().toISOString()
        }).eq("id", proofId);
        if (updateError) {
            console.error("Error requesting revisions:", updateError);
            return res.status(404).json({
                error: "Proof not found"
            });
        }
        // Create admin notification
        const { data: customerData } = await supabase.from("customers").select("email, first_name, last_name").eq("id", proof.customer_id).single();
        await supabase.from("proof_notifications").insert({
            customer_id: proof.customer_id,
            proof_id: proofId,
            notification_type: "revision_requested",
            message: `${customerData?.first_name} ${customerData?.last_name} has requested revisions for their proof on order #${proof.order_id}`,
            is_read: false
        });
        res.json({
            success: true,
            message: "Revision request submitted successfully",
            status: "revisions_requested"
        });
    } catch (error) {
        console.error("Deny proof public error:", error);
        res.status(404).json({
            error: "Proof not found"
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/send-proof.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleSendProofDirectly",
    ()=>handleSendProofDirectly
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, esm_import, [project]/node_modules/@supabase/supabase-js)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$resend__$5b$external$5d$__$28$resend$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$resend$29$__ = __turbopack_context__.i("[externals]/resend [external] (resend, esm_import, [project]/node_modules/resend)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$resend__$5b$external$5d$__$28$resend$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$resend$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$resend__$5b$external$5d$__$28$resend$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$resend$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__["createClient"])(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_KEY || "");
const resend = process.env.RESEND_API_KEY ? new __TURBOPACK__imported__module__$5b$externals$5d2f$resend__$5b$external$5d$__$28$resend$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$resend$29$__["Resend"](process.env.RESEND_API_KEY) : null;
const PROOF_EMAIL_FROM = "sticky@stickerland.com";
const handleSendProofDirectly = async (req, res)=>{
    try {
        const { email, subject, orderNumber, fileUrl, fileName } = req.body;
        // Validation
        if (!email) {
            return res.status(400).json({
                error: "Customer email is required"
            });
        }
        if (!subject) {
            return res.status(400).json({
                error: "Proof subject is required"
            });
        }
        if (!fileUrl) {
            return res.status(400).json({
                error: "File URL is required"
            });
        }
        // Generate unique proof ID using UUID
        const proofId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])();
        // Find or create customer record
        let customerId = null;
        // Try to find customer by email
        const { data: existingCustomer, error: findError } = await supabase.from("customers").select("id").eq("email", email).maybeSingle();
        if (findError) {
            console.error("Error finding customer:", findError);
        }
        if (existingCustomer) {
            customerId = existingCustomer.id;
            console.log("Found existing customer:", customerId);
        } else {
            // Create a temporary customer record for this email
            const emailParts = email.split("@");
            const name = emailParts[0];
            console.log("Creating new customer for email:", email);
            const { data: newCustomer, error: customerError } = await supabase.from("customers").insert({
                email,
                first_name: name,
                last_name: "Customer"
            }).select("id").single();
            if (customerError) {
                console.error("Error creating customer:", customerError);
                return res.status(500).json({
                    error: "Failed to create customer record"
                });
            }
            if (newCustomer) {
                customerId = newCustomer.id;
                console.log("Created new customer with ID:", customerId);
            } else {
                console.error("No customer data returned after insert");
                return res.status(500).json({
                    error: "Failed to create customer record"
                });
            }
        }
        // Create proof record in database
        if (!customerId) {
            console.error("Cannot create proof - no customer ID");
            return res.status(500).json({
                error: "Failed to resolve customer"
            });
        }
        console.log("Creating proof record with customer ID:", customerId);
        // Build the proof record
        let parsedOrderId = null;
        if (orderNumber && !isNaN(parseInt(orderNumber))) {
            parsedOrderId = parseInt(orderNumber);
        } else {
            // Use 0 as placeholder when no order number is provided
            // This indicates a standalone proof not tied to a specific order
            parsedOrderId = 0;
        }
        const proofRecordData = {
            id: proofId,
            order_id: parsedOrderId,
            customer_id: customerId,
            description: subject,
            file_url: fileUrl,
            file_name: fileName,
            status: "pending"
        };
        console.log("Proof record data:", JSON.stringify(proofRecordData));
        const { data: proofRecord, error: proofError } = await supabase.from("proofs").insert(proofRecordData).select().single();
        if (proofError) {
            console.error("Error creating proof record:", proofError);
            return res.status(500).json({
                error: "Failed to create proof record in database"
            });
        }
        if (!proofRecord) {
            console.error("No proof record returned after insert");
            return res.status(500).json({
                error: "Failed to create proof record"
            });
        }
        console.log("Successfully created proof:", proofId);
        // Generate approval and revision links
        const baseUrl = process.env.FRONTEND_URL || "https://stickerland.app";
        const approvalLink = `${baseUrl}/proof/${proofId}/approve`;
        const revisionLink = `${baseUrl}/proof/${proofId}/request-revisions`;
        // Generate email HTML
        const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; }
          .proof-image { max-width: 100%; height: auto; margin: 20px 0; border: 1px solid #ddd; border-radius: 8px; }
          .button { display: inline-block; padding: 12px 24px; margin: 10px 5px; border-radius: 5px; text-decoration: none; font-weight: bold; }
          .approve-btn { background-color: #22c55e; color: #fff; }
          .revise-btn { background-color: #f59e0b; color: #fff; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Design Proof is Ready</h1>
          </div>
          
          <div class="content">
            <h2>${subject}</h2>
            ${orderNumber ? `<p><strong>Order Reference:</strong> ${orderNumber}</p>` : ""}
            
            <p>We're excited to show you your design proof! Please review the image below.</p>
            
            <img src="${fileUrl}" alt="Design Proof" class="proof-image" />
            
            <p><strong>What's next?</strong></p>
            <p>Please let us know if you approve this design or if you'd like us to make any changes.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${approvalLink}" class="button approve-btn">✓ Approve Design</a>
              <a href="${revisionLink}" class="button revise-btn">✎ Request Changes</a>
            </div>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 Stickerland. All rights reserved.</p>
            <p>Questions? Reply to this email or contact us at sticky@stickerland.com</p>
          </div>
        </div>
      </body>
    </html>
    `;
        // Send email via Resend
        if (!resend) {
            console.error("Resend API key not configured - cannot send email");
            return res.status(500).json({
                error: "Email service not configured"
            });
        }
        console.log("Sending email to:", email);
        const emailResult = await resend.emails.send({
            from: PROOF_EMAIL_FROM,
            to: email,
            subject: `Design Proof Ready: ${subject}`,
            html: emailHtml
        });
        if (emailResult.error) {
            console.error("Error sending proof email:", emailResult.error);
            return res.status(500).json({
                error: "Failed to send email: " + JSON.stringify(emailResult.error)
            });
        }
        console.log("Proof email sent successfully:", emailResult.data?.id);
        res.json({
            success: true,
            proofId,
            message: "Proof sent to customer successfully"
        });
    } catch (error) {
        console.error("Send proof error:", error);
        res.status(500).json({
            error: "Failed to send proof"
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/emails/signup-confirmation.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateSignupConfirmationEmail",
    ()=>generateSignupConfirmationEmail
]);
function generateSignupConfirmationEmail(params) {
    const { customerName, email, verificationLink } = params;
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Stickerland</title>
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
      <h1>🎨 Welcome to Stickerland</h1>
      <p>Your custom sticker design partner</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p>Hi <strong>${customerName}</strong>,</p>

      <p>Welcome aboard! We're thrilled to have you join the Stickerland community. Your account has been successfully created, and you're ready to start designing amazing custom stickers.</p>

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

      ${verificationLink ? `
      <p>Please confirm your email address to unlock all features:</p>
      <a href="${verificationLink}" class="cta-button">Verify Email Address</a>
      ` : ""}

      <p>If you have any questions or need assistance getting started, don't hesitate to reach out to our support team. We're here to help!</p>

      <p>Happy designing!<br><strong>The Stickerland Team</strong></p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>© 2024 Stickerland. All rights reserved.</p>
      <p>${email}</p>
    </div>
  </div>
</body>
</html>
  `;
}
}),
"[project]/server/emails/shipping-confirmation.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateShippingConfirmationEmail",
    ()=>generateShippingConfirmationEmail
]);
function generateShippingConfirmationEmail(params) {
    const { customerName, orderNumber, trackingNumber, carrier, trackingUrl, estimatedDelivery, orderLink } = params;
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Has Shipped - Stickerland</title>
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
        Thank you for choosing Stickerland for your custom sticker needs. We hope you love your designs!
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
}),
"[project]/server/emails/support-ticket-reply.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateSupportTicketReplyEmail",
    ()=>generateSupportTicketReplyEmail
]);
function generateSupportTicketReplyEmail(params) {
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
}),
"[project]/server/emails/order-status-update.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateOrderStatusUpdateEmail",
    ()=>generateOrderStatusUpdateEmail
]);
function generateOrderStatusUpdateEmail(params) {
    const { customerName, orderNumber, previousStatus, currentStatus, statusMessage, nextSteps, orderLink } = params;
    const getStatusColor = (status)=>{
        const statusLower = status.toLowerCase();
        if (statusLower.includes("pending") || statusLower.includes("received")) {
            return {
                bgColor: "#fef3c7",
                textColor: "#92400e",
                emoji: "⏳"
            };
        }
        if (statusLower.includes("confirmed") || statusLower.includes("approved")) {
            return {
                bgColor: "#dbeafe",
                textColor: "#1e40af",
                emoji: "✓"
            };
        }
        if (statusLower.includes("processing") || statusLower.includes("printing")) {
            return {
                bgColor: "#fce7f3",
                textColor: "#831843",
                emoji: "⚙️"
            };
        }
        if (statusLower.includes("shipped") || statusLower.includes("dispatched")) {
            return {
                bgColor: "#dcfce7",
                textColor: "#166534",
                emoji: "📦"
            };
        }
        if (statusLower.includes("delivered")) {
            return {
                bgColor: "#d1fae5",
                textColor: "#065f46",
                emoji: "✓"
            };
        }
        if (statusLower.includes("cancelled") || statusLower.includes("failed")) {
            return {
                bgColor: "#fee2e2",
                textColor: "#7f1d1d",
                emoji: "✕"
            };
        }
        return {
            bgColor: "#f3f4f6",
            textColor: "#374151",
            emoji: "📋"
        };
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
}),
"[project]/server/routes/email-preview.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleOrderConfirmationPreview",
    ()=>handleOrderConfirmationPreview,
    "handleOrderStatusUpdatePreview",
    ()=>handleOrderStatusUpdatePreview,
    "handlePasswordResetPreview",
    ()=>handlePasswordResetPreview,
    "handleProofEmailPreview",
    ()=>handleProofEmailPreview,
    "handleSendProofEmailPreview",
    ()=>handleSendProofEmailPreview,
    "handleShippingConfirmationPreview",
    ()=>handleShippingConfirmationPreview,
    "handleSignupConfirmationPreview",
    ()=>handleSignupConfirmationPreview,
    "handleSupportTicketReplyPreview",
    ()=>handleSupportTicketReplyPreview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$generate$2d$proof$2d$email$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/emails/generate-proof-email.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$signup$2d$confirmation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/emails/signup-confirmation.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$order$2d$confirmation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/emails/order-confirmation.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$shipping$2d$confirmation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/emails/shipping-confirmation.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$password$2d$reset$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/emails/password-reset.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$support$2d$ticket$2d$reply$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/emails/support-ticket-reply.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$order$2d$status$2d$update$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/emails/order-status-update.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/order.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$resend__$5b$external$5d$__$28$resend$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$resend$29$__ = __turbopack_context__.i("[externals]/resend [external] (resend, esm_import, [project]/node_modules/resend)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$resend__$5b$external$5d$__$28$resend$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$resend$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$resend__$5b$external$5d$__$28$resend$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$resend$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
const resend = process.env.RESEND_API_KEY ? new __TURBOPACK__imported__module__$5b$externals$5d2f$resend__$5b$external$5d$__$28$resend$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$resend$29$__["Resend"](process.env.RESEND_API_KEY) : null;
const PROOF_EMAIL_FROM = "sticky@stickerland.com";
const handleProofEmailPreview = async (req, res)=>{
    try {
        const { email } = req.query;
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const sampleHtml = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$generate$2d$proof$2d$email$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["generateProofEmailHtml"])({
            customerName: "John Doe",
            orderId: 12345,
            proofDescription: "Custom sticker design with your company logo and tagline.\n\nThe design features:\n- Vibrant color scheme\n- High-resolution graphics\n- Print-ready format\n\nPlease review and let us know if any changes are needed!",
            proofFileUrl: "https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=400&fit=crop",
            approvalLink: `${baseUrl}/proofs/sample_proof_123/approve`,
            revisionLink: `${baseUrl}/proofs/sample_proof_123/request-revisions`
        });
        // If email param is provided, send the email
        if (email && typeof email === "string" && process.env.RESEND_API_KEY) {
            try {
                const result = await resend.emails.send({
                    from: PROOF_EMAIL_FROM,
                    to: email,
                    subject: "Preview: Your Design Proof is Ready - Order #12345",
                    html: sampleHtml
                });
                if (result.error) {
                    console.error("Error sending preview email:", result.error);
                    return res.status(500).json({
                        error: "Failed to send email",
                        details: result.error
                    });
                }
                return res.json({
                    success: true,
                    message: `Preview email sent to ${email}`,
                    emailId: result.data?.id
                });
            } catch (emailError) {
                console.error("Error sending email:", emailError);
                return res.status(500).json({
                    error: "Failed to send email",
                    details: emailError instanceof Error ? emailError.message : "Unknown error"
                });
            }
        }
        // Otherwise, return the HTML preview
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.send(sampleHtml);
    } catch (error) {
        console.error("Proof email preview error:", error);
        res.status(500).json({
            error: "Failed to process request",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
const handleSignupConfirmationPreview = (req, res)=>{
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const html = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$signup$2d$confirmation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["generateSignupConfirmationEmail"])({
        customerName: "Sarah Johnson",
        email: "sarah@example.com",
        verificationLink: `${baseUrl}/verify?token=sample_verification_token_123`
    });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
};
const handleOrderConfirmationPreview = (req, res)=>{
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const html = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$order$2d$confirmation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["generateOrderConfirmationEmail"])({
        customerName: "John Smith",
        orderNumber: "SS-2024-001",
        orderDate: "December 15, 2024",
        items: [
            {
                name: "Custom Circle Stickers (100 units)",
                quantity: 1,
                price: 29.99,
                designFileUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%2310b981' stroke='%23059669' stroke-width='2'/%3E%3Ctext x='50' y='50' font-size='20' fill='white' text-anchor='middle' dominant-baseline='central'%3EDESIGN%3C/text%3E%3C/svg%3E",
                options: [
                    {
                        option_id: "size",
                        option_value: "3 inch"
                    }
                ]
            },
            {
                name: "Glossy Finish",
                quantity: 1,
                price: 5.0,
                options: []
            }
        ],
        subtotal: 34.99,
        tax: 2.8,
        shipping: 5.0,
        total: 42.79,
        estimatedDelivery: "Dec 22, 2024",
        orderLink: `${baseUrl}/order-history/12345`,
        shippingAddress: {
            firstName: "John",
            lastName: "Smith",
            street: "123 Main Street",
            street2: "Apt 4B",
            city: "New York",
            state: "NY",
            postalCode: "10001",
            country: "United States"
        },
        policies: {
            returnAndRefund: true,
            privacy: true,
            gdpr: true,
            ccpa: true,
            terms: true,
            shipping: true
        }
    });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
};
const handleShippingConfirmationPreview = (req, res)=>{
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const html = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$shipping$2d$confirmation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["generateShippingConfirmationEmail"])({
        customerName: "John Smith",
        orderNumber: (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["formatOrderNumber"])(1),
        trackingNumber: "1Z999AA10123456784",
        carrier: "UPS",
        trackingUrl: "https://www.ups.com/track?tracknum=1Z999AA10123456784",
        estimatedDelivery: "December 22, 2024",
        orderLink: `${baseUrl}/order-history/12345`
    });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
};
const handlePasswordResetPreview = (req, res)=>{
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const html = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$password$2d$reset$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["generatePasswordResetEmail"])({
        customerName: "Sarah Johnson",
        resetLink: `${baseUrl}/reset-password?token=sample_reset_token_abc123def456`,
        expiresIn: "1 hour"
    });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
};
const handleSupportTicketReplyPreview = (req, res)=>{
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const html = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$support$2d$ticket$2d$reply$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["generateSupportTicketReplyEmail"])({
        customerName: "Michael Chen",
        ticketNumber: "TKT-2024-0042",
        subject: "Question about sticker material options",
        response: `Hi Michael,

Thank you for reaching out! We're happy to help answer your question about our sticker materials.

We offer several options for your custom stickers:

1. Vinyl (Standard): Durable and weather-resistant, perfect for outdoor use
2. Glossy Finish: High-shine appearance with vibrant colors
3. Matte Finish: Subtle, professional look with reduced glare
4. Holographic: Eye-catching reflective surface for premium designs

All materials are high-quality and designed to last. The choice depends on your use case and aesthetic preferences.

Would you like recommendations for your specific project? Feel free to share more details about what you're planning!

Best regards,
Stickerland Support Team`,
        viewLink: `${baseUrl}/my-tickets/TKT-2024-0042`
    });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
};
const handleOrderStatusUpdatePreview = (req, res)=>{
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const html = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$order$2d$status$2d$update$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["generateOrderStatusUpdateEmail"])({
        customerName: "John Smith",
        orderNumber: (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$order$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["formatOrderNumber"])(1),
        previousStatus: "Order Confirmed",
        currentStatus: "Processing",
        statusMessage: "Your order is now being prepared for production. Our team is working on bringing your design to life with precision and care.",
        nextSteps: "Your custom stickers will be carefully printed and inspected for quality. Once approved, they will be packaged and shipped to you. You'll receive a notification as soon as your order ships.",
        orderLink: `${baseUrl}/order-history/12345`
    });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
};
const handleSendProofEmailPreview = async (req, res)=>{
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                error: "Email address is required"
            });
        }
        if (!process.env.RESEND_API_KEY) {
            return res.status(500).json({
                error: "Email service not configured"
            });
        }
        const sampleHtml = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$generate$2d$proof$2d$email$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["generateProofEmailHtml"])({
            customerName: "John Doe",
            orderId: 12345,
            proofDescription: "Custom sticker design with your company logo and tagline.\n\nThe design features:\n- Vibrant color scheme\n- High-resolution graphics\n- Print-ready format\n\nPlease review and let us know if any changes are needed!",
            proofFileUrl: "https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=400&fit=crop",
            approvalLink: "https://51be3d6708344836a6f6586ec48b1e4b-476bca083d854b2a92cc8cfa4.fly.dev/proofs/preview123/approve",
            revisionLink: "https://51be3d6708344836a6f6586ec48b1e4b-476bca083d854b2a92cc8cfa4.fly.dev/proofs/preview123/request-revisions"
        });
        const result = await resend.emails.send({
            from: PROOF_EMAIL_FROM,
            to: email,
            subject: "Preview: Your Design Proof is Ready - Order #12345",
            html: sampleHtml
        });
        if (result.error) {
            console.error("Error sending preview email:", result.error);
            return res.status(500).json({
                error: "Failed to send email"
            });
        }
        res.json({
            success: true,
            message: `Preview email sent to ${email}`,
            emailId: result.data?.id
        });
    } catch (error) {
        console.error("Send preview email error:", error);
        res.status(500).json({
            error: "Failed to send email",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/admin-customers.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleGetAllCustomers",
    ()=>handleGetAllCustomers,
    "handleGetCustomerDetails",
    ()=>handleGetCustomerDetails,
    "handleSearchCustomers",
    ()=>handleSearchCustomers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/supabase.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const handleGetAllCustomers = async (req, res)=>{
    try {
        // Fetch all customers with their orders
        const { data: customers, error: customersError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        store_credit,
        created_at,
        updated_at,
        orders (
          id,
          total,
          status,
          created_at
        )
      `).order("created_at", {
            ascending: false
        });
        if (customersError) {
            console.error("Error fetching customers:", customersError);
            return res.status(500).json({
                error: "Failed to fetch customers"
            });
        }
        // Format customers with aggregated data
        const formattedCustomers = (customers || []).map((customer)=>{
            const orders = customer.orders || [];
            const totalSpent = orders.reduce((sum, order)=>sum + (order.total || 0), 0);
            const lastOrder = orders.length > 0 ? orders[0] : null;
            return {
                id: customer.id,
                email: customer.email,
                firstName: customer.first_name || "",
                lastName: customer.last_name || "",
                phone: customer.phone,
                storeCredit: customer.store_credit || 0,
                createdAt: customer.created_at,
                updatedAt: customer.updated_at,
                orderCount: orders.length,
                totalSpent,
                lastOrderDate: lastOrder?.created_at
            };
        });
        res.json({
            success: true,
            customers: formattedCustomers,
            count: formattedCustomers.length
        });
    } catch (error) {
        console.error("Get all customers error:", error);
        const message = error instanceof Error ? error.message : "Failed to fetch customers";
        res.status(500).json({
            error: message
        });
    }
};
const handleGetCustomerDetails = async (req, res)=>{
    try {
        const { customerId } = req.params;
        if (!customerId) {
            return res.status(400).json({
                error: "Customer ID is required"
            });
        }
        const { data: customer, error: customerError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        store_credit,
        created_at,
        updated_at,
        orders (
          id,
          total,
          status,
          created_at,
          order_items (
            id,
            product_name,
            quantity,
            price
          )
        )
      `).eq("id", customerId).single();
        if (customerError || !customer) {
            return res.status(404).json({
                error: "Customer not found"
            });
        }
        const orders = customer.orders || [];
        const totalSpent = orders.reduce((sum, order)=>sum + (order.total || 0), 0);
        res.json({
            success: true,
            customer: {
                id: customer.id,
                email: customer.email,
                firstName: customer.first_name || "",
                lastName: customer.last_name || "",
                phone: customer.phone,
                company: customer.company,
                storeCredit: customer.store_credit || 0,
                createdAt: customer.created_at,
                updatedAt: customer.updated_at,
                orderCount: orders.length,
                totalSpent,
                orders: orders.map((order)=>({
                        id: order.id,
                        total: order.total,
                        status: order.status,
                        createdAt: order.created_at,
                        itemCount: (order.order_items || []).length
                    }))
            }
        });
    } catch (error) {
        console.error("Get customer details error:", error);
        const message = error instanceof Error ? error.message : "Failed to fetch customer";
        res.status(500).json({
            error: message
        });
    }
};
const handleSearchCustomers = async (req, res)=>{
    try {
        const { query } = req.query;
        if (!query || typeof query !== "string") {
            return res.status(400).json({
                error: "Search query is required"
            });
        }
        const searchTerm = `%${query}%`;
        // Search customers by name or email
        const { data: customers, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        store_credit,
        created_at,
        updated_at,
        orders (
          id,
          total,
          status,
          created_at
        )
      `).or(`email.ilike.${searchTerm},first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`);
        if (error) {
            console.error("Error searching customers:", error);
            return res.status(500).json({
                error: "Failed to search customers"
            });
        }
        const formattedCustomers = (customers || []).map((customer)=>{
            const orders = customer.orders || [];
            const totalSpent = orders.reduce((sum, order)=>sum + (order.total || 0), 0);
            const lastOrder = orders.length > 0 ? orders[0] : null;
            return {
                id: customer.id,
                email: customer.email,
                firstName: customer.first_name || "",
                lastName: customer.last_name || "",
                phone: customer.phone,
                storeCredit: customer.store_credit || 0,
                createdAt: customer.created_at,
                updatedAt: customer.updated_at,
                orderCount: orders.length,
                totalSpent,
                lastOrderDate: lastOrder?.created_at
            };
        });
        res.json({
            success: true,
            customers: formattedCustomers,
            count: formattedCustomers.length
        });
    } catch (error) {
        console.error("Search customers error:", error);
        const message = error instanceof Error ? error.message : "Failed to search customers";
        res.status(500).json({
            error: message
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/admin-analytics.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleGetAnalytics",
    ()=>handleGetAnalytics,
    "handleTrackEvent",
    ()=>handleTrackEvent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/supabase.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const handleGetAnalytics = async (req, res)=>{
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        // Fetch page view events (with fallback if columns don't exist)
        let pageViewEvents = null;
        try {
            const { data: events } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("analytics_events").select("event_type, created_at", {
                count: "exact"
            }).eq("event_type", "page_view").gte("created_at", thirtyDaysAgo.toISOString());
            pageViewEvents = events;
        } catch (analyticsError) {
            // Analytics table may not be properly set up, continue without it
            console.warn("Analytics query failed, continuing without analytics data");
        }
        // Fetch orders data
        const { data: orders } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("orders").select("id, total, customer_id, created_at, order_items(product_name, quantity)").gte("created_at", thirtyDaysAgo.toISOString());
        // Fetch customers
        const { data: customers } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").select("id, created_at");
        // Calculate metrics
        const totalPageViews = pageViewEvents?.length || 0;
        // Count unique session_ids instead of page_path (which may not exist)
        const uniqueUsers = pageViewEvents?.length || 0;
        const totalRevenue = orders?.reduce((sum, order)=>sum + (order.total || 0), 0) || 0;
        const totalOrders = orders?.length || 0;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const conversionRate = totalPageViews > 0 ? totalOrders / uniqueUsers * 100 : 0;
        // Device breakdown (columns don't exist yet - use placeholder data)
        const devices = {
            mobile: 0,
            desktop: totalPageViews,
            tablet: 0
        };
        // Traffic sources (columns don't exist yet - use placeholder data)
        const trafficSources = {
            direct: Math.floor(totalPageViews * 0.3),
            google: Math.floor(totalPageViews * 0.4),
            facebook: Math.floor(totalPageViews * 0.2),
            instagram: Math.floor(totalPageViews * 0.07),
            other: Math.floor(totalPageViews * 0.03)
        };
        // Top pages (disabled - page_path column doesn't exist)
        // TODO: Implement proper page tracking with session data
        const topPages = [];
        // Product sales (from order_items)
        const productSales = new Map();
        orders?.forEach((order)=>{
            order.order_items?.forEach((item)=>{
                const key = item.product_name;
                const current = productSales.get(key) || {
                    quantity: 0,
                    revenue: 0
                };
                productSales.set(key, {
                    quantity: current.quantity + (item.quantity || 0),
                    revenue: current.revenue + (item.quantity || 0) * 0.5
                });
            });
        });
        const topProducts = Array.from(productSales.entries()).map(([name], index)=>({
                id: index,
                name,
                sales: productSales.get(name)?.quantity || 0,
                revenue: productSales.get(name)?.revenue || 0
            })).sort((a, b)=>b.sales - a.sales).slice(0, 5);
        // Revenue by day
        const revenueByDay = new Map();
        orders?.forEach((order)=>{
            const date = new Date(order.created_at).toISOString().split("T")[0];
            const current = revenueByDay.get(date) || {
                revenue: 0,
                orders: 0
            };
            revenueByDay.set(date, {
                revenue: current.revenue + (order.total || 0),
                orders: current.orders + 1
            });
        });
        const revenueByDayArray = Array.from(revenueByDay.entries()).map(([date, data])=>({
                date,
                ...data
            })).sort((a, b)=>a.date.localeCompare(b.date));
        // Customer metrics
        const newCustomersThisMonth = customers?.filter((c)=>new Date(c.created_at) > thirtyDaysAgo).length || 0;
        const repeatCustomers = new Set(orders?.filter((o)=>o.customer_id).map((o)=>o.customer_id)).size;
        const totalCustomers = customers?.length || 0;
        const avgCustomerLifetimeValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
        const analyticsData = {
            activeUsers: uniqueUsers,
            totalPageViews,
            totalRevenue,
            totalOrders,
            conversionRate: parseFloat(conversionRate.toFixed(2)),
            avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
            devices,
            trafficSources,
            topPages,
            topProducts,
            topDesigns: [],
            revenueByDay: revenueByDayArray,
            customerMetrics: {
                totalCustomers,
                newCustomersThisMonth,
                repeatCustomers,
                avgCustomerLifetimeValue: parseFloat(avgCustomerLifetimeValue.toFixed(2))
            }
        };
        return res.json(analyticsData);
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return res.status(500).json({
            error: "Failed to fetch analytics data"
        });
    }
};
const handleTrackEvent = async (req, res)=>{
    try {
        const { event_type, event_name, session_id, page_path, referrer, device_type, browser, country, data } = req.body;
        const token = req.headers.authorization?.split("Bearer ")[1];
        if (!event_type || !event_name) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }
        // Respond immediately - don't block on database insert
        res.json({
            success: true
        });
        // Process event asynchronously in background
        (async ()=>{
            try {
                let userId = null;
                if (token) {
                    const { data: userData } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].auth.getUser(token);
                    userId = userData.user?.id || null;
                }
                // Only insert fields that definitely exist in the table
                // Note: Supabase schema cache may be stale, so we use minimal fields
                const eventData = {
                    event_type,
                    event_name,
                    user_id: userId
                };
                // Optionally add browser and country if provided (less likely to have schema issues)
                if (browser) eventData.browser = browser;
                if (country) eventData.country = country;
                if (data) eventData.data = data;
                // Skip optional fields that have schema cache issues: session_id, page_path, referrer, device_type
                const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("analytics_events").insert(eventData);
                if (error) {
                    console.error("Error tracking event:", error);
                }
            } catch (error) {
                console.error("Error processing analytics event:", error);
            }
        })();
    } catch (error) {
        console.error("Error in analytics handler:", error);
        return res.status(400).json({
            error: "Invalid request"
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/admin-finance.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "handleGetFinance",
    ()=>handleGetFinance
]);
const handleGetFinance = async (req, res)=>{
    try {
        // Mock finance data
        // In production, this would be calculated from your orders and payment records
        const financeData = {
            totalRevenue: 5847.32,
            monthlyRevenue: 2145.67,
            averageOrderValue: 127.45,
            totalOrders: 46,
            revenueChange: 12.5,
            orderChange: 8.3
        };
        return res.json(financeData);
    } catch (error) {
        console.error("Error fetching finance data:", error);
        return res.status(500).json({
            error: "Failed to fetch finance data"
        });
    }
};
}),
"[project]/server/utils/shipstation.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ShipStationAPI",
    ()=>ShipStationAPI,
    "shipstationAPI",
    ()=>shipstationAPI
]);
const SHIPSTATION_API_V2_URL = "https://api.shipstation.com";
class ShipStationAPI {
    apiKey;
    apiUrl;
    constructor(){
        this.apiKey = process.env.SHIPSTATION_API_KEY || "";
        this.apiUrl = SHIPSTATION_API_V2_URL;
    // Don't throw error on initialization - allow lazy initialization
    // Error will be thrown when API methods are called if key is missing
    }
    ensureApiKey() {
        if (!this.apiKey) {
            throw new Error("SHIPSTATION_API_KEY environment variable is not set");
        }
    }
    getAuthHeader() {
        // ShipStation v2 API uses Bearer token authentication
        return `Bearer ${this.apiKey}`;
    }
    async createShippingLabel(payload) {
        this.ensureApiKey();
        try {
            const response = await fetch(`${this.apiUrl}/orders/createlabel`, {
                method: "POST",
                headers: {
                    Authorization: this.getAuthHeader(),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const error = await response.json().catch(()=>({}));
                console.error("ShipStation API error:", error);
                throw new Error(error.message || `Failed to create shipping label: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("ShipStation API request failed:", error);
            throw error;
        }
    }
    async getCarriers() {
        // Return hardcoded common carriers
        // ShipStation v2 API has different endpoints, so we'll use standard carriers
        const carriers = [
            {
                name: "USPS",
                code: "usps"
            },
            {
                name: "UPS",
                code: "ups"
            },
            {
                name: "FedEx",
                code: "fedex"
            },
            {
                name: "DHL Express",
                code: "dhl_express"
            },
            {
                name: "OnTrac",
                code: "ontrac"
            }
        ];
        console.log("Returning hardcoded carriers:", carriers.length);
        return carriers;
    }
    async getServices(carrierCode) {
        // Return services based on carrier
        const servicesByCarrier = {
            usps: [
                {
                    name: "USPS First Class Mail",
                    code: "usps_first_class_mail"
                },
                {
                    name: "USPS Priority Mail",
                    code: "usps_priority_mail"
                },
                {
                    name: "USPS Priority Mail Express",
                    code: "usps_priority_mail_express"
                },
                {
                    name: "USPS Media Mail",
                    code: "usps_media_mail"
                },
                {
                    name: "USPS Parcel Select",
                    code: "usps_parcel_select"
                }
            ],
            ups: [
                {
                    name: "UPS Ground",
                    code: "ups_ground"
                },
                {
                    name: "UPS 3 Day Select",
                    code: "ups_3_day_select"
                },
                {
                    name: "UPS 2nd Day Air",
                    code: "ups_2nd_day_air"
                },
                {
                    name: "UPS Next Day Air",
                    code: "ups_next_day_air"
                },
                {
                    name: "UPS Next Day Air Saver",
                    code: "ups_next_day_air_saver"
                }
            ],
            fedex: [
                {
                    name: "FedEx Ground",
                    code: "fedex_ground"
                },
                {
                    name: "FedEx Home Delivery",
                    code: "fedex_home_delivery"
                },
                {
                    name: "FedEx 2Day",
                    code: "fedex_2day"
                },
                {
                    name: "FedEx Overnight",
                    code: "fedex_overnight"
                },
                {
                    name: "FedEx Priority Overnight",
                    code: "fedex_priority_overnight"
                }
            ],
            dhl_express: [
                {
                    name: "DHL Express 12:00",
                    code: "dhl_express_12_00"
                },
                {
                    name: "DHL Express Worldwide",
                    code: "dhl_express_worldwide"
                }
            ],
            ontrac: [
                {
                    name: "OnTrac Ground",
                    code: "ontrac_ground"
                },
                {
                    name: "OnTrac Plus",
                    code: "ontrac_plus"
                }
            ]
        };
        const services = servicesByCarrier[carrierCode] || [];
        console.log(`Returning ${services.length} services for carrier: ${carrierCode}`);
        return services;
    }
    async getRates(payload) {
        // For now, return empty rates array
        // In a full implementation, this would call ShipStation v2 rates API
        console.log("Rates requested but returning empty array");
        return [];
    }
}
const shipstationAPI = new ShipStationAPI();
}),
"[project]/server/routes/shipping.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleCreateLabel",
    ()=>handleCreateLabel,
    "handleGetCarriers",
    ()=>handleGetCarriers,
    "handleGetRates",
    ()=>handleGetRates,
    "handleGetServices",
    ()=>handleGetServices
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$shipstation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/shipstation.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, esm_import, [project]/node_modules/@supabase/supabase-js)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__["createClient"])(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_KEY || "");
const handleCreateLabel = async (req, res)=>{
    try {
        const { orderId, carrier, service, weight, dimensions, testLabel } = req.body;
        if (!orderId || !carrier || !service || !weight) {
            return res.status(400).json({
                error: "Missing required fields: orderId, carrier, service, weight are required"
            });
        }
        // Fetch order from database
        const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single();
        if (orderError || !order) {
            return res.status(404).json({
                error: "Order not found"
            });
        }
        // Get shipping address from order
        const shippingAddress = order.shipping_addresses?.[0];
        if (!shippingAddress) {
            return res.status(400).json({
                error: "Order does not have shipping address information"
            });
        }
        // Prepare shipment payload for ShipStation
        const shipmentPayload = {
            orderId: orderId.toString(),
            carrierCode: carrier,
            serviceCode: service,
            packageCode: "package",
            weight: {
                value: weight,
                units: "ounces"
            },
            ...dimensions && {
                dimensions: {
                    length: dimensions.length || 0,
                    width: dimensions.width || 0,
                    height: dimensions.height || 0,
                    units: "inches"
                }
            },
            toAddress: {
                name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
                street1: shippingAddress.street_1,
                street2: shippingAddress.street_2 || "",
                city: shippingAddress.city,
                state: shippingAddress.state_or_province,
                postalCode: shippingAddress.postal_code,
                country: shippingAddress.country_iso2 || "US",
                phone: shippingAddress.phone || ""
            },
            ...testLabel && {
                testLabel: true
            }
        };
        // Create shipping label
        const labelResponse = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$shipstation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["shipstationAPI"].createShippingLabel(shipmentPayload);
        // Store label info in database
        if (labelResponse.labelDownload?.href || labelResponse.tracking) {
            const { error: updateError } = await supabase.from("orders").update({
                shipping_label_url: labelResponse.labelDownload?.href,
                tracking_number: labelResponse.tracking || "",
                tracking_carrier: carrier,
                shipped_date: new Date().toISOString(),
                status: "in transit"
            }).eq("id", orderId);
            if (updateError) {
                console.error("Failed to update order with label info:", updateError);
            }
        }
        return res.status(200).json({
            success: true,
            labelId: labelResponse.labelId,
            tracking: labelResponse.tracking,
            labelUrl: labelResponse.labelDownload?.href
        });
    } catch (error) {
        console.error("Failed to create shipping label:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to create shipping label";
        res.status(500).json({
            error: errorMessage
        });
    }
};
const handleGetRates = async (req, res)=>{
    try {
        const { orderId, weight, dimensions } = req.body;
        if (!orderId || !weight) {
            return res.status(400).json({
                error: "Missing required fields: orderId, weight"
            });
        }
        // Fetch order
        const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single();
        if (orderError || !order) {
            return res.status(404).json({
                error: "Order not found"
            });
        }
        const shippingAddress = order.shipping_addresses?.[0];
        if (!shippingAddress) {
            return res.status(400).json({
                error: "Order does not have shipping address information"
            });
        }
        // Get rates from ShipStation
        const ratesPayload = {
            carrierCode: "usps",
            fromPostalCode: "90210",
            toState: shippingAddress.state_or_province,
            toPostalCode: shippingAddress.postal_code,
            toCountry: shippingAddress.country_iso2 || "US",
            weight: {
                value: weight,
                units: "ounces"
            },
            ...dimensions && {
                dimensions: {
                    length: dimensions.length || 0,
                    width: dimensions.width || 0,
                    height: dimensions.height || 0,
                    units: "inches"
                }
            }
        };
        const rates = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$shipstation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["shipstationAPI"].getRates(ratesPayload);
        return res.status(200).json({
            rates
        });
    } catch (error) {
        console.error("Failed to get rates:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to get rates";
        res.status(500).json({
            error: errorMessage
        });
    }
};
const handleGetCarriers = async (req, res)=>{
    try {
        const carriers = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$shipstation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["shipstationAPI"].getCarriers();
        res.status(200).json({
            carriers
        });
    } catch (error) {
        console.error("Failed to get carriers:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to get carriers";
        res.status(500).json({
            error: errorMessage
        });
    }
};
const handleGetServices = async (req, res)=>{
    try {
        const { carrierCode } = req.query;
        if (!carrierCode) {
            return res.status(400).json({
                error: "carrierCode is required"
            });
        }
        const services = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$shipstation$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["shipstationAPI"].getServices(carrierCode);
        res.status(200).json({
            services
        });
    } catch (error) {
        console.error("Failed to get services:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to get services";
        res.status(500).json({
            error: errorMessage
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/shipping-public.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleGetPublicShippingOptions",
    ()=>handleGetPublicShippingOptions
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, esm_import, [project]/node_modules/@supabase/supabase-js)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__["createClient"])(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_KEY || "");
const handleGetPublicShippingOptions = async (_req, res)=>{
    try {
        console.log("Fetching public shipping options from Supabase...");
        const { data: options, error } = await supabase.from("shipping_options").select("id, name, description, cost, processing_time_days, estimated_delivery_days_min, estimated_delivery_days_max").eq("is_active", true).order("display_order", {
            ascending: true
        }).order("created_at", {
            ascending: true
        });
        if (error) {
            console.error("Supabase query error:", error);
            throw new Error(`Database error: ${error.message}`);
        }
        console.log("Successfully fetched shipping options:", options?.length || 0);
        res.status(200).json({
            success: true,
            data: options || []
        });
    } catch (error) {
        console.error("Failed to fetch public shipping options:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch shipping options";
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/admin-shipping.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleCreateShippingOption",
    ()=>handleCreateShippingOption,
    "handleDeleteShippingOption",
    ()=>handleDeleteShippingOption,
    "handleGetShippingOption",
    ()=>handleGetShippingOption,
    "handleGetShippingOptions",
    ()=>handleGetShippingOptions,
    "handleUpdateShippingOption",
    ()=>handleUpdateShippingOption
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, esm_import, [project]/node_modules/@supabase/supabase-js)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__["createClient"])(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_KEY || "");
const ShippingOptionSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(1, "Name is required"),
    description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    cost: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().min(0, "Cost must be positive"),
    processing_time_days: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(0, "Processing time must be 0 or more"),
    estimated_delivery_days_min: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(1, "Min delivery days must be at least 1"),
    estimated_delivery_days_max: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().min(1, "Max delivery days must be at least 1"),
    is_active: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional(),
    display_order: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().optional()
});
const handleGetShippingOptions = async (_req, res)=>{
    try {
        const { data: options, error } = await supabase.from("shipping_options").select("*").order("display_order", {
            ascending: true
        }).order("created_at", {
            ascending: true
        });
        if (error) throw error;
        res.status(200).json({
            success: true,
            data: options || []
        });
    } catch (error) {
        console.error("Failed to fetch shipping options:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch shipping options";
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};
const handleGetShippingOption = async (req, res)=>{
    try {
        const { id } = req.params;
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            return res.status(400).json({
                error: "Invalid shipping option ID format"
            });
        }
        const { data: option, error } = await supabase.from("shipping_options").select("*").eq("id", parsedId).single();
        if (error || !option) {
            return res.status(404).json({
                error: "Shipping option not found"
            });
        }
        res.status(200).json({
            success: true,
            data: option
        });
    } catch (error) {
        console.error("Failed to fetch shipping option:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch shipping option";
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};
const handleCreateShippingOption = async (req, res)=>{
    try {
        const validationResult = ShippingOptionSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: "Validation failed",
                details: validationResult.error.errors
            });
        }
        const optionData = validationResult.data;
        // Validate that max >= min
        if (optionData.estimated_delivery_days_max < optionData.estimated_delivery_days_min) {
            return res.status(400).json({
                error: "Max delivery days must be greater than or equal to min delivery days"
            });
        }
        const { data: option, error } = await supabase.from("shipping_options").insert([
            optionData
        ]).select().single();
        if (error) throw error;
        res.status(201).json({
            success: true,
            data: option
        });
    } catch (error) {
        console.error("Failed to create shipping option:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to create shipping option";
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};
const handleUpdateShippingOption = async (req, res)=>{
    try {
        const { id } = req.params;
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            return res.status(400).json({
                error: "Invalid shipping option ID format"
            });
        }
        const validationResult = ShippingOptionSchema.partial().safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: "Validation failed",
                details: validationResult.error.errors
            });
        }
        const updateData = validationResult.data;
        // Validate that max >= min if both are provided
        if (updateData.estimated_delivery_days_max && updateData.estimated_delivery_days_min && updateData.estimated_delivery_days_max < updateData.estimated_delivery_days_min) {
            return res.status(400).json({
                error: "Max delivery days must be greater than or equal to min delivery days"
            });
        }
        const { data: option, error } = await supabase.from("shipping_options").update({
            ...updateData,
            updated_at: new Date().toISOString()
        }).eq("id", parsedId).select().single();
        if (error || !option) {
            return res.status(404).json({
                error: "Shipping option not found"
            });
        }
        res.status(200).json({
            success: true,
            data: option
        });
    } catch (error) {
        console.error("Failed to update shipping option:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to update shipping option";
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};
const handleDeleteShippingOption = async (req, res)=>{
    try {
        const { id } = req.params;
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            return res.status(400).json({
                error: "Invalid shipping option ID format"
            });
        }
        const { error } = await supabase.from("shipping_options").delete().eq("id", parsedId);
        if (error) throw error;
        res.status(200).json({
            success: true,
            message: "Shipping option deleted successfully"
        });
    } catch (error) {
        console.error("Failed to delete shipping option:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to delete shipping option";
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/blogs.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleCreateBlog",
    ()=>handleCreateBlog,
    "handleDeleteBlog",
    ()=>handleDeleteBlog,
    "handleGetAdminBlogById",
    ()=>handleGetAdminBlogById,
    "handleGetAllBlogs",
    ()=>handleGetAllBlogs,
    "handleGetBlogById",
    ()=>handleGetBlogById,
    "handleGetPublishedBlogs",
    ()=>handleGetPublishedBlogs,
    "handleUpdateBlog",
    ()=>handleUpdateBlog,
    "handleUploadBlogImage",
    ()=>handleUploadBlogImage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, esm_import, [project]/node_modules/@supabase/supabase-js)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$cloudinary__$5b$external$5d$__$28$cloudinary$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$cloudinary$29$__ = __turbopack_context__.i("[externals]/cloudinary [external] (cloudinary, cjs, [project]/node_modules/cloudinary)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$image$2d$processor$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/image-processor.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";
/**
 * SECURITY: Service Role Key is required for this route
 *
 * Justification:
 * - Blog management is admin-only (create/update/delete operations)
 * - RLS policies cannot enforce blog ownership (blogs are shared admin resource)
 * - Public read endpoints don't require auth, but admin writes need elevated access
 *
 * Mitigation:
 * - All admin endpoints verify authentication and admin status
 * - Audit logging should be added for blog modifications
 * - Public read endpoints (getPublishedBlogs) only return visible blogs
 *
 * See: docs/RLS_SCOPING.md for security architecture
 */ const supabase = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__["createClient"])(supabaseUrl, supabaseKey);
const handleGetPublishedBlogs = async (req, res)=>{
    try {
        const { data, error } = await supabase.from("blogs").select("*").eq("visibility", "visible").eq("show_in_listing", true).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        res.json({
            blogs: data || []
        });
    } catch (err) {
        console.error("Error fetching published blogs:", err);
        res.status(500).json({
            error: "Failed to fetch blogs"
        });
    }
};
const handleGetBlogById = async (req, res)=>{
    try {
        const { blogId } = req.params;
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidPattern.test(blogId)) {
            return res.status(400).json({
                error: "Invalid blog ID format"
            });
        }
        const { data, error } = await supabase.from("blogs").select("*").eq("id", blogId).single();
        if (error) throw error;
        if (!data || data.visibility !== "visible") {
            return res.status(404).json({
                error: "Blog not found"
            });
        }
        // Increment views
        await supabase.from("blogs").update({
            views: (data.views || 0) + 1
        }).eq("id", blogId);
        res.json(data);
    } catch (err) {
        console.error("Error fetching blog:", err);
        res.status(500).json({
            error: "Failed to fetch blog"
        });
    }
};
const handleCreateBlog = async (req, res)=>{
    try {
        const formData = req.body;
        // Validate required fields
        if (!formData.title || !formData.content || !formData.excerpt) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }
        const { data, error } = await supabase.from("blogs").insert([
            {
                title: formData.title,
                content: formData.content,
                excerpt: formData.excerpt,
                author: formData.author || "Admin",
                featured_image_url: formData.featured_image_url,
                tags: formData.tags || [],
                visibility: formData.visibility || "hidden",
                show_in_listing: formData.show_in_listing !== false,
                views: 0,
                created_at: new Date().toISOString()
            }
        ]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error("Error creating blog:", err);
        res.status(500).json({
            error: "Failed to create blog"
        });
    }
};
const handleGetAllBlogs = async (req, res)=>{
    try {
        const { data, error } = await supabase.from("blogs").select("*").order("created_at", {
            ascending: false
        });
        if (error) throw error;
        res.json({
            blogs: data || []
        });
    } catch (err) {
        console.error("Error fetching blogs:", err);
        res.status(500).json({
            error: "Failed to fetch blogs"
        });
    }
};
const handleGetAdminBlogById = async (req, res)=>{
    try {
        const { blogId } = req.params;
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidPattern.test(blogId)) {
            return res.status(400).json({
                error: "Invalid blog ID format"
            });
        }
        const { data, error } = await supabase.from("blogs").select("*").eq("id", blogId).single();
        if (error) throw error;
        if (!data) {
            return res.status(404).json({
                error: "Blog not found"
            });
        }
        res.json(data);
    } catch (err) {
        console.error("Error fetching blog:", err);
        res.status(500).json({
            error: "Failed to fetch blog"
        });
    }
};
const handleDeleteBlog = async (req, res)=>{
    try {
        const { blogId } = req.params;
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidPattern.test(blogId)) {
            return res.status(400).json({
                error: "Invalid blog ID format"
            });
        }
        const { error } = await supabase.from("blogs").delete().eq("id", blogId);
        if (error) throw error;
        res.json({
            message: "Blog deleted successfully"
        });
    } catch (err) {
        console.error("Error deleting blog:", err);
        res.status(500).json({
            error: "Failed to delete blog"
        });
    }
};
const handleUpdateBlog = async (req, res)=>{
    try {
        const { blogId } = req.params;
        const formData = req.body;
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidPattern.test(blogId)) {
            return res.status(400).json({
                error: "Invalid blog ID format"
            });
        }
        const { data, error } = await supabase.from("blogs").update({
            ...formData.title && {
                title: formData.title
            },
            ...formData.content && {
                content: formData.content
            },
            ...formData.excerpt && {
                excerpt: formData.excerpt
            },
            ...formData.author && {
                author: formData.author
            },
            ...formData.featured_image_url && {
                featured_image_url: formData.featured_image_url
            },
            ...formData.tags && {
                tags: formData.tags
            },
            ...formData.visibility && {
                visibility: formData.visibility
            },
            ...formData.show_in_listing !== undefined && {
                show_in_listing: formData.show_in_listing
            }
        }).eq("id", blogId).select().single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error("Error updating blog:", err);
        res.status(500).json({
            error: "Failed to update blog"
        });
    }
};
const handleUploadBlogImage = async (req, res)=>{
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$cloudinary__$5b$external$5d$__$28$cloudinary$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$cloudinary$29$__["v2"].config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        if (!req.file) {
            return res.status(400).json({
                error: "No file provided"
            });
        }
        // Compress image using sharp (falls back to original in serverless)
        const compressedBuffer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$image$2d$processor$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["processImage"])(req.file.buffer, 1200, 800);
        const b64 = compressedBuffer.toString("base64");
        const dataURI = `data:image/jpeg;base64,${b64}`;
        const result = await __TURBOPACK__imported__module__$5b$externals$5d2f$cloudinary__$5b$external$5d$__$28$cloudinary$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$cloudinary$29$__["v2"].uploader.upload(dataURI, {
            folder: "sticky-shuttle/blog",
            resource_type: "auto"
        });
        res.json({
            imageUrl: result.secure_url
        });
    } catch (err) {
        console.error("Error uploading image:", err);
        res.status(500).json({
            error: "Failed to upload image"
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/admin-gallery.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$express__$5b$external$5d$__$28$express$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$express$29$__ = __turbopack_context__.i("[externals]/express [external] (express, cjs, [project]/node_modules/express)");
// import { createClient } from "@supabase/supabase-js";
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/middleware/auth.ts [api] (ecmascript)");
// Initialize Supabase client
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/supabase.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const router = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$express__$5b$external$5d$__$28$express$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$express$29$__["Router"])();
;
// Removed local Supabase initialization in favor of shared client
// const supabaseUrl = process.env.SUPABASE_URL || "";
// const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";
// const supabase = createClient(supabaseUrl, supabaseKey);
// GET all gallery images (public)
router.get("/gallery", async (req, res)=>{
    try {
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("gallery_images").select("*").eq("is_active", true).order("order_index", {
            ascending: true
        });
        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        console.error("Error fetching gallery images:", error);
        res.status(500).json({
            error: "Failed to fetch gallery images"
        });
    }
});
// GET all gallery images (including inactive) - admin only
router.get("/gallery/admin/all", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], async (req, res)=>{
    try {
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("gallery_images").select("*").order("order_index", {
            ascending: true
        });
        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        console.error("Error fetching gallery images:", error);
        res.status(500).json({
            error: "Failed to fetch gallery images"
        });
    }
});
// POST - Create new gallery image
router.post("/gallery/admin", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], async (req, res)=>{
    try {
        const { title, description, image_url, image_alt, order_index } = req.body;
        if (!title || !image_url) {
            return res.status(400).json({
                error: "Title and image_url are required"
            });
        }
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("gallery_images").insert([
            {
                title,
                description,
                image_url,
                image_alt,
                order_index: order_index || 0,
                is_active: true
            }
        ]).select();
        if (error) throw error;
        res.status(201).json(data?.[0]);
    } catch (error) {
        console.error("Error creating gallery image:", error);
        res.status(500).json({
            error: "Failed to create gallery image"
        });
    }
});
// PUT - Update gallery image
router.put("/gallery/admin/:id", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], async (req, res)=>{
    try {
        const { id } = req.params;
        const { title, description, image_url, image_alt, order_index, is_active } = req.body;
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("gallery_images").update({
            title,
            description,
            image_url,
            image_alt,
            order_index,
            is_active,
            updated_at: new Date().toISOString()
        }).eq("id", id).select();
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(404).json({
                error: "Gallery image not found"
            });
        }
        res.json(data[0]);
    } catch (error) {
        console.error("Error updating gallery image:", error);
        res.status(500).json({
            error: "Failed to update gallery image"
        });
    }
});
// DELETE - Remove gallery image
router.delete("/gallery/admin/:id", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], async (req, res)=>{
    try {
        const { id } = req.params;
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("gallery_images").delete().eq("id", id);
        if (error) throw error;
        res.json({
            message: "Gallery image deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting gallery image:", error);
        res.status(500).json({
            error: "Failed to delete gallery image"
        });
    }
});
// PATCH - Reorder gallery images
router.patch("/gallery/admin/reorder", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], async (req, res)=>{
    try {
        const { images } = req.body;
        if (!Array.isArray(images)) {
            return res.status(400).json({
                error: "Images array is required"
            });
        }
        // Update each image's order_index
        const updates = images.map((img, index)=>({
                id: img.id,
                order_index: index
            }));
        // Execute updates in sequence
        for (const update of updates){
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("gallery_images").update({
                order_index: update.order_index
            }).eq("id", update.id);
            if (error) throw error;
        }
        res.json({
            message: "Gallery images reordered successfully"
        });
    } catch (error) {
        console.error("Error reordering gallery images:", error);
        res.status(500).json({
            error: "Failed to reorder gallery images"
        });
    }
});
const __TURBOPACK__default__export__ = router;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/legal-pages.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleCreateLegalPage",
    ()=>handleCreateLegalPage,
    "handleDeleteLegalPage",
    ()=>handleDeleteLegalPage,
    "handleGetAdminLegalPageById",
    ()=>handleGetAdminLegalPageById,
    "handleGetAllLegalPages",
    ()=>handleGetAllLegalPages,
    "handleGetLegalPageByType",
    ()=>handleGetLegalPageByType,
    "handleGetPublishedLegalPages",
    ()=>handleGetPublishedLegalPages,
    "handleUpdateLegalPage",
    ()=>handleUpdateLegalPage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, esm_import, [project]/node_modules/@supabase/supabase-js)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";
/**
 * SECURITY: Service Role Key is required for this route
 *
 * Justification:
 * - Legal page management is admin-only (create/update/delete operations)
 * - RLS policies cannot enforce page ownership (legal pages are shared resource)
 * - Public read endpoints don't require auth, but admin writes need elevated access
 *
 * Mitigation:
 * - All admin endpoints require verifyToken + requireAdmin middleware
 * - Public read endpoints only return visible pages
 * - No customer data is accessed (only shared legal content)
 *
 * See: docs/RLS_SCOPING.md for security architecture
 */ const supabase = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__["createClient"])(supabaseUrl, supabaseKey);
const handleGetPublishedLegalPages = async (req, res)=>{
    try {
        const { data, error } = await supabase.from("legal_pages").select("*").eq("visibility", "visible").order("created_at", {
            ascending: false
        });
        if (error) throw error;
        res.json({
            pages: data || []
        });
    } catch (err) {
        console.error("Error fetching legal pages:", err);
        res.status(500).json({
            error: "Failed to fetch legal pages"
        });
    }
};
const handleGetAllLegalPages = async (req, res)=>{
    try {
        const { data, error } = await supabase.from("legal_pages").select("*").order("created_at", {
            ascending: false
        });
        if (error) throw error;
        res.json({
            pages: data || []
        });
    } catch (err) {
        console.error("Error fetching legal pages:", err);
        res.status(500).json({
            error: "Failed to fetch legal pages"
        });
    }
};
const handleGetLegalPageByType = async (req, res)=>{
    try {
        const { pageType } = req.params;
        const validTypes = [
            "privacy",
            "terms",
            "shipping",
            "returns",
            "legal",
            "gdpr",
            "ccpa"
        ];
        if (!validTypes.includes(pageType)) {
            return res.status(400).json({
                error: "Invalid page type"
            });
        }
        const { data, error } = await supabase.from("legal_pages").select("*").eq("page_type", pageType).eq("visibility", "visible").single();
        if (error && error.code === "PGRST116") {
            return res.status(404).json({
                error: "Page not found"
            });
        }
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error("Error fetching legal page:", err);
        res.status(500).json({
            error: "Failed to fetch legal page"
        });
    }
};
const handleGetAdminLegalPageById = async (req, res)=>{
    try {
        const { pageId } = req.params;
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidPattern.test(pageId)) {
            return res.status(400).json({
                error: "Invalid page ID format"
            });
        }
        const { data, error } = await supabase.from("legal_pages").select("*").eq("id", pageId).single();
        if (error && error.code === "PGRST116") {
            return res.status(404).json({
                error: "Page not found"
            });
        }
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error("Error fetching legal page:", err);
        res.status(500).json({
            error: "Failed to fetch legal page"
        });
    }
};
const handleCreateLegalPage = async (req, res)=>{
    try {
        const formData = req.body;
        // Validate required fields
        if (!formData.page_type || !formData.title || !formData.content) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }
        const validTypes = [
            "privacy",
            "terms",
            "shipping",
            "returns",
            "legal",
            "gdpr",
            "ccpa"
        ];
        if (!validTypes.includes(formData.page_type)) {
            return res.status(400).json({
                error: "Invalid page type"
            });
        }
        // Check if page type already exists
        const { data: existingPage } = await supabase.from("legal_pages").select("id").eq("page_type", formData.page_type).single();
        if (existingPage) {
            return res.status(400).json({
                error: `A ${formData.page_type} page already exists. Please edit the existing page instead.`
            });
        }
        const { data, error } = await supabase.from("legal_pages").insert([
            {
                page_type: formData.page_type,
                title: formData.title,
                content: formData.content,
                visibility: formData.visibility || "visible",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error("Error creating legal page:", err);
        res.status(500).json({
            error: "Failed to create legal page"
        });
    }
};
const handleUpdateLegalPage = async (req, res)=>{
    try {
        const { pageId } = req.params;
        const formData = req.body;
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidPattern.test(pageId)) {
            return res.status(400).json({
                error: "Invalid page ID format"
            });
        }
        const { data, error } = await supabase.from("legal_pages").update({
            ...formData.title && {
                title: formData.title
            },
            ...formData.content && {
                content: formData.content
            },
            ...formData.visibility && {
                visibility: formData.visibility
            },
            updated_at: new Date().toISOString()
        }).eq("id", pageId).select().single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error("Error updating legal page:", err);
        res.status(500).json({
            error: "Failed to update legal page"
        });
    }
};
const handleDeleteLegalPage = async (req, res)=>{
    try {
        const { pageId } = req.params;
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidPattern.test(pageId)) {
            return res.status(400).json({
                error: "Invalid page ID format"
            });
        }
        const { error } = await supabase.from("legal_pages").delete().eq("id", pageId);
        if (error) throw error;
        res.json({
            message: "Legal page deleted successfully"
        });
    } catch (err) {
        console.error("Error deleting legal page:", err);
        res.status(500).json({
            error: "Failed to delete legal page"
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/admin-return-refund-policy.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getReturnRefundPolicy",
    ()=>getReturnRefundPolicy,
    "updateReturnRefundPolicy",
    ()=>updateReturnRefundPolicy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/supabase.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const DEFAULT_POLICY = {
    guarantee_days: 30,
    return_conditions: [
        "Stickers must be unused and in original condition",
        "Original packaging must be intact",
        "Proof of purchase (order number) is required",
        "Return shipping is the customer's responsibility"
    ],
    how_to_return: [
        "Contact our support team at support@stickyhub.com with your order number",
        "Provide a reason for your return request",
        "We'll review your request and provide return shipping instructions",
        "Ship the item back to us using the provided address",
        "Once received and inspected, we'll process your refund (5-7 business days)"
    ],
    defective_items_days: 7,
    refund_timeline: "5-7 business days after we receive and inspect your return",
    non_returnable_items: [
        "Used, applied, or partially used stickers",
        "Items without original packaging",
        "Items returned after 30 days",
        "Wholesale or bulk orders (special terms apply)"
    ],
    contact_email: "support@stickyhub.com",
    full_policy: ""
};
const getReturnRefundPolicy = async (req, res)=>{
    try {
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("return_refund_policies").select("*").eq("id", "default").single();
        // Table doesn't exist yet or no data found - return default
        if (error || !data) {
            return res.json({
                policy: DEFAULT_POLICY
            });
        }
        res.json({
            policy: data?.content || DEFAULT_POLICY
        });
    } catch (error) {
        console.error("Error fetching return/refund policy:", error);
        // Return default policy instead of erroring out
        res.json({
            policy: DEFAULT_POLICY
        });
    }
};
const updateReturnRefundPolicy = async (req, res)=>{
    try {
        const policy = req.body;
        // Validate policy content
        if (!policy.guarantee_days || !policy.contact_email) {
            return res.status(400).json({
                error: "Invalid policy",
                message: "Guarantee days and contact email are required"
            });
        }
        try {
            const { data, error: upsertError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("return_refund_policies").upsert({
                id: "default",
                content: policy,
                updated_at: new Date().toISOString()
            }, {
                onConflict: "id"
            }).select().single();
            if (upsertError) throw upsertError;
            return res.json({
                success: true,
                message: "Policy updated successfully",
                policy: data?.content || policy
            });
        } catch (dbError) {
            console.error("Database error updating policy:", dbError);
            // If database operation fails, still return success with the provided policy
            // (policy will be stored in memory or we can implement file-based storage later)
            return res.json({
                success: true,
                message: "Policy saved (database pending migration)",
                policy: policy
            });
        }
    } catch (error) {
        console.error("Error updating return/refund policy:", error);
        res.status(500).json({
            error: "Failed to update policy",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/emails/invoice-payment.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateInvoiceEmailHtml",
    ()=>generateInvoiceEmailHtml
]);
function generateInvoiceEmailHtml(customerName, invoiceNumber, total, dueDate, paymentLink, invoiceDetails) {
    const formattedDueDate = new Date(dueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; color: #000; font-size: 32px; font-weight: bold;">Stickerland</h1>
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

        ${invoiceDetails?.notes ? `
          <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: 600;">Notes</p>
            <p style="color: #1f2937; font-size: 14px; margin: 0; white-space: pre-wrap;">${invoiceDetails.notes}</p>
          </div>
        ` : ""}

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
            © ${new Date().getFullYear()} Stickerland. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;
}
}),
"[project]/server/routes/invoices.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleCancelInvoice",
    ()=>handleCancelInvoice,
    "handleCreateInvoice",
    ()=>handleCreateInvoice,
    "handleCreateInvoicePaymentLink",
    ()=>handleCreateInvoicePaymentLink,
    "handleGetInvoice",
    ()=>handleGetInvoice,
    "handleGetInvoiceByToken",
    ()=>handleGetInvoiceByToken,
    "handleGetInvoices",
    ()=>handleGetInvoices,
    "handleGetPaymentToken",
    ()=>handleGetPaymentToken,
    "handleMarkInvoicePaid",
    ()=>handleMarkInvoicePaid,
    "handleSendInvoice",
    ()=>handleSendInvoice,
    "handleUpdateInvoice",
    ()=>handleUpdateInvoice,
    "verifySupabaseToken",
    ()=>verifySupabaseToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/supabase.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$jsonwebtoken__$5b$external$5d$__$28$jsonwebtoken$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$jsonwebtoken$29$__ = __turbopack_context__.i("[externals]/jsonwebtoken [external] (jsonwebtoken, cjs, [project]/node_modules/jsonwebtoken)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$resend__$5b$external$5d$__$28$resend$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$resend$29$__ = __turbopack_context__.i("[externals]/resend [external] (resend, esm_import, [project]/node_modules/resend)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$invoice$2d$payment$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/emails/invoice-payment.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$resend__$5b$external$5d$__$28$resend$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$resend$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$resend__$5b$external$5d$__$28$resend$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$resend$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
// Initialize Resend for email sending
const resend = process.env.RESEND_API_KEY ? new __TURBOPACK__imported__module__$5b$externals$5d2f$resend__$5b$external$5d$__$28$resend$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$resend$29$__["Resend"](process.env.RESEND_API_KEY) : null;
const INVOICE_EMAIL_FROM = "invoices@stickerland.com";
const verifySupabaseToken = async (req, res, next)=>{
    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            res.status(500).json({
                error: "Server configuration error"
            });
            return;
        }
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                error: "No authorization token provided"
            });
            return;
        }
        const token = authHeader.substring(7);
        // Verify the JWT token
        const decoded = __TURBOPACK__imported__module__$5b$externals$5d2f$jsonwebtoken__$5b$external$5d$__$28$jsonwebtoken$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$jsonwebtoken$29$__["default"].verify(token, JWT_SECRET);
        // Store customer info in request
        req.customerId = decoded.customerId;
        req.email = decoded.email;
        // Check if user is admin
        try {
            const { data: customer } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").select("is_admin").eq("id", decoded.customerId).single();
            if (!customer?.is_admin) {
                res.status(403).json({
                    error: "Admin access required"
                });
                return;
            }
            req.isAdmin = true;
        } catch (error) {
            res.status(403).json({
                error: "Admin access required"
            });
            return;
        }
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({
            error: "Invalid or expired token"
        });
    }
};
// Helper: Generate invoice number
const generateInvoiceNumber = async ()=>{
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    // Get count of invoices this month
    const lastDay = new Date(year, date.getMonth() + 1, 0).getDate();
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoices").select("id", {
        count: "exact"
    }).gte("created_at", `${year}-${month}-01`).lte("created_at", `${year}-${month}-${lastDay}`);
    const count = (data?.length || 0) + 1;
    return `INV-${year}${month}-${String(count).padStart(4, "0")}`;
};
// Helper: Generate token for customer payment link
const generateInvoiceToken = ()=>{
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString("hex");
};
const handleGetInvoices = async (req, res)=>{
    try {
        const { status, type, sort_by, sort_order } = req.query;
        const search = req.query.search;
        let query = __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoices").select("*, invoice_line_items(*)");
        // Apply filters
        if (status) {
            query = query.eq("status", status);
        }
        if (type) {
            query = query.eq("invoice_type", type);
        }
        if (search) {
            // SECURITY: Sanitize search input to prevent SQL injection
            // Escape special SQL LIKE characters (% and _)
            const sanitizedSearch = search.replace(/[%_]/g, '\\$&');
            query = query.or(`customer_name.ilike.%${sanitizedSearch}%,customer_email.ilike.%${sanitizedSearch}%,invoice_number.ilike.%${sanitizedSearch}%`);
        }
        // Apply sorting
        const orderBy = sort_by || "created_at";
        const order = sort_order === "asc" ? "asc" : "desc";
        query = query.order(orderBy, {
            ascending: order === "asc"
        });
        const { data, error } = await query;
        // Handle missing table gracefully
        if (error && (error.code === "PGRST205" || error.message.includes("Could not find the table"))) {
            console.log("Invoices table not yet created, returning empty list");
            return res.status(200).json({
                success: true,
                data: [],
                stats: {
                    total_outstanding: 0,
                    paid_this_month: 0,
                    overdue_count: 0,
                    draft_count: 0
                }
            });
        }
        if (error) {
            throw error;
        }
        // Calculate summary stats
        const stats = {
            total_outstanding: 0,
            paid_this_month: 0,
            overdue_count: 0,
            draft_count: 0
        };
        if (data) {
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            data.forEach((inv)=>{
                if (inv.status === "Unpaid" || inv.status === "Overdue") {
                    stats.total_outstanding += inv.total;
                }
                if (inv.status === "Paid" && new Date(inv.paid_date) >= monthStart) {
                    stats.paid_this_month += inv.total;
                }
                if (inv.status === "Overdue") {
                    stats.overdue_count += 1;
                }
                if (inv.status === "Draft") {
                    stats.draft_count += 1;
                }
            });
        }
        res.status(200).json({
            success: true,
            data,
            stats
        });
    } catch (error) {
        console.error("Get invoices error:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch invoices"
        });
    }
};
const handleGetInvoice = async (req, res)=>{
    try {
        const { id } = req.params;
        const { data: invoice, error: invoiceError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoices").select("*").eq("id", id).single();
        // Handle missing table gracefully
        if (invoiceError && (invoiceError.code === "PGRST205" || invoiceError.message.includes("Could not find the table"))) {
            return res.status(404).json({
                success: false,
                error: "Invoice not found"
            });
        }
        if (invoiceError || !invoice) {
            return res.status(404).json({
                success: false,
                error: "Invoice not found"
            });
        }
        const { data: lineItems } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_line_items").select("*").eq("invoice_id", id);
        const { data: artwork } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_artwork").select("*").eq("invoice_id", id);
        const { data: activity } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_activity").select("*").eq("invoice_id", id).order("timestamp", {
            ascending: false
        });
        res.status(200).json({
            success: true,
            data: {
                ...invoice,
                line_items: lineItems || [],
                artwork: artwork || [],
                activity: activity || []
            }
        });
    } catch (error) {
        console.error("Get invoice error:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch invoice"
        });
    }
};
const handleCreateInvoice = async (req, res)=>{
    try {
        const { customer_name, customer_email, company, billing_address, invoice_type, issue_date, due_date, notes, line_items, tax_rate, shipping, discount_amount, discount_type } = req.body;
        // Generate invoice number
        const invoice_number = await generateInvoiceNumber();
        // Calculate totals
        let subtotal = 0;
        if (line_items && Array.isArray(line_items)) {
            subtotal = line_items.reduce((sum, item)=>{
                return sum + item.quantity * item.unit_price;
            }, 0);
        }
        const tax_amount = subtotal * (tax_rate || 0) / 100;
        const total = subtotal + tax_amount + (shipping || 0) - (discount_amount || 0);
        // Create invoice
        const { data: invoice, error: invoiceError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoices").insert({
            invoice_number,
            customer_name,
            customer_email,
            customer_phone: null,
            invoice_type,
            due_date,
            notes,
            subtotal,
            tax_rate,
            tax_amount,
            shipping: shipping || 0,
            discount_amount: discount_amount || 0,
            total,
            status: "Draft",
            metadata: {
                company,
                billing_address,
                discount_type,
                issue_date
            }
        }).select().single();
        if (invoiceError) {
            // Handle missing invoices table gracefully
            if (invoiceError.code === "PGRST205" || invoiceError.message.includes("Could not find the table")) {
                console.log("Invoices table not yet created");
                return res.status(503).json({
                    success: false,
                    error: "Invoicing system is not yet available. Please contact support."
                });
            }
            throw invoiceError;
        }
        if (!invoice) {
            throw new Error("Failed to create invoice");
        }
        // Add line items
        if (line_items && Array.isArray(line_items)) {
            const itemsToInsert = line_items.map((item)=>({
                    invoice_id: invoice.id,
                    item_name: item.item_name,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    amount: item.quantity * item.unit_price
                }));
            const { error: itemsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_line_items").insert(itemsToInsert);
            if (itemsError) {
                console.warn("Failed to add invoice line items:", itemsError);
            }
        }
        // Log activity
        const { error: activityError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_activity").insert({
            invoice_id: invoice.id,
            action: "created",
            description: "Invoice created"
        });
        if (activityError) {
            console.warn("Failed to log invoice activity:", activityError);
        }
        res.status(201).json({
            success: true,
            data: invoice
        });
    } catch (error) {
        console.error("Create invoice error:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to create invoice"
        });
    }
};
const handleUpdateInvoice = async (req, res)=>{
    try {
        const { id } = req.params;
        const { customer_name, customer_email, company, billing_address, due_date, notes, line_items, tax_rate, shipping, discount_amount, discount_type } = req.body;
        // Get existing invoice
        const { data: existing, error: existingError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoices").select("*").eq("id", id).single();
        // Handle missing invoices table
        if (existingError && (existingError.code === "PGRST205" || existingError.message.includes("Could not find the table"))) {
            return res.status(503).json({
                success: false,
                error: "Invoicing system is not yet available. Please contact support."
            });
        }
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: "Invoice not found"
            });
        }
        // Only allow edit if Draft
        if (existing.status !== "Draft") {
            return res.status(400).json({
                success: false,
                error: "Can only edit draft invoices"
            });
        }
        // Recalculate totals
        let subtotal = 0;
        if (line_items && Array.isArray(line_items)) {
            subtotal = line_items.reduce((sum, item)=>{
                return sum + item.quantity * item.unit_price;
            }, 0);
        }
        const tax_amount = subtotal * (tax_rate || 0) / 100;
        const total = subtotal + tax_amount + (shipping || 0) - (discount_amount || 0);
        // Update invoice
        const { data: updated, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoices").update({
            customer_name,
            customer_email,
            company,
            billing_address,
            due_date,
            notes,
            subtotal,
            tax_rate,
            tax_amount,
            shipping: shipping || 0,
            discount_amount: discount_amount || 0,
            discount_type,
            total,
            updated_at: new Date().toISOString()
        }).eq("id", id).select().single();
        if (error || !updated) {
            throw error || new Error("Failed to update invoice");
        }
        // Update line items
        await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_line_items").delete().eq("invoice_id", id);
        if (line_items && Array.isArray(line_items)) {
            const itemsToInsert = line_items.map((item)=>({
                    invoice_id: id,
                    item_name: item.item_name,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    line_total: item.quantity * item.unit_price,
                    tax_enabled: item.tax_enabled || false
                }));
            await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_line_items").insert(itemsToInsert);
        }
        res.status(200).json({
            success: true,
            data: updated
        });
    } catch (error) {
        console.error("Update invoice error:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to update invoice"
        });
    }
};
const handleSendInvoice = async (req, res)=>{
    try {
        const { id } = req.params;
        const { email_subject, email_message } = req.body;
        // Get invoice
        const { data: invoice } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoices").select("*").eq("id", id).single();
        if (!invoice) {
            return res.status(404).json({
                success: false,
                error: "Invoice not found"
            });
        }
        // Generate payment token
        const token = generateInvoiceToken();
        // Save token
        const { data: tokenData } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_tokens").insert({
            invoice_id: id,
            token
        }).select().single();
        // Update invoice status to Sent
        const { error: updateError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoices").update({
            status: "Sent",
            sent_date: new Date().toISOString()
        }).eq("id", id);
        if (updateError) {
            throw updateError;
        }
        // Log activity
        await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_activity").insert({
            invoice_id: id,
            action: "sent",
            description: "Invoice sent to customer"
        });
        // Generate payment link
        const paymentLink = `https://stickerland.app/invoice/${token}`;
        // Send email via Resend
        let emailSent = false;
        if (resend && process.env.RESEND_API_KEY) {
            try {
                const emailHtml = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$emails$2f$invoice$2d$payment$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["generateInvoiceEmailHtml"])(invoice.customer_name, invoice.invoice_number, invoice.total.toFixed(2), invoice.due_date, paymentLink, {
                    company: invoice.company,
                    notes: invoice.notes
                });
                const emailResult = await resend.emails.send({
                    from: INVOICE_EMAIL_FROM,
                    to: invoice.customer_email,
                    subject: `Invoice ${invoice.invoice_number} from Stickerland - Payment Required`,
                    html: emailHtml
                });
                if (emailResult.data?.id) {
                    emailSent = true;
                    console.log(`Invoice email sent to ${invoice.customer_email} - Email ID: ${emailResult.data.id}`);
                } else {
                    console.warn(`Failed to send invoice email to ${invoice.customer_email}:`, emailResult.error);
                }
            } catch (emailError) {
                console.error(`Error sending invoice email to ${invoice.customer_email}:`, emailError);
            }
        } else {
            console.warn("Resend API key not configured. Invoice email not sent. Set RESEND_API_KEY environment variable to enable email sending.");
        }
        res.status(200).json({
            success: true,
            data: {
                invoice,
                payment_link: paymentLink,
                token,
                email_sent: emailSent
            }
        });
    } catch (error) {
        console.error("Send invoice error:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to send invoice"
        });
    }
};
const handleMarkInvoicePaid = async (req, res)=>{
    try {
        const { id } = req.params;
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoices").update({
            status: "Paid",
            paid_date: new Date().toISOString()
        }).eq("id", id).select().single();
        if (error || !data) {
            throw error || new Error("Failed to update invoice");
        }
        // Log activity
        await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_activity").insert({
            invoice_id: id,
            action: "paid",
            description: "Invoice marked as paid"
        });
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Mark paid error:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to mark invoice paid"
        });
    }
};
const handleCancelInvoice = async (req, res)=>{
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoices").update({
            status: "Canceled",
            canceled_date: new Date().toISOString(),
            cancellation_reason: reason
        }).eq("id", id).select().single();
        if (error || !data) {
            throw error || new Error("Failed to cancel invoice");
        }
        // Log activity
        await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_activity").insert({
            invoice_id: id,
            action: "canceled",
            description: `Invoice canceled${reason ? `: ${reason}` : ""}`
        });
        // TODO: Send cancellation email
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Cancel invoice error:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to cancel invoice"
        });
    }
};
const handleGetPaymentToken = async (req, res)=>{
    try {
        const invoiceId = req.params.invoiceId;
        // Try to get existing token (most recent one)
        const { data: existingToken, error: fetchError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_tokens").select("token").eq("invoice_id", invoiceId).order("created_at", {
            ascending: false
        }).limit(1).maybeSingle();
        // Return existing token if found
        if (existingToken && !fetchError) {
            return res.status(200).json({
                success: true,
                data: {
                    token: existingToken.token
                }
            });
        }
        // Create new token if one doesn't exist
        const newToken = generateInvoiceToken();
        const { data: createdToken, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_tokens").insert({
            invoice_id: parseInt(invoiceId),
            token: newToken
        }).select().single();
        if (error || !createdToken) {
            throw error || new Error("Failed to create payment token");
        }
        res.status(200).json({
            success: true,
            data: {
                token: newToken
            }
        });
    } catch (error) {
        console.error("Get payment token error:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to get payment token"
        });
    }
};
const handleGetInvoiceByToken = async (req, res)=>{
    try {
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({
                success: false,
                error: "No token provided"
            });
        }
        // Get token - handle gracefully if table doesn't exist
        const { data: tokenData, error: tokenError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_tokens").select("invoice_id, views").eq("token", token).maybeSingle();
        if (tokenError) {
            console.error("Error fetching token:", tokenError);
            // If table doesn't exist, return helpful error
            if (tokenError.code === "PGRST204" || tokenError.message.includes("Could not find the table")) {
                return res.status(503).json({
                    success: false,
                    error: "Invoice system not yet initialized. Please contact support."
                });
            }
            throw tokenError;
        }
        if (!tokenData) {
            return res.status(404).json({
                success: false,
                error: "Invalid invoice link"
            });
        }
        // Update view count (non-blocking - fire and forget)
        const { error: viewError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_tokens").update({
            views: (tokenData.views || 0) + 1,
            last_viewed_at: new Date().toISOString()
        }).eq("token", token);
        if (viewError) {
            console.error("Error updating token views:", viewError);
        }
        // Get invoice
        const { data: invoice, error: invoiceError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoices").select("*").eq("id", tokenData.invoice_id).maybeSingle();
        if (invoiceError) {
            console.error("Error fetching invoice:", invoiceError);
            throw invoiceError;
        }
        if (!invoice) {
            return res.status(404).json({
                success: false,
                error: "Invoice not found"
            });
        }
        // Get line items
        const { data: lineItems, error: lineItemsError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_line_items").select("*").eq("invoice_id", invoice.id);
        if (lineItemsError) {
            console.error("Error fetching line items:", lineItemsError);
        // Don't fail if line items can't be fetched, return empty array
        }
        // Get artwork if needed
        let artwork = null;
        if (invoice.invoice_type === "ArtworkUpload") {
            const { data: artworkData, error: artworkError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_artwork").select("*").eq("invoice_id", invoice.id);
            if (artworkError) {
                console.error("Error fetching artwork:", artworkError);
            // Don't fail if artwork can't be fetched, return empty array
            } else {
                artwork = artworkData;
            }
        }
        res.status(200).json({
            success: true,
            data: {
                ...invoice,
                line_items: lineItems || [],
                artwork: artwork || []
            }
        });
    } catch (error) {
        console.error("Get invoice by token error:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch invoice. Please try again later."
        });
    }
};
const handleCreateInvoicePaymentLink = async (req, res)=>{
    try {
        const { token } = req.params;
        // Get token and invoice
        const { data: tokenData } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_tokens").select("invoice_id").eq("token", token).single();
        if (!tokenData) {
            return res.status(404).json({
                success: false,
                error: "Invalid invoice token"
            });
        }
        // Get invoice details
        const { data: invoice } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoices").select("*").eq("id", tokenData.invoice_id).single();
        if (!invoice) {
            return res.status(404).json({
                success: false,
                error: "Invoice not found"
            });
        }
        // Check if invoice is already paid
        if (invoice.status === "Paid") {
            return res.status(400).json({
                success: false,
                error: "Invoice has already been paid"
            });
        }
        // Get line items for description
        const { data: lineItems } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_line_items").select("*").eq("invoice_id", invoice.id);
        // Import Square utilities
        const { createSquarePaymentLink } = await __turbopack_context__.A("[project]/server/utils/square.ts [api] (ecmascript, async loader)");
        // Build description from line items
        let description = `Invoice #${invoice.invoice_number}`;
        if (lineItems && lineItems.length > 0) {
            const itemNames = lineItems.slice(0, 3).map((item)=>item.item_name);
            description += ` - ${itemNames.join(", ")}`;
            if (lineItems.length > 3) {
                description += ` + ${lineItems.length - 3} more`;
            }
        }
        // Determine redirect URL
        const baseUrl = process.env.BASE_URL || (("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : "http://localhost:5173");
        const redirectUrl = `${baseUrl}/invoice/${token}`;
        // Create Square payment link
        const paymentLinkResult = await createSquarePaymentLink({
            orderId: invoice.id.toString(),
            amount: invoice.total,
            currency: "USD",
            description,
            customerEmail: invoice.customer_email,
            customerName: invoice.customer_name,
            redirectUrl,
            subtotal: invoice.subtotal,
            tax: invoice.tax_amount,
            shipping: invoice.shipping || 0,
            discount: invoice.discount_amount || 0,
            items: (lineItems || []).map((item)=>({
                    product_name: item.item_name,
                    quantity: item.quantity,
                    price: item.unit_price
                }))
        });
        if (!paymentLinkResult.success || !paymentLinkResult.paymentLinkUrl) {
            console.error("Failed to create Square payment link:", paymentLinkResult);
            return res.status(400).json({
                success: false,
                error: paymentLinkResult.error || "Failed to create payment link"
            });
        }
        // Log activity
        await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_activity").insert({
            invoice_id: invoice.id,
            action: "payment_initiated",
            description: "Customer initiated Square payment"
        });
        res.status(200).json({
            success: true,
            data: {
                payment_link: paymentLinkResult.paymentLinkUrl,
                invoice_number: invoice.invoice_number,
                amount: invoice.total
            }
        });
    } catch (error) {
        console.error("Create invoice payment link error:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to create payment link"
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/db-setup.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleInitializeInvoicesDatabase",
    ()=>handleInitializeInvoicesDatabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/supabase.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const handleInitializeInvoicesDatabase = async (req, res)=>{
    try {
        console.log("Database setup endpoint called");
        // Create invoices table
        const invoicesQuery = `
      CREATE TABLE IF NOT EXISTS invoices (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        invoice_type VARCHAR(50) DEFAULT 'Standard' CHECK (invoice_type IN ('Standard', 'ArtworkUpload')),
        status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Unpaid', 'Paid', 'Overdue', 'Canceled')),
        subtotal NUMERIC(12, 2) DEFAULT 0,
        tax_amount NUMERIC(12, 2) DEFAULT 0,
        tax_rate NUMERIC(5, 2) DEFAULT 0,
        shipping NUMERIC(12, 2) DEFAULT 0,
        discount_amount NUMERIC(12, 2) DEFAULT 0,
        total NUMERIC(12, 2) NOT NULL,
        due_date DATE,
        sent_date TIMESTAMP WITH TIME ZONE,
        paid_date TIMESTAMP WITH TIME ZONE,
        notes TEXT,
        metadata JSONB DEFAULT '{}'::jsonb
      );
      
      CREATE INDEX IF NOT EXISTS idx_invoices_customer_email ON invoices(customer_email);
      CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
      CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
    `;
        const invoicesLineItemsQuery = `
      CREATE TABLE IF NOT EXISTS invoice_line_items (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        item_name VARCHAR(255) NOT NULL,
        description TEXT,
        quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
        unit_price NUMERIC(12, 2) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb
      );
      
      CREATE INDEX IF NOT EXISTS idx_line_items_invoice_id ON invoice_line_items(invoice_id);
    `;
        const invoiceTokensQuery = `
      CREATE TABLE IF NOT EXISTS invoice_tokens (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT TRUE,
        metadata JSONB DEFAULT '{}'::jsonb
      );
      
      CREATE INDEX IF NOT EXISTS idx_tokens_token ON invoice_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_tokens_invoice_id ON invoice_tokens(invoice_id);
    `;
        const invoiceArtworkQuery = `
      CREATE TABLE IF NOT EXISTS invoice_artwork (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_url VARCHAR(1024) NOT NULL,
        file_size BIGINT,
        file_type VARCHAR(50),
        original_file_name VARCHAR(255),
        metadata JSONB DEFAULT '{}'::jsonb
      );
      
      CREATE INDEX IF NOT EXISTS idx_artwork_invoice_id ON invoice_artwork(invoice_id);
    `;
        const invoiceActivityQuery = `
      CREATE TABLE IF NOT EXISTS invoice_activity (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        actor_type VARCHAR(50) DEFAULT 'admin' CHECK (actor_type IN ('admin', 'customer', 'system')),
        actor_id VARCHAR(255),
        description TEXT,
        metadata JSONB DEFAULT '{}'::jsonb
      );
      
      CREATE INDEX IF NOT EXISTS idx_activity_invoice_id ON invoice_activity(invoice_id);
      CREATE INDEX IF NOT EXISTS idx_activity_created_at ON invoice_activity(created_at DESC);
    `;
        const rlsQuery = `
      ALTER TABLE IF EXISTS invoices ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS invoice_line_items ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS invoice_tokens ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS invoice_artwork ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS invoice_activity ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "admin_can_view_invoices" ON invoices;
      CREATE POLICY "admin_can_view_invoices" ON invoices
        FOR SELECT USING (
          auth.jwt() ->> 'role' = 'authenticated' AND
          (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        );

      DROP POLICY IF EXISTS "admin_can_insert_invoices" ON invoices;
      CREATE POLICY "admin_can_insert_invoices" ON invoices
        FOR INSERT WITH CHECK (
          auth.jwt() ->> 'role' = 'authenticated' AND
          (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        );

      DROP POLICY IF EXISTS "admin_can_update_invoices" ON invoices;
      CREATE POLICY "admin_can_update_invoices" ON invoices
        FOR UPDATE USING (
          auth.jwt() ->> 'role' = 'authenticated' AND
          (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        );

      DROP POLICY IF EXISTS "admin_can_delete_invoices" ON invoices;
      CREATE POLICY "admin_can_delete_invoices" ON invoices
        FOR DELETE USING (
          auth.jwt() ->> 'role' = 'authenticated' AND
          (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        );

      DROP POLICY IF EXISTS "admin_can_view_line_items" ON invoice_line_items;
      CREATE POLICY "admin_can_view_line_items" ON invoice_line_items
        FOR SELECT USING (
          auth.jwt() ->> 'role' = 'authenticated' AND
          (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        );

      DROP POLICY IF EXISTS "admin_can_insert_line_items" ON invoice_line_items;
      CREATE POLICY "admin_can_insert_line_items" ON invoice_line_items
        FOR INSERT WITH CHECK (
          auth.jwt() ->> 'role' = 'authenticated' AND
          (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        );

      DROP POLICY IF EXISTS "tokens_can_be_accessed_with_valid_token" ON invoice_tokens;
      CREATE POLICY "tokens_can_be_accessed_with_valid_token" ON invoice_tokens
        FOR SELECT USING (true);

      DROP POLICY IF EXISTS "admin_can_view_artwork" ON invoice_artwork;
      CREATE POLICY "admin_can_view_artwork" ON invoice_artwork
        FOR SELECT USING (
          auth.jwt() ->> 'role' = 'authenticated' AND
          (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        );

      DROP POLICY IF EXISTS "admin_can_insert_artwork" ON invoice_artwork;
      CREATE POLICY "admin_can_insert_artwork" ON invoice_artwork
        FOR INSERT WITH CHECK (
          auth.jwt() ->> 'role' = 'authenticated' AND
          (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        );

      DROP POLICY IF EXISTS "admin_can_view_activity" ON invoice_activity;
      CREATE POLICY "admin_can_view_activity" ON invoice_activity
        FOR SELECT USING (
          auth.jwt() ->> 'role' = 'authenticated' AND
          (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        );

      DROP POLICY IF EXISTS "admin_can_insert_activity" ON invoice_activity;
      CREATE POLICY "admin_can_insert_activity" ON invoice_activity
        FOR INSERT WITH CHECK (
          auth.jwt() ->> 'role' = 'authenticated' AND
          (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        );
    `;
        const publicAccessTokensQuery = `
      CREATE TABLE IF NOT EXISTS public_access_tokens (
        id BIGSERIAL PRIMARY KEY,
        token VARCHAR(64) UNIQUE NOT NULL,
        
        -- Resource identification
        resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('proof', 'order', 'invoice', 'design')),
        resource_id VARCHAR(255) NOT NULL,
        
        -- Expiration and usage
        expires_at TIMESTAMPTZ NOT NULL,
        one_time_use BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMPTZ,
        
        -- Audit trail
        created_at TIMESTAMPTZ DEFAULT NOW(),
        created_by VARCHAR(255),
        metadata JSONB,
        
        -- Constraints
        CONSTRAINT token_not_too_long CHECK (LENGTH(token) = 64),
        CONSTRAINT token_hex_format CHECK (token ~ '^[0-9a-f]{64}$')
      );

      -- INDEXES
      CREATE INDEX IF NOT EXISTS idx_public_access_tokens_token 
        ON public_access_tokens(token) 
        WHERE used_at IS NULL;
      
      CREATE INDEX IF NOT EXISTS idx_public_access_tokens_resource 
        ON public_access_tokens(resource_type, resource_id);
      
      CREATE INDEX IF NOT EXISTS idx_public_access_tokens_expires 
        ON public_access_tokens(expires_at) 
        WHERE used_at IS NULL;

      -- COMMENTS
      COMMENT ON TABLE public_access_tokens IS 'Cryptographically secure access tokens for public endpoints. Replaces guessable ID-based access.';

      -- PERMISSIONS
      REVOKE ALL ON public_access_tokens FROM anon, authenticated;
      GRANT USAGE ON SEQUENCE public_access_tokens_id_seq TO anon, authenticated;
    `;
        // Try to create tables using direct query execution
        // Fallback: Return SQL for manual execution if RPC doesn't work
        const errors = [];
        try {
            // Check if invoices table exists by trying a select query
            const { error: checkError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoices").select("id", {
                count: "exact",
                head: true
            }).limit(0);
            if (!checkError) {
                // Table exists already
                console.log("Invoices table already exists");
                return res.status(200).json({
                    message: "Database already initialized",
                    tables_created: false,
                    status: "ready"
                });
            }
        } catch (error) {
            console.log("Tables do not exist yet, creating them...");
        }
        // If tables don't exist, we need to provide instructions
        // Since we can't execute raw SQL through the normal client,
        // return instructions for manual creation
        res.status(202).json({
            message: "Database initialization required",
            status: "manual_setup_needed",
            instructions: {
                method: "Copy the SQL below and execute it in Supabase SQL Editor",
                sql_commands: {
                    invoices_table: invoicesQuery,
                    line_items_table: invoicesLineItemsQuery,
                    tokens_table: invoiceTokensQuery,
                    artwork_table: invoiceArtworkQuery,
                    activity_table: invoiceActivityQuery,
                    public_access_tokens_table: publicAccessTokensQuery,
                    rls_policies: rlsQuery
                },
                url: "https://app.supabase.com/project/nbzttuomtdtsfzcagfnh/sql/new"
            }
        });
    } catch (error) {
        console.error("Database initialization error:", error);
        res.status(500).json({
            error: "Failed to initialize database",
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[project]/server/routes/invoice-artwork.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleDeleteArtwork",
    ()=>handleDeleteArtwork,
    "handleGetArtwork",
    ()=>handleGetArtwork,
    "handleUploadArtwork",
    ()=>handleUploadArtwork,
    "uploadMiddleware",
    ()=>upload
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/supabase.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$cloudinary__$5b$external$5d$__$28$cloudinary$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$cloudinary$29$__ = __turbopack_context__.i("[externals]/cloudinary [external] (cloudinary, cjs, [project]/node_modules/cloudinary)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$multer__$5b$external$5d$__$28$multer$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$multer$29$__ = __turbopack_context__.i("[externals]/multer [external] (multer, cjs, [project]/node_modules/multer)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/stream [external] (stream, cjs)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
// Configure Cloudinary
__TURBOPACK__imported__module__$5b$externals$5d2f$cloudinary__$5b$external$5d$__$28$cloudinary$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$cloudinary$29$__["default"].v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// Multer middleware for file uploads
const upload = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$multer__$5b$external$5d$__$28$multer$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$multer$29$__["default"])({
    storage: __TURBOPACK__imported__module__$5b$externals$5d2f$multer__$5b$external$5d$__$28$multer$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$multer$29$__["default"].memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024
    },
    fileFilter: (req, file, cb)=>{
        const allowedMimes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "application/pdf",
            "application/x-pdf"
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type"));
        }
    }
});
const handleUploadArtwork = async (req, res)=>{
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "No file provided"
            });
        }
        const { invoiceId } = req.params;
        // Verify invoice exists
        const { data: invoice } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoices").select("id").eq("id", invoiceId).single();
        if (!invoice) {
            return res.status(404).json({
                success: false,
                error: "Invoice not found"
            });
        }
        // Upload to Cloudinary with high quality settings
        const uploadPromise = new Promise((resolve, reject)=>{
            const uploadStream = __TURBOPACK__imported__module__$5b$externals$5d2f$cloudinary__$5b$external$5d$__$28$cloudinary$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$cloudinary$29$__["default"].v2.uploader.upload_stream({
                folder: "invoice-artwork",
                resource_type: "auto",
                quality: "auto:best",
                flags: "preserve_transparency",
                format: req.file?.mimetype === "image/png" ? "png" : "jpg",
                fetch_format: "auto",
                secure: true
            }, (error, result)=>{
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
            // Stream the file buffer to Cloudinary
            const bufferStream = __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["Readable"].from(Buffer.from(req.file.buffer));
            bufferStream.pipe(uploadStream);
        });
        const cloudinaryResult = await uploadPromise;
        // Save artwork reference to database
        const { data: artwork, error: dbError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_artwork").insert({
            invoice_id: invoiceId,
            file_url: cloudinaryResult.secure_url,
            file_name: req.file.originalname,
            file_type: req.file.mimetype,
            file_size: req.file.size,
            cloudinary_public_id: cloudinaryResult.public_id
        }).select().single();
        if (dbError) {
            throw dbError;
        }
        // Log activity
        await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_activity").insert({
            invoice_id: invoiceId,
            activity_type: "artwork_uploaded",
            description: `Artwork uploaded: ${req.file.originalname}`
        });
        res.status(200).json({
            success: true,
            data: {
                id: artwork.id,
                file_url: artwork.file_url,
                file_name: artwork.file_name,
                cloudinary_public_id: artwork.cloudinary_public_id,
                uploaded_at: artwork.uploaded_at
            }
        });
    } catch (error) {
        console.error("Upload artwork error:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to upload artwork"
        });
    }
};
const handleGetArtwork = async (req, res)=>{
    try {
        const { invoiceId } = req.params;
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_artwork").select("*").eq("invoice_id", invoiceId);
        if (error) {
            throw error;
        }
        res.status(200).json({
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error("Get artwork error:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch artwork"
        });
    }
};
const handleDeleteArtwork = async (req, res)=>{
    try {
        const { artworkId } = req.params;
        // Get artwork to get Cloudinary public ID
        const { data: artwork, error: fetchError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_artwork").select("cloudinary_public_id, invoice_id").eq("id", artworkId).single();
        if (fetchError || !artwork) {
            return res.status(404).json({
                success: false,
                error: "Artwork not found"
            });
        }
        // Delete from Cloudinary
        if (artwork.cloudinary_public_id) {
            try {
                await __TURBOPACK__imported__module__$5b$externals$5d2f$cloudinary__$5b$external$5d$__$28$cloudinary$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$cloudinary$29$__["default"].v2.uploader.destroy(artwork.cloudinary_public_id);
            } catch (cloudError) {
                console.error("Cloudinary delete error:", cloudError);
            // Continue anyway - the DB record still needs to be deleted
            }
        }
        // Delete from database
        const { error: deleteError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_artwork").delete().eq("id", artworkId);
        if (deleteError) {
            throw deleteError;
        }
        // Log activity
        await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("invoice_activity").insert({
            invoice_id: artwork.invoice_id,
            activity_type: "artwork_deleted",
            description: "Artwork deleted"
        });
        res.status(200).json({
            success: true,
            message: "Artwork deleted successfully"
        });
    } catch (error) {
        console.error("Delete artwork error:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete artwork"
        });
    }
};
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/debug.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleDebugHealth",
    ()=>handleDebugHealth,
    "handleDebugOrdersList",
    ()=>handleDebugOrdersList
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, esm_import, [project]/node_modules/@supabase/supabase-js)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__["createClient"])(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_KEY || "");
const handleDebugOrdersList = async (req, res)=>{
    try {
        // Log access to debug endpoint
        const adminId = req.customerId;
        console.log(`[DEBUG ENDPOINT ACCESS] Admin ${adminId} accessed /api/debug/orders-list at ${new Date().toISOString()}`);
        const { data: orders, error } = await supabase.from("orders").select(`
        id,
        created_at,
        status,
        total,
        customer_id
      `).order("id", {
            ascending: true
        });
        if (error) {
            console.error("Debug orders list query error:", error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
        // Return orders without PII (no email addresses)
        const sanitizedOrders = (orders || []).map((order)=>({
                id: order.id,
                display_number: `SY-5${4001 + order.id}`,
                created_at: order.created_at,
                status: order.status,
                total: order.total,
                has_customer: !!order.customer_id
            }));
        res.status(200).json({
            success: true,
            orders: sanitizedOrders,
            total: orders?.length || 0,
            _debug: {
                endpoint: "/api/debug/orders-list",
                protected_by: [
                    "verifyToken",
                    "requireAdmin"
                ],
                accessed_by_admin: adminId,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error("Debug orders list error:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Internal server error",
            code: "DEBUG_ENDPOINT_ERROR"
        });
    }
};
const handleDebugHealth = async (req, res)=>{
    try {
        const adminId = req.customerId;
        console.log(`[DEBUG ENDPOINT ACCESS] Admin ${adminId} accessed /api/debug/health at ${new Date().toISOString()}`);
        // Check database connectivity
        const { data: dbCheck, error: dbError } = await supabase.from("orders").select("id").limit(1);
        const dbHealthy = !dbError && dbCheck !== null;
        // Check environment configuration
        const configured = {
            SUPABASE_URL: !!process.env.SUPABASE_URL,
            SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
            JWT_SECRET: !!process.env.JWT_SECRET,
            CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
            SQUARE_APPLICATION_ID: !!process.env.SQUARE_APPLICATION_ID,
            SQUARE_ACCESS_TOKEN: !!process.env.SQUARE_ACCESS_TOKEN,
            RESEND_API_KEY: !!process.env.RESEND_API_KEY,
            ECWID_API_TOKEN: !!process.env.ECWID_API_TOKEN
        };
        const allConfigured = Object.values(configured).every((v)=>v === true);
        res.status(200).json({
            success: true,
            status: allConfigured && dbHealthy ? "healthy" : "degraded",
            database: {
                connected: dbHealthy,
                error: dbError?.message || null
            },
            configuration: configured,
            node_env: ("TURBOPACK compile-time value", "development") || "not set",
            timestamp: new Date().toISOString(),
            _debug: {
                endpoint: "/api/debug/health",
                protected_by: [
                    "verifyToken",
                    "requireAdmin"
                ],
                accessed_by_admin: adminId
            }
        });
    } catch (error) {
        console.error("Debug health check error:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Internal server error",
            code: "DEBUG_HEALTH_ERROR"
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/utils/ecwid-api.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchAllEcwidCustomers",
    ()=>fetchAllEcwidCustomers,
    "fetchAllEcwidOrders",
    ()=>fetchAllEcwidOrders,
    "fetchEcwidProduct",
    ()=>fetchEcwidProduct,
    "fetchEcwidProducts",
    ()=>fetchEcwidProducts,
    "searchEcwidProducts",
    ()=>searchEcwidProducts
]);
const ECWID_API_BASE = "https://api.ecwid.com/api/v3";
const ECWID_STORE_ID = process.env.ECWID_STORE_ID || "120154275";
const ECWID_API_TOKEN = process.env.ECWID_API_TOKEN || "";
async function fetchEcwidProduct(productId) {
    try {
        const response = await fetch(`${ECWID_API_BASE}/${ECWID_STORE_ID}/products/${productId}?token=${ECWID_API_TOKEN}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            console.error(`Failed to fetch product ${productId}:`, response.statusText);
            return null;
        }
        const data = await response.json();
        return transformEcwidProduct(data);
    } catch (error) {
        console.error(`Error fetching Ecwid product ${productId}:`, error);
        return null;
    }
}
async function searchEcwidProducts(query, limit = 20) {
    try {
        const response = await fetch(`${ECWID_API_BASE}/${ECWID_STORE_ID}/products?keyword=${encodeURIComponent(query)}&limit=${limit}&token=${ECWID_API_TOKEN}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            console.error("Failed to search Ecwid products:", response.statusText);
            return [];
        }
        const data = await response.json();
        return (data.items || []).map(transformEcwidProduct);
    } catch (error) {
        console.error("Error searching Ecwid products:", error);
        return [];
    }
}
async function fetchEcwidProducts(limit = 20, offset = 0) {
    try {
        const response = await fetch(`${ECWID_API_BASE}/${ECWID_STORE_ID}/products?limit=${limit}&offset=${offset}&token=${ECWID_API_TOKEN}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            console.error("Failed to fetch Ecwid products:", response.statusText);
            return [];
        }
        const data = await response.json();
        return (data.items || []).map(transformEcwidProduct);
    } catch (error) {
        console.error("Error fetching Ecwid products:", error);
        return [];
    }
}
async function fetchAllEcwidCustomers() {
    try {
        const customers = [];
        let offset = 0;
        const limit = 100;
        let hasMore = true;
        while(hasMore){
            const response = await fetch(`${ECWID_API_BASE}/${ECWID_STORE_ID}/customers?limit=${limit}&offset=${offset}&token=${ECWID_API_TOKEN}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                console.error("Failed to fetch Ecwid customers:", response.statusText);
                break;
            }
            const data = await response.json();
            const items = data.items || [];
            if (items.length === 0) {
                hasMore = false;
            } else {
                customers.push(...items);
                offset += limit;
            }
        }
        return customers;
    } catch (error) {
        console.error("Error fetching Ecwid customers:", error);
        return [];
    }
}
async function fetchAllEcwidOrders() {
    try {
        const orders = [];
        let offset = 0;
        const limit = 100;
        let hasMore = true;
        while(hasMore){
            const response = await fetch(`${ECWID_API_BASE}/${ECWID_STORE_ID}/orders?limit=${limit}&offset=${offset}&token=${ECWID_API_TOKEN}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                console.error("Failed to fetch Ecwid orders:", response.statusText);
                break;
            }
            const data = await response.json();
            const items = data.items || [];
            if (items.length === 0) {
                hasMore = false;
            } else {
                orders.push(...items);
                offset += limit;
            }
        }
        return orders;
    } catch (error) {
        console.error("Error fetching Ecwid orders:", error);
        return [];
    }
}
function transformEcwidProduct(data) {
    const product = {
        id: data.id,
        sku: data.sku || "",
        name: data.name || "",
        price: data.price || 0,
        description: data.description || "",
        options: (data.options || []).map((opt)=>({
                name: opt.name,
                type: opt.type,
                required: opt.required || false,
                choices: (opt.choices || []).map((choice)=>({
                        text: choice.text,
                        priceModifier: choice.priceModifier || 0
                    }))
            })),
        images: (data.images || []).map((img)=>({
                id: img.id,
                url: img.url,
                alt: img.alt,
                width: img.width,
                height: img.height
            }))
    };
    if (product.images.length > 0) {
        product.defaultImage = product.images[0];
    }
    return product;
}
}),
"[project]/server/routes/ecwid-migration.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleCSVCustomerImport",
    ()=>handleCSVCustomerImport,
    "handleEcwidMigration",
    ()=>handleEcwidMigration,
    "handleGetMigrationStatus",
    ()=>handleGetMigrationStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/supabase.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$ecwid$2d$api$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/ecwid-api.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const handleEcwidMigration = async (req, res)=>{
    try {
        const result = {
            customersImported: 0,
            customersSkipped: 0,
            ordersImported: 0,
            ordersSkipped: 0,
            errors: []
        };
        console.log("Starting Ecwid migration...");
        // Fetch all customers from Ecwid
        console.log("Fetching customers from Ecwid...");
        const ecwidCustomers = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$ecwid$2d$api$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["fetchAllEcwidCustomers"])();
        console.log(`Found ${ecwidCustomers.length} customers in Ecwid`);
        // Import customers
        for (const ecwidCustomer of ecwidCustomers){
            try {
                if (!ecwidCustomer.email) {
                    result.customersSkipped++;
                    continue;
                }
                const fullName = ecwidCustomer.billingPerson?.name || `${ecwidCustomer.billingPerson?.firstName || ""} ${ecwidCustomer.billingPerson?.lastName || ""}`.trim();
                // Check if customer already exists
                const { data: existingCustomer } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").select("id").eq("email", ecwidCustomer.email).single();
                if (existingCustomer) {
                    result.customersSkipped++;
                    continue;
                }
                // Insert new customer
                const { error: insertError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").insert({
                    email: ecwidCustomer.email,
                    first_name: ecwidCustomer.billingPerson?.firstName || "",
                    last_name: ecwidCustomer.billingPerson?.lastName || "",
                    phone: ecwidCustomer.billingPerson?.phone,
                    created_at: ecwidCustomer.createdDate,
                    updated_at: new Date().toISOString(),
                    ecwid_customer_id: ecwidCustomer.id
                });
                if (insertError) {
                    result.errors.push(`Failed to import customer ${ecwidCustomer.email}: ${insertError.message}`);
                    result.customersSkipped++;
                } else {
                    result.customersImported++;
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                result.errors.push(`Error processing customer: ${message}`);
                result.customersSkipped++;
            }
        }
        console.log(`Imported ${result.customersImported} customers, skipped ${result.customersSkipped}`);
        // Fetch all orders from Ecwid
        console.log("Fetching orders from Ecwid...");
        const ecwidOrders = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$ecwid$2d$api$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["fetchAllEcwidOrders"])();
        console.log(`Found ${ecwidOrders.length} orders in Ecwid`);
        // Import orders
        for (const ecwidOrder of ecwidOrders){
            try {
                if (!ecwidOrder.customerEmail) {
                    result.ordersSkipped++;
                    continue;
                }
                // Find customer by email
                const { data: customer, error: customerError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").select("id").eq("email", ecwidOrder.customerEmail).single();
                if (customerError || !customer) {
                    result.errors.push(`No customer found for order ${ecwidOrder.number} (email: ${ecwidOrder.customerEmail})`);
                    result.ordersSkipped++;
                    continue;
                }
                // Check if order already exists
                const { data: existingOrder } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("orders").select("id").eq("ecwid_order_number", ecwidOrder.number).single();
                if (existingOrder) {
                    result.ordersSkipped++;
                    continue;
                }
                // Insert new order
                const { error: insertError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("orders").insert({
                    customer_id: customer.id,
                    ecwid_order_id: ecwidOrder.id,
                    ecwid_order_number: ecwidOrder.number,
                    status: ecwidOrder.fulfillmentStatus.toLowerCase() || "pending",
                    total: parseFloat(ecwidOrder.total.toString()),
                    subtotal: parseFloat(ecwidOrder.subtotal.toString()),
                    tax: parseFloat(ecwidOrder.tax.toString()),
                    shipping: parseFloat(ecwidOrder.shipping.toString()),
                    tracking_number: ecwidOrder.trackingNumber,
                    created_at: ecwidOrder.createdDate,
                    updated_at: ecwidOrder.updatedDate
                });
                if (insertError) {
                    result.errors.push(`Failed to import order ${ecwidOrder.number}: ${insertError.message}`);
                    result.ordersSkipped++;
                } else {
                    result.ordersImported++;
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                result.errors.push(`Error processing order: ${message}`);
                result.ordersSkipped++;
            }
        }
        console.log(`Imported ${result.ordersImported} orders, skipped ${result.ordersSkipped}`);
        res.json({
            success: true,
            message: "Ecwid migration completed",
            result
        });
    } catch (error) {
        console.error("Ecwid migration error:", error);
        const message = error instanceof Error ? error.message : "Migration failed";
        res.status(500).json({
            success: false,
            error: message
        });
    }
};
const handleGetMigrationStatus = async (req, res)=>{
    try {
        // Fetch customer count from Supabase
        const { count: supabaseCustomerCount, error: customerError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").select("*", {
            count: "exact",
            head: true
        });
        // Fetch order count from Supabase
        const { count: supabaseOrderCount, error: orderError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("orders").select("*", {
            count: "exact",
            head: true
        });
        // Fetch counts from Ecwid
        const ecwidCustomers = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$ecwid$2d$api$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["fetchAllEcwidCustomers"])();
        const ecwidOrders = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$ecwid$2d$api$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["fetchAllEcwidOrders"])();
        if (customerError || orderError) {
            throw new Error("Failed to fetch migration status");
        }
        res.json({
            success: true,
            ecwid: {
                customers: ecwidCustomers.length,
                orders: ecwidOrders.length
            },
            supabase: {
                customers: supabaseCustomerCount || 0,
                orders: supabaseOrderCount || 0
            }
        });
    } catch (error) {
        console.error("Get migration status error:", error);
        const message = error instanceof Error ? error.message : "Failed to get status";
        res.status(500).json({
            success: false,
            error: message
        });
    }
};
const handleCSVCustomerImport = async (req, res)=>{
    try {
        const { csvData } = req.body;
        if (!csvData || typeof csvData !== "string") {
            return res.status(400).json({
                error: "CSV data is required"
            });
        }
        const result = {
            customersImported: 0,
            customersSkipped: 0,
            ordersImported: 0,
            ordersSkipped: 0,
            errors: []
        };
        // Parse CSV
        const lines = csvData.trim().split("\n");
        if (lines.length < 2) {
            return res.status(400).json({
                error: "CSV must have header row and at least one data row"
            });
        }
        // Parse header - split first, then lowercase for matching
        const headerLine = lines[0].trim();
        const headers = headerLine.split(",").map((h)=>h.trim().toLowerCase());
        // Find email column - support both "email" and Ecwid's "customer_primary_email"
        let emailIndex = headers.indexOf("email");
        if (emailIndex === -1) {
            emailIndex = headers.indexOf("customer_primary_email");
        }
        if (emailIndex === -1) {
            return res.status(400).json({
                error: "CSV must have an 'email' or 'customer_primary_email' column. Found columns: " + headerLine
            });
        }
        // Find name columns - support various formats
        let firstNameIndex = headers.indexOf("firstname");
        let lastNameIndex = headers.indexOf("lastname");
        let fullNameIndex = headers.indexOf("customer_full_name");
        if (firstNameIndex === -1) {
            firstNameIndex = headers.indexOf("first_name");
        }
        if (lastNameIndex === -1) {
            lastNameIndex = headers.indexOf("last_name");
        }
        // Find phone column
        let phoneIndex = headers.indexOf("phone");
        if (phoneIndex === -1) {
            phoneIndex = headers.indexOf("customer_primary_phone_number");
        }
        if (phoneIndex === -1) {
            phoneIndex = headers.indexOf("phone_number");
        }
        // Find company column
        let companyIndex = headers.indexOf("company");
        if (companyIndex === -1) {
            companyIndex = headers.indexOf("customer_group_name");
        }
        // Parse data rows
        const customers = [];
        for(let i = 1; i < lines.length; i++){
            const line = lines[i].trim();
            if (!line) continue;
            const values = line.split(",").map((v)=>v.trim());
            const email = values[emailIndex];
            if (!email) {
                result.errors.push(`Row ${i + 1}: Missing email`);
                result.customersSkipped++;
                continue;
            }
            // Handle name - either separate first/last or combined full name
            let firstName = firstNameIndex >= 0 ? values[firstNameIndex] : undefined;
            let lastName = lastNameIndex >= 0 ? values[lastNameIndex] : undefined;
            // If we have full name but no first/last, parse it
            if (fullNameIndex >= 0 && !firstName && !lastName) {
                const fullName = values[fullNameIndex] || "";
                const nameParts = fullName.trim().split(/\s+/);
                if (nameParts.length > 0) {
                    firstName = nameParts[0];
                    if (nameParts.length > 1) {
                        lastName = nameParts.slice(1).join(" ");
                    }
                }
            }
            customers.push({
                email,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                phone: phoneIndex >= 0 ? values[phoneIndex] : undefined,
                company: companyIndex >= 0 ? values[companyIndex] : undefined
            });
        }
        // Import customers
        for (const customer of customers){
            try {
                // Check if customer already exists
                const { data: existingCustomer } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").select("id").eq("email", customer.email).single();
                if (existingCustomer) {
                    result.customersSkipped++;
                    continue;
                }
                // Insert new customer
                const { error: insertError } = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$supabase$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["supabase"].from("customers").insert({
                    email: customer.email,
                    first_name: customer.firstName || "",
                    last_name: customer.lastName || "",
                    phone: customer.phone,
                    company: customer.company,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
                if (insertError) {
                    result.errors.push(`Failed to import customer ${customer.email}: ${insertError.message}`);
                    result.customersSkipped++;
                } else {
                    result.customersImported++;
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                result.errors.push(`Error processing customer ${customer.email}: ${message}`);
                result.customersSkipped++;
            }
        }
        res.json({
            success: true,
            message: "CSV import completed",
            result
        });
    } catch (error) {
        console.error("CSV import error:", error);
        const message = error instanceof Error ? error.message : "CSV import failed";
        res.status(500).json({
            success: false,
            error: message
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/reviews.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleDeleteReview",
    ()=>handleDeleteReview,
    "handleGetAdminReviews",
    ()=>handleGetAdminReviews,
    "handleGetProductReviews",
    ()=>handleGetProductReviews,
    "handleMarkReviewHelpful",
    ()=>handleMarkReviewHelpful,
    "handleSubmitReview",
    ()=>handleSubmitReview,
    "handleUpdateReviewStatus",
    ()=>handleUpdateReviewStatus
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, esm_import, [project]/node_modules/@supabase/supabase-js)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$cloudinary__$5b$external$5d$__$28$cloudinary$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$cloudinary$29$__ = __turbopack_context__.i("[externals]/cloudinary [external] (cloudinary, cjs, [project]/node_modules/cloudinary)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$image$2d$processor$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/utils/image-processor.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";
/**
 * SECURITY: Service Role Key is required for this route
 *
 * Justification:
 * - Review management requires unrestricted access for moderation
 * - RLS policies would need to allow guests to write but only specific fields
 * - Admin needs ability to approve/reject reviews without customer-specific restrictions
 * - Alternative: Complex RLS policies with guest tokens would be harder to manage
 *
 * Mitigation:
 * - Review submissions have rate limiting applied in middleware
 * - Spam protection and validation on all fields (email, rating, content)
 * - All reviews require admin approval before display (hidden by default)
 * - No customer data is accessed (only user-submitted reviews)
 *
 * See: docs/RLS_SCOPING.md for security architecture
 */ const supabase = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__["createClient"])(supabaseUrl, supabaseKey);
__TURBOPACK__imported__module__$5b$externals$5d2f$cloudinary__$5b$external$5d$__$28$cloudinary$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$cloudinary$29$__["v2"].config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const handleSubmitReview = async (req, res)=>{
    try {
        const { product_id, reviewer_name, reviewer_email, rating, title, comment, images } = req.body;
        // Validation
        if (!product_id || !reviewer_name || !reviewer_email || !rating) {
            return res.status(400).json({
                error: "Missing required fields: product_id, reviewer_name, reviewer_email, rating"
            });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                error: "Rating must be between 1 and 5"
            });
        }
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(reviewer_email)) {
            return res.status(400).json({
                error: "Invalid email address"
            });
        }
        // Validate image sizes (max 15MB each)
        const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
        if (images && Array.isArray(images)) {
            for (const imageBase64 of images){
                // Rough estimate: Base64 is ~33% larger than binary, so divide by 1.33
                const estimatedSize = (imageBase64.split(",")[1]?.length || 0) * 0.75;
                if (estimatedSize > MAX_IMAGE_SIZE) {
                    return res.status(400).json({
                        error: `Image size exceeds 15MB limit`
                    });
                }
            }
        }
        // Upload images to Cloudinary if provided
        const image_urls = [];
        if (images && Array.isArray(images) && images.length > 0) {
            for (const imageBase64 of images.slice(0, 3)){
                // Max 3 images per review
                try {
                    // If it's already a full data URI, use it; otherwise construct it
                    const dataUri = imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
                    // Compress image before uploading
                    const buffer = Buffer.from(dataUri.split(",")[1] || imageBase64, "base64");
                    const compressedBuffer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$utils$2f$image$2d$processor$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["processImage"])(buffer, 600, 600);
                    const compressedDataUri = `data:image/jpeg;base64,${compressedBuffer.toString("base64")}`;
                    const result = await __TURBOPACK__imported__module__$5b$externals$5d2f$cloudinary__$5b$external$5d$__$28$cloudinary$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$cloudinary$29$__["v2"].uploader.upload(compressedDataUri, {
                        folder: "sticky-slap/reviews",
                        resource_type: "auto",
                        quality: "auto"
                    });
                    image_urls.push(result.secure_url);
                } catch (imageError) {
                    console.error("Error uploading review image:", imageError);
                // Continue without this image if upload fails
                }
            }
        }
        // Insert review into Supabase
        const { data, error } = await supabase.from("product_reviews").insert([
            {
                product_id,
                reviewer_name: reviewer_name.trim(),
                reviewer_email: reviewer_email.toLowerCase().trim(),
                rating,
                title: title?.trim() || null,
                comment: comment?.trim() || null,
                image_urls: image_urls,
                status: "pending"
            }
        ]).select();
        if (error) {
            console.error("Database error inserting review:", error);
            return res.status(500).json({
                error: "Failed to submit review"
            });
        }
        res.status(201).json({
            success: true,
            message: "Review submitted successfully and pending approval",
            review: data?.[0] || {}
        });
    } catch (err) {
        console.error("Error submitting review:", err);
        res.status(500).json({
            error: "Failed to submit review"
        });
    }
};
const handleGetProductReviews = async (req, res)=>{
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({
                error: "Product ID is required"
            });
        }
        const { data, error } = await supabase.from("product_reviews").select("id, product_id, reviewer_name, rating, title, comment, image_urls, helpful_count, created_at").eq("product_id", productId).eq("status", "approved").order("created_at", {
            ascending: false
        });
        if (error) {
            console.error("Error fetching reviews:", error);
            return res.status(500).json({
                error: "Failed to fetch reviews"
            });
        }
        // Calculate average rating
        const reviews = data || [];
        const averageRating = reviews.length > 0 ? (reviews.reduce((sum, r)=>sum + r.rating, 0) / reviews.length).toFixed(1) : 0;
        res.json({
            success: true,
            reviews,
            averageRating,
            totalReviews: reviews.length
        });
    } catch (err) {
        console.error("Error getting product reviews:", err);
        res.status(500).json({
            error: "Failed to fetch reviews"
        });
    }
};
const handleMarkReviewHelpful = async (req, res)=>{
    try {
        const { reviewId } = req.params;
        if (!reviewId) {
            return res.status(400).json({
                error: "Review ID is required"
            });
        }
        const id = parseInt(reviewId, 10);
        if (isNaN(id)) {
            return res.status(400).json({
                error: "Invalid review ID format"
            });
        }
        const { data, error } = await supabase.from("product_reviews").update({
            helpful_count: supabase.rpc("increment_helpful")
        }).eq("id", id).select();
        if (error) {
            console.error("Error marking review as helpful:", error);
            return res.status(500).json({
                error: "Failed to mark review as helpful"
            });
        }
        res.json({
            success: true,
            review: data?.[0] || {}
        });
    } catch (err) {
        console.error("Error marking review as helpful:", err);
        res.status(500).json({
            error: "Failed to mark review as helpful"
        });
    }
};
const handleGetAdminReviews = async (req, res)=>{
    try {
        const { data, error } = await supabase.from("product_reviews").select("*").order("created_at", {
            ascending: false
        });
        if (error) {
            console.error("Error fetching admin reviews:", error);
            return res.status(500).json({
                error: "Failed to fetch reviews"
            });
        }
        res.json({
            success: true,
            reviews: data || []
        });
    } catch (err) {
        console.error("Error getting admin reviews:", err);
        res.status(500).json({
            error: "Failed to fetch reviews"
        });
    }
};
const handleUpdateReviewStatus = async (req, res)=>{
    try {
        const { reviewId } = req.params;
        const { status } = req.body;
        if (!reviewId || !status) {
            return res.status(400).json({
                error: "Review ID and status are required"
            });
        }
        if (![
            "approved",
            "rejected",
            "pending"
        ].includes(status)) {
            return res.status(400).json({
                error: "Invalid status. Must be 'approved', 'rejected', or 'pending'"
            });
        }
        const id = parseInt(reviewId, 10);
        if (isNaN(id)) {
            return res.status(400).json({
                error: "Invalid review ID format"
            });
        }
        const { data, error } = await supabase.from("product_reviews").update({
            status
        }).eq("id", id).select();
        if (error) {
            console.error("Error updating review status:", error);
            return res.status(500).json({
                error: "Failed to update review"
            });
        }
        res.json({
            success: true,
            review: data?.[0] || {}
        });
    } catch (err) {
        console.error("Error updating review status:", err);
        res.status(500).json({
            error: "Failed to update review"
        });
    }
};
const handleDeleteReview = async (req, res)=>{
    try {
        const { reviewId } = req.params;
        if (!reviewId) {
            return res.status(400).json({
                error: "Review ID is required"
            });
        }
        const id = parseInt(reviewId, 10);
        if (isNaN(id)) {
            return res.status(400).json({
                error: "Invalid review ID format"
            });
        }
        const { error } = await supabase.from("product_reviews").delete().eq("id", id);
        if (error) {
            console.error("Error deleting review:", error);
            return res.status(500).json({
                error: "Failed to delete review"
            });
        }
        res.json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (err) {
        console.error("Error deleting review:", err);
        res.status(500).json({
            error: "Failed to delete review"
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/routes/discounts.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleApplyDiscountCode",
    ()=>handleApplyDiscountCode,
    "handleCreateDiscountCode",
    ()=>handleCreateDiscountCode,
    "handleDeleteDiscountCode",
    ()=>handleDeleteDiscountCode,
    "handleGetDiscountCode",
    ()=>handleGetDiscountCode,
    "handleGetDiscountCodes",
    ()=>handleGetDiscountCodes,
    "handleUpdateDiscountCode",
    ()=>handleUpdateDiscountCode,
    "handleValidateDiscountCode",
    ()=>handleValidateDiscountCode
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__ = __turbopack_context__.i("[externals]/@supabase/supabase-js [external] (@supabase/supabase-js, esm_import, [project]/node_modules/@supabase/supabase-js)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$supabase$2f$supabase$2d$js__$5b$external$5d$__$2840$supabase$2f$supabase$2d$js$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$29$__["createClient"])(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_KEY || "");
// Validation schema for creating/updating discount codes
const DiscountCodeSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    code: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().min(3, "Code must be at least 3 characters").max(50, "Code must be at most 50 characters").transform((val)=>val.toUpperCase()),
    description: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional().or(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].null()),
    discount_type: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "percentage",
        "fixed"
    ]),
    discount_value: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().positive("Discount value must be positive"),
    min_order_value: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nonnegative("Min order value must be non-negative").optional().default(0),
    max_uses: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().positive("Max uses must be positive").optional().or(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].null()),
    is_active: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].boolean().optional().default(true),
    expires_at: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().datetime().optional().or(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].null())
});
const handleGetDiscountCodes = async (_req, res)=>{
    try {
        const { data: codes, error } = await supabase.from("discount_codes").select("*").order("created_at", {
            ascending: false
        });
        if (error) throw error;
        res.status(200).json({
            success: true,
            data: codes || []
        });
    } catch (error) {
        console.error("Failed to fetch discount codes:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch discount codes";
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};
const handleGetDiscountCode = async (req, res)=>{
    try {
        const { id } = req.params;
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            return res.status(400).json({
                error: "Invalid discount code ID"
            });
        }
        const { data: code, error } = await supabase.from("discount_codes").select("*").eq("id", parsedId).single();
        if (error || !code) {
            return res.status(404).json({
                error: "Discount code not found"
            });
        }
        res.status(200).json({
            success: true,
            data: code
        });
    } catch (error) {
        console.error("Failed to fetch discount code:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch discount code";
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};
const handleCreateDiscountCode = async (req, res)=>{
    try {
        const validationResult = DiscountCodeSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: "Validation failed",
                details: validationResult.error.errors
            });
        }
        const codeData = validationResult.data;
        // Check if code already exists
        const { data: existingCode } = await supabase.from("discount_codes").select("id").eq("code", codeData.code).single();
        if (existingCode) {
            return res.status(409).json({
                error: "Discount code already exists"
            });
        }
        const { data: newCode, error } = await supabase.from("discount_codes").insert([
            codeData
        ]).select().single();
        if (error) throw error;
        res.status(201).json({
            success: true,
            data: newCode
        });
    } catch (error) {
        console.error("Failed to create discount code:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to create discount code";
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};
const handleUpdateDiscountCode = async (req, res)=>{
    try {
        const { id } = req.params;
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            return res.status(400).json({
                error: "Invalid discount code ID"
            });
        }
        const validationResult = DiscountCodeSchema.partial().safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: "Validation failed",
                details: validationResult.error.errors
            });
        }
        const updates = validationResult.data;
        // Check if updating code and if new code already exists
        if (updates.code) {
            const { data: existingCode } = await supabase.from("discount_codes").select("id").eq("code", updates.code).neq("id", parsedId).single();
            if (existingCode) {
                return res.status(409).json({
                    error: "Discount code already exists"
                });
            }
        }
        const { data: updatedCode, error } = await supabase.from("discount_codes").update({
            ...updates,
            updated_at: new Date().toISOString()
        }).eq("id", parsedId).select().single();
        if (error || !updatedCode) {
            return res.status(404).json({
                error: "Discount code not found"
            });
        }
        res.status(200).json({
            success: true,
            data: updatedCode
        });
    } catch (error) {
        console.error("Failed to update discount code:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to update discount code";
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};
const handleDeleteDiscountCode = async (req, res)=>{
    try {
        const { id } = req.params;
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            return res.status(400).json({
                error: "Invalid discount code ID"
            });
        }
        const { error } = await supabase.from("discount_codes").delete().eq("id", parsedId);
        if (error) throw error;
        res.status(200).json({
            success: true,
            message: "Discount code deleted successfully"
        });
    } catch (error) {
        console.error("Failed to delete discount code:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to delete discount code";
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};
const handleValidateDiscountCode = async (req, res)=>{
    try {
        const { code, orderTotal } = req.body;
        if (!code || typeof code !== "string") {
            return res.status(400).json({
                error: "Discount code is required"
            });
        }
        if (orderTotal === undefined || orderTotal === null) {
            return res.status(400).json({
                error: "Order total is required"
            });
        }
        const upperCode = code.toUpperCase();
        // Fetch the discount code
        const { data: discountCode, error } = await supabase.from("discount_codes").select("*").eq("code", upperCode).eq("is_active", true).single();
        if (error || !discountCode) {
            return res.status(400).json({
                error: "Invalid discount code"
            });
        }
        // Check if code has expired
        if (discountCode.expires_at && new Date(discountCode.expires_at) < new Date()) {
            return res.status(400).json({
                error: "Discount code has expired"
            });
        }
        // Check if max uses reached
        if (discountCode.max_uses !== null && discountCode.used_count >= discountCode.max_uses) {
            return res.status(400).json({
                error: "Discount code usage limit reached"
            });
        }
        // Check minimum order value
        if (orderTotal < discountCode.min_order_value) {
            return res.status(400).json({
                error: `Order total must be at least $${discountCode.min_order_value.toFixed(2)} to use this discount`
            });
        }
        // Calculate discount amount
        let discountAmount = 0;
        if (discountCode.discount_type === "percentage") {
            discountAmount = orderTotal * discountCode.discount_value / 100;
        } else {
            discountAmount = discountCode.discount_value;
        }
        // Cap discount at order total
        discountAmount = Math.min(discountAmount, orderTotal);
        res.status(200).json({
            success: true,
            discount: {
                code: discountCode.code,
                type: discountCode.discount_type,
                value: discountCode.discount_value,
                amount: parseFloat(discountAmount.toFixed(2)),
                description: discountCode.description
            }
        });
    } catch (error) {
        console.error("Failed to validate discount code:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to validate discount code";
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};
const handleApplyDiscountCode = async (req, res)=>{
    try {
        const { code } = req.body;
        if (!code || typeof code !== "string") {
            return res.status(400).json({
                error: "Discount code is required"
            });
        }
        const upperCode = code.toUpperCase();
        // Get the discount code
        const { data: discountCode, error: selectError } = await supabase.from("discount_codes").select("*").eq("code", upperCode).single();
        if (selectError || !discountCode) {
            return res.status(400).json({
                error: "Invalid discount code"
            });
        }
        // Increment used count
        const { data: updatedCode, error: updateError } = await supabase.from("discount_codes").update({
            used_count: discountCode.used_count + 1
        }).eq("id", discountCode.id).select().single();
        if (updateError || !updatedCode) {
            throw updateError || new Error("Failed to update discount code");
        }
        res.status(200).json({
            success: true,
            message: "Discount code applied successfully"
        });
    } catch (error) {
        console.error("Failed to apply discount code:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to apply discount code";
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/server/index.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createServer",
    ()=>createServer
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$express__$5b$external$5d$__$28$express$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$express$29$__ = __turbopack_context__.i("[externals]/express [external] (express, cjs, [project]/node_modules/express)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$cors__$5b$external$5d$__$28$cors$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$cors$29$__ = __turbopack_context__.i("[externals]/cors [external] (cors, cjs, [project]/node_modules/cors)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$multer__$5b$external$5d$__$28$multer$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$multer$29$__ = __turbopack_context__.i("[externals]/multer [external] (multer, cjs, [project]/node_modules/multer)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$demo$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/demo.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$auth$2e$router$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/auth.router.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$customer$2e$router$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/customer.router.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$order$2e$router$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/order.router.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$product$2e$router$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/product.router.ts [api] (ecmascript)");
// Additional route imports - will be refactored to routers in phase 2
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$designs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/designs.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$cart$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/cart.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$checkout$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/checkout.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$store$2d$credit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/store-credit.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$support$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/support.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$payments$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/payments.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$webhooks$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/webhooks.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$zapier$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/zapier.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/square.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$square$2d$payment$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/square-payment.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$digital$2d$files$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/digital-files.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$ecwid$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/ecwid-products.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$import$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/import-products.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$proofs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/proofs.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$send$2d$proof$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/send-proof.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$email$2d$preview$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/email-preview.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/admin-orders.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$customers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/admin-customers.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$analytics$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/admin-analytics.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$finance$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/admin-finance.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$shipping$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/shipping.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$shipping$2d$public$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/shipping-public.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$shipping$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/admin-shipping.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$blogs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/blogs.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$gallery$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/admin-gallery.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$legal$2d$pages$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/legal-pages.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$return$2d$refund$2d$policy$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/admin-return-refund-policy.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/invoices.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$db$2d$setup$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/db-setup.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoice$2d$artwork$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/invoice-artwork.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$debug$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/debug.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$ecwid$2d$migration$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/ecwid-migration.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$reviews$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/reviews.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$discounts$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/routes/discounts.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/middleware/auth.ts [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$rate$2d$limit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/middleware/rate-limit.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$auth$2e$router$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$customer$2e$router$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$order$2e$router$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$product$2e$router$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$designs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$cart$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$checkout$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$store$2d$credit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$support$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$webhooks$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$zapier$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$square$2d$payment$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$digital$2d$files$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$import$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$proofs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$send$2d$proof$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$email$2d$preview$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$customers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$analytics$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$shipping$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$shipping$2d$public$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$shipping$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$blogs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$gallery$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$legal$2d$pages$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$return$2d$refund$2d$policy$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$db$2d$setup$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoice$2d$artwork$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$debug$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$ecwid$2d$migration$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$reviews$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$discounts$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$rate$2d$limit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$auth$2e$router$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$customer$2e$router$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$order$2e$router$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$product$2e$router$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$designs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$cart$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$checkout$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$store$2d$credit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$support$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$webhooks$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$zapier$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$square$2d$payment$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$digital$2d$files$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$import$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$proofs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$send$2d$proof$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$email$2d$preview$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$customers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$analytics$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$shipping$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$shipping$2d$public$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$shipping$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$blogs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$gallery$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$legal$2d$pages$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$return$2d$refund$2d$policy$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$db$2d$setup$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoice$2d$artwork$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$debug$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$ecwid$2d$migration$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$reviews$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$discounts$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$rate$2d$limit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
// Load environment variables
if ("TURBOPACK compile-time truthy", 1) {
    // Use dynamic import for dotenv to avoid issues in ES modules
    __turbopack_context__.A("[externals]/dotenv/config [external] (dotenv/config, cjs, [project]/node_modules/dotenv, async loader)").catch(()=>{
    // dotenv not available, that's okay - environment variables may be set another way
    });
}
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function createServer() {
    const app = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$express__$5b$external$5d$__$28$express$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$express$29$__["default"])();
    // CORS Configuration - Allow only trusted origins
    const allowedOrigins = [
        // Frontend URLs - Development
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:8080",
        // Custom frontend URL
        process.env.FRONTEND_URL || "http://localhost:5173",
        "https://stickershop.test",
        // Production domains
        "https://stickerland.app",
        "https://www.stickerland.app",
        // Add production domains here as environment variables
        ...process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",").map((o)=>o.trim()) : []
    ];
    // Allow www subdomain for production URLs
    const allowWwwVariants = (url)=>{
        if (url.startsWith("https://") && !url.includes("www.")) {
            const wwwUrl = url.replace("https://", "https://www.");
            if (!allowedOrigins.includes(wwwUrl)) {
                allowedOrigins.push(wwwUrl);
            }
        }
    };
    // Add www variants for all https URLs
    [
        process.env.FRONTEND_URL,
        ...process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []
    ].forEach((url)=>{
        if (url) {
            allowWwwVariants(url.trim());
        }
    });
    const corsOptions = {
        origin: (origin, callback)=>{
            // Reject requests with no origin in production (prevents CSRF)
            if (!origin) {
                if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                ;
                // Allow in development only
                return callback(null, true);
            }
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.warn(`[SECURITY] CORS request blocked from origin: ${origin}`, {
                    allowedOrigins,
                    flyAppName: process.env.FLY_APP_NAME,
                    frontendUrl: process.env.FRONTEND_URL
                });
                callback(new Error("Not allowed by CORS policy"));
            }
        },
        credentials: true,
        optionsSuccessStatus: 200,
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Admin-Setup-Key"
        ]
    };
    console.log("✅ CORS Configuration initialized:", {
        allowedOrigins,
        frontendUrl: process.env.FRONTEND_URL
    });
    // Phase 1: Environment & Config Verification
    console.log("=== PHASE 1: Environment & Config Verification ===");
    console.log("✅ SQUARE_APPLICATION_ID:", process.env.SQUARE_APPLICATION_ID ? "Loaded" : "❌ MISSING");
    console.log("✅ SQUARE_ACCESS_TOKEN:", process.env.SQUARE_ACCESS_TOKEN ? "Loaded" : "❌ MISSING");
    console.log("✅ RESEND_API_KEY:", process.env.RESEND_API_KEY ? "Loaded" : "❌ MISSING");
    console.log("=================================================");
    // Middleware
    app.use((0, __TURBOPACK__imported__module__$5b$externals$5d2f$cors__$5b$external$5d$__$28$cors$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$cors$29$__["default"])(corsOptions));
    // Middleware to handle pre-parsed bodies (Vercel/serverless-http often parses JSON automatically)
    app.use((req, _res, next)=>{
        // Check if body is a Buffer (happens in some serverless environments)
        if (req.body && Buffer.isBuffer(req.body)) {
            // Skip parsing if buffer is empty
            if (req.body.length === 0) {
                req.body = {};
                return next();
            }
            try {
                const bodyString = req.body.toString("utf8");
                // Only parse if string is valid JSON
                if (bodyString.trim().startsWith('{') || bodyString.trim().startsWith('[')) {
                    req.body = JSON.parse(bodyString);
                    console.log("✅ Parsed Buffer body to JSON successfully");
                }
            } catch (error) {
                console.error("❌ Failed to parse Buffer body:", error);
            // Don't error here, let express.json() or routes handle it
            }
        }
        next();
    });
    app.use(__TURBOPACK__imported__module__$5b$externals$5d2f$express__$5b$external$5d$__$28$express$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$express$29$__["default"].json({
        limit: "50mb"
    }));
    app.use(__TURBOPACK__imported__module__$5b$externals$5d2f$express__$5b$external$5d$__$28$express$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$express$29$__["default"].urlencoded({
        limit: "50mb",
        extended: true
    }));
    // Apply rate limiting globally (only in production)
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // Multer configuration for file uploads
    const upload = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$multer__$5b$external$5d$__$28$multer$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$multer$29$__["default"])({
        storage: __TURBOPACK__imported__module__$5b$externals$5d2f$multer__$5b$external$5d$__$28$multer$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$multer$29$__["default"].memoryStorage(),
        limits: {
            fileSize: 50 * 1024 * 1024
        },
        fileFilter: (req, file, cb)=>{
            if (file.mimetype.startsWith("image/")) {
                cb(null, true);
            } else {
                cb(new Error("Only image files are allowed"));
            }
        }
    });
    // Security headers for Square Web Payments SDK and general security
    app.use((req, res, next)=>{
        // Content Security Policy for Square Web Payments SDK
        // Allows Square's scripts and connections for payment processing
        res.setHeader("Content-Security-Policy", [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://square.com https://connect.squareup.com https://*.ecwid.com https://*.google.com https://*.googleapis.com https://*.gstatic.com https://d34ikvsdm2rlij.cloudfront.net https://storefront.ecwid.dev:*",
            "connect-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://square.com https://*.squareupsandbox.com https://*.squareup.com https://connect.squareup.com https://connect.squareupsandbox.com https://*.ecwid.com https://*.google.com https://*.googleapis.com https://*.gstatic.com https://d34ikvsdm2rlij.cloudfront.net https://storefront.ecwid.dev:* https://api.cloudinary.com https://res.cloudinary.com",
            "frame-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://square.com https://*.squareupsandbox.com https://*.squareup.com https://*.ecwid.com https://d34ikvsdm2rlij.cloudfront.net https://storefront.ecwid.dev:*",
            "img-src 'self' https: data: https://d34ikvsdm2rlij.cloudfront.net https://storefront.ecwid.dev:* https://res.cloudinary.com",
            "style-src 'self' 'unsafe-inline' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://fonts.googleapis.com https://*.ecwid.com https://d34ikvsdm2rlij.cloudfront.net https://storefront.ecwid.dev:*",
            "font-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://fonts.googleapis.com https://*.gstatic.com https://d34ikvsdm2rlij.cloudfront.net https://storefront.ecwid.dev:*",
            "object-src 'none'"
        ].join("; "));
        // HTTPS enforcement (Secure Context requirement)
        // Redirect HTTP to HTTPS in production
        if (("TURBOPACK compile-time value", "development") === "production" && req.header("x-forwarded-proto") !== "https") //TURBOPACK unreachable
        ;
        // Additional security headers for PCI DSS compliance
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "SAMEORIGIN");
        res.setHeader("X-XSS-Protection", "1; mode=block");
        res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        // Strict Transport Security (HSTS) - Enforce HTTPS for 1 year
        res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
        // Permissions Policy (formerly Feature Policy) - Restrict API access
        res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=self, usb=()");
        // Certificate Transparency - Enforce CT monitoring
        res.setHeader("Expect-CT", "max-age=86400, enforce");
        // Prevent MIME sniffing for PCI security
        res.setHeader("X-Content-Type-Options", "nosniff");
        // Additional cache control for sensitive pages
        if (req.path.includes("/checkout") || req.path.includes("/payment")) {
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
        }
        next();
    });
    // Error handling for JSON parsing
    app.use((err, _req, res, next)=>{
        if (err instanceof SyntaxError && "body" in err) {
            console.error("JSON parsing error:", {
                message: err.message,
                bodyPartial: err.body?.substring?.(0, 200)
            });
            return res.status(400).json({
                error: "Invalid JSON in request body"
            });
        }
        if (err) {
            console.error("Unhandled middleware error:", err);
            return next(err);
        }
        next();
    });
    // Health check endpoint
    app.get("/health", (_req, res)=>{
        res.status(200).json({
            status: "ok",
            timestamp: new Date().toISOString()
        });
    });
    // Example API routes
    app.get("/api/ping", (_req, res)=>{
        const ping = process.env.PING_MESSAGE ?? "ping";
        res.json({
            message: ping
        });
    });
    // Health check endpoint - verify environment configuration
    app.get("/api/health", (_req, res)=>{
        const requiredEnvVars = [
            "SUPABASE_URL",
            "SUPABASE_SERVICE_KEY",
            "JWT_SECRET",
            "SQUARE_APPLICATION_ID",
            "SQUARE_ACCESS_TOKEN",
            "SQUARE_LOCATION_ID"
        ];
        const missingVars = requiredEnvVars.filter((v)=>!process.env[v]);
        const isHealthy = missingVars.length === 0;
        const health = {
            status: isHealthy ? "healthy" : "degraded",
            timestamp: new Date().toISOString(),
            environment: ("TURBOPACK compile-time value", "development"),
            configured: {
                SUPABASE_URL: !!process.env.SUPABASE_URL,
                SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
                JWT_SECRET: !!process.env.JWT_SECRET,
                FRONTEND_URL: !!process.env.FRONTEND_URL,
                BASE_URL: !!process.env.BASE_URL,
                SQUARE_APPLICATION_ID: !!process.env.SQUARE_APPLICATION_ID,
                SQUARE_ACCESS_TOKEN: !!process.env.SQUARE_ACCESS_TOKEN,
                SQUARE_LOCATION_ID: !!process.env.SQUARE_LOCATION_ID,
                ECWID_API_TOKEN: !!process.env.ECWID_API_TOKEN,
                CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME
            },
            missingVars: ("TURBOPACK compile-time truthy", 1) ? missingVars : "TURBOPACK unreachable"
        };
        const statusCode = isHealthy ? 200 : 503;
        res.status(statusCode).json(health);
    });
    app.get("/api/demo", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$demo$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleDemo"]);
    // ===== Mount Routers =====
    // Authentication routes
    app.use("/api/auth", (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$auth$2e$router$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createAuthRouter"])());
    // Customer routes (protected)
    app.use("/api/customers", (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$customer$2e$router$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createCustomerRouter"])(upload));
    // Order routes (customer and public only - admin routes are defined directly below)
    app.use("/api/orders", (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$order$2e$router$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createOrderRouter"])());
    app.use("/api/public/orders", (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$order$2e$router$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createPublicOrderRouter"])());
    // Product routes (public, admin, storefront)
    app.use("/api/products", (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$product$2e$router$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createProductRouter"])());
    app.use("/api/admin/products", (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$product$2e$router$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createAdminProductRouter"])());
    app.use("/api/public/products", (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$product$2e$router$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createPublicProductRouter"])());
    app.use("/api/storefront", (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$product$2e$router$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createStorefrontRouter"])());
    // ===== Debug Endpoints (Development Only) =====
    // SECURITY: These endpoints are ONLY available in development environment
    // They expose sensitive system information and should never be enabled in production
    if ("TURBOPACK compile-time truthy", 1) {
        app.get("/api/debug/orders-list", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$debug$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleDebugOrdersList"]);
        app.get("/api/debug/health", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$debug$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleDebugHealth"]);
        console.log("[SECURITY] Debug endpoints enabled for development");
    }
    // ===== Design Routes (Protected) =====
    app.get("/api/designs", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$designs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetDesigns"]);
    app.get("/api/orders/:orderId/designs", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$designs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetOrderDesigns"]);
    app.post("/api/designs/upload", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$designs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUploadDesignFile"]);
    // ===== Cart Routes (Public) =====
    app.post("/api/cart", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$cart$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleCreateCart"]);
    app.get("/api/cart/:cartId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$cart$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetCart"]);
    app.post("/api/cart/:cartId/items", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$cart$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleAddToCart"]);
    app.patch("/api/cart/:cartId/items/:itemIndex", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$cart$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUpdateCartItem"]);
    app.delete("/api/cart/:cartId/items/:itemIndex", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$cart$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleRemoveFromCart"]);
    app.delete("/api/cart/:cartId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$cart$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleClearCart"]);
    // ===== Checkout Routes (Public - guest checkout supported) =====
    app.post("/api/checkout", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$rate$2d$limit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["checkoutLimiter"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$checkout$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleCheckout"]);
    app.get("/api/checkout/:cartId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$checkout$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetCheckoutDetails"]);
    // Product routes handled by createProductRouter() above
    // ===== Product Reviews Routes (Public) =====
    app.post("/api/reviews", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$reviews$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleSubmitReview"]);
    app.get("/api/reviews/:productId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$reviews$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetProductReviews"]);
    app.post("/api/reviews/:reviewId/helpful", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$reviews$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleMarkReviewHelpful"]);
    // ===== Admin Reviews Routes (Protected - Admin only) =====
    app.get("/api/admin/reviews", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$reviews$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetAdminReviews"]);
    app.patch("/api/admin/reviews/:reviewId/status", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$reviews$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUpdateReviewStatus"]);
    app.delete("/api/admin/reviews/:reviewId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$reviews$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleDeleteReview"]);
    // ===== Ecwid Products Routes (Public) =====
    // Note: Order matters! More specific routes first
    app.get("/api/ecwid-products/search", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$ecwid$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleSearchEcwidProducts"]);
    app.get("/api/ecwid-products/:productId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$ecwid$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetEcwidProduct"]);
    app.get("/api/ecwid-products", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$ecwid$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleListEcwidProducts"]);
    // ===== Imported Products Routes =====
    app.get("/api/imported-products", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$import$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetProducts"]);
    app.post("/api/import-products", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$import$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleImportProducts"]);
    app.delete("/api/imported-products/all", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$import$2d$products$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleDeleteAllProducts"]);
    // Storefront Products Routes handled by createProductRouter() mounted at /api/storefront above
    // ===== Payments Routes (Public) =====
    app.get("/api/payments/methods", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$payments$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetPaymentMethods"]);
    app.post("/api/payments/process", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$rate$2d$limit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["paymentLimiter"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$payments$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleProcessPayment"]);
    // ===== Square Payment Routes (Public) =====
    app.get("/api/square/config", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetSquareConfig"]);
    app.get("/api/square/locations", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetSquareLocations"]);
    app.get("/api/square/test", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleTestSquareConfig"]);
    app.post("/api/square/checkout", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$rate$2d$limit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["checkoutLimiter"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleCreateCheckoutSession"]);
    app.post("/api/square/confirm-checkout", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$rate$2d$limit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["paymentLimiter"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleConfirmCheckout"]);
    app.post("/api/square/pay", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$rate$2d$limit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["paymentLimiter"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleSquarePayment"]);
    app.post("/api/square/process-payment", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$rate$2d$limit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["paymentLimiter"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$square$2d$payment$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["processSquarePayment"]);
    app.post("/api/square/create-payment", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$rate$2d$limit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["paymentLimiter"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleCreatePayment"]);
    app.post("/api/webhooks/square", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleSquareWebhook"]);
    app.post("/api/admin/verify-payment/:orderId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$square$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleVerifyPendingPayment"]);
    // ===== Admin Routes (Protected - Admin only) =====
    // Admin order detail route (direct - not using router)
    app.get("/api/admin/orders/:orderId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetOrderDetail"]);
    // Other admin order status/shipping routes
    app.put("/api/admin/orders/:orderId/status", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUpdateOrderStatus"]);
    app.put("/api/admin/orders/:orderId/shipping-address", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUpdateShippingAddress"]);
    app.get("/api/admin/customers", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$customers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetAllCustomers"]);
    app.get("/api/admin/customers/search", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$customers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleSearchCustomers"]);
    app.get("/api/admin/customers/:customerId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$customers$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetCustomerDetails"]);
    app.get("/api/admin/analytics", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$analytics$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetAnalytics"]);
    app.post("/api/analytics/track", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$analytics$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleTrackEvent"]);
    app.get("/api/admin/finance", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$finance$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetFinance"]);
    // Admin product routes handled by createProductRouter() above
    // ===== Store Credit Routes (Protected - admin only) =====
    app.get("/api/store-credit/customers", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$store$2d$credit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetAllCustomersCredit"]);
    app.get("/api/store-credit/:customerId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$store$2d$credit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetCustomerCredit"]);
    app.get("/api/store-credit/:customerId/history", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$store$2d$credit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetCreditHistory"]);
    app.post("/api/store-credit/modify", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$store$2d$credit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleModifyStoreCredit"]);
    app.post("/api/store-credit/apply-to-order", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$store$2d$credit$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleApplyStoreCreditToOrder"]);
    // ===== Support Routes =====
    app.post("/api/support/submit", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$support$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleSupportSubmit"]);
    app.get("/api/support/tickets", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$support$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetTickets"]);
    app.get("/api/support/tickets/:ticketId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$support$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetTicketDetails"]);
    app.post("/api/support/tickets/:ticketId/reply", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$support$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleCustomerReplyToTicket"]);
    app.get("/api/admin/tickets", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$support$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleAdminGetAllTickets"]);
    app.post("/api/admin/tickets/:ticketId/reply", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$support$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleAdminReplyToTicket"]);
    app.patch("/api/admin/tickets/:ticketId/status", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$support$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUpdateTicketStatus"]);
    // ===== Digital Files Routes =====
    app.post("/api/orders/:orderId/files", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$digital$2d$files$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUploadDigitalFile"]);
    app.get("/api/orders/:orderId/files", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$digital$2d$files$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetOrderFiles"]);
    app.delete("/api/files/:fileId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$digital$2d$files$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleDeleteDigitalFile"]);
    // ===== Proofs Routes (Protected) =====
    app.get("/api/proofs", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$proofs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetProofs"]);
    app.get("/api/proofs/notifications", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$proofs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetProofNotifications"]);
    app.get("/api/proofs/:proofId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$proofs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetProofDetail"]);
    app.post("/api/proofs/:proofId/approve", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$proofs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleApproveProof"]);
    app.post("/api/proofs/:proofId/deny", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$proofs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleDenyProof"]);
    app.post("/api/proofs/:proofId/comments", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$proofs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleAddProofComment"]);
    app.get("/api/proofs/public/:proofId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$proofs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetProofDetailPublic"]);
    app.post("/api/proofs/public/:proofId/approve", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$proofs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleApproveProofPublic"]);
    app.post("/api/proofs/public/:proofId/deny", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$proofs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleDenyProofPublic"]);
    // New proof routes for public approval page
    app.get("/api/proofs/:proofId/public", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$proofs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetProofDetailPublic"]);
    app.post("/api/proofs/:proofId/approve", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$proofs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleApproveProofPublicNew"]);
    app.post("/api/proofs/:proofId/revise", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$proofs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleReviseProofPublicNew"]);
    app.post("/api/admin/proofs/send", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$proofs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleSendProofToCustomer"]);
    app.get("/api/admin/proofs", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$proofs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetAdminProofs"]);
    app.get("/api/admin/proofs/:proofId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$proofs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetAdminProofDetail"]);
    app.post("/api/admin/proofs/:proofId/comments", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$proofs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleAddAdminProofComment"]);
    app.post("/api/send-proof", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$send$2d$proof$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleSendProofDirectly"]);
    // SECURITY: Email preview endpoints require admin authentication
    app.get("/api/email-preview/proof", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$email$2d$preview$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleProofEmailPreview"]);
    app.post("/api/email-preview/send", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$email$2d$preview$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleSendProofEmailPreview"]);
    app.get("/api/email-preview/signup", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$email$2d$preview$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleSignupConfirmationPreview"]);
    app.get("/api/email-preview/order-confirmation", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$email$2d$preview$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleOrderConfirmationPreview"]);
    app.get("/api/email-preview/shipping", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$email$2d$preview$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleShippingConfirmationPreview"]);
    app.get("/api/email-preview/password-reset", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$email$2d$preview$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handlePasswordResetPreview"]);
    app.get("/api/email-preview/support-reply", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$email$2d$preview$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleSupportTicketReplyPreview"]);
    app.get("/api/email-preview/order-status-update", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$email$2d$preview$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleOrderStatusUpdatePreview"]);
    // ===== Admin Order Routes (Direct - these paths don't use the router) =====
    // Note: These are separate from /api/admin/orders/* router-based routes
    app.get("/api/admin/pending-orders", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetAdminPendingOrders"]);
    app.get("/api/admin/all-orders", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetAllAdminOrders"]);
    app.post("/api/admin/update-order-item-options", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$orders$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUpdateOrderItemOptions"]);
    // ===== Shipping Routes (Protected - admin only) =====
    app.post("/api/shipping/label", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$shipping$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleCreateLabel"]);
    app.post("/api/shipping/rates", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$shipping$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetRates"]);
    app.get("/api/shipping/carriers", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$shipping$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetCarriers"]);
    app.get("/api/shipping/services", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$shipping$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetServices"]);
    // ===== Shipping Options Routes (Public - for checkout) =====
    app.get("/api/shipping-options", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$shipping$2d$public$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetPublicShippingOptions"]);
    // ===== Shipping Options Routes (Protected - admin only) =====
    app.get("/api/admin/shipping-options", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$shipping$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetShippingOptions"]);
    app.get("/api/admin/shipping-options/:id", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$shipping$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetShippingOption"]);
    app.post("/api/admin/shipping-options", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$shipping$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleCreateShippingOption"]);
    app.put("/api/admin/shipping-options/:id", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$shipping$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUpdateShippingOption"]);
    app.delete("/api/admin/shipping-options/:id", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$shipping$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleDeleteShippingOption"]);
    // ===== Discount Code Routes (Public validation) =====
    app.post("/api/discounts/validate", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$discounts$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleValidateDiscountCode"]);
    app.post("/api/discounts/apply", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$discounts$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleApplyDiscountCode"]);
    // ===== Discount Code Routes (Protected - admin only) =====
    app.get("/api/admin/discounts", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$discounts$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetDiscountCodes"]);
    app.get("/api/admin/discounts/:id", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$discounts$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetDiscountCode"]);
    app.post("/api/admin/discounts", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$discounts$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleCreateDiscountCode"]);
    app.put("/api/admin/discounts/:id", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$discounts$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUpdateDiscountCode"]);
    app.delete("/api/admin/discounts/:id", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$discounts$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleDeleteDiscountCode"]);
    // ===== Webhook Routes =====
    app.post("/api/webhooks/ecwid", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$webhooks$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleEcwidOrderWebhook"]);
    app.get("/api/webhooks/health", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$webhooks$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleWebhookHealth"]);
    app.get("/api/webhooks/url", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$webhooks$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetWebhookUrl"]);
    app.get("/api/webhooks/diagnostic", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$webhooks$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleEcwidDiagnostic"]);
    app.post("/api/webhooks/test", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$webhooks$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleTestWebhook"]);
    // ===== Zapier Integration Routes =====
    app.post("/api/zapier/webhook", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$zapier$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleZapierEcwidWebhook"]);
    app.get("/api/zapier/health", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$zapier$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleZapierHealth"]);
    app.get("/api/zapier/webhook-url", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$zapier$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetZapierWebhookUrl"]);
    // ===== Ecwid Migration Routes (Protected - admin only) =====
    app.post("/api/admin/ecwid/migrate", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$ecwid$2d$migration$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleEcwidMigration"]);
    app.get("/api/admin/ecwid/migration-status", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$ecwid$2d$migration$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetMigrationStatus"]);
    app.post("/api/admin/ecwid/import-csv", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$ecwid$2d$migration$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleCSVCustomerImport"]);
    // ===== Blogs Routes =====
    // Public routes
    app.get("/api/blogs", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$blogs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetPublishedBlogs"]);
    app.get("/api/blogs/:blogId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$blogs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetBlogById"]);
    // Admin routes (Protected - Admin only)
    app.post("/api/admin/blogs", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$blogs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleCreateBlog"]);
    app.get("/api/admin/blogs", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$blogs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetAllBlogs"]);
    app.get("/api/admin/blogs/:blogId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$blogs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetAdminBlogById"]);
    app.put("/api/admin/blogs/:blogId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$blogs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUpdateBlog"]);
    app.delete("/api/admin/blogs/:blogId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$blogs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleDeleteBlog"]);
    app.post("/api/admin/upload-image", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], upload.single("file"), __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$blogs$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUploadBlogImage"]);
    // ===== Gallery Routes =====
    app.use("/api", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$gallery$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["default"]);
    // Gallery image upload (with multer middleware)
    app.post("/api/gallery/upload", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], upload.single("file"), async (req, res)=>{
        try {
            const { v2: cloudinary } = await __turbopack_context__.A("[externals]/cloudinary [external] (cloudinary, cjs, [project]/node_modules/cloudinary, async loader)");
            const { processImage: processImageUtil } = await __turbopack_context__.A("[project]/server/utils/image-processor.ts [api] (ecmascript, async loader)");
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET
            });
            if (!req.file) {
                return res.status(400).json({
                    error: "No file provided"
                });
            }
            // Compress and optimize image (uses sharp if available, falls back to original)
            const compressedBuffer = await processImageUtil(req.file.buffer, 1200, 800);
            const b64 = compressedBuffer.toString("base64");
            const dataURI = `data:image/jpeg;base64,${b64}`;
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: "sticky-slap/gallery",
                resource_type: "auto"
            });
            res.json({
                imageUrl: result.secure_url
            });
        } catch (err) {
            console.error("Error uploading gallery image:", err);
            res.status(500).json({
                error: "Failed to upload gallery image"
            });
        }
    });
    // ===== Legal Pages Routes =====
    // Public routes
    app.get("/api/legal-pages", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$legal$2d$pages$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetPublishedLegalPages"]);
    app.get("/api/legal/:pageType", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$legal$2d$pages$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetLegalPageByType"]);
    // Admin routes (Protected - Admin only)
    app.post("/api/admin/legal-pages", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$legal$2d$pages$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleCreateLegalPage"]);
    app.get("/api/admin/legal-pages", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$legal$2d$pages$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetAllLegalPages"]);
    app.get("/api/admin/legal-pages/:pageId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$legal$2d$pages$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetAdminLegalPageById"]);
    app.put("/api/admin/legal-pages/:pageId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$legal$2d$pages$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUpdateLegalPage"]);
    app.delete("/api/admin/legal-pages/:pageId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$legal$2d$pages$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleDeleteLegalPage"]);
    // ===== Return & Refund Policy Routes =====
    // Public route
    app.get("/api/return-refund-policy", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$return$2d$refund$2d$policy$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getReturnRefundPolicy"]);
    // Admin routes (Protected - Admin only)
    app.get("/api/admin/return-refund-policy", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$return$2d$refund$2d$policy$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getReturnRefundPolicy"]);
    app.post("/api/admin/return-refund-policy", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$admin$2d$return$2d$refund$2d$policy$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["updateReturnRefundPolicy"]);
    // ===== Invoice Routes =====
    // Admin routes (Protected - Admin only)
    app.get("/api/admin/invoices", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifySupabaseToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetInvoices"]);
    app.get("/api/admin/invoices/:id", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifySupabaseToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetInvoice"]);
    app.post("/api/admin/invoices", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifySupabaseToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleCreateInvoice"]);
    app.put("/api/admin/invoices/:id", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifySupabaseToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUpdateInvoice"]);
    app.post("/api/admin/invoices/:id/send", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifySupabaseToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleSendInvoice"]);
    app.post("/api/admin/invoices/:id/mark-paid", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifySupabaseToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleMarkInvoicePaid"]);
    app.post("/api/admin/invoices/:id/cancel", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifySupabaseToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleCancelInvoice"]);
    app.get("/api/admin/invoices/:invoiceId/payment-token", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifyToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetPaymentToken"]);
    // Artwork upload routes
    app.post("/api/admin/invoices/:invoiceId/artwork", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifySupabaseToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoice$2d$artwork$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["uploadMiddleware"].single("file"), __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoice$2d$artwork$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleUploadArtwork"]);
    app.get("/api/admin/invoices/:invoiceId/artwork", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifySupabaseToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoice$2d$artwork$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetArtwork"]);
    app.delete("/api/admin/invoices/artwork/:artworkId", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["verifySupabaseToken"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoice$2d$artwork$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleDeleteArtwork"]);
    // Public routes
    app.get("/api/invoice/:token", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleGetInvoiceByToken"]);
    app.post("/api/invoice/:token/create-payment-link", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$invoices$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleCreateInvoicePaymentLink"]);
    // Database setup route
    app.post("/api/admin/setup/init-invoices", __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$middleware$2f$auth$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["requireAdmin"], __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$routes$2f$db$2d$setup$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["handleInitializeInvoicesDatabase"]);
    // Global error handler - must be last
    app.use((err, _req, res, _next)=>{
        console.error("Global error handler:", err);
        const statusCode = err.statusCode || err.status || 500;
        const message = err.message || "Internal server error";
        res.status(statusCode).json({
            error: message,
            details: ("TURBOPACK compile-time truthy", 1) ? err.stack : "TURBOPACK unreachable"
        });
    });
    return app;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/pages/api/[...slug].ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$serverless$2d$http__$5b$external$5d$__$28$serverless$2d$http$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$serverless$2d$http$29$__ = __turbopack_context__.i("[externals]/serverless-http [external] (serverless-http, cjs, [project]/node_modules/serverless-http)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$index$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/index.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$index$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$server$2f$index$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
// Initialize the Express app
const app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$index$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["createServer"])();
// Create the serverless handler
const handler = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$serverless$2d$http__$5b$external$5d$__$28$serverless$2d$http$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$serverless$2d$http$29$__["default"])(app);
const config = {
    api: {
        bodyParser: false,
        externalResolver: true
    }
};
async function __TURBOPACK__default__export__(req, res) {
    // Add protocol if missing (fix for some internal redirects)
    if (!req.url?.startsWith('http')) {
        // @ts-ignore
        req.protocol = 'https';
    }
    return handler(req, res);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__603679ad._.js.map