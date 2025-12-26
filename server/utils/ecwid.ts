// Ecwid API utility for server-side operations
const ECWID_API_URL = "https://api.ecwid.com/api/v3";

interface EcwidCustomer {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
  password?: string;
}

interface EcwidAddress {
  name: string;
  street: string;
  city: string;
  stateOrProvinceCode: string;
  postalCode: string;
  countryCode: string;
  companyName?: string;
}

interface EcwidOrder {
  id: number;
  customerId: number;
  email: string;
  createDate: string;
  total: number;
  status?: string;
  fulfillmentStatus?: string;
  paymentStatus?: string;
  items?: any[];
  attributes?: any[];
  shippingTrackingCode?: string;
  shippingCarrier?: string;
  estimatedDeliveryDate?: string;
}

interface EcwidProduct {
  id: number;
  name: string;
  description?: string;
  price?: number;
  sku?: string;
  defaultDisplayedPrice?: number;
}

interface EcwidProductVariation {
  id: number;
  name: string;
  options: Array<{
    name: string;
    value: string;
  }>;
}

class EcwidAPI {
  private storeId: string;
  private apiToken: string;

  constructor() {
    this.storeId = process.env.ECWID_STORE_ID || "";
    this.apiToken = process.env.ECWID_API_TOKEN || "";

    if (!this.storeId || !this.apiToken) {
      console.warn("Ecwid credentials not fully configured");
    }
  }

  private getAuthUrl(endpoint: string): string {
    return `${ECWID_API_URL}/${this.storeId}${endpoint}?token=${this.apiToken}`;
  }

