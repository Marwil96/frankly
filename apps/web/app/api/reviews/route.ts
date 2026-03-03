import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { validateApiKey, corsHeaders } from "@/lib/auth";
import { eq, and, desc, count } from "drizzle-orm";
import { nanoid } from "nanoid";

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
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
  const offset = (page - 1) * limit;

  const conditions = and(
    eq(reviews.storeId, store.id),
    eq(reviews.sku, sku),
    eq(reviews.status, "approved")
  );

  const data = await db
    .select({
      id: reviews.id,
      sku: reviews.sku,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      reviewerName: reviews.reviewerName,
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

  return NextResponse.json(
    { reviews: data, total, page, limit },
    { headers: corsHeaders(request.headers.get("origin")) }
  );
}

// POST submit a review (public)
export async function POST(request: NextRequest) {
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

  const { sku, rating, title, body: reviewBody, reviewerName, reviewerEmail } = body;

  if (!sku || !rating || !title || !reviewBody || !reviewerName || !reviewerEmail) {
    return NextResponse.json(
      { error: "Missing required fields: sku, rating, title, body, reviewerName, reviewerEmail" },
      { status: 400 }
    );
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 }
    );
  }

  const status: "pending" | "approved" = store.moderationEnabled ? "pending" : "approved";

  const reviewId = nanoid();

  await db.insert(reviews).values({
    id: reviewId,
    storeId: store.id,
    sku,
    rating,
    title,
    body: reviewBody,
    reviewerName,
    reviewerEmail,
    status,
  });

  return NextResponse.json(
    {
      id: reviewId,
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
