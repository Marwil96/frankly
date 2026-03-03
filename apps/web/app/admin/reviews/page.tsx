"use client";

import { useEffect, useState, useCallback } from "react";
import { Window } from "@/components/win95/Window";
import { Button } from "@/components/win95/Button";
import { Table } from "@/components/win95/Table";
import { StarRating } from "@/components/win95/StarRating";
import { StatusBar } from "@/components/win95/StatusBar";

interface ReviewPhoto {
  url: string;
  sortOrder: number;
}

interface Review {
  id: string;
  storeId: string;
  sku: string;
  rating: number;
  title: string;
  body: string;
  reviewerName: string;
  reviewerEmail: string;
  status: "pending" | "approved" | "rejected";
  verifiedPurchase: boolean;
  locale: string | null;
  photos: ReviewPhoto[];
  storeName: string;
  createdAt: string;
}

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
] as const;

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (filter !== "all") params.set("status", filter);

      const res = await fetch(`/api/admin/reviews?${params}`, {
        credentials: "include",
      });
      const data = await res.json();
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
    } catch {
      // handled by auth middleware
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function handleAction(id: string, action: "approve" | "reject") {
    setActionLoading(id);
    try {
      await fetch(`/api/admin/reviews/${id}/${action}`, {
        method: "POST",
        credentials: "include",
      });
      await fetchReviews();
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  }

  const columns: {
    key: string;
    header: string;
    render?: (row: Record<string, unknown>) => React.ReactNode;
  }[] = [
    {
      key: "rating",
      header: "Rating",
      render: (row) => <StarRating rating={row.rating as number} size="sm" />,
    },
    {
      key: "title",
      header: "Title",
      render: (row) => {
        const r = row as unknown as Review;
        return (
          <div className="flex items-center gap-1">
            <span>{r.title}</span>
            {r.verifiedPurchase && (
              <span
                className="text-green-700 text-[10px] font-bold bg-green-50 border border-green-200 px-1 rounded"
                title="Verified Purchase"
              >
                &#10003; Verified
              </span>
            )}
          </div>
        );
      },
    },
    { key: "reviewerName", header: "Reviewer" },
    { key: "sku", header: "SKU" },
    {
      key: "photos",
      header: "Photos",
      render: (row) => {
        const r = row as unknown as Review;
        if (!r.photos || r.photos.length === 0) {
          return <span className="text-win95-dark">--</span>;
        }
        return (
          <div className="flex gap-0.5">
            {r.photos.slice(0, 3).map((photo, i) => (
              <img
                key={i}
                src={photo.url}
                alt="Review photo"
                className="w-6 h-6 object-cover border border-win95-dark"
                title={`Photo ${i + 1}`}
              />
            ))}
            {r.photos.length > 3 && (
              <span className="text-[10px] text-win95-dark">
                +{r.photos.length - 3}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "locale",
      header: "Locale",
      render: (row) => {
        const r = row as unknown as Review;
        return (
          <span className="text-[10px] text-win95-dark uppercase">
            {r.locale || "--"}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const status = row.status as Review["status"];
        const colors = {
          pending: "text-amber-600",
          approved: "text-green-700",
          rejected: "text-red-700",
        };
        return (
          <span className={`font-bold ${colors[status]}`}>{status}</span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Date",
      render: (row) =>
        new Date(row.createdAt as string).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => {
        const r = row as unknown as Review;
        const isLoading = actionLoading === r.id;
        if (r.status === "approved" || r.status === "rejected") {
          return <span className="text-win95-dark">--</span>;
        }
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={() => handleAction(r.id, "approve")}
              disabled={isLoading}
            >
              {isLoading ? "..." : "Approve"}
            </Button>
            <Button
              size="sm"
              onClick={() => handleAction(r.id, "reject")}
              disabled={isLoading}
            >
              {isLoading ? "..." : "Reject"}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Window title="Review Moderation">
        <div className="flex gap-0.5 mb-3 -mt-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={`px-3 py-1 text-[11px] cursor-pointer ${
                filter === s.id
                  ? "bg-win95-bg shadow-win95-raised font-bold"
                  : "bg-win95-dark/20 shadow-win95-button"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-[11px]">Loading reviews...</p>
        ) : (
          <Table
            columns={columns}
            data={reviews as unknown as Record<string, unknown>[]}
          />
        )}
      </Window>

      <StatusBar
        items={[
          `${total} review(s)`,
          filter === "all" ? "Showing all" : `Filter: ${filter}`,
          "Ready",
        ]}
      />
    </div>
  );
}
