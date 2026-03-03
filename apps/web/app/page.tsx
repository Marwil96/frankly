import Link from "next/link";
import { Window } from "@/components/win95/Window";
import { Panel } from "@/components/win95/Panel";
import { Button } from "@/components/win95/Button";
import { StarRating } from "@/components/win95/StarRating";
import { StatusBar } from "@/components/win95/StatusBar";
import { Tabs } from "@/components/win95/Tabs";

/* ---------- data ---------- */

const demoReviews = [
  {
    id: 1,
    reviewer: "Anna S.",
    rating: 5,
    title: "Perfect fit!",
    body: "Ordered online, arrived in 2 days. Quality is amazing. Will buy again.",
    verified: true,
    photo: true,
  },
  {
    id: 2,
    reviewer: "Erik L.",
    rating: 4,
    title: "Great value",
    body: "Solid product for the price. Slight color difference from the photo but still happy.",
    verified: true,
    photo: false,
  },
  {
    id: 3,
    reviewer: "Maria K.",
    rating: 5,
    title: "Love it",
    body: "Exactly as described. Centra checkout was smooth too. Recommended!",
    verified: true,
    photo: true,
  },
];

const features = [
  {
    icon: "icon-centra",
    label: "Centra Integration",
    desc: "Webhook-based, automatic post-purchase emails. Connect in 2 minutes.",
  },
  {
    icon: "icon-verified",
    label: "Verified Reviews",
    desc: "EU Omnibus compliant. Verified purchase badges your customers trust.",
  },
  {
    icon: "icon-photo",
    label: "Photo Reviews",
    desc: "Customers upload images with reviews. Social proof that converts.",
  },
  {
    icon: "icon-lang",
    label: "Multi-Language",
    desc: "Widget and emails in en, sv, nb, and da. Reach all Nordic markets.",
  },
  {
    icon: "icon-seo",
    label: "SEO Ready",
    desc: "JSON-LD structured data. Google rich snippets out of the box.",
  },
  {
    icon: "icon-dev",
    label: "Developer Friendly",
    desc: "React SDK, vanilla JS widget, and a full REST API.",
  },
];

const steps = [
  {
    num: "01",
    title: "Connect",
    desc: "Add your Centra webhook in 2 minutes. Paste one URL, done.",
    icon: "->",
  },
  {
    num: "02",
    title: "Collect",
    desc: "Automated emails request reviews after delivery. No manual work.",
    icon: "->",
  },
  {
    num: "03",
    title: "Convert",
    desc: "Display reviews with our widget. Boost SEO with structured data.",
    icon: null,
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
    highlight: false,
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
    highlight: false,
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

function FeatureIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    "icon-centra": "\u{1F517}",
    "icon-verified": "\u{1F6E1}",
    "icon-photo": "\u{1F4F7}",
    "icon-lang": "\u{1F310}",
    "icon-seo": "\u{1F50D}",
    "icon-dev": "\u{2699}\u{FE0F}",
  };
  return (
    <span className="text-[20px] leading-none">{icons[type] ?? "?"}</span>
  );
}

