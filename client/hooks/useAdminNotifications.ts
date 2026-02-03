import { useState, useEffect } from "react";

interface NotificationCounts {
  openTickets: number;
  pendingOrders: number;
  rejectedProofs: number;
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<NotificationCounts>({
    openTickets: 0,
    pendingOrders: 0,
    rejectedProofs: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const abortControllers: AbortController[] = [];

    const fetchWithTimeout = async (
      url: string,
      token: string,
      timeoutMs: number = 8000,
    ): Promise<Response | null> => {
      const controller = new AbortController();
      abortControllers.push(controller);
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (err) {
        clearTimeout(timeoutId);
        // Ignore abort errors when component is unmounting
        if (err instanceof Error && err.name === "AbortError") {
          if (!isMounted) return null;
          console.warn(`Request timeout for ${url}`);
          return null;
        }
        throw err;
      }
    };

    const fetchNotifications = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);

        const token = localStorage.getItem("authToken");

        if (!token) {
          if (isMounted) setIsLoading(false);
          return;
        }

        let openTickets = 0;
        let pendingOrders = 0;
        let rejectedProofs = 0;

        // Fetch support tickets count
        try {
          const ticketsResponse = await fetchWithTimeout(
            "/api/admin/tickets",
            token,
          );

          if (ticketsResponse?.ok) {
            const ticketsText = await ticketsResponse.text();
            const ticketsData = ticketsText ? JSON.parse(ticketsText) : [];
            openTickets = (
              Array.isArray(ticketsData)
                ? ticketsData
                : ticketsData.tickets || []
            ).filter(
              (t: any) => t.status === "open" || t.status === "in-progress",
            ).length;
          }
        } catch (err) {
          if (isMounted) {
            console.warn("Error fetching tickets:", {
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }

        // Fetch pending orders count
        try {
          const ordersResponse = await fetchWithTimeout(
            "/api/admin/pending-orders",
            token,
          );

          if (ordersResponse?.ok) {
            const ordersText = await ordersResponse.text();
            const ordersData = ordersText
              ? JSON.parse(ordersText)
              : { count: 0 };
            pendingOrders = ordersData.count || 0;
          }
        } catch (err) {
          if (isMounted) {
            console.warn("Error fetching pending orders:", {
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }

        // Fetch proofs with revisions requested count
        try {
          const proofsResponse = await fetchWithTimeout(
            "/api/admin/proofs",
            token,
          );

          if (proofsResponse?.ok) {
            const proofsText = await proofsResponse.text();
            const proofsData = proofsText
              ? JSON.parse(proofsText)
              : { proofs: [] };
            rejectedProofs = (proofsData.proofs || []).filter(
              (p: any) => p.status === "revisions_requested",
            ).length;
          }
        } catch (err) {
          if (isMounted) {
            console.warn("Error fetching proofs:", {
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }

        if (isMounted) {
          setNotifications({
            openTickets,
            pendingOrders,
            rejectedProofs,
          });
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error in fetchNotifications:", {
            error: err instanceof Error ? err.message : String(err),
          });
          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch notifications",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      // Abort all pending requests safely
      abortControllers.forEach((controller) => {
        if (!controller.signal.aborted) {
          try {
            controller.abort();
          } catch {
            // Ignore any errors during abort
          }
        }
      });
    };
  }, []);

  return { notifications, isLoading, error };
}
