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
