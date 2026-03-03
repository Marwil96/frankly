import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, stores } from "@/lib/db/schema";
import { validateAdmin } from "@/lib/auth";
import { eq, desc, and, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const payload = await validateAdmin();
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const offset = (page - 1) * limit;

  const conditions = status
    ? and(
        eq(reviews.storeId, payload.storeId),
        eq(reviews.status, status as "pending" | "approved" | "rejected")
      )
    : eq(reviews.storeId, payload.storeId);

  const data = await db
    .select({
      id: reviews.id,
      storeId: reviews.storeId,
      sku: reviews.sku,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      reviewerName: reviews.reviewerName,
      reviewerEmail: reviews.reviewerEmail,
      status: reviews.status,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(conditions)
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(reviews)
    .where(conditions);

  // Get store name
  const [store] = await db
    .select({ id: stores.id, name: stores.name })
    .from(stores)
    .where(eq(stores.id, payload.storeId))
    .limit(1);

  const storeName = store?.name || "Unknown";

  const enriched = data.map((r) => ({
    ...r,
    storeName,
  }));

  return NextResponse.json({ reviews: enriched, total, page, limit });
}
