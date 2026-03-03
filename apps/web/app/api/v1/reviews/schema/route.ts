import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { validateApiKey, corsHeaders } from "@/lib/auth";
import { eq, and, desc, count, avg } from "drizzle-orm";

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

  const name = searchParams.get("name") || sku;
  const image = searchParams.get("image");

  const conditions = and(
    eq(reviews.storeId, store.id),
    eq(reviews.sku, sku),
    eq(reviews.status, "approved")
  );

  // Aggregate stats
  const [stats] = await db
    .select({
      totalReviews: count(),
      averageRating: avg(reviews.rating),
    })
    .from(reviews)
    .where(conditions);

  // Fetch up to 10 most recent approved reviews
  const recentReviews = await db
    .select({
      rating: reviews.rating,
      reviewerName: reviews.reviewerName,
      createdAt: reviews.createdAt,
      body: reviews.body,
    })
    .from(reviews)
    .where(conditions)
    .orderBy(desc(reviews.createdAt))
    .limit(10);

  const avgRating = stats.averageRating
    ? Math.round(parseFloat(String(stats.averageRating)) * 10) / 10
    : 0;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    ...(image ? { image } : {}),
  };

  if (stats.totalReviews > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: String(avgRating),
      reviewCount: String(stats.totalReviews),
      bestRating: "5",
      worstRating: "1",
    };
  }

  if (recentReviews.length > 0) {
    jsonLd.review = recentReviews.map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(r.rating),
        bestRating: "5",
      },
      author: {
        "@type": "Person",
        name: r.reviewerName,
      },
      datePublished: r.createdAt.toISOString().split("T")[0],
      reviewBody: r.body,
    }));
  }

  return NextResponse.json(jsonLd, {
    headers: corsHeaders(request.headers.get("origin")),
  });
}
