import { RequestHandler } from "express";
import { supabase } from "../utils/supabase";

interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  storeCredit: number;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate?: string;
}

/**
 * Get all customers with their order information (admin only)
 * Returns a list of all customers who have signed up or placed orders
 * Includes order counts, total spending, and other metrics
 */
export const handleGetAllCustomers: RequestHandler = async (req, res) => {
  try {
    // Fetch all customers with their orders
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .select(
        `
        id,
        email,
        first_name,
        last_name,
        phone,
        company,
        store_credit,
        created_at,
        updated_at,
        orders (
          id,
          total,
          status,
          created_at
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (customersError) {
      console.error("Error fetching customers:", customersError);
      return res.status(500).json({ error: "Failed to fetch customers" });
    }

    // Format customers with aggregated data
    const formattedCustomers: Customer[] = (customers || []).map(
      (customer: any) => {
        const orders = customer.orders || [];
        const totalSpent = orders.reduce(
          (sum: number, order: any) => sum + (order.total || 0),
          0,
        );
        const lastOrder = orders.length > 0 ? orders[0] : null;

        return {
          id: customer.id,
          email: customer.email,
          firstName: customer.first_name || "",
          lastName: customer.last_name || "",
          phone: customer.phone,
          company: customer.company,
          storeCredit: customer.store_credit || 0,
          createdAt: customer.created_at,
          updatedAt: customer.updated_at,
          orderCount: orders.length,
          totalSpent,
          lastOrderDate: lastOrder?.created_at,
        };
      },
    );

    res.json({
      success: true,
      customers: formattedCustomers,
      count: formattedCustomers.length,
    });
  } catch (error) {
    console.error("Get all customers error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch customers";
    res.status(500).json({ error: message });
  }
};

/**
 * Get customer details with full order history (admin only)
 * Returns detailed information about a specific customer
 */
export const handleGetCustomerDetails: RequestHandler = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select(
        `
        id,
        email,
        first_name,
        last_name,
        phone,
        company,
        store_credit,
        created_at,
        updated_at,
        orders (
          id,
          total,
          status,
          created_at,
          order_items (
            id,
            product_name,
            quantity,
            price
          )
        )
      `,
      )
      .eq("id", customerId)
      .single();

    if (customerError || !customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const orders = customer.orders || [];
    const totalSpent = orders.reduce(
      (sum: number, order: any) => sum + (order.total || 0),
      0,
    );

    res.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name || "",
        lastName: customer.last_name || "",
        phone: customer.phone,
        company: customer.company,
        storeCredit: customer.store_credit || 0,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at,
        orderCount: orders.length,
        totalSpent,
        orders: orders.map((order: any) => ({
          id: order.id,
          total: order.total,
          status: order.status,
          createdAt: order.created_at,
          itemCount: (order.order_items || []).length,
        })),
      },
    });
  } catch (error) {
    console.error("Get customer details error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch customer";
    res.status(500).json({ error: message });
  }
};

/**
 * Search customers by name or email (admin only)
 */
export const handleSearchCustomers: RequestHandler = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Search query is required" });
    }

    const searchTerm = `%${query}%`;

    // Search customers by name or email
    const { data: customers, error } = await supabase
      .from("customers")
      .select(
        `
        id,
        email,
        first_name,
        last_name,
        phone,
        company,
        store_credit,
        created_at,
        updated_at,
        orders (
          id,
          total,
          status,
          created_at
        )
      `,
      )
      .or(
        `email.ilike.${searchTerm},first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},company.ilike.${searchTerm}`,
      );

    if (error) {
      console.error("Error searching customers:", error);
      return res.status(500).json({ error: "Failed to search customers" });
    }

    const formattedCustomers: Customer[] = (customers || []).map(
      (customer: any) => {
        const orders = customer.orders || [];
        const totalSpent = orders.reduce(
          (sum: number, order: any) => sum + (order.total || 0),
          0,
        );
        const lastOrder = orders.length > 0 ? orders[0] : null;

        return {
          id: customer.id,
          email: customer.email,
          firstName: customer.first_name || "",
          lastName: customer.last_name || "",
          phone: customer.phone,
          company: customer.company,
          storeCredit: customer.store_credit || 0,
          createdAt: customer.created_at,
          updatedAt: customer.updated_at,
          orderCount: orders.length,
          totalSpent,
          lastOrderDate: lastOrder?.created_at,
        };
      },
    );

    res.json({
      success: true,
      customers: formattedCustomers,
      count: formattedCustomers.length,
    });
  } catch (error) {
    console.error("Search customers error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to search customers";
    res.status(500).json({ error: message });
  }
};
