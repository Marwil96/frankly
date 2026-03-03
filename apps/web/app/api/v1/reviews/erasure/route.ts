import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  reviews,
  reviewPhotos,
  emailRequests,
  unsubscribes,
} from "@/lib/db/schema";
import { validateApiKey } from "@/lib/auth";
import { eq, and, inArray } from "drizzle-orm";

function corsHeaders(origin?: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
  };
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function DELETE(request: NextRequest) {
  const store = await validateApiKey(request);
  if (!store) {
    return NextResponse.json(
      { error: "Invalid API key" },
      { status: 401, headers: corsHeaders(request.headers.get("origin")) },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400, headers: corsHeaders(request.headers.get("origin")) },
    );
  }

  const { email } = body;
  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "email is required" },
      { status: 400, headers: corsHeaders(request.headers.get("origin")) },
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Find all reviews by this email in this store
  const storeReviews = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(
      and(
        eq(reviews.storeId, store.id),
        eq(reviews.reviewerEmail, normalizedEmail),
      ),
    );

  const reviewIds = storeReviews.map((r) => r.id);

  // Delete associated review photos (explicit, even though cascade exists)
  if (reviewIds.length > 0) {
    await db
      .delete(reviewPhotos)
      .where(inArray(reviewPhotos.reviewId, reviewIds));
  }

  // Delete the reviews
  const deletedReviews = reviewIds.length > 0
    ? await db
        .delete(reviews)
        .where(
          and(
            eq(reviews.storeId, store.id),
            eq(reviews.reviewerEmail, normalizedEmail),
          ),
        )
        .returning({ id: reviews.id })
    : [];

  // Delete email requests for this email + store
  const deletedEmailRequests = await db
    .delete(emailRequests)
    .where(
      and(
        eq(emailRequests.storeId, store.id),
        eq(emailRequests.customerEmail, normalizedEmail),
      ),
    )
    .returning({ id: emailRequests.id });

  // Add to unsubscribes (ignore conflict if already exists)
  await db
    .insert(unsubscribes)
    .values({
      storeId: store.id,
      email: normalizedEmail,
    })
    .onConflictDoNothing();

  return NextResponse.json(
    {
      deleted: {
        reviews: deletedReviews.length,
        emailRequests: deletedEmailRequests.length,
      },
      unsubscribed: true,
    },
    { headers: corsHeaders(request.headers.get("origin")) },
  );
}
