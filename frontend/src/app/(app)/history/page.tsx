"use client";

import { Badge, Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { formatCurrency, formatDateTime, formatPercent } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { History as HistoryIcon, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const PAGE_SIZE = 15;

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const [fraudOnly, setFraudOnly] = useState(false);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["history", page, fraudOnly],
    queryFn: () => api.history(page, PAGE_SIZE, fraudOnly),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold">Prediction history</h1>
          <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
            Every transaction you&apos;ve scored, most recent first.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-[color:var(--color-text-secondary)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={fraudOnly}
            onChange={(e) => {
              setFraudOnly(e.target.checked);
              setPage(1);
            }}
            className="accent-[color:var(--color-signal-safe)]"
          />
          Fraud flags only
        </label>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-[color:var(--color-text-muted)]" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title={fraudOnly ? "No fraud flags yet" : "No predictions yet"}
          description={
            fraudOnly
              ? "Nothing has been flagged as fraud so far — that's a good sign."
              : "Score a transaction to start building history here."
          }
          actionHref="/predict"
          actionLabel="Score a transaction"
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--color-panel-border)] text-left text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Risk score</th>
                  <th className="px-5 py-3 font-medium">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[color:var(--color-panel-border-soft)] last:border-0 hover:bg-[color:var(--color-bg-raised)] transition-colors"
                  >
                    <td className="px-5 py-3 whitespace-nowrap text-[color:var(--color-text-secondary)]">
                      {formatDateTime(item.created_at)}
                    </td>
                    <td className="px-5 py-3 font-tabular">{item.transaction_input.type}</td>
                    <td className="px-5 py-3 font-tabular">
                      {formatCurrency(item.transaction_input.amount)}
                    </td>
                    <td className="px-5 py-3 font-tabular">{formatPercent(item.risk_score, 1)}</td>
                    <td className="px-5 py-3">
                      <Badge color={item.is_fraud_predicted ? "danger" : "safe"}>
                        {item.is_fraud_predicted ? "Fraud flagged" : "Legitimate"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-[color:var(--color-panel-border)]">
            <p className="text-xs text-[color:var(--color-text-muted)]">
              Page {page} of {totalPages} · {data.total} total
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-3.5" />
                Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
