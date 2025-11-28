import { createRequire } from "module";
const require = createRequire(import.meta.url);

let squareClient: any = null;

function getSquareClient() {
  if (!squareClient) {
    try {
      const squarePkg = require("square");
      const SquareClient = squarePkg.SquareClient;

      if (!SquareClient) {
        throw new Error("SquareClient not found in package exports");
      }

      squareClient = new SquareClient({
        accessToken: process.env.SQUARE_ACCESS_TOKEN,
        environment: "production",
      });
    } catch (error) {
      console.error("Failed to initialize Square client:", error);
      throw new Error(`Square SDK initialization failed: ${error instanceof Error ? error.message : String(error)}`);
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
