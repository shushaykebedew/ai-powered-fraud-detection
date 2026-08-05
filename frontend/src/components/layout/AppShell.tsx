"use client";

import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ScanSearch,
  History,
  Gauge,
  LogOut,
  ShieldHalf,
  Menu,
  X,
  FileUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/predict", label: "Score a transaction", icon: ScanSearch },
  { href: "/batch", label: "Batch upload", icon: FileUp },
  { href: "/history", label: "Prediction history", icon: History },
  { href: "/model", label: "Model performance", icon: Gauge },
];

const ADMIN_NAV_ITEM = { href: "/admin", label: "Admin", icon: Users };

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex">
      {/* mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 h-14 bg-[color:var(--color-bg-raised)] border-b border-[color:var(--color-panel-border)]">
        <div className="flex items-center gap-2">
          <ShieldHalf className="size-5 text-[color:var(--color-signal-safe)]" />
          <span className="font-display font-semibold">Sentinel</span>
        </div>
        <button onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* sidebar */}
      <aside
        className={cn(
          "fixed md:static z-20 top-14 md:top-0 bottom-0 left-0 w-64 shrink-0 border-r border-[color:var(--color-panel-border)] bg-[color:var(--color-bg-raised)] flex flex-col transition-transform md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="hidden md:flex items-center gap-2 px-6 h-16 border-b border-[color:var(--color-panel-border)]">
          <ShieldHalf className="size-5 text-[color:var(--color-signal-safe)]" />
          <span className="font-display font-semibold text-lg">Sentinel</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {[...NAV_ITEMS, ...(user?.role === "admin" ? [ADMIN_NAV_ITEM] : [])].map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-[color:var(--color-signal-safe-dim)] text-[color:var(--color-signal-safe)] font-medium"
                    : "text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-panel)]"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[color:var(--color-panel-border)]">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.full_name}</p>
              <p className="text-xs text-[color:var(--color-text-muted)] truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="p-2 rounded-md text-[color:var(--color-text-muted)] hover:text-[color:var(--color-signal-danger)] hover:bg-[color:var(--color-panel)] transition-colors"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/50 md:hidden top-14"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
