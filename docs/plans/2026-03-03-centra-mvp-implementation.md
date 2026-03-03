# Frankly Centra MVP — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Frankly from a SQLite prototype into a multi-tenant Postgres SaaS with Centra webhook integration, post-purchase email review requests, clean embeddable widgets, photo reviews, localization, public REST API, and Fumadocs documentation.

**Architecture:** Next.js on Vercel, Neon PostgreSQL via Drizzle ORM, Resend for transactional email, Vercel Cron for scheduled email sends, Vercel Blob for photo storage. Multi-tenant via API key scoping. Win95 admin dashboard, clean/minimal customer-facing widgets.

**Tech Stack:** Next.js 15, React 19, Drizzle ORM (postgres-js driver), Neon Postgres, Resend + React Email, Fumadocs, Vercel Blob, tsup, nanoid, jose (JWT)

**Design doc:** `docs/plans/2026-03-03-centra-mvp-design.md`

---

## Task 1: Initialize git and set up project foundation

**Files:**
- Create: `.git` (via git init)
- Modify: `package.json` (add new scripts)
- Modify: `.gitignore` (update for Postgres, Vercel)
- Modify: `.env.local` (add new env vars)
- Create: `.env.example` (public template)

**Step 1: Initialize git repo**

```bash
cd /Users/williammartinsson/web/personal/frankly
git init
```

**Step 2: Create .env.example with all required variables**

```env
# Database (Neon Postgres)
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require

# Auth
ADMIN_JWT_SECRET=change-me-to-a-random-64-char-string

# Resend (transactional email)
RESEND_API_KEY=re_xxxxx

# Vercel Cron
CRON_SECRET=change-me-to-a-random-string

# Vercel Blob (photo uploads)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 3: Update .env.local with local dev values**

```env
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
ADMIN_JWT_SECRET=dev-secret-change-in-production
RESEND_API_KEY=re_test_xxxxx
CRON_SECRET=dev-cron-secret
BLOB_READ_WRITE_TOKEN=vercel_blob_test
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 4: Update .gitignore**

Add to existing `.gitignore`:
```
# Database
*.db
*.db-journal
*.db-wal

# Environment
.env.local
.env.production

# Vercel
.vercel

# Fumadocs
.source
```

**Step 5: Update root package.json scripts**

Add to `scripts`:
```json
{
  "db:push": "npm run db:push -w apps/web",
  "db:studio": "npm run db:studio -w apps/web"
}
```

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: initialize git repo with env config"
```

---

## Task 2: Migrate database from SQLite to Neon Postgres

**Files:**
- Modify: `apps/web/package.json` (swap better-sqlite3 → postgres)
- Modify: `apps/web/lib/db/schema.ts` (full rewrite for Postgres + new tables)
- Modify: `apps/web/lib/db/index.ts` (swap driver)
- Modify: `apps/web/drizzle.config.ts` (Postgres config)
- Delete: `apps/web/lib/db/migrate.ts` (use drizzle-kit push for dev)
- Delete: `apps/web/lib/db/seed.ts` (rewrite later)
- Modify: `apps/web/next.config.ts` (remove better-sqlite3 external)

**Step 1: Update apps/web/package.json dependencies**

Remove:
- `better-sqlite3`
- `@types/better-sqlite3`

Add:
- `postgres` (postgres.js driver)
- `drizzle-orm` (keep, already installed)

```bash
cd apps/web
npm uninstall better-sqlite3 @types/better-sqlite3
npm install postgres
```

**Step 2: Rewrite schema.ts with full Postgres schema**

Replace `apps/web/lib/db/schema.ts` entirely:

```typescript
import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  index,
  unique,
  pgEnum,
} from "drizzle-orm/drizzle-orm/pg-core";

export const reviewStatusEnum = pgEnum("review_status", [
  "pending",
  "approved",
  "rejected",
]);

export const emailRequestStatusEnum = pgEnum("email_request_status", [
  "scheduled",
  "sent",
  "reminded",
  "completed",
  "unsubscribed",
]);

export const stores = pgTable("stores", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  domain: text("domain"),
  apiKey: text("api_key").notNull().unique(),
  moderationEnabled: boolean("moderation_enabled").notNull().default(true),
  emailDelayDays: integer("email_delay_days").notNull().default(14),
  emailEnabled: boolean("email_enabled").notNull().default(true),
  locale: text("locale").notNull().default("en"),
  centraWebhookSecret: text("centra_webhook_secret"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id),
    sku: text("sku").notNull(),
    rating: integer("rating").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    reviewerName: text("reviewer_name").notNull(),
    reviewerEmail: text("reviewer_email").notNull(),
    status: reviewStatusEnum("status").notNull().default("pending"),
    verifiedPurchase: boolean("verified_purchase").notNull().default(false),
    locale: text("locale"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_reviews_store_sku_status").on(table.storeId, table.sku, table.status),
  ]
);

export const reviewPhotos = pgTable("review_photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  reviewId: uuid("review_id")
    .notNull()
    .references(() => reviews.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const emailRequests = pgTable(
  "email_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id),
    orderId: text("order_id").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerName: text("customer_name").notNull(),
    customerLocale: text("customer_locale").notNull().default("en"),
    sku: text("sku").notNull(),
    productName: text("product_name").notNull(),
    productImage: text("product_image"),
    token: text("token").notNull().unique(),
    status: emailRequestStatusEnum("status").notNull().default("scheduled"),
    sendAt: timestamp("send_at", { withTimezone: true }).notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    remindedAt: timestamp("reminded_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_email_requests_status_send_at").on(table.status, table.sendAt),
    unique("uq_email_requests_store_order_sku").on(
      table.storeId,
      table.orderId,
      table.sku
    ),
  ]
);

export const unsubscribes = pgTable(
  "unsubscribes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("uq_unsubscribes_store_email").on(table.storeId, table.email),
  ]
);
```

**Step 3: Rewrite db/index.ts for Postgres**

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
```

