import { RequestHandler } from "express";
import { randomUUID } from "crypto";

interface CartItem {
  product_id: number;
  quantity: number;
  product_options?: Array<{
    option_id: number;
    option_value: string;
  }>;
}

interface Cart {
  id: string;
  line_items: CartItem[];
  created_at: string;
  updated_at: string;
  subtotal: number;
  total: number;
}

// In-memory cart storage (replace with database in production)
const carts = new Map<string, Cart>();

/**
 * Create a new cart
 */
export const handleCreateCart: RequestHandler = async (req, res) => {
  try {
    const { line_items = [] } = req.body;

    const cartId = randomUUID();
    const now = new Date().toISOString();

    const cart: Cart = {
      id: cartId,
      line_items: line_items || [],
      created_at: now,
      updated_at: now,
      subtotal: calculateSubtotal(line_items),
      total: calculateSubtotal(line_items),
    };

    carts.set(cartId, cart);

    res.status(201).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Create cart error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create cart";
    res.status(500).json({ error: message });
  }
};

/**
 * Get cart by ID
 */
export const handleGetCart: RequestHandler = async (req, res) => {
  try {
    const { cartId } = req.params;

    if (!cartId) {
      return res.status(400).json({ error: "Cart ID is required" });
    }

    const cart = carts.get(cartId);

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to get cart";
    res.status(500).json({ error: message });
  }
};

/**
 * Add items to cart
 */
export const handleAddToCart: RequestHandler = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { line_items } = req.body;

    if (!cartId) {
      return res.status(400).json({ error: "Cart ID is required" });
    }

    if (!line_items || !Array.isArray(line_items)) {
      return res.status(400).json({ error: "line_items is required" });
    }

    let cart = carts.get(cartId);

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Add items to cart
    cart.line_items.push(...line_items);
    cart.updated_at = new Date().toISOString();
    cart.subtotal = calculateSubtotal(cart.line_items);
    cart.total = cart.subtotal;

    carts.set(cartId, cart);

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to add to cart";
    res.status(500).json({ error: message });
  }
};

/**
 * Update cart item quantity
 */
export const handleUpdateCartItem: RequestHandler = async (req, res) => {
  try {
    const { cartId, itemIndex } = req.params;
    const { quantity } = req.body;

    if (!cartId) {
      return res.status(400).json({ error: "Cart ID is required" });
    }

    const cart = carts.get(cartId);

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const idx = parseInt(itemIndex);

    if (isNaN(idx) || idx < 0 || idx >= cart.line_items.length) {
      return res.status(400).json({ error: "Invalid item index" });
    }

    if (quantity <= 0) {
      cart.line_items.splice(idx, 1);
    } else {
      cart.line_items[idx].quantity = quantity;
    }

    cart.updated_at = new Date().toISOString();
    cart.subtotal = calculateSubtotal(cart.line_items);
    cart.total = cart.subtotal;

    carts.set(cartId, cart);

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update cart item";
    res.status(500).json({ error: message });
  }
};

/**
 * Remove item from cart
 */
export const handleRemoveFromCart: RequestHandler = async (req, res) => {
  try {
    const { cartId, itemIndex } = req.params;

    if (!cartId) {
      return res.status(400).json({ error: "Cart ID is required" });
    }

    const cart = carts.get(cartId);

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const idx = parseInt(itemIndex);

    if (isNaN(idx) || idx < 0 || idx >= cart.line_items.length) {
      return res.status(400).json({ error: "Invalid item index" });
    }

    cart.line_items.splice(idx, 1);
    cart.updated_at = new Date().toISOString();
    cart.subtotal = calculateSubtotal(cart.line_items);
    cart.total = cart.subtotal;

    carts.set(cartId, cart);

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to remove from cart";
    res.status(500).json({ error: message });
  }
};

/**
 * Clear cart
 */
export const handleClearCart: RequestHandler = async (req, res) => {
  try {
    const { cartId } = req.params;

    if (!cartId) {
      return res.status(400).json({ error: "Cart ID is required" });
    }

    const cart = carts.get(cartId);

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    cart.line_items = [];
    cart.updated_at = new Date().toISOString();
    cart.subtotal = 0;
    cart.total = 0;

    carts.set(cartId, cart);

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to clear cart";
    res.status(500).json({ error: message });
  }
};

/**
 * Helper function to calculate subtotal
 */
function calculateSubtotal(lineItems: CartItem[]): number {
  // Mock calculation - in production, fetch actual prices from BigCommerce
  return lineItems.reduce((total, item) => {
    const itemPrice = 0.25; // Base price per unit
    return total + itemPrice * item.quantity;
  }, 0);
}
