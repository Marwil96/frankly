import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stores, emailRequests, unsubscribes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyCentraSignature } from "@/lib/centra";
import { createReviewToken } from "@/lib/tokens";

export async function POST(request: NextRequest) {
  /* ── 1. Identify the store ── */
  const storeId = request.nextUrl.searchParams.get("store");
  if (!storeId) {
    return NextResponse.json({ error: "missing store param" }, { status: 400 });
  }

  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  if (!store || !store.centraWebhookSecret || !store.emailEnabled) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  /* ── 2. Verify signature ── */
  const rawBody = await request.text();
  const signature = request.headers.get("x-centra-signature");

  if (
    !signature ||
    !verifyCentraSignature(rawBody, signature, store.centraWebhookSecret)
  ) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  /* ── 3. Parse payload ── */
  let payload: Record<string, any>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  /* ── 4. Extract order data ── */
  const orderId = String(payload.order?.id || payload.orderId);
  const customer = payload.order?.customer || payload.customer || {};
  const customerEmail: string = customer.email;
  const customerName: string =
    customer.firstName || customer.name || "Customer";
  const customerLocale: string =
    payload.order?.language || payload.language || store.locale;
  const lineItems: any[] = payload.order?.lines || payload.lines || [];

  if (!customerEmail || !orderId) {
    return NextResponse.json(
      { error: "missing order or customer data" },
      { status: 400 }
    );
  }

  /* ── 5. Check unsubscribe ── */
  const [unsub] = await db
    .select()
    .from(unsubscribes)
    .where(
      and(
        eq(unsubscribes.storeId, store.id),
        eq(unsubscribes.email, customerEmail)
      )
    )
    .limit(1);

  if (unsub) {
    return NextResponse.json({
      status: "skipped",
      reason: "unsubscribed",
    });
  }

  /* ── 6. Compute sendAt ── */
  const sendAt = new Date();
  sendAt.setDate(sendAt.getDate() + store.emailDelayDays);

  /* ── 7. Schedule email requests per line item ── */
  let scheduled = 0;

  for (const item of lineItems) {
    const sku: string = item.sku || item.product?.sku || item.productSku;
    if (!sku) continue;

    const productName: string = item.product?.name || item.name || sku;
    const productImage: string | null =
      item.product?.image || item.image || null;

    const token = await createReviewToken({
      storeId: store.id,
      orderId,
      sku,
      email: customerEmail,
    });

    try {
      await db.insert(emailRequests).values({
        storeId: store.id,
        orderId,
        customerEmail,
        customerName,
        customerLocale,
        sku,
        productName,
        productImage,
        token,
        sendAt,
      });
      scheduled++;
    } catch (err: any) {
      // 23505 = unique_violation — this order+sku combo was already scheduled
      if (err?.code === "23505") {
        continue;
      }
      throw err;
    }
  }

  return NextResponse.json({ status: "ok", scheduled });
}
