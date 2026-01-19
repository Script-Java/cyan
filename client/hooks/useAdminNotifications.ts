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

        // Fetch support tickets count
        try {
          const ticketsResponse = await fetch("/api/admin/tickets", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (ticketsResponse.ok) {
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
          console.warn("Error fetching tickets:", err);
        }

        // Fetch pending orders count
        try {
          const ordersResponse = await fetch("/api/admin/pending-orders", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (ordersResponse.ok) {
            const ordersText = await ordersResponse.text();
            const ordersData = ordersText
              ? JSON.parse(ordersText)
              : { count: 0 };
            pendingOrders = ordersData.count || 0;
          }
        } catch (err) {
          console.warn("Error fetching pending orders:", err);
        }

        // Fetch proofs with revisions requested count
        try {
          const proofsResponse = await fetch("/api/admin/proofs", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (proofsResponse.ok) {
            const proofsText = await proofsResponse.text();
            const proofsData = proofsText
              ? JSON.parse(proofsText)
              : { proofs: [] };
            rejectedProofs = (proofsData.proofs || []).filter(
              (p: any) => p.status === "revisions_requested",
            ).length;
          }
        } catch (err) {
          console.warn("Error fetching proofs:", err);
        }

        setNotifications({
          openTickets,
          pendingOrders,
          rejectedProofs,
        });
        setError(null);
      } catch (err) {
        console.error("Error in fetchNotifications:", err);
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
