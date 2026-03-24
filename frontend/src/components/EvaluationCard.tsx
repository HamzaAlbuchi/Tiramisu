import type { DebateEvaluation } from "@/types/debate";

interface Props {
  evaluation: DebateEvaluation;
  variant?: "default" | "hero";
  topic?: string;
  styleLabel?: string;
  exchangeCount?: number;
  rounds?: number;
  onExportJson?: () => void;
  /** Hide the top verdict block (e.g. when verdict is shown separately in a modal). */
  omitVerdict?: boolean;
}

export function EvaluationCard({
  evaluation,
  variant = "default",
  topic,
  styleLabel,
  exchangeCount,
  rounds,
  onExportJson,
  omitVerdict = false,
}: Props) {
  const isHero = variant === "hero";
  const { analysis } = evaluation;

  const frame = isHero
    ? "rounded-xl border border-white/[0.1] bg-[#0f1117] p-6 md:p-7"
    : "rounded-xl border border-white/10 bg-ink-800/40 p-5";

  return (
    <section className={frame}>
      {(topic != null || onExportJson) && isHero && (
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Subject</p>
            <p className="mt-2 text-base font-medium leading-snug text-slate-100 md:text-[1.05rem]">{topic}</p>
            {(styleLabel != null || exchangeCount != null || rounds != null) && (
              <p className="mt-2 text-xs text-slate-600">
                {styleLabel != null && (
                  <>
                    Register <span className="text-slate-500">{styleLabel}</span>
                    {(exchangeCount != null || rounds != null) && " · "}
                  </>
                )}
                {exchangeCount != null && <span>{exchangeCount} messages</span>}
                {exchangeCount != null && rounds != null && " · "}
                {rounds != null && (
                  <span>
                    {rounds} round{rounds === 1 ? "" : "s"}
                  </span>
                )}
              </p>
            )}
          </div>
          {onExportJson && (
            <button
              type="button"
              onClick={onExportJson}
              className="shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-white/15 hover:text-slate-300"
            >
              Export JSON
            </button>
          )}
        </div>
      )}

      {!omitVerdict && (
        <div className="border-b border-white/[0.08] pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Verdict</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-50 md:text-[1.75rem]">
            {evaluation.winnerLabel}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="rounded-md border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-400">
              {evaluation.verdictType.replace(/_/g, " ")}
            </span>
            <span className="text-sm tabular-nums text-slate-500">
              Confidence <span className="font-medium text-slate-300">{(evaluation.confidence * 100).toFixed(0)}%</span>
            </span>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-slate-400 md:text-[0.9375rem]">{analysis.summary}</p>
        </div>
      )}

      <div className={`grid gap-3 sm:grid-cols-2 ${omitVerdict ? "" : "mt-6"}`}>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Hallucination risk</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">{analysis.hallucinationBias}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Accuracy read</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">{analysis.accuracyAssessment}</p>
        </div>
      </div>
      <p className="mt-3 text-center text-[10px] tabular-nums text-slate-600">
        Risk score {(evaluation.hallucinationRiskScore * 100).toFixed(0)}% · Signal{" "}
        {(evaluation.accuracySignalScore * 100).toFixed(0)}%
      </p>

      {/* 3. Per-model notes */}
      <div className="mt-8 border-t border-white/[0.08] pt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Model notes</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-slate-400">Pro</p>
            <ul className="mt-2 list-outside list-disc space-y-1.5 pl-4 text-sm text-slate-500">
              {analysis.strengthsPro.map((s, i) => (
                <li key={`sp-${i}`}>{s}</li>
              ))}
            </ul>
            <ul className="mt-3 list-outside list-disc space-y-1.5 pl-4 text-sm text-slate-600">
              {analysis.weaknessesPro.map((s, i) => (
                <li key={`wp-${i}`}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Against</p>
            <ul className="mt-2 list-outside list-disc space-y-1.5 pl-4 text-sm text-slate-500">
              {analysis.strengthsAgainst.map((s, i) => (
                <li key={`sa-${i}`}>{s}</li>
              ))}
            </ul>
            <ul className="mt-3 list-outside list-disc space-y-1.5 pl-4 text-sm text-slate-600">
              {analysis.weaknessesAgainst.map((s, i) => (
                <li key={`wa-${i}`}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Judge rationale */}
      <div className="mt-8 border-t border-white/[0.08] pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Judge rationale</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{analysis.finalReasoning}</p>
      </div>
    </section>
  );
}
