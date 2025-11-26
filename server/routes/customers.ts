import { RequestHandler } from "express";
import { bigCommerceAPI } from "../utils/bigcommerce";

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

    const customer = await bigCommerceAPI.getCustomer(customerId);

    if (!customer) {
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
        addresses: customer.addresses,
      },
    });
  } catch (error) {
    console.error("Get customer error:", error);
    res.status(500).json({ error: "Failed to fetch customer" });
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

    const { firstName, lastName, phone } = req.body;

    // Build update payload
    const updateData: any = {};
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (phone) updateData.phone = phone;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const updatedCustomer = await bigCommerceAPI.getCustomer(customerId);

    res.json({
      success: true,
      message: "Customer updated successfully",
      customer: {
        id: updatedCustomer.id,
        email: updatedCustomer.email,
        firstName: updatedCustomer.first_name,
        lastName: updatedCustomer.last_name,
      },
    });
  } catch (error) {
    console.error("Update customer error:", error);
    res.status(500).json({ error: "Failed to update customer" });
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
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
};
