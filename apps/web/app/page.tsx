import Link from "next/link";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { PricingCard } from "@/components/marketing/PricingCard";
import { CodeBlock } from "@/components/marketing/CodeBlock";

/* ---------- data ---------- */

const demoReviews = [
  {
    id: 1,
    reviewer: "Anna S.",
    rating: 5,
    title: "Perfect fit!",
    body: "Ordered online, arrived in 2 days. Quality is amazing. Will buy again.",
    verified: true,
  },
  {
    id: 2,
    reviewer: "Erik L.",
    rating: 4,
    title: "Great value",
    body: "Solid product for the price. Slight color difference from the photo but still happy.",
    verified: true,
  },
  {
    id: 3,
    reviewer: "Maria K.",
    rating: 5,
    title: "Love it",
    body: "Exactly as described. Centra checkout was smooth too. Recommended!",
    verified: true,
  },
];

const featureCards: {
  shape: "circle" | "diamond" | "square" | "triangle" | "cross" | "semicircle";
  color: "terracotta" | "deep-blue" | "ochre";
  title: string;
  description: string;
}[] = [
  {
    shape: "circle",
    color: "terracotta",
    title: "Centra Integration",
    description:
      "Webhook-based, automatic post-purchase emails. Connect in 2 minutes.",
  },
  {
    shape: "diamond",
    color: "deep-blue",
    title: "Verified Reviews",
    description:
      "EU Omnibus compliant. Verified purchase badges your customers trust.",
  },
  {
    shape: "square",
    color: "ochre",
    title: "Photo Reviews",
    description:
      "Customers upload images with reviews. Social proof that converts.",
  },
  {
    shape: "triangle",
    color: "deep-blue",
    title: "Multi-Language",
    description:
      "Widget and emails in en, sv, nb, and da. Reach all Nordic markets.",
  },
  {
    shape: "cross",
    color: "terracotta",
    title: "SEO Ready",
    description:
      "JSON-LD structured data. Google rich snippets out of the box.",
  },
  {
    shape: "semicircle",
    color: "ochre",
    title: "Developer Friendly",
    description: "React SDK, vanilla JS widget, and a full REST API.",
  },
];

const steps = [
  {
    num: "01",
    title: "Connect",
    description:
      "Add your Centra webhook in 2 minutes. Paste one URL, done.",
  },
  {
    num: "02",
    title: "Collect",
    description:
      "Automated emails request reviews after delivery. No manual work.",
  },
  {
    num: "03",
    title: "Convert",
    description:
      "Display reviews with our widget. Boost SEO with structured data.",
  },
];

const pricingTiers = [
  {
    name: "Starter",
    price: "49",
    period: "/mo",
    features: [
      "1 store",
      "500 orders/mo",
      "Email review requests",
      "Photo reviews",
      "Standard widget",
      "Community support",
    ],
    cta: "Get Started",
  },
  {
    name: "Growth",
    price: "99",
    period: "/mo",
    features: [
      "3 stores",
      "Unlimited orders",
      "Multi-language (en/sv/nb/da)",
      "Photo reviews",
      "Custom widget styling",
      "Priority support",
    ],
    cta: "Get Started",
    highlight: true,
  },
  {
    name: "Pro",
    price: "199",
    period: "/mo",
    features: [
      "Unlimited stores",
      "Unlimited orders",
      "Google Shopping feed",
      "Custom email domain",
      "Advanced analytics",
      "Dedicated support",
    ],
    cta: "Contact Us",
  },
];

const reactSnippet = `import { FranklyProvider, ReviewList }
  from "@frankly/react";

function ProductPage() {
  return (
    <FranklyProvider apiKey="pk_live_...">
      <ReviewList sku="PRODUCT-001" />
    </FranklyProvider>
  );
}`;

const scriptSnippet = `<script
  src="https://cdn.frankly.reviews/widget.js"
  data-frankly-api-key="pk_live_..."
  data-frankly-sku="PRODUCT-001"
></script>`;

/* ---------- helpers ---------- */

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: "#D4A843" }}>
      {Array.from({ length: 5 }, (_, i) => (i < rating ? "\u2605" : "\u2606")).join("")}
    </span>
  );
}

/* ---------- page ---------- */

