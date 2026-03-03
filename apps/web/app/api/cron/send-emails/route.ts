import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailRequests, unsubscribes } from "@/lib/db/schema";
import { sendReviewRequestEmail } from "@/lib/email/send";
import { eq, and, lte, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let sent = 0;
  let reminded = 0;

  // --- Pass 1: Send scheduled emails ---
  const scheduledEmails = await db
    .select()
    .from(emailRequests)
    .where(
      and(
        eq(emailRequests.status, "scheduled"),
        lte(emailRequests.sendAt, new Date()),
      ),
    )
    .limit(100);

  for (const emailReq of scheduledEmails) {
    // Check if unsubscribed
    const [unsub] = await db
      .select()
      .from(unsubscribes)
      .where(
        and(
          eq(unsubscribes.storeId, emailReq.storeId),
          eq(unsubscribes.email, emailReq.customerEmail),
        ),
      )
      .limit(1);

    if (unsub) {
      await db
        .update(emailRequests)
        .set({ status: "unsubscribed" })
        .where(eq(emailRequests.id, emailReq.id));
      continue;
    }

    try {
      await sendReviewRequestEmail({
        to: emailReq.customerEmail,
        customerName: emailReq.customerName,
        productName: emailReq.productName,
        productImage: emailReq.productImage,
        token: emailReq.token,
        locale: emailReq.customerLocale,
      });

      await db
        .update(emailRequests)
        .set({ status: "sent", sentAt: new Date() })
        .where(eq(emailRequests.id, emailReq.id));

      sent++;
    } catch (err) {
      console.error(`Failed to send email ${emailReq.id}:`, err);
    }
  }

  // --- Pass 2: Send reminders (sent > 7 days ago, not yet reminded) ---
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const reminderEmails = await db
    .select()
    .from(emailRequests)
    .where(
      and(
        eq(emailRequests.status, "sent"),
        lte(emailRequests.sentAt, sevenDaysAgo),
        isNull(emailRequests.remindedAt),
      ),
    )
    .limit(100);

  for (const emailReq of reminderEmails) {
    // Check if unsubscribed
    const [unsub] = await db
      .select()
      .from(unsubscribes)
      .where(
        and(
          eq(unsubscribes.storeId, emailReq.storeId),
          eq(unsubscribes.email, emailReq.customerEmail),
        ),
      )
      .limit(1);

    if (unsub) {
      await db
        .update(emailRequests)
        .set({ status: "unsubscribed" })
        .where(eq(emailRequests.id, emailReq.id));
      continue;
    }

    try {
      await sendReviewRequestEmail({
        to: emailReq.customerEmail,
        customerName: emailReq.customerName,
        productName: emailReq.productName,
        productImage: emailReq.productImage,
        token: emailReq.token,
        locale: emailReq.customerLocale,
        isReminder: true,
      });

      await db
        .update(emailRequests)
        .set({ status: "reminded", remindedAt: new Date() })
        .where(eq(emailRequests.id, emailReq.id));

      reminded++;
    } catch (err) {
      console.error(`Failed to send reminder ${emailReq.id}:`, err);
    }
  }

  return NextResponse.json({ sent, reminded });
}
