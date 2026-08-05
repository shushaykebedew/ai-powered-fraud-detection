"use client";

import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/primitives";
import { RiskResult } from "@/components/predict/RiskResult";
import { api, ApiError } from "@/lib/api";
import type { PredictionResult, TransactionInput, TransactionType } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const TX_TYPES: TransactionType[] = ["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"];

const schema = z.object({
  step: z.coerce.number().int().min(0),
  type: z.enum(["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"]),
  amount: z.coerce.number().min(0),
  name_orig: z.string().min(2, "Must start with C or M").max(64),
  oldbalance_org: z.coerce.number().min(0),
  newbalance_orig: z.coerce.number().min(0),
  name_dest: z.string().min(2, "Must start with C or M").max(64),
  oldbalance_dest: z.coerce.number().min(0),
  newbalance_dest: z.coerce.number().min(0),
});
type FormValues = z.infer<typeof schema>;

const EXAMPLES: Record<string, FormValues> = {
  suspicious: {
    step: 12,
    type: "TRANSFER",
    amount: 181000,
    name_orig: "C1231006815",
    oldbalance_org: 181000,
    newbalance_orig: 0,
    name_dest: "C1666544295",
    oldbalance_dest: 0,
    newbalance_dest: 0,
  },
  ordinary: {
    step: 45,
    type: "PAYMENT",
    amount: 4820.5,
    name_orig: "C900129384",
    oldbalance_org: 25400,
    newbalance_orig: 20579.5,
    name_dest: "M100004892",
    oldbalance_dest: 0,
    newbalance_dest: 0,
  },
};

export default function PredictPage() {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EXAMPLES.suspicious,
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const res = await api.predict(values as TransactionInput);
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Prediction failed. Try again.");
      setResult(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold">Score a transaction</h1>
          <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
            Enter transaction details to get a real-time fraud risk score.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => reset(EXAMPLES.suspicious)}
          >
            <Sparkles className="size-3.5" />
            Suspicious example
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => reset(EXAMPLES.ordinary)}
          >
            Ordinary example
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-xl border border-[color:var(--color-panel-border)] bg-[color:var(--color-panel)] p-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="step">Step (hours since start)</Label>
              <Input id="step" type="number" {...register("step")} />
            </div>
            <div>
              <Label htmlFor="type">Transaction type</Label>
              <Select id="type" {...register("type")}>
                {TX_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" step="0.01" {...register("amount")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name_orig">Origin account</Label>
              <Input id="name_orig" placeholder="C1231006815" {...register("name_orig")} />
            </div>
            <div>
              <Label htmlFor="name_dest">Destination account</Label>
              <Input id="name_dest" placeholder="C1666544295 or M100004892" {...register("name_dest")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="oldbalance_org">Origin balance (before)</Label>
              <Input id="oldbalance_org" type="number" step="0.01" {...register("oldbalance_org")} />
            </div>
            <div>
              <Label htmlFor="newbalance_orig">Origin balance (after)</Label>
              <Input id="newbalance_orig" type="number" step="0.01" {...register("newbalance_orig")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="oldbalance_dest">Destination balance (before)</Label>
              <Input id="oldbalance_dest" type="number" step="0.01" {...register("oldbalance_dest")} />
            </div>
            <div>
              <Label htmlFor="newbalance_dest">Destination balance (after)</Label>
              <Input id="newbalance_dest" type="number" step="0.01" {...register("newbalance_dest")} />
            </div>
          </div>

          {Object.keys(errors).length > 0 && (
            <p className="text-xs text-[color:var(--color-signal-danger)]">
              Check the highlighted fields — account identifiers must start with C (customer) or M (merchant).
            </p>
          )}
          {error && <p className="text-xs text-[color:var(--color-signal-danger)]">{error}</p>}

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Run fraud check
          </Button>
        </form>

        <div>
          {result ? (
            <RiskResult result={result} />
          ) : (
            <div className="rounded-xl border border-dashed border-[color:var(--color-panel-border)] p-10 text-center text-sm text-[color:var(--color-text-muted)]">
              Results will appear here once you run a fraud check.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
