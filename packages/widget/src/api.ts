interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
}

interface StatsResponse {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

interface SubmitReviewData {
  sku: string;
  rating: number;
  title: string;
  body: string;
  reviewerName: string;
  reviewerEmail: string;
}

interface SubmitReviewResponse {
  id: string;
  status: string;
  message: string;
}

export interface ReviewPhoto {
  url: string;
  sortOrder: number;
}

export interface Review {
  id: string;
  sku: string;
  rating: number;
  title: string;
  body: string;
  reviewerName: string;
  verifiedPurchase?: boolean;
  locale?: string;
  photos?: ReviewPhoto[];
  createdAt: string;
}

export interface Stats {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

function headers(apiKey: string): Record<string, string> {
  return {
    "X-API-Key": apiKey,
    "Content-Type": "application/json",
  };
}

export async function fetchReviews(
  baseUrl: string,
  apiKey: string,
  sku: string,
  page: number = 1,
  limit: number = 10
): Promise<ReviewsResponse> {
  const params = new URLSearchParams({
    sku,
    page: String(page),
    limit: String(limit),
  });
  const res = await fetch(`${baseUrl}/api/v1/reviews?${params}`, {
    headers: headers(apiKey),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch reviews: ${res.status}`);
  }
  return res.json();
}

export async function fetchStats(
  baseUrl: string,
  apiKey: string,
  sku: string
): Promise<StatsResponse> {
  const params = new URLSearchParams({ sku });
  const res = await fetch(`${baseUrl}/api/v1/reviews/stats?${params}`, {
    headers: headers(apiKey),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch stats: ${res.status}`);
  }
  return res.json();
}

export async function submitReview(
  baseUrl: string,
  apiKey: string,
  data: SubmitReviewData
): Promise<SubmitReviewResponse> {
  const res = await fetch(`${baseUrl}/api/v1/reviews`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Submission failed" }));
    throw new Error(err.error || "Submission failed");
  }
  return res.json();
}
