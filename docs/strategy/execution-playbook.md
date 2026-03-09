# Frankly — Execution Playbook

> Internal execution plan. Structured for AI-assisted working sessions.
> Companion doc: [GTM Strategy](./gtm-strategy.md)

---

## How to Use This Document

This playbook is organized into phases. Each phase has:
- **Goal** — What success looks like
- **Duration** — Expected timeline
- **Prerequisites** — What must be true before starting
- **Actions** — Concrete tasks with clear deliverables
- **Success criteria** — How you know the phase is complete
- **Templates** — Ready-to-use scripts, messages, checklists

When starting a working session, identify which phase you're in and pick the next uncompleted action.

---

## Phase 0: Make It Real

**Goal:** A working production deployment with a demo that sells itself.
**Duration:** Week 1-2
**Prerequisites:** Codebase in current state (MVP features complete)

### Actions

#### 0.1 Production Deploy

- [ ] Deploy `apps/web` to Vercel
- [ ] Set up production SQLite database (Turso or Vercel-hosted)
- [ ] Configure environment variables:
  - `DATABASE_URL` — production database
  - `ADMIN_JWT_SECRET` — strong random secret (32+ chars)
  - `RESEND_API_KEY` — production Resend key
  - `CRON_SECRET` — secret for Vercel Cron endpoint
  - `BLOB_READ_WRITE_TOKEN` — Vercel Blob for photo uploads
  - `NEXT_PUBLIC_APP_URL` — production URL
- [ ] Set up Vercel Cron for `/api/cron/send-emails` (run every 15 minutes)
- [ ] Deploy `apps/docs` to Vercel (separate project or subdomain)
- [ ] Verify SSL, custom domain (frankly.reviews or similar)

**Deliverable:** Production URLs for app and docs, both loading correctly.

#### 0.2 Demo Store Setup

- [ ] Seed a demo store with realistic fashion brand data:
  - Store name: "Nordic Basics" (fictional brand)
  - 3-4 products with real-sounding fashion SKUs (e.g., `NB-HOODIE-BLK-M`, `NB-TEE-WHT-L`)
  - 10-15 sample reviews across products, mix of 3-5 star ratings
  - 3-4 reviews with photos (use stock fashion photos)
  - Verified purchase badges on most reviews
  - Mix of Swedish and English reviews to showcase multi-language
- [ ] Embed the widget on a simple demo page (can be a route in the app like `/demo`)
- [ ] Ensure the admin dashboard shows meaningful data (reviews to moderate, email stats)

**Deliverable:** A demo URL you can share that looks like a real store using Frankly.

#### 0.3 End-to-End Test

Test the complete flow manually:

- [ ] Trigger a Centra webhook (simulate an order fulfillment event)
- [ ] Verify email request is created with correct delay
- [ ] Fast-forward the delay (or set to 0 for testing) and trigger the cron job
- [ ] Verify the review request email arrives (check formatting, links, unsubscribe)
- [ ] Click the review link, submit a review with a photo
- [ ] Verify the review appears in admin dashboard as "pending"
- [ ] Approve the review in admin
- [ ] Verify the review appears in the widget on the demo page
- [ ] Test the unsubscribe flow
- [ ] Test GDPR erasure endpoint

**Deliverable:** Confidence that the full loop works. A checklist you can show customers during onboarding.

#### 0.4 Sales Materials

- [ ] Record a 2-minute Loom video walking through the full flow:
  - 0:00-0:20 — "This is Frankly, product reviews built for Centra"
  - 0:20-0:50 — Show the Centra webhook setup (paste URL, done)
  - 0:50-1:20 — Show the email arriving, clicking through, submitting a review
  - 1:20-1:40 — Show the review on the storefront widget
  - 1:40-2:00 — Show the admin dashboard
- [ ] Write a one-paragraph pitch (for DMs and emails):

