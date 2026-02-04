import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://bxkphaslciswfspuqdgo.supabase.co";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

console.log("Supabase Client Initialization:");
console.log("  URL:", supabaseUrl);
console.log(
  "  Key Length:",
  supabaseServiceKey ? supabaseServiceKey.length : "0 (Missing)",
);

if (!supabaseServiceKey) {
  console.warn(
    "SUPABASE_SERVICE_KEY not configured - Supabase operations may fail",
  );
}

// Use a placeholder key during build/initialization if no key is provided
// This prevents errors during module evaluation
const buildTimeKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1idWlsZC1wbGFjZWhvbGRlciJ9.dummy";
const keyToUse = supabaseServiceKey || buildTimeKey;

/**
 * Service role client - ONLY for background jobs and migrations
 * SECURITY: This client bypasses RLS. Use sparingly and document why.
 */
export const supabase = createClient(supabaseUrl, keyToUse, {
  auth: {
    persistSession: false,
  },
  global: {
    fetch: (url, options) => {
      return fetch(url, { ...options, timeout: 20000 } as any);
    },
  },
});

/**
 * Create a scoped Supabase client using user's JWT token
 * SECURITY: This enforces Row Level Security (RLS) by using the authenticated user's JWT
 *
 * Use this for all customer-facing API routes to ensure RLS policies are enforced.
 * RLS policies will check that the authenticated user can only access their own data.
 *
 * @param userJwt - The user's JWT token from the Authorization header
 * @returns Scoped Supabase client with RLS enforcement
 *
 * Example usage in a route:
 * ```typescript
 * const scopedSupabase = createScopedSupabaseClient(req.userJwt);
 * const { data } = await scopedSupabase.from('orders').select('*'); // RLS enforced
 * ```
 */
export function createScopedSupabaseClient(userJwt: string): SupabaseClient {
  return createClient(supabaseUrl, userJwt, {
    auth: {
      persistSession: false,
    },
    global: {
      fetch: (url, options) => {
        return fetch(url, { ...options, timeout: 20000 } as any);
      },
    },
  });
}

/**
 * Get or create a scoped Supabase client from request
 * SECURITY: Currently returns service role client for all authenticated endpoints
 *
 * NOTE: The app's JWT (signed with JWT_SECRET) cannot be used directly with Supabase RLS
 * because Supabase expects its own JWT format. RLS enforcement will be implemented when
 * Supabase Auth integration is properly set up.
 *
 * @param req - Express request with optional userJwt from auth middleware
 * @returns Service role client (RLS enforcement not yet active)
 */
export function getScopedSupabaseClient(req: any): SupabaseClient {
  // TODO: Replace with proper Supabase JWT when auth is integrated
  // For now, return service role client for all endpoints
  return supabase;
}

// Verify connection
(async () => {
  try {
    const { error } = await supabase
      .from("customers")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("Supabase connection check failed:", error.message);
    } else {
      console.log("Supabase connection check successful");
    }
  } catch (err) {
    console.error("Supabase connection check error:", err);
  }
})();

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
  discount?: number;
  discount_code?: string;
  billing_address?: any;
  shipping_address?: any;
  items?: any[];
  bigcommerce_order_id?: number;
  estimated_delivery_date?: string;
}

/**
 * Normalize address format from camelCase to snake_case for database storage
 * Handles both formats to be flexible with different input sources
 */
function normalizeAddressFormat(address: any): any {
  if (!address) return null;

  return {
    first_name: address.first_name || address.firstName || "",
    last_name: address.last_name || address.lastName || "",
    street_1: address.street_1 || address.street || "",
    street_2: address.street_2 || address.street2 || undefined,
    city: address.city || "",
    state_or_province: address.state_or_province || address.state || "",
    postal_code: address.postal_code || address.postalCode || "",
    country_iso2: address.country_iso2 || address.country || "",
    phone: address.phone || undefined,
  };
}

export async function createSupabaseOrder(
  orderData: OrderData,
): Promise<{ id: number; success: boolean }> {
  try {
    // Build order object with only columns that exist in the schema
    const orderToInsert: any = {
      customer_id: orderData.customer_id,
      status: orderData.status || "paid",
      total: orderData.total,
      subtotal: orderData.subtotal || 0,
      tax: orderData.tax || 0,
      shipping: orderData.shipping || 0,
      items: orderData.items || [],
    };

    // Add optional fields if they exist and column exists in schema
    if (orderData.bigcommerce_order_id) {
      orderToInsert.bigcommerce_order_id = orderData.bigcommerce_order_id;
    }
    // Note: discount and discount_code columns don't exist yet in the database
    // They are tracked but not persisted to the orders table at this time
    if (orderData.estimated_delivery_date) {
      orderToInsert.estimated_delivery_date = orderData.estimated_delivery_date;
    }
    if (orderData.shipping_address) {
      orderToInsert.shipping_address = normalizeAddressFormat(
        orderData.shipping_address,
      );
    }
    if (orderData.billing_address) {
      orderToInsert.billing_address = normalizeAddressFormat(
        orderData.billing_address,
      );
    }

    const { data, error } = await supabase
      .from("orders")
      .insert(orderToInsert)
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
      .select(
        "*, customers(id, first_name, last_name, email, phone), order_items(*)",
      )
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
    const activeStatuses = [
      "pending",
      "processing",
      "printing",
      "in transit",
      "paid",
      "pending_payment",
    ];
    // Simplified query - only fetch what's needed
    const { data, error } = await supabase
      .from("orders")
      .select("id, customer_id, status, total, created_at")
      .in("status", activeStatuses)
      .order("created_at", { ascending: false })
      .limit(50); // Reduced limit for better performance

    if (error) {
      console.error("Error fetching active orders:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error getting active orders:", error);
    return [];
  }
}

/**
 * Get count of active orders (for badge/notification)
 * Much faster than fetching full orders
 */
export async function getActiveOrdersCount(): Promise<number> {
  try {
    const activeStatuses = [
      "pending",
      "processing",
      "printing",
      "in transit",
      "paid",
      "pending_payment",
    ];
    const { count, error } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", activeStatuses);

    if (error) {
      console.error("Error counting active orders:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error getting active orders count:", error);
    return 0;
  }
}
