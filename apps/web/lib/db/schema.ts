import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";

/* ───────── enums ───────── */

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

/* ───────── stores ───────── */

export const stores = pgTable("stores", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  domain: text("domain"),
  apiKey: text("api_key").notNull().unique(),
  moderationEnabled: boolean("moderation_enabled").notNull().default(true),
  emailDelayDays: integer("email_delay_days").notNull().default(14),
  emailEnabled: boolean("email_enabled").notNull().default(true),
  locale: text("locale").notNull().default("en"),
  centraWebhookSecret: text("centra_webhook_secret"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ───────── accounts ───────── */

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ───────── reviews ───────── */

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
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
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_reviews_store_sku_status").on(
      table.storeId,
      table.sku,
      table.status,
    ),
  ],
);

/* ───────── review photos ───────── */

export const reviewPhotos = pgTable("review_photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  reviewId: uuid("review_id")
    .notNull()
    .references(() => reviews.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ───────── email requests ───────── */

export const emailRequests = pgTable(
  "email_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
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
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_email_requests_status_send_at").on(table.status, table.sendAt),
    unique("uq_email_requests_store_order_sku").on(
      table.storeId,
      table.orderId,
      table.sku,
    ),
  ],
);

/* ───────── unsubscribes ───────── */

export const unsubscribes = pgTable(
  "unsubscribes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("uq_unsubscribes_store_email").on(table.storeId, table.email),
  ],
);
