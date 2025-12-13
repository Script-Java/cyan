let squareClient: any = null;

export async function getSquareClient() {
  if (!squareClient) {
    try {
      console.log("Initializing Square SDK...");

      // Check environment variables first
      const accessToken = process.env.SQUARE_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error("SQUARE_ACCESS_TOKEN environment variable is not set");
      }

      console.log("Access token found, length:", accessToken.length);

      // Import Square SDK - the correct export is SquareClient
      let SquareClientClass;
      try {
        // First try ES module import
        const squareModule = await import("square");
        SquareClientClass = squareModule.SquareClient || squareModule.default;
      } catch (importError) {
        console.warn("ES module import failed, falling back to require:", importError);
        // Fallback to CommonJS require
        const squareModule = require("square");
        SquareClientClass = squareModule.SquareClient;
      }

      if (!SquareClientClass || typeof SquareClientClass !== "function") {
        throw new Error(`Square SquareClient not found or not a constructor. Received: ${typeof SquareClientClass}`);
      }

      // Initialize with correct environment string
      squareClient = new SquareClientClass({
        accessToken: accessToken,
        environment: "sandbox",
      });

      console.log("Square SDK client initialized successfully");

      // Verify APIs are accessible (v43.2.1+ uses method names like payments(), orders(), etc)
      if (typeof squareClient.payments !== "function") {
        throw new Error("payments() method not accessible on Square client");
      }

      if (typeof squareClient.orders !== "function") {
        throw new Error("orders() method not accessible on Square client");
      }

      console.log(
        "Square APIs verified - payments() and orders() methods accessible",
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

export async function getPaymentsApi() {
  const client = await getSquareClient();
  if (!client.payments) {
    throw new Error("Square payments API is not available");
  }
  return client.payments;
}

export async function getLocationsApi() {
  const client = await getSquareClient();
  if (!client.locations) {
    throw new Error("Square locations API is not available");
  }
  return client.locations;
}

export async function getOrdersApi() {
  const client = await getSquareClient();
  if (!client.orders) {
    throw new Error("Square orders API is not available");
  }
  return client.orders;
}

export async function getCheckoutApi() {
  const client = await getSquareClient();
  if (!client.checkout) {
    throw new Error("Square checkout API is not available");
  }
  return client.checkout;
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

    const paymentsApi = await getPaymentsApi();
    const response = await paymentsApi.createPayment(paymentBody);

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
    const locationsApi = await getLocationsApi();
    const response = await locationsApi.listLocations();
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
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}): Promise<{
  success: boolean;
  paymentLinkUrl?: string;
  error?: string;
}> {
  try {
    const amountInCents = Math.round(data.amount * 100);

    // Get the location ID (required by Square Payment Links API)
    const locationId = process.env.SQUARE_LOCATION_ID;
    if (!locationId) {
      throw new Error(
        "SQUARE_LOCATION_ID environment variable is not configured.",
      );
    }

    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error(
        "SQUARE_ACCESS_TOKEN environment variable is not configured.",
      );
    }

    // Build the pre-populated buyer address from shipping data
    const buyerAddress: any = {};
    if (data.shippingAddress) {
      if (data.shippingAddress.street)
        buyerAddress.address_line_1 = data.shippingAddress.street;
      if (data.shippingAddress.city) buyerAddress.locality = data.shippingAddress.city;
      if (data.shippingAddress.state)
        buyerAddress.administrative_district_level_1 =
          data.shippingAddress.state;
      if (data.shippingAddress.postalCode)
        buyerAddress.postal_code = data.shippingAddress.postalCode;
      if (data.shippingAddress.country)
        buyerAddress.country = data.shippingAddress.country;
    }

    // Build the payment link request body for Square's Payment Links API
    // Following the structure from the Square Payment Links API documentation
    const paymentLinkBody = {
      idempotency_key: `${data.orderId}-${Date.now()}-${Math.random()}`,
      quick_pay: {
        location_id: locationId,
        name: "STICKY SLAP",
        price_money: {
          amount: amountInCents,
          currency: data.currency || "USD",
        },
      },
      checkout_options: {
        ask_for_shipping_address: true,
        allow_tipping: false,
        enable_coupon: true,
        enable_loyalty: true,
        merchant_support_email: "sticky@stickyslap.com",
        accepted_payment_methods: {},
      },
      pre_populated_data: {
        buyer_address: {},
      },
    };

    console.log("Creating Square Payment Link via REST API:", {
      orderId: data.orderId,
      amount: amountInCents,
      currency: data.currency,
      locationId: locationId,
      customerEmail: data.customerEmail,
    });

    // Make direct HTTP call to Square Payment Links API
    const response = await fetch(
      "https://connect.squareup.com/v2/online-checkout/payment-links",
      {
        method: "POST",
        headers: {
          "Square-Version": "2025-10-16",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentLinkBody),
      },
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Square Payment Link API error:", {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
      });

      const errorMessage =
        responseData?.errors?.[0]?.detail ||
        responseData?.message ||
        `API returned ${response.status}`;

      return {
        success: false,
        error: errorMessage,
      };
    }

    if (responseData?.payment_link?.url) {
      console.log("Payment Link created successfully:", {
        linkId: responseData.payment_link.id,
        url: responseData.payment_link.url,
      });

      return {
        success: true,
        paymentLinkUrl: responseData.payment_link.url,
      };
    }

    console.error("Payment link response missing URL:", responseData);
    return {
      success: false,
      error: "Payment link created but no URL returned",
    };
  } catch (error) {
    console.error("Square Payment Link error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error creating payment link",
    };
  }
}
