import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailRequests } from "@/lib/db/schema";
import { validateAdmin } from "@/lib/auth";
import { eq, and, count } from "drizzle-orm";

export async function GET() {
  const payload = await validateAdmin();
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const storeCondition = eq(emailRequests.storeId, payload.storeId);

  const [
    [{ total }],
    [{ scheduled }],
    [{ sent }],
    [{ reminded }],
    [{ completed }],
    [{ unsubscribed }],
  ] = await Promise.all([
    db
      .select({ total: count() })
      .from(emailRequests)
      .where(storeCondition),
    db
      .select({ scheduled: count() })
      .from(emailRequests)
      .where(and(storeCondition, eq(emailRequests.status, "scheduled"))),
    db
      .select({ sent: count() })
      .from(emailRequests)
      .where(and(storeCondition, eq(emailRequests.status, "sent"))),
    db
      .select({ reminded: count() })
      .from(emailRequests)
      .where(and(storeCondition, eq(emailRequests.status, "reminded"))),
    db
      .select({ completed: count() })
      .from(emailRequests)
      .where(and(storeCondition, eq(emailRequests.status, "completed"))),
    db
      .select({ unsubscribed: count() })
      .from(emailRequests)
      .where(and(storeCondition, eq(emailRequests.status, "unsubscribed"))),
  ]);

  return NextResponse.json({
    scheduled,
    sent,
    reminded,
    completed,
    unsubscribed,
    total,
  });
}