**Step 4: Rewrite drizzle.config.ts for Postgres**

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**Step 5: Update apps/web/package.json scripts**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx lib/db/seed.ts"
  }
}
```

**Step 6: Simplify next.config.ts**

Remove the `serverExternalPackages: ["better-sqlite3"]` config since we no longer use it:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

**Step 7: Delete old migration file**

```bash
rm apps/web/lib/db/migrate.ts
rm -rf apps/web/drizzle/  # old SQLite migrations
```

**Step 8: Push schema to Neon**

```bash
cd apps/web
npx drizzle-kit push
```

Expected: Tables created in Neon. Verify with `npx drizzle-kit studio`.

**Step 9: Commit**

```bash
git add -A
git commit -m "feat: migrate database from SQLite to Neon Postgres

- Replace better-sqlite3 with postgres.js driver
- Add new tables: accounts, review_photos, email_requests, unsubscribes
- Add verified_purchase, locale fields to reviews
- Add email_delay_days, email_enabled, locale, centra_webhook_secret to stores
- Use pgEnum for status fields
- Add CHECK constraint on rating via Postgres"
```

---

## Task 3: Update auth system for multi-tenant accounts

**Files:**
- Modify: `apps/web/lib/auth.ts` (rewrite for accounts table + API key validation)
- Modify: `apps/web/middleware.ts` (import shared JWT_SECRET)
- Modify: `apps/web/app/api/admin/login/route.ts` (email + password login)
- Modify: `apps/web/app/admin/login/page.tsx` (add email field)

**Step 1: Rewrite auth.ts**

```typescript
import { db } from "./db";
import { stores, accounts } from "./db/schema";
import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET!
);

export async function validateApiKey(request: Request) {
  const apiKey = request.headers.get("X-API-Key");
  if (!apiKey) return null;

  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.apiKey, apiKey))
    .limit(1);

  return store || null;
}

export async function validateAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { accountId: string; storeId: string; role: string };
  } catch {
    return null;
  }
}

export async function createAdminToken(accountId: string, storeId: string) {
  return new SignJWT({ accountId, storeId, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyLogin(email: string, password: string) {
  const [account] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.email, email.toLowerCase()))
    .limit(1);

  if (!account) return null;

  const valid = await bcrypt.compare(password, account.passwordHash);
  if (!valid) return null;

  return account;
}

export function corsHeaders(origin?: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
  };
}
```

**Step 2: Update middleware.ts to import shared secret**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET!
);

export async function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login") &&
    !request.nextUrl.pathname.startsWith("/api/")
  ) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

**Step 3: Update login route for email + password**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyLogin, createAdminToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 }
    );
  }

  const account = await verifyLogin(email, password);
  if (!account) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createAdminToken(account.id, account.storeId);

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return response;
}
```

**Step 4: Update login page to include email field**

Update `apps/web/app/admin/login/page.tsx` — add an email `Input` field above the password field. Update the fetch body to include `{ email, password }`.

**Step 5: Write seed script for dev account**

Create `apps/web/lib/db/seed.ts`:

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { stores, accounts } from "./schema";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function seed() {
  const storeId = crypto.randomUUID();
  const apiKey = `fk_${nanoid(32)}`;

  await db.insert(stores).values({
    id: storeId,
    name: "Demo Store",
    domain: "localhost",
    apiKey,
    moderationEnabled: true,
    emailDelayDays: 14,
    emailEnabled: true,
    locale: "en",
  });

  const passwordHash = await bcrypt.hash("admin123", 10);

  await db.insert(accounts).values({
    email: "admin@frankly.dev",
    passwordHash,
    storeId,
  });

  console.log(`Store created: ${storeId}`);
  console.log(`API Key: ${apiKey}`);
  console.log(`Admin login: admin@frankly.dev / admin123`);

  await client.end();
}

seed();
```

**Step 6: Run seed and verify login works**

```bash
cd apps/web
npx tsx lib/db/seed.ts
npm run dev
```

Test: POST to `/api/admin/login` with `{ "email": "admin@frankly.dev", "password": "admin123" }`.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: upgrade auth to email+password accounts

- Replace single-password auth with accounts table
- JWT now contains accountId and storeId
- Login requires email + password (bcrypt only)
- Drop plain-text password support
- Add seed script for dev account"
```

---

## Task 4: Update all existing API routes for Postgres (async queries)

**Files:**
- Modify: `apps/web/app/api/reviews/route.ts`
- Modify: `apps/web/app/api/reviews/stats/route.ts`
- Modify: `apps/web/app/api/admin/reviews/route.ts`
- Modify: `apps/web/app/api/admin/reviews/[id]/approve/route.ts`
- Modify: `apps/web/app/api/admin/reviews/[id]/reject/route.ts`
- Modify: `apps/web/app/api/admin/stores/route.ts`

The key change: SQLite Drizzle uses synchronous `.get()` and `.all()`. Postgres Drizzle is async — all queries need `await` and use `.execute()` or just `await db.select()...`.

**Step 1: Update each route file**

For every route, change patterns like:
```typescript
// OLD (SQLite sync)
const data = db.select().from(reviews).where(conditions).all();

// NEW (Postgres async)
const data = await db.select().from(reviews).where(conditions);
```

And:
```typescript
// OLD
db.insert(reviews).values(review).run();

// NEW
await db.insert(reviews).values(review);
```

And:
```typescript
// OLD
db.update(reviews).set({ status: "approved" }).where(eq(reviews.id, id)).run();

// NEW
await db.update(reviews).set({ status: "approved" }).where(eq(reviews.id, id));
```

Go through each file and make these replacements. Also update the admin routes to scope queries by `storeId` from the JWT token (call `validateAdmin()` and use `payload.storeId`).

**Step 2: Verify dev server starts and existing endpoints work**

```bash
npm run dev
```

Test: `GET /api/reviews?sku=WIDGET-001` with X-API-Key header.

**Step 3: Commit**

```bash
git add -A
git commit -m "fix: update all API routes for async Postgres queries

- Replace .all()/.get()/.run() with await
- Scope admin queries by storeId from JWT
- All existing endpoints verified working"
```

---

## Task 5: Versioned public API (v1)

