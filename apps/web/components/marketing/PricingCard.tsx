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
