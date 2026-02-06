import { RequestHandler } from "express";
import { getOrdersApi } from "../utils/square";

/**
 * Confirm checkout after Square redirect
 * Implements "Green Flag Check" - verifies payment with Square API before marking as paid
 */
export const handleConfirmCheckout: RequestHandler = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) return res.status(400).json({ error: "Missing orderId" });

        const id = parseInt(orderId, 10);
        if (isNaN(id)) return res.status(400).json({ error: "Invalid order ID" });

        console.log(`🔍 Verifying payment for Order #${id} with Square...`);

        const { supabase } = await import("../utils/supabase");

        // Fetch Order from database
        const { data: order, error: dbError } = await supabase
            .from("orders")
            .select("*")
            .eq("id", id)
            .single();

        if (dbError || !order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // CASE 1: Already paid (webhook beat the user back)
        if (order.status === "paid" || order.status === "completed") {
            console.log("✅ Order already marked as paid:", id);
            return res.json({
                success: true,
                order: { id, status: order.status, total: order.total },
            });
        }

        // CASE 2: Pending payment - verify with Square
        if (order.status === "pending_payment") {
            try {
                const ordersApi = await getOrdersApi();
                let squareOrder;

                // Try to find the Square Order by saved square_order_id or by reference ID
                if (order.square_order_id) {
                    console.log(`Checking Square Order ID: ${order.square_order_id}`);
                    try {
                        const { result } = await ordersApi.retrieveOrder(order.square_order_id);
                        squareOrder = result.order;
                    } catch (err) {
                        console.log("Order not found by square_order_id, trying reference ID...");
                    }
                }

                // Fallback: Search by reference ID (our Supabase order ID)
                if (!squareOrder) {
                    console.log(`Searching Square for Reference ID: order-${id}`);
                    try {
                        const { result } = await ordersApi.searchOrders({
                            limit: 1,
                            query: {
                                filter: {
                                    referenceIdFilter: {
                                        referenceId: `order-${id}`
                                    }
                                }
                            }
                        });
                        squareOrder = result.orders?.[0];
                    } catch (err) {
                        console.log("Order not found by reference ID either");
                    }
                }

                if (squareOrder) {
                    console.log(`Square Order State: ${squareOrder.state}`);

                    // CHECK FOR THE GREEN FLAG 🟢
                    // Order is paid if state is COMPLETED or if there's a successful tender
                    const tenders = squareOrder.tenders || [];
                    const successfulTender = tenders.find(
                        (t: any) => t.status === 'CAPTURED' || t.status === 'AUTHORIZED' || t.status === 'COMPLETED'
                    );

                    if (squareOrder.state === 'COMPLETED' || successfulTender) {
                        console.log("✅ Green Flag detected! Payment confirmed by Square.");

                        // Capture payment details for records
                        const paymentDetails = {
                            square_order_id: squareOrder.id,
                            tender_id: successfulTender?.id,
                            tender_status: successfulTender?.status,
                            amount: successfulTender?.amountMoney?.amount,
                            verified_at: new Date().toISOString()
                        };

                        // Update database to paid
                        await supabase
                            .from("orders")
                            .update({
                                status: "paid",
                                square_order_id: squareOrder.id,
                                square_payment_details: paymentDetails,
                                updated_at: new Date().toISOString(),
                            })
                            .eq("id", id);

                        console.log(`✅ Order #${id} marked as paid`);

                        return res.json({
                            success: true,
                            order: {
                                id: id,
                                status: "paid",
                                total: order.total,
                            },
                        });
                    } else {
                        console.log("❌ Square order found but payment not confirmed yet");
                        console.log(`Order state: ${squareOrder.state}, Tenders:`, tenders.length);
                    }
                } else {
                    console.log("❌ Square could not find any order matching this ID");
                }
            } catch (squareError) {
                console.error("Failed to verify with Square API:", squareError);
            }
        }

        // CASE 3: Payment not confirmed
        console.log("⏳ Payment pending verification");
        return res.status(200).json({
            success: false,
            message: "Payment pending verification",
            order: {
                id: id,
                status: "pending_payment",
            },
        });

    } catch (error) {
        console.error("Confirm checkout error:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Confirmation failed"
        });
    }
};
