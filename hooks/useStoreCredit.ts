import { useState, useCallback, useRef } from "react";

export const useStoreCredit = () => {
  const [storeCredit, setStoreCredit] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fetchInProgressRef = useRef(false);

  const fetchStoreCredit = useCallback(async () => {
    // Store credit fetching disabled temporarily
    setStoreCredit(0);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    storeCredit,
    setStoreCredit,
    fetchStoreCredit,
    isLoading,
    error,
  };
};
