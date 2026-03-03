# Frankly Centra MVP — Design Document

**Date:** 2026-03-03
**Status:** Approved
**Approach:** Wedge Product (B) + Public APIs

## Summary

Transform Frankly from a prototype into a managed SaaS product review platform targeting Scandinavian e-commerce brands on Centra (headless) and eventually Shopify. The MVP ships: Centra webhook integration, post-purchase email review requests, clean embeddable widget, photo reviews, sv/nb/da/en localization, public REST API, and Fumadocs documentation site.

## Decisions

| Decision | Choice | Reasoning |
|---|---|---|
| Business model | Managed SaaS (multi-tenant) | One deployment, brands sign up and get API keys |
| Database | PostgreSQL (Neon) | Multi-tenant SaaS needs a real database. Drizzle supports Postgres with minimal migration. |
| Email provider | Resend | Modern API, React Email templates, generous free tier (3,000/mo), built for Next.js |
| Hosting | Vercel + Neon | Serverless = free at low traffic, Next.js native, EU regions for GDPR |
| Widget design | Clean/minimal (customer-facing), Win95 (admin only) | Fashion brands won't embed Win95 on their storefronts |
| Docs framework | Fumadocs | Next.js-native MDX docs with search, good DX |
| Target market | Centra brands first | Zero competition — no good product review tool exists for Centra's 300+ fashion brands |

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Vercel (Next.js)                │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Public    │  │ Admin    │  │ Centra        │  │
│  │ Review    │  │ Dashboard│  │ Webhook       │  │
│  │ API (v1)  │  │ (Win95)  │  │ Receiver      │  │
│  └────┬─────┘  └────┬─────┘  └───────┬───────┘  │
│       │              │                │          │
│       └──────┬───────┘                │          │
│              │                        │          │
│       ┌──────▼──────┐  ┌─────────────▼────────┐ │
│       │ Neon        │  │ Vercel Cron          │ │
│       │ PostgreSQL  │  │ (hourly email check) │ │
│       └─────────────┘  └──────────┬───────────┘ │
│                                   │              │
│                          ┌────────▼──────────┐   │
│                          │ Resend            │   │
│                          │ (review request   │   │
│                          │  emails)          │   │
│                          └───────────────────┘   │
└──────────────────────────────────────────────────┘

Embeddable on brand storefronts:
  ┌────────────────┐   ┌────────────────┐
  │ @frankly/react │   │ Headless API   │
  │ (React SDK)    │   │ (REST + docs)  │
  └────────────────┘   └────────────────┘
