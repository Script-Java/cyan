import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://bxkphaslciswfspuqdgo.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

if (!supabaseServiceKey) {
  console.warn("SUPABASE_SERVICE_KEY not configured - Supabase operations may fail");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CustomerData {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  store_credit?: number;
}

export async function syncCustomerToSupabase(customer: CustomerData): Promise<void> {
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
      const { error: insertError } = await supabase
        .from("customers")
        .insert({
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

export async function getCustomerStoreCredit(customerId: number): Promise<number> {
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
