import { verifyReviewToken } from "@/lib/tokens";
import { db } from "@/lib/db";
import { emailRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ReviewForm from "./review-form";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; rating?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;
  const ratingParam = params.rating;

  if (!token) {
    return (
      <PageShell>
        <ErrorCard message="No review token provided. Please use the link from your email." />
      </PageShell>
    );
  }

  const tokenData = await verifyReviewToken(token);
  if (!tokenData) {
    return (
      <PageShell>
        <ErrorCard message="This review link is invalid or has expired. Please contact support if you need a new one." />
      </PageShell>
    );
  }

  const rating = Math.min(5, Math.max(1, parseInt(ratingParam || "0") || 0));

  // Look up product name from email request
  let productName: string | undefined;
  const [emailReq] = await db
    .select({ productName: emailRequests.productName })
    .from(emailRequests)
    .where(eq(emailRequests.token, token))
    .limit(1);

  if (emailReq) {
    productName = emailReq.productName;
  }

  return (
    <PageShell>
      <ReviewForm
        token={token}
        initialRating={rating}
        email={tokenData.email}
        sku={tokenData.sku}
        productName={productName}
      />
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {children}
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "32px",
        maxWidth: "480px",
        width: "100%",
        textAlign: "center" as const,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ marginBottom: "16px" }}>
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#dc2626"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 600,
          color: "#111827",
          margin: "0 0 8px 0",
        }}
      >
        Unable to load review
      </h2>
      <p style={{ fontSize: "15px", color: "#6b7280", margin: 0 }}>
        {message}
      </p>
    </div>
  );
}
