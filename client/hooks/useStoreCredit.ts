import { useState, useCallback } from "react";

let fetchInProgress = false;

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

      // Guard against concurrent requests
      if (fetchInProgress) {
        return;
      }

      fetchInProgress = true;
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch("/api/customers/me/store-credit", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const credit =
            typeof data.storeCredit === "number" ? data.storeCredit : 0;
          setStoreCredit(credit);
          setError(null);
        } else if (response.status === 401) {
          // Unauthorized - token may be invalid
          setStoreCredit(0);
          localStorage.removeItem("authToken");
        } else {
          setStoreCredit(0);
          console.warn("Failed to fetch store credit:", response.status);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          console.warn("Store credit fetch timeout");
        } else if (fetchError instanceof TypeError) {
          // Network error or CORS issue - silently handle
          console.warn("Network error fetching store credit - retrying later");
        } else {
          console.warn("Error fetching store credit:", fetchError);
        }
        setStoreCredit(0);
      }
    } catch (error) {
      setStoreCredit(0);
      console.warn("Store credit fetch error:", error);
    } finally {
      fetchInProgress = false;
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
