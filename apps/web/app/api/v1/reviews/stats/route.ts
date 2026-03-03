import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { validateApiKey, corsHeaders } from "@/lib/auth";
import { eq, and, count, avg } from "drizzle-orm";

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function GET(request: NextRequest) {
  const store = await validateApiKey(request);
  if (!store) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sku = searchParams.get("sku");
  if (!sku) {
    return NextResponse.json({ error: "sku is required" }, { status: 400 });
  }

  const conditions = and(
    eq(reviews.storeId, store.id),
    eq(reviews.sku, sku),
    eq(reviews.status, "approved")
  );

  const [stats] = await db
    .select({
      totalReviews: count(),
      averageRating: avg(reviews.rating),
    })
    .from(reviews)
    .where(conditions);

  // Get distribution
  const allReviews = await db
    .select({ rating: reviews.rating })
    .from(reviews)
    .where(conditions);

  const distribution: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  for (const r of allReviews) {
    distribution[r.rating] = (distribution[r.rating] || 0) + 1;
  }

  return NextResponse.json(
    {
      averageRating: stats.averageRating
        ? Math.round(parseFloat(String(stats.averageRating)) * 10) / 10
        : 0,
      totalReviews: stats.totalReviews,
      distribution,
    },
    { headers: corsHeaders(request.headers.get("origin")) }
  );
}
