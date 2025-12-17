import { RequestHandler } from "express";
import { supabase } from "../utils/supabase";
import {
  fetchAllEcwidCustomers,
  fetchAllEcwidOrders,
} from "../utils/ecwid-api";

interface MigrationResult {
  customersImported: number;
  customersSkipped: number;
  ordersImported: number;
  ordersSkipped: number;
  errors: string[];
}

/**
 * Migrate all customers and orders from Ecwid to Supabase
 * This is an admin-only endpoint that should be called once to import historical data
 */
export const handleEcwidMigration: RequestHandler = async (req, res) => {
  try {
    const result: MigrationResult = {
      customersImported: 0,
      customersSkipped: 0,
      ordersImported: 0,
      ordersSkipped: 0,
      errors: [],
    };

    console.log("Starting Ecwid migration...");

    // Fetch all customers from Ecwid
    console.log("Fetching customers from Ecwid...");
    const ecwidCustomers = await fetchAllEcwidCustomers();
    console.log(`Found ${ecwidCustomers.length} customers in Ecwid`);

    // Import customers
    for (const ecwidCustomer of ecwidCustomers) {
      try {
        if (!ecwidCustomer.email) {
          result.customersSkipped++;
          continue;
        }

        const fullName =
          ecwidCustomer.billingPerson?.name ||
          `${ecwidCustomer.billingPerson?.firstName || ""} ${ecwidCustomer.billingPerson?.lastName || ""}`.trim();

        // Check if customer already exists
        const { data: existingCustomer } = await supabase
          .from("customers")
          .select("id")
          .eq("email", ecwidCustomer.email)
          .single();

        if (existingCustomer) {
          result.customersSkipped++;
          continue;
        }

        // Insert new customer
        const { error: insertError } = await supabase.from("customers").insert(
          {
            email: ecwidCustomer.email,
            first_name: ecwidCustomer.billingPerson?.firstName || "",
            last_name: ecwidCustomer.billingPerson?.lastName || "",
            phone: ecwidCustomer.billingPerson?.phone,
            created_at: ecwidCustomer.createdDate,
            updated_at: new Date().toISOString(),
            ecwid_customer_id: ecwidCustomer.id,
          },
        );

        if (insertError) {
          result.errors.push(
            `Failed to import customer ${ecwidCustomer.email}: ${insertError.message}`,
          );
          result.customersSkipped++;
        } else {
          result.customersImported++;
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        result.errors.push(`Error processing customer: ${message}`);
        result.customersSkipped++;
      }
    }

    console.log(
      `Imported ${result.customersImported} customers, skipped ${result.customersSkipped}`,
    );

    // Fetch all orders from Ecwid
    console.log("Fetching orders from Ecwid...");
    const ecwidOrders = await fetchAllEcwidOrders();
    console.log(`Found ${ecwidOrders.length} orders in Ecwid`);

    // Import orders
    for (const ecwidOrder of ecwidOrders) {
      try {
        if (!ecwidOrder.customerEmail) {
          result.ordersSkipped++;
          continue;
        }

        // Find customer by email
        const { data: customer, error: customerError } = await supabase
          .from("customers")
          .select("id")
          .eq("email", ecwidOrder.customerEmail)
          .single();

        if (customerError || !customer) {
          result.errors.push(
            `No customer found for order ${ecwidOrder.number} (email: ${ecwidOrder.customerEmail})`,
          );
          result.ordersSkipped++;
          continue;
        }

        // Check if order already exists
        const { data: existingOrder } = await supabase
          .from("orders")
          .select("id")
          .eq("ecwid_order_number", ecwidOrder.number)
          .single();

        if (existingOrder) {
          result.ordersSkipped++;
          continue;
        }

        // Insert new order
        const { error: insertError } = await supabase.from("orders").insert({
          customer_id: customer.id,
          ecwid_order_id: ecwidOrder.id,
          ecwid_order_number: ecwidOrder.number,
          status: ecwidOrder.fulfillmentStatus.toLowerCase() || "pending",
          total: parseFloat(ecwidOrder.total.toString()),
          subtotal: parseFloat(ecwidOrder.subtotal.toString()),
          tax: parseFloat(ecwidOrder.tax.toString()),
          shipping: parseFloat(ecwidOrder.shipping.toString()),
          tracking_number: ecwidOrder.trackingNumber,
          created_at: ecwidOrder.createdDate,
          updated_at: ecwidOrder.updatedDate,
        });

        if (insertError) {
          result.errors.push(
            `Failed to import order ${ecwidOrder.number}: ${insertError.message}`,
          );
          result.ordersSkipped++;
        } else {
          result.ordersImported++;
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        result.errors.push(`Error processing order: ${message}`);
        result.ordersSkipped++;
      }
    }

    console.log(
      `Imported ${result.ordersImported} orders, skipped ${result.ordersSkipped}`,
    );

    res.json({
      success: true,
      message: "Ecwid migration completed",
      result,
    });
  } catch (error) {
    console.error("Ecwid migration error:", error);
    const message =
      error instanceof Error ? error.message : "Migration failed";
    res.status(500).json({
      success: false,
      error: message,
    });
  }
};

/**
 * Get migration status - returns count of customers and orders from both Ecwid and Supabase
 */
export const handleGetMigrationStatus: RequestHandler = async (req, res) => {
  try {
    // Fetch customer count from Supabase
    const { count: supabaseCustomerCount, error: customerError } =
      await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });

    // Fetch order count from Supabase
    const { count: supabaseOrderCount, error: orderError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    // Fetch counts from Ecwid
    const ecwidCustomers = await fetchAllEcwidCustomers();
    const ecwidOrders = await fetchAllEcwidOrders();

    if (customerError || orderError) {
      throw new Error("Failed to fetch migration status");
    }

    res.json({
      success: true,
      ecwid: {
        customers: ecwidCustomers.length,
        orders: ecwidOrders.length,
      },
      supabase: {
        customers: supabaseCustomerCount || 0,
        orders: supabaseOrderCount || 0,
      },
    });
  } catch (error) {
    console.error("Get migration status error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to get status";
    res.status(500).json({
      success: false,
      error: message,
    });
  }
};
