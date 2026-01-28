// Valid ISO 3166-1 alpha-2 country codes
const VALID_COUNTRY_CODES = new Set([
  "US",
  "GB",
  "CA",
  "AU",
  "DE",
  "FR",
  "IT",
  "ES",
  "NL",
  "BE",
  "CH",
  "AT",
  "SE",
  "NO",
  "DK",
  "FI",
  "PL",
  "CZ",
  "SK",
  "HU",
  "RO",
  "BG",
  "GR",
  "PT",
  "IE",
  "NZ",
  "SG",
  "HK",
  "JP",
  "KR",
  "TW",
  "CN",
  "IN",
  "BR",
  "MX",
  "AR",
  "CO",
  "PE",
  "CL",
  "ZA",
  "KE",
  "NG",
  "EG",
  "IL",
  "AE",
  "SA",
  "QA",
  "TH",
  "MY",
  "ID",
  "PH",
  "VN",
  "TW",
  "GR",
  "CY",
  "MT",
  "LU",
  "IS",
  "HR",
  "SI",
  "LV",
  "LT",
  "EE",
  "GE",
  "KZ",
  "UA",
  "BY",
  "RU",
  "TR",
  "LB",
  "JO",
  "AE",
]);

/**
 * Validate if a country code is a valid ISO 3166-1 alpha-2 code
 */
export function isValidCountryCode(code: string | undefined): boolean {
  if (!code) return true; // Allow empty/undefined
  return VALID_COUNTRY_CODES.has(code.toUpperCase());
}

/**
 * Validate email format
 */
export function isValidEmail(email: string | undefined): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate phone number format (basic - allows digits, +, -, parentheses, spaces)
 */
export function isValidPhone(phone: string | undefined): boolean {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\d+\-().\s]{7,20}$/;
  return phoneRegex.test(phone);
}

/**
 * Sanitize string input - remove potential XSS characters
 */
