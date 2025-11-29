import { useState, useCallback } from "react";

export const useStoreCredit = () => {
  const [storeCredit, setStoreCredit] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStoreCredit = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setStoreCredit(0);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/customers/me/store-credit", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const credit = typeof data.storeCredit === "number" ? data.storeCredit : 0;
        setStoreCredit(credit);
        setError(null);
      } else {
        setStoreCredit(0);
        setError("Failed to fetch store credit");
        console.error("Failed to fetch store credit:", response.status);
      }
    } catch (error) {
      setStoreCredit(0);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching store credit:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    storeCredit,
    setStoreCredit,
    fetchStoreCredit,
    isLoading,
    error,
  };
};
