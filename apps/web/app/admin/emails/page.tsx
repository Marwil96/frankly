"use client";

import { useEffect, useState, useCallback } from "react";
import { Window } from "@/components/win95/Window";
import { Table } from "@/components/win95/Table";
import { StatusBar } from "@/components/win95/StatusBar";

interface EmailRequest {
  id: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  customerLocale: string;
  sku: string;
  productName: string;
  status: string;
  sendAt: string;
  sentAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "scheduled", label: "Scheduled" },
  { id: "sent", label: "Sent" },
  { id: "reminded", label: "Reminded" },
  { id: "completed", label: "Completed" },
  { id: "unsubscribed", label: "Unsubscribed" },
] as const;

export default function AdminEmailsPage() {
  const [emails, setEmails] = useState<EmailRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        page: String(page),
      });
      if (filter !== "all") params.set("status", filter);

      const res = await fetch(`/api/admin/emails?${params}`, {
        credentials: "include",
      });
      const data = await res.json();
      setEmails(data.emails || []);
      setTotal(data.total || 0);
    } catch {
      // handled by auth middleware
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const totalPages = Math.ceil(total / limit);

  const statusColors: Record<string, string> = {
    scheduled: "text-blue-600",
    sent: "text-amber-600",
    reminded: "text-amber-600",
    completed: "text-green-700",
    unsubscribed: "text-red-700",
  };

  const columns: {
    key: string;
    header: string;
    render?: (row: Record<string, unknown>) => React.ReactNode;
  }[] = [
    { key: "customerName", header: "Customer" },
    { key: "customerEmail", header: "Email" },
    { key: "productName", header: "Product" },
    { key: "sku", header: "SKU" },
    { key: "orderId", header: "Order" },
    {
      key: "customerLocale",
      header: "Locale",
      render: (row) => (
        <span className="text-[10px] uppercase">
          {(row.customerLocale as string) || "--"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const status = row.status as string;
        return (
          <span className={`font-bold ${statusColors[status] || ""}`}>
            {status}
          </span>
        );
      },
    },
    {
      key: "sendAt",
      header: "Send At",
      render: (row) => {
        const d = row.sendAt as string;
        return d ? new Date(d).toLocaleDateString() : "--";
      },
    },
    {
      key: "createdAt",
      header: "Created",
      render: (row) =>
        new Date(row.createdAt as string).toLocaleDateString(),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Window title="Email Request Log">
        <div className="flex gap-0.5 mb-3 -mt-1 flex-wrap">
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
          <p className="text-[11px]">Loading emails...</p>
        ) : (
          <>
            <Table
              columns={columns}
              data={emails as unknown as Record<string, unknown>[]}
            />
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-2 text-[11px]">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-2 py-0.5 shadow-win95-button bg-win95-bg cursor-pointer disabled:opacity-50"
                >
                  &lt; Prev
                </button>
                <span className="text-win95-dark">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-2 py-0.5 shadow-win95-button bg-win95-bg cursor-pointer disabled:opacity-50"
                >
                  Next &gt;
                </button>
              </div>
            )}
          </>
        )}
      </Window>

      <StatusBar
        items={[
          `${total} email(s)`,
          filter === "all" ? "Showing all" : `Filter: ${filter}`,
          "Ready",
        ]}
      />
    </div>
  );
}
