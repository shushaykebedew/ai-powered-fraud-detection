"use client";

import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { Loader2 } from "lucide-react";

function subscribeHydration(callback: () => void) {
  const unsub = useAuthStore.persist.onFinishHydration(callback);
  return unsub;
}

function getHydrated() {
  return useAuthStore.persist.hasHydrated();
}

function getHydratedServer() {
  return false;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hydrated = useSyncExternalStore(subscribeHydration, getHydrated, getHydratedServer);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login");
    }
  }, [hydrated, token, router]);

  if (!hydrated || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[color:var(--color-text-muted)]" />
      </div>
    );
  }

  return <>{children}</>;
}
