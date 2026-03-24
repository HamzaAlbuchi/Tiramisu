import { useCallback, useEffect, useRef, useState } from "react";
import { DebateForm, type DebateFormValues } from "@/components/DebateForm";
import { EvaluationModal } from "@/components/EvaluationModal";
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
  const [showEvalCta, setShowEvalCta] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const ctaDelayRef = useRef<number>();

  useEffect(() => {
    const onScroll = () => setHeaderCompact(window.scrollY > 72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setShowEvalCta(false);
    setModalOpen(false);
    if (ctaDelayRef.current != null) {
      window.clearTimeout(ctaDelayRef.current);
      ctaDelayRef.current = undefined;
    }
  }, [result]);

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

  const handleDebateComplete = useCallback(() => {
    if (ctaDelayRef.current != null) {
      window.clearTimeout(ctaDelayRef.current);
    }
    ctaDelayRef.current = window.setTimeout(() => {
      setShowEvalCta(true);
      ctaDelayRef.current = undefined;
    }, 680);
  }, []);

  useEffect(() => {
    return () => {
      if (ctaDelayRef.current != null) {
        window.clearTimeout(ctaDelayRef.current);
      }
    };
  }, []);

  const models = result?.models ?? DEFAULT_MODELS;
  const timelineKey = result
    ? `${result.topic}-${result.rounds}-${result.exchangeCount}-${result.turns.length}`
    : "idle";

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
                Model debate
              </h1>
              {!headerCompact && (
                <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-600">
                  Watch the exchange, then open the evaluation when you are ready.
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
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-end justify-between gap-2">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Debate</h2>
              <p className="mt-1 text-sm text-slate-600">Live-style feed · verdict after it ends</p>
            </div>
          </div>
          {result ? (
            <>
              <TurnTimeline
                key={timelineKey}
                turns={result.turns}
                models={result.models}
                tone="secondary"
                thinkingMs={720}
                staggerMs={480}
                onDebateComplete={handleDebateComplete}
              />
              <div
                className={`mt-8 flex flex-col items-center gap-3 transition-all duration-500 ease-out ${
                  showEvalCta ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
                }`}
              >
                <button
                  type="button"
                  disabled={!showEvalCta}
                  onClick={() => setModalOpen(true)}
                  className="rounded-lg border border-white/[0.12] bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-slate-200 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition hover:border-violet-500/30 hover:bg-white/[0.09] disabled:cursor-default disabled:opacity-0"
                >
                  View evaluation
                </button>
                <p className="text-center text-[11px] text-slate-600">Winner, scores, and judge notes</p>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-20 text-center">
              <p className="text-sm text-slate-600">Run a debate from the header to see the exchange here.</p>
            </div>
          )}
        </div>
      </main>

      <EvaluationModal open={modalOpen} onClose={() => setModalOpen(false)} result={result} />
    </div>
  );
}
