import { useState } from "react";

const STYLES = ["balanced", "formal", "casual", "technical"] as const;
const MODEL_OPTIONS = ["Gemini (Pro)", "Gemini (Against)", "Gemini"] as const;
const JUDGE_OPTIONS = ["Internal arbiter", "Gemini"] as const;

export interface DebateFormValues {
  topic: string;
  rounds: number;
  style: string;
}

interface Props {
  loading: boolean;
  onSubmit: (v: DebateFormValues) => void;
  variant?: "default" | "compact";
  className?: string;
  headerDense?: boolean;
}

const field =
  "w-full border border-arb-border bg-arb-bg px-3 py-2 font-mono text-xs text-arb-text outline-none transition focus:border-arb-muted focus:ring-1 focus:ring-arb-border";
const labelMono = "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-arb-muted";

export function DebateForm({ loading, onSubmit, variant = "default", className }: Props) {
  const [topic, setTopic] = useState("Should cities prioritize public transit over cars?");
  const [rounds, setRounds] = useState(3);
  const [style, setStyle] = useState<string>("balanced");
  const [proModel, setProModel] = useState<string>(MODEL_OPTIONS[0]);
  const [againstModel, setAgainstModel] = useState<string>(MODEL_OPTIONS[1]);
  const [judgeModel, setJudgeModel] = useState<string>(JUDGE_OPTIONS[0]);

  const compact = variant === "compact";

  return (
    <form
      className={["space-y-6", className].filter(Boolean).join(" ")}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ topic, rounds, style });
      }}
    >
      <div>
        <label className={labelMono} htmlFor="topic">
          Motion
        </label>
        <textarea
          id="topic"
          rows={compact ? 2 : 4}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className={`${field} min-h-[5.5rem] resize-y font-serif text-lg italic leading-snug placeholder:text-arb-muted/60 sm:text-xl`}
          placeholder="State the proposition under review…"
          aria-label="Debate topic"
        />
      </div>

      <div>
        <p className={labelMono}>Models (display only — assigned per pipeline)</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={proModel}
            onChange={(e) => setProModel(e.target.value)}
            className={`${field} sm:max-w-[200px]`}
            aria-label="Pro model"
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <span className="hidden text-center font-bebas text-xl text-arb-muted sm:block sm:px-2">VS</span>
          <span className="text-center font-bebas text-lg text-arb-muted sm:hidden">VS</span>
          <select
            value={againstModel}
            onChange={(e) => setAgainstModel(e.target.value)}
            className={`${field} sm:max-w-[200px]`}
            aria-label="Against model"
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelMono} htmlFor="rounds">
            Rounds
          </label>
          <input
            id="rounds"
            type="number"
            min={1}
            max={12}
            value={rounds}
            onChange={(e) => setRounds(Number(e.target.value))}
            className={field}
          />
        </div>
        <div>
          <label className={labelMono} htmlFor="style">
            Style
          </label>
          <select id="style" value={style} onChange={(e) => setStyle(e.target.value)} className={field}>
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelMono} htmlFor="judge">
            Judge model
          </label>
          <select
            id="judge"
            value={judgeModel}
            onChange={(e) => setJudgeModel(e.target.value)}
            className={field}
            aria-label="Judge model (display only)"
          >
            {JUDGE_OPTIONS.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !topic.trim()}
        className="group relative w-full border border-arb-accent/80 bg-arb-accent py-3.5 font-mono text-sm font-medium uppercase tracking-[0.16em] text-arb-bg transition enabled:hover:-translate-y-px enabled:hover:shadow-[0_6px_24px_-6px_rgba(232,255,71,0.45)] disabled:cursor-not-allowed disabled:opacity-35"
      >
        <span className={loading ? "animate-eval-pulse inline-block" : ""}>
          {loading ? "EVALUATING…" : "⚡ RUN DEBATE"}
        </span>
      </button>
    </form>
  );
}
