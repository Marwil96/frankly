"use client";
import { useState, useEffect, useCallback } from "react";
import { useFranklyConfig } from "../components/FranklyProvider";

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

interface UseReviewStatsResult extends ReviewStats {
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useReviewStats(sku: string): UseReviewStatsResult {
  const { apiUrl, apiKey } = useFranklyConfig();
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [distribution, setDistribution] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${apiUrl}/api/v1/reviews/stats?sku=${encodeURIComponent(sku)}`,
        { headers: { "X-API-Key": apiKey } }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch stats: ${res.status}`);
      }

      const data = await res.json();
      setAverageRating(data.averageRating ?? 0);
      setTotalReviews(data.totalReviews ?? 0);
      setDistribution(
        data.distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, apiKey, sku]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    averageRating,
    totalReviews,
    distribution,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
