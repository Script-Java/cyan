interface TrackEventPayload {
  event_type:
    | "page_view"
    | "click"
    | "purchase"
    | "cart_action"
    | "design_action"
    | "search";
  event_name: string;
  session_id?: string;
  page_path?: string;
  referrer?: string;
  device_type?: string;
  browser?: string;
  country?: string;
  data?: Record<string, any>;
}

// Generate or retrieve session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem("analyticsSessionId");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("analyticsSessionId", sessionId);
  }
  return sessionId;
}

// Detect device type
function detectDeviceType(): string {
  const userAgent = navigator.userAgent;
  if (/Mobile|Android|iPhone/.test(userAgent)) return "mobile";
  if (/Tablet|iPad/.test(userAgent)) return "tablet";
  return "desktop";
}

// Detect browser
function detectBrowser(): string {
  const userAgent = navigator.userAgent;
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Edge")) return "Edge";
  return "Unknown";
}

// Get country from IP (optional - can be enhanced)
function getCountry(): string | undefined {
  // This is a placeholder - you can enhance this with a geolocation API
  return undefined;
}

// Main tracking function
export async function trackEvent(
  event: TrackEventPayload,
): Promise<void> {
  try {
    const payload: TrackEventPayload = {
      ...event,
      session_id: event.session_id || getSessionId(),
      page_path: event.page_path || window.location.pathname,
      referrer: event.referrer || document.referrer,
      device_type: event.device_type || detectDeviceType(),
      browser: event.browser || detectBrowser(),
      country: event.country || getCountry(),
    };

    const token = localStorage.getItem("authToken");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    await fetch("/api/analytics/track", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    }).catch(() => {
      // Fail silently - analytics should never break the app
    });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    // Fail silently
  }
}

// Track page view
export function trackPageView(): void {
  trackEvent({
    event_type: "page_view",
    event_name: `Viewed ${window.location.pathname}`,
  });
}

// Track click event
export function trackClick(elementName: string, metadata?: Record<string, any>): void {
  trackEvent({
    event_type: "click",
    event_name: `Clicked ${elementName}`,
    data: metadata,
  });
}

// Track purchase
export function trackPurchase(
  orderId: number,
  amount: number,
  itemCount: number,
): void {
  trackEvent({
    event_type: "purchase",
    event_name: `Purchase - Order #${orderId}`,
    data: {
      orderId,
      amount,
      itemCount,
    },
  });
}

// Track cart action
export function trackCartAction(
  action: "add" | "remove" | "update",
  productName: string,
  quantity: number,
): void {
  trackEvent({
    event_type: "cart_action",
    event_name: `Cart ${action} - ${productName}`,
    data: {
      action,
      productName,
      quantity,
    },
  });
}

// Track design action
export function trackDesignAction(
  action: string,
  designId?: number,
): void {
  trackEvent({
    event_type: "design_action",
    event_name: `Design ${action}`,
    data: {
      action,
      designId,
    },
  });
}

// Track search
export function trackSearch(query: string, resultCount?: number): void {
  trackEvent({
    event_type: "search",
    event_name: `Searched: ${query}`,
    data: {
      query,
      resultCount,
    },
  });
}
