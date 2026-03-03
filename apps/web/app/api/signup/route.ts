import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stores, accounts } from "@/lib/db/schema";
import { createAdminToken } from "@/lib/auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password, storeName } = body;

  // Validate inputs
  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "A valid email is required" },
      { status: 400 },
    );
  }

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  if (!storeName || !storeName.trim()) {
    return NextResponse.json(
      { error: "Store name is required" },
      { status: 400 },
    );
  }

  // Check if email already exists
  const normalizedEmail = email.toLowerCase().trim();
  const [existing] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.email, normalizedEmail))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 },
    );
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Generate API key
  const apiKey = `fk_${nanoid(32)}`;

  // Create store, then account
  const [store] = await db
    .insert(stores)
    .values({
      name: storeName.trim(),
      apiKey,
    })
    .returning({ id: stores.id });

  const [account] = await db
    .insert(accounts)
    .values({
      email: normalizedEmail,
      passwordHash,
      storeId: store.id,
    })
    .returning({ id: accounts.id });

  // Create JWT and set cookie
  const token = await createAdminToken(account.id, store.id);
  const cookieStore = await cookies();
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return NextResponse.json({
    success: true,
    storeId: store.id,
    apiKey,
  });
}
