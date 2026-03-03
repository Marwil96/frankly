interface PanelProps {
  variant?: "raised" | "sunken";
  className?: string;
  children: React.ReactNode;
}

export function Panel({
  variant = "raised",
  className = "",
  children,
}: PanelProps) {
  const shadow =
    variant === "raised" ? "shadow-win95-raised" : "shadow-win95-sunken";

  return (
    <div className={`bg-win95-bg ${shadow} p-2 ${className}`}>{children}</div>
  );
}
