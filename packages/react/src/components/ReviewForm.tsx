"use client";
import { useState, useRef } from "react";
import { useSubmitReview } from "../hooks/useSubmitReview";
import { useFranklyConfig } from "./FranklyProvider";
import { getStrings } from "../i18n";
import { StarRating } from "./StarRating";

interface ReviewFormProps {
  sku: string;
  onSuccess?: () => void;
  className?: string;
}

const fontStack =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: "14px",
  fontFamily: fontStack,
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  backgroundColor: "#ffffff",
  color: "#111827",
  outline: "none",
  transition: "border-color 150ms ease",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 500,
  color: "#374151",
  marginBottom: "4px",
};

export function ReviewForm({ sku, onSuccess, className }: ReviewFormProps) {
  const { locale } = useFranklyConfig();
  const t = getStrings(locale);
  const { submit, isSubmitting, error, success } = useSubmitReview();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setPhotos((prev) => [...prev, ...files]);
    const newUrls = files.map((file) => URL.createObjectURL(file));
    setPhotoUrls((prev) => [...prev, ...newUrls]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoUrls[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({
      sku,
      name,
      email,
      rating,
      title,
      body,
      photos: photos.length > 0 ? photos : undefined,
    });
    onSuccess?.();
  };

  if (success) {
    return (
      <div
        className={className}
        style={{
          fontFamily: fontStack,
          padding: "32px",
          textAlign: "center",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          backgroundColor: "#f9fafb",
        }}
      >
        <div style={{ fontSize: "24px", marginBottom: "8px" }}>{"\u2713"}</div>
        <p
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "#111827",
            margin: "0 0 4px",
          }}
        >
          {t.thankYou}
        </p>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
          {t.pending}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={className}
      style={{ fontFamily: fontStack }}
    >
      {error && (
        <div
          style={{
            padding: "10px 14px",
            marginBottom: "16px",
            fontSize: "14px",
            color: "#dc2626",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
          }}
        >
          {error}
        </div>
      )}

      {/* Rating */}
      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>Rating</label>
        <StarRating
          rating={rating}
          interactive
          onChange={setRating}
          size={28}
        />
      </div>

      {/* Title */}
      <div style={{ marginBottom: "16px" }}>
        <label style={labelStyle}>{t.title}</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
          placeholder={t.title}
        />
      </div>

      {/* Body */}
      <div style={{ marginBottom: "16px" }}>
        <label style={labelStyle}>{t.body}</label>
        <textarea
          required
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{
            ...inputStyle,
            resize: "vertical",
          }}
          placeholder={t.body}
        />
      </div>

      {/* Name */}
      <div style={{ marginBottom: "16px" }}>
        <label style={labelStyle}>{t.name}</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
          placeholder={t.name}
        />
      </div>

      {/* Email */}
      <div style={{ marginBottom: "16px" }}>
        <label style={labelStyle}>{t.email}</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          placeholder={t.email}
        />
      </div>

      {/* Photo upload */}
      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>{t.addPhotos}</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoChange}
          style={{ display: "none" }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: "8px 14px",
            fontSize: "13px",
            fontFamily: fontStack,
            border: "1px dashed #d1d5db",
            borderRadius: "6px",
            backgroundColor: "#f9fafb",
            color: "#6b7280",
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
        >
          + {t.addPhotos}
        </button>

        {/* Photo thumbnails */}
        {photoUrls.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "10px",
              flexWrap: "wrap",
            }}
          >
            {photoUrls.map((url, idx) => (
              <div
                key={idx}
                style={{
                  position: "relative",
                  width: "64px",
                  height: "64px",
                }}
              >
                <img
                  src={url}
                  alt={`Upload ${idx + 1}`}
                  style={{
                    width: "64px",
                    height: "64px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: "#374151",
                    color: "#ffffff",
                    fontSize: "11px",
                    lineHeight: 1,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  {"\u00d7"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        style={{
          width: "100%",
          padding: "12px 20px",
          fontSize: "14px",
          fontWeight: 600,
          fontFamily: fontStack,
          border: "none",
          borderRadius: "6px",
          backgroundColor:
            isSubmitting || rating === 0 ? "#d1d5db" : "#111827",
          color: isSubmitting || rating === 0 ? "#9ca3af" : "#ffffff",
          cursor: isSubmitting || rating === 0 ? "not-allowed" : "pointer",
          transition: "all 150ms ease",
        }}
      >
        {isSubmitting ? "..." : t.submitReview}
      </button>
    </form>
  );
}
