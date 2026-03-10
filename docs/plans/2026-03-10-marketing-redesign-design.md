# Marketing Pages Redesign — Design Document

> Date: 2026-03-10
> Status: Approved
> Scope: Landing page and marketing pages only. Admin dashboard unchanged.

---

## Summary

Replace the Win95-themed marketing pages with a warm Bauhaus aesthetic. Clean grid layout, Grotesk typography, Scandinavian-friendly warm palette. Basecamp-inspired tone of voice: short, honest, opinionated.

Admin dashboard keeps its Win95 styling.

---

## Design Tokens

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-cream` | `#F5F0EB` | Page background |
| `--color-card` | `#FAFAF8` | Card backgrounds |
| `--color-text` | `#1A1A1A` | Primary text |
| `--color-text-secondary` | `#6B6560` | Secondary text |
| `--color-border` | `#E5DDD5` | Borders, dividers |
| `--color-terracotta` | `#C45D3E` | Primary accent |
| `--color-ochre` | `#D4A843` | Secondary accent |
| `--color-deep-blue` | `#2B4C7E` | Tertiary accent |
| `--color-code-bg` | `#2A2520` | Code block background |

### Typography

- **Font:** Space Grotesk (Google Fonts)
- **Headings:** 700 weight, tight letter-spacing (-0.02em)
- **Body:** 400 weight, 16px base, 1.6 line height
- **Scale:** 14px small / 16px body / 20px h3 / 28px h2 / 42px h1

### Spacing & Layout

- Max content width: `1120px`
- Section padding: `64px` vertical
- Card padding: `24px`
- Border radius: `8px` cards, `4px` buttons
- Shadows: `0 2px 8px rgba(26, 26, 26, 0.06)`
- Grid: strict alignment, consistent rhythm

---

## Page Structure

### 1. Nav
Simple top bar. Text logo "Frankly" (Space Grotesk, bold, slight letter-spacing). Links: Features, Pricing, Docs. CTA button "Get Started" in terracotta. Sticky on scroll optional.

### 2. Hero
- Left (60%): Bold headline, one-sentence description, two buttons (primary: "Get Started", secondary: "View Docs")
- Right (40%): Widget preview showing review cards as they'd appear on a storefront
- Asymmetric layout — Bauhaus grid, not centered

### 3. Social proof bar
Single horizontal line of trust signals: "Built for Centra · EU Omnibus Compliant · GDPR Ready · < 15 KB widget". Cream background, subtle top/bottom border. Understated.

### 4. Features
6 cards, 3x2 grid. Each card: simple geometric icon (shapes in accent colors), bold title, one-sentence description. Cards have `--color-card` background with subtle shadow.

### 5. How it works
3 steps horizontal. Bold step number (01, 02, 03) in terracotta, title, short description. Connected by simple line or spacing.

### 6. Code examples
Tab switcher (React SDK / Script Tag). Dark code block (`--color-code-bg`). Clean, no chrome.

### 7. Pricing
3 cards side by side. Growth tier highlighted with terracotta left border or ring. Price large and prominent. Feature list with checkmarks. CTA button per tier. "Free 14-day trial · No credit card required" below.

### 8. Final CTA
Centered block, subtle ochre background. "Ready to collect honest reviews?" + primary button.

### 9. Footer
Logo, nav links (Docs, GitHub, Privacy, Terms), copyright. Clean, single row on desktop.

---

## Tone of Voice

Basecamp-inspired:
- Short, declarative sentences
- No buzzwords ("Collect reviews" not "Unlock the power of social proof")
- Opinionated ("Built for Centra" not "Works with many platforms")
- Prices visible, no "contact sales"
- Confident but not arrogant

---

## Files Changed

### New files
- `components/marketing/Nav.tsx`
- `components/marketing/FeatureCard.tsx`
- `components/marketing/PricingCard.tsx`
- `components/marketing/CodeBlock.tsx`
- `components/marketing/Footer.tsx`

### Modified files
- `app/globals.css` — Add marketing tokens alongside existing Win95 tokens
- `app/page.tsx` — Full rewrite with new components and layout
- `app/layout.tsx` — Neutral base (no teal background); marketing pages style themselves, admin pages keep Win95 via admin layout

### Unchanged
- `components/win95/*` — All Win95 components stay
- `app/admin/*` — Admin pages untouched
- `packages/widget/*` — Widget unchanged
- `packages/react/*` — React SDK unchanged
- All API routes unchanged

---

## Visual Principles

1. **Grid discipline** — Strict alignment, consistent spacing rhythm, no arbitrary gaps
2. **Typography as structure** — Large bold headings are visual anchors; no decorative fonts
3. **Restrained color** — Mostly cream/white/dark text. Accent colors in small deliberate moments (CTA button, step numbers, highlighted pricing card)
4. **No chrome** — No window frames, no raised/sunken borders on marketing pages
5. **Whitespace** — Generous. Let the content breathe.
6. **Simple geometric icons** — Basic shapes in accent colors for feature cards. Not elaborate illustrations.
