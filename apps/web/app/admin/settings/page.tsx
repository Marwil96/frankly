"use client";

import { useEffect, useState } from "react";
import { Window } from "@/components/win95/Window";
import { Input } from "@/components/win95/Input";
import { Button } from "@/components/win95/Button";
import { StatusBar } from "@/components/win95/StatusBar";

interface Store {
  id: string;
  name: string;
  domain: string | null;
  apiKey: string;
  moderationEnabled: boolean;
  emailDelayDays: number;
  emailEnabled: boolean;
  locale: string;
  centraWebhookSecret: string | null;
  createdAt: string;
}

export default function AdminSettingsPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [moderationEnabled, setModerationEnabled] = useState(true);
  const [emailDelayDays, setEmailDelayDays] = useState(14);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [locale, setLocale] = useState("en");
  const [centraWebhookSecret, setCentraWebhookSecret] = useState("");
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [webhookUrlCopied, setWebhookUrlCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/stores", {
          credentials: "include",
        });
        const data = await res.json();
        const s = data.stores?.[0];
        if (s) {
          setStore(s);
          setName(s.name);
          setDomain(s.domain || "");
          setModerationEnabled(s.moderationEnabled);
          setEmailDelayDays(s.emailDelayDays ?? 14);
          setEmailEnabled(s.emailEnabled ?? true);
          setLocale(s.locale ?? "en");
          setCentraWebhookSecret(s.centraWebhookSecret || "");
        }
      } catch {
        // handled by auth
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!store) return;
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/stores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: store.id,
          name,
          domain: domain || null,
          moderationEnabled,
          emailDelayDays,
          emailEnabled,
          locale,
          centraWebhookSecret: centraWebhookSecret || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStore(data.store);
        setMessage("Settings saved successfully.");
      } else {
        setMessage("Failed to save settings.");
      }
    } catch {
      setMessage("Network error.");
    } finally {
      setSaving(false);
    }
  }

  function handleCopyApiKey() {
    if (!store) return;
    navigator.clipboard.writeText(store.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCopyWebhookUrl() {
    if (!store) return;
    const url = `https://frankly.dev/api/webhooks/centra?store=${store.id}`;
    navigator.clipboard.writeText(url);
    setWebhookUrlCopied(true);
    setTimeout(() => setWebhookUrlCopied(false), 2000);
  }

  if (loading) {
    return (
      <Window title="Settings">
        <p className="text-[11px]">Loading...</p>
      </Window>
    );
  }

  if (!store) {
    return (
      <Window title="Settings">
        <p className="text-[11px]">No store found. Create a store first.</p>
      </Window>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Window title="Store Properties" statusBar={`Store ID: ${store.id}`}>
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <div className="shadow-win95-sunken bg-white p-3">
            <div className="font-bold text-[11px] mb-2 border-b border-win95-dark pb-1">
              General
            </div>
            <div className="flex flex-col gap-2">
              <Input
                label="Store Name:"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Domain:"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. mystore.com"
              />
              <Input
                label="Locale:"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                placeholder="e.g. en, sv"
              />
            </div>
          </div>

          <div className="shadow-win95-sunken bg-white p-3">
            <div className="font-bold text-[11px] mb-2 border-b border-win95-dark pb-1">
              Moderation
            </div>
            <label className="flex items-center gap-2 text-[11px] cursor-pointer">
              <input
                type="checkbox"
                checked={moderationEnabled}
                onChange={(e) => setModerationEnabled(e.target.checked)}
                className="accent-win95-blue"
              />
              Enable review moderation (reviews require approval before publishing)
            </label>
          </div>

          <div className="shadow-win95-sunken bg-white p-3">
            <div className="font-bold text-[11px] mb-2 border-b border-win95-dark pb-1">
              Email Settings
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="accent-win95-blue"
                />
                Enable review request emails
              </label>
              <Input
                label="Email delay (days):"
                type="number"
                value={String(emailDelayDays)}
                onChange={(e) => setEmailDelayDays(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="shadow-win95-sunken bg-white p-3">
            <div className="font-bold text-[11px] mb-2 border-b border-win95-dark pb-1">
              Centra Integration
            </div>
            <div className="flex flex-col gap-2">
              <div>
                <label className="text-[11px] font-bold block mb-1">
                  Webhook URL:
                </label>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      value={`https://frankly.dev/api/webhooks/centra?store=${store.id}`}
                      readOnly
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCopyWebhookUrl}
                  >
                    {webhookUrlCopied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold block mb-1">
                  Webhook Secret:
                </label>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      type={showWebhookSecret ? "text" : "password"}
                      value={centraWebhookSecret}
                      onChange={(e) => setCentraWebhookSecret(e.target.value)}
                      placeholder="Enter Centra webhook secret"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  >
                    {showWebhookSecret ? "Hide" : "Show"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="shadow-win95-sunken bg-white p-3">
            <div className="font-bold text-[11px] mb-2 border-b border-win95-dark pb-1">
              API Key
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input label="API Key:" value={store.apiKey} readOnly />
              </div>
              <Button type="button" size="sm" onClick={handleCopyApiKey}>
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {message && (
            <div className="text-[11px] shadow-win95-sunken px-2 py-1 bg-white">
              {message}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Apply"}
            </Button>
          </div>
        </form>
      </Window>

      <StatusBar
        items={[
          `Store: ${store.name}`,
          store.moderationEnabled ? "Moderation: ON" : "Moderation: OFF",
          "Ready",
        ]}
      />
    </div>
  );
}
