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
