import { RequestHandler } from "express";
import { ecwidAPI } from "../utils/ecwid";

interface PaymentRequest {
  amount: number;
  currency: string;
  payment_method_id: string;
  payment_instrument?: {
    type: string;
    number?: string;
    expiry_month?: number;
    expiry_year?: number;
    cvv?: string;
    cardholder_name?: string;
  };
  description?: string;
  reference_id?: string;
  order_id?: number;
}

/**
 * Get available payment methods
 */
export const handleGetPaymentMethods: RequestHandler = async (req, res) => {
  try {
    // Return standard payment methods for Ecwid
    const methods = [
      {
        id: "stripe",
        name: "Credit Card (Stripe)",
        type: "card",
      },
      {
        id: "paypal",
        name: "PayPal",
        type: "paypal",
      },
      {
        id: "bank_transfer",
        name: "Bank Transfer",
        type: "bank",
      },
    ];

    res.json({
      success: true,
      data: methods,
    });
  } catch (error) {
    console.error("Get payment methods error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to get payment methods",
    });
  }
};

/**
 * Process a payment via Ecwid
 * Note: Actual payment processing is typically handled by Ecwid's payment gateway
 */
export const handleProcessPayment: RequestHandler = async (req, res) => {
  try {
    const paymentData = req.body as PaymentRequest;

    // Validate required fields
    if (
      !paymentData.amount ||
      !paymentData.currency ||
      !paymentData.payment_method_id
    ) {
      return res.status(400).json({
        error: "Missing required fields: amount, currency, payment_method_id",
      });
    }

    // Log payment for record-keeping
    console.log("Processing payment via Ecwid:", {
      amount: paymentData.amount,
      currency: paymentData.currency,
      method: paymentData.payment_method_id,
      orderId: paymentData.order_id,
    });

    // In production, this would integrate with Ecwid's payment gateway
    // For now, we acknowledge the payment and return success
    res.status(201).json({
      success: true,
      data: {
        id: `payment_${Date.now()}`,
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_method_id: paymentData.payment_method_id,
        status: "processing",
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Process payment error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process payment";
    res.status(400).json({
      error: errorMessage,
    });
  }
};
