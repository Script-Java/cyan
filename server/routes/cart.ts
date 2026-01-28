import { RequestHandler } from "express";
import { randomUUID } from "crypto";
import { supabase } from "../utils/supabase";

/**
 * Validate UUID format (v4 and general UUID)
 * Matches format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

interface CartItem {
  product_id: number;
  quantity: number;
  price?: number;
  product_name?: string;
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

/**
 * Create a new cart
 */
export const handleCreateCart: RequestHandler = async (req, res) => {
  try {
    const { line_items = [] } = req.body;

    const cartId = randomUUID();
    const now = new Date().toISOString();

    const subtotal = calculateSubtotal(line_items);
    const cart = {
      id: cartId,
      line_items: line_items || [],
      subtotal,
      total: subtotal,
      created_at: now,
      updated_at: now,
    };

    const { error } = await supabase.from("carts").insert({
      id: cartId,
      line_items,
      subtotal,
      total: subtotal,
      created_at: now,
      updated_at: now,
    });

    if (error) {
      console.error("Create cart error:", error);
      throw error;
    }

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
      console.error("Cart ID is required");
      return res.status(400).json({ error: "Cart ID is required" });
    }

    if (!isValidUUID(cartId)) {
      console.error("Invalid cart ID format:", cartId);
      return res.status(400).json({ error: "Invalid cart ID format" });
    }

    console.log("Fetching cart:", cartId);

    const { data, error } = await supabase
      .from("carts")
      .select("*")
      .eq("id", cartId)
      .single();

    if (error) {
      console.error("Get cart error - Supabase error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        cartId,
      });
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Cart not found" });
      }
      throw error;
    }

    if (!data) {
      console.warn("Get cart - no data returned for cartId:", cartId);
      return res.status(404).json({ error: "Cart not found" });
    }

    console.log("Cart found successfully:", cartId);

    res.json({
      success: true,
      data: {
        id: data.id,
        line_items: data.line_items || [],
        subtotal: data.subtotal || 0,
        total: data.total || 0,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    });
  } catch (error) {
    console.error("Get cart error - caught exception:", {
      message: error instanceof Error ? error.message : String(error),
      error,
    });
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

    if (!isValidUUID(cartId)) {
      return res.status(400).json({ error: "Invalid cart ID format" });
    }

    if (!line_items || !Array.isArray(line_items)) {
      return res.status(400).json({ error: "line_items is required" });
    }

    const { data: cart, error: fetchError } = await supabase
      .from("carts")
      .select("*")
      .eq("id", cartId)
      .single();

    if (fetchError) {
      console.error("Fetch cart error:", fetchError);
      if (fetchError.code === "PGRST116") {
        return res.status(404).json({ error: "Cart not found" });
      }
      throw fetchError;
    }

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const updatedItems = [...(cart.line_items || []), ...line_items];
    const subtotal = calculateSubtotal(updatedItems);
    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("carts")
      .update({
        line_items: updatedItems,
        subtotal,
        total: subtotal,
        updated_at: now,
      })
      .eq("id", cartId);

    if (updateError) {
      console.error("Update cart error:", updateError);
      throw updateError;
    }

    res.json({
      success: true,
      data: {
        id: cartId,
        line_items: updatedItems,
        subtotal,
        total: subtotal,
        created_at: cart.created_at,
        updated_at: now,
      },
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

    if (!isValidUUID(cartId)) {
      return res.status(400).json({ error: "Invalid cart ID format" });
    }

    const { data: cart, error: fetchError } = await supabase
      .from("carts")
      .select("*")
      .eq("id", cartId)
      .single();

    if (fetchError) {
      console.error("Fetch cart error:", fetchError);
      if (fetchError.code === "PGRST116") {
        return res.status(404).json({ error: "Cart not found" });
      }
      throw fetchError;
    }

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const idx = parseInt(itemIndex);
    const items = cart.line_items || [];

    if (isNaN(idx) || idx < 0 || idx >= items.length) {
      return res.status(400).json({ error: "Invalid item index" });
    }

    if (quantity <= 0) {
      items.splice(idx, 1);
    } else {
      items[idx].quantity = quantity;
    }

    const subtotal = calculateSubtotal(items);
    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("carts")
      .update({
        line_items: items,
        subtotal,
        total: subtotal,
        updated_at: now,
      })
      .eq("id", cartId);

    if (updateError) {
      console.error("Update cart error:", updateError);
      throw updateError;
    }

    res.json({
      success: true,
      data: {
        id: cartId,
        line_items: items,
        subtotal,
        total: subtotal,
        created_at: cart.created_at,
        updated_at: now,
      },
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

    if (!isValidUUID(cartId)) {
      return res.status(400).json({ error: "Invalid cart ID format" });
    }

    const { data: cart, error: fetchError } = await supabase
      .from("carts")
      .select("*")
      .eq("id", cartId)
      .single();

    if (fetchError) {
      console.error("Fetch cart error:", fetchError);
      if (fetchError.code === "PGRST116") {
        return res.status(404).json({ error: "Cart not found" });
      }
      throw fetchError;
    }

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const idx = parseInt(itemIndex);
    const items = cart.line_items || [];

    if (isNaN(idx) || idx < 0 || idx >= items.length) {
      return res.status(400).json({ error: "Invalid item index" });
    }

    items.splice(idx, 1);
    const subtotal = calculateSubtotal(items);
    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("carts")
      .update({
        line_items: items,
        subtotal,
        total: subtotal,
        updated_at: now,
      })
      .eq("id", cartId);

    if (updateError) {
      console.error("Update cart error:", updateError);
      throw updateError;
    }

    res.json({
      success: true,
      data: {
        id: cartId,
        line_items: items,
        subtotal,
        total: subtotal,
        created_at: cart.created_at,
        updated_at: now,
      },
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

    if (!isValidUUID(cartId)) {
      return res.status(400).json({ error: "Invalid cart ID format" });
    }

    const { data: cart, error: fetchError } = await supabase
      .from("carts")
      .select("*")
      .eq("id", cartId)
      .single();

    if (fetchError) {
      console.error("Fetch cart error:", fetchError);
      if (fetchError.code === "PGRST116") {
        return res.status(404).json({ error: "Cart not found" });
      }
      throw fetchError;
    }

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("carts")
      .update({
        line_items: [],
        subtotal: 0,
        total: 0,
        updated_at: now,
      })
      .eq("id", cartId);

    if (updateError) {
      console.error("Update cart error:", updateError);
      throw updateError;
    }

    res.json({
      success: true,
      data: {
        id: cartId,
        line_items: [],
        subtotal: 0,
        total: 0,
        created_at: cart.created_at,
        updated_at: now,
      },
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
  return lineItems.reduce((total, item) => {
    const itemPrice = item.price || 0.25;
    return total + itemPrice * item.quantity;
  }, 0);
}
