import { useEffect, useState } from "react";
import { Bell, CheckCircle2, AlertTriangle, X } from "lucide-react";

interface ProofNotification {
  id: string;
  customer_id: number;
  admin_id?: string;
  proof_id: string;
  notification_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

interface ProofNotificationsResponse {
  success: boolean;
  notifications: ProofNotification[];
}

interface Props {
  onNotificationRead?: (notificationId: string) => void;
}

export default function ProofNotificationAlert({ onNotificationRead }: Props) {
  const [notifications, setNotifications] = useState<ProofNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds instead of 30 to reduce load on backend
    const interval = setInterval(fetchNotifications, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");

      if (!token) {
        setNotifications([]);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch("/api/admin/proofs", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 401) {
            setNotifications([]);
          }
          console.warn("Failed to fetch notifications:", response.status);
          return;
        }

        const data = await response.json();
        setNotifications(data.proofs || []);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          console.warn("Notifications fetch timeout");
        } else {
          console.warn("Failed to fetch notifications");
        }
        setNotifications([]);
      }
    } catch (error) {
      console.warn("Error in fetchNotifications:", error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = (notificationId: string) => {
    setDismissed((prev) => new Set([...prev, notificationId]));
  };

  const unreadNotifications = notifications.filter(
    (n) => n.notification_type === "customer_approved" && !dismissed.has(n.id),
  );

  if (unreadNotifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {unreadNotifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-4"
        >
          <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-900">
              Proof Approved!
            </p>
            <p className="text-sm text-green-700 mt-1">
              {notification.message}
            </p>
            <p className="text-xs text-green-600 mt-2">
              {new Date(notification.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <button
            onClick={() => handleDismiss(notification.id)}
            className="flex-shrink-0 text-green-600 hover:text-green-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