```

**Multi-tenancy:** Each brand (store) gets an API key. All data scoped by `store_id`. One deployment serves all customers.

## Database Schema

### stores

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| name | text | Store/brand name |
| domain | text | Brand's storefront domain |
| api_key | text, unique | `fk_` prefixed |
| moderation_enabled | boolean, default true | Hold reviews for approval |
| email_delay_days | integer, default 14 | Days after shipment to send email |
| email_enabled | boolean, default true | Toggle email flow |
| locale | text, default 'en' | Default store locale |
| centra_webhook_secret | text, nullable | HMAC-SHA256 signing secret |
| created_at | timestamptz | |

### accounts (new — replaces single-password auth)

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| email | text, unique | Login email |
| password_hash | text | bcrypt only |
| store_id | uuid, FK → stores | |
| created_at | timestamptz | |

### reviews

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| store_id | uuid, FK → stores | |
| sku | text | Product SKU |
| rating | integer, CHECK 1-5 | |
| title | text | |
| body | text | |
| reviewer_name | text | |
| reviewer_email | text | |
| status | enum: pending/approved/rejected | |
| verified_purchase | boolean, default false | True when submitted via email token |
| locale | text, nullable | Language the review was written in |
| created_at | timestamptz | |
| INDEX | (store_id, sku, status) | Primary query pattern |

### review_photos (new)

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| review_id | uuid, FK → reviews | |
| url | text | CDN URL |
| sort_order | integer | |
| created_at | timestamptz | |

### email_requests (new)

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| store_id | uuid, FK → stores | |
| order_id | text | Centra order ID |
| customer_email | text | |
| customer_name | text | |
| customer_locale | text, default 'en' | From Centra market/language |
| sku | text | |
| product_name | text | |
| product_image | text, nullable | |
| token | text, unique | Signed review link token |
| status | enum: scheduled/sent/reminded/completed/unsubscribed | |
| send_at | timestamptz | When to send |
| sent_at | timestamptz, nullable | |
| reminded_at | timestamptz, nullable | |
| completed_at | timestamptz, nullable | |
| created_at | timestamptz | |
| INDEX | (status, send_at) | For cron queries |
| UNIQUE | (store_id, order_id, sku) | Prevent duplicates |

### unsubscribes (new)

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| store_id | uuid, FK → stores | |
| email | text | |
| created_at | timestamptz | |
| UNIQUE | (store_id, email) | |

## Centra Integration

### Webhook receiver

`POST /api/webhooks/centra?store={store_id}`

1. Validate `X-Centra-Signature` header using store's `centra_webhook_secret` (HMAC-SHA256)
2. Parse shipment payload: order_id, customer (email, firstName), market/language, line_items (sku, product name, image)
3. Check unsubscribes table — skip if customer opted out
4. For each line item: insert into `email_requests` with `send_at = NOW() + store.email_delay_days`, `status = 'scheduled'`
5. Deduplicate via UNIQUE constraint (ON CONFLICT DO NOTHING)
6. Return 200 immediately — no email sending in the webhook handler

### Brand onboarding

1. Brand signs up at frankly.dev → gets API key + store created
2. In Centra admin, add webhook URL: `https://frankly.dev/api/webhooks/centra?store={store_id}`
3. Paste Centra's webhook signing secret into Frankly settings
4. Shipments start flowing → emails get scheduled automatically

## Email Flow

### Cron job (`GET /api/cron/send-emails`, hourly)

Protected by `CRON_SECRET` header.

