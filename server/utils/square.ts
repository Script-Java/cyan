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

      // Import Square SDK - try multiple approaches for compatibility
      let Client;
      try {
        // First try ES module default export
        const squareModule = await import("square");
        Client = squareModule.default || squareModule.Client;
      } catch (importError) {
        console.warn("ES module import failed, falling back to require:", importError);
        // Fallback to CommonJS require
        Client = require("square").Client;
      }

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

export async function getPaymentsApi() {
  const client = await getSquareClient();
  if (!client.paymentsApi) {
    throw new Error("Square paymentsApi is not available");
  }
  return client.paymentsApi;
}

export async function getLocationsApi() {
  const client = await getSquareClient();
  if (!client.locationsApi) {
    throw new Error("Square locationsApi is not available");
  }
  return client.locationsApi;
}

export async function getOrdersApi() {
  const client = await getSquareClient();
  if (!client.ordersApi) {
    throw new Error("Square ordersApi is not available");
  }
  return client.ordersApi;
}

export async function getCheckoutApi() {
  const client = await getSquareClient();
  if (!client.checkoutApi) {
    throw new Error("Square checkoutApi is not available");
  }
  return client.checkoutApi;
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
    const paymentLinkBody = {
      idempotency_key: `${data.orderId}-${Date.now()}-${Math.random()}`,
      quick_pay: {
        name: "Stickyslap",
        location_id: locationId,
        price_money: {
          amount: amountInCents,
          currency: data.currency || "USD",
        },
      },
      checkout_options: {
        shipping_fee: {
          charge: {
            currency: data.currency || "USD",
            amount: 1000, // $10.00 in cents
          },
          name: "First Class",
        },
        ask_for_shipping_address: true,
        redirect_url: data.redirectUrl,
      },
      pre_populated_data: {
        buyer_email: data.customerEmail,
        buyer_address: buyerAddress,
      },
    };

    console.log("Creating Square Payment Link via REST API:", {
      orderId: data.orderId,
      amount: amountInCents,
      currency: data.currency,
      locationId: locationId,
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
