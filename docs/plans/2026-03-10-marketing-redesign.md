# Marketing Pages Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Win95-themed landing page with warm Bauhaus aesthetic while keeping admin dashboard unchanged.

**Architecture:** Add marketing design tokens alongside Win95 tokens in globals.css. Remove global Win95 body styles (teal bg, 11px font, MS Sans Serif *). Create new marketing components in `components/marketing/`. Rewrite `app/page.tsx`. Admin layout already scopes its own Win95 styles.

**Tech Stack:** Tailwind CSS v4 (@theme directive), Space Grotesk (Google Fonts), Next.js App Router

**Design doc:** `docs/plans/2026-03-10-marketing-redesign-design.md`

---

### Task 1: Add Space Grotesk Font

**Files:**
- Modify: `apps/web/app/layout.tsx`

**Step 1: Add Google Fonts import**

Update `layout.tsx` to load Space Grotesk via `next/font/google`:

```tsx
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Frankly - Product Reviews for Headless E-commerce",
  description:
    "Collect verified reviews, boost conversions. Built for Centra and headless platforms. EU Omnibus compliant. React SDK and vanilla JS widget.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body>{children}</body>
    </html>
  );
}
```

**Step 2: Verify dev server starts**

Run: `cd apps/web && npx next dev`
Expected: No errors. Font variable available.

**Step 3: Commit**

```bash
git add apps/web/app/layout.tsx
git commit -m "feat: add Space Grotesk font via next/font"
```

---

### Task 2: Update globals.css — Add Marketing Tokens, Remove Global Win95 Styles

**Files:**
- Modify: `apps/web/app/globals.css`

**Step 1: Add marketing tokens to @theme and remove global Win95 body styles**

Replace `globals.css` with:

```css
@import "tailwindcss";

@theme {
  /* ── Win95 tokens (admin dashboard) ── */
  --color-win95-bg: #c0c0c0;
  --color-win95-blue: #000080;
  --color-win95-white: #ffffff;
  --color-win95-dark: #808080;
  --color-win95-darker: #404040;
  --color-win95-black: #000000;
  --color-win95-light: #dfdfdf;
  --color-win95-teal: #008080;
  --color-win95-yellow: #ffff00;
  --color-win95-red: #ff0000;
  --color-win95-green: #008000;

  --font-win95: "MS Sans Serif", Tahoma, Geneva, sans-serif;

  /* ── Marketing tokens (landing page) ── */
  --color-cream: #F5F0EB;
  --color-card: #FAFAF8;
  --color-text: #1A1A1A;
  --color-text-secondary: #6B6560;
  --color-border: #E5DDD5;
  --color-terracotta: #C45D3E;
  --color-ochre: #D4A843;
  --color-deep-blue: #2B4C7E;
  --color-code-bg: #2A2520;

  --font-marketing: var(--font-space-grotesk), "Space Grotesk", system-ui, sans-serif;
}

/* ── Win95 utilities (admin dashboard) ── */

@utility shadow-win95-raised {
  box-shadow:
    inset 1px 1px 0px #ffffff,
    inset -1px -1px 0px #808080,
    inset 2px 2px 0px #dfdfdf,
    inset -2px -2px 0px #404040;
}

@utility shadow-win95-sunken {
  box-shadow:
    inset -1px -1px 0px #ffffff,
    inset 1px 1px 0px #808080,
    inset -2px -2px 0px #dfdfdf,
    inset 2px 2px 0px #404040;
}

@utility shadow-win95-button {
  box-shadow:
    inset 1px 1px 0px #ffffff,
    inset -1px -1px 0px #404040,
    inset 2px 2px 0px #dfdfdf,
    inset -2px -2px 0px #808080;
}

@utility shadow-win95-button-pressed {
  box-shadow:
    inset -1px -1px 0px #ffffff,
    inset 1px 1px 0px #404040,
    inset -2px -2px 0px #dfdfdf,
    inset 2px 2px 0px #808080;
}

@utility win95-titlebar {
  background: linear-gradient(90deg, #000080, #1084d0);
  color: #ffffff;
  padding: 2px 4px;
  font-weight: bold;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
}

/* ── Base reset (neutral — no Win95 defaults) ── */

body {
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::selection {
  background: var(--color-terracotta);
  color: #ffffff;
}
```

