import { RequestHandler } from "express";
import { bigCommerceAPI } from "../utils/bigcommerce";
import { syncCustomerToSupabase } from "../utils/supabase";
import jwt from "jsonwebtoken";

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

/**
 * Generate JWT token for session
 */
function generateToken(customerId: number, email: string): string {
  return jwt.sign(
    { customerId, email, iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: "30d" },
  );
}

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as LoginRequest;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Get customer from BigCommerce
    const customer = await bigCommerceAPI.getCustomerByEmail(email);
    if (!customer) {
      console.log("Customer not found in BigCommerce:", email);
      return res.status(401).json({ error: "Customer not found" });
    }

    console.log("Customer found in BigCommerce:", {
      id: customer.id,
      email: customer.email,
      store_credit: customer.store_credit,
    });

    // Sync customer data to Supabase
    try {
      await syncCustomerToSupabase({
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
        company: customer.company,
        store_credit: customer.store_credit || 0,
      });
      console.log("Customer synced to Supabase:", customer.id);
    } catch (syncError) {
      console.error("Failed to sync customer to Supabase:", syncError);
      // Don't fail login if Supabase sync fails, just log it
    }

    // Generate JWT token
    const token = generateToken(customer.id, customer.email);

    res.json({
      success: true,
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const handleSignup: RequestHandler = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body as SignupRequest;

    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({
          error: "First name, last name, email, and password are required",
        });
    }

    console.log("Signup attempt for:", email);

    // Check if customer already exists
    const existingCustomer = await bigCommerceAPI.getCustomerByEmail(email);
    if (existingCustomer) {
      console.log("Email already registered:", email);
      return res.status(409).json({ error: "Email already registered" });
    }

    console.log("Creating customer in BigCommerce:", {
      email,
      firstName,
      lastName,
    });

    // Create customer in BigCommerce
    const newCustomer = await bigCommerceAPI.createCustomer({
      email,
      first_name: firstName,
      last_name: lastName,
      password,
    });

    if (!newCustomer || !newCustomer.id) {
      throw new Error("Failed to create customer - no ID returned");
    }

    console.log("Customer created successfully:", newCustomer.id);

    // Generate JWT token
    const token = generateToken(newCustomer.id, newCustomer.email);

    res.status(201).json({
      success: true,
      token,
      customer: {
        id: newCustomer.id,
        email: newCustomer.email,
        firstName: newCustomer.first_name,
        lastName: newCustomer.last_name,
      },
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Signup failed";
    res.status(500).json({ error: errorMessage });
  }
};

export const handleBigCommerceAuth: RequestHandler = (req, res) => {
  try {
    const clientId = process.env.BIGCOMMERCE_CLIENT_ID || "";
    const appUrl = process.env.APP_URL || "http://localhost:8080";
    const redirectUri = `${appUrl}/api/auth/bigcommerce/callback`;
    const state = Buffer.from(Math.random().toString()).toString("base64");

    if (!clientId) {
      return res
        .status(500)
        .json({ error: "BigCommerce client ID not configured" });
    }

    const bigCommerceAuthUrl = new URL(
      "https://login.bigcommerce.com/oauth2/authorize",
    );
    bigCommerceAuthUrl.searchParams.append("client_id", clientId);
    bigCommerceAuthUrl.searchParams.append("redirect_uri", redirectUri);
    bigCommerceAuthUrl.searchParams.append("response_type", "code");
    bigCommerceAuthUrl.searchParams.append("state", state);
    bigCommerceAuthUrl.searchParams.append(
      "scope",
      "store_v2_customers store_v2_orders",
    );

    res.redirect(bigCommerceAuthUrl.toString());
  } catch (error) {
    console.error("BigCommerce auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

export const handleBigCommerceCallback: RequestHandler = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      return res.redirect(`/auth/callback?error=no_code`);
    }

    // Exchange code for access token
    const tokenData = await bigCommerceAPI.exchangeCodeForToken(code);

    if (!tokenData.access_token) {
      throw new Error("No access token received");
    }

    // Get customer ID from context or user info
    const customerId = tokenData.user?.id;
    const email = tokenData.user?.email;

    if (!customerId || !email) {
      throw new Error("Failed to get customer information");
    }

    // Generate JWT token for our application
    const token = generateToken(customerId, email);

    // Redirect to auth callback page with token in query string
    res.redirect(
      `/auth/callback?auth_token=${token}&customer_id=${customerId}`,
    );
  } catch (error) {
    console.error("BigCommerce callback error:", error);
    res.redirect(`/auth/callback?error=auth_failed`);
  }
};

export const handleLogout: RequestHandler = (req, res) => {
  try {
    // JWT tokens are stateless, so logout is handled client-side
    // Client should remove token from localStorage
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};
