# Frankly — Go-To-Market Strategy

> Internal strategy document. Last updated: 2026-03-09.
> Companion doc: [Execution Playbook](./execution-playbook.md)

---

## 1. Market Opportunity

### The Gap

Centra powers 300+ fashion and lifestyle brands across the Nordics and Europe. These brands run headless storefronts (React/Next.js) and have no purpose-built product review solution. The options today:

- **Lipscore** — Nordic incumbent, strong in Shopify/WooCommerce, but no native Centra integration. Brands must hack together API calls or install manually. Enterprise pricing with annual contracts.
- **Trustpilot** — Store-level reviews (not product-level). Expensive. Not designed for e-commerce product pages.
- **Yotpo** — US-focused, complex, overkill for a Nordic brand doing EUR 1-10M revenue.
- **Nothing** — Many Centra brands simply don't have reviews because nothing fits easily.

### Why Now

Three tailwinds make this the right moment:

1. **EU Omnibus Directive (2022)** — Requires e-commerce sites to label whether reviews are from verified purchasers. Many brands need to upgrade their review setup or face compliance risk.
2. **Centra's growth** — Centra is expanding beyond the Nordics. Their brand count is growing, and each new brand needs review tooling.
3. **Headless commerce trend** — Traditional Shopify review apps (Judge.me, Loox) don't work on headless storefronts. The market needs review tools built for API-first architectures.

### Market Size

Conservative estimate for the Centra wedge:

| Metric | Value |
|--------|-------|
| Centra brands | ~300 |
| Brands without a good review solution | ~60% (~180) |
| Realistic penetration in 2 years | 10-15% (18-45 brands) |
| Average revenue per brand | EUR 99/mo |
| Addressable ARR (Centra only) | EUR 21K - 53K |

This is a small wedge market — intentionally. The goal is not to build a venture-scale business on Centra alone. The goal is to prove the product works, build a reputation, and expand to other headless platforms (Shopify Hydrogen, Commerce Layer, Medusa) once validated.

### The Wedge Strategy

```
Centra (300 brands) → Other headless platforms (10,000+ brands) → Shopify (millions)
        NOW                      AFTER VALIDATION                    LATER
```

Centra is the wedge because:
- Small enough market that incumbents won't fight for it
- Homogeneous tech stack (all headless, similar frontend patterns)
- Informal contacts at Centra for warm intros
- Nordic market = high trust, word-of-mouth referrals travel fast

---

## 2. Competitive Positioning

### Competitor Landscape

| | Frankly | Lipscore | Trustpilot | Yotpo |
|---|---|---|---|---|
| **Focus** | Headless / Centra | Nordic e-commerce | Global trust platform | Enterprise marketing |
| **Review type** | Product-level (SKU) | Product-level | Store-level | Product-level |
| **Centra integration** | Native webhook, 2-min setup | Manual / API | None | None |
| **Pricing** | EUR 49-199/mo flat | Custom (est. EUR 99-500/mo) | EUR 200-1000+/mo | EUR 300+/mo |
| **Contract** | Monthly, cancel anytime | Annual (3-month notice) | Annual | Annual |
| **Widget size** | ~4 KB gzipped | ~50 KB+ | ~100 KB+ | ~80 KB+ |
| **React SDK** | Yes | No | No | Limited |
| **EU Omnibus** | Built-in | Yes | Partial | Yes |
| **Photo reviews** | Yes | Yes | No | Yes |
| **Multi-language** | en, sv, nb, da | Yes (many) | Yes (many) | Yes (many) |
| **Self-hosted option** | Possible (open architecture) | No | No | No |

### Positioning Statement

> **Frankly is the review platform built for Centra.** Connect your store in 2 minutes via webhook. Collect verified, EU Omnibus-compliant reviews automatically. Display them with a lightweight widget or React SDK. Simple pricing, no annual contracts.

### Where Frankly Wins

1. **Zero-friction Centra setup** — Paste one webhook URL. Other tools require custom API integration.
2. **Developer experience** — React SDK with hooks, vanilla JS widget with Shadow DOM, clean REST API. Centra's developer-heavy customers appreciate this.
3. **Lightweight** — 4 KB widget doesn't slow down performance-optimized headless storefronts. Lipscore adds 50 KB+.
4. **Simple pricing** — Flat monthly, cancel anytime. No annual lock-in, no per-order fees, no sales calls.
5. **Nordic-native** — Swedish/Norwegian/Danish out of the box. Built by someone who understands the market.

### Where Frankly Loses (Today)

1. **Brand recognition** — Zero. Lipscore and Trustpilot are known names.
2. **Feature depth** — No Google Shopping feed, no AI responses, no advanced analytics yet.
3. **Scale proof** — No case studies, no logos, no social proof.
4. **Solo founder** — Support bandwidth is limited. Enterprise brands may hesitate.

### How to Win Anyway

The first 5 customers won't choose Frankly because of features. They'll choose it because:
- It's the only thing that integrates with Centra easily
- The founder personally helps them set it up
- It's free for 3 months
- It solves a real pain they have right now

Feature parity with Lipscore is not the goal. Being the obvious choice for Centra brands is.

---

## 3. Pricing Strategy

### Current Pricing

| Tier | Price | Target |
|------|-------|--------|
| **Starter** | EUR 49/mo | Small brands, 1 store, up to 500 orders/mo |
| **Growth** | EUR 99/mo | Mid-size brands, 3 stores, unlimited orders, multi-language |
| **Pro** | EUR 199/mo | Larger brands, unlimited stores, Google Shopping, custom email domain |

### Analysis

