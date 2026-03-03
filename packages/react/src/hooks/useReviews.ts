"use client";
import { useState, useEffect, useCallback } from "react";
import { useFranklyConfig } from "../components/FranklyProvider";

interface ReviewPhoto {
  url: string;
  alt?: string;
}

interface Review {
  id: string;
  sku: string;
  rating: number;
  title: string;
  body: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  verifiedPurchase?: boolean;
  locale?: string;
  photos?: ReviewPhoto[];
}

interface UseReviewsOptions {
  sku: string;
  limit?: number;
  initialPage?: number;
}

interface UseReviewsResult {
  reviews: Review[];
  total: number;
  averageRating: number;
  distribution: Record<number, number>;
  isLoading: boolean;
  error: string | null;
  page: number;
  setPage: (page: number) => void;
  refetch: () => void;
}

export function useReviews({
  sku,
  limit = 10,
  initialPage = 1,
}: UseReviewsOptions): UseReviewsResult {
  const { apiUrl, apiKey } = useFranklyConfig();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [distribution, setDistribution] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        sku,
        page: String(page),
        limit: String(limit),
      });
      const res = await fetch(`${apiUrl}/api/v1/reviews?${params}`, {
        headers: { "X-API-Key": apiKey },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch reviews: ${res.status}`);
      }

      const data = await res.json();
      setReviews(data.reviews ?? []);
      setTotal(data.total ?? 0);
      setAverageRating(data.averageRating ?? 0);
      setDistribution(
        data.distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, apiKey, sku, page, limit]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    total,
    averageRating,
    distribution,
    isLoading,
    error,
    page,
    setPage,
    refetch: fetchReviews,
  };
}
