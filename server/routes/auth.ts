import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ecwidAPI } from "../utils/ecwid";
import { sendEmail } from "../utils/email";
import { generatePasswordResetEmail } from "../emails/password-reset";

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

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is not configured. This is required for authentication. Set JWT_SECRET in your environment variables.",
  );
}

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
    console.log("🔐 Login request received:", {
      method: req.method,
      headers: { "Content-Type": req.get("Content-Type") },
      bodyType: typeof req.body,
      body: req.body,
    });

    const { email, password } = req.body as LoginRequest;

    if (!email || !password) {
      console.log("❌ Missing email or password:", { email: !!email, password: !!password });
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
    console.log("📝 Signup request received:", {
      method: req.method,
      headers: { "Content-Type": req.get("Content-Type") },
      bodyType: typeof req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      body: req.body,
    });

    const { firstName, lastName, email, password } = req.body as SignupRequest;

    if (!firstName || !lastName || !email || !password) {
      console.log("Missing required fields:", {
        firstName: !!firstName,
        lastName: !!lastName,
        email: !!email,
        password: !!password,
      });
      return res.status(400).json({
        error: "First name, last name, email, and password are required",
        received: { firstName, lastName, email, password },
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    console.log("Signup attempt for:", email);

    // Check if customer already exists in Supabase
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id, ecwid_customer_id, password_hash")
      .eq("email", email)
      .single();

    if (existingCustomer) {
      // If they already have a password, reject signup
      if (existingCustomer.password_hash) {
        console.log("Email already registered with password:", email);
        return res.status(409).json({ error: "Email already registered" });
      }
      // If they came from Ecwid but haven't set password yet, update their account
      if (existingCustomer.ecwid_customer_id) {
        const passwordHash = await bcrypt.hash(password, 10);
        const { data: updatedCustomer, error: updateError } = await supabase
          .from("customers")
          .update({ password_hash: passwordHash })
          .eq("id", existingCustomer.id)
          .select()
          .single();

        if (updateError || !updatedCustomer) {
          console.error("Error updating Ecwid customer account:", updateError);
          return res.status(500).json({ error: "Failed to create account" });
        }

        const token = generateToken(updatedCustomer.id, updatedCustomer.email);
        return res.json({
          success: true,
          token,
          customer: {
            id: updatedCustomer.id,
            email: updatedCustomer.email,
            firstName: updatedCustomer.first_name,
            lastName: updatedCustomer.last_name,
            isAdmin: updatedCustomer.is_admin || false,
          },
          message: "Account activated with password",
        });
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    console.log("Creating customer in Supabase and Ecwid:", {
      email,
      firstName,
      lastName,
    });

    // Check if this is the admin email (special case for initial setup)
    const isAdminEmail = email === "sticky@stickyslap.com";

    // Create customer in Supabase
    const { data: newCustomer, error } = await supabase
      .from("customers")
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        password_hash: passwordHash,
        store_credit: 0,
        is_admin: isAdminEmail,
      })
      .select()
      .single();

    if (error || !newCustomer) {
      throw new Error("Failed to create customer account");
    }

    console.log("Customer created in Supabase:", newCustomer.id);

    // Create customer in Ecwid
    let ecwidCustomerId: number | null = null;
    try {
      const ecwidCustomer = await ecwidAPI.createCustomer({
        email,
        firstName,
        lastName,
      });
      ecwidCustomerId = ecwidCustomer.id;
      console.log("Customer created in Ecwid:", ecwidCustomerId);
    } catch (ecwidError) {
      console.warn("Warning: Failed to create customer in Ecwid:", ecwidError);
      // Don't fail the signup if Ecwid creation fails
      // But log it for monitoring
    }

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
        ecwidId: ecwidCustomerId,
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

// Admin setup - creates or updates admin user
export const handleAdminSetup: RequestHandler = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const ADMIN_SETUP_KEY = process.env.ADMIN_SETUP_KEY || "admin-setup-key";
    const setupKey = req.headers["x-admin-setup-key"];

    if (setupKey !== ADMIN_SETUP_KEY) {
      return res.status(403).json({ error: "Invalid setup key" });
    }

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email)
      .single();

    const passwordHash = await bcrypt.hash(password, 10);

    if (existingAdmin) {
      // Update existing user to admin
      const { data: updated, error } = await supabase
        .from("customers")
        .update({
          password_hash: passwordHash,
          is_admin: true,
        })
        .eq("email", email)
        .select()
        .single();

      if (error || !updated) {
        throw new Error("Failed to update admin user");
      }

      const token = generateToken(updated.id, updated.email);
      return res.json({
        success: true,
        message: "Admin user updated successfully",
        token,
        customer: {
          id: updated.id,
          email: updated.email,
          firstName: updated.first_name,
          lastName: updated.last_name,
          isAdmin: true,
        },
      });
    }

    // Create new admin user
    const { data: newAdmin, error } = await supabase
      .from("customers")
      .insert({
        email,
        first_name: firstName || "Admin",
        last_name: lastName || "User",
        password_hash: passwordHash,
        is_admin: true,
        store_credit: 0,
      })
      .select()
      .single();

    if (error || !newAdmin) {
      throw new Error("Failed to create admin user");
    }

    const token = generateToken(newAdmin.id, newAdmin.email);
    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      token,
      customer: {
        id: newAdmin.id,
        email: newAdmin.email,
        firstName: newAdmin.first_name,
        lastName: newAdmin.last_name,
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error("Admin setup error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Admin setup failed",
    });
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

/**
 * Initiate password reset - sends reset email to user
 */
export const handleForgotPassword: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    console.log("🔓 Forgot password request for:", email);

    // Check if customer exists
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, email, first_name")
      .eq("email", email)
      .single();

    if (customerError || !customer) {
      // Don't reveal if email exists or not (security)
      console.log("Customer not found for email:", email);
      return res.json({
        success: true,
        message: "If an account exists, a reset link has been sent to your email",
      });
    }

    // Generate a reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { customerId: customer.id, email: customer.email, type: "password-reset" },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    // Generate reset link
    const baseUrl = process.env.BASE_URL || "https://stickyslap.app";
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    // Generate and send email
    const emailContent = generatePasswordResetEmail({
      customerName: customer.first_name || "User",
      resetLink,
      expiresIn: "1 hour",
    });

    await sendEmail({
      to: customer.email,
      subject: "Reset Your Password - Sticky Slap",
      html: emailContent,
    });

    console.log("✅ Password reset email sent to:", customer.email);

    res.json({
      success: true,
      message: "Password reset link has been sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to process password reset request",
    });
  }
};

/**
 * Reset password - validates token and updates password
 */
export const handleResetPassword: RequestHandler = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    console.log("🔐 Reset password request with token");

    // Verify and decode token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.type !== "password-reset") {
        throw new Error("Invalid token type");
      }
    } catch (error) {
      console.log("Token verification failed:", error);
      return res.status(401).json({ error: "Invalid or expired reset token" });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update customer password
    const { error: updateError } = await supabase
      .from("customers")
      .update({ password_hash: passwordHash })
      .eq("id", decoded.customerId);

    if (updateError) {
      console.error("Password update error:", updateError);
      throw updateError;
    }

    console.log("✅ Password reset successfully for customer:", decoded.customerId);

    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to reset password",
    });
  }
};
