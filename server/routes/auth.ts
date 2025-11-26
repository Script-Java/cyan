import { RequestHandler } from "express";

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as LoginRequest;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // TODO: Implement BigCommerce authentication
    // This is a placeholder that should:
    // 1. Verify credentials against BigCommerce API
    // 2. Create or update user session
    // 3. Return authentication token

    const mockToken = Buffer.from(`${email}:${Date.now()}`).toString("base64");

    res.json({
      success: true,
      token: mockToken,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const handleSignup: RequestHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body as SignupRequest;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password required" });
    }

    // TODO: Implement BigCommerce customer creation
    // This is a placeholder that should:
    // 1. Create new customer in BigCommerce
    // 2. Set up initial account
    // 3. Return authentication token

    const mockToken = Buffer.from(`${email}:${Date.now()}`).toString("base64");

    res.json({
      success: true,
      token: mockToken,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
};

export const handleBigCommerceAuth: RequestHandler = (req, res) => {
  try {
    // TODO: Implement BigCommerce OAuth flow
    // This should:
    // 1. Redirect to BigCommerce OAuth endpoint
    // 2. Handle callback and token exchange
    // 3. Create session

    const clientId = process.env.BIGCOMMERCE_CLIENT_ID || "";
    const redirectUri = `${process.env.APP_URL || "http://localhost:8080"}/api/auth/bigcommerce/callback`;
    const state = Buffer.from(Math.random().toString()).toString("base64");

    if (!clientId) {
      return res.status(500).json({ error: "BigCommerce client ID not configured" });
    }

    const bigCommerceAuthUrl = new URL(
      "https://login.bigcommerce.com/oauth2/authorize"
    );
    bigCommerceAuthUrl.searchParams.append("client_id", clientId);
    bigCommerceAuthUrl.searchParams.append("redirect_uri", redirectUri);
    bigCommerceAuthUrl.searchParams.append("response_type", "code");
    bigCommerceAuthUrl.searchParams.append("state", state);
    bigCommerceAuthUrl.searchParams.append("scope", "store_v2_customers");

    res.redirect(bigCommerceAuthUrl.toString());
  } catch (error) {
    console.error("BigCommerce auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

export const handleBigCommerceCallback: RequestHandler = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Authorization code not provided" });
    }

    // TODO: Implement BigCommerce OAuth callback handler
    // This should:
    // 1. Exchange code for access token
    // 2. Get customer information
    // 3. Create/update session
    // 4. Redirect to dashboard

    console.log("BigCommerce OAuth callback received with code:", code);

    // For now, redirect to dashboard with a mock token
    const mockToken = Buffer.from(`oauth:${Date.now()}`).toString("base64");
    res.redirect(`/?token=${mockToken}`);
  } catch (error) {
    console.error("BigCommerce callback error:", error);
    res.status(500).json({ error: "Callback handling failed" });
  }
};

export const handleLogout: RequestHandler = (req, res) => {
  try {
    // TODO: Implement logout functionality
    // This should:
    // 1. Invalidate session/token
    // 2. Clear cookies
    // 3. Redirect to home

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};
