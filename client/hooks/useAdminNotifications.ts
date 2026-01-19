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
          return;
        }

        // Fetch support tickets count
        const ticketsResponse = await fetch("/api/admin/support-tickets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ticketsData = ticketsResponse.ok ? await ticketsResponse.json() : { tickets: [] };
        const openTickets = ticketsData.tickets?.filter(
          (t: any) => t.status === "open" || t.status === "in-progress"
        ).length || 0;

        // Fetch pending orders count
        const ordersResponse = await fetch("/api/admin/pending-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ordersData = ordersResponse.ok ? await ordersResponse.json() : { count: 0 };
        const pendingOrders = ordersData.count || 0;

        // Fetch rejected proofs count
        const proofsResponse = await fetch("/api/admin/proofs?status=rejected", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const proofsData = proofsResponse.ok ? await proofsResponse.json() : { proofs: [] };
        const rejectedProofs = proofsData.proofs?.filter(
          (p: any) => p.status === "revisions_requested"
        ).length || 0;

        setNotifications({
          openTickets,
          pendingOrders,
          rejectedProofs,
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch notifications");
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