> We built Frankly specifically for Centra stores. You paste one webhook URL into Centra, and Frankly automatically emails your customers after delivery asking for a review. Reviews show up on your storefront via a lightweight widget or React component. Verified purchases, photo reviews, multi-language (en/sv/nb/da), EU Omnibus compliant. Currently offering 3 months free for early stores. Want to try it?

- [ ] Prepare a simple one-page PDF/notion doc with:
  - What Frankly does (3 bullet points)
  - How it works (3-step diagram)
  - Screenshot of the widget on a storefront
  - Screenshot of the admin dashboard
  - "Free for 3 months" offer

**Deliverable:** Loom link, pitch paragraph, one-pager — ready to send.

#### 0.5 Documentation Check

- [ ] Centra setup guide is complete and accurate (step-by-step with screenshots)
- [ ] API reference covers all public endpoints
- [ ] Widget embed guide covers both script tag and React SDK
- [ ] Quick start guide exists (< 5 minute read)

**Deliverable:** A developer at a Centra brand can self-serve the setup by reading the docs.

### Success Criteria (Phase 0)

- [ ] Production app and docs are live on real domains
- [ ] Demo store looks convincing and realistic
- [ ] Full Centra → email → review → widget flow works end-to-end
- [ ] Loom video, pitch paragraph, and one-pager are ready
- [ ] You would feel confident sending this to a real brand

---

## Phase 1: First Conversations

**Goal:** 5 demos booked, 2-3 beta signups.
**Duration:** Week 3-6
**Prerequisites:** Phase 0 complete. Production is live. Sales materials ready.

### Actions

#### 1.1 Build Prospect List

Create a spreadsheet with 20-30 Centra brands. For each brand:

| Column | Description |
|--------|-------------|
| Brand name | |
| Website | |
| Current review solution | None / Lipscore / Trustpilot / Other |
| Contact name | Head of E-commerce, CTO, Digital Manager |
| Contact LinkedIn | |
| Contact email (if findable) | |
| How to reach | LinkedIn DM / Email / Intro from Centra contact |
| Status | Not contacted / Contacted / Demo booked / Beta / Declined |
| Notes | |

**Where to find brands:**
- Centra's website (customer showcase, case studies)
- LinkedIn search: "Head of E-commerce" + "Centra" in experience
- Browse Nordic fashion brand websites, check if they use Centra (look for `centra` in network requests or page source)
- Ask your Centra contacts: "Which brands are actively looking at review solutions?"

**Prioritize brands that:**
- Have no reviews on their product pages currently
- Are mid-size (not the 5 biggest Centra brands — those will want enterprise solutions)
- Have a tech-savvy team (headless storefront = they have developers)
- Are Nordic (your multi-language support is immediately relevant)

**Deliverable:** Spreadsheet with 20-30 rows populated.

#### 1.2 Warm Introductions via Centra Contacts

Before any cold outreach, tap your informal Centra contacts:

- [ ] Reach out to your Centra contacts with a specific ask:

> Hey [name], I've been building a product review tool specifically for Centra stores — native webhook integration, automated emails, the whole flow. I'm looking for 2-3 brands to try it for free and give feedback. Do you know anyone who's been looking for a review solution or complained about their current one? Happy to share a quick demo video if useful.

- [ ] Ask for at most 2-3 intro. Don't ask for a "partnership" — just warm intros.
- [ ] If they offer to share it internally at Centra, accept but don't push for it.

**Deliverable:** 2-3 warm intros to real Centra brands.

#### 1.3 Direct Outreach

For brands without a warm intro, use LinkedIn DM or email. Send in small batches (5 at a time), not blasts.

**LinkedIn DM template (first contact):**

> Hi [name] — I noticed [brand] runs on Centra. I built a product review tool specifically for Centra stores. You connect via a webhook (2-min setup), and it automatically emails customers after delivery asking for a review. Verified purchases, photo reviews, multi-language.
>
> Currently offering 3 months free for early stores. Would you be open to a quick 15-min demo?
>
> Here's a 2-min video showing how it works: [Loom link]

