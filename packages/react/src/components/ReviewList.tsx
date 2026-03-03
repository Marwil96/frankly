"use client";
import { useReviews } from "../hooks/useReviews";
import { useReviewStats } from "../hooks/useReviewStats";
import { useFranklyConfig } from "./FranklyProvider";
import { getStrings } from "../i18n";
import { StarRating } from "./StarRating";

interface ReviewListProps {
  sku: string;
  limit?: number;
  className?: string;
}

const fontStack =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export function ReviewList({ sku, limit = 10, className }: ReviewListProps) {
  const { locale } = useFranklyConfig();
  const t = getStrings(locale);
  const { reviews, total, isLoading, error, page, setPage } = useReviews({
    sku,
    limit,
  });
  const stats = useReviewStats(sku);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const showFrom = (page - 1) * limit + 1;
  const showTo = Math.min(page * limit, total);

  if (isLoading && reviews.length === 0) {
    return (
      <div className={className} style={{ fontFamily: fontStack, padding: "24px 0", color: "#6b7280" }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} style={{ fontFamily: fontStack, padding: "24px 0", color: "#ef4444" }}>
        {error}
      </div>
    );
  }

  return (
    <div className={className} style={{ fontFamily: fontStack }}>
      {/* Stats header */}
      {!stats.isLoading && (
        <div
          style={{
            display: "flex",
            gap: "32px",
            alignItems: "flex-start",
            paddingBottom: "24px",
            borderBottom: "1px solid #e5e7eb",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          {/* Average rating */}
          <div style={{ textAlign: "center", minWidth: "100px" }}>
            <div
              style={{
                fontSize: "48px",
                fontWeight: 700,
                lineHeight: 1,
                color: "#111827",
              }}
            >
              {stats.averageRating.toFixed(1)}
            </div>
            <div style={{ marginTop: "4px" }}>
              <StarRating rating={Math.round(stats.averageRating)} size={16} />
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#6b7280",
                marginTop: "4px",
              }}
            >
              {stats.totalReviews} {t.reviews.toLowerCase()}
            </div>
          </div>

          {/* Distribution bars */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution[star] ?? 0;
              const pct =
                stats.totalReviews > 0
                  ? (count / stats.totalReviews) * 100
                  : 0;
              return (
                <div
                  key={star}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#6b7280",
                      width: "12px",
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {star}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#f59e0b",
                      flexShrink: 0,
                    }}
                  >
                    {"\u2605"}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "8px",
                      backgroundColor: "#f3f4f6",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        backgroundColor: "#f59e0b",
                        borderRadius: "4px",
                        transition: "width 300ms ease",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#9ca3af",
                      width: "28px",
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review list */}
      {reviews.length === 0 ? (
        <p style={{ color: "#6b7280", fontSize: "15px", padding: "24px 0" }}>
          {t.noReviews}
        </p>
      ) : (
        <div>
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                borderBottom: "1px solid #f3f4f6",
                padding: "20px 0",
              }}
            >
              {/* Header: stars + title */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "6px",
                }}
              >
                <StarRating rating={review.rating} size={14} />
                {review.title && (
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "15px",
                      color: "#111827",
                    }}
                  >
                    {review.title}
                  </span>
                )}
              </div>

              {/* Meta: name, date, verified, locale */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  color: "#6b7280",
                  marginBottom: "8px",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontWeight: 500 }}>{review.name}</span>
                <span style={{ color: "#d1d5db" }}>&middot;</span>
                <span>
                  {new Date(review.createdAt).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                {review.verifiedPurchase && (
                  <>
                    <span style={{ color: "#d1d5db" }}>&middot;</span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px",
                        color: "#059669",
                        fontWeight: 500,
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {t.verifiedPurchase}
                    </span>
                  </>
                )}
                {review.locale && (
                  <>
                    <span style={{ color: "#d1d5db" }}>&middot;</span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {review.locale}
                    </span>
                  </>
                )}
              </div>

              {/* Body */}
              {review.body && (
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    lineHeight: 1.6,
                    color: "#374151",
                  }}
                >
                  {review.body}
                </p>
              )}

              {/* Photo thumbnails */}
              {review.photos && review.photos.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  {review.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo.url}
                      alt={photo.alt || `Review photo ${idx + 1}`}
                      style={{
                        width: "64px",
                        height: "64px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "20px",
            borderTop: "1px solid #e5e7eb",
            marginTop: "4px",
          }}
        >
          <span style={{ fontSize: "13px", color: "#6b7280" }}>
            {t.showing} {showFrom}-{showTo} {t.of} {total}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              style={{
                padding: "6px 14px",
                fontSize: "13px",
                fontFamily: fontStack,
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                backgroundColor: page <= 1 ? "#f9fafb" : "#ffffff",
                color: page <= 1 ? "#9ca3af" : "#374151",
                cursor: page <= 1 ? "not-allowed" : "pointer",
                transition: "all 150ms ease",
              }}
            >
              {t.previous}
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              style={{
                padding: "6px 14px",
                fontSize: "13px",
                fontFamily: fontStack,
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                backgroundColor: page >= totalPages ? "#f9fafb" : "#ffffff",
                color: page >= totalPages ? "#9ca3af" : "#374151",
                cursor: page >= totalPages ? "not-allowed" : "pointer",
                transition: "all 150ms ease",
              }}
            >
              {t.next}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
