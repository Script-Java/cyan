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
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");

        if (!token) {
          setIsLoading(false);
          return;
        }

        let openTickets = 0;
        let pendingOrders = 0;
        let rejectedProofs = 0;

        // Create a timeout promise
        const createTimeoutPromise = (ms: number) =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timeout")), ms)
          );

        // Fetch support tickets count with timeout
        try {
          const ticketsResponse = await Promise.race([
            fetch("/api/admin/tickets", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            createTimeoutPromise(10000),
          ]);

          if (ticketsResponse instanceof Response && ticketsResponse.ok) {
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
          console.warn("Error fetching tickets:", {
            error: err instanceof Error ? err.message : String(err),
          });
        }

        // Fetch pending orders count with timeout
        try {
          const ordersResponse = await Promise.race([
            fetch("/api/admin/pending-orders", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            createTimeoutPromise(10000),
          ]);

          if (ordersResponse instanceof Response && ordersResponse.ok) {
            const ordersText = await ordersResponse.text();
            const ordersData = ordersText
              ? JSON.parse(ordersText)
              : { count: 0 };
            pendingOrders = ordersData.count || 0;
          }
        } catch (err) {
          console.warn("Error fetching pending orders:", {
            error: err instanceof Error ? err.message : String(err),
          });
        }

        // Fetch proofs with revisions requested count with timeout
        try {
          const proofsResponse = await Promise.race([
            fetch("/api/admin/proofs", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            createTimeoutPromise(10000),
          ]);

          if (proofsResponse instanceof Response && proofsResponse.ok) {
            const proofsText = await proofsResponse.text();
            const proofsData = proofsText
              ? JSON.parse(proofsText)
              : { proofs: [] };
            rejectedProofs = (proofsData.proofs || []).filter(
              (p: any) => p.status === "revisions_requested",
            ).length;
          }
        } catch (err) {
          console.warn("Error fetching proofs:", {
            error: err instanceof Error ? err.message : String(err),
          });
        }

        setNotifications({
          openTickets,
          pendingOrders,
          rejectedProofs,
        });
        setError(null);
      } catch (err) {
        console.error("Error in fetchNotifications:", {
          error: err instanceof Error ? err.message : String(err),
        });
        setError(
          err instanceof Error ? err.message : "Failed to fetch notifications",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  return { notifications, isLoading, error };
}
