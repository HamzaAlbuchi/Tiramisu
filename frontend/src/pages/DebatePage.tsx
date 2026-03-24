import { useCallback, useState } from "react";
import { DebateForm, type DebateFormValues } from "@/components/DebateForm";
import { EvaluationCard } from "@/components/EvaluationCard";
import { MetricsPanel } from "@/components/MetricsPanel";
import { TurnTimeline } from "@/components/TurnTimeline";
import { runDebate } from "@/services/api";
import type { DebateResponse } from "@/types/debate";

export function DebatePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DebateResponse | null>(null);

  const onSubmit = useCallback(async (v: DebateFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const data = await runDebate({
        topic: v.topic.trim(),
        rounds: v.rounds,
        style: v.style,
      });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const exportJson = () => {
    if (!result) {
      return;
    }
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "debate-result.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-white/10 pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Tiramisu</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
          Model evaluation dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist">
          Structured verdict, rubric metrics, and transcript from a stub run (GPT-4o vs Claude Sonnet). API:{" "}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-slate-400">POST /api/debate</code>
        </p>
      </header>

      <div className="flex flex-col gap-8">
        {result ? (
          <>
            <EvaluationCard
              variant="hero"
              evaluation={result.evaluation}
              topic={result.topic}
              styleLabel={result.style}
              exchangeCount={result.exchangeCount}
              rounds={result.rounds}
              onExportJson={exportJson}
            />
            <MetricsPanel models={result.models} metrics={result.evaluation.metrics} />
            <TurnTimeline turns={result.turns} models={result.models} tone="secondary" autoRevealMs={0} />
            <section className="rounded-xl border border-white/[0.06] bg-ink-950/30 px-4 py-4 md:px-5 md:py-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">New evaluation run</h2>
              <p className="mt-1 text-xs text-mist/90">Adjust parameters and submit to replace the view above.</p>
              {error && (
                <p className="mt-3 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200/95">
                  {error}
                </p>
              )}
              <div className="mt-4">
                <DebateForm loading={loading} onSubmit={onSubmit} variant="compact" />
              </div>
            </section>
          </>
        ) : (
          <>
            <section
              aria-label="Verdict placeholder"
              className="rounded-2xl border border-dashed border-white/10 bg-ink-900/20 px-6 py-14 text-center md:py-16"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Verdict</p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-mist">
                No evaluation loaded. Run a subject below to populate verdict, metrics, and transcript.
              </p>
            </section>
            <section className="rounded-xl border border-white/[0.06] bg-ink-950/30 px-4 py-4 md:px-5 md:py-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Parameters</h2>
              {error && (
                <p className="mt-3 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200/95">
                  {error}
                </p>
              )}
              <div className="mt-4">
                <DebateForm loading={loading} onSubmit={onSubmit} variant="compact" />
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
