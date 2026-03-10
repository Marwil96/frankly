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
