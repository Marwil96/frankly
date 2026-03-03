import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, emailRequests, stores } from "@/lib/db/schema";
import { verifyReviewToken } from "@/lib/tokens";
import { rateLimit } from "@/lib/rate-limit";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { token, rating, title, body: reviewBody, reviewerName } = body;

  if (!token || !rating || !title || !reviewBody || !reviewerName) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: token, rating, title, body, reviewerName",
      },
      { status: 400 },
    );
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 },
    );
  }

  // Verify the token
  const tokenData = await verifyReviewToken(token);
  if (!tokenData) {
    return NextResponse.json(
      { error: "Invalid or expired review token" },
      { status: 401 },
    );
  }

  const { storeId, orderId, sku, email } = tokenData;

  // Look up store for moderation settings
  const [store] = await db
    .select({
      id: stores.id,
      moderationEnabled: stores.moderationEnabled,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const status: "pending" | "approved" = store.moderationEnabled
    ? "pending"
    : "approved";

  // Insert the review
  const [inserted] = await db
    .insert(reviews)
    .values({
      storeId,
      sku,
      rating,
      title,
      body: reviewBody,
      reviewerName,
      reviewerEmail: email,
      verifiedPurchase: true,
      status,
    })
    .returning({ id: reviews.id });

  // Mark the email request as completed
  await db
    .update(emailRequests)
    .set({ status: "completed", completedAt: new Date() })
    .where(eq(emailRequests.token, token));

  return NextResponse.json({
    success: true,
    id: inserted.id,
    status,
    message:
      status === "pending"
        ? "Review submitted and awaiting moderation."
        : "Review submitted and published.",
  });
}
