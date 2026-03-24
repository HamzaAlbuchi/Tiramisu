import type { DebateEvaluation } from "@/types/debate";

interface Props {
  evaluation: DebateEvaluation;
}

export function EvaluationCard({ evaluation }: Props) {
  const { analysis } = evaluation;
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800/40 p-5 shadow-panel backdrop-blur">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-semibold text-slate-100">Verdict</h3>
        <div className="text-right text-sm">
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-accent-glow">
            {evaluation.verdictType.replace(/_/g, " ")}
          </span>
          <p className="mt-2 text-mist">
            Winner: <span className="font-semibold text-slate-100">{evaluation.winnerLabel}</span>
          </p>
          <p className="text-xs text-mist">
            Confidence {(evaluation.confidence * 100).toFixed(0)}% · Risk{" "}
            {(evaluation.hallucinationRiskScore * 100).toFixed(0)}% · Signal{" "}
            {(evaluation.accuracySignalScore * 100).toFixed(0)}%
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-200">{analysis.summary}</p>
      <div className="mt-4 grid gap-3 text-sm text-mist sm:grid-cols-2">
        <div className="rounded-xl bg-ink-900/50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Hallucination bias</p>
          <p className="mt-1 leading-relaxed">{analysis.hallucinationBias}</p>
        </div>
        <div className="rounded-xl bg-ink-900/50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Accuracy</p>
          <p className="mt-1 leading-relaxed">{analysis.accuracyAssessment}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-teal-glow">Strengths · Pro</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-300">
            {analysis.strengthsPro.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs font-semibold text-mist">Weaknesses · Pro</p>
          <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-slate-400">
            {analysis.weaknessesPro.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-accent-glow">Strengths · Against</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-300">
            {analysis.strengthsAgainst.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs font-semibold text-mist">Weaknesses · Against</p>
          <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-slate-400">
            {analysis.weaknessesAgainst.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 border-t border-white/10 pt-4 text-sm italic text-mist">{analysis.finalReasoning}</p>
    </div>
  );
}
