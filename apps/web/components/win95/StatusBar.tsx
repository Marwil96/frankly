interface StatusBarProps {
  items: string[];
  className?: string;
}

export function StatusBar({ items, className = "" }: StatusBarProps) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {items.map((item, i) => (
        <div
          key={i}
          className="shadow-win95-sunken px-2 py-0.5 text-[11px] flex-1 first:flex-[2]"
        >
          {item}
        </div>
      ))}
    </div>
  );
}
