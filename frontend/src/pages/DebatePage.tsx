import { useCallback, useState } from "react";
import { DebateForm, type DebateFormValues } from "@/components/DebateForm";
import { EvaluationCard } from "@/components/EvaluationCard";
import { MetricsPanel } from "@/components/MetricsPanel";
import { TurnTimeline } from "@/components/TurnTimeline";
import { runDebate } from "@/services/api";
import type { DebateResponse } from "@/types/debate";

const SHELL = "mx-auto w-full max-w-[1400px] px-4 sm:px-6";

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
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/92 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div className={`${SHELL} py-3 md:py-4`}>
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Tiramisu</p>
              <h1 className="font-display text-lg font-semibold tracking-tight text-slate-100 md:text-xl">
                Model evaluation dashboard
              </h1>
              <p className="mt-1 hidden text-xs text-mist sm:block">
                Stub run · GPT-4o vs Claude Sonnet ·{" "}
                <code className="rounded bg-white/[0.06] px-1 font-mono text-[10px] text-slate-400">POST /api/debate</code>
              </p>
            </div>
            {result ? (
              <button
                type="button"
                onClick={exportJson}
                className="shrink-0 rounded-lg border border-white/15 bg-white/[0.05] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-white/25 hover:bg-white/[0.08]"
              >
                Export JSON
              </button>
            ) : null}
          </div>

          {error ? (
            <p className="mt-3 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200/95">{error}</p>
          ) : null}

          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <DebateForm loading={loading} onSubmit={onSubmit} variant="compact" className="max-w-5xl" />
          </div>
        </div>
      </header>

      <main className={`${SHELL} py-6 lg:py-8`}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:items-start lg:gap-10">
          <div className="min-w-0 space-y-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Debate transcript</h2>
            {result ? (
              <TurnTimeline turns={result.turns} models={result.models} tone="secondary" autoRevealMs={0} />
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-ink-900/20 px-5 py-16 text-center md:py-20">
                <p className="text-sm text-mist">Run an evaluation from the header to load the exchange here.</p>
              </div>
            )}
          </div>

          <aside className="min-w-0 lg:sticky lg:top-36 lg:max-h-[calc(100dvh-10rem)] lg:space-y-6 lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 lg:sr-only">
              Verdict &amp; metrics
            </h2>
            {result ? (
              <>
                <EvaluationCard
                  variant="hero"
                  evaluation={result.evaluation}
                  topic={result.topic}
                  styleLabel={result.style}
                  exchangeCount={result.exchangeCount}
                  rounds={result.rounds}
                />
                <MetricsPanel models={result.models} metrics={result.evaluation.metrics} />
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-ink-900/20 px-5 py-12 text-center lg:py-16">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Verdict</p>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-mist">
                  Results stay pinned here while you scroll the transcript.
                </p>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
