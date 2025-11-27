// BigCommerce API utility for server-side operations
const BIGCOMMERCE_API_URL = "https://api.bigcommerce.com/stores";

interface BigCommerceCustomer {
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  phone?: string;
  company?: string;
}

interface BigCommerceAddress {
  first_name: string;
  last_name: string;
  street_1: string;
  street_2?: string;
  city: string;
  state_or_province: string;
  postal_code: string;
  country_code: string;
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

    try {
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

      const data = await response.json();

      if (!response.ok) {
        console.error("Token exchange failed:", {
          status: response.status,
          error: data,
        });
        throw new Error("Failed to exchange authorization code for token");
      }

      return data;
    } catch (error) {
      console.error("Token exchange error:", error);
      throw error;
    }
  }

  /**
   * Create a new customer in BigCommerce
   */
  async createCustomer(customer: BigCommerceCustomer): Promise<any> {
    const url = `${BIGCOMMERCE_API_URL}/${this.storeHash}/v3/customers`;

    try {
      const customerData: any = {
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        password: customer.password,
      };

      if (customer.phone) {
        customerData.phone = customer.phone;
      }

      if (customer.company) {
        customerData.company = customer.company;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-Auth-Token": this.accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([customerData]),
      });

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response JSON:", parseError);
        throw new Error(
          `Failed to parse BigCommerce response: ${response.statusText}`,
        );
      }

      if (!response.ok) {
        console.error("Customer creation failed:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        throw new Error(
          data?.errors?.[0]?.message ||
            data?.error_description ||
            "Failed to create customer in BigCommerce",
        );
      }

      const customers = data?.data || [];
      return customers[0] || data;
    } catch (error) {
      console.error("Customer creation error:", error);
      throw error;
    }
  }

  /**
   * Create a customer address in BigCommerce
   */
  async createCustomerAddress(
    customerId: number,
    address: BigCommerceAddress,
  ): Promise<any> {
    const url = `${BIGCOMMERCE_API_URL}/${this.storeHash}/v3/customers/${customerId}/addresses`;

    try {
      const addressData: any = {
        first_name: address.first_name,
        last_name: address.last_name,
        street_1: address.street_1,
        city: address.city,
        state_or_province: address.state_or_province,
        postal_code: address.postal_code,
        country_code: address.country_code,
      };

      if (address.street_2) {
        addressData.street_2 = address.street_2;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-Auth-Token": this.accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([addressData]),
      });

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response JSON:", parseError);
        throw new Error(
          `Failed to parse BigCommerce response: ${response.statusText}`,
        );
      }

      if (!response.ok) {
        console.error("Customer address creation failed:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        throw new Error(
          data?.errors?.[0]?.message ||
            data?.error_description ||
            "Failed to create customer address in BigCommerce",
        );
      }

      const addresses = data?.data || [];
      return addresses[0] || data;
    } catch (error) {
      console.error("Customer address creation error:", error);
      throw error;
    }
  }

  /**
   * Get customer by email
   */
  async getCustomerByEmail(email: string): Promise<any> {
    const url = `${BIGCOMMERCE_API_URL}/${this.storeHash}/v3/customers?email:in=${email}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-Auth-Token": this.accessToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Get customer failed:", {
          status: response.status,
          statusText: response.statusText,
        });
        return null;
      }

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse customer response:", parseError);
        return null;
      }

      return data?.data && data.data.length > 0 ? data.data[0] : null;
    } catch (error) {
      console.error("Get customer error:", error);
      return null;
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: number): Promise<any> {
    const url = `${BIGCOMMERCE_API_URL}/${this.storeHash}/v3/customers/${customerId}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-Auth-Token": this.accessToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = { statusText: response.statusText };
        }
        console.error("BigCommerce API Error - Get Customer:", {
          status: response.status,
          statusText: response.statusText,
          storeHash: this.storeHash,
          hasToken: !!this.accessToken,
          error: errorData,
        });
        throw new Error(
          `BigCommerce API Error (${response.status}): ${errorData?.error_description || response.statusText}`,
        );
      }

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse customer response:", parseError);
        throw new Error("Failed to parse customer data from BigCommerce");
      }

      return data?.data;
    } catch (error) {
      console.error("Get customer error:", error);
      throw error;
    }
  }

  /**
   * Get customer's orders
   */
  async getCustomerOrders(customerId: number): Promise<BigCommerceOrder[]> {
    const url = `${BIGCOMMERCE_API_URL}/${this.storeHash}/v3/orders?customer_id:in=${customerId}`;

    try {
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

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse orders response:", parseError);
        throw new Error("Failed to parse orders data from BigCommerce");
      }

      return data?.data || [];
    } catch (error) {
      console.error("Get customer orders error:", error);
      throw error;
    }
  }

  /**
   * Create an order
   */
  async createOrder(orderData: any): Promise<any> {
    const url = `${BIGCOMMERCE_API_URL}/${this.storeHash}/v3/orders`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-Auth-Token": this.accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([orderData]),
      });

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse order response:", parseError);
        throw new Error("Failed to parse order data from BigCommerce");
      }

      if (!response.ok) {
        console.error("Order creation failed:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        throw new Error(
          data?.errors?.[0]?.message ||
            data?.error_description ||
            "Failed to create order in BigCommerce",
        );
      }

      const orders = data?.data || [];
      return orders[0] || data;
    } catch (error) {
      console.error("Create order error:", error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: number): Promise<any> {
    const url = `${BIGCOMMERCE_API_URL}/${this.storeHash}/v3/orders/${orderId}`;

    try {
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

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse order response:", parseError);
        throw new Error("Failed to parse order data from BigCommerce");
      }

      return data?.data;
    } catch (error) {
      console.error("Get order error:", error);
      throw error;
    }
  }

  /**
   * Update customer password
   */
  async updateCustomerPassword(
    customerId: number,
    password: string,
  ): Promise<any> {
    const url = `${BIGCOMMERCE_API_URL}/${this.storeHash}/v3/customers/${customerId}`;

    try {
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

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse password update response:", parseError);
        throw new Error(
          "Failed to parse password update response from BigCommerce",
        );
      }

      return data?.data;
    } catch (error) {
      console.error("Update customer password error:", error);
      throw error;
    }
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
