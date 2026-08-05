"use client";

import { RiskPulse } from "@/components/charts/RiskPulse";
import { Card } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api";
import { formatPercent } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function DashboardPage() {
  const summaryQuery = useQuery({
    queryKey: ["summary"],
    queryFn: () => api.summary(30),
  });
  const historyQuery = useQuery({
    queryKey: ["history", "recent"],
    queryFn: () => api.history(1, 20),
  });

  const isLoading = summaryQuery.isLoading || historyQuery.isLoading;
  const summary = summaryQuery.data;
  const recent = historyQuery.data?.items ?? [];

  const pulsePoints = [...recent]
    .reverse()
    .map((p) => ({ risk_score: p.risk_score, is_fraud_predicted: p.is_fraud_predicted }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Overview</h1>
        <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
          Last 30 days of transaction scoring activity.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-[color:var(--color-text-muted)]" />
        </div>
      ) : !summary || summary.total_predictions === 0 ? (
        <EmptyState
          icon={ScanSearch}
          title="No transactions scored yet"
          description="Score your first transaction to see risk trends, fraud rate, and history appear here."
          actionHref="/predict"
          actionLabel="Score a transaction"
        />
      ) : (
        <>
          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)] mb-3">
              Recent transaction stream
            </p>
            <RiskPulse points={pulsePoints} />
          </Card>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Transactions scored"
              value={summary.total_predictions.toLocaleString()}
              sub={`Last ${summary.period_days} days`}
              icon={Activity}
            />
            <StatCard
              label="Flagged as fraud"
              value={summary.fraud_flagged.toLocaleString()}
              icon={ShieldAlert}
              tone={summary.fraud_flagged > 0 ? "danger" : "safe"}
            />
            <StatCard
              label="Fraud rate"
              value={formatPercent(summary.fraud_rate, 2)}
              icon={ShieldCheck}
              tone={summary.fraud_rate > 0.05 ? "warn" : "safe"}
            />
            <StatCard
              label="Average risk score"
              value={formatPercent(summary.average_risk_score, 1)}
              icon={Activity}
            />
          </div>

          {summary.daily_breakdown.length > 1 && (
            <Card className="p-5">
              <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)] mb-4">
                Daily volume
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary.daily_breakdown}>
                    <defs>
                      <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-signal-safe)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--color-signal-safe)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-panel-border)" vertical={false} />
                    <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} />
                    <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-bg-raised)",
                        border: "1px solid var(--color-panel-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="var(--color-signal-safe)"
                      fill="url(#volumeFill)"
                      strokeWidth={2}
                      name="Transactions"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          <div className="flex justify-end">
            <Link
              href="/predict"
              className="text-sm text-[color:var(--color-signal-safe)] hover:underline"
            >
              Score another transaction →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
