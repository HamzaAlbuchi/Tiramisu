import { useCallback, useEffect, useRef, useState } from "react";
import { ArbiterHeader } from "@/components/ArbiterHeader";
import { DebateForm, type DebateFormValues } from "@/components/DebateForm";
import { EvaluationModal } from "@/components/EvaluationModal";
import { TurnTimeline } from "@/components/TurnTimeline";
import { runDebateStream, type DebateStreamMeta } from "@/services/api";
import type { DebateResponse, DebateTurn } from "@/types/debate";

const SHELL = "mx-auto w-full max-w-6xl px-4 sm:px-6";

const DEFAULT_MODELS = { pro: "GPT-4o", against: "Claude Sonnet" } as const;

export function DebatePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DebateResponse | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [streamMeta, setStreamMeta] = useState<DebateStreamMeta | null>(null);
  const [streamTurns, setStreamTurns] = useState<DebateTurn[]>([]);
  const [showEvalCta, setShowEvalCta] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const ctaDelayRef = useRef<number>();
  const streamAbortRef = useRef<AbortController | null>(null);
  const [sessionKey, setSessionKey] = useState(0);

  const scheduleEvalCtaReveal = useCallback(() => {
    if (ctaDelayRef.current != null) {
      window.clearTimeout(ctaDelayRef.current);
    }
    ctaDelayRef.current = window.setTimeout(() => {
      setShowEvalCta(true);
      ctaDelayRef.current = undefined;
    }, 680);
  }, []);

  useEffect(() => {
    setShowEvalCta(false);
    setModalOpen(false);
    if (ctaDelayRef.current != null) {
      window.clearTimeout(ctaDelayRef.current);
      ctaDelayRef.current = undefined;
    }
  }, [result]);

  const onSubmit = useCallback(
    async (v: DebateFormValues) => {
      streamAbortRef.current?.abort();
      const ac = new AbortController();
      streamAbortRef.current = ac;
      setSessionKey((k) => k + 1);
      setLoading(true);
      setStreaming(true);
      setError(null);
      setStreamMeta(null);
      setStreamTurns([]);
      setResult(null);
      try {
        const data = await runDebateStream(
          {
            topic: v.topic.trim(),
            rounds: v.rounds,
            style: v.style,
          },
          {
            signal: ac.signal,
            onMeta: (m) => setStreamMeta(m),
            onTurn: (t) => setStreamTurns((prev) => [...prev, t]),
          },
        );
        setResult(data);
        setStreamMeta(null);
        setStreamTurns([]);
        scheduleEvalCtaReveal();
      } catch (e) {
        const aborted = e instanceof Error && e.name === "AbortError";
        if (!aborted) {
          setError(e instanceof Error ? e.message : "Request failed");
        }
      } finally {
        setStreaming(false);
        setLoading(false);
        streamAbortRef.current = null;
      }
    },
    [scheduleEvalCtaReveal],
  );

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

  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort();
      if (ctaDelayRef.current != null) {
        window.clearTimeout(ctaDelayRef.current);
      }
    };
  }, []);

  const models = streamMeta?.models ?? result?.models ?? DEFAULT_MODELS;
  const liveTurns = streaming ? streamTurns : (result?.turns ?? []);
  const awaitingNextTurn =
    streaming && streamMeta !== null && streamTurns.length < streamMeta.exchangeCount;
  const awaitingJudge =
    streaming && streamMeta !== null && streamTurns.length >= streamMeta.exchangeCount;

  return (
    <div className="relative min-h-screen pb-20">
      <ArbiterHeader />

      <main>
        <section className={`${SHELL} pt-10 pb-8 sm:pt-14 sm:pb-10`}>
          <h1 className="max-w-4xl font-bebas text-5xl leading-[0.95] tracking-wide text-arb-text sm:text-6xl md:text-7xl">
            CONTROLLED <span className="font-serif italic text-arb-muted">adversarial</span>
            <br />
            INTELLIGENCE
          </h1>
          <p className="mt-4 max-w-xl font-mono text-xs uppercase leading-relaxed tracking-[0.12em] text-arb-muted">
            Two models · one motion · sealed rubric. Transcript first; verdict on your command.
          </p>
        </section>

        <section className={`${SHELL} pb-12`}>
          <div className="border border-arb-border bg-arb-surface p-5 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-arb-muted">Session parameters</p>
              {result ? (
                <button
                  type="button"
                  onClick={exportJson}
                  className="border border-arb-border bg-arb-bg px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-arb-muted transition hover:border-arb-muted hover:text-arb-text"
                >
                  Export JSON
                </button>
              ) : null}
            </div>
            <DebateForm loading={loading} onSubmit={onSubmit} className="max-w-3xl" />

            {error ? (
              <p className="mt-6 border border-red-900/40 bg-red-950/25 px-3 py-2 font-mono text-xs text-red-200/90">
                {error}
              </p>
            ) : null}
          </div>
        </section>

        <section className={`${SHELL} pb-16`}>
          <div className="mb-4 flex flex-wrap items-baseline gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-arb-muted">Live run</p>
            <span className="font-mono text-[10px] text-arb-border">|</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-arb-muted">
              Pro {models.pro} · Against {models.against}
            </span>
          </div>

          {result || streaming ? (
            <>
              <TurnTimeline
                key={sessionKey}
                turns={liveTurns}
                models={models}
                thinkingMs={0}
                staggerMs={0}
                notifyOnComplete={false}
                awaitingMore={awaitingNextTurn}
              />
              {awaitingJudge ? (
                <p className="mt-4 border border-dashed border-arb-border bg-arb-surface/40 px-4 py-3 text-center font-mono text-[10px] uppercase tracking-wider text-arb-muted">
                  Judge is reviewing the full transcript…
                </p>
              ) : null}
              {result ? (
                <div
                  className={`mt-8 flex flex-col items-center gap-3 transition-all duration-500 ease-out ${
                    showEvalCta ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
                  }`}
                >
                  <button
                    type="button"
                    disabled={!showEvalCta}
                    onClick={() => setModalOpen(true)}
                    className="border border-arb-accent/70 bg-arb-accent/10 px-6 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.2em] text-arb-accent transition enabled:hover:-translate-y-px enabled:hover:bg-arb-accent/20 disabled:cursor-default disabled:opacity-0"
                  >
                    Reveal verdict
                  </button>
                  <p className="text-center font-mono text-[10px] uppercase tracking-wider text-arb-muted">
                    Final rubric · heatmap · analysis
                  </p>
                </div>
              ) : null}
            </>
          ) : (
            <div className="border border-dashed border-arb-border bg-arb-surface/50 px-6 py-24 text-center">
              <p className="font-serif text-lg italic text-arb-muted">No active session.</p>
              <p className="mt-2 font-mono text-xs text-arb-muted">Run a debate to populate the transcript.</p>
            </div>
          )}
        </section>
      </main>

      <EvaluationModal open={modalOpen} onClose={() => setModalOpen(false)} result={result} />
    </div>
  );
}
