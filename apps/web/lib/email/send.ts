import { Resend } from "resend";
import { ReviewRequestEmail } from "./templates/review-request";
import { t } from "@/lib/i18n/emails";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReviewRequestEmail(params: {
  to: string;
  customerName: string;
  productName: string;
  productImage: string | null;
  token: string;
  locale: string;
  isReminder?: boolean;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const subjectKey = params.isReminder ? "reminderSubject" : "subject";
  const subject = t(params.locale, subjectKey, {
    productName: params.productName,
  });

  await resend.emails.send({
    from: "Frankly Reviews <reviews@frankly.dev>",
    to: params.to,
    subject,
    react: ReviewRequestEmail({
      appUrl,
      token: params.token,
      customerName: params.customerName,
      productName: params.productName,
      productImage: params.productImage,
      strings: {
        greeting: t(params.locale, "greeting", { name: params.customerName }),
        body: t(
          params.locale,
          params.isReminder ? "reminderBody" : "body",
          { productName: params.productName },
        ),
        cta: t(params.locale, "cta"),
        unsubscribe: t(params.locale, "unsubscribe"),
      },
    }),
  });
}
