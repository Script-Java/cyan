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

      // Use AbortController with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch("/api/proofs", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn(`Proofs endpoint returned ${response.status}`);
          return;
        }

        const data: ProofsResponse = await response.json();
        const pending = (data.proofs || []).filter(
          (p) => p.status === "pending",
        ).length;
        setPendingCount(pending);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (
          fetchError instanceof TypeError &&
          fetchError.message === "Failed to fetch"
        ) {
          console.warn("Network error or CORS issue fetching proofs");
        } else if ((fetchError as any).name === "AbortError") {
          console.warn("Proofs fetch timed out");
        } else {
          throw fetchError;
        }
      }
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
        backgroundColor: "#000000",
        borderColor: "rgba(255, 255, 255, 0.3)",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <Bell className="w-4 h-4 text-white" />
      <span className="text-xs font-medium text-white">
        {pendingCount} {pendingCount === 1 ? "proof" : "proofs"} ready to review
      </span>
    </div>
  );
}