**Files:**
- Create: `apps/web/app/api/v1/reviews/route.ts`
- Create: `apps/web/app/api/v1/reviews/stats/route.ts`
- Create: `apps/web/app/api/v1/reviews/schema/route.ts`

**Step 1: Create GET /api/v1/reviews — reviews with stats in one response**

`apps/web/app/api/v1/reviews/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, reviewPhotos } from "@/lib/db/schema";
import { validateApiKey, corsHeaders } from "@/lib/auth";
import { eq, and, desc, count, avg, sql } from "drizzle-orm";

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function GET(request: NextRequest) {
  const store = await validateApiKey(request);
  if (!store) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sku = searchParams.get("sku");
  if (!sku) {
    return NextResponse.json({ error: "sku is required" }, { status: 400 });
  }

  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
  const offset = (page - 1) * limit;
  const localeFilter = searchParams.get("locale");

  const conditions = and(
    eq(reviews.storeId, store.id),
    eq(reviews.sku, sku),
    eq(reviews.status, "approved"),
    localeFilter ? eq(reviews.locale, localeFilter) : undefined
  );

  // Fetch reviews
  const data = await db
    .select({
      id: reviews.id,
      sku: reviews.sku,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      reviewerName: reviews.reviewerName,
      verifiedPurchase: reviews.verifiedPurchase,
      locale: reviews.locale,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(conditions)
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);

  // Fetch photos for these reviews
  const reviewIds = data.map((r) => r.id);
  let photos: { reviewId: string; url: string; sortOrder: number }[] = [];
  if (reviewIds.length > 0) {
    photos = await db
      .select({
        reviewId: reviewPhotos.reviewId,
        url: reviewPhotos.url,
        sortOrder: reviewPhotos.sortOrder,
      })
      .from(reviewPhotos)
      .where(sql`${reviewPhotos.reviewId} IN ${reviewIds}`);
  }

  // Attach photos to reviews
  const photosByReview = new Map<string, typeof photos>();
  for (const p of photos) {
    const existing = photosByReview.get(p.reviewId) || [];
    existing.push(p);
    photosByReview.set(p.reviewId, existing);
  }

  const reviewsWithPhotos = data.map((r) => ({
    ...r,
    photos: (photosByReview.get(r.id) || []).sort((a, b) => a.sortOrder - b.sortOrder),
  }));

  // Total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(reviews)
    .where(conditions);

  // Stats
  const [stats] = await db
    .select({ averageRating: avg(reviews.rating) })
    .from(reviews)
    .where(conditions);

  // Distribution
  const dist = await db
    .select({ rating: reviews.rating, count: count() })
    .from(reviews)
    .where(conditions)
    .groupBy(reviews.rating);

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const d of dist) {
    distribution[d.rating] = d.count;
  }

  return NextResponse.json(
    {
      reviews: reviewsWithPhotos,
      total,
      page,
      limit,
      averageRating: stats.averageRating
        ? Math.round(parseFloat(String(stats.averageRating)) * 10) / 10
        : 0,
      distribution,
    },
    { headers: corsHeaders(request.headers.get("origin")) }
  );
}
```

Also add the POST handler to this same file (similar to existing `POST /api/reviews` but with `verifiedPurchase` token support and photo handling via Vercel Blob).

**Step 2: Create GET /api/v1/reviews/stats — lightweight stats only**

`apps/web/app/api/v1/reviews/stats/route.ts` — same as current stats endpoint but at the v1 path.

**Step 3: Create GET /api/v1/reviews/schema — JSON-LD structured data**

`apps/web/app/api/v1/reviews/schema/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { validateApiKey, corsHeaders } from "@/lib/auth";
import { eq, and, desc, count, avg } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const store = await validateApiKey(request);
  if (!store) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sku = searchParams.get("sku");
  const productName = searchParams.get("name") || sku;
  const productImage = searchParams.get("image");

  if (!sku) {
    return NextResponse.json({ error: "sku is required" }, { status: 400 });
  }

  const conditions = and(
    eq(reviews.storeId, store.id),
    eq(reviews.sku, sku),
    eq(reviews.status, "approved")
  );

  const [stats] = await db
    .select({ totalReviews: count(), averageRating: avg(reviews.rating) })
    .from(reviews)
    .where(conditions);

  const recentReviews = await db
    .select()
    .from(reviews)
    .where(conditions)
    .orderBy(desc(reviews.createdAt))
    .limit(10);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    ...(productImage ? { image: productImage } : {}),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: stats.averageRating
        ? Math.round(parseFloat(String(stats.averageRating)) * 10) / 10
        : 0,
      reviewCount: stats.totalReviews,
      bestRating: 5,
      worstRating: 1,
    },
    review: recentReviews.map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
      },
      author: { "@type": "Person", name: r.reviewerName },
      datePublished: r.createdAt.toISOString().split("T")[0],
      reviewBody: r.body,
    })),
  };

  return NextResponse.json(schema, {
    headers: corsHeaders(request.headers.get("origin")),
  });
}
```

**Step 4: Verify all v1 endpoints work**

```bash
npm run dev
# Test with curl or Postman
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add versioned public API (v1)

- GET /api/v1/reviews — reviews with photos, stats, distribution
- GET /api/v1/reviews/stats — lightweight stats for PLP badges
- GET /api/v1/reviews/schema — JSON-LD structured data for SEO
- Locale filtering support
- Photo attachment on reviews"
```

---

## Task 6: Centra webhook receiver

**Files:**
- Create: `apps/web/app/api/webhooks/centra/route.ts`
- Create: `apps/web/lib/centra.ts` (webhook signature verification)
- Create: `apps/web/lib/tokens.ts` (review token generation)

**Step 1: Create Centra signature verification helper**

`apps/web/lib/centra.ts`:

```typescript
import crypto from "crypto";

export function verifyCentraSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

**Step 2: Create review token helper**

`apps/web/lib/tokens.ts`:

```typescript
import { SignJWT, jwtVerify } from "jose";

const TOKEN_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET!
);

export async function createReviewToken(data: {
  storeId: string;
  orderId: string;
  sku: string;
  email: string;
}) {
  return new SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("90d")
    .sign(TOKEN_SECRET);
}

