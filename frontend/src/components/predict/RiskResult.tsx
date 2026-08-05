import { Badge, Card } from "@/components/ui/primitives";
import type { PredictionResult } from "@/lib/types";
import { featureLabel, formatPercent, riskLevelConfig } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, ShieldAlert, ShieldCheck } from "lucide-react";

export function RiskResult({ result }: { result: PredictionResult }) {
  const cfg = riskLevelConfig[result.risk_level];
  const pct = Math.round(result.risk_score * 100);

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
              Fraud risk score
            </p>
            <p
              className="mt-1 font-display text-5xl font-semibold font-tabular"
              style={{ color: cfg.color }}
            >
              {formatPercent(result.risk_score, 1)}
            </p>
          </div>
          <Badge color={result.risk_level === "high" ? "danger" : result.risk_level === "medium" ? "warn" : "safe"}>
            {result.is_fraud_predicted ? (
              <ShieldAlert className="size-3.5" />
            ) : (
              <ShieldCheck className="size-3.5" />
            )}
            {cfg.label}
          </Badge>
        </div>

        {/* score bar */}
        <div className="mt-5 h-2 rounded-full bg-[color:var(--color-bg-raised)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: cfg.color }}
          />
        </div>

        <p className="mt-4 text-sm text-[color:var(--color-text-secondary)]">
          {result.is_fraud_predicted
            ? "This transaction matches patterns associated with fraud and should be reviewed before it settles."
            : "This transaction's risk score is below the model's decision threshold. No action needed."}
        </p>
      </Card>

      <Card className="p-6">
        <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)] mb-4">
          Why this score — top contributing factors
        </p>
        <div className="space-y-3">
          {result.top_factors.map((f) => {
            const increases = f.direction === "increases_risk";
            return (
              <div key={f.feature} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {increases ? (
                    <ArrowUpRight className="size-4 shrink-0 text-[color:var(--color-signal-danger)]" />
                  ) : (
                    <ArrowDownRight className="size-4 shrink-0 text-[color:var(--color-signal-safe)]" />
                  )}
                  <span className="text-sm truncate">{featureLabel(f.feature)}</span>
                </div>
                <span
                  className="text-xs font-tabular shrink-0"
                  style={{
                    color: increases ? "var(--color-signal-danger)" : "var(--color-signal-safe)",
                  }}
                >
                  {increases ? "+" : ""}
                  {f.contribution.toFixed(3)}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-[color:var(--color-text-muted)]">
          Factors are SHAP contributions from the model (v{result.model_version}) — positive
          values pushed the score toward fraud, negative values pushed it toward legitimate.
        </p>
      </Card>
    </div>
  );
}
