import type { DebateMetrics } from "@/types/debate";

const ROWS: { key: keyof DebateMetrics; label: string }[] = [
  { key: "logicalConsistency", label: "Logical consistency" },
  { key: "argumentStrength", label: "Argument strength" },
  { key: "rebuttalQuality", label: "Rebuttal quality" },
  { key: "biasNeutrality", label: "Bias / neutrality" },
  { key: "clarity", label: "Clarity" },
];

function Bar({ value, variant }: { value: number; variant: "a" | "b" }) {
  const pct = Math.min(100, Math.max(0, (value / 10) * 100));
  const fill = variant === "a" ? "bg-slate-400" : "bg-slate-600";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-sm bg-white/[0.06]">
      <div className={`h-full rounded-sm ${fill}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

interface Props {
  models: { pro: string; against: string };
  metrics: DebateMetrics;
}

export function MetricsPanel({ models, metrics }: Props) {
  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#0f1117] p-5 md:p-6">
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Rubric comparison</h3>
      <p className="mt-1 text-xs text-slate-600">Scores 0–10 · higher is stronger on that dimension</p>
      <div className="mt-5 space-y-5">
        {ROWS.map(({ key, label }) => {
          const m = metrics[key];
          const diff = m.pro - m.against;
          const lead =
            Math.abs(diff) < 0.05 ? null : diff > 0 ? ("pro" as const) : ("against" as const);
          return (
            <div key={key}>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-slate-300">{label}</span>
                <span className="tabular-nums text-xs text-slate-500">
                  <span className="text-slate-300">{m.pro.toFixed(1)}</span>
                  <span className="mx-1.5 text-slate-700">/</span>
                  <span className="text-slate-300">{m.against.toFixed(1)}</span>
                  {lead && (
                    <span className="ml-2 text-slate-600">
                      · {lead === "pro" ? models.pro.split(" ")[0] : models.against.split(" ")[0]}{" "}
                      +{Math.abs(diff).toFixed(1)}
                    </span>
                  )}
                </span>
              </div>
              <div className="grid gap-2.5">
                <div>
                  <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                    {models.pro}
                  </div>
                  <Bar value={m.pro} variant="a" />
                </div>
                <div>
                  <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                    {models.against}
                  </div>
                  <Bar value={m.against} variant="b" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