  /**
   * Create a new customer in Ecwid
   */
  async createCustomer(customer: EcwidCustomer): Promise<any> {
    const url = this.getAuthUrl("/customers");

    const customerData: any = {
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse Ecwid response:", parseError);
        throw new Error(
          `Failed to parse Ecwid response: ${response.statusText}`,
        );
      }

      if (!response.ok) {
        console.error("Customer creation failed:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        throw new Error(
          data?.errorMessage ||
            data?.error ||
            "Failed to create customer in Ecwid",
        );
      }

      return data;
    } catch (error) {
      console.error("Customer creation error:", error);
      throw error;
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: number): Promise<any> {
    const url = this.getAuthUrl(`/customers/${customerId}`);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        console.error("Get customer failed:", {
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error(
          `Failed to fetch customer from Ecwid: ${response.statusText}`,
        );
      }

      let data: any;
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
   */
  async getCustomerByEmail(email: string): Promise<any> {
    const encodedEmail = encodeURIComponent(email);
    const url = this.getAuthUrl(`/customers?email=${encodedEmail}`);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        console.error("Get customer by email failed:", {
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

      return data?.items && data.items.length > 0 ? data.items[0] : null;
    } catch (error) {
      console.error("Get customer by email error:", error);
      return null;
    }
  }

  /**
   * Update customer information
   */
  async updateCustomer(customerId: number, updates: any): Promise<any> {
    const url = this.getAuthUrl(`/customers/${customerId}`);

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = { statusText: response.statusText };
        }
        console.error("Update customer failed:", {
          status: response.status,
          error: errorData,
        });
        throw new Error(
          errorData?.errorMessage ||
            errorData?.error ||
            "Failed to update customer",
        );
      }

      let data: any;
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
   */
  async getCustomerOrders(customerId: number): Promise<EcwidOrder[]> {
    const url = this.getAuthUrl(`/orders?customerId=${customerId}`);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Get orders failed:", {
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error(
          `Failed to fetch orders from Ecwid: ${response.statusText}`,
        );
      }

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse orders response:", parseError);
        throw new Error("Failed to parse orders data from Ecwid");
      }

      // Extract tracking and shipping info from items
      const orders = (data?.items || []).map((order: any) => ({
        ...order,
        shippingTrackingCode: order.shippingTrackingCode,
        shippingCarrier: this.extractShippingCarrier(order),
        estimatedDeliveryDate: this.extractEstimatedDeliveryDate(order),
      }));

      return orders;
    } catch (error) {
      console.error("Get customer orders error:", error);
      throw error;
    }
  }

  /**
   * Extract shipping carrier from order shipping info
   */
  private extractShippingCarrier(order: any): string | undefined {
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
   */
  private extractEstimatedDeliveryDate(order: any): string | undefined {
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
   */
  async getOrder(orderId: number): Promise<any> {
    const url = this.getAuthUrl(`/orders/${orderId}`);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        console.error("Get order failed:", {
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error(
          `Failed to fetch order from Ecwid: ${response.statusText}`,
        );
      }

      let data: any;
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
        estimatedDeliveryDate: this.extractEstimatedDeliveryDate(data),
      };
    } catch (error) {
      console.error("Get order error:", error);
      throw error;
    }
  }

  /**
   * Create an order
   */
  async createOrder(orderData: any): Promise<any> {
    const url = this.getAuthUrl("/orders");

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse order response:", parseError);
        throw new Error("Failed to parse order data from Ecwid");
      }

      if (!response.ok) {
        console.error("Order creation failed:", {
          status: response.status,
          error: data,
        });
        throw new Error(
          data?.errorMessage ||
            data?.error ||
            "Failed to create order in Ecwid",
        );
      }

      return data;
    } catch (error) {
      console.error("Create order error:", error);
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  async getProduct(productId: number): Promise<EcwidProduct | null> {
    const url = this.getAuthUrl(`/products/${productId}`);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        console.error("Get product failed:", {
          status: response.status,
          statusText: response.statusText,
        });
        return null;
      }

      let data: any;
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
   */
  async getProductVariations(productId: number): Promise<any[]> {
    const url = this.getAuthUrl(`/products/${productId}/combinations`);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        console.error("Get product variations failed:", {
          status: response.status,
          statusText: response.statusText,
        });
        return [];
      }

      let data: any;
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
   */
  async getProductWithVariations(productId: number): Promise<any> {
    try {
      const product = await this.getProduct(productId);
      if (!product) {
        return null;
      }

      const variations = await this.getProductVariations(productId);

      return {
        ...product,
        variations,
      };
    } catch (error) {
      console.error("Get product with variations error:", error);
      return null;
    }
  }

  /**
   * Delete customer account
   */
  async deleteCustomer(customerId: number): Promise<void> {
    const url = this.getAuthUrl(`/customers/${customerId}`);

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok && response.status !== 404) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = { statusText: response.statusText };
        }
        console.error("Delete customer failed:", {
          status: response.status,
          error: errorData,
        });
        throw new Error(
          errorData?.errorMessage ||
            errorData?.error ||
            "Failed to delete customer account",
        );
      }
    } catch (error) {
      console.error("Delete customer error:", error);
      throw error;
    }
  }

  /**
   * Search products
   */
  async searchProducts(keyword: string): Promise<any[]> {
    const encodedKeyword = encodeURIComponent(keyword);
    const url = this.getAuthUrl(`/products?keyword=${encodedKeyword}`);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Search products failed:", {
          status: response.status,
          statusText: response.statusText,
        });
        return [];
      }

      let data: any;
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
   */
  async getAllProducts(limit = 100): Promise<any[]> {
    const url = this.getAuthUrl(`/products?limit=${limit}`);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Get products failed:", {
          status: response.status,
          statusText: response.statusText,
        });
        return [];
      }

      let data: any;
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
   */
  async getStoreInfo(): Promise<any> {
    const url = this.getAuthUrl("/");

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Get store info failed:", {
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error("Failed to fetch store information");
      }

      let data: any;
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
   */
  async getAllOrders(fulfillmentStatus?: string, limit = 100): Promise<any[]> {
    let endpoint = `/orders?limit=${limit}`;

    if (fulfillmentStatus) {
      endpoint += `&fulfillmentStatus=${fulfillmentStatus}`;
    }

    const url = this.getAuthUrl(endpoint);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Get all orders failed:", {
          status: response.status,
          statusText: response.statusText,
        });
        return [];
      }

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse orders response:", parseError);
        return [];
      }

      return (data?.items || []).map((order: any) => ({
        ...order,
        shippingTrackingCode: order.shippingTrackingCode,
        shippingCarrier: this.extractShippingCarrier(order),
        estimatedDeliveryDate: this.extractEstimatedDeliveryDate(order),
      }));
    } catch (error) {
      console.error("Get all orders error:", error);
      return [];
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: number, status: string): Promise<any> {
    const url = this.getAuthUrl(`/orders/${orderId}`);

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fulfillmentStatus: status }),
      });

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = { statusText: response.statusText };
        }
        console.error("Update order status failed:", {
          status: response.status,
          error: errorData,
        });
        throw new Error(
          errorData?.errorMessage ||
            errorData?.error ||
            "Failed to update order status",
        );
      }

      let data: any;
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

// Export singleton instance
export const ecwidAPI = new EcwidAPI();