The tiers are reasonable relative to Lipscore (EUR 99-500/mo) and Trustpilot (EUR 200+/mo). Frankly is positioned as the affordable, simpler option.

**However, for pre-launch, pricing is not the priority. Validation is.**

### Pre-Launch Pricing Recommendation

**Beta offer:** Free for 3 months, then Starter pricing (EUR 49/mo).

Rationale:
- You need logos and case studies more than EUR 49/mo right now
- Free removes all decision friction — the only cost is the brand's time to set it up
- 3 months gives enough time to collect meaningful reviews and prove ROI
- The conversion conversation at month 3 is valuable data regardless of outcome

### Pricing Questions to Answer During Beta

- Do customers use features that justify 3 tiers, or would 2 suffice?
- Is EUR 49/mo too low? (If everyone converts without hesitation, you're underpriced)
- Do brands want annual pricing? (Some finance teams prefer annual invoicing)
- Is order-based pricing (like Lipscore) more natural for e-commerce brands?

### Future Pricing Considerations

Park these until you have 5+ paying customers:
- Usage-based component (per email sent, per review collected)
- Annual discount (2 months free on annual commitment)
- Custom/enterprise tier for brands with 10+ stores
- Free tier for very small brands (< 50 orders/mo) to drive word-of-mouth

---

## 4. Product Roadmap

### What's Built (Current State)

| Feature | Status |
|---------|--------|
| Core review system (SKU-based, ratings, text, moderation) | Done |
| Centra webhook integration (HMAC-SHA256 signed) | Done |
| Post-purchase email automation (configurable delay) | Done |
| Photo reviews (Vercel Blob storage) | Done |
| Verified purchase badges | Done |
| Multi-language (en, sv, nb, da) | Done |
| EU Omnibus compliance | Done |
| GDPR right-to-erasure endpoint | Done |
| Admin dashboard (moderation, email stats, settings) | Done |
| React SDK (@frankly/react) | Done |
| Vanilla JS widget (@frankly/widget, < 15 KB) | Done |
| Documentation site (Fumadocs) | Done |
| Self-service signup | Done |
| Rate limiting & anti-spam | Done |
| Unsubscribe management | Done |

### P0 — Before First Outreach

Things that must work before anyone sees the product:

- [ ] Production deploy on Vercel with real database
- [ ] End-to-end tested flow (webhook → email → review → widget)
- [ ] Demo store with realistic fashion product data
- [ ] 2-minute Loom walkthrough video
- [ ] Docs site live with Centra setup guide

### P1 — During Beta (Build Based on Customer Feedback)

Likely requests from early customers:

- [ ] Google Rich Snippets / JSON-LD structured data output
- [ ] Merchant reply to reviews (visible on widget)
- [ ] Review import (Lipscore CSV or manual upload)
- [ ] Custom widget styling (CSS variables / theme configuration)
- [ ] Email template customization per store

### P2 — After Validation (3-5 Paying Customers)

- [ ] Analytics dashboard (review trends, email conversion rates, rating trends over time)
- [ ] Google Shopping feed integration
- [ ] Shopify app (only if there's clear demand signal)
- [ ] Additional language support beyond Nordic languages
- [ ] Custom email sending domain per store

### Explicitly Not Building Now

- Mobile app
- AI-generated review responses
- Video reviews
- NPS / satisfaction surveys
- Shopify app (too much effort before Centra is validated)
- Review syndication across stores

### Roadmap Principle

**Build what customers ask for, not what competitors have.** The P1 list is a guess. Real priorities come from beta customer conversations. If nobody asks for JSON-LD but everyone asks for review import, build the import first.

---

## 5. Success Metrics & Milestones

### 6-Month Goal

**3-5 paying customers.** This validates that:
- Centra brands have a review tool problem
- Frankly solves it well enough to pay for
- The GTM motion (founder-led, Centra-first) works

### Leading Indicators

Track these weekly:

| Metric | What It Tells You |
|--------|-------------------|
| Outreach sent | Are you doing the work? |
| Demos booked / outreach sent | Is the message resonating? |
| Beta signups / demos | Is the product compelling in a demo? |
| Active stores (widget live, emails sending) | Are signups actually using it? |
| Reviews collected per store | Is the product working? |
| Email open rate | Are the emails good? |
| Review completion rate (email → submitted review) | Is the review flow good? |

### Milestone Ladder

These milestones are in order. Each one builds confidence for the next.

1. **First demo with a real Centra brand** — Proves you can get in the door
2. **First store connected and collecting reviews** — Proves the product works in production
3. **First testimonial / case study quote** — Proves a customer is willing to vouch for you
4. **First paying customer** — Proves someone values this enough to spend money
5. **First unsolicited inbound** — Proves the market is finding you
6. **First customer referral** — Proves customers like it enough to tell peers

### Kill Criteria

Be honest with yourself. If after 3 months of active, consistent outreach:

- **0 demos booked** → The message isn't resonating. Rewrite outreach, try different contacts, or question whether the problem exists.
- **Demos but 0 beta signups** → The product isn't compelling enough in a demo. What objections are you hearing?
- **Beta signups but 0 active usage** → Onboarding friction is too high. Simplify setup or do more hand-holding.
- **Active usage but 0 conversions to paid** → The product works but isn't worth paying for. Investigate: is it a pricing problem, a value problem, or a timing problem?

Each of these failure modes has a different fix. Don't lump them together.

---

## References

- [Execution Playbook](./execution-playbook.md) — Phase-by-phase actions
- [Centra MVP Design](../plans/2026-03-03-centra-mvp-design.md) — Technical design decisions
- [Centra MVP Implementation](../plans/2026-03-03-centra-mvp-implementation.md) — Implementation spec
