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
    setResult(null);
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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-glow">Tiramisu</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          Model debate lab
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-mist">
          Stub GPT-4o vs Claude Sonnet with heuristic judge output. Backend:{" "}
          <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-slate-300">POST /api/debate</code>
          . Dev uses Vite proxy; production set{" "}
          <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-slate-300">VITE_API_BASE_URL</code>.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
        <aside className="h-fit rounded-2xl border border-white/10 bg-ink-800/30 p-6 shadow-panel backdrop-blur">
          <DebateForm loading={loading} onSubmit={onSubmit} />
          {error && (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}
        </aside>

        <main className="space-y-6">
          {result && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-ink-800/80 to-ink-900/80 px-5 py-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-mist">Resolved topic</p>
                  <p className="mt-1 font-medium text-slate-100">{result.topic}</p>
                  <p className="mt-1 text-xs text-mist">
                    Style <span className="text-slate-300">{result.style}</span> · {result.exchangeCount}{" "}
                    messages · requested rounds {result.rounds}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportJson}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
                >
                  Export JSON
                </button>
              </div>
              <TurnTimeline turns={result.turns} models={result.models} autoRevealMs={420} />
              <div className="grid gap-6 lg:grid-cols-2">
                <MetricsPanel models={result.models} metrics={result.evaluation.metrics} />
                <EvaluationCard evaluation={result.evaluation} />
              </div>
            </>
          )}
          {!result && !loading && (
            <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-ink-900/20 p-8 text-center text-sm text-mist">
              Run a debate to see transcript, rubric bars, and judge narrative.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