export async function verifyReviewToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, TOKEN_SECRET);
    return payload as {
      storeId: string;
      orderId: string;
      sku: string;
      email: string;
    };
  } catch {
    return null;
  }
}
```

**Step 3: Create the webhook route**

`apps/web/app/api/webhooks/centra/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stores, emailRequests, unsubscribes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyCentraSignature } from "@/lib/centra";
import { createReviewToken } from "@/lib/tokens";

export async function POST(request: NextRequest) {
  const storeId = request.nextUrl.searchParams.get("store");
  if (!storeId) {
    return NextResponse.json({ error: "Missing store param" }, { status: 400 });
  }

  // Get store
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  if (!store || !store.centraWebhookSecret || !store.emailEnabled) {
    return NextResponse.json({ error: "Store not found or not configured" }, { status: 404 });
  }

  // Verify signature
  const rawBody = await request.text();
  const signature = request.headers.get("x-centra-signature") || "";

  if (!verifyCentraSignature(rawBody, signature, store.centraWebhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);

  // Extract order data from Centra shipment webhook
  const orderId = String(payload.order?.id || payload.orderId);
  const customer = payload.order?.customer || payload.customer || {};
  const customerEmail = customer.email;
  const customerName = customer.firstName || customer.name || "Customer";
  const customerLocale = payload.order?.language || payload.language || store.locale;
  const lineItems = payload.order?.lines || payload.lines || [];

  if (!customerEmail || !orderId) {
    return NextResponse.json({ error: "Missing order data" }, { status: 400 });
  }

  // Check if customer has unsubscribed
  const [unsub] = await db
    .select()
    .from(unsubscribes)
    .where(
      and(eq(unsubscribes.storeId, store.id), eq(unsubscribes.email, customerEmail))
    )
    .limit(1);

  if (unsub) {
    return NextResponse.json({ status: "skipped", reason: "unsubscribed" });
  }

  // Schedule email requests for each line item
  const sendAt = new Date();
  sendAt.setDate(sendAt.getDate() + store.emailDelayDays);

  let scheduled = 0;
  for (const item of lineItems) {
    const sku = item.sku || item.product?.sku || item.productSku;
    const productName = item.product?.name || item.name || sku;
    const productImage = item.product?.image || item.image || null;

    if (!sku) continue;

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
        status: "scheduled",
        sendAt,
      });
      scheduled++;
    } catch (err: any) {
      // UNIQUE constraint violation = duplicate, skip silently
      if (err.code === "23505") continue;
      throw err;
    }
  }

  return NextResponse.json({ status: "ok", scheduled });
}
```

**Step 4: Test with a mock webhook**

```bash
curl -X POST "http://localhost:3000/api/webhooks/centra?store=STORE_ID" \
  -H "Content-Type: application/json" \
  -H "X-Centra-Signature: COMPUTED_HMAC" \
  -d '{"order":{"id":"ORD-123","customer":{"email":"test@example.com","firstName":"Test"},"language":"sv","lines":[{"sku":"JACKET-001","product":{"name":"Cool Jacket","image":"https://example.com/jacket.jpg"}}]}}'
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Centra webhook receiver

- POST /api/webhooks/centra?store={id}
- HMAC-SHA256 signature verification
- Schedules email_requests per line item
- Respects unsubscribes
- Idempotent via UNIQUE constraint (duplicate webhooks ignored)"
```

---

## Task 7: Email sending with Resend + React Email

**Files:**
- Create: `apps/web/lib/email/send.ts` (Resend send function)
- Create: `apps/web/lib/email/templates/review-request.tsx` (React Email template)
- Create: `apps/web/lib/email/templates/review-reminder.tsx`
- Create: `apps/web/lib/i18n/emails.ts` (localized email strings)
- Create: `apps/web/app/api/cron/send-emails/route.ts` (cron handler)

**Step 1: Install dependencies**

```bash
cd apps/web
npm install resend @react-email/components
```

**Step 2: Create localization strings**

`apps/web/lib/i18n/emails.ts`:

```typescript
export const emailStrings = {
  en: {
    subject: "How's your {productName}?",
    greeting: "Hi {name},",
    body: "We'd love to hear what you think about your recent purchase.",
    cta: "Tap a star to leave a review",
    unsubscribe: "Unsubscribe from review emails",
    reminderSubject: "Quick reminder: share your thoughts on {productName}",
    reminderBody: "We noticed you haven't reviewed your {productName} yet. Your feedback helps other customers.",
  },
  sv: {
    subject: "Vad tycker du om din {productName}?",
    greeting: "Hej {name},",
    body: "Vi vill gärna höra vad du tycker om ditt senaste köp.",
    cta: "Tryck på en stjärna för att lämna en recension",
    unsubscribe: "Avsluta prenumeration på recensionsmail",
    reminderSubject: "Påminnelse: dela dina tankar om {productName}",
    reminderBody: "Vi såg att du inte har recenserat din {productName} ännu. Din feedback hjälper andra kunder.",
  },
  nb: {
    subject: "Hva synes du om din {productName}?",
    greeting: "Hei {name},",
    body: "Vi vil gjerne høre hva du synes om ditt nylige kjøp.",
    cta: "Trykk på en stjerne for å skrive en anmeldelse",
    unsubscribe: "Avslutt abonnement på anmeldelsesmailer",
    reminderSubject: "Påminnelse: del dine tanker om {productName}",
    reminderBody: "Vi la merke til at du ikke har anmeldt din {productName} ennå. Din tilbakemelding hjelper andre kunder.",
  },
  da: {
    subject: "Hvad synes du om din {productName}?",
    greeting: "Hej {name},",
    body: "Vi vil gerne høre, hvad du synes om dit seneste køb.",
    cta: "Tryk på en stjerne for at skrive en anmeldelse",
    unsubscribe: "Afmeld anmeldelsesmails",
    reminderSubject: "Påmindelse: del dine tanker om {productName}",
    reminderBody: "Vi har bemærket, at du endnu ikke har anmeldt din {productName}. Din feedback hjælper andre kunder.",
  },
} as const;

