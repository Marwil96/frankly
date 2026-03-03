"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Panel } from "@/components/win95/Panel";
import { Button } from "@/components/win95/Button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/reviews", label: "Reviews", icon: "📝" },
  { href: "/admin/emails", label: "Emails", icon: "📧" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    document.cookie = "admin_token=; path=/; max-age=0";
    router.push("/admin/login");
  }

  return (
    <div className="h-screen flex text-[11px] font-[family-name:var(--font-win95)]">
      <Panel variant="raised" className="w-48 flex flex-col shrink-0 !p-0">
        <div className="bg-win95-blue text-win95-white px-3 py-2 font-bold text-[13px] tracking-wide">
          Frankly Admin
        </div>

        <nav className="flex flex-col flex-1 p-1 gap-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-2 px-2 py-1.5 text-[11px] cursor-pointer ${
                    isActive
                      ? "bg-win95-blue text-win95-white"
                      : "hover:bg-win95-blue/10"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-1 border-t border-win95-dark">
          <Button
            size="sm"
            className="w-full text-[11px]"
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </div>
      </Panel>

      <div className="flex-1 p-4 overflow-auto">{children}</div>
    </div>
  );
}