**Email template (if you have their email):**

> Subject: Product reviews for [brand name]'s Centra store
>
> Hi [name],
>
> I built Frankly — a product review tool designed specifically for Centra. Setup is a single webhook URL pasted into Centra. From there, it automatically sends review request emails after delivery, collects verified reviews with photos, and displays them on your storefront via a lightweight widget.
>
> Multi-language (en/sv/nb/da), EU Omnibus compliant, and currently free for 3 months for early stores.
>
> Would a 15-minute demo be worth your time? Here's a quick video: [Loom link]
>
> Best,
> [Your name]

**Follow-up template (5 days later, only once):**

> Hi [name] — just bumping this in case it got buried. Happy to share the 2-min video if a call isn't practical right now: [Loom link]. No worries either way!

**Rules:**
- Maximum 5 new outreach messages per week (you're a side project, be realistic)
- One follow-up per person, then move on
- Track everything in the spreadsheet
- If someone declines, ask: "No problem — out of curiosity, how do you handle reviews today?" (the answer is market research)

**Deliverable:** 10-15 outreach messages sent over 3-4 weeks.

#### 1.4 Run Demos

When someone says yes to a demo:

**Demo structure (15 minutes max):**

1. **(2 min) Context:** "What do you use for reviews today? What's working, what's not?"
2. **(3 min) Centra setup:** Show pasting the webhook URL into Centra. Emphasize how fast it is.
3. **(4 min) The flow:** Show email arriving → customer clicks → submits review with photo → review appears in admin.
4. **(3 min) The widget:** Show reviews displayed on a storefront. Show the React SDK option for their developers.
5. **(2 min) The offer:** "We're offering 3 months free for early stores. I'll personally help you set it up. Interested?"
6. **(1 min) Next step:** If yes → schedule a 30-min setup call. If maybe → "Can I send you the docs and check back in a week?"

**After each demo, log:**
- What resonated most?
- What objections came up?
- What features did they ask about?
- Would they try it? Why or why not?

**Deliverable:** 5 demos completed with notes logged.

### Success Criteria (Phase 1)

- [ ] 20+ brands identified and researched
- [ ] 10+ outreach messages sent
- [ ] 5+ demos completed
- [ ] 2-3 beta signups (agreed to try Frankly for free)
- [ ] Demo feedback logged (what resonates, what doesn't)

---

## Phase 2: Prove It Works

**Goal:** 2+ stores actively collecting reviews. At least one testimonial.
**Duration:** Week 7-14
**Prerequisites:** 2-3 beta signups from Phase 1.

### Actions

#### 2.1 White-Glove Onboarding

For each beta customer, you are their implementation partner:

- [ ] Schedule a 30-min setup call
- [ ] Before the call: create their store in Frankly, generate their API key
- [ ] On the call:
  - Walk them through pasting the webhook URL into Centra
  - Help them embed the widget (pair on a screen share if needed)
  - Configure their settings (locale, email delay, moderation preference)
  - Test with a simulated order if possible
- [ ] After the call: send a summary email with their API key, docs links, and your direct contact for support
- [ ] Monitor their first 48 hours — are emails being created? Are any errors occurring?

**Deliverable:** Each beta store connected, widget live, emails flowing.

#### 2.2 Weekly Check-Ins

For the first 4 weeks of each beta:

- [ ] 15-minute call or async check-in (Slack/email — whatever they prefer)
- [ ] Questions to ask:
  - "How's it going? Any issues?"
  - "Have your customers submitted reviews? What's the feedback like?"
  - "Anything you wish the product did that it doesn't?"
  - "Would you recommend this to another brand?"
- [ ] Log every feature request, bug report, and piece of feedback
- [ ] Fix bugs within 24-48 hours if possible (this is your competitive advantage as a solo founder)

**Deliverable:** Weekly feedback log per customer.

#### 2.3 Track Beta Metrics

For each beta store, track:

| Metric | How to Measure |
|--------|---------------|
| Emails sent | Admin dashboard / email stats endpoint |
| Email open rate | Resend dashboard |
| Reviews submitted | Admin dashboard |
| Review completion rate | Reviews submitted / emails sent |
| Average rating | Stats endpoint |
| Photos uploaded | Count of review photos |
| Widget page views | Vercel Analytics on demo/store page |

Share these numbers with the customer at week 4. "Here's what Frankly has done for your store so far."

**Deliverable:** Metrics spreadsheet per customer.

#### 2.4 Build P1 Features Based on Feedback

**Only build what customers actually ask for.** Likely candidates:

- [ ] JSON-LD structured data (if customers ask about SEO)
- [ ] Merchant reply to reviews (if customers want to respond publicly)
- [ ] Review import tool (if customers are migrating from another tool)
- [ ] Widget customization (if the default styling clashes with their brand)

**Rules:**
- If 2+ customers ask for the same thing, build it next
- If only 1 customer asks for something, note it but wait
- Don't build features nobody asked for, no matter how cool they seem

**Deliverable:** 1-2 P1 features shipped based on real customer feedback.

#### 2.5 Collect Case Study Material

At week 4+ of each beta:

- [ ] Ask: "Would you be open to me sharing that [brand] uses Frankly? Even just a logo on our site?"
- [ ] If yes, ask for a one-line quote: "What would you tell another Centra brand about Frankly?"
- [ ] Take a screenshot of their widget live on their storefront (with permission)
- [ ] Compile metrics: "X reviews collected in Y weeks, Z% email conversion rate"
- [ ] Draft a mini case study (3-4 paragraphs):
  - The brand and their challenge
  - How they set up Frankly
  - Results (metrics)
  - Quote from the customer

**Deliverable:** 1+ case study draft with real metrics and a customer quote.

### Success Criteria (Phase 2)

- [ ] 2+ stores actively collecting reviews (widget live, emails sending)
- [ ] 50+ total reviews collected across beta stores
- [ ] Email conversion rate tracked and reasonable (> 3% is good)
- [ ] At least 1 customer willing to give a testimonial
- [ ] Feature feedback logged with clear priority
- [ ] 1-2 P1 features shipped

---

## Phase 3: Start Charging

**Goal:** 2+ paying customers. First inbound lead. Centra partnership conversation started.
**Duration:** Week 15-20
**Prerequisites:** Phase 2 complete. Beta customers are active and happy.

### Actions

#### 3.1 Beta-to-Paid Conversion

Two weeks before each beta's 3-month free period expires:

- [ ] Send a conversion email:

> Subject: Your Frankly beta period ends [date]
>
> Hi [name],
>
> Your 3-month free period on Frankly ends on [date]. Here's what Frankly has done for [brand] so far:
>
> - [X] reviews collected
> - [X]% email conversion rate
> - [X] verified reviews with photos
> - Reviews live on your storefront at [URL]
>
> To continue, Frankly is EUR 49/mo (Starter) or EUR 99/mo (Growth — includes multi-language and unlimited orders). No annual contract, cancel anytime.
>
> I'd also like to offer 2 months free if you commit to an annual plan.
>
> Want to continue? I can set it up in 5 minutes. And if anything isn't working for you, I'd love to hear what would need to change.
>
> Best,
> [Your name]

- [ ] If they convert → set up billing (Stripe)
- [ ] If they hesitate → schedule a call. Ask: "What would need to be true for you to pay for this?" (the answer is pure gold)
- [ ] If they decline → ask: "What didn't work? What would you use instead?" Log the answer.

**Deliverable:** Conversion outcome for each beta customer logged with reasons.

#### 3.2 Set Up Billing

- [ ] Create a Stripe account (if not already)
- [ ] Set up the 3 pricing tiers as Stripe products
- [ ] Build a simple billing page in the admin dashboard or use Stripe's hosted checkout
- [ ] Enable Stripe Customer Portal for self-service cancellation/plan changes

**Deliverable:** Working payment flow.

#### 3.3 Inbound Content

Write 2-3 articles on the docs site blog. Optimized for SEO — these are the searches your potential customers make:

**Article ideas:**

1. **"How to add product reviews to your Centra store"**
   - Target keyword: "centra product reviews"
   - Content: Step-by-step guide using Frankly, with screenshots
   - CTA: "Try Frankly free for 14 days"

2. **"EU Omnibus Directive: What Nordic e-commerce brands need to know about reviews"**
   - Target keyword: "EU omnibus reviews e-commerce"
   - Content: Explain the regulation, what it means for review display, how Frankly handles it
   - CTA: "Frankly is EU Omnibus compliant out of the box"

3. **"Lipscore alternatives for headless e-commerce"**
   - Target keyword: "lipscore alternative"
   - Content: Honest comparison. Where Lipscore is better (more features, bigger company), where Frankly is better (Centra integration, simpler, cheaper)
   - CTA: "Try Frankly if you're on Centra"

**Rules:**
- Write for humans, not for Google. Genuinely helpful content.
- Each article should be publishable in one working session (< 3 hours)
- Include real screenshots from your product
- Link to docs for technical details

**Deliverable:** 2-3 published articles on the docs site.

#### 3.4 LinkedIn Presence

You don't need a brand account. Post from your personal LinkedIn.

- [ ] Post 1x per week about building Frankly:
  - Share a customer win (with permission): "[Brand] collected 50 reviews in their first month with Frankly"
  - Share a product update: "Just shipped merchant replies — store owners can now respond to reviews publicly"
  - Share an insight: "We're seeing 8% email-to-review conversion rates for fashion brands. Here's what the emails look like."
  - Share a behind-the-scenes: "Building a review tool as a side project. Here's what I learned this week."
- [ ] Engage with Centra-related posts (comment, share)
- [ ] Connect with people at Centra brands (don't pitch immediately — just connect)

**Rules:**
- Be genuine. Don't be salesy.
- Personal stories outperform product announcements
- 1 post per week is enough. Consistency > volume.

**Deliverable:** 4-6 LinkedIn posts published.

#### 3.5 Centra Ecosystem Play

With 2-3 live customers, you have leverage to approach Centra:

- [ ] Reach out to your Centra contacts:

> Hey [name] — quick update on the review tool I mentioned. [Brand A] and [Brand B] are now live with it, collecting verified reviews via the Centra webhook integration. Would Centra be open to listing Frankly as an integration partner? Happy to provide whatever you need — logos, descriptions, a joint blog post, anything.

- [ ] Offer to:
  - Write a guest blog post for Centra's blog about reviews in headless commerce
  - Appear in Centra's integration directory
  - Present at a Centra community event or webinar
- [ ] Don't push if they're not ready. Having real customers using the integration speaks louder than any pitch.

**Deliverable:** Centra partnership conversation initiated with specific ask.

#### 3.6 Referral Asks

- [ ] For each happy customer, ask directly:

> You've been using Frankly for a few months now. Do you know any other Centra brands who'd benefit from this? I'd love an intro if so — happy to offer them the same free trial you got.

- [ ] No formal referral program. Just personal asks.
- [ ] Nordic e-commerce is a small world. One intro can cascade.

**Deliverable:** 1-2 warm referrals from existing customers.

### Success Criteria (Phase 3)

- [ ] 2+ paying customers (beta converted)
- [ ] Stripe billing operational
- [ ] 2-3 blog posts published
- [ ] LinkedIn posting started (1x/week)
- [ ] Centra partnership conversation initiated
- [ ] 1+ inbound inquiry (someone finds Frankly without direct outreach)

---

## Phase 4: Decide What's Next

**Goal:** Clear decision on direction backed by real data.
**Duration:** Week 21-26
**Prerequisites:** Phases 1-3 executed.

### Actions

#### 4.1 Evaluate Results

Fill in this scorecard:

| Question | Answer |
|----------|--------|
| How many demos booked? | |
| How many beta signups? | |
| How many active beta stores (reviews flowing)? | |
| How many converted to paid? | |
| Current MRR? | |
| Inbound inquiries received? | |
| Top 3 feature requests from customers? | |
| Top 3 objections from people who declined? | |
| Centra partnership status? | |
| Would you describe this as "pulling" or "pushing"? | |

#### 4.2 Decision Framework

**Scenario A: 3-5 paying customers, pulling (they ask to continue, refer friends)**
→ Double down. This is working.
- Invest more time in content/SEO
- Build remaining P1 features
- Push for Centra integration listing
- Consider: is it time to go full-time?

**Scenario B: 1-2 paying customers, slow but positive feedback**
→ Promising but not proven. Investigate the bottleneck:
- Is the market too small? (Are there really only 10 brands who care?)
- Is the product missing something critical? (What did non-converters say?)
- Is the GTM motion wrong? (Should you try a different channel?)
- Give it 2 more months with adjusted approach.

**Scenario C: 0 paying customers despite active outreach**
→ Something fundamental isn't working. Before building more:
- Review all demo feedback and objections
- Talk to 5 brands who declined and ask why (genuinely listen)
- Consider: Is this the wrong market? Wrong product? Wrong timing?
- Options: Pivot positioning (e.g., target Shopify headless instead), pivot product (e.g., focus only on the email automation), or park the project

#### 4.3 Scale Decisions

If Scenario A, answer these:

| Question | Your Answer |
|----------|-------------|
| At what MRR would you go full-time? | EUR ___/mo |
| What would you need to see to build a Shopify app? | |
| Should you hire help? (Support? Marketing? Dev?) | |
| Should you raise money, or bootstrap? | |
| What's the 12-month revenue target? | |

These are personal decisions. Write down the numbers now so you're not rationalizing later.

### Success Criteria (Phase 4)

- [ ] Scorecard filled in with real data
- [ ] Clear "continue / adjust / stop" decision made
- [ ] If continuing: next 6-month plan drafted
- [ ] If stopping: project parked cleanly (keep it live for existing customers, stop outreach)

---

## Appendix: Key Numbers

| Metric | Target | Source |
|--------|--------|--------|
| Email-to-review conversion rate | > 3% (good), > 8% (excellent) | Lipscore reports 5.5% average |
| Review request email open rate | > 40% | Industry average for transactional emails |
| Demo-to-beta conversion | > 40% | Reasonable for free trial with warm leads |
| Beta-to-paid conversion | > 50% | If product delivers value, should be high |
| Widget load time impact | < 50ms | 4 KB widget should be negligible |
| Time to first review (after going live) | < 14 days | Depends on order volume and email delay setting |

---

## Appendix: Competitive Quick Reference

Use these when positioning against competitors in conversations:

**"We're already using Lipscore"**
→ "Totally fair — Lipscore is solid. How's the Centra integration working for you? We built Frankly specifically for Centra with a native webhook, so setup is literally 2 minutes. Happy to show you the difference if you're ever evaluating."

**"We use Trustpilot"**
→ "Trustpilot is great for store-level trust. Frankly does product-level reviews — ratings on each SKU on your product pages. They actually work well together. Want to see how?"

**"We don't think reviews are a priority"**
→ "Makes sense — not every brand needs them. Out of curiosity, are your customers asking for them? And are you seeing competitors with reviews ranking higher in Google? (If yes, that's the SEO angle.)"

**"We're too small for a review tool"**
→ "You might be surprised — even 10-20 reviews on your top products can measurably increase conversion. And with automated emails, you don't have to do anything after setup. Want to try it free for 3 months?"

**"Can we just build it ourselves?"**
→ "Absolutely, it's your call. For reference, we've spent 6+ months building verified purchases, email automation, EU Omnibus compliance, photo uploads, multi-language, and the widget. Frankly starts at EUR 49/mo. Probably cheaper than a developer's time for a day."