Key changes:
- Removed `* { font-family: var(--font-win95); }` — was forcing Win95 font on everything
- Removed `body { font-size: 11px; background-color: teal; color: black; }` — was forcing Win95 look globally
- Added marketing color and font tokens
- Body is now neutral — each page/layout controls its own styling

**Step 2: Update admin layout to apply Win95 styles explicitly**

The admin layout at `apps/web/app/admin/layout.tsx` already sets `text-[11px]` and `font-[family-name:var(--font-win95)]` on its root div. It also needs the teal background. Modify the outer `<div>` in admin layout:

Change line 33 from:
```tsx
<div className="h-screen flex text-[11px] font-[family-name:var(--font-win95)]">
```
to:
```tsx
<div className="h-screen flex text-[11px] font-[family-name:var(--font-win95)] bg-win95-teal text-win95-black">
```

Also update the admin login page (if it doesn't have its own background). Check `apps/web/app/admin/login/page.tsx` — if its root element doesn't have teal background, wrap it:

The login page returns early from admin layout (line 22-24 of layout.tsx: `if (pathname === "/admin/login") return <>{children}</>`), so it bypasses the layout div. The login page needs its own Win95 background. Add to login page's root div:
```
className="... bg-win95-teal min-h-screen font-[family-name:var(--font-win95)] text-[11px]"
```

**Step 3: Verify both routes**

Run: `cd apps/web && npx next dev`
- Visit `http://localhost:3000/` — should show unstyled content (no teal bg, no Win95 font)
- Visit `http://localhost:3000/admin/login` — should still look Win95 (teal bg, MS Sans Serif)
- Visit `http://localhost:3000/admin` (if logged in) — should still look Win95

**Step 4: Commit**

```bash
git add apps/web/app/globals.css apps/web/app/admin/layout.tsx apps/web/app/admin/login/page.tsx
git commit -m "feat: add marketing design tokens, make body styles neutral"
```

---

### Task 3: Create Marketing Nav Component

**Files:**
- Create: `apps/web/components/marketing/Nav.tsx`

**Step 1: Create the component**

```tsx
import Link from "next/link";

export function Nav() {
  return (
    <nav className="w-full px-6 py-4 font-[family-name:var(--font-marketing)]">
      <div className="max-w-[1120px] mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="text-[20px] font-bold tracking-tight text-text"
        >
          Frankly
        </Link>

        <div className="flex items-center gap-8">
          <div className="hidden sm:flex items-center gap-6">
            <a href="#features" className="text-[15px] text-text-secondary hover:text-text transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-[15px] text-text-secondary hover:text-text transition-colors">
              Pricing
            </a>
            <Link href="/docs" className="text-[15px] text-text-secondary hover:text-text transition-colors">
              Docs
            </Link>
          </div>

          <Link
            href="/signup"
            className="bg-terracotta text-white text-[14px] font-semibold px-5 py-2 rounded-[4px] hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

**Step 2: Commit**

```bash
git add apps/web/components/marketing/Nav.tsx
git commit -m "feat: add marketing Nav component"
```

---

### Task 4: Create Marketing Footer Component

**Files:**
- Create: `apps/web/components/marketing/Footer.tsx`

**Step 1: Create the component**

```tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full px-6 py-10 border-t border-border font-[family-name:var(--font-marketing)]">
      <div className="max-w-[1120px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center sm:items-start gap-1">
          <span className="font-bold text-[16px] text-text">Frankly</span>
          <span className="text-[13px] text-text-secondary">
            Honest reviews for headless e-commerce.
          </span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-6">
          <Link
            href="/docs"
            className="text-[13px] text-text-secondary hover:text-text transition-colors"
          >
            Docs
          </Link>
          <a
            href="https://github.com/frankly-reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-text-secondary hover:text-text transition-colors"
          >
            GitHub
          </a>
          <Link
            href="/privacy"
            className="text-[13px] text-text-secondary hover:text-text transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-[13px] text-text-secondary hover:text-text transition-colors"
          >
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
```

**Step 2: Commit**

```bash
git add apps/web/components/marketing/Footer.tsx
git commit -m "feat: add marketing Footer component"
```

---

### Task 5: Create FeatureCard Component

**Files:**
- Create: `apps/web/components/marketing/FeatureCard.tsx`

**Step 1: Create the component**

A card with a geometric shape icon, title, and description:

```tsx
interface FeatureCardProps {
  shape: "circle" | "triangle" | "square" | "diamond" | "cross" | "semicircle";
  color: "terracotta" | "ochre" | "deep-blue";
  title: string;
  description: string;
}

const colorMap = {
  terracotta: "bg-terracotta",
  ochre: "bg-ochre",
  "deep-blue": "bg-deep-blue",
};

function ShapeIcon({ shape, color }: Pick<FeatureCardProps, "shape" | "color">) {
  const bg = colorMap[color];
  const base = "flex-shrink-0";

  switch (shape) {
    case "circle":
      return <div className={`${base} ${bg} w-8 h-8 rounded-full`} />;
    case "square":
      return <div className={`${base} ${bg} w-8 h-8 rounded-[2px]`} />;
    case "triangle":
      return (
        <div
          className={`${base} w-0 h-0`}
          style={{
            borderLeft: "16px solid transparent",
            borderRight: "16px solid transparent",
            borderBottom: `28px solid var(--color-${color === "deep-blue" ? "deep-blue" : color})`,
          }}
        />
      );
    case "diamond":
      return <div className={`${base} ${bg} w-6 h-6 rotate-45 rounded-[2px]`} />;
    case "cross":
      return (
        <div className={`${base} relative w-8 h-8`}>
          <div className={`${bg} absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 rounded-full`} />
          <div className={`${bg} absolute left-1/2 top-0 bottom-0 w-2 -translate-x-1/2 rounded-full`} />
        </div>
      );
    case "semicircle":
      return <div className={`${base} ${bg} w-8 h-4 rounded-t-full`} />;
  }
}

export function FeatureCard({ shape, color, title, description }: FeatureCardProps) {
  return (
    <div className="bg-card rounded-lg p-6 shadow-[0_2px_8px_rgba(26,26,26,0.06)]">
      <div className="flex flex-col gap-3">
        <ShapeIcon shape={shape} color={color} />
        <h3 className="text-[17px] font-bold text-text">{title}</h3>
        <p className="text-[15px] text-text-secondary leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/web/components/marketing/FeatureCard.tsx
git commit -m "feat: add FeatureCard with geometric shape icons"
```

---

### Task 6: Create PricingCard Component

**Files:**
- Create: `apps/web/components/marketing/PricingCard.tsx`

**Step 1: Create the component**

```tsx
import Link from "next/link";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}

export function PricingCard({
  name,
  price,
  period,
  features,
  cta,
  highlight = false,
}: PricingCardProps) {
  return (
    <div
      className={`bg-card rounded-lg p-6 shadow-[0_2px_8px_rgba(26,26,26,0.06)] flex flex-col ${
        highlight ? "ring-2 ring-terracotta" : ""
      }`}
    >
      {highlight && (
        <span className="text-[12px] font-bold text-terracotta uppercase tracking-wider mb-2">
          Most popular
        </span>
      )}
      <h3 className="text-[20px] font-bold text-text">{name}</h3>

      <div className="flex items-baseline gap-1 mt-3 mb-4">
        <span className="text-[13px] text-text-secondary">EUR</span>
        <span className="text-[40px] font-bold text-text leading-none tracking-tight">
          {price}
        </span>
        <span className="text-[15px] text-text-secondary">{period}</span>
      </div>

      <ul className="flex flex-col gap-2 flex-1 mb-6">
        {features.map((f) => (
          <li key={f} className="text-[15px] text-text-secondary flex items-start gap-2">
            <span className="text-terracotta font-bold mt-0.5">+</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/signup"
        className={`block text-center text-[14px] font-semibold px-5 py-2.5 rounded-[4px] transition-opacity hover:opacity-90 ${
          highlight
            ? "bg-terracotta text-white"
            : "bg-text text-white"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/web/components/marketing/PricingCard.tsx
git commit -m "feat: add PricingCard component"
```

---

### Task 7: Create CodeBlock Component

**Files:**
- Create: `apps/web/components/marketing/CodeBlock.tsx`

**Step 1: Create the component**

A tabbed code block with dark background:

```tsx
"use client";

import { useState } from "react";

interface CodeTab {
  id: string;
  label: string;
  code: string;
}

interface CodeBlockProps {
  tabs: CodeTab[];
}

export function CodeBlock({ tabs }: CodeBlockProps) {
  const [active, setActive] = useState(tabs[0]?.id);
  const activeTab = tabs.find((t) => t.id === active);

  return (
    <div className="rounded-lg overflow-hidden">
      <div className="flex bg-[#1E1A17]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-5 py-2.5 text-[13px] font-medium transition-colors cursor-pointer ${
              active === tab.id
                ? "text-white bg-code-bg"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-code-bg p-5 overflow-x-auto">
        <pre className="text-[14px] leading-relaxed">
          <code className="text-[#E5DDD5]">{activeTab?.code}</code>
        </pre>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/web/components/marketing/CodeBlock.tsx
git commit -m "feat: add CodeBlock component with tabs"
```

---

### Task 8: Rewrite Landing Page

**Files:**
- Modify: `apps/web/app/page.tsx`

**Step 1: Rewrite the full landing page**

This is the largest task. Replace the entire `page.tsx` with the new design. The page uses all the marketing components plus inline sections for hero, social proof, how-it-works, and final CTA.

Key sections and their content:

**Data (keep at top of file):**
- `demoReviews` — 3 sample reviews (keep existing data, adjust field names)
- `features` — 6 feature cards with shape/color/title/description
- `steps` — 3 how-it-works steps
- `pricingTiers` — 3 pricing tiers (keep existing data)
- `reactSnippet` / `scriptSnippet` — code examples (keep existing)

**Layout wrapper:**
```tsx
<div className="min-h-screen flex flex-col bg-cream text-text font-[family-name:var(--font-marketing)]">
```

**Sections in order:**
1. `<Nav />` — imported from marketing components
2. Hero — Two-column (60/40), left text + CTAs, right widget preview showing review cards
3. Social proof bar — single line of trust signals in a subtle bordered strip
4. Features (`id="features"`) — Section heading + 3x2 grid of `<FeatureCard />`
5. How it works — Section heading + 3-column with step numbers in terracotta
6. Code examples — Section heading + `<CodeBlock />` with React/Script tabs
7. Pricing (`id="pricing"`) — Section heading + 3-column grid of `<PricingCard />`
8. Final CTA — Centered block with ochre-tinted background
9. `<Footer />` — imported from marketing components

**Review cards in hero (inline, not Win95):**
Simple cards with white background, subtle shadow, star rating as text characters, reviewer name, verified badge. No Window/Panel components.

**Step 2: Verify the page**

Run: `cd apps/web && npx next dev`
- Visit `http://localhost:3000/` — should show the new marketing design
- Check responsive behavior at mobile/tablet/desktop widths
- Verify `http://localhost:3000/admin` still has Win95 styling

**Step 3: Commit**

```bash
git add apps/web/app/page.tsx
git commit -m "feat: rewrite landing page with warm Bauhaus design"
```

---

### Task 9: Build Verification

**Step 1: Run full build**

```bash
cd /Users/williammartinsson/web/personal/frankly
npm run build:web
```

Expected: Build succeeds with no type errors.

**Step 2: Check all routes**

Start production server and verify:
- `/` — new marketing design, Space Grotesk font, cream background
- `/admin/login` — Win95 styling preserved (teal bg, MS Sans Serif)
- `/admin` — Win95 styling preserved (sidebar, teal bg)

**Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: resolve build issues from marketing redesign"
```

---

### Task 10: Push to GitHub

**Step 1: Push all commits**

```bash
git push origin main
```

Expected: All commits pushed successfully.