export type Locale = keyof typeof emailStrings;

export function t(locale: string, key: keyof typeof emailStrings.en, vars?: Record<string, string>) {
  const l = (locale in emailStrings ? locale : "en") as Locale;
  let str = emailStrings[l][key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, v);
    }
  }
  return str;
}
```

**Step 3: Create React Email template**

`apps/web/lib/email/templates/review-request.tsx`:

Build a React Email template with:
- Product image
- Greeting in locale
- 5 clickable star links pointing to `{appUrl}/review?token={token}&rating={n}`
- Unsubscribe link pointing to `{appUrl}/api/unsubscribe?token={token}`
- Clean, minimal styling (no Win95)

**Step 4: Create email send function**

`apps/web/lib/email/send.ts`:

```typescript
import { Resend } from "resend";
import { ReviewRequestEmail } from "./templates/review-request";
import { t } from "@/lib/i18n/emails";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReviewRequestEmail(params: {
  to: string;
  customerName: string;
  productName: string;
  productImage: string | null;
  token: string;
  locale: string;
  isReminder?: boolean;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const subjectKey = params.isReminder ? "reminderSubject" : "subject";
  const subject = t(params.locale, subjectKey, { productName: params.productName });

  await resend.emails.send({
    from: "Frankly Reviews <reviews@frankly.dev>",
    to: params.to,
    subject,
    react: ReviewRequestEmail({
      ...params,
      appUrl,
      strings: {
        greeting: t(params.locale, "greeting", { name: params.customerName }),
        body: t(params.locale, params.isReminder ? "reminderBody" : "body", {
          productName: params.productName,
        }),
        cta: t(params.locale, "cta"),
        unsubscribe: t(params.locale, "unsubscribe"),
      },
    }),
  });
}
```

**Step 5: Create the cron route**

`apps/web/app/api/cron/send-emails/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailRequests, unsubscribes } from "@/lib/db/schema";
import { eq, and, lte, isNull } from "drizzle-orm";
import { sendReviewRequestEmail } from "@/lib/email/send";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let sent = 0;
  let reminded = 0;

  // 1. Send initial review requests
  const due = await db
    .select()
    .from(emailRequests)
    .where(and(eq(emailRequests.status, "scheduled"), lte(emailRequests.sendAt, now)))
    .limit(100);

  for (const req of due) {
    // Double-check unsubscribe
    const [unsub] = await db
      .select()
      .from(unsubscribes)
      .where(
        and(eq(unsubscribes.storeId, req.storeId), eq(unsubscribes.email, req.customerEmail))
      )
      .limit(1);

    if (unsub) {
      await db
        .update(emailRequests)
        .set({ status: "unsubscribed" })
        .where(eq(emailRequests.id, req.id));
      continue;
    }

    try {
      await sendReviewRequestEmail({
        to: req.customerEmail,
        customerName: req.customerName,
        productName: req.productName,
        productImage: req.productImage,
        token: req.token,
        locale: req.customerLocale,
      });

      await db
        .update(emailRequests)
        .set({ status: "sent", sentAt: now })
        .where(eq(emailRequests.id, req.id));
      sent++;
    } catch (err) {
      console.error(`Failed to send email for ${req.id}:`, err);
      // Leave as scheduled — retry next hour
    }
  }

  // 2. Send reminders (7 days after initial send)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const remindable = await db
    .select()
    .from(emailRequests)
    .where(
      and(
        eq(emailRequests.status, "sent"),
        lte(emailRequests.sentAt, sevenDaysAgo),
        isNull(emailRequests.remindedAt)
      )
    )
    .limit(100);

  for (const req of remindable) {
    try {
      await sendReviewRequestEmail({
        to: req.customerEmail,
        customerName: req.customerName,
        productName: req.productName,
        productImage: req.productImage,
        token: req.token,
        locale: req.customerLocale,
        isReminder: true,
      });

      await db
        .update(emailRequests)
        .set({ status: "reminded", remindedAt: now })
        .where(eq(emailRequests.id, req.id));
      reminded++;
    } catch (err) {
      console.error(`Failed to send reminder for ${req.id}:`, err);
    }
  }

  return NextResponse.json({ sent, reminded });
}
```

**Step 6: Add Vercel cron config**

Create `apps/web/vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-emails",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add email review request flow

