import { useCallback, useEffect, useState } from "react";
import { DebateForm, type DebateFormValues } from "@/components/DebateForm";
import { EvaluationCard } from "@/components/EvaluationCard";
import { MetricsPanel } from "@/components/MetricsPanel";
import { TurnTimeline } from "@/components/TurnTimeline";
import { runDebate } from "@/services/api";
import type { DebateResponse } from "@/types/debate";

const SHELL = "mx-auto w-full max-w-[1400px] px-4 sm:px-6";

const DEFAULT_MODELS = { pro: "GPT-4o", against: "Claude Sonnet" } as const;

export function DebatePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DebateResponse | null>(null);
  const [headerCompact, setHeaderCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setHeaderCompact(window.scrollY > 72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const models = result?.models ?? DEFAULT_MODELS;

  return (
    <div className="min-h-screen pb-16">
      <header
        className={`sticky top-0 z-40 border-b border-white/[0.08] bg-[#090a0d]/92 backdrop-blur-md transition-[padding,box-shadow] duration-300 ease-out ${
          headerCompact ? "shadow-[0_1px_0_rgba(255,255,255,0.04)]" : "shadow-none"
        }`}
      >
        <div className={`${SHELL} ${headerCompact ? "py-2.5 md:py-3" : "py-4 md:py-5"} transition-[padding] duration-300`}>
          <div className="flex flex-wrap items-start justify-between gap-3 gap-y-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Tiramisu</p>
              <h1
                className={`font-display font-semibold tracking-tight text-slate-100 transition-[font-size] duration-300 ${
                  headerCompact ? "text-base md:text-lg" : "text-lg md:text-xl"
                }`}
              >
                Model evaluation
              </h1>
              {!headerCompact && (
                <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-600">
                  Structured verdict and rubric from a controlled multi-model run.
                </p>
              )}
              <div
                className={`mt-3 flex flex-wrap items-center gap-2 transition-opacity duration-300 ${
                  headerCompact ? "mt-2 opacity-95" : ""
                }`}
              >
                <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-slate-500">
                  Pro · {models.pro}
                </span>
                <span className="text-slate-700">·</span>
                <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-slate-500">
                  Against · {models.against}
                </span>
              </div>
            </div>
            {result ? (
              <button
                type="button"
                onClick={exportJson}
                className="shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-white/15 hover:text-slate-300"
              >
                Export JSON
              </button>
            ) : null}
          </div>

          {error ? (
            <p className="mt-3 rounded-md border border-red-500/20 bg-red-500/[0.08] px-3 py-2 text-sm text-red-200/90">
              {error}
            </p>
          ) : null}

          <div
            className={`border-white/[0.06] transition-[margin,padding,border-color] duration-300 ${
              headerCompact ? "mt-3 border-t border-white/[0.05] pt-3" : "mt-5 border-t pt-4"
            }`}
          >
            <DebateForm
              loading={loading}
              onSubmit={onSubmit}
              variant="compact"
              headerDense={headerCompact}
              className="max-w-4xl"
            />
          </div>
        </div>
      </header>

      <main className={`${SHELL} py-8 lg:py-10`}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] lg:items-start lg:gap-12">
          <div className="min-w-0">
            <div className="mb-4 flex items-end justify-between gap-2">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Process</h2>
                <p className="mt-1 text-sm text-slate-600">Turn-by-turn exchange</p>
              </div>
            </div>
            {result ? (
              <TurnTimeline
                turns={result.turns}
                models={result.models}
                tone="secondary"
                thinkingMs={720}
                staggerMs={480}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-20 text-center">
                <p className="text-sm text-slate-600">Run an evaluation from the header to populate this panel.</p>
              </div>
            )}
          </div>

          <aside
            className={`min-w-0 space-y-5 lg:sticky lg:max-h-[calc(100dvh-5rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1 ${
              headerCompact ? "lg:top-24" : "lg:top-32"
            } transition-[top] duration-300`}
          >
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Outcome</h2>
              <p className="mt-1 text-sm text-slate-600">Verdict and rubric</p>
            </div>
            {result ? (
              <>
                <EvaluationCard variant="hero" evaluation={result.evaluation} />
                <MetricsPanel models={result.models} metrics={result.evaluation.metrics} />
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-5 py-14 text-center lg:py-16">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Awaiting run</p>
                <p className="mx-auto mt-2 max-w-[240px] text-sm leading-relaxed text-slate-600">
                  Results appear here and stay visible while you read the transcript.
                </p>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
