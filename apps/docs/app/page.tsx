import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 800, margin: "80px auto", padding: "0 24px", fontFamily: "system-ui" }}>
      <h1>Frankly Documentation</h1>
      <p>Product reviews for headless e-commerce.</p>
      <Link href="/docs" style={{ color: "#2563eb" }}>Go to docs →</Link>
    </main>
  );
}
