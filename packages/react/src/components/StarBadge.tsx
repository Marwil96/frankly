"use client";
import { useReviewStats } from "../hooks/useReviewStats";

interface StarBadgeProps {
  sku: string;
  className?: string;
}

export function StarBadge({ sku, className }: StarBadgeProps) {
  const { averageRating, totalReviews, isLoading } = useReviewStats(sku);

  if (isLoading || totalReviews === 0) {
    return null;
  }

  const rounded = Math.round(averageRating);

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: "14px",
        lineHeight: 1,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "1px",
        }}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            style={{
              fontSize: "14px",
              lineHeight: 1,
              color: i < rounded ? "#f59e0b" : "#d1d5db",
            }}
          >
            {"\u2605"}
          </span>
        ))}
      </span>
      <span style={{ color: "#6b7280" }}>({totalReviews})</span>
    </span>
  );
}
