import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, reviewPhotos, emailRequests, stores } from "@/lib/db/schema";
import { verifyReviewToken } from "@/lib/tokens";
import { uploadPhoto } from "@/lib/upload";
import { rateLimit } from "@/lib/rate-limit";
import { eq } from "drizzle-orm";

const MAX_PHOTOS = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

  const contentType = request.headers.get("content-type") || "";
  const isMultipart = contentType.includes("multipart/form-data");

  let token: string;
  let rating: number;
  let title: string;
  let reviewBody: string;
  let reviewerName: string;
  let photoFiles: File[] = [];

  if (isMultipart) {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 },
      );
    }

    token = formData.get("token") as string;
    rating = parseInt(formData.get("rating") as string, 10);
    title = formData.get("title") as string;
    reviewBody = formData.get("body") as string;
    reviewerName = formData.get("reviewerName") as string;

    // Collect photo files (field name "photos")
    const photoEntries = formData.getAll("photos");
    for (const entry of photoEntries) {
      if (entry instanceof File && entry.size > 0) {
        photoFiles.push(entry);
      }
    }

    // Enforce limits
    photoFiles = photoFiles.slice(0, MAX_PHOTOS);
    photoFiles = photoFiles.filter((f) => {
      if (f.size > MAX_FILE_SIZE) return false;
      if (!ALLOWED_TYPES.includes(f.type)) return false;
      return true;
    });
  } else {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    token = body.token;
    rating = body.rating;
    title = body.title;
    reviewBody = body.body;
    reviewerName = body.reviewerName;
  }

  if (!token || !rating || !title || !reviewBody || !reviewerName) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: token, rating, title, body, reviewerName",
      },
      { status: 400 },
    );
  }

  if (typeof rating !== "number" || isNaN(rating) || rating < 1 || rating > 5) {
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

  // Upload photos and insert into reviewPhotos table
  if (photoFiles.length > 0) {
    const uploadResults = await Promise.all(
      photoFiles.map((file, i) => uploadPhoto(file, inserted.id, i)),
    );

    await db.insert(reviewPhotos).values(
      uploadResults.map((url, i) => ({
        reviewId: inserted.id,
        url,
        sortOrder: i,
      })),
    );
  }

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
