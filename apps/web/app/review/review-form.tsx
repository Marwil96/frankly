"use client";

import { useState } from "react";

interface ReviewFormProps {
  token: string;
  initialRating: number;
  email: string;
  sku: string;
  productName?: string;
}

export default function ReviewForm({
  token,
  initialRating,
  email,
  sku,
  productName,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultStatus, setResultStatus] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/review/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          rating,
          title,
          body,
          reviewerName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setResultStatus(data.status);
      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div style={cardStyle}>
        <div style={successIconStyle}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 style={successTitleStyle}>Thank you for your review!</h2>
        <p style={successTextStyle}>
          {resultStatus === "approved"
            ? "Your review has been published."
            : "Your review has been submitted and is awaiting moderation."}
        </p>
      </div>
    );
  }

  const displayRating = hoveredRating || rating;

  return (
    <form onSubmit={handleSubmit} style={cardStyle}>
      {productName && <h2 style={productTitleStyle}>{productName}</h2>}

      {/* Star Rating */}
      <div style={fieldGroup}>
        <label style={labelStyle}>Your rating</label>
        <div style={starsContainerStyle}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoveredRating(n)}
              onMouseLeave={() => setHoveredRating(0)}
              style={{
                ...starButtonStyle,
                color: n <= displayRating ? "#f5a623" : "#d1d5db",
              }}
              aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
            >
              {"\u2605"}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div style={fieldGroup}>
        <label htmlFor="reviewerName" style={labelStyle}>
          Your name
        </label>
        <input
          id="reviewerName"
          type="text"
          required
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          placeholder="Jane Doe"
          style={inputStyle}
        />
      </div>

      {/* Email (readonly) */}
      <div style={fieldGroup}>
        <label htmlFor="email" style={labelStyle}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          readOnly
          style={{ ...inputStyle, backgroundColor: "#f9fafb", color: "#6b7280" }}
        />
      </div>

      {/* Title */}
      <div style={fieldGroup}>
        <label htmlFor="title" style={labelStyle}>
          Review title
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          style={inputStyle}
        />
      </div>

      {/* Body */}
      <div style={fieldGroup}>
        <label htmlFor="body" style={labelStyle}>
          Your review
        </label>
        <textarea
          id="body"
          required
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell us more about your experience..."
          style={{ ...inputStyle, resize: "vertical" as const }}
        />
      </div>

      {error && <p style={errorStyle}>{error}</p>}

      <button type="submit" disabled={submitting || rating === 0} style={submitButtonStyle}>
        {submitting ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "32px",
  maxWidth: "480px",
  width: "100%",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
};

const productTitleStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 600,
  color: "#111827",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
};

const fieldGroup: React.CSSProperties = {
  marginBottom: "20px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: 500,
  color: "#374151",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: "15px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box" as const,
};

const starsContainerStyle: React.CSSProperties = {
  display: "flex",
  gap: "4px",
};

const starButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "36px",
  padding: "2px",
  lineHeight: 1,
  transition: "color 0.15s ease",
};

const submitButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  fontSize: "15px",
  fontWeight: 600,
  color: "#ffffff",
  backgroundColor: "#111827",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontFamily: "inherit",
};

const errorStyle: React.CSSProperties = {
  color: "#dc2626",
  fontSize: "14px",
  marginBottom: "16px",
};

const successIconStyle: React.CSSProperties = {
  textAlign: "center" as const,
  marginBottom: "16px",
};

const successTitleStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 600,
  color: "#111827",
  textAlign: "center" as const,
  margin: "0 0 8px 0",
};

const successTextStyle: React.CSSProperties = {
  fontSize: "15px",
  color: "#6b7280",
  textAlign: "center" as const,
  margin: 0,
};
