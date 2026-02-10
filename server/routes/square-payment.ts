import type { RequestHandler } from "express";
import { getPaymentsApi, getOrdersApi, getLocationsApi } from "../utils/square";
import { supabase, updateCustomerStoreCredit } from "../utils/supabase";
import { formatOrderNumber } from "../utils/order";

export const processSquarePayment: RequestHandler = async (req, res) => {
  try {
    const { token, orderId, amount, customerEmail, customerName } = req.body;

    if (!token || !orderId || !amount) {
      return res.status(400).json({
        error: "Missing required fields: token, orderId, amount",
      });
    }

    console.log("Processing Square Web Payments SDK payment:", {
      orderId,
      amount,
      customerEmail,
    });

    const amountInCents = Math.round(amount * 100);

    // Fetch full order details including items for Square Order creation
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          product_name,
          quantity,
          price
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !orderData) {
      console.error("Failed to fetch order details:", orderError);
      return res.status(404).json({ error: "Order not found" });
    }

    const ordersApi = await getOrdersApi();
    const paymentsApi = await getPaymentsApi();

    // Determine Location ID (Required for Orders)
    let locationId = process.env.SQUARE_LOCATION_ID;

    if (!locationId) {
      console.warn("SQUARE_LOCATION_ID not set, fetching from API...");
      try {
        const locationsApi = await getLocationsApi();
        const { result } = await locationsApi.listLocations();
        const mainLocation = result.locations?.find((l: any) => l.status === "ACTIVE");

        if (mainLocation) {
          locationId = mainLocation.id;
          console.log("Using fetched Location ID:", locationId);
        } else {
          console.error("No active locations found in Square account");
        }
      } catch (locError) {
        console.error("Failed to fetch locations:", locError);
      }
    }

    if (!locationId) {
      console.error("CRITICAL: Cannot create Square Order without a Location ID");
      // We will proceed to payment logic but Order creation will likely fail or be skipped
    }

    // Construct line items for Square Order
    const lineItems = orderData.order_items?.map((item: any) => ({
      name: item.product_name || "Custom Item",
      quantity: String(item.quantity),
      basePriceMoney: {
        amount: BigInt(Math.round((item.price || 0) * 100)),
        currency: "USD",
      },
    })) || [];

    // Create Square Order
    // This allows the order to appear in the "Orders" tab of the Square Dashboard
    // and provides line item details on the receipt.
    let squareOrderId: string | undefined;

    if (locationId) {
      const formattedOrderNum = formatOrderNumber(orderId);
      const orderRequest = {
        order: {
          locationId: locationId,
          referenceId: formattedOrderNum,
          note: `Order: ${formattedOrderNum}`,
          lineItems,
          totalMoney: {
            amount: BigInt(amountInCents),
            currency: "USD"
          }
        },
        idempotencyKey: `create-order-${orderId}-${Date.now()}`,
      };

      console.log("Creating Square Order...", JSON.stringify(orderRequest, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value // Handle BigInt serialization
      ));

      try {
        const { result: orderResult } = await ordersApi.createOrder(orderRequest);
        squareOrderId = orderResult.order?.id;
        console.log("Square Order Created:", squareOrderId);
      } catch (squareError) {
        console.error("Failed to create Square Order (proceeding with simple payment):", squareError);
      }
    } else {
      console.warn("Skipping Square Order creation due to missing Location ID");
    }

    // Create payment with Square
    const formattedOrderNumber = formatOrderNumber(orderId);
    const paymentRequest: any = {
      sourceId: token,
      amountMoney: {
        amount: BigInt(amountInCents), // SDK expects BigInt for amount
        currency: "USD",
      },
      customerId: `customer-${orderId}`,
      referenceId: formattedOrderNumber,
      note: `Order: ${formattedOrderNumber}`,
      receiptEmail: customerEmail,
      idempotencyKey: `payment-${orderId}-${Date.now()}`,
    };

    // Link the Payment to the Order if successful
    if (squareOrderId) {
      paymentRequest.orderId = squareOrderId;
    }

    const paymentResult = await paymentsApi.createPayment(paymentRequest);

    if (!paymentResult.result?.payment?.id) {
      console.error("Payment failed - no payment ID returned");
      return res.status(400).json({
        error: "Payment processing failed",
      });
    }

    console.log("Square payment successful:", {
      paymentId: paymentResult.result.payment.id,
      squareOrderId,
      status: paymentResult.result.payment.status,
      orderId,
    });

    // Update order status to paid
    // We update square_order_id so we can link back to it later
    const { data: updatedOrder } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_id: paymentResult.result.payment.id,
        square_order_id: squareOrderId,
        payment_method: "square",
      })
      .eq("id", orderId)
      .select()
      .single();

    // Award store credit (5% of order total)
    if (updatedOrder) {
      const earnedCredit = updatedOrder.total * 0.05;
      await updateCustomerStoreCredit(
        updatedOrder.customer_id,
        earnedCredit,
        `Earned 5% from order ${orderId}`,
      );

      console.log("Store credit awarded:", {
        customerId: updatedOrder.customer_id,
        amount: earnedCredit,
        orderId,
      });
    }

    // Return success response handling BigInt serialization
    const responseData = {
      success: true,
      payment: {
        id: paymentResult.result.payment.id,
        status: paymentResult.result.payment.status,
        amount: amount,
        orderId: squareOrderId
      },
      order: updatedOrder,
    };

    res.status(200).json(JSON.parse(JSON.stringify(responseData, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )));

  } catch (error) {
    console.error("Square payment processing error:", error);

    if (error && typeof error === "object") {
      const errorObj = error as any;

      if (errorObj?.errors?.[0]?.detail) {
        return res.status(400).json({
          error: errorObj.errors[0].detail,
        });
      }

      if (errorObj?.message) {
        return res.status(400).json({
          error: errorObj.message,
        });
      }
    }

    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Payment processing failed",
    });
  }
};
