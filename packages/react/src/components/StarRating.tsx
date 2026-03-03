"use client";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  max?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: number;
  className?: string;
}

export function StarRating({
  rating,
  max = 5,
  interactive = false,
  onChange,
  size = 20,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || rating;

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "1px",
        cursor: interactive ? "pointer" : "default",
        userSelect: "none",
      }}
      onMouseLeave={() => interactive && setHovered(0)}
    >
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1;
        const filled = star <= display;
        return (
          <span
            key={star}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={
              interactive
                ? `Rate ${star} star${star > 1 ? "s" : ""}`
                : undefined
            }
            onClick={() => interactive && onChange?.(star)}
            onKeyDown={(e) => {
              if (interactive && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onChange?.(star);
              }
            }}
            onMouseEnter={() => interactive && setHovered(star)}
            style={{
              fontSize: `${size}px`,
              lineHeight: 1,
              color: filled ? "#f59e0b" : "#d1d5db",
              transition: "color 150ms ease",
            }}
          >
            {"\u2605"}
          </span>
        );
      })}
    </span>
  );
}
