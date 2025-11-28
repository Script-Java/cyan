import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import { getCustomerStoreCredit } from "../utils/supabase";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || "",
);

/**
 * Get current customer profile
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

    res.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phone: customer.phone,
        companyName: customer.company,
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
    const updateData: any = {};
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Update customer in BigCommerce
    const updatedCustomer = await bigCommerceAPI.updateCustomer(
      customerId,
      updateData,
    );

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

    const customer = await bigCommerceAPI.getCustomer(customerId);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({
      success: true,
      addresses: customer.addresses || [],
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

    const address = {
      first_name: firstName,
      last_name: lastName,
      street_1: street1,
      street_2: street2,
      city,
      state_or_province: stateOrProvince,
      postal_code: postalCode,
      country_code: countryCode,
    };

    const newAddress = await bigCommerceAPI.createCustomerAddress(
      customerId,
      address,
    );

    res.json({
      success: true,
      message: "Address created successfully",
      address: newAddress,
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

    const address = {
      first_name: firstName,
      last_name: lastName,
      street_1: street1,
      street_2: street2,
      city,
      state_or_province: stateOrProvince,
      postal_code: postalCode,
      country_code: countryCode,
    };

    const updatedAddress = await bigCommerceAPI.updateCustomerAddress(
      customerId,
      parseInt(addressId),
      address,
    );

    res.json({
      success: true,
      message: "Address updated successfully",
      address: updatedAddress,
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

    await bigCommerceAPI.deleteCustomerAddress(customerId, parseInt(addressId));

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

    await bigCommerceAPI.deleteCustomer(customerId);

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