/* ---------- page ---------- */

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col">
        {/* ============ HERO ============ */}
        <section className="w-full px-4 pt-10 pb-8">
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-8">
            {/* Left - Copy */}
            <div className="flex-1 flex flex-col gap-4 text-center lg:text-left">
              <p className="text-[11px] tracking-widest uppercase text-win95-darker font-bold">
                frankly.reviews
              </p>
              <h1 className="text-[28px] sm:text-[32px] leading-tight font-bold text-win95-black">
                Product reviews for
                <br />
                headless e-commerce
              </h1>
              <p className="text-[13px] text-win95-darker leading-relaxed max-w-md mx-auto lg:mx-0">
                Collect verified reviews. Boost conversions. Built for Centra
                and headless platforms.
              </p>
              <div className="flex gap-3 mt-2 justify-center lg:justify-start">
                <Link href="/signup">
                  <Button variant="primary" size="md" className="px-6 py-1.5">
                    Get Started
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button size="md" className="px-6 py-1.5">
                    View Docs
                  </Button>
                </Link>
              </div>
              <p className="text-[10px] text-win95-dark mt-1">
                Free 14-day trial &middot; No credit card required
              </p>
            </div>

            {/* Right - Mini widget preview */}
            <div className="flex-1 max-w-md w-full">
              <Window
                title="Review Widget - SNEAKER-001"
                statusBar="3 verified reviews loaded"
              >
                <Panel variant="sunken" className="flex items-center gap-2 mb-2">
                  <StarRating rating={5} size="md" />
                  <span className="font-bold text-[12px]">4.7 out of 5</span>
                  <span className="text-win95-dark text-[11px]">
                    (3 reviews)
                  </span>
                </Panel>
                {demoReviews.map((r) => (
                  <Panel key={r.id} variant="sunken" className="mb-1.5 last:mb-0">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <StarRating rating={r.rating} size="sm" />
                          <span className="font-bold text-[11px]">
                            {r.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {r.photo && (
                            <span
                              className="text-[9px] bg-win95-light px-1 shadow-win95-button"
                              title="Has photo"
                            >
                              IMG
                            </span>
                          )}
                          {r.verified && (
                            <span className="text-[9px] text-win95-green font-bold">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-win95-darker">{r.body}</p>
                      <span className="text-[9px] text-win95-dark">
                        -- {r.reviewer}
                      </span>
                    </div>
                  </Panel>
                ))}
              </Window>
            </div>
          </div>
        </section>

        {/* ============ SOCIAL PROOF BAR ============ */}
        <section className="w-full px-4 pb-6">
          <div className="max-w-5xl mx-auto">
            <Panel variant="sunken" className="py-2 px-4">
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px] text-win95-darker">
                <span>Built for Centra</span>
                <span className="text-win95-dark">|</span>
                <span>EU Omnibus Compliant</span>
                <span className="text-win95-dark">|</span>
                <span>GDPR Ready</span>
                <span className="text-win95-dark">|</span>
                <span>{'<'} 15 KB widget</span>
                <span className="text-win95-dark">|</span>
                <span>Shadow DOM isolated</span>
              </div>
            </Panel>
          </div>
        </section>

        {/* ============ FEATURES ============ */}
        <section className="w-full px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-[20px] font-bold">
                Everything you need to collect &amp; display reviews
              </h2>
              <p className="text-[12px] text-win95-darker mt-1">
                Purpose-built for headless Scandinavian e-commerce.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {features.map((f) => (
                <Window key={f.label} title={f.label}>
                  <div className="flex flex-col gap-2 py-1">
                    <FeatureIcon type={f.icon} />
                    <p className="text-[11px] text-win95-darker leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </Window>
              ))}
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section className="w-full px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-[20px] font-bold">How it works</h2>
              <p className="text-[12px] text-win95-darker mt-1">
                Up and running in under 5 minutes.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {steps.map((s, i) => (
                <div key={s.num} className="flex items-stretch">
                  <Window
                    title={`Step ${s.num}`}
                    className="w-full"
                  >
                    <div className="flex flex-col items-center text-center gap-2 py-3">
                      <div className="w-10 h-10 bg-win95-blue text-win95-white flex items-center justify-center font-bold text-[16px] shadow-win95-raised">
                        {s.num}
                      </div>
                      <h3 className="text-[14px] font-bold">{s.title}</h3>
                      <p className="text-[11px] text-win95-darker leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </Window>
                  {i < steps.length - 1 && (
                    <div className="hidden md:flex items-center px-2">
                      <span className="text-[18px] text-win95-dark font-bold">
                        {"\u{25B6}"}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CODE EXAMPLES ============ */}
        <section className="w-full px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-[20px] font-bold">
                Drop in with two lines of code
              </h2>
              <p className="text-[12px] text-win95-darker mt-1">
                React SDK or a plain script tag. Your choice.
              </p>
            </div>
            <Window title="Integration Guide" className="w-full">
              <Tabs
                tabs={[
                  {
                    id: "react",
                    label: "React SDK",
                    content: (
                      <div className="flex flex-col gap-2">
                        <p className="text-[11px]">
                          Install:{" "}
                          <code className="bg-white px-1 shadow-win95-sunken">
                            npm install @frankly/react
                          </code>
                        </p>
                        <Panel variant="sunken">
                          <pre className="text-[11px] leading-relaxed bg-white p-3 overflow-x-auto">
                            <code>{reactSnippet}</code>
                          </pre>
                        </Panel>
                        <p className="text-[11px] text-win95-dark">
                          The provider handles auth. Nest any Frankly component
                          inside it.
                        </p>
                      </div>
                    ),
                  },
                  {
                    id: "script",
                    label: "Script Tag",
                    content: (
                      <div className="flex flex-col gap-2">
                        <p className="text-[11px]">
                          Add before the closing{" "}
                          <code className="bg-white px-1 shadow-win95-sunken">
                            &lt;/body&gt;
                          </code>{" "}
                          tag:
                        </p>
                        <Panel variant="sunken">
                          <pre className="text-[11px] leading-relaxed bg-white p-3 overflow-x-auto">
                            <code>{scriptSnippet}</code>
                          </pre>
                        </Panel>
                        <p className="text-[11px] text-win95-dark">
                          Widget renders in a Shadow DOM -- no CSS conflicts with
                          your site.
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </Window>
          </div>
        </section>

        {/* ============ PRICING ============ */}
        <section className="w-full px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-[20px] font-bold">
                Simple, transparent pricing
              </h2>
              <p className="text-[12px] text-win95-darker mt-1">
                Start free for 14 days. No credit card required.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pricingTiers.map((tier) => (
                <Window
                  key={tier.name}
                  title={
                    tier.highlight
                      ? `${tier.name}.exe - RECOMMENDED`
                      : `${tier.name}.exe`
                  }
                  className={`w-full flex flex-col ${
                    tier.highlight
                      ? "ring-2 ring-win95-blue"
                      : ""
                  }`}
                >
                  <div className="flex flex-col flex-1">
                    {/* Price */}
                    <div className="text-center py-3">
                      <div className="flex items-baseline justify-center gap-0.5">
                        <span className="text-[11px] text-win95-darker">
                          EUR
                        </span>
                        <span className="text-[32px] font-bold leading-none">
                          {tier.price}
                        </span>
                        <span className="text-[12px] text-win95-dark">
                          {tier.period}
                        </span>
                      </div>
                    </div>

                    {/* Feature list */}
                    <Panel variant="sunken" className="flex-1">
                      <ul className="flex flex-col gap-1.5 py-1">
                        {tier.features.map((f) => (
                          <li
                            key={f}
                            className="text-[11px] flex items-start gap-2"
                          >
                            <span className="text-win95-green font-bold leading-none mt-px">
                              +
                            </span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </Panel>

                    {/* CTA */}
                    <div className="pt-3 text-center">
                      <Link href="/signup">
                        <Button
                          variant={tier.highlight ? "primary" : "default"}
                          className="w-full py-1.5"
                        >
                          {tier.cta}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Window>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section className="w-full px-4 py-10">
          <div className="max-w-3xl mx-auto">
            <Window title="Get Started">
              <div className="flex flex-col items-center text-center gap-3 py-6">
                <h2 className="text-[20px] font-bold">
                  Ready to collect honest reviews?
                </h2>
                <p className="text-[12px] text-win95-darker max-w-md">
                  Set up Frankly in under 5 minutes. Connect your Centra store,
                  start collecting verified reviews, and watch conversions grow.
                </p>
                <div className="flex gap-3 mt-2">
                  <Link href="/signup">
                    <Button variant="primary" className="px-8 py-1.5">
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link href="/docs">
                    <Button className="px-8 py-1.5">Read the Docs</Button>
                  </Link>
                </div>
              </div>
            </Window>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="w-full px-4 pb-2 pt-4">
        <div className="max-w-5xl mx-auto">
          <Panel variant="raised" className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col items-center sm:items-start gap-1">
                <span className="font-bold text-[12px]">Frankly</span>
                <span className="text-[10px] text-win95-dark">
                  Honest reviews for headless e-commerce.
                </span>
              </div>
              <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                <Link
                  href="/docs"
                  className="text-[11px] text-win95-blue underline hover:text-win95-darker"
                >
                  Docs
                </Link>
                <a
                  href="https://github.com/frankly-reviews"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-win95-blue underline hover:text-win95-darker"
                >
                  GitHub
                </a>
                <Link
                  href="/privacy"
                  className="text-[11px] text-win95-blue underline hover:text-win95-darker"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-[11px] text-win95-blue underline hover:text-win95-darker"
                >
                  Terms of Service
                </Link>
              </nav>
            </div>
          </Panel>
          <div className="mt-1">
            <StatusBar
              items={[
                "Frankly v1.0.0",
                "Ready",
                "\u00A9 2025 Frankly Reviews",
              ]}
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