- Resend integration with React Email templates
- Localized emails in en/sv/nb/da
- Cron job sends scheduled emails hourly
- One reminder after 7 days, then stops
- Unsubscribe check before every send
- Vercel Cron config for hourly execution"
```

---

## Task 8: Review landing page and unsubscribe endpoint

**Files:**
- Create: `apps/web/app/review/page.tsx` (review landing page)
- Create: `apps/web/app/api/unsubscribe/route.ts`
- Modify: `apps/web/app/api/v1/reviews/route.ts` (add verified_purchase via token in POST)

**Step 1: Create the review landing page**

`apps/web/app/review/page.tsx`:

A clean, minimal page that:
- Reads `token` and `rating` from searchParams
- Calls `verifyReviewToken(token)` server-side
- If invalid/expired: shows error
- If valid: renders a form pre-filled with the rating, customer name, email (from token), product name
- Form fields: star rating (adjustable), title, body, photo upload (up to 3)
- On submit: POSTs to `/api/v1/reviews` with the token
- Shows success message in the customer's locale
- Clean, modern design — no Win95

**Step 2: Create unsubscribe endpoint**

`apps/web/app/api/unsubscribe/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailRequests, unsubscribes } from "@/lib/db/schema";
import { verifyReviewToken } from "@/lib/tokens";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return new NextResponse("Missing token", { status: 400 });
  }

  const payload = await verifyReviewToken(token);
  if (!payload) {
    return new NextResponse("Invalid or expired link", { status: 400 });
  }

  // Add to unsubscribes (ignore if already exists)
  try {
    await db.insert(unsubscribes).values({
      storeId: payload.storeId,
      email: payload.email,
    });
  } catch (err: any) {
    if (err.code !== "23505") throw err; // Ignore duplicate
  }

  // Update any pending email requests for this email
  await db
    .update(emailRequests)
    .set({ status: "unsubscribed" })
    .where(eq(emailRequests.token, token));

  // Return a simple HTML confirmation page
  return new NextResponse(
    `<!DOCTYPE html>
    <html><head><title>Unsubscribed</title></head>
    <body style="font-family:sans-serif;max-width:500px;margin:80px auto;text-align:center">
      <h2>You've been unsubscribed</h2>
      <p>You won't receive any more review request emails.</p>
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
```

**Step 3: Update POST /api/v1/reviews to handle token-based verified submissions**

In the POST handler, if a `token` field is present in the body:
- Call `verifyReviewToken(token)`
- If valid: set `verifiedPurchase = true`, use email from token, mark the corresponding `emailRequest` as `completed`
- If invalid: proceed as normal (unverified review)

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add review landing page and unsubscribe

- /review?token=xxx&rating=4 — pre-filled review form
- Token verification marks review as verified_purchase
- Unsubscribe endpoint adds to blocklist
- Marks email_request as completed on review submit"
```

---

## Task 9: Photo upload support

**Files:**
- Create: `apps/web/lib/upload.ts` (Vercel Blob upload helper)
- Modify: `apps/web/app/api/v1/reviews/route.ts` (handle multipart photo upload in POST)

**Step 1: Install Vercel Blob**

```bash
cd apps/web
npm install @vercel/blob
```

**Step 2: Create upload helper**

`apps/web/lib/upload.ts`:

```typescript
import { put } from "@vercel/blob";

export async function uploadPhoto(file: File, reviewId: string, index: number) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `reviews/${reviewId}/${index}.${ext}`;

  const blob = await put(path, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return blob.url;
}
```

**Step 3: Update POST /api/v1/reviews to handle FormData**

When the request Content-Type is `multipart/form-data`:
- Parse the form data
- Extract fields (sku, rating, title, body, reviewerName, reviewerEmail, token)
- Extract files (photos — up to 3, max 10MB each, JPEG/PNG/WebP only)
- Insert review
- Upload photos to Vercel Blob
- Insert into review_photos table

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add photo upload for reviews

- Vercel Blob storage for review photos
- Up to 3 photos per review (10MB max, JPEG/PNG/WebP)
- Photos served from CDN
- Stored in review_photos table with sort_order"
```

---

## Task 10: Redesign React SDK with clean/minimal styling

**Files:**
- Modify: `packages/react/src/components/FranklyProvider.tsx` (add locale prop)
- Rewrite: `packages/react/src/components/ReviewList.tsx` (clean design)
- Rewrite: `packages/react/src/components/ReviewForm.tsx` (clean design + photo upload)
- Rewrite: `packages/react/src/components/StarRating.tsx` (clean design)
- Create: `packages/react/src/components/StarBadge.tsx` (new — compact PLP badge)
- Modify: `packages/react/src/hooks/useReviews.ts` (update for v1 API response)
- Modify: `packages/react/src/hooks/useReviewStats.ts` (update for v1 API)
- Modify: `packages/react/src/hooks/useSubmitReview.ts` (add photo support)
- Create: `packages/react/src/i18n.ts` (widget UI strings in sv/nb/da/en)
- Modify: `packages/react/src/index.ts` (export StarBadge)

**Step 1: Add i18n strings for widget UI**

`packages/react/src/i18n.ts`:

```typescript
export const widgetStrings = {
  en: {
    reviews: "Reviews",
    writeReview: "Write a Review",
    outOf: "out of 5",
    noReviews: "No reviews yet. Be the first!",
    verifiedPurchase: "Verified Purchase",
    submitReview: "Submit Review",
    thankYou: "Thank you for your review!",
    pending: "Your review is pending approval.",
    title: "Title",
    body: "Your review",
    name: "Your name",
    email: "Your email",
    addPhotos: "Add photos",
    showing: "Showing",
    of: "of",
    previous: "Previous",
    next: "Next",
  },
  sv: {
    reviews: "Recensioner",
    writeReview: "Skriv en recension",
    outOf: "av 5",
    noReviews: "Inga recensioner ännu. Bli den första!",
    verifiedPurchase: "Verifierat köp",
    submitReview: "Skicka recension",
    thankYou: "Tack för din recension!",
    pending: "Din recension väntar på godkännande.",
    title: "Titel",
    body: "Din recension",
    name: "Ditt namn",
    email: "Din e-post",
    addPhotos: "Lägg till bilder",
    showing: "Visar",
    of: "av",
    previous: "Föregående",
    next: "Nästa",
  },
  nb: {
    reviews: "Anmeldelser",
    writeReview: "Skriv en anmeldelse",
    outOf: "av 5",
    noReviews: "Ingen anmeldelser ennå. Bli den første!",
    verifiedPurchase: "Verifisert kjøp",
    submitReview: "Send inn anmeldelse",
    thankYou: "Takk for din anmeldelse!",
    pending: "Din anmeldelse venter på godkjenning.",
    title: "Tittel",
    body: "Din anmeldelse",
    name: "Ditt navn",
    email: "Din e-post",
    addPhotos: "Legg til bilder",
    showing: "Viser",
    of: "av",
    previous: "Forrige",
    next: "Neste",
  },
  da: {
    reviews: "Anmeldelser",
    writeReview: "Skriv en anmeldelse",
    outOf: "af 5",
    noReviews: "Ingen anmeldelser endnu. Vær den første!",
    verifiedPurchase: "Verificeret køb",
    submitReview: "Indsend anmeldelse",
    thankYou: "Tak for din anmeldelse!",
    pending: "Din anmeldelse afventer godkendelse.",
    title: "Titel",
    body: "Din anmeldelse",
    name: "Dit navn",
    email: "Din e-mail",
    addPhotos: "Tilføj billeder",
    showing: "Viser",
    of: "af",
    previous: "Forrige",
    next: "Næste",
  },
};
```

**Step 2: Update FranklyProvider to include locale in context**

Add `locale` prop (default "en") to the provider, pass through context.

**Step 3: Create StarBadge component**

`packages/react/src/components/StarBadge.tsx`:

A compact inline component for PLPs: `★★★★☆ (47)`. Uses `useReviewStats` hook. Minimal CSS — just inline stars and a count. Accepts `sku` and optional `locale` props.

**Step 4: Redesign ReviewList, ReviewForm, StarRating**

Rewrite all three components with:
- Clean, modern, minimal CSS (CSS modules or inline styles — no Tailwind dependency in the SDK)
- Photo gallery in ReviewList (lightbox on click)
- Rating distribution bar chart in ReviewList header
- Verified purchase badge
- Locale indicator per review
- Photo drag-and-drop upload in ReviewForm
- All UI text from i18n strings based on locale from context

**Step 5: Update hooks for v1 API response shape**

- `useReviews`: expect `{ reviews, total, page, limit, averageRating, distribution }` from `/api/v1/reviews`
- `useReviewStats`: point to `/api/v1/reviews/stats`
- `useSubmitReview`: support FormData (for photos) in addition to JSON

**Step 6: Export StarBadge from index.ts**

**Step 7: Build and verify**

```bash
cd packages/react
npm run build
```

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: redesign React SDK with clean/minimal styling

- New StarBadge component for PLP inline display
- ReviewList with photo gallery, distribution chart, verified badge
- ReviewForm with photo drag-and-drop upload
- Full i18n: en/sv/nb/da
- All hooks updated for v1 API
- No Win95 styling — clean, brand-neutral design"
```

---

## Task 11: Redesign vanilla JS widget

**Files:**
- Rewrite: `packages/widget/src/styles.ts` (clean/minimal CSS)
- Modify: `packages/widget/src/index.ts` (add locale support, point to v1 API)
- Modify: `packages/widget/src/api.ts` (update API paths)
- Modify: `packages/widget/src/components/ReviewList.ts` (clean design + photos)
- Modify: `packages/widget/src/components/ReviewForm.ts` (clean design + photos)
- Modify: `packages/widget/src/components/Stars.ts` (clean design)

**Step 1: Rewrite styles.ts with clean/minimal CSS**

Replace the Win95 CSS with modern, neutral styling:
- System font stack
- Subtle borders and shadows
- Neutral gray palette that works on any storefront
- Responsive layout
- Photo thumbnail grid

**Step 2: Add locale support to index.ts**

Read `data-frankly-locale` attribute, pass to components for UI string rendering.

**Step 3: Update API paths to v1**

Point to `/api/v1/reviews`, `/api/v1/reviews/stats`.

**Step 4: Update components for clean design + photo display**

Add photo thumbnails in ReviewList, verified purchase badge, locale indicator.

**Step 5: Build and verify**

```bash
cd packages/widget
npm run build
```

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: redesign vanilla widget with clean/minimal styling

- Replace Win95 CSS with modern neutral design
- Add locale support (data-frankly-locale attribute)
- Point to v1 API endpoints
- Photo display in review list
- Verified purchase badge"
```

---

## Task 12: Update admin dashboard for new features

**Files:**
- Modify: `apps/web/app/admin/page.tsx` (add email stats)
- Modify: `apps/web/app/admin/reviews/page.tsx` (add photo display, verified badge)
- Modify: `apps/web/app/admin/settings/page.tsx` (add Centra webhook config, email settings)
- Create: `apps/web/app/admin/emails/page.tsx` (email request log)
- Modify: `apps/web/app/api/admin/stores/route.ts` (handle new fields)

**Step 1: Update dashboard with email stats**

Add cards for: emails scheduled, sent, completion rate (completed/sent).

**Step 2: Update reviews page**

- Show photo thumbnails in the review table
- Show "Verified" badge for verified_purchase reviews
- Show locale indicator

**Step 3: Update settings page**

Add fields for:
- Centra webhook secret (password input + show/hide toggle)
- Centra webhook URL (read-only, copy button): `https://frankly.dev/api/webhooks/centra?store={storeId}`
- Email delay days (number input)
- Email enabled toggle
- Default locale select (en/sv/nb/da)

**Step 4: Create email log page**

`/admin/emails` — table of email_requests with columns: customer, product, status, scheduled, sent, reminded. Win95 Table component. Filter by status.

**Step 5: Update stores API route for new fields**

Handle PATCH with `emailDelayDays`, `emailEnabled`, `locale`, `centraWebhookSecret`.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: update admin dashboard for Centra + email features

- Dashboard shows email stats
- Reviews page shows photos and verified badges
- Settings page has Centra webhook config and email settings
- New /admin/emails page with email request log"
```

---

## Task 13: Documentation site with Fumadocs

**Files:**
- Create: `apps/docs/` (new app in monorepo for Fumadocs)
- OR: Integrate Fumadocs into `apps/web` at `/docs` route

**Step 1: Set up Fumadocs**

```bash
cd apps
npx create-fumadocs-app@latest docs
```

Choose: Next.js, MDX content source, default theme.

**Step 2: Add to monorepo**

Update root `package.json` workspaces:
```json
"workspaces": ["apps/web", "apps/docs", "packages/widget", "packages/react"]
```

**Step 3: Write MDX content for each docs page**

Create the following pages as MDX files in `apps/docs/content/docs/`:

1. `index.mdx` — Overview: what Frankly is, key features
2. `getting-started.mdx` — 5-minute Centra quickstart: sign up → configure webhook → embed widget
3. `centra-integration.mdx` — Webhook setup, signing secret, Centra admin steps, payload reference
4. `api-reference.mdx` — Full v1 API docs: endpoints, authentication, request/response examples, error codes
5. `react-sdk.mdx` — npm install, FranklyProvider setup, component reference, headless mode, props table
6. `widget.mdx` — Script tag embed, data attributes, locale support
7. `email-flow.mdx` — How review requests work, timing, reminder logic, customization
8. `structured-data.mdx` — JSON-LD endpoint usage, Google rich snippets verification
9. `photo-reviews.mdx` — Upload limits, supported formats, CDN hosting, moderation
10. `localization.mdx` — Supported locales, how detection works, widget vs email locale
11. `gdpr.mdx` — Data handling, right to erasure, unsubscribe, DPA, Omnibus compliance
12. `migrating.mdx` — Importing reviews from CSV or other platforms (future — placeholder)

**Step 4: Configure Fumadocs navigation**

Set up `meta.json` files for sidebar ordering to match the page list above.

**Step 5: Verify docs build and look correct**

```bash
cd apps/docs
npm run dev
```

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add documentation site with Fumadocs

- 12 MDX documentation pages
- Getting started guide for Centra integration
- Full API reference
- React SDK and widget embedding guides
- GDPR compliance documentation"
```

---

## Task 14: Landing page update

**Files:**
- Modify: `apps/web/app/page.tsx` (update homepage for SaaS positioning)

**Step 1: Rewrite the landing page**

Update from the current Win95-themed demo page to a proper SaaS landing page:
- Hero: "Product reviews for headless e-commerce" + CTA to sign up / view docs
- Feature grid: Centra integration, email flow, photo reviews, localization, JSON-LD, GDPR
- Integration code examples (React SDK + script tag)
- Pricing section (Starter €49 / Growth €99 / Pro €199)
- Footer with links to docs, GitHub, legal

Keep the Win95 aesthetic for the landing page — it's part of the brand identity. The admin dashboard and landing page are Win95; only the customer-facing embeddable widgets are clean/minimal.

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: update landing page for SaaS positioning

- Hero section with value proposition
- Feature grid highlighting Centra integration
- Pricing tiers
- Integration code examples
- Links to docs"
```

---

## Task 15: Anti-spam basics

**Files:**
- Create: `apps/web/lib/rate-limit.ts` (simple in-memory rate limiter)
- Modify: `apps/web/app/api/v1/reviews/route.ts` (add rate limit + honeypot check)

**Step 1: Create rate limiter**

`apps/web/lib/rate-limit.ts`:

```typescript
const requests = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string, maxRequests = 5, windowMs = 60 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = requests.get(ip);

  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}