**First pass — send initial emails:**
- Query: `email_requests WHERE status = 'scheduled' AND send_at <= NOW() LIMIT 100`
- For each: check unsubscribes, send via Resend (React Email template in customer's locale), update status → 'sent'

**Second pass — send reminders:**
- Query: `email_requests WHERE status = 'sent' AND sent_at < NOW() - 7 days AND reminded_at IS NULL`
- Send reminder email, update status → 'reminded'

One reminder only. No further follow-up.

### Email template

- Brand logo (from store settings, future — plain text for MVP)
- Greeting in customer's locale
- Product name + image
- 5 clickable star links → `https://frankly.dev/review?token={token}&rating={n}`
- Unsubscribe link → `GET /api/unsubscribe?token={token}`

### Review landing page (`/review?token={token}&rating=4`)

- Validates JWT token (store_id, order_id, sku, email, 90-day expiry)
- Pre-fills: rating from URL param, name + email from token
- Shows product name + image
- Fields: adjustable star rating, title, body, photo upload (up to 3 images)
- Clean/minimal design
- On submit: creates review with `verified_purchase = true`, marks email_request as 'completed'

## Public API (v1)

All endpoints require `X-API-Key` header. CORS enabled.

### GET /api/v1/reviews

Query params: `sku` (required), `page`, `limit` (max 50), `locale` (optional filter)

Returns: `{ reviews: [...], total, averageRating, distribution: { 1: n, 2: n, ... } }`

Reviews include `photos: [{ url, sortOrder }]`, `verifiedPurchase`, `locale`.

### GET /api/v1/reviews/stats

Query params: `sku` (required)

Returns: `{ averageRating, total, distribution }` — lightweight endpoint for PLP star badges.

### POST /api/v1/reviews

Body: `{ sku, rating, title, body, reviewerName, reviewerEmail, token?, photos? }`

If `token` provided and valid → `verified_purchase = true`. Photos via multipart form data, stored on Vercel Blob / Cloudflare R2.

### GET /api/v1/reviews/schema

Query params: `sku` (required)

Returns: ready-to-inject JSON-LD structured data (Product + AggregateRating + Review array) for Google rich snippets.

## React SDK (`@frankly/react`)

Clean/minimal design. No Win95 styling.

### Components

- `FranklyProvider` — context provider (apiUrl, apiKey, locale)
- `StarBadge` — compact inline star display for PLPs: `★★★★☆ (47)`
- `ReviewList` — full review list with stats header, distribution chart, photo gallery, pagination, locale indicator per review
- `ReviewForm` — submission form with photo upload (drag-and-drop), pre-fill via URL params
- `StarRating` — interactive star rating input

All components accept a `locale` prop (sv/nb/da/en). All components accept a `renderless` prop for headless mode (data via render props).

### Build

tsup → CJS + ESM + TypeScript definitions. React as peer dependency.

## Vanilla JS Widget

Same clean redesign. Shadow DOM for style isolation.

```html
<script
  src="https://frankly.dev/widget.js"
  data-frankly-api-key="fk_xxx"
  data-frankly-sku="JACKET-001"
  data-frankly-locale="sv"
></script>
```

## Admin Dashboard

Win95 aesthetic preserved for admin pages.

### Pages

- `/admin/login` — email + password (replaces single-password)
- `/admin` — dashboard: total reviews, pending count, avg rating, emails sent/opened/clicked
- `/admin/reviews` — moderation queue: approve/reject, filter by status/sku, view photos
- `/admin/settings` — store name, domain, email delay, moderation toggle, locale, Centra webhook secret, API key
- `/admin/emails` — email request log with status counts

### Auth

Email + password per account. bcrypt only (no plain-text). JWT with 24h expiry. Middleware guards `/admin/*` except `/admin/login`.

## Documentation Site (Fumadocs)

Fumadocs integrated into the Next.js app (or separate app in the monorepo). MDX content.

### Pages

- `/docs` — overview
- `/docs/getting-started` — 5-minute quickstart with Centra
- `/docs/centra-integration` — webhook setup, signing secret, payload reference
- `/docs/api-reference` — full REST API docs (v1 endpoints, auth, pagination, errors)
- `/docs/react-sdk` — installation, FranklyProvider, components, headless mode
- `/docs/widget` — script tag embed, configuration attributes
- `/docs/email-flow` — how review requests work, timing, localization
- `/docs/structured-data` — JSON-LD endpoint, Google rich snippets guide
- `/docs/photo-reviews` — upload limits, CDN, moderation
- `/docs/localization` — supported locales, how language detection works
- `/docs/gdpr` — data handling, right to erasure, DPA, Omnibus compliance
- `/docs/migrating` — importing reviews from CSV / other platforms

## Localization

Supported locales at MVP: `en`, `sv`, `nb`, `da`

Applied to:
- Email templates (greeting, CTA, unsubscribe text)
- Widget UI strings (button labels, date formats, "X out of 5")
- Review landing page
- Number formatting (comma vs period decimal separator)

Locale is determined by: `customer_locale` from Centra order data for emails, `locale` prop/attribute for widgets, `Accept-Language` header as fallback.

## GDPR Compliance

- **Right to erasure:** `DELETE /api/v1/reviews/me?email={email}&token={token}` — deletes all reviews + photos + email_requests for that email in the store. Anonymous aggregate rating retained.
- **Unsubscribe:** one-click link in every email, adds to unsubscribes table, respected before scheduling any future emails.
- **Data hosting:** Neon EU region (Frankfurt). Vercel EU region.
- **DPA:** template available at `/legal/dpa` for merchants.
- **Omnibus compliance:** `verified_purchase` badge on reviews collected via email token. Future: incentivized review badge.

## Anti-Spam (MVP)

- Signed JWT tokens for email-triggered reviews (verified purchase flow)
- Rate limiting: 5 submissions per IP per hour on the public POST endpoint
- Honeypot hidden field on review forms
- Manual moderation queue (configurable: all reviews or low-star only)
- UNIQUE constraint prevents duplicate email requests per order/SKU

## Out of Scope (Phase 2+)

- Google Seller Ratings partner certification
- Video reviews
- AI review summaries
- Machine translation of review text
- SMS review requests
- Sentiment tagging / analytics
- Shopify App Store integration
- Multi-store per account
- Custom email templates (branding/colors)
- Coupon rewards for reviews
- A/B testing email subject lines
- CSV bulk import
