"use client";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary";
  size?: "sm" | "md";
}

export function Button({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "bg-win95-bg shadow-win95-button active:shadow-win95-button-pressed font-[family-name:var(--font-win95)] cursor-pointer select-none";
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-4 py-1 text-[11px]";
  const variantClass =
    variant === "primary"
      ? "font-bold"
      : "";

  return (
    <button
      className={`${base} ${sizeClass} ${variantClass} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {children}
    </button>
  );
}
