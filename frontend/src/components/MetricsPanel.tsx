import type { DebateMetrics } from "@/types/debate";

const ROWS: { key: keyof DebateMetrics; label: string }[] = [
  { key: "logicalConsistency", label: "Logical consistency" },
  { key: "argumentStrength", label: "Argument strength" },
  { key: "rebuttalQuality", label: "Rebuttal quality" },
  { key: "biasNeutrality", label: "Bias / neutrality" },
  { key: "clarity", label: "Clarity" },
];

function Bar({ value, accent }: { value: number; accent: "pro" | "against" }) {
  const pct = Math.min(100, Math.max(0, (value / 10) * 100));
  const bg = accent === "pro" ? "from-teal-glow/90 to-teal-glow/40" : "from-accent-glow/90 to-accent/50";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${bg}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

interface Props {
  models: { pro: string; against: string };
  metrics: DebateMetrics;
}

export function MetricsPanel({ models, metrics }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800/40 p-5 shadow-panel backdrop-blur">
      <h3 className="font-display text-lg font-semibold tracking-tight text-slate-100">Rubric metrics</h3>
      <p className="mt-1 text-xs text-mist">0–10 per dimension; stub heuristics from the backend.</p>
      <div className="mt-4 space-y-4">
        {ROWS.map(({ key, label }) => {
          const m = metrics[key];
          return (
            <div key={key}>
              <div className="mb-1.5 flex justify-between text-xs text-mist">
                <span className="font-medium text-slate-300">{label}</span>
                <span>
                  <span className="text-teal-glow">{m.pro.toFixed(1)}</span>
                  <span className="mx-1 text-white/20">/</span>
                  <span className="text-accent-glow">{m.against.toFixed(1)}</span>
                </span>
              </div>
              <div className="grid gap-2">
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-mist/80">{models.pro}</div>
                  <Bar value={m.pro} accent="pro" />
                </div>
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-mist/80">{models.against}</div>
                  <Bar value={m.against} accent="against" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
