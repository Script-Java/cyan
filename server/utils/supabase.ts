import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL || "https://bxkphaslciswfspuqdgo.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

if (!supabaseServiceKey) {
  console.warn(
    "SUPABASE_SERVICE_KEY not configured - Supabase operations may fail",
  );
}

// Use a placeholder key during build/initialization if no key is provided
// This prevents errors during module evaluation
const buildTimeKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1idWlsZC1wbGFjZWhvbGRlciJ9.dummy";
const keyToUse = supabaseServiceKey || buildTimeKey;

export const supabase = createClient(supabaseUrl, keyToUse);

interface CustomerData {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  store_credit?: number;
}

export async function syncCustomerToSupabase(
  customer: CustomerData,
): Promise<void> {
  try {
    const { data: existingCustomer, error: fetchError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customer.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking existing customer:", fetchError);
      throw fetchError;
    }

    if (existingCustomer) {
      // Update existing customer
      const { error: updateError } = await supabase
        .from("customers")
        .update({
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
          phone: customer.phone,
          company: customer.company,
          store_credit: customer.store_credit || 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customer.id);

      if (updateError) {
        console.error("Error updating customer:", updateError);
        throw updateError;
      }

      console.log("Customer updated in Supabase:", customer.id);
    } else {
      // Insert new customer
      const { error: insertError } = await supabase.from("customers").insert({
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
        company: customer.company,
        store_credit: customer.store_credit || 0,
      });

      if (insertError) {
        console.error("Error inserting customer:", insertError);
        throw insertError;
      }

      console.log("Customer inserted in Supabase:", customer.id);
    }
  } catch (error) {
    console.error("Error syncing customer to Supabase:", error);
    throw error;
  }
}

export async function getCustomerStoreCredit(
  customerId: number,
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("store_credit")
      .eq("id", customerId)
      .single();

    if (error) {
      console.error("Error fetching store credit from Supabase:", error);
      return 0;
    }

    return data?.store_credit || 0;
  } catch (error) {
    console.error("Error getting customer store credit:", error);
    return 0;
  }
}

export async function updateCustomerStoreCredit(
  customerId: number,
  amount: number,
  reason: string,
): Promise<boolean> {
  try {
    const currentBalance = await getCustomerStoreCredit(customerId);
    const newBalance = Math.max(0, currentBalance + amount);

    const { error: updateError } = await supabase
      .from("customers")
      .update({ store_credit: newBalance })
      .eq("id", customerId);

    if (updateError) {
      console.error("Error updating store credit:", updateError);
      return false;
    }

    const { error: transactionError } = await supabase
      .from("store_credit_transactions")
      .insert({
        customer_id: customerId,
        amount,
        reason,
        new_balance: newBalance,
        created_at: new Date().toISOString(),
      });

    if (transactionError) {
      console.error("Error recording transaction:", transactionError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating customer store credit:", error);
    return false;
  }
}

interface OrderData {
  customer_id: number;
  status: string;
  total: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  billing_address?: any;
  shipping_address?: any;
  items?: any[];
  bigcommerce_order_id?: number;
  estimated_delivery_date?: string;
}

export async function createSupabaseOrder(
  orderData: OrderData,
): Promise<{ id: number; success: boolean }> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .insert({
        customer_id: orderData.customer_id,
        status: orderData.status || "paid",
        total: orderData.total,
        subtotal: orderData.subtotal || 0,
        tax: orderData.tax || 0,
        shipping: orderData.shipping || 0,
        billing_address: orderData.billing_address,
        shipping_address: orderData.shipping_address,
        items: orderData.items || [],
        bigcommerce_order_id: orderData.bigcommerce_order_id,
        estimated_delivery_date: orderData.estimated_delivery_date || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating order in Supabase:", error);
      throw error;
    }

    console.log("Order created in Supabase:", data?.id);
    return { id: data?.id, success: true };
  } catch (error) {
    console.error("Error creating Supabase order:", error);
    throw error;
  }
}

export async function createOrderItems(
  orderId: number,
  items: any[],
): Promise<void> {
  try {
    const itemsData = items.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product_name || "Custom Sticker",
      quantity: item.quantity,
      price: item.price || 0.25,
      options: item.options || null,
      design_file_url: item.design_file_url || null,
    }));

    const { error } = await supabase.from("order_items").insert(itemsData);

    if (error) {
      console.error("Error creating order items:", error);
      throw error;
    }

    console.log("Order items created:", orderId);
  } catch (error) {
    console.error("Error creating order items:", error);
    throw error;
  }
}

export async function getOrderById(
  orderId: number,
  customerId: number,
): Promise<any> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (*)
      `,
      )
      .eq("id", orderId)
      .eq("customer_id", customerId)
      .single();

    if (error) {
      console.error("Error fetching order:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting order:", error);
    throw error;
  }
}

export async function getCustomerOrders(customerId: number): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching customer orders:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error getting customer orders:", error);
    throw error;
  }
}

export async function getPendingOrders(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, customers(*), order_items(*)")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending orders:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error getting pending orders:", error);
    throw error;
  }
}

export async function getActiveOrders(): Promise<any[]> {
  try {
    const activeStatuses = ["pending", "processing", "printing", "in transit"];
    const { data, error } = await supabase
      .from("orders")
      .select("*, customers(*), order_items(*)")
      .in("status", activeStatuses)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching active orders:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error getting active orders:", error);
    throw error;
  }
}
