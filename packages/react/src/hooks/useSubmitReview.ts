"use client";
import { useState, useCallback } from "react";
import { useFranklyConfig } from "../components/FranklyProvider";

interface SubmitReviewData {
  sku: string;
  rating: number;
  title: string;
  body: string;
  name: string;
  email: string;
  photos?: File[];
}

interface UseSubmitReviewResult {
  submit: (data: SubmitReviewData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}

export function useSubmitReview(): UseSubmitReviewResult {
  const { apiUrl, apiKey } = useFranklyConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(
    async (data: SubmitReviewData) => {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      try {
        const hasPhotos = data.photos && data.photos.length > 0;

        let res: Response;

        if (hasPhotos) {
          const formData = new FormData();
          formData.append("sku", data.sku);
          formData.append("rating", String(data.rating));
          formData.append("title", data.title);
          formData.append("body", data.body);
          formData.append("name", data.name);
          formData.append("email", data.email);
          for (const file of data.photos!) {
            formData.append("photos", file);
          }

          res = await fetch(`${apiUrl}/api/v1/reviews`, {
            method: "POST",
            headers: {
              "X-API-Key": apiKey,
            },
            body: formData,
          });
        } else {
          res = await fetch(`${apiUrl}/api/v1/reviews`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": apiKey,
            },
            body: JSON.stringify({
              sku: data.sku,
              rating: data.rating,
              title: data.title,
              body: data.body,
              name: data.name,
              email: data.email,
            }),
          });
        }

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(
            body?.error ?? `Failed to submit review: ${res.status}`
          );
        }

        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [apiUrl, apiKey]
  );

  return { submit, isSubmitting, error, success };
}
