import type { RequestHandler } from "express";
import { getPaymentsApi } from "../utils/square";
import { supabase, updateCustomerStoreCredit } from "../utils/supabase";

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

    // Create payment with Square
    const paymentsApi = getPaymentsApi();
    const paymentResult = await paymentsApi.createPayment({
      sourceId: token,
      amountMoney: {
        amount: amountInCents,
        currency: "USD",
      },
      customerId: `customer-${orderId}`,
      referenceId: `order-${orderId}`,
      note: `Payment for Order #${orderId}`,
      receiptEmail: customerEmail,
      receiptNumber: String(orderId),
    });

    if (!paymentResult.result?.payment?.id) {
      console.error("Payment failed - no payment ID returned");
      return res.status(400).json({
        error: "Payment processing failed",
      });
    }

    console.log("Square payment successful:", {
      paymentId: paymentResult.result.payment.id,
      status: paymentResult.result.payment.status,
      orderId,
    });

    // Update order status to paid
    const { data: updatedOrder } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_id: paymentResult.result.payment.id,
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

    res.status(200).json({
      success: true,
      payment: {
        id: paymentResult.result.payment.id,
        status: paymentResult.result.payment.status,
        amount: amount,
      },
      order: updatedOrder,
    });
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
