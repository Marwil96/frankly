import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Frankly - Product Reviews for Headless E-commerce",
  description:
    "Collect verified reviews, boost conversions. Built for Centra and headless platforms. EU Omnibus compliant. React SDK and vanilla JS widget.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
