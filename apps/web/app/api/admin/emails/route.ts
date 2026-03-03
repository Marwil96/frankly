import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailRequests } from "@/lib/db/schema";
import { validateAdmin } from "@/lib/auth";
import { eq, and, desc, count } from "drizzle-orm";

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
        eq(emailRequests.storeId, payload.storeId),
        eq(
          emailRequests.status,
          status as "scheduled" | "sent" | "reminded" | "completed" | "unsubscribed"
        )
      )
    : eq(emailRequests.storeId, payload.storeId);

  const data = await db
    .select({
      id: emailRequests.id,
      orderId: emailRequests.orderId,
      customerEmail: emailRequests.customerEmail,
      customerName: emailRequests.customerName,
      customerLocale: emailRequests.customerLocale,
      sku: emailRequests.sku,
      productName: emailRequests.productName,
      status: emailRequests.status,
      sendAt: emailRequests.sendAt,
      sentAt: emailRequests.sentAt,
      completedAt: emailRequests.completedAt,
      createdAt: emailRequests.createdAt,
    })
    .from(emailRequests)
    .where(conditions)
    .orderBy(desc(emailRequests.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(emailRequests)
    .where(conditions);

  return NextResponse.json({ emails: data, total, page, limit });
}
