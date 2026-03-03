import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, reviewPhotos } from "@/lib/db/schema";
import { validateApiKey, corsHeaders } from "@/lib/auth";
import { verifyReviewToken } from "@/lib/tokens";
import { rateLimit } from "@/lib/rate-limit";
import { eq, and, desc, count, avg, inArray } from "drizzle-orm";

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    headers: corsHeaders(request.headers.get("origin")),
  });
}

// GET approved reviews for a SKU (public)
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

  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") || "10"))
  );
  const offset = (page - 1) * limit;
  const locale = searchParams.get("locale");

  const conditions = and(
    eq(reviews.storeId, store.id),
    eq(reviews.sku, sku),
    eq(reviews.status, "approved"),
    ...(locale ? [eq(reviews.locale, locale)] : [])
  );

  // Fetch paginated reviews
  const data = await db
    .select({
      id: reviews.id,
      sku: reviews.sku,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      reviewerName: reviews.reviewerName,
      verifiedPurchase: reviews.verifiedPurchase,
      locale: reviews.locale,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(conditions)
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);

  // Fetch photos for these reviews
  const reviewIds = data.map((r) => r.id);
  let photosMap: Record<string, { url: string; sortOrder: number }[]> = {};

  if (reviewIds.length > 0) {
    const photos = await db
      .select({
        reviewId: reviewPhotos.reviewId,
        url: reviewPhotos.url,
        sortOrder: reviewPhotos.sortOrder,
      })
      .from(reviewPhotos)
      .where(inArray(reviewPhotos.reviewId, reviewIds))
      .orderBy(reviewPhotos.sortOrder);

    for (const photo of photos) {
      if (!photosMap[photo.reviewId]) {
        photosMap[photo.reviewId] = [];
      }
      photosMap[photo.reviewId].push({
        url: photo.url,
        sortOrder: photo.sortOrder,
      });
    }
  }

  // Total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(reviews)
    .where(conditions);

  // Stats: average rating + distribution
  const [stats] = await db
    .select({ averageRating: avg(reviews.rating) })
    .from(reviews)
    .where(conditions);

  const allRatings = await db
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
  for (const r of allRatings) {
    distribution[r.rating] = (distribution[r.rating] || 0) + 1;
  }

  const averageRating = stats.averageRating
    ? Math.round(parseFloat(String(stats.averageRating)) * 10) / 10
    : 0;

  const reviewsWithPhotos = data.map((r) => ({
    ...r,
    photos: photosMap[r.id] || [],
  }));

  return NextResponse.json(
    {
      reviews: reviewsWithPhotos,
      total,
      page,
      limit,
      averageRating,
      distribution,
    },
    { headers: corsHeaders(request.headers.get("origin")) }
  );
}

// POST submit a review (public)
export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: corsHeaders(request.headers.get("origin")) },
    );
  }

  const store = await validateApiKey(request);
  if (!store) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot: if website field is filled, silently discard
  if (body.website) {
    return NextResponse.json(
      { id: "ok", status: "approved", message: "Review submitted." },
      { status: 201, headers: corsHeaders(request.headers.get("origin")) },
    );
  }

  const {
    sku,
    rating,
    title,
    body: reviewBody,
    reviewerName,
    reviewerEmail,
    token,
  } = body;

  if (
    !sku ||
    !rating ||
    !title ||
    !reviewBody ||
    !reviewerName ||
    !reviewerEmail
  ) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: sku, rating, title, body, reviewerName, reviewerEmail",
      },
      { status: 400 }
    );
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 }
    );
  }

  // Verify purchase token if provided
  let verifiedPurchase = false;
  if (token) {
    const tokenData = await verifyReviewToken(token);
    if (tokenData && tokenData.storeId === store.id && tokenData.sku === sku) {
      verifiedPurchase = true;
    }
  }

  const status: "pending" | "approved" = store.moderationEnabled
    ? "pending"
    : "approved";

  const [inserted] = await db
    .insert(reviews)
    .values({
      storeId: store.id,
      sku,
      rating,
      title,
      body: reviewBody,
      reviewerName,
      reviewerEmail,
      verifiedPurchase,
      status,
    })
    .returning({ id: reviews.id });

  return NextResponse.json(
    {
      id: inserted.id,
      status,
      message:
        status === "pending"
          ? "Review submitted and awaiting moderation."
          : "Review submitted and published.",
    },
    {
      status: 201,
      headers: corsHeaders(request.headers.get("origin")),
    }
  );
}
