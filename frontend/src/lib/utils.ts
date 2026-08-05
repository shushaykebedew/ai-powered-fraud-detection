import { type ClassValue, clsx } from "clsx";
import type { RiskLevel } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function riskLevelFromScore(score: number, threshold: number): RiskLevel {
  if (score < threshold * 0.5) return "low";
  if (score < threshold) return "medium";
  return "high";
}

export const riskLevelConfig: Record<
  RiskLevel,
  { label: string; color: string; dim: string; text: string }
> = {
  low: {
    label: "Low risk",
    color: "var(--color-signal-safe)",
    dim: "var(--color-signal-safe-dim)",
    text: "text-[color:var(--color-signal-safe)]",
  },
  medium: {
    label: "Elevated risk",
    color: "var(--color-signal-warn)",
    dim: "var(--color-signal-warn-dim)",
    text: "text-[color:var(--color-signal-warn)]",
  },
  high: {
    label: "High risk",
    color: "var(--color-signal-danger)",
    dim: "var(--color-signal-danger-dim)",
    text: "text-[color:var(--color-signal-danger)]",
  },
};

export function featureLabel(feature: string): string {
  const labels: Record<string, string> = {
    orig_emptied: "Origin account fully drained",
    diff_new_old_balance: "Origin balance change",
    diff_new_old_destiny: "Destination balance change",
    balance_error_orig: "Origin balance inconsistency",
    balance_error_dest: "Destination balance inconsistency",
    is_merchant_dest: "Destination is a merchant",
    log_amount: "Transaction amount (log-scaled)",
    amount: "Transaction amount",
    oldbalance_org: "Origin balance before",
    newbalance_orig: "Origin balance after",
    oldbalance_dest: "Destination balance before",
    newbalance_dest: "Destination balance after",
    step_hour_of_day: "Hour of day",
    step_day: "Day of simulation",
  };
  if (labels[feature]) return labels[feature];
  for (const prefix of ["type_"]) {
    if (feature.startsWith(prefix)) {
      return `Transaction type: ${feature.slice(prefix.length)}`;
    }
  }
  return feature;
}