export function sanitizeInput(input: string | undefined): string {
  if (!input) return "";
  // Remove any HTML/script tags and dangerous characters
  return input
    .replace(/[<>"{};]/g, "")
    .trim()
    .slice(0, 255);
}

/**
 * Validate address field
 */
export function isValidAddress(address: string | undefined): boolean {
  if (!address) return false;
  // Address should be 1-255 characters, no dangerous characters
  return (
    address.length > 0 && address.length <= 255 && !/[<>"{};]/.test(address)
  );
}

let squareClient: any = null;

export async function getSquareClient() {
  if (!squareClient) {
    try {
      console.log("Initializing Square SDK...");

      // Check environment variables - token is required
      const accessToken = process.env.SQUARE_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error(
          "SQUARE_ACCESS_TOKEN environment variable is not configured. This is required for Square API operations.",
        );
      }

      console.log("Access token found, length:", accessToken.length);

      // Import Square SDK - the correct export is SquareClient
      let SquareClientClass;
      try {
        // First try ES module import
        const squareModule = await import("square");
        SquareClientClass = squareModule.SquareClient || squareModule.default;
      } catch (importError) {
        console.warn(
          "ES module import failed, falling back to require:",
          importError,
        );
        // Fallback to CommonJS require
        const squareModule = require("square");
        SquareClientClass = squareModule.SquareClient;
      }

      if (!SquareClientClass || typeof SquareClientClass !== "function") {
        throw new Error(
          `Square SquareClient not found or not a constructor. Received: ${typeof SquareClientClass}`,
        );
      }

      // Initialize with correct environment string
      squareClient = new SquareClientClass({
        accessToken: accessToken,
        environment: "sandbox",
      });

      console.log("Square SDK client initialized successfully");

      // Verify APIs are accessible (v43.2.1+ exposes APIs as objects)
      if (!squareClient.payments) {
        throw new Error("payments API not accessible on Square client");
      }

      if (!squareClient.orders) {
        throw new Error("orders API not accessible on Square client");
      }

      console.log("Square APIs verified - payments and orders APIs accessible");
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
  customerPhone?: string;
  customerFirstName?: string;
  customerLastName?: string;
  redirectUrl: string;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  discountCode?: string;
  shippingOptionId?: number;
  shippingOptionName?: string;
  estimatedDeliveryDate?: string;
  items?: Array<{
    product_name: string;
    quantity: number;
    price: number;
    options?: Array<{ option_id: string; option_value: string }>;
  }>;
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    street?: string;
    street2?: string;
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
        "SQUARE_ACCESS_TOKEN environment variable is not configured",
      );
    }

    // Build the pre-populated buyer address from shipping data
    const buyerAddress: any = {};
    if (data.shippingAddress) {
      if (data.shippingAddress.street)
        buyerAddress.address_line_1 = data.shippingAddress.street;
      if (data.shippingAddress.street2)
        buyerAddress.address_line_2 = data.shippingAddress.street2;
      if (data.shippingAddress.city)
        buyerAddress.locality = data.shippingAddress.city;
      if (data.shippingAddress.state)
        buyerAddress.administrative_district_level_1 =
          data.shippingAddress.state;
      if (data.shippingAddress.postalCode)
        buyerAddress.postal_code = data.shippingAddress.postalCode;
      if (data.shippingAddress.country)
        buyerAddress.country = data.shippingAddress.country;
    }

    // Append order ID to redirect URL as query parameter for Square
    let finalRedirectUrl = data.redirectUrl;
    if (finalRedirectUrl && !finalRedirectUrl.includes("orderId=")) {
      const separator = finalRedirectUrl.includes("?") ? "&" : "?";
      finalRedirectUrl = `${finalRedirectUrl}${separator}redirected=true`;
    }

    // Build customer contact info
    const customerContactInfo: any = {};
    if (data.customerEmail) {
      customerContactInfo.email_address = data.customerEmail;
    }
    if (data.customerPhone) {
      customerContactInfo.phone_number = data.customerPhone;
    }

    // Add name to contact info
    const firstName =
      data.customerFirstName || data.customerName?.split(" ")[0] || "";
    const lastName =
      data.customerLastName || data.customerName?.split(" ")[1] || "";

    if (firstName || lastName) {
      const displayName = `${firstName} ${lastName}`.trim();
      if (displayName) {
        customerContactInfo.display_name = displayName;
      }
    }

    // Build line items from the items array
    const lineItems: any[] = [];

    if (data.items && data.items.length > 0) {
      let itemIndex = 0;
      for (const item of data.items) {
        // Build product name with options appended
        let displayName = item.product_name;
        if (item.options && item.options.length > 0) {
          const optionsText = item.options
            .map((opt) => opt.option_value)
            .join(", ");
          displayName = `${item.product_name} (${optionsText})`;
        }

        lineItems.push({
          uid: `item-${itemIndex}`,
          name: displayName,
          quantity: item.quantity.toString(),
          base_price_money: {
            amount: Math.round(item.price * 100),
            currency: data.currency || "USD",
          },
        });
        itemIndex++;
      }
    } else {
      // Fallback: create a single line item
      lineItems.push({
        uid: "item-0",
        name: "Order " + formatOrderNumber(data.orderId),
        quantity: "1",
        base_price_money: {
          amount: amountInCents,
          currency: data.currency || "USD",
        },
      });
    }

    // Add shipping as a line item so it displays in order summary
    let shippingLineItemName = "Shipping";
    if (data.shippingOptionName) {
      shippingLineItemName = data.shippingOptionName;
      if (data.estimatedDeliveryDate) {
        const deliveryDate = new Date(data.estimatedDeliveryDate);
        const formattedDate = deliveryDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        shippingLineItemName = `${shippingLineItemName} - Arrives by ${formattedDate}`;
      }
    }

    if (data.shipping && data.shipping > 0) {
      lineItems.push({
        uid: `shipping-${data.orderId}`,
        name: shippingLineItemName,
        quantity: "1",
        base_price_money: {
          amount: Math.round(data.shipping * 100),
          currency: data.currency || "USD",
        },
        note: "Shipping",
      });
    }

    // Build the payment link request body with full order details
    const paymentLinkBody: any = {
      idempotency_key: `${data.orderId}-${Date.now()}-${Math.random()}`,
      checkout_options: {
        ask_for_shipping_address: true,
        allow_tipping: false,
        enable_coupon: true,
        enable_loyalty: true,
        merchant_support_email: "sticky@stickyslap.com",
        accepted_payment_methods: {},
      },
      pre_populated_data: {},
    };

    // Only add buyer_address if it has data
    if (Object.keys(buyerAddress).length > 0) {
      paymentLinkBody.pre_populated_data.buyer_address = buyerAddress;
    }

    // Only add customer_contact_info if it has data
    if (Object.keys(customerContactInfo).length > 0) {
      paymentLinkBody.pre_populated_data.customer_contact_info =
        customerContactInfo;
    }

    // Build order with detailed line items to show Order Summary on Square checkout page
    const orderObject: any = {
      location_id: locationId,
      reference_id: `order-${data.orderId}`,
      line_items: lineItems,
      discounts: [],
    };

    // Add discount if present
    if (data.discount && data.discount > 0) {
      const discountName = data.discountCode
        ? `Discount (${data.discountCode})`
        : "Discount";
      orderObject.discounts.push({
        uid: `discount-${data.orderId}`,
        name: discountName,
        type: "FIXED_AMOUNT",
        amount_money: {
          amount: Math.round(data.discount * 100),
          currency: data.currency || "USD",
        },
      });
    }

    // Add tax if present
    // Square requires either 'percentage' or 'applied_money' (or both)
    if (data.tax && data.tax > 0) {
      orderObject.taxes = [
        {
          uid: `tax-${data.orderId}`,
          name: "Tax",
          type: "ADDITIVE",
          percentage: "8.0",
          applied_money: {
            amount: Math.round(data.tax * 100),
            currency: data.currency || "USD",
          },
        },
      ];
    }

    // Add shipping if present
    if (data.shipping && data.shipping > 0) {
      let shippingName = "Shipping";

      // Use provided shipping option name first
      if (data.shippingOptionName) {
        shippingName = data.shippingOptionName;

        // Add estimated delivery date to shipping name if provided
        if (data.estimatedDeliveryDate) {
          const deliveryDate = new Date(data.estimatedDeliveryDate);
          const formattedDate = deliveryDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          shippingName = `${shippingName} - Arrives by ${formattedDate}`;
        }
      } else if (data.shippingOptionId) {
        // Fallback: Fetch the shipping option name if ID is provided but name wasn't passed
        try {
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(
            process.env.SUPABASE_URL || "",
            process.env.SUPABASE_SERVICE_KEY || "",
          );

          const { data: shippingOption } = await supabase
            .from("shipping_options")
            .select("name")
            .eq("id", data.shippingOptionId)
            .single();

          if (shippingOption?.name) {
            shippingName = shippingOption.name;

            // Add estimated delivery date if provided
            if (data.estimatedDeliveryDate) {
              const deliveryDate = new Date(data.estimatedDeliveryDate);
              const formattedDate = deliveryDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              shippingName = `${shippingName} - Arrives by ${formattedDate}`;
            }
          }
        } catch (err) {
          console.warn("Failed to fetch shipping option name:", err);
        }
      }

      orderObject.shipping = {
        name: shippingName,
        charge: {
          money: {
            amount: Math.round(data.shipping * 100),
            currency: data.currency || "USD",
          },
        },
      };
    }

    paymentLinkBody.order = orderObject;

    // Add the redirect URL for after payment completion
    if (data.redirectUrl) {
      paymentLinkBody.redirect_url = data.redirectUrl;
    }

    // Add the total amount the payment link should collect
    // This is the grand total including all line items, taxes, and shipping
    paymentLinkBody.amount_money = {
      amount: amountInCents,
      currency: data.currency || "USD",
    };

    console.log("Creating Square Payment Link via REST API:", {
      orderId: data.orderId,
      amount: amountInCents,
      currency: data.currency,
      locationId: locationId,
      hasCustomerEmail: !!data.customerEmail,
      hasCustomerPhone: !!data.customerPhone,
      itemsCount: data.items?.length || 0,
      shippingOptionName: data.shippingOptionName,
      estimatedDeliveryDate: data.estimatedDeliveryDate,
    });

    // Make direct HTTP call to Square Payment Links API
    console.log("Square API Details:", {
      tokenLength: accessToken.length,
      tokenPrefix: accessToken.substring(0, 10),
      locationId: locationId,
    });

    console.log("Pre-populated data being sent to Square:", {
      hasBuyerAddress: !!Object.keys(buyerAddress).length,
      hasCustomerContactInfo: !!Object.keys(customerContactInfo).length,
    });

    console.log("Payment Link Body - Order Details:", {
      location_id: paymentLinkBody.order?.location_id,
      lineItems: paymentLinkBody.order?.line_items?.length,
      lineItemsDetail: paymentLinkBody.order?.line_items?.map((li: any) => ({
        name: li.name,
        quantity: li.quantity,
        amount: li.base_price_money?.amount,
      })),
      discountAmount:
        paymentLinkBody.order?.discounts?.[0]?.applied_money?.amount,
      discountName: paymentLinkBody.order?.discounts?.[0]?.name,
      taxAmount: paymentLinkBody.order?.taxes?.[0]?.applied_money?.amount,
      shippingName: paymentLinkBody.order?.shipping?.name,
      shippingAmount: paymentLinkBody.order?.shipping?.charge?.money?.amount,
      hasPrePopulatedData:
        Object.keys(paymentLinkBody.pre_populated_data).length > 0,
      frontendData: {
        subtotal: data.subtotal,
        tax: data.tax,
        shipping: data.shipping,
        discount: data.discount,
        total: data.amount,
      },
      expectedTotal:
        (data.subtotal + data.tax + data.shipping - (data.discount || 0)) * 100,
      sentTotal: data.amount * 100,
    });

    const requestBody = JSON.stringify(paymentLinkBody);
    console.log("Square Payment Link Request Body:", {
      bodySize: requestBody.length,
      body: paymentLinkBody,
    });

    const response = await fetch(
      "https://connect.squareup.com/v2/online-checkout/payment-links",
      {
        method: "POST",
        headers: {
          "Square-Version": "2025-10-16",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: requestBody,
      },
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Square Payment Link API error:", {
        status: response.status,
        statusText: response.statusText,
        tokenLength: accessToken.length,
        fullError: responseData,
        errorDetails:
          responseData?.errors?.map((e: any) => ({
            code: e.code,
            detail: e.detail,
            field: e.field,
            category: e.category,
          })) || [],
      });

      const errorMessage =
        responseData?.errors?.[0]?.detail ||
        responseData?.errors?.[0]?.code ||
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
