import { useState, useCallback } from "react";

export const useStoreCredit = () => {
  const [storeCredit, setStoreCredit] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStoreCredit = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setStoreCredit(0);
        return;
      }

      setIsLoading(true);
      const response = await fetch("/api/customers/me/store-credit", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStoreCredit(data.storeCredit || 0);
      } else {
        console.error("Failed to fetch store credit");
      }
    } catch (error) {
      console.error("Error fetching store credit:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    storeCredit,
    setStoreCredit,
    fetchStoreCredit,
    isLoading,
  };
};