```

**Step 2: Add rate limit + honeypot to POST /api/v1/reviews**

- Check `rateLimit(ip)` — return 429 if exceeded
- Check for honeypot field `website` — if filled, return 201 (fake success, discard)

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add anti-spam measures

- In-memory rate limiting (5 submissions/IP/hour)
- Honeypot field on review submission
- Silent rejection of bot submissions"
```

---

## Task 16: Signup flow

**Files:**
- Create: `apps/web/app/signup/page.tsx` (signup page)
- Create: `apps/web/app/api/signup/route.ts` (create account + store)

**Step 1: Create signup API**

`apps/web/app/api/signup/route.ts`:

- Accept: `{ email, password, storeName }`
- Validate: email format, password length >= 8
- Hash password with bcrypt
- Generate API key: `fk_${nanoid(32)}`
- Create store + account in a transaction
- Return JWT token (auto-login)

**Step 2: Create signup page**

Clean, minimal form (not Win95): email, password, store name, submit button. On success: redirect to `/admin`.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add self-service signup flow

- POST /api/signup creates account + store
- Auto-generates API key
- Auto-login via JWT after signup
- Clean signup page"
```

---

## Task 17: GDPR — right to erasure endpoint

**Files:**
- Create: `apps/web/app/api/v1/reviews/erasure/route.ts`

**Step 1: Create erasure endpoint**

`DELETE /api/v1/reviews/erasure` — requires API key + email + token:

- Validates token (proves the requester owns the email)
- Deletes all reviews by that email for the store
- Deletes associated review_photos
- Deletes email_requests for that email
- Adds to unsubscribes
- Returns count of deleted records

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add GDPR right to erasure endpoint

- DELETE /api/v1/reviews/erasure
- Removes all reviews, photos, email_requests for a given email
- Adds to unsubscribes to prevent future contact
- Token-verified to prevent abuse"
```

