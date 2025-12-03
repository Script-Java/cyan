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
    // Return hardcoded common carriers
    // ShipStation v2 API has different endpoints, so we'll use standard carriers
    const carriers = [
      { name: "USPS", code: "usps" },
      { name: "UPS", code: "ups" },
      { name: "FedEx", code: "fedex" },
      { name: "DHL Express", code: "dhl_express" },
      { name: "OnTrac", code: "ontrac" },
    ];

    console.log("Returning hardcoded carriers:", carriers.length);
    return carriers;
  }

  async getServices(carrierCode: string): Promise<any[]> {
    // Return services based on carrier
    const servicesByCarrier: Record<string, any[]> = {
      usps: [
        { name: "USPS First Class Mail", code: "usps_first_class_mail" },
        { name: "USPS Priority Mail", code: "usps_priority_mail" },
        { name: "USPS Priority Mail Express", code: "usps_priority_mail_express" },
        { name: "USPS Media Mail", code: "usps_media_mail" },
        { name: "USPS Parcel Select", code: "usps_parcel_select" },
      ],
      ups: [
        { name: "UPS Ground", code: "ups_ground" },
        { name: "UPS 3 Day Select", code: "ups_3_day_select" },
        { name: "UPS 2nd Day Air", code: "ups_2nd_day_air" },
        { name: "UPS Next Day Air", code: "ups_next_day_air" },
        { name: "UPS Next Day Air Saver", code: "ups_next_day_air_saver" },
      ],
      fedex: [
        { name: "FedEx Ground", code: "fedex_ground" },
        { name: "FedEx Home Delivery", code: "fedex_home_delivery" },
        { name: "FedEx 2Day", code: "fedex_2day" },
        { name: "FedEx Overnight", code: "fedex_overnight" },
        { name: "FedEx Priority Overnight", code: "fedex_priority_overnight" },
      ],
      dhl_express: [
        { name: "DHL Express 12:00", code: "dhl_express_12_00" },
        { name: "DHL Express Worldwide", code: "dhl_express_worldwide" },
      ],
      ontrac: [
        { name: "OnTrac Ground", code: "ontrac_ground" },
        { name: "OnTrac Plus", code: "ontrac_plus" },
      ],
    };

    const services = servicesByCarrier[carrierCode] || [];
    console.log(`Returning ${services.length} services for carrier: ${carrierCode}`);
    return services;
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
