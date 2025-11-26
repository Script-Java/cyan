// BigCommerce API utility for server-side operations
const BIGCOMMERCE_API_URL = "https://api.bigcommerce.com/stores";

interface BigCommerceCustomer {
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
}

interface BigCommerceOrder {
  id: number;
  customer_id: number;
  status: string;
  date_created: string;
  total: number;
}

interface TokenExchangeResponse {
  access_token: string;
  refresh_token: string;
  scope: string[];
  expires_in: number;
  token_type: string;
  user: {
    id: number;
    email: string;
  };
  context: string;
}

class BigCommerceAPI {
  private storeHash: string;
  private accessToken: string;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.storeHash = process.env.BIGCOMMERCE_STORE_HASH || "";
    this.accessToken = process.env.BIGCOMMERCE_ACCESS_TOKEN || "";
    this.clientId = process.env.BIGCOMMERCE_CLIENT_ID || "";
    this.clientSecret = process.env.BIGCOMMERCE_CLIENT_SECRET || "";

    if (!this.storeHash || !this.accessToken) {
      console.warn("BigCommerce credentials not fully configured");
    }
  }

  /**
   * Exchange authorization code for access token (OAuth callback)
   */
  async exchangeCodeForToken(code: string): Promise<TokenExchangeResponse> {
    const tokenUrl = "https://login.bigcommerce.com/oauth2/token";

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        grant_type: "authorization_code",
        redirect_uri:
          process.env.APP_URL + "/api/auth/bigcommerce/callback" ||
          "http://localhost:8080/api/auth/bigcommerce/callback",
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Token exchange failed:", error);
      throw new Error("Failed to exchange authorization code for token");
    }

    return response.json();
  }

  /**
   * Create a new customer in BigCommerce
   */
  async createCustomer(customer: BigCommerceCustomer): Promise<any> {
    const url = `${BIGCOMMERCE_API_URL}/${this.storeHash}/v3/customers`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-Auth-Token": this.accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
          password: customer.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Customer creation failed:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        throw new Error(
          data.errors?.[0]?.message ||
            "Failed to create customer in BigCommerce"
        );
      }

      return data.data;
    } catch (error) {
      console.error("Customer creation error:", error);
      throw error;
    }
  }

  /**
   * Get customer by email
   */
  async getCustomerByEmail(email: string): Promise<any> {
    const url = `${BIGCOMMERCE_API_URL}/${this.storeHash}/v3/customers?email:in=${email}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Auth-Token": this.accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch customer from BigCommerce");
    }

    const data = await response.json();
    return data.data && data.data.length > 0 ? data.data[0] : null;
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: number): Promise<any> {
    const url = `${BIGCOMMERCE_API_URL}/${this.storeHash}/v3/customers/${customerId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Auth-Token": this.accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch customer from BigCommerce");
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get customer's orders
   */
  async getCustomerOrders(customerId: number): Promise<BigCommerceOrder[]> {
    const url = `${BIGCOMMERCE_API_URL}/${this.storeHash}/v3/orders?customer_id:in=${customerId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Auth-Token": this.accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch orders from BigCommerce");
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Create an order
   */
  async createOrder(orderData: any): Promise<any> {
    const url = `${BIGCOMMERCE_API_URL}/${this.storeHash}/v3/orders`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-Auth-Token": this.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Order creation failed:", error);
      throw new Error("Failed to create order in BigCommerce");
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: number): Promise<any> {
    const url = `${BIGCOMMERCE_API_URL}/${this.storeHash}/v3/orders/${orderId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Auth-Token": this.accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch order from BigCommerce");
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Update customer password
   */
  async updateCustomerPassword(
    customerId: number,
    password: string
  ): Promise<any> {
    const url = `${BIGCOMMERCE_API_URL}/${this.storeHash}/v3/customers/${customerId}`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "X-Auth-Token": this.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      throw new Error("Failed to update customer password");
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Validate customer credentials (simple check)
   */
  async validateCredentials(email: string, password: string): Promise<boolean> {
    try {
      const customer = await this.getCustomerByEmail(email);
      if (!customer) return false;

      // In production, implement proper password validation
      // This is a placeholder that should use a secure method
      return true;
    } catch (error) {
      console.error("Credential validation error:", error);
      return false;
    }
  }
}

// Export singleton instance
export const bigCommerceAPI = new BigCommerceAPI();
