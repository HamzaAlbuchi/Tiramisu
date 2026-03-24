import type { DebateEvaluation, DebateMetrics, DebateModels, DebateResponse } from "@/types/debate";

type Band = "LOW" | "MED" | "HIGH";

function bandFrom01(x: number): Band {
  const v = Math.min(1, Math.max(0, x));
  if (v < 0.34) return "LOW";
  if (v < 0.67) return "MED";
  return "HIGH";
}

function bandClass(b: Band): string {
  if (b === "LOW") return "border-emerald-800/50 bg-emerald-950/40 text-emerald-200/90";
  if (b === "MED") return "border-amber-800/50 bg-amber-950/35 text-amber-200/90";
  return "border-red-900/50 bg-red-950/40 text-red-200/90";
}

function resolveWinningModel(evaluation: DebateEvaluation, models: DebateModels): string {
  const wl = evaluation.winnerLabel.toLowerCase();
  const w = evaluation.winner.toLowerCase();
  if (wl.includes("against") || w.includes("against") || w === "b") {
    return models.against;
  }
  if (wl.includes("pro") || w.includes("pro") || w === "a") {
    return models.pro;
  }
  const proHint = models.pro.toLowerCase().slice(0, 8);
  const againstHint = models.against.toLowerCase().slice(0, 8);
  if (proHint && wl.includes(proHint)) {
    return models.pro;
  }
  if (againstHint && wl.includes(againstHint)) {
    return models.against;
  }
  return evaluation.winnerLabel;
}

const SCORE_ROWS: { key: keyof DebateMetrics; label: string }[] = [
  { key: "clarity", label: "Accuracy" },
  { key: "logicalConsistency", label: "Logic" },
  { key: "argumentStrength", label: "Evidence" },
  { key: "rebuttalQuality", label: "Consistency" },
];

