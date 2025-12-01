import { createRequire } from "module";
const require = createRequire(import.meta.url);

let squareClient: any = null;

export function getSquareClient() {
  if (!squareClient) {
    try {
      console.log("Initializing Square SDK...");

      // Check environment variables first
      const accessToken = process.env.SQUARE_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error("SQUARE_ACCESS_TOKEN environment variable is not set");
      }

      console.log("Access token found, length:", accessToken.length);

      // Import Square SDK with correct destructuring for v43+
      const { Client } = require("square");

      if (!Client) {
        throw new Error("Square Client not found in package exports");
      }

      // Initialize with correct environment string
      squareClient = new Client({
        accessToken: accessToken,
        environment: "sandbox",
      });

      console.log("Square SDK client initialized successfully");

      // Verify APIs are accessible
      if (!squareClient.paymentsApi) {
        throw new Error("paymentsApi not accessible on Square client");
      }

      if (!squareClient.ordersApi) {
        throw new Error("ordersApi not accessible on Square client");
      }

      console.log(
        "Square APIs verified - paymentsApi and ordersApi accessible",
      );
    } catch (error) {
      console.error("Failed to initialize Square client:", error);
      throw new Error(
        `Square SDK initialization failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return squareClient;
}

export function getPaymentsApi() {
  return getSquareClient().paymentsApi;
}

export function getLocationsApi() {
  return getSquareClient().locationsApi;
}

export function getOrdersApi() {
  return getSquareClient().ordersApi;
}

export function getCheckoutApi() {
  // Square SDK doesn't have a dedicated checkoutApi, we use ordersApi instead
  return getSquareClient().ordersApi;
}

export async function processSquarePayment(paymentData: {
  sourceId: string;
  amount: number;
  currency: string;
  orderId?: string;
  customerEmail?: string;
  customerName?: string;
}): Promise<any> {
  try {
    // Amount should be in the smallest currency unit (cents for USD)
    const amountInCents = Math.round(paymentData.amount * 100);

    const paymentBody = {
      sourceId: paymentData.sourceId,
      amountMoney: {
        amount: amountInCents,
        currency: paymentData.currency || "USD",
      },
      autocomplete: true,
      idempotencyKey: `${Date.now()}-${Math.random()}`,
      ...(paymentData.orderId && { orderId: paymentData.orderId.toString() }),
      ...(paymentData.customerName && {
        customerId: paymentData.customerName,
      }),
      ...(paymentData.customerEmail && {
        receiptEmail: paymentData.customerEmail,
      }),
    };

    console.log(
      "Processing Square payment with amount:",
      amountInCents,
      "cents",
    );

    const response = await getPaymentsApi().createPayment(paymentBody);

    if (response.result) {
      console.log("Square payment processed successfully:", response.result.id);
      return {
        success: true,
        paymentId: response.result.id,
        status: response.result.status,
        amount: response.result.amountMoney?.amount,
        currency: response.result.amountMoney?.currency,
      };
    }

    throw new Error("Payment processing failed - no result returned");
  } catch (error) {
    console.error("Square payment error:", error);

    // More detailed error handling
    if (error && typeof error === "object") {
      const errorObj = error as any;

      // Check for authentication errors
      if (
        errorObj?.errors?.[0]?.code === "UNAUTHORIZED" ||
        errorObj?.errors?.[0]?.detail?.includes("Invalid API key")
      ) {
        console.error("Square authentication failed - check access token");
        throw new Error(
          "Square authentication failed. Please verify your access token is valid and has the required permissions.",
        );
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

export async function getSquareLocations(): Promise<any[]> {
  try {
    const response = await getLocationsApi().listLocations();
    return response.result?.locations || [];
  } catch (error) {
    console.error("Error fetching Square locations:", error);
    return [];
  }
}

export async function createSquarePaymentLink(data: {
  orderId: number;
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  customerName: string;
  redirectUrl: string;
}): Promise<{
  success: boolean;
  paymentLinkUrl?: string;
  error?: string;
}> {
  try {
    const amountInCents = Math.round(data.amount * 100);

    // Get the first location ID from the account (required by Square Payment Links API)
    const locationId = process.env.SQUARE_LOCATION_ID;
    if (!locationId) {
      throw new Error(
        "SQUARE_LOCATION_ID environment variable is not configured. Please set it to your Square location ID.",
      );
    }

    const paymentLinkBody = {
      idempotencyKey: `${data.orderId}-${Date.now()}`,
      quickPay: {
        locationId: locationId,
        name: `Order #${data.orderId}`,
        description: data.description,
        priceMoney: {
          amount: BigInt(amountInCents),
          currency: data.currency || "USD",
        },
      },
      checkoutOptions: {
        redirectUrl: data.redirectUrl,
      },
      prePopulatedData: {
        buyerEmail: data.customerEmail,
      },
    };

    console.log("Creating Square Payment Link:", {
      orderId: data.orderId,
      amount: amountInCents,
      currency: data.currency,
      locationId: locationId,
    });

    const client = getSquareClient();
    const response = await client.checkout.paymentLinks.create(paymentLinkBody);

    if (response.result?.url) {
      console.log("Payment Link created successfully:", response.result.id);
      return {
        success: true,
        paymentLinkUrl: response.result.url,
      };
    }

    throw new Error("Failed to create payment link - no URL returned");
  } catch (error) {
    console.error("Square Payment Link error:", error);

    if (error && typeof error === "object") {
      const errorObj = error as any;

      if (errorObj?.errors?.[0]?.detail) {
        return {
          success: false,
          error: errorObj.errors[0].detail,
        };
      }

      if (errorObj?.message) {
        return {
          success: false,
          error: errorObj.message,
        };
      }
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error creating payment link",
    };
  }
}
