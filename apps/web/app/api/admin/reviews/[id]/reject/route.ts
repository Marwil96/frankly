import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { validateAdmin } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await validateAdmin();
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [review] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.id, id), eq(reviews.storeId, payload.storeId)))
    .limit(1);

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  await db
    .update(reviews)
    .set({ status: "rejected" })
    .where(eq(reviews.id, id));

  return NextResponse.json({ success: true, status: "rejected" });
}
