"use client";

import { Card } from "@/components/ui/primitives";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api";
import { formatPercent } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Target, TrendingUp, Percent, Database, Loader2 } from "lucide-react";

export default function ModelPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["model-performance"],
    queryFn: () => api.modelPerformance(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Model performance</h1>
        <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
          Offline evaluation metrics captured when the model was last trained.
        </p>
      </div>

      {isLoading || !data ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-[color:var(--color-text-muted)]" />
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="ROC-AUC"
              value={data.test_metrics.roc_auc.toFixed(3)}
              icon={TrendingUp}
              tone="safe"
            />
            <StatCard
              label="PR-AUC"
              value={data.test_metrics.pr_auc.toFixed(3)}
              icon={Target}
              tone="safe"
            />
            <StatCard
              label="F1 (tuned threshold)"
              value={data.test_metrics.f1_at_threshold.toFixed(3)}
              sub={`vs. ${data.test_metrics.f1_at_default.toFixed(3)} at default 0.5`}
              icon={Percent}
            />
            <StatCard
              label="Decision threshold"
              value={data.decision_threshold.toFixed(2)}
              sub="Tuned on validation F1"
              icon={Target}
            />
          </div>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)] mb-4">
              Training details
            </p>
            <dl className="grid sm:grid-cols-3 gap-6 text-sm">
              <div>
                <dt className="text-[color:var(--color-text-muted)]">Model type</dt>
                <dd className="mt-1 font-tabular">{data.model_type}</dd>
              </div>
              <div>
                <dt className="text-[color:var(--color-text-muted)]">Model version</dt>
                <dd className="mt-1 font-tabular">{data.model_version}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Database className="size-3.5 text-[color:var(--color-text-muted)]" />
                <div>
                  <dt className="text-[color:var(--color-text-muted)]">Training rows</dt>
                  <dd className="mt-1 font-tabular">{data.training_rows.toLocaleString()}</dd>
                </div>
              </div>
            </dl>
            <p className="mt-6 text-xs text-[color:var(--color-text-muted)]">
              Training fraud rate: {formatPercent(data.fraud_rate_train, 3)}. Full methodology,
              feature engineering, and model comparison are documented in the training notebook.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
