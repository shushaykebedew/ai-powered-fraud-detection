import { cn } from "@/lib/utils";
import type { HTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[color:var(--color-panel-border)] bg-[color:var(--color-panel)]",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "block text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)] mb-1.5",
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-[color:var(--color-panel-border)] bg-[color:var(--color-bg-raised)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] placeholder:text-[color:var(--color-text-muted)] outline-none focus:border-[color:var(--color-primary)] transition-colors",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-[color:var(--color-panel-border)] bg-[color:var(--color-bg-raised)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-primary)] transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 text-xs text-[color:var(--color-signal-danger)]">{children}</p>
  );
}

export function Badge({
  className,
  color = "safe",
  children,
}: {
  className?: string;
  color?: "safe" | "warn" | "danger" | "neutral";
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    safe: "bg-[color:var(--color-signal-safe-dim)] text-[color:var(--color-signal-safe)]",
    warn: "bg-[color:var(--color-signal-warn-dim)] text-[color:var(--color-signal-warn)]",
    danger: "bg-[color:var(--color-signal-danger-dim)] text-[color:var(--color-signal-danger)]",
    neutral: "bg-[color:var(--color-bg-raised)] text-[color:var(--color-text-secondary)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        styles[color],
        className
      )}
    >
      {children}
    </span>
  );
}
