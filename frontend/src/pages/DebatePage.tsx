import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArbitreHeader } from "@/components/ArbitreHeader";
import { DebateForm, type DebateFormValues } from "@/components/DebateForm";
import { EvaluationModal } from "@/components/EvaluationModal";
import { TurnTimeline } from "@/components/TurnTimeline";
import { exportDebatePdf } from "@/pdf/exportDebatePdf";
import { runDebateStream, type DebateStreamMeta } from "@/services/api";
import type { DebateModels, DebateResponse, DebateTurn } from "@/types/debate";
import { readAuth, readSpace } from "@/state/spaceAuth";
import { InviteKeyGate } from "@/components/InviteKeyGate";
import { isInviteKeyRequired, readInviteKey } from "@/state/inviteKey";

const SHELL = "mx-auto w-full max-w-6xl px-4 sm:px-6";

const DEFAULT_MODELS: DebateModels = { pro: "Gemini (Pro)", against: "Gemini (Against)" };

export function DebatePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DebateResponse | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [streamMeta, setStreamMeta] = useState<DebateStreamMeta | null>(null);
  const [streamTurns, setStreamTurns] = useState<DebateTurn[]>([]);
  const [showEvalCta, setShowEvalCta] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const streamAbortRef = useRef<AbortController | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const [pdfExporting, setPdfExporting] = useState(false);
  const [judgeErrorDismissed, setJudgeErrorDismissed] = useState(false);
  const lastSubmitRef = useRef<DebateFormValues | null>(null);
  const space = typeof window === "undefined" ? null : readSpace();
  const authed = typeof window === "undefined" ? null : readAuth();
  const byoLocked = space === "explore";
  const inviteRequired = typeof window === "undefined" ? false : isInviteKeyRequired();
  const hasInviteKey = typeof window === "undefined" ? false : readInviteKey() !== null;
  const locked = inviteRequired && !hasInviteKey;

  /** When `result` updates, close the modal and (after a short beat) show "Reveal verdict".
   * Scheduling must live here — not after `setResult` in submit — or the effect would cancel the timeout. */
  useEffect(() => {
    if (!result) {
      setShowEvalCta(false);
      setModalOpen(false);
      setJudgeErrorDismissed(false);
      return;
    }
    setModalOpen(false);
    setShowEvalCta(false);
    setJudgeErrorDismissed(false);
    const vt = result.evaluation?.verdictType?.toLowerCase?.() ?? "";
    const judgeOk = vt.length > 0 && vt !== "error";
    if (!judgeOk) {
      return;
    }
    const t = window.setTimeout(() => {
      setShowEvalCta(true);
    }, 680);
    return () => {
      window.clearTimeout(t);
    };
  }, [result]);

  const onSubmit = useCallback(
    async (v: DebateFormValues) => {
      if (typeof window !== "undefined" && isInviteKeyRequired() && !readInviteKey()) {
        setError("Enter an invitation key to run debates in the beta.");
        return;
      }
      lastSubmitRef.current = v;
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
        const useCustom = !byoLocked && v.provider === "custom" && v.customEndpointUrl.trim().length > 0;
        const data = await runDebateStream(
          {
            topic: v.topic.trim(),
            rounds: v.rounds,
            style: v.style,
            ...(useCustom
              ? {
                  customEndpointUrl: v.customEndpointUrl.trim(),
                  customApiKey: v.customApiKey,
                  customModelId: v.customModelId.trim(),
                  customModelLabel: v.customModelLabel.trim(),
                }
              : {}),
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
    [byoLocked],
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

  const handleExportPdf = useCallback(async () => {
    if (!result) {
      return;
    }
    setPdfExporting(true);
    setError(null);
    try {
      await exportDebatePdf(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF export failed");
    } finally {
      setPdfExporting(false);
    }
  }, [result]);

  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort();
    };
  }, []);

  const models = streamMeta?.models ?? result?.models ?? DEFAULT_MODELS;
  const liveTurns = streaming ? streamTurns : (result?.turns ?? []);
  const awaitingNextTurn =
    streaming && streamMeta !== null && streamTurns.length < streamMeta.exchangeCount;
  const awaitingJudge =
    streaming && streamMeta !== null && streamTurns.length >= streamMeta.exchangeCount;
  const awaitingLabel = useMemo(() => {
    if (!awaitingNextTurn) return undefined;
    // Streamed turns arrive in chronological order: 0=Pro, 1=Against, 2=Pro...
    const nextIsPro = streamTurns.length % 2 === 0;
    return nextIsPro ? models.pro : models.against;
  }, [awaitingNextTurn, streamTurns.length, models.pro, models.against]);
  const biasFlagsByIndex = useMemo(() => {
    if (!result?.evaluation?.turnAnalysis || !result.turns) {
      return undefined;
    }
    const byKey = new Map<string, string[]>();
    for (const ta of result.evaluation.turnAnalysis) {
      const role = (ta.role ?? "").toLowerCase();
      const key = `${ta.round}-${role}`;
      byKey.set(key, Array.isArray(ta.biasFlags) ? ta.biasFlags : []);
    }
    const out: Record<number, string[]> = {};
    for (const t of result.turns) {
      const round = Math.floor(t.index / 2) + 1;
      const role = (t.side === "A" ? "pro" : "against");
      out[t.index] = byKey.get(`${round}-${role}`) ?? [];
    }
    return out;
  }, [result]);

  return (
    <div className="relative min-h-screen pb-20">
      <ArbitreHeader />

      <main>
        <section className={`${SHELL} pt-10 pb-8 sm:pt-14 sm:pb-10`}>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-arb-accent">
            ——— MULTI-MODEL DEBATE EVALUATION
          </p>
          <h1 className="mt-3 max-w-4xl font-bebas text-[clamp(3.5rem,8vw,6.5rem)] leading-[0.92] text-arb-text">
            WHO MAKES
            <br />
            THE <span className="font-serif italic text-arb-accent">stronger</span>
            <br />
            ARGUMENT?
          </h1>
          <p className="mt-4 max-w-xl font-mono text-xs uppercase leading-relaxed tracking-[0.12em] text-arb-muted">
            Two AIs. One topic. One winner.
          </p>
        </section>

        <section className={`${SHELL} pb-12`}>
          <div className="border border-arb-border bg-arb-surface p-5 sm:p-8">
            {locked ? (
              <InviteKeyGate
                onUnlocked={() => {
                  setError(null);
                }}
              />
            ) : null}
            {space === "research" && !authed ? (
              <div className="mb-6 border border-dashed border-arb-border bg-arb-surface/40 px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-arb-muted">Research space</p>
                <p className="mt-2 font-mono text-xs text-arb-muted">
                  Sign in to save debates and build an audit trail. You can also continue without signing in.
                </p>
                <button
                  type="button"
                  onClick={() => window.__TIRAMISU_NAVIGATE__?.("/login")}
                  className="mt-3 border border-arb-accent/50 bg-arb-accent/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-arb-accent transition hover:border-arb-accent hover:bg-arb-accent/20"
                >
                  Sign in
                </button>
              </div>
            ) : null}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-arb-muted">Session parameters</p>
              {result ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    disabled={pdfExporting}
                    className="border border-arb-accent/50 bg-arb-accent/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-arb-accent transition enabled:hover:border-arb-accent enabled:hover:bg-arb-accent/20 disabled:cursor-wait disabled:opacity-60"
                  >
                    {pdfExporting ? "Building PDF…" : "Export PDF (audit)"}
                  </button>
                  <button
                    type="button"
                    onClick={exportJson}
                    className="border border-arb-border bg-arb-bg px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-arb-muted transition hover:border-arb-muted hover:text-arb-text"
                  >
                    Export JSON
                  </button>
                </div>
              ) : null}
            </div>
            {!locked ? (
              <DebateForm loading={loading} onSubmit={onSubmit} byoLocked={byoLocked} className="max-w-3xl" />
            ) : (
              <div className="max-w-3xl border border-dashed border-arb-border bg-arb-bg/30 px-4 py-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-arb-muted">Debate locked</p>
                <p className="mt-2 font-mono text-xs leading-relaxed text-arb-muted">
                  Enter an invitation key above to unlock debate runs.
                </p>
              </div>
            )}

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
              {result && !judgeErrorDismissed && (result.evaluation?.verdictType ?? "").toLowerCase() === "error" ? (
                <div className="mb-4 border border-red-900/40 bg-red-950/25 px-4 py-3 sm:px-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-red-200/90">
                    Judge verdict failed
                  </p>
                  <p className="mt-2 font-mono text-xs leading-relaxed text-red-200/80">
                    The transcript is complete, but the judge could not produce a valid verdict. You can retry the run or skip
                    the verdict for now.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const last = lastSubmitRef.current;
                        if (last) {
                          onSubmit(last);
                        }
                      }}
                      className="border border-red-900/40 bg-red-950/20 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-red-200/90 transition hover:border-red-200/40"
                    >
                      Retry
                    </button>
                    <button
                      type="button"
                      onClick={() => setJudgeErrorDismissed(true)}
                      className="border border-arb-border bg-arb-bg px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-arb-muted transition hover:border-arb-muted hover:text-arb-text"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              ) : null}
              {awaitingJudge ? (
                <p className="mb-4 border border-dashed border-arb-border bg-arb-surface/40 px-4 py-3 text-center font-mono text-[10px] uppercase tracking-wider text-arb-muted">
                  Judge is reviewing the full transcript…
                </p>
              ) : null}
              {result ? (
                <div
                  className={`mb-4 flex flex-col items-center gap-3 transition-all duration-500 ease-out ${
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
              <TurnTimeline
                key={sessionKey}
                turns={liveTurns}
                models={models}
                modelsCustom={!!models.custom}
                thinkingMs={0}
                staggerMs={0}
                notifyOnComplete={false}
                awaitingMore={awaitingNextTurn}
                awaitingLabel={awaitingLabel}
                biasFlagsByIndex={biasFlagsByIndex}
              />
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
