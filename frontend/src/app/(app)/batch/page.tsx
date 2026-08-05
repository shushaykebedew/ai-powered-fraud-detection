"use client";

import { Badge, Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { api, ApiError } from "@/lib/api";
import { formatPercent } from "@/lib/utils";
import type { BatchPredictionResponse } from "@/lib/types";
import {
  FileUp,
  Loader2,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";

const SAMPLE_CSV =
  "step,type,amount,name_orig,oldbalance_org,newbalance_orig,name_dest,oldbalance_dest,newbalance_dest\n" +
  "12,TRANSFER,181000,C1231006815,181000,0,C1666544295,0,0\n" +
  "45,PAYMENT,4820.50,C900129384,25400,20579.50,M100004892,0,0\n";

export default function BatchPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BatchPredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.predictBatch(file);
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed. Try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function downloadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Batch upload</h1>
        <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
          Score up to 1,000 transactions at once from a CSV file.
        </p>
      </div>

      <Card className="p-6">
        <label
          htmlFor="csv-input"
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[color:var(--color-panel-border)] py-10 cursor-pointer hover:border-[color:var(--color-signal-safe)] transition-colors"
        >
          <FileUp className="size-6 text-[color:var(--color-text-muted)]" />
          <p className="text-sm">
            {file ? (
              <span className="font-medium">{file.name}</span>
            ) : (
              <>
                <span className="text-[color:var(--color-signal-safe)]">Click to choose</span> a
                CSV file, or drag one here
              </>
            )}
          </p>
          <input
            id="csv-input"
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setResult(null);
              setError(null);
            }}
          />
        </label>

        <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
          <button
            type="button"
            onClick={downloadSample}
            className="text-xs text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-signal-safe)] hover:underline"
          >
            Download a sample CSV
          </button>
          <Button onClick={handleUpload} disabled={!file} loading={loading}>
            <Upload className="size-4" />
            Score batch
          </Button>
        </div>

        {error && (
          <p className="mt-3 text-xs text-[color:var(--color-signal-danger)]">{error}</p>
        )}
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-[color:var(--color-text-muted)]" />
        </div>
      )}

      {result && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Rows uploaded" value={result.total_rows.toString()} icon={FileUp} />
            <StatCard
              label="Successfully scored"
              value={result.scored.toString()}
              icon={CheckCircle2}
              tone="safe"
            />
            <StatCard
              label="Failed rows"
              value={result.failed.toString()}
              icon={AlertTriangle}
              tone={result.failed > 0 ? "warn" : "neutral"}
            />
            <StatCard
              label="Flagged as fraud"
              value={result.fraud_flagged.toString()}
              icon={ShieldAlert}
              tone={result.fraud_flagged > 0 ? "danger" : "safe"}
            />
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--color-panel-border)] text-left text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                    <th className="px-5 py-3 font-medium">Row</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Risk score</th>
                    <th className="px-5 py-3 font-medium">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((r) => (
                    <tr
                      key={r.row}
                      className="border-b border-[color:var(--color-panel-border-soft)] last:border-0"
                    >
                      <td className="px-5 py-3 font-tabular">{r.row}</td>
                      <td className="px-5 py-3">
                        {r.status === "scored" ? (
                          <Badge color={r.is_fraud_predicted ? "danger" : "safe"}>
                            {r.is_fraud_predicted ? "Fraud flagged" : "Legitimate"}
                          </Badge>
                        ) : (
                          <Badge color="neutral">Error</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3 font-tabular">
                        {r.risk_score != null ? formatPercent(r.risk_score, 1) : "—"}
                      </td>
                      <td className="px-5 py-3 text-[color:var(--color-text-secondary)]">
                        {r.error ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {!result && !loading && (
        <EmptyState
          icon={FileUp}
          title="No batch scored yet"
          description="Upload a CSV with the required columns to score many transactions at once — download the sample above to see the expected format."
        />
      )}
    </div>
  );
}
