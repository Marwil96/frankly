# Frankly — Design Decisions

> Living document tracking design direction and rationale.

---

## Two Design Systems, One Product

Frankly uses two distinct visual identities for different audiences:

| Surface | Style | Audience | Rationale |
|---------|-------|----------|-----------|
| Marketing pages (landing, signup, docs) | Warm Bauhaus | Prospective customers (Nordic fashion brands) | Needs to feel credible, professional, and aligned with Scandinavian design sensibility |
| Admin dashboard | Windows 95 / brutalist | Store owners managing reviews | Distinctive internal brand identity. Memorable, functional, fun for a tool you use daily |
| Embeddable widget | Clean minimal | End consumers on storefronts | Must not clash with any store's design. Invisible until useful |

### Why Not Win95 Everywhere?

The Win95 aesthetic was the original creative direction for the entire product. It's distinctive and memorable. But as Frankly's target market crystallized — Nordic fashion brands on Centra — a tension emerged:

- Fashion brands care deeply about design. A retro aesthetic reads as "hobby project" to someone evaluating business tooling.
- The landing page is a sales page with pricing tiers and CTAs. Win95 chrome adds friction to taking it seriously.
- The widget lives on *their* storefront, next to EUR 200 sweaters. It must feel invisible.

**Decision:** Keep Win95 for the admin dashboard (it's distinctive, internal-only, and charming). Marketing pages and widget use professional, clean styling.

---

## Marketing Design Direction: Warm Bauhaus

### The Choice

Three directions were considered:

| Direction | Feel | Decision |
|-----------|------|----------|
| Clean SaaS (Linear, Vercel) | Serious, developer-focused, cold | Too cold for a product about human reviews |
| Warm & approachable (Notion, Cal.com) | Friendly, rounded, illustrated | Right warmth, but too generic on its own |
| Premium editorial (Stripe) | Elegant, polished | Over-designed for a bootstrapped side project |

**Final direction:** Warm Bauhaus with Basecamp tone. A blend of approachable warmth and geometric discipline.

### What "Warm Bauhaus" Means

**Bauhaus principles applied:**
- **Grid discipline** — Strict alignment, consistent spacing rhythm (64px sections, 24px padding). No arbitrary gaps.
- **Typography as structure** — Large bold headings are visual anchors. Space Grotesk (a geometric grotesk) carries the Bauhaus DNA.
- **Form follows function** — Every element earns its place. No decorative flourishes.
- **Geometric accents** — Feature icons use simple shapes (circles, triangles, squares) in brand colors instead of emoji or illustrations.
- **Restrained color** — Most of the page is cream/white/dark text. Accent colors (terracotta, ochre, deep blue) appear in small, deliberate moments.

**Warm Scandinavian palette:**
- Off-white cream base (#F5F0EB) instead of pure white
- Terracotta (#C45D3E) as primary accent — warm, earthy, not aggressive
- Ochre (#D4A843) as secondary — golden, complementary
- Deep blue (#2B4C7E) as tertiary — calm, trustworthy
- Warm grays for text (#1A1A1A primary, #6B6560 secondary)

**Basecamp tone of voice:**
- Short, declarative sentences
- No buzzwords. "Collect reviews" not "Unlock the power of social proof"
- Opinionated. "Built for Centra" not "Works with many platforms"
- Prices visible, no "contact sales"
- Confident but not arrogant

### Why Space Grotesk

Requirements: geometric (Bauhaus-native), warm (not cold like Inter), good at both headings and body, freely available.

Space Grotesk fits all criteria. It has the geometric construction of Futura but with more warmth and slightly quirky character. Popular in Scandinavian design. Available on Google Fonts (zero licensing friction).

### References & Inspirations

- **Bauhaus aesthetic** — Bold geometric shapes, primary color accents, grid discipline, form follows function
- **Basecamp** — Tone of voice. "It's just great software, easy to pay, easy to use."
- **Cal.com** — Clean structure with warm accents
- **Lemon Squeezy** — Professional layout, approachable feel

---

## Color Token Reference

```
--color-cream: #F5F0EB        Page background
--color-card: #FAFAF8          Card backgrounds
--color-text: #1A1A1A          Primary text
--color-text-secondary: #6B6560  Secondary text, descriptions
--color-border: #E5DDD5        Borders, dividers
--color-terracotta: #C45D3E    Primary accent (CTAs, highlights)
--color-ochre: #D4A843         Secondary accent (badges, backgrounds)
--color-deep-blue: #2B4C7E     Tertiary accent (trust, links)
--color-code-bg: #2A2520       Code block background
```

### Win95 Tokens (admin only)

```
--color-win95-bg: #c0c0c0      Silver background
--color-win95-blue: #000080     Navy titlebar
--color-win95-teal: #008080     Desktop background
--color-win95-dark: #808080     Border dark
--color-win95-darker: #404040   Border darker
--font-win95: "MS Sans Serif", Tahoma, Geneva, sans-serif
```

---

## Component Architecture

### Marketing Components (`components/marketing/`)

| Component | Purpose | Props |
|-----------|---------|-------|
| `Nav` | Top navigation bar | None |
| `Footer` | Page footer | None |
| `FeatureCard` | Feature grid cards | `shape`, `color`, `title`, `description` |
| `PricingCard` | Pricing tier cards | `name`, `price`, `period`, `features`, `cta`, `highlight?` |
| `CodeBlock` | Tabbed code examples | `tabs: { id, label, code }[]` |

### Win95 Components (`components/win95/`)

| Component | Purpose | Used in |
|-----------|---------|---------|
| `Window` | Window with titlebar | Admin pages |
| `Panel` | Raised/sunken container | Admin pages |
| `Button` | Win95-style button | Admin pages |
| `Input` / `Textarea` | Form inputs | Admin pages |
| `Select` | Dropdown | Admin pages |
| `Table` | Data table | Admin reviews |
| `Tabs` | Tab switcher | Admin pages |
| `StarRating` | Star display/input | Admin pages |
| `StatusBar` | Bottom status bar | Admin pages |

### Style Isolation Strategy

The two design systems coexist via scoping:

- `globals.css` has both token sets but **no global font or background** — body is neutral
- Marketing pages apply `bg-cream text-text font-[family-name:var(--font-marketing)]` on their root div
- Admin layout applies `bg-win95-teal text-win95-black font-[family-name:var(--font-win95)] text-[11px]` on its root div
- Admin login page (bypasses admin layout) applies Win95 styles on its own root div
- No CSS conflicts because each route tree controls its own styling

---

## Future Design Considerations

**Illustrations:** Discussed adding geometric Bauhaus-style illustrations (abstract compositions with overlapping shapes). Decided to keep it simple for now — just geometric shape icons on feature cards. Easy to add illustrations later without changing the system.

**Dark mode:** Not planned. The warm cream palette is core to the identity. If needed later, the token architecture supports it via CSS variable swaps.

**Widget styling:** The embeddable widget has its own CSS injected into Shadow DOM. It's intentionally minimal and will eventually support CSS variable theming so stores can customize colors. Not related to the marketing design system.

**Admin restyling:** The Win95 admin styling may eventually be replaced if customers find it confusing. For now it's a memorable differentiator and functional. Decision deferred until real customer feedback.
