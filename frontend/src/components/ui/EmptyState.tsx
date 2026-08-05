import Link from "next/link";
import { Button } from "./Button";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 rounded-xl border border-dashed border-[color:var(--color-panel-border)]">
      <div className="size-12 rounded-full bg-[color:var(--color-bg-raised)] flex items-center justify-center mb-4">
        <Icon className="size-5 text-[color:var(--color-text-muted)]" />
      </div>
      <h3 className="font-display font-semibold text-lg">{title}</h3>
      <p className="mt-1.5 text-sm text-[color:var(--color-text-secondary)] max-w-sm">
        {description}
      </p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="mt-5">
          <Button size="sm">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
