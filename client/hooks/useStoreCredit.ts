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
        } else {
          setStoreCredit(0);
          console.warn("Failed to fetch store credit:", response.status);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          console.warn("Store credit fetch timeout");
        } else {
          console.warn("Error fetching store credit:", fetchError);
        }
        setStoreCredit(0);
      }
    } catch (error) {
      setStoreCredit(0);
      console.warn("Store credit fetch error:", error);
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
