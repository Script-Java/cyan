// FIX for Shipping Address Display Truncation
// Add this parsing logic to server/routes/orders.ts around line 154-177

// FIND THIS CODE (around line 154-177):
/*
    const formattedSupabaseOrders = supabaseOrders.map((order: any) => {
      const customerInfo = order.customers || {};

      return {
        id: order.id,
        customerId: order.customer_id,
        status: order.status || "paid",
        total: order.total,
        subtotal: order.subtotal || 0,
        tax: order.tax || 0,
        shipping: order.shipping || 0,
        dateCreated: order.created_at,
        source: "supabase",
        itemCount: order.order_items?.length || 0,
        items: order.order_items || [],
        estimated_delivery_date: order.estimated_delivery_date,
        tracking_number: order.tracking_number,
        tracking_carrier: order.tracking_carrier,
        tracking_url: order.tracking_url,
        shipped_date: order.shipped_date,
        digital_files: filesMap.get(order.id) || [],
        shippingAddress: order.shipping_address,    // ← THIS LINE IS THE PROBLEM
        customerName:
          `${customerInfo.first_name || ""} ${customerInfo.last_name || ""}`.trim(),
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
      };
    });
*/

// REPLACE WITH THIS CODE:
const formattedSupabaseOrders = supabaseOrders.map((order: any) => {
    const customerInfo = order.customers || {};

    // ✅ FIX: Parse shipping_address if it's a string (from database JSON column)
    let shippingAddress = order.shipping_address;
    if (typeof shippingAddress === 'string') {
        try {
            shippingAddress = JSON.parse(shippingAddress);
        } catch (e) {
            console.warn('Failed to parse shipping_address for order', order.id, e);
            shippingAddress = null;
        }
    }

    return {
        id: order.id,
        customerId: order.customer_id,
        status: order.status || "paid",
        total: order.total,
        subtotal: order.subtotal || 0,
        tax: order.tax || 0,
        shipping: order.shipping || 0,
        dateCreated: order.created_at,
        source: "supabase",
        itemCount: order.order_items?.length || 0,
        items: order.order_items || [],
        estimated_delivery_date: order.estimated_delivery_date,
        tracking_number: order.tracking_number,
        tracking_carrier: order.tracking_carrier,
        tracking_url: order.tracking_url,
        shipped_date: order.shipped_date,
        digital_files: filesMap.get(order.id) || [],
        shippingAddress: shippingAddress,   // ✅ Now properly parsed
        customerName:
            `${customerInfo.first_name || ""} ${customerInfo.last_name || ""}`.trim(),
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
    };
});

// ALSO DO THE SAME FOR THE SINGLE ORDER ENDPOINT (around line 328-350):
// Replace line 341:
//   shippingAddress: order.shipping_address,
// With:
/*
  shippingAddress: typeof order.shipping_address === 'string' 
    ? JSON.parse(order.shipping_address) 
    : order.shipping_address,
*/
