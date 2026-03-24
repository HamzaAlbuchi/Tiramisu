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
}

export function DebateForm({ loading, onSubmit }: Props) {
  const [topic, setTopic] = useState("Should cities prioritize public transit over cars?");
  const [rounds, setRounds] = useState(3);
  const [style, setStyle] = useState<string>("balanced");

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ topic, rounds, style });
      }}
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-mist" htmlFor="topic">
          Topic
        </label>
        <textarea
          id="topic"
          rows={3}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full resize-y rounded-xl border border-white/10 bg-ink-900/80 px-4 py-3 text-sm text-slate-100 shadow-inner outline-none ring-accent/0 transition focus:border-accent/40 focus:ring-2 focus:ring-accent/30"
          placeholder="What should the models debate?"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-mist" htmlFor="rounds">
            Rounds (Pro + Against pairs)
          </label>
          <input
            id="rounds"
            type="number"
            min={1}
            max={12}
            value={rounds}
            onChange={(e) => setRounds(Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-ink-900/80 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-mist" htmlFor="style">
            Style (stub prefix)
          </label>
          <select
            id="style"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-ink-900/80 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/30"
          >
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading || !topic.trim()}
        className="w-full rounded-xl bg-gradient-to-r from-accent to-accent-dim px-4 py-3 text-sm font-semibold text-white shadow-panel transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Running debate…" : "Run debate"}
      </button>
    </form>
  );
}