---

## Task 18: Final verification and deploy prep

**Files:**
- Modify: `apps/web/package.json` (verify all deps)
- Modify: root `package.json` (update build scripts)
- Create: `apps/web/vercel.json` (already done in Task 7)

**Step 1: Full build test**

```bash
npm run build
```

Fix any TypeScript errors.

**Step 2: Verify all routes work end-to-end**

Manual test:
1. Sign up at `/signup`
2. Log in at `/admin/login`
3. Copy API key from `/admin/settings`
4. Configure Centra webhook secret in settings
5. Simulate a Centra webhook POST
6. Verify email_request is created in `/admin/emails`
7. Manually trigger cron: `curl http://localhost:3000/api/cron/send-emails -H "Authorization: Bearer dev-cron-secret"`
8. Click review link from email
9. Submit review with photos
10. Verify review appears in `/admin/reviews` with photo + verified badge
11. Verify review appears via `GET /api/v1/reviews`
12. Verify JSON-LD via `GET /api/v1/reviews/schema`
13. Test unsubscribe link

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: final verification and build fixes"
```

**Step 4: Deploy to Vercel**

```bash
npx vercel
```

Set environment variables in Vercel dashboard:
- `DATABASE_URL`
- `ADMIN_JWT_SECRET`
- `RESEND_API_KEY`
- `CRON_SECRET`
- `BLOB_READ_WRITE_TOKEN`
- `NEXT_PUBLIC_APP_URL`

---

## Summary

| Task | Description | Depends on |
|---|---|---|
| 1 | Git init + env config | — |
| 2 | SQLite → Postgres migration | 1 |
| 3 | Auth upgrade (accounts) | 2 |
| 4 | Update existing routes for Postgres | 2, 3 |
| 5 | Versioned public API (v1) | 4 |
| 6 | Centra webhook receiver | 2 |
| 7 | Email flow (Resend + cron) | 6 |
| 8 | Review landing page + unsubscribe | 5, 7 |
| 9 | Photo upload | 5 |
| 10 | React SDK redesign | 5 |
| 11 | Vanilla widget redesign | 5 |
| 12 | Admin dashboard updates | 4, 6, 7 |
| 13 | Fumadocs documentation | 5 |
| 14 | Landing page update | — |
| 15 | Anti-spam | 5 |
| 16 | Signup flow | 3 |
| 17 | GDPR erasure endpoint | 5 |
| 18 | Final verification + deploy | all |
