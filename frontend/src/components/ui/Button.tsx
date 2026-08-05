import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-[color:var(--color-primary)] text-[#06140f] hover:bg-[color:var(--color-primary-hover)] font-medium",
  secondary:
    "bg-[color:var(--color-panel)] text-[color:var(--color-text-primary)] border border-[color:var(--color-panel-border)] hover:border-[color:var(--color-text-muted)]",
  ghost:
    "bg-transparent text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-panel)]",
  danger:
    "bg-[color:var(--color-signal-danger)] text-white hover:opacity-90 font-medium",
};

const sizeStyles: Record<string, string> = {
  sm: "text-sm px-3 py-1.5 rounded-md",
  md: "text-sm px-4 py-2.5 rounded-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
