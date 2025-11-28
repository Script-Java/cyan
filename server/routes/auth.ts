import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || "",
);

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

    // Get customer from Supabase
    const { data: customer, error } = await supabase
      .from("customers")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !customer) {
      console.log("Customer not found in Supabase:", email);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(
      password,
      customer.password_hash || "",
    );
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
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
        isAdmin: customer.is_admin || false,
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
      return res.status(400).json({
        error: "First name, last name, email, and password are required",
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    console.log("Signup attempt for:", email);

    // Check if customer already exists
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email)
      .single();

    if (existingCustomer) {
      console.log("Email already registered:", email);
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    console.log("Creating customer in Supabase:", {
      email,
      firstName,
      lastName,
    });

    // Create customer in Supabase
    const { data: newCustomer, error } = await supabase
      .from("customers")
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        password_hash: passwordHash,
        store_credit: 0,
      })
      .select()
      .single();

    if (error || !newCustomer) {
      throw new Error("Failed to create customer account");
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
        isAdmin: newCustomer.is_admin || false,
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

// BigCommerce OAuth handlers removed - using Supabase-only authentication

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
