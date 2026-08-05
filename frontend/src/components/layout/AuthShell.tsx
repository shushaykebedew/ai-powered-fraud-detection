"use client";

import { RiskPulse } from "@/components/charts/RiskPulse";
import { ShieldHalf } from "lucide-react";
import { useState, useEffect } from "react";

function generateDemoPulse() {
  return Array.from({ length: 26 }, () => {
    const isFraud = Math.random() < 0.08;
    return {
      risk_score: isFraud ? 0.7 + Math.random() * 0.3 : Math.random() * 0.15,
      is_fraud_predicted: isFraud,
    };
  });
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const [pulse, setPulse] = useState<Array<{ risk_score: number; is_fraud_predicted: boolean }>>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setPulse(generateDemoPulse());
  }, []);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[color:var(--color-bg-raised)] border-r border-[color:var(--color-panel-border)] relative overflow-hidden">
        <div className="flex items-center gap-2">
          <ShieldHalf className="size-6 text-[color:var(--color-signal-safe)]" />
          <span className="font-display font-semibold text-xl">Sentinel</span>
        </div>

        <div className="space-y-8">
          <div>
            <p className="font-display text-4xl leading-tight font-semibold max-w-md">
              Every transaction leaves a signal.
            </p>
            <p className="mt-4 text-[color:var(--color-text-secondary)] max-w-sm">
              Sentinel scores transactions in real time and explains exactly
              why one was flagged — not just a probability, but the factors
              behind it.
            </p>
          </div>
          <div className="rounded-xl border border-[color:var(--color-panel-border)] bg-[color:var(--color-panel)] p-5">
            <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)] mb-3">
              Live transaction stream
            </p>
            {isMounted ? <RiskPulse points={pulse} height={64} /> : <div className="h-16 bg-[color:var(--color-bg-raised)] animate-pulse rounded" />}
          </div>
        </div>

        <p className="text-xs text-[color:var(--color-text-muted)]">
          Final-year AI project — fraud detection platform
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <ShieldHalf className="size-6 text-[color:var(--color-signal-safe)]" />
            <span className="font-display font-semibold text-xl">Sentinel</span>
          </div>
          <h1 className="font-display text-2xl font-semibold">{title}</h1>
          <p className="mt-1.5 text-sm text-[color:var(--color-text-secondary)]">
            {subtitle}
          </p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
