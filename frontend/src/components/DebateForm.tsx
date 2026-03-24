import { useState } from "react";

const STYLES = ["balanced", "formal", "casual", "technical"] as const;

export interface DebateFormValues {
  topic: string;
  rounds: number;
  style: string;
}

interface Props {
  loading: boolean;
  onSubmit: (v: DebateFormValues) => void;
  /** Single column + lighter chrome (dashboard: inputs least prominent). */
  variant?: "default" | "compact";
  /** Merged onto the form element for page-level layout only. */
  className?: string;
  /** Scroll-collapsed header: tighter field, single-line subject. */
  headerDense?: boolean;
}

export function DebateForm({ loading, onSubmit, variant = "default", className, headerDense }: Props) {
  const [topic, setTopic] = useState("Should cities prioritize public transit over cars?");
  const [rounds, setRounds] = useState(3);
  const [style, setStyle] = useState<string>("balanced");

  const compact = variant === "compact";
  const dense = Boolean(headerDense && compact);
  const field =
    "w-full rounded-lg border border-white/[0.08] bg-[#0c0d11] px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-white/15 focus:ring-1 focus:ring-white/10";
  const labelCls = compact
    ? dense
      ? "sr-only"
      : "mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500"
    : "mb-2 block text-sm font-medium text-mist";

  const formClass = [compact ? (dense ? "space-y-2" : "space-y-4") : "space-y-5", className].filter(Boolean).join(" ");

  return (
    <form
      className={formClass}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ topic, rounds, style });
      }}
    >
      <div>
        <label className={labelCls} htmlFor="topic">
          {compact ? "Subject" : "Topic"}
        </label>
        <textarea
          id="topic"
          rows={dense ? 1 : compact ? 2 : 3}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className={
            compact
              ? `${field} resize-y placeholder:text-slate-600 ${dense ? "min-h-[2.5rem] py-2 text-[13px]" : ""}`
              : "w-full resize-y rounded-xl border border-white/10 bg-ink-900/80 px-4 py-3 text-sm text-slate-100 shadow-inner outline-none transition focus:border-white/20 focus:ring-1 focus:ring-white/10"
          }
          placeholder={compact ? "Evaluation subject…" : "What should the models debate?"}
          aria-label="Evaluation subject"
        />
      </div>
      <div
        className={
          compact
            ? dense
              ? "flex flex-wrap items-center gap-2"
              : "flex flex-wrap items-end gap-3"
            : "grid gap-4 sm:grid-cols-2"
        }
      >
        <div className={compact ? (dense ? "w-20 shrink-0" : "w-24 shrink-0") : ""}>
          <label className={labelCls} htmlFor="rounds">
            {compact ? "Rounds" : "Rounds (Pro + Against pairs)"}
          </label>
          <input
            id="rounds"
            type="number"
            min={1}
            max={12}
            value={rounds}
            onChange={(e) => setRounds(Number(e.target.value))}
            className={compact ? field : "w-full rounded-xl border border-white/10 bg-ink-900/80 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/30"}
          />
        </div>
        <div className={compact ? (dense ? "min-w-[120px] max-w-[160px] flex-1" : "min-w-[140px] flex-1") : ""}>
          <label className={labelCls} htmlFor="style">
            {compact ? "Style" : "Style (stub prefix)"}
          </label>
          <select
            id="style"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className={compact ? field : "w-full rounded-xl border border-white/10 bg-ink-900/80 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/30"}
          >
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div
          className={
            compact
              ? dense
                ? "flex w-full min-w-[120px] shrink-0 justify-end sm:ml-auto sm:w-auto"
                : "flex min-w-[120px] flex-1 justify-end sm:ml-auto"
              : "sm:col-span-2"
          }
        >
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className={
              compact
                ? "h-[38px] w-full min-w-[132px] rounded-lg border border-white/10 bg-white/[0.06] px-4 text-sm font-medium text-slate-200 transition hover:border-white/15 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                : "w-full rounded-xl border border-white/15 bg-white/[0.08] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-40"
            }
          >
            {loading ? "Running…" : compact ? "Run evaluation" : "Run debate"}
          </button>
        </div>
      </div>
    </form>
  );
}
