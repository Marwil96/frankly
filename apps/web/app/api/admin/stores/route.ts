import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { validateAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const payload = await validateAdmin();
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, payload.storeId))
    .limit(1);

  return NextResponse.json({ stores: store ? [store] : [] });
}

export async function PATCH(request: NextRequest) {
  const payload = await validateAdmin();
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, name, domain, moderationEnabled, emailDelayDays, emailEnabled, locale, centraWebhookSecret } = body;
  if (!id) {
    return NextResponse.json({ error: "Store id is required" }, { status: 400 });
  }

  // Ensure the admin can only update their own store
  if (id !== payload.storeId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, id))
    .limit(1);

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (domain !== undefined) updates.domain = domain;
  if (moderationEnabled !== undefined) updates.moderationEnabled = moderationEnabled;
  if (emailDelayDays !== undefined) updates.emailDelayDays = emailDelayDays;
  if (emailEnabled !== undefined) updates.emailEnabled = emailEnabled;
  if (locale !== undefined) updates.locale = locale;
  if (centraWebhookSecret !== undefined) updates.centraWebhookSecret = centraWebhookSecret;

  if (Object.keys(updates).length > 0) {
    await db.update(stores).set(updates).where(eq(stores.id, id));
  }

  const [updated] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, id))
    .limit(1);

  return NextResponse.json({ store: updated });
}
