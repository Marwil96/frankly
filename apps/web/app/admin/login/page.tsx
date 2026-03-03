"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Window } from "@/components/win95/Window";
import { Input } from "@/components/win95/Input";
import { Button } from "@/components/win95/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        return;
      }

      router.push("/admin");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center font-[family-name:var(--font-win95)]">
      <Window title="Frankly - Administrator Login" className="w-80">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="text-[28px] leading-none">🔐</div>
            <p className="text-[11px]">
              Enter your credentials to continue.
            </p>
          </div>

          <Input
            label="Email:"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />

          <Input
            label="Password:"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <div className="text-[11px] text-red-700 bg-red-50 shadow-win95-sunken px-2 py-1">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-1">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "OK"}
            </Button>
          </div>
        </form>
      </Window>
    </div>
  );
}
