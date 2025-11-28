import { createRequire } from "module";
const require = createRequire(import.meta.url);

let squareClient: any = null;

function getSquareClient() {
  if (!squareClient) {
    try {
      const squarePkg = require("square");
      const Client = squarePkg.Client;

      squareClient = new Client({
        accessToken: process.env.SQUARE_ACCESS_TOKEN,
        environment: "production",
      });
    } catch (error) {
      console.error("Failed to initialize Square client:", error);
      throw new Error("Square SDK initialization failed");
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

    if (error instanceof Error) {
      throw error;
    }

    if (error && typeof error === "object" && "errors" in error) {
      const errorObj = error as any;
      throw new Error(
        errorObj?.errors?.[0]?.detail ||
          errorObj?.errors?.[0]?.message ||
          "Payment processing failed",
      );
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
