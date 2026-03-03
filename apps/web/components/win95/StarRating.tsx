"use client";

interface StarRatingProps {
  rating: number;
  max?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  rating,
  max = 5,
  interactive = false,
  onChange,
  size = "md",
}: StarRatingProps) {
  const sizeClass = {
    sm: "text-[11px]",
    md: "text-[14px]",
    lg: "text-[18px]",
  }[size];

  return (
    <span className={`${sizeClass} leading-none`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`${interactive ? "cursor-pointer" : ""} ${
            i < rating ? "text-win95-yellow" : "text-win95-dark"
          }`}
          onClick={() => interactive && onChange?.(i + 1)}
          style={{ textShadow: "0 0 1px #000" }}
        >
          {i < rating ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}