function ScoreBar({ value, tone }: { value: number; tone: "pro" | "against" }) {
  const pct = Math.min(100, Math.max(0, (value / 10) * 100));
  const fill = tone === "pro" ? "bg-arb-pro" : "bg-arb-against";
  return (
    <div className="h-px w-full overflow-hidden bg-arb-border">
      <div className={`h-full ${fill}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function BiasCell({ label, band }: { label: string; band: Band }) {
  return (
    <div className={`border px-2 py-3 text-center ${bandClass(band)}`}>
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] opacity-80">{label}</p>
      <p className="mt-1 font-mono text-xs font-medium tabular-nums">{band}</p>
    </div>
  );
}

function deriveFallacyPills(analysis: DebateEvaluation["analysis"]): { detected: string[]; clean: boolean } {
  const pool = [...analysis.weaknessesPro, ...analysis.weaknessesAgainst]
    .map((s) => s.trim())
    .filter(Boolean);
  const keywords = /fallac|straw|ad hominem|circular|false dichot|slippery|appeal to|hasty general/i;
  const hits = pool.filter((s) => keywords.test(s)).slice(0, 8);
  return { detected: hits, clean: hits.length === 0 };
}

interface Props {
  result: DebateResponse;
}

export function VerdictPanel({ result }: Props) {
  const { evaluation, models } = result;
  const { analysis, metrics } = evaluation;
  const winnerName = resolveWinningModel(evaluation, models);

  const bn = (metrics.biasNeutrality.pro + metrics.biasNeutrality.against) / 2 / 10;
  const framingRisk = 1 - bn;
  const omissionRisk = evaluation.hallucinationRiskScore;
  const authorityRisk = 1 - evaluation.accuracySignalScore;
  const rq = (metrics.rebuttalQuality.pro + metrics.rebuttalQuality.against) / 2 / 10;
  const recencyRisk = 1 - rq;

  const heatmap: { label: string; band: Band }[] = [
    { label: "Framing", band: bandFrom01(framingRisk) },
    { label: "Omission", band: bandFrom01(omissionRisk) },
    { label: "Authority", band: bandFrom01(authorityRisk) },
    { label: "Recency", band: bandFrom01(recencyRisk) },
  ];

  const fallacies = deriveFallacyPills(analysis);

  return (
    <div className="border border-arb-border bg-arb-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-arb-accent/35 bg-arb-accent/15 px-4 py-3 sm:px-5">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-arb-text">
          ⚖ Final Verdict
        </p>
        <p className="font-mono text-xs tabular-nums text-arb-muted">
          Confidence <span className="text-arb-accent">{(evaluation.confidence * 100).toFixed(0)}%</span>
        </p>
      </div>

      <div className="border-b border-arb-border px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-arb-muted">Outcome</p>
            <p className="mt-1 font-bebas text-4xl leading-none tracking-wide text-arb-text sm:text-5xl">{winnerName}</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-arb-muted">
              {evaluation.verdictType.replace(/_/g, " ")}
            </p>
          </div>
          <p className="max-w-md text-right font-serif text-base italic leading-relaxed text-arb-muted sm:max-w-sm">
            {analysis.summary}
          </p>
        </div>
      </div>

      <div className="grid gap-px border-b border-arb-border bg-arb-border sm:grid-cols-2">
        <div className="bg-arb-surface p-4 sm:p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-arb-pro">{models.pro}</p>
          <ul className="mt-4 space-y-4">
            {SCORE_ROWS.map(({ key, label }) => {
              const v = metrics[key].pro;
              return (
                <li key={key}>
                  <div className="mb-1 flex justify-between font-mono text-[11px] text-arb-muted">
                    <span>{label}</span>
                    <span className="tabular-nums text-arb-text">{v.toFixed(1)}</span>
                  </div>
                  <ScoreBar value={v} tone="pro" />
                </li>
              );
            })}
          </ul>
        </div>
        <div className="bg-arb-surface p-4 sm:p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-arb-against">{models.against}</p>
          <ul className="mt-4 space-y-4">
            {SCORE_ROWS.map(({ key, label }) => {
              const v = metrics[key].against;
              return (
                <li key={key}>
                  <div className="mb-1 flex justify-between font-mono text-[11px] text-arb-muted">
                    <span>{label}</span>
                    <span className="tabular-nums text-arb-text">{v.toFixed(1)}</span>
                  </div>
                  <ScoreBar value={v} tone="against" />
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-b border-arb-border px-4 py-5 sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-arb-muted">Bias heatmap</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {heatmap.map((c) => (
            <BiasCell key={c.label} label={c.label} band={c.band} />
          ))}
        </div>
      </div>

      <div className="border-b border-arb-border px-4 py-5 sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-arb-muted">Fallacy scan</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {fallacies.clean ? (
            <span className="border border-emerald-800/50 bg-emerald-950/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-emerald-200/90">
              None detected
            </span>
          ) : (
            fallacies.detected.map((t, i) => (
              <span
                key={`${i}-${t.slice(0, 24)}`}
                className="max-w-full border border-red-900/45 bg-red-950/35 px-2.5 py-1 font-mono text-[10px] leading-snug text-red-200/90"
              >
                {t.length > 72 ? `${t.slice(0, 70)}…` : t}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-arb-muted">Analysis</p>
        <div className="mt-3 border-l-2 border-arb-accent pl-4">
          <p className="font-serif text-base italic leading-relaxed text-arb-text/90">{analysis.finalReasoning}</p>
        </div>
      </div>

      <div className="border-t border-arb-border px-4 py-5 sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-arb-muted">Risk read</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <p className="font-mono text-xs leading-relaxed text-arb-muted">{analysis.hallucinationBias}</p>
          <p className="font-mono text-xs leading-relaxed text-arb-muted">{analysis.accuracyAssessment}</p>
        </div>
        <p className="mt-4 font-mono text-[10px] tabular-nums text-arb-muted">
          Hallucination risk {(evaluation.hallucinationRiskScore * 100).toFixed(0)}% · Accuracy signal{" "}
          {(evaluation.accuracySignalScore * 100).toFixed(0)}%
        </p>
      </div>

      <div className="border-t border-arb-border px-4 py-5 sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-arb-muted">Model notes</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] uppercase text-arb-pro">Pro</p>
            <ul className="mt-2 list-none space-y-1 font-mono text-xs text-arb-muted">
              {analysis.strengthsPro.map((s, i) => (
                <li key={`sp-${i}`} className="border-l border-arb-border pl-2">
                  + {s}
                </li>
              ))}
              {analysis.weaknessesPro.map((s, i) => (
                <li key={`wp-${i}`} className="border-l border-arb-against/30 pl-2 text-arb-against/80">
                  − {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase text-arb-against">Against</p>
            <ul className="mt-2 list-none space-y-1 font-mono text-xs text-arb-muted">
              {analysis.strengthsAgainst.map((s, i) => (
                <li key={`sa-${i}`} className="border-l border-arb-border pl-2">
                  + {s}
                </li>
              ))}
              {analysis.weaknessesAgainst.map((s, i) => (
                <li key={`wa-${i}`} className="border-l border-arb-pro/30 pl-2 text-arb-pro/80">
                  − {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
