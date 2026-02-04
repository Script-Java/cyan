import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

interface ProofsResponse {
  success: boolean;
  proofs: Array<{
    id: string;
    status: string;
  }>;
  unreadNotifications: number;
}

export default function ProofNotificationBadge() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchProofs();
    const interval = setInterval(fetchProofs, 60000); // Poll every 60 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchProofs = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch("/api/proofs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;

      const data: ProofsResponse = await response.json();
      const pending = (data.proofs || []).filter(
        (p) => p.status === "pending",
      ).length;
      setPendingCount(pending);
    } catch (error) {
      console.error("Error fetching proofs:", error);
    }
  };

  if (pendingCount === 0) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 border rounded-lg backdrop-blur-sm mt-6"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        borderColor: "rgba(59, 130, 246, 0.3)",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <Bell className="w-4 h-4 text-blue-400" />
      <span className="text-xs font-medium text-blue-200">
        {pendingCount} {pendingCount === 1 ? "proof" : "proofs"} ready to review
      </span>
    </div>
  );
}
