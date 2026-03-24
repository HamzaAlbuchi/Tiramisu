import type { DebateEvaluation } from "@/types/debate";

interface Props {
  evaluation: DebateEvaluation;
  /** Dashboard hero: larger type, stronger frame, run context in header row */
  variant?: "default" | "hero";
  topic?: string;
  styleLabel?: string;
  exchangeCount?: number;
  rounds?: number;
  onExportJson?: () => void;
}

export function EvaluationCard({
  evaluation,
  variant = "default",
  topic,
  styleLabel,
  exchangeCount,
  rounds,
  onExportJson,
}: Props) {
  const isHero = variant === "hero";
  const { analysis } = evaluation;

  return (
    <section
      className={
        isHero
          ? "rounded-2xl border border-white/15 bg-gradient-to-b from-ink-800/95 to-ink-900/90 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_32px_64px_-24px_rgba(0,0,0,0.65)] backdrop-blur md:p-8"
          : "rounded-2xl border border-white/10 bg-ink-800/40 p-5 shadow-panel backdrop-blur"
      }
    >
      {(topic != null || onExportJson) && isHero && (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist">Subject</p>
            <p className="mt-1.5 text-base font-medium leading-snug text-slate-100 md:text-lg">{topic}</p>
            {(styleLabel != null || exchangeCount != null || rounds != null) && (
              <p className="mt-2 text-xs text-mist">
                {styleLabel != null && (
                  <>
                    Style <span className="text-slate-400">{styleLabel}</span>
                    {(exchangeCount != null || rounds != null) && " · "}
                  </>
                )}
                {exchangeCount != null && <span>{exchangeCount} messages</span>}
                {exchangeCount != null && rounds != null && " · "}
                {rounds != null && <span>{rounds} round{rounds === 1 ? "" : "s"} requested</span>}
              </p>
            )}
          </div>
          {onExportJson && (
            <button
              type="button"
              onClick={onExportJson}
              className="shrink-0 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-white/25 hover:bg-white/[0.07]"
            >
              Export JSON
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2
            className={
              isHero
                ? "font-display text-xl font-semibold tracking-tight text-slate-50 md:text-2xl"
                : "font-display text-lg font-semibold text-slate-100"
            }
          >
            Verdict
          </h2>
          <p className="mt-1 text-xs text-mist">Judge output · heuristic stub</p>
        </div>
        <div className="text-right">
          <span
            className={
              isHero
                ? "inline-block rounded-md border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-200"
                : "rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-accent-glow"
            }
          >
            {evaluation.verdictType.replace(/_/g, " ")}
          </span>
          <p className="mt-3 text-sm text-mist">
            Outcome{" "}
            <span className="font-semibold text-slate-100">{evaluation.winnerLabel}</span>
          </p>
          <p className="mt-1 text-xs tabular-nums text-mist">
            Confidence {(evaluation.confidence * 100).toFixed(0)}% · Hallucination risk{" "}
            {(evaluation.hallucinationRiskScore * 100).toFixed(0)}% · Accuracy signal{" "}
            {(evaluation.accuracySignalScore * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      <p
        className={
          isHero
            ? "mt-6 text-base leading-relaxed text-slate-200 md:text-[1.05rem]"
            : "mt-4 text-sm leading-relaxed text-slate-200"
        }
      >
        {analysis.summary}
      </p>

      <div className="mt-6 grid gap-3 text-sm text-mist sm:grid-cols-2">
        <div className="rounded-xl border border-white/[0.06] bg-ink-950/40 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Hallucination bias</p>
          <p className="mt-2 leading-relaxed text-slate-400">{analysis.hallucinationBias}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-ink-950/40 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Accuracy</p>
          <p className="mt-2 leading-relaxed text-slate-400">{analysis.accuracyAssessment}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-teal-glow/90">Strengths · Pro</p>
          <ul className="mt-2 list-outside list-disc space-y-1.5 pl-4 text-sm text-slate-300">
            {analysis.strengthsPro.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs font-semibold text-slate-500">Weaknesses · Pro</p>
          <ul className="mt-2 list-outside list-disc space-y-1.5 pl-4 text-sm text-slate-400">
            {analysis.weaknessesPro.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-accent-glow/90">Strengths · Against</p>
          <ul className="mt-2 list-outside list-disc space-y-1.5 pl-4 text-sm text-slate-300">
            {analysis.strengthsAgainst.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs font-semibold text-slate-500">Weaknesses · Against</p>
          <ul className="mt-2 list-outside list-disc space-y-1.5 pl-4 text-sm text-slate-400">
            {analysis.weaknessesAgainst.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-6 border-t border-white/10 pt-5 text-sm leading-relaxed text-slate-500">{analysis.finalReasoning}</p>
    </section>
  );
}
