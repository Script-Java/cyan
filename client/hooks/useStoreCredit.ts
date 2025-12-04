import { useState, useCallback, useRef } from "react";

export const useStoreCredit = () => {
  const [storeCredit, setStoreCredit] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fetchInProgressRef = useRef(false);

  const fetchStoreCredit = useCallback(async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setStoreCredit(0);
      setError(null);
      return;
    }

    if (fetchInProgressRef.current) {
      return;
    }

    try {
      fetchInProgressRef.current = true;
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 5000);

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
          setStoreCredit(0);
          localStorage.removeItem("authToken");
        } else {
          setStoreCredit(0);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          // Fetch was aborted (likely due to timeout)
        } else {
          throw fetchError;
        }
      }
    } catch (fetchError) {
      if (fetchError instanceof TypeError) {
        // Network error
      } else {
        console.warn("Error fetching store credit:", fetchError);
      }
      setStoreCredit(0);
    } finally {
      fetchInProgressRef.current = false;
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
