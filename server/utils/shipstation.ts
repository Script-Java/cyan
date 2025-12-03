const SHIPSTATION_API_V2_URL = "https://api.shipstation.com";

interface ShipmentDetails {
  carrierCode: string;
  serviceCode: string;
  packageCode: string;
  weight: {
    value: number;
    units: "ounces" | "pounds";
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
    units: "inches" | "centimeters";
  };
  insuranceOptions?: {
    insured: boolean;
    insureAmount?: number;
  };
  internationalOptions?: {
    contents?: string;
    nonDelivery?: string;
  };
}

interface ShippingAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface CreateLabelPayload {
  orderId: number;
  shipmentDetails: ShipmentDetails;
  toAddress: ShippingAddress;
  testLabel?: boolean;
}

interface LabelResponse {
  labelDownload?: {
    href: string;
  };
  labelId?: number;
  tracking?: string;
  error?: string;
}

export class ShipStationAPI {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.SHIPSTATION_API_KEY || "";
    this.apiUrl = SHIPSTATION_API_V2_URL;

    if (!this.apiKey) {
      throw new Error("SHIPSTATION_API_KEY environment variable is not set");
    }
  }

  private getAuthHeader(): string {
    // ShipStation v2 API uses Bearer token authentication
    return `Bearer ${this.apiKey}`;
  }

  async createShippingLabel(
    payload: CreateLabelPayload
  ): Promise<LabelResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/orders/createlabel`, {
        method: "POST",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("ShipStation API error:", error);
        throw new Error(
          error.message || `Failed to create shipping label: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("ShipStation API request failed:", error);
      throw error;
    }
  }

  async getCarriers(): Promise<any[]> {
    try {
      const authHeader = this.getAuthHeader();
      console.log("ShipStation Request - getCarriers");

      // Try with Authorization header
      let response = await fetch(`${this.apiUrl}/carriers`, {
        method: "GET",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          "User-Agent": "Builder.io ShipStation Integration",
        },
      });

      console.log("ShipStation Carriers Response:", {
        status: response.status,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ShipStation Error Response:", {
          status: response.status,
          body: errorText.substring(0, 500),
        });

        // If 401, the API key might be invalid
        if (response.status === 401) {
          throw new Error(`Unauthorized: Invalid ShipStation API key. Check your credentials.`);
        }

        throw new Error(
          `Failed to fetch carriers: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Carriers fetched successfully:", data?.length || 0);
      return data;
    } catch (error) {
      console.error("Failed to get carriers:", error);
      throw error;
    }
  }

  async getServices(carrierCode: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/carriers/getavailableservices?carrierCode=${carrierCode}`,
        {
          method: "GET",
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to get services:", error);
      throw error;
    }
  }

  async getRates(payload: any): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiUrl}/shipments/getrates`, {
        method: "POST",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch rates: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to get rates:", error);
      throw error;
    }
  }
}

export const shipstationAPI = new ShipStationAPI();
