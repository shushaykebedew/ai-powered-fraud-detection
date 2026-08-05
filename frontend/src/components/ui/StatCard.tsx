import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  tone?: "neutral" | "safe" | "warn" | "danger";
}) {
  const toneColor: Record<string, string> = {
    neutral: "text-[color:var(--color-text-primary)]",
    safe: "text-[color:var(--color-signal-safe)]",
    warn: "text-[color:var(--color-signal-warn)]",
    danger: "text-[color:var(--color-signal-danger)]",
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
          {label}
        </p>
        <Icon className={cn("size-4", toneColor[tone])} />
      </div>
      <p className={cn("mt-2 font-display text-2xl font-semibold font-tabular", toneColor[tone])}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">{sub}</p>}
    </Card>
  );
}