export default function HomePage() {
  const avgRating = (
    demoReviews.reduce((sum, r) => sum + r.rating, 0) / demoReviews.length
  ).toFixed(1);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-text font-[family-name:var(--font-marketing)]">
      {/* ============ NAV ============ */}
      <Nav />

      <main className="flex-1 flex flex-col">
        {/* ============ HERO ============ */}
        <section className="w-full px-6 pt-16 pb-16">
          <div className="max-w-[1120px] mx-auto flex flex-col lg:flex-row items-center gap-12">
            {/* Left 60% */}
            <div className="lg:w-[60%] flex flex-col gap-5 text-center lg:text-left">
              <p className="text-[12px] tracking-widest uppercase text-text-secondary font-semibold">
                frankly.reviews
              </p>
              <h1 className="text-[42px] leading-[1.1] font-bold text-text">
                Product reviews for
                <br />
                headless e-commerce
              </h1>
              <p className="text-[16px] text-text-secondary leading-relaxed max-w-lg mx-auto lg:mx-0">
                Collect verified reviews. Boost conversions. Built for Centra
                and headless platforms.
              </p>
              <div className="flex gap-3 mt-2 justify-center lg:justify-start">
                <Link
                  href="/signup"
                  className="bg-terracotta text-white text-[14px] font-semibold px-6 py-2.5 rounded-[4px] hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
                <Link
                  href="/docs"
                  className="border border-border text-text text-[14px] font-semibold px-6 py-2.5 rounded-[4px] hover:bg-card transition-colors"
                >
                  View Docs
                </Link>
              </div>
              <p className="text-[13px] text-text-secondary mt-1">
                Free 14-day trial &middot; No credit card required
              </p>
            </div>

            {/* Right 40% — mock widget preview */}
            <div className="lg:w-[40%] w-full max-w-md">
              <div className="flex flex-col gap-3">
                {/* Average rating */}
                <div className="text-center text-[14px] text-text-secondary">
                  <Stars rating={5} />{" "}
                  <span className="font-bold text-text">{avgRating} out of 5</span>{" "}
                  &middot; {demoReviews.length} reviews
                </div>

                {/* Review cards */}
                {demoReviews.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-lg p-4 shadow-[0_2px_8px_rgba(26,26,26,0.06)]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Stars rating={r.rating} />
                        <span className="font-bold text-[15px] text-text">
                          {r.title}
                        </span>
                      </div>
                      {r.verified && (
                        <span className="text-[12px] text-green-600 font-semibold">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-[14px] text-text-secondary leading-relaxed">
                      {r.body}
                    </p>
                    <p className="text-[13px] text-text-secondary mt-1.5">
                      -- {r.reviewer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ SOCIAL PROOF BAR ============ */}
        <section className="w-full px-6">
          <div className="max-w-[1120px] mx-auto border-t border-b border-border py-4">
            <p className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[14px] text-text-secondary">
              <span>Built for Centra</span>
              <span>&middot;</span>
              <span>EU Omnibus Compliant</span>
              <span>&middot;</span>
              <span>GDPR Ready</span>
              <span>&middot;</span>
              <span>{"<"} 15 KB widget</span>
              <span>&middot;</span>
              <span>Shadow DOM isolated</span>
            </p>
          </div>
        </section>

        {/* ============ FEATURES ============ */}
        <section id="features" className="w-full px-6 pt-16 pb-16">
          <div className="max-w-[1120px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-[28px] font-bold text-text">
                Everything you need to collect &amp; display reviews
              </h2>
              <p className="text-[16px] text-text-secondary mt-2">
                Purpose-built for headless Scandinavian e-commerce.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featureCards.map((f) => (
                <FeatureCard
                  key={f.title}
                  shape={f.shape}
                  color={f.color}
                  title={f.title}
                  description={f.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section className="w-full px-6 pb-16">
          <div className="max-w-[1120px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-[28px] font-bold text-text">How it works</h2>
              <p className="text-[16px] text-text-secondary mt-2">
                Up and running in under 5 minutes.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {steps.map((s) => (
                <div
                  key={s.num}
                  className="bg-card rounded-lg p-6 shadow-[0_2px_8px_rgba(26,26,26,0.06)]"
                >
                  <span className="text-[32px] font-bold text-terracotta leading-none">
                    {s.num}
                  </span>
                  <h3 className="text-[20px] font-bold text-text mt-3">
                    {s.title}
                  </h3>
                  <p className="text-[15px] text-text-secondary leading-relaxed mt-2">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CODE EXAMPLES ============ */}
        <section className="w-full px-6 pb-16">
          <div className="max-w-[1120px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-[28px] font-bold text-text">
                Drop in with two lines of code
              </h2>
              <p className="text-[16px] text-text-secondary mt-2">
                React SDK or a plain script tag. Your choice.
              </p>
            </div>
            <CodeBlock
              tabs={[
                { id: "react", label: "React SDK", code: reactSnippet },
                { id: "script", label: "Script Tag", code: scriptSnippet },
              ]}
            />
          </div>
        </section>

        {/* ============ PRICING ============ */}
        <section id="pricing" className="w-full px-6 pb-16">
          <div className="max-w-[1120px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-[28px] font-bold text-text">
                Simple, transparent pricing
              </h2>
              <p className="text-[16px] text-text-secondary mt-2">
                Start free for 14 days. No credit card required.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {pricingTiers.map((tier) => (
                <PricingCard
                  key={tier.name}
                  name={tier.name}
                  price={tier.price}
                  period={tier.period}
                  features={tier.features}
                  cta={tier.cta}
                  highlight={tier.highlight}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section className="w-full px-6 pb-16">
          <div className="max-w-[1120px] mx-auto">
            <div className="bg-ochre/10 rounded-lg px-6 py-16 text-center">
              <h2 className="text-[28px] font-bold text-text">
                Ready to collect honest reviews?
              </h2>
              <p className="text-[16px] text-text-secondary mt-3 max-w-lg mx-auto">
                Set up Frankly in under 5 minutes. Connect your Centra store,
                start collecting verified reviews, and watch conversions grow.
              </p>
              <div className="flex gap-3 mt-6 justify-center">
                <Link
                  href="/signup"
                  className="bg-terracotta text-white text-[14px] font-semibold px-6 py-2.5 rounded-[4px] hover:opacity-90 transition-opacity"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/docs"
                  className="border border-border text-text text-[14px] font-semibold px-6 py-2.5 rounded-[4px] hover:bg-card transition-colors"
                >
                  Read the Docs
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <Footer />
    </div>
  );
}
