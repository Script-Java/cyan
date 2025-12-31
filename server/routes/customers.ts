import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
import { getCustomerStoreCredit } from "../utils/supabase";
import { ecwidAPI } from "../utils/ecwid";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || "",
);

/**
 * Get current customer profile with addresses
 * Requires: customerId in JWT token
 */
export const handleGetCustomer: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data: customer, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (error || !customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const { data: addresses, error: addressError } = await supabase
      .from("addresses")
      .select("*")
      .eq("customer_id", customerId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    res.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phone: customer.phone,
        companyName: customer.company,
        addresses: addresses || [],
      },
    });
  } catch (error) {
    console.error("Get customer error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch customer";
    res.status(500).json({ error: message });
  }
};

/**
 * Update customer profile
 * Requires: customerId in JWT token
 */
export const handleUpdateCustomer: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { firstName, lastName, phone, email } = req.body;

    // Build update payload
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;

    if (Object.keys(updateData).length === 1) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Update customer in Supabase
    const { data: updatedCustomer, error } = await supabase
      .from("customers")
      .update(updateData)
      .eq("id", customerId)
      .select()
      .single();

    if (error || !updatedCustomer) {
      console.error("Customer update error details:", {
        customerId,
        updateData,
        error: error ? {
          message: error.message,
          code: error.code,
          details: error.details,
        } : null,
        updatedCustomer,
      });
      return res.status(500).json({
        error: "Failed to update customer",
        details: error?.message || "Unknown error"
      });
    }

    res.json({
      success: true,
      message: "Customer updated successfully",
      customer: {
        id: updatedCustomer.id,
        email: updatedCustomer.email,
        firstName: updatedCustomer.first_name,
        lastName: updatedCustomer.last_name,
        phone: updatedCustomer.phone,
      },
    });
  } catch (error) {
    console.error("Update customer error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update customer";
    res.status(500).json({ error: message });
  }
};

/**
 * Get customer addresses
 * Requires: customerId in JWT token
 */
export const handleGetCustomerAddresses: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .eq("id", customerId)
      .single();

    if (customerError || !customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const { data: addresses, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("customer_id", customerId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Failed to fetch addresses" });
    }

    res.json({
      success: true,
      addresses: addresses || [],
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch addresses";
    res.status(500).json({ error: message });
  }
};

/**
 * Create customer address
 * Requires: customerId in JWT token
 */
export const handleCreateCustomerAddress: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      firstName,
      lastName,
      street1,
      street2,
      city,
      stateOrProvince,
      postalCode,
      countryCode,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !street1 ||
      !city ||
      !stateOrProvince ||
      !postalCode ||
      !countryCode
    ) {
      return res.status(400).json({ error: "Missing required address fields" });
    }

    const { data: address, error } = await supabase
      .from("addresses")
      .insert({
        customer_id: customerId,
        first_name: firstName,
        last_name: lastName,
        street_1: street1,
        street_2: street2 || null,
        city,
        state_or_province: stateOrProvince,
        postal_code: postalCode,
        country_code: countryCode,
      })
      .select()
      .single();

    if (error || !address) {
      return res.status(500).json({ error: "Failed to create address" });
    }

    res.json({
      success: true,
      message: "Address created successfully",
      address: {
        id: address.id,
        first_name: address.first_name,
        last_name: address.last_name,
        street_1: address.street_1,
        street_2: address.street_2,
        city: address.city,
        state_or_province: address.state_or_province,
        postal_code: address.postal_code,
        country_code: address.country_code,
      },
    });
  } catch (error) {
    console.error("Create address error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create address";
    res.status(500).json({ error: message });
  }
};

/**
 * Update customer address
 * Requires: customerId in JWT token
 */
export const handleUpdateCustomerAddress: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;
    const { addressId } = req.params;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!addressId) {
      return res.status(400).json({ error: "Address ID is required" });
    }

    const parsedAddressId = parseInt(addressId, 10);
    if (isNaN(parsedAddressId)) {
      return res.status(400).json({ error: "Invalid address ID format" });
    }

    const {
      firstName,
      lastName,
      street1,
      street2,
      city,
      stateOrProvince,
      postalCode,
      countryCode,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !street1 ||
      !city ||
      !stateOrProvince ||
      !postalCode ||
      !countryCode
    ) {
      return res.status(400).json({ error: "Missing required address fields" });
    }

    // Verify address belongs to customer
    const { data: existingAddress, error: checkError } = await supabase
      .from("addresses")
      .select("id")
      .eq("id", parsedAddressId)
      .eq("customer_id", customerId)
      .single();

    if (checkError || !existingAddress) {
      return res
        .status(404)
        .json({ error: "Address not found or unauthorized" });
    }

    const { data: address, error } = await supabase
      .from("addresses")
      .update({
        first_name: firstName,
        last_name: lastName,
        street_1: street1,
        street_2: street2 || null,
        city,
        state_or_province: stateOrProvince,
        postal_code: postalCode,
        country_code: countryCode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsedAddressId)
      .select()
      .single();

    if (error || !address) {
      return res.status(500).json({ error: "Failed to update address" });
    }

    res.json({
      success: true,
      message: "Address updated successfully",
      address: {
        id: address.id,
        first_name: address.first_name,
        last_name: address.last_name,
        street_1: address.street_1,
        street_2: address.street_2,
        city: address.city,
        state_or_province: address.state_or_province,
        postal_code: address.postal_code,
        country_code: address.country_code,
      },
    });
  } catch (error) {
    console.error("Update address error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update address";
    res.status(500).json({ error: message });
  }
};

/**
 * Delete customer address
 * Requires: customerId in JWT token
 */
export const handleDeleteCustomerAddress: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;
    const { addressId } = req.params;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!addressId) {
      return res.status(400).json({ error: "Address ID is required" });
    }

    const parsedAddressId = parseInt(addressId, 10);
    if (isNaN(parsedAddressId)) {
      return res.status(400).json({ error: "Invalid address ID format" });
    }

    // Verify address belongs to customer
    const { data: existingAddress, error: checkError } = await supabase
      .from("addresses")
      .select("id")
      .eq("id", parsedAddressId)
      .eq("customer_id", customerId)
      .single();

    if (checkError || !existingAddress) {
      return res
        .status(404)
        .json({ error: "Address not found or unauthorized" });
    }

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", parsedAddressId);

    if (error) {
      return res.status(500).json({ error: "Failed to delete address" });
    }

    res.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete address error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete address";
    res.status(500).json({ error: message });
  }
};

/**
 * Delete customer account
 * Requires: customerId in JWT token
 */
export const handleDeleteCustomerAccount: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Delete from Supabase
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", customerId);

    if (error) {
      return res.status(500).json({ error: "Failed to delete account" });
    }

    // Try to delete from Ecwid (non-blocking)
    try {
      await ecwidAPI.deleteCustomer(customerId);
    } catch (ecwidError) {
      console.warn(
        "Warning: Failed to delete customer from Ecwid:",
        ecwidError,
      );
      // Don't fail the deletion if Ecwid deletion fails
    }

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete account";
    res.status(500).json({ error: message });
  }
};

/**
 * Get customer store credit
 * Requires: customerId in JWT token
 */
export const handleGetStoreCredit: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const storeCredit = await getCustomerStoreCredit(customerId);

    res.json({
      success: true,
      storeCredit: storeCredit || 0,
    });
  } catch (error) {
    console.error("Get store credit error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch store credit";
    res.status(500).json({ error: message });
  }
};
