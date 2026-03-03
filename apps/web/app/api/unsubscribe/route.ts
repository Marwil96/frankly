import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unsubscribes, emailRequests } from "@/lib/db/schema";
import { verifyReviewToken } from "@/lib/tokens";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return htmlResponse(
      "Missing Token",
      "No token was provided. Please use the link from your email.",
      false,
    );
  }

  const tokenData = await verifyReviewToken(token);
  if (!tokenData) {
    return htmlResponse(
      "Invalid Link",
      "This unsubscribe link is invalid or has expired.",
      false,
    );
  }

  const { storeId, email } = tokenData;

  // Insert unsubscribe (ignore duplicates)
  try {
    await db.insert(unsubscribes).values({ storeId, email }).onConflictDoNothing();
  } catch {
    // Ignore duplicate constraint errors
  }

  // Update the email request status
  await db
    .update(emailRequests)
    .set({ status: "unsubscribed" })
    .where(eq(emailRequests.token, token));

  return htmlResponse(
    "Unsubscribed",
    "You have been unsubscribed from review request emails. You will no longer receive review requests from this store.",
    true,
  );
}

function htmlResponse(title: string, message: string, success: boolean) {
  const iconColor = success ? "#22c55e" : "#dc2626";
  const iconPath = success
    ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
    : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Frankly</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      background: #fff;
      border-radius: 12px;
      padding: 32px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
    }
    .icon { margin-bottom: 16px; }
    h1 { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 8px; }
    p { font-size: 15px; color: #6b7280; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${iconPath}
      </svg>
    </div>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
