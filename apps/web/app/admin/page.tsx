"use client";

import { useEffect, useState } from "react";
import { Window } from "@/components/win95/Window";
import { StarRating } from "@/components/win95/StarRating";
import { StatusBar } from "@/components/win95/StatusBar";

interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  avgRating: number;
}

interface EmailStats {
  scheduled: number;
  sent: number;
  reminded: number;
  completed: number;
  unsubscribed: number;
  total: number;
}

interface Store {
  id: string;
  name: string;
  domain: string | null;
  moderationEnabled: boolean;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [allRes, pendingRes, approvedRes, rejectedRes, storesRes, emailStatsRes] =
          await Promise.all([
            fetch("/api/admin/reviews?limit=1", { credentials: "include" }),
            fetch("/api/admin/reviews?status=pending&limit=1", {
              credentials: "include",
            }),
            fetch("/api/admin/reviews?status=approved&limit=100", {
              credentials: "include",
            }),
            fetch("/api/admin/reviews?status=rejected&limit=1", {
              credentials: "include",
            }),
            fetch("/api/admin/stores", { credentials: "include" }),
            fetch("/api/admin/email-stats", { credentials: "include" }),
          ]);

        const [allData, pendingData, approvedData, rejectedData, storesData, emailStatsData] =
          await Promise.all([
            allRes.json(),
            pendingRes.json(),
            approvedRes.json(),
            rejectedRes.json(),
            storesRes.json(),
            emailStatsRes.json(),
          ]);

        const approvedReviews = approvedData.reviews || [];
        const avgRating =
          approvedReviews.length > 0
            ? approvedReviews.reduce(
                (sum: number, r: { rating: number }) => sum + r.rating,
                0
              ) / approvedReviews.length
            : 0;

        setStats({
          total: allData.total || 0,
          pending: pendingData.total || 0,
          approved: approvedData.total || 0,
          rejected: rejectedData.total || 0,
          avgRating: Math.round(avgRating * 10) / 10,
        });
        setStores(storesData.stores || []);
        setEmailStats(emailStatsData);
      } catch {
        // Auth failure will be handled by middleware
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <Window title="Dashboard">
        <p className="text-[11px]">Loading...</p>
      </Window>
    );
  }

  const emailCompletionRate =
    emailStats && emailStats.total > 0
      ? Math.round((emailStats.completed / emailStats.total) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Window title="Total Reviews">
          <div className="text-center">
            <div className="text-[24px] font-bold">{stats?.total ?? 0}</div>
            <div className="text-[11px] text-win95-dark">All reviews</div>
          </div>
        </Window>

        <Window title="Pending">
          <div className="text-center">
            <div className="text-[24px] font-bold text-amber-600">
              {stats?.pending ?? 0}
            </div>
            <div className="text-[11px] text-win95-dark">Awaiting review</div>
          </div>
        </Window>

        <Window title="Approved">
          <div className="text-center">
            <div className="text-[24px] font-bold text-green-700">
              {stats?.approved ?? 0}
            </div>
            <div className="text-[11px] text-win95-dark">Published</div>
          </div>
        </Window>

        <Window title="Avg Rating">
          <div className="text-center">
            <div className="mb-1">
              <StarRating rating={Math.round(stats?.avgRating ?? 0)} />
            </div>
            <div className="text-[11px] text-win95-dark">
              {stats?.avgRating ?? 0} / 5
            </div>
          </div>
        </Window>
      </div>

      {emailStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Window title="Emails Scheduled">
            <div className="text-center">
              <div className="text-[24px] font-bold">
                {emailStats.scheduled}
              </div>
              <div className="text-[11px] text-win95-dark">Queued to send</div>
            </div>
          </Window>

          <Window title="Emails Sent">
            <div className="text-center">
              <div className="text-[24px] font-bold text-blue-600">
                {emailStats.sent + emailStats.reminded}
              </div>
              <div className="text-[11px] text-win95-dark">
                Sent + reminded
              </div>
            </div>
          </Window>

          <Window title="Completed">
            <div className="text-center">
              <div className="text-[24px] font-bold text-green-700">
                {emailStats.completed}
              </div>
              <div className="text-[11px] text-win95-dark">
                Reviews submitted
              </div>
            </div>
          </Window>

          <Window title="Completion Rate">
            <div className="text-center">
              <div className="text-[24px] font-bold">
                {emailCompletionRate}%
              </div>
              <div className="text-[11px] text-win95-dark">
                Of {emailStats.total} total
              </div>
            </div>
          </Window>
        </div>
      )}

      {stores.length > 0 && (
        <Window title="Store Info" statusBar={`${stores.length} store(s)`}>
          <div className="flex flex-col gap-2">
            {stores.map((store) => (
              <div key={store.id} className="shadow-win95-sunken bg-white p-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-[11px]">{store.name}</div>
                    <div className="text-[11px] text-win95-dark">
                      {store.domain || "No domain set"}
                    </div>
                  </div>
                  <div className="text-[11px]">
                    Moderation:{" "}
                    <span
                      className={
                        store.moderationEnabled
                          ? "text-green-700"
                          : "text-red-700"
                      }
                    >
                      {store.moderationEnabled ? "ON" : "OFF"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Window>
      )}

      <StatusBar
        items={[
          `${stats?.total ?? 0} total reviews`,
          `${stats?.pending ?? 0} pending`,
          `${emailStats?.total ?? 0} emails`,
          "System ready",
        ]}
      />
    </div>
  );
}
