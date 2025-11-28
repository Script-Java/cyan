import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || "",
);

interface AddCreditRequest {
  customer_id: number;
  amount: number;
  reason: string;
  notes?: string;
}

interface GetCustomerCreditRequest {
  customer_id: number;
}

/**
 * Get customer's store credit balance
 */
export const handleGetCustomerCredit: RequestHandler = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID required" });
    }

    const { data: customer, error } = await supabase
      .from("customers")
      .select("id, email, store_credit")
      .eq("id", customerId)
      .single();

    if (error || !customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({
      success: true,
      data: {
        customer_id: customer.id,
        email: customer.email,
        balance: parseFloat(customer.store_credit || "0"),
      },
    });
  } catch (error) {
    console.error("Get customer credit error:", error);
    res.status(500).json({ error: "Failed to get customer credit" });
  }
};

/**
 * Get all customers with their credit balances
 */
export const handleGetAllCustomersCredit: RequestHandler = async (req, res) => {
  try {
    const { data: customers, error } = await supabase
      .from("customers")
      .select("id, email, first_name, last_name, store_credit, created_at")
      .order("store_credit", { ascending: false });

    if (error) {
      throw error;
    }

    const formattedCustomers = customers.map((c) => ({
      id: c.id,
      email: c.email,
      name: `${c.first_name || ""} ${c.last_name || ""}`.trim(),
      balance: parseFloat(c.store_credit || "0"),
      created_at: c.created_at,
    }));

    res.json({
      success: true,
      data: formattedCustomers,
      count: formattedCustomers.length,
    });
  } catch (error) {
    console.error("Get all customers credit error:", error);
    res.status(500).json({ error: "Failed to get customers" });
  }
};

/**
 * Add or subtract store credit
 */
export const handleModifyStoreCredit: RequestHandler = async (req, res) => {
  try {
    const { customer_id, amount, reason, notes } = req.body as AddCreditRequest;
    const adminId = (req as any).customerId;

    if (!customer_id || amount === undefined || !reason) {
      return res
        .status(400)
        .json({ error: "Customer ID, amount, and reason are required" });
    }

    if (isNaN(amount) || amount === 0) {
      return res
        .status(400)
        .json({ error: "Amount must be a non-zero number" });
    }

    // Get current balance
    const { data: customer, error: fetchError } = await supabase
      .from("customers")
      .select("store_credit")
      .eq("id", customer_id)
      .single();

    if (fetchError || !customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const currentBalance = parseFloat(customer.store_credit || "0");
    const newBalance = currentBalance + amount;

    // Prevent negative balance
    if (newBalance < 0) {
      return res.status(400).json({
        error: `Insufficient credit. Current balance: $${currentBalance.toFixed(2)}`,
      });
    }

    // Update customer balance
    const { error: updateError } = await supabase
      .from("customers")
      .update({ store_credit: newBalance })
      .eq("id", customer_id);

    if (updateError) {
      throw updateError;
    }

    // Record transaction
    const transactionType = amount > 0 ? "add" : "subtract";
    const { error: transactionError } = await supabase
      .from("store_credit_transactions")
      .insert({
        customer_id,
        amount,
        transaction_type: transactionType,
        reason,
        admin_id: adminId,
        notes,
      });

    if (transactionError) {
      console.error("Transaction record error:", transactionError);
      // Don't fail the request if transaction logging fails
    }

    console.log(`Store credit updated for customer ${customer_id}:`, {
      amount,
      reason,
      oldBalance: currentBalance,
      newBalance,
    });

    res.status(200).json({
      success: true,
      message: `Credit ${amount > 0 ? "added" : "removed"} successfully`,
      data: {
        customer_id,
        old_balance: currentBalance,
        new_balance: newBalance,
        amount,
      },
    });
  } catch (error) {
    console.error("Modify store credit error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to modify store credit";
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Get credit transaction history for a customer
 */
export const handleGetCreditHistory: RequestHandler = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID required" });
    }

    const {
      data: transactions,
      error,
      count,
    } = await supabase
      .from("store_credit_transactions")
      .select("*", { count: "exact" })
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      throw error;
    }

    const formattedTransactions = transactions.map((t) => ({
      id: t.id,
      amount: parseFloat(t.amount),
      type: t.transaction_type,
      reason: t.reason,
      notes: t.notes,
      order_id: t.order_id,
      created_at: t.created_at,
    }));

    res.json({
      success: true,
      data: formattedTransactions,
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        total: count,
      },
    });
  } catch (error) {
    console.error("Get credit history error:", error);
    res.status(500).json({ error: "Failed to get credit history" });
  }
};

/**
 * Apply store credit to an order (deduct from customer balance)
 */
export const handleApplyStoreCreditToOrder: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { customer_id, order_id, amount } = req.body;

    if (!customer_id || !order_id || !amount) {
      return res
        .status(400)
        .json({ error: "Customer ID, order ID, and amount are required" });
    }

    // Get current balance
    const { data: customer, error: fetchError } = await supabase
      .from("customers")
      .select("store_credit")
      .eq("id", customer_id)
      .single();

    if (fetchError || !customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const currentBalance = parseFloat(customer.store_credit || "0");

    if (currentBalance < amount) {
      return res.status(400).json({
        error: "Insufficient store credit",
        available: currentBalance,
        requested: amount,
      });
    }

    const newBalance = currentBalance - amount;

    // Update customer balance
    const { error: updateError } = await supabase
      .from("customers")
      .update({ store_credit: newBalance })
      .eq("id", customer_id);

    if (updateError) {
      throw updateError;
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from("store_credit_transactions")
      .insert({
        customer_id,
        amount: -amount,
        transaction_type: "subtract",
        reason: "Applied to order",
        order_id,
      });

    if (transactionError) {
      console.error("Transaction record error:", transactionError);
    }

    res.json({
      success: true,
      message: "Store credit applied to order",
      data: {
        customer_id,
        order_id,
        amount_used: amount,
        remaining_balance: newBalance,
      },
    });
  } catch (error) {
    console.error("Apply store credit error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to apply store credit";
    res.status(500).json({ error: errorMessage });
  }
};
