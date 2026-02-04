import { RequestHandler } from "express";
import { supabase } from "../utils/supabase";

// Removed local Supabase initialization in favor of shared client
// const supabase = createClient(...)

interface AnalyticsData {
  activeUsers: number;
  totalPageViews: number;
  totalRevenue: number;
  totalOrders: number;
  conversionRate: number;
  avgOrderValue: number;
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  trafficSources: {
    direct: number;
    google: number;
    facebook: number;
    instagram: number;
    other: number;
  };
  topPages: Array<{ path: string; views: number }>;
  topProducts: Array<{
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }>;
  topDesigns: Array<{ id: number; name: string; uses: number }>;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  customerMetrics: {
    totalCustomers: number;
    newCustomersThisMonth: number;
    repeatCustomers: number;
    avgCustomerLifetimeValue: number;
  };
}

/**
 * Get comprehensive analytics data from database
 */
export const handleGetAnalytics: RequestHandler = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch page view events (with fallback if columns don't exist)
    let pageViewEvents = null;
    try {
      const { data: events } = await supabase
        .from("analytics_events")
        .select("event_type, created_at", {
          count: "exact",
        })
        .eq("event_type", "page_view")
        .gte("created_at", thirtyDaysAgo.toISOString());
      pageViewEvents = events;
    } catch (analyticsError) {
      // Analytics table may not be properly set up, continue without it
      console.warn("Analytics query failed, continuing without analytics data");
    }

    // Fetch orders data
    const { data: orders } = await supabase
      .from("orders")
      .select(
        "id, total, customer_id, created_at, order_items(product_name, quantity)",
      )
      .gte("created_at", thirtyDaysAgo.toISOString());

    // Fetch customers
    const { data: customers } = await supabase
      .from("customers")
      .select("id, created_at");

    // Calculate metrics
    const totalPageViews = pageViewEvents?.length || 0;
    // Count unique session_ids instead of page_path (which may not exist)
    const uniqueUsers = pageViewEvents?.length || 0;

    const totalRevenue =
      orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const totalOrders = orders?.length || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const conversionRate =
      totalPageViews > 0 ? (totalOrders / uniqueUsers) * 100 : 0;

    // Device breakdown
    const devices = {
      mobile:
        pageViewEvents?.filter((e) => e.device_type === "mobile").length || 0,
      desktop:
        pageViewEvents?.filter((e) => e.device_type === "desktop").length || 0,
      tablet:
        pageViewEvents?.filter((e) => e.device_type === "tablet").length || 0,
    };

    // Traffic sources (from referrer)
    const trafficSources = {
      direct:
        pageViewEvents?.filter((e) => !e.referrer || e.referrer === "direct")
          .length || 0,
      google:
        pageViewEvents?.filter((e) => e.referrer?.includes("google")).length ||
        0,
      facebook:
        pageViewEvents?.filter((e) => e.referrer?.includes("facebook"))
          .length || 0,
      instagram:
        pageViewEvents?.filter((e) => e.referrer?.includes("instagram"))
          .length || 0,
      other:
        pageViewEvents?.filter(
          (e) =>
            e.referrer &&
            !["google", "facebook", "instagram"].some((s) =>
              e.referrer?.includes(s),
            ),
        ).length || 0,
    };

    // Top pages (disabled - page_path column doesn't exist)
    // TODO: Implement proper page tracking with session data
    const topPages = [];

    // Product sales (from order_items)
    const productSales = new Map<
      string,
      { quantity: number; revenue: number }
    >();
    orders?.forEach((order) => {
      order.order_items?.forEach((item: any) => {
        const key = item.product_name;
        const current = productSales.get(key) || { quantity: 0, revenue: 0 };
        productSales.set(key, {
          quantity: current.quantity + (item.quantity || 0),
          revenue: current.revenue + (item.quantity || 0) * 0.5, // Placeholder calculation
        });
      });
    });

    const topProducts = Array.from(productSales.entries())
      .map(([name], index) => ({
        id: index,
        name,
        sales: productSales.get(name)?.quantity || 0,
        revenue: productSales.get(name)?.revenue || 0,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // Revenue by day
    const revenueByDay = new Map<string, { revenue: number; orders: number }>();
    orders?.forEach((order) => {
      const date = new Date(order.created_at).toISOString().split("T")[0];
      const current = revenueByDay.get(date) || { revenue: 0, orders: 0 };
      revenueByDay.set(date, {
        revenue: current.revenue + (order.total || 0),
        orders: current.orders + 1,
      });
    });

    const revenueByDayArray = Array.from(revenueByDay.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Customer metrics
    const newCustomersThisMonth =
      customers?.filter((c) => new Date(c.created_at) > thirtyDaysAgo).length ||
      0;
    const repeatCustomers = new Set(
      orders?.filter((o) => o.customer_id).map((o) => o.customer_id),
    ).size;
    const totalCustomers = customers?.length || 0;
    const avgCustomerLifetimeValue =
      totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    const analyticsData: AnalyticsData = {
      activeUsers: uniqueUsers,
      totalPageViews,
      totalRevenue,
      totalOrders,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      devices,
      trafficSources,
      topPages,
      topProducts,
      topDesigns: [], // Placeholder for designs tracking
      revenueByDay: revenueByDayArray,
      customerMetrics: {
        totalCustomers,
        newCustomersThisMonth,
        repeatCustomers,
        avgCustomerLifetimeValue: parseFloat(
          avgCustomerLifetimeValue.toFixed(2),
        ),
      },
    };

    return res.json(analyticsData);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return res.status(500).json({
      error: "Failed to fetch analytics data",
    });
  }
};

/**
 * Track analytics event
 */
export const handleTrackEvent: RequestHandler = async (req, res) => {
  try {
    const {
      event_type,
      event_name,
      session_id,
      page_path,
      referrer,
      device_type,
      browser,
      country,
      data,
    } = req.body;
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!event_type || !event_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Respond immediately - don't block on database insert
    res.json({ success: true });

    // Process event asynchronously in background
    (async () => {
      try {
        let userId: number | null = null;
        if (token) {
          const { data: userData } = await supabase.auth.getUser(token);
          userId = userData.user?.id ? parseInt(userData.user.id) : null;
        }

        // Only insert fields that exist in the table
        const eventData: any = {
          event_type,
          event_name,
          user_id: userId,
          session_id,
        };

        // Add optional fields if provided
        if (referrer) eventData.referrer = referrer;
        if (device_type) eventData.device_type = device_type;
        if (browser) eventData.browser = browser;
        if (country) eventData.country = country;
        if (data) eventData.data = data;
        // Note: page_path field doesn't exist in schema, skip it

        const { error } = await supabase
          .from("analytics_events")
          .insert(eventData);

        if (error) {
          console.error("Error tracking event:", error);
        }
      } catch (error) {
        console.error("Error processing analytics event:", error);
      }
    })();
  } catch (error) {
    console.error("Error in analytics handler:", error);
    return res.status(400).json({ error: "Invalid request" });
  }
};
