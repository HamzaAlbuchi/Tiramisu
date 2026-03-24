import { useEffect, useState } from "react";
import type { DebateTurn } from "@/types/debate";

interface Props {
  turns: DebateTurn[];
  models: { pro: string; against: string };
  autoRevealMs?: number;
}

export function TurnTimeline({ turns, models, autoRevealMs = 0 }: Props) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    setVisible(0);
  }, [turns]);

  useEffect(() => {
    if (autoRevealMs <= 0 || turns.length === 0) {
      setVisible(turns.length);
      return;
    }
    if (visible >= turns.length) {
      return;
    }
    const t = window.setTimeout(() => setVisible((v) => v + 1), autoRevealMs);
    return () => window.clearTimeout(t);
  }, [autoRevealMs, turns.length, visible]);

  const showAll = () => setVisible(turns.length);
  const step = () => setVisible((v) => Math.min(turns.length, v + 1));

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800/40 p-5 shadow-panel backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-slate-100">Transcript</h3>
          <p className="text-xs text-mist">
            {models.pro} vs {models.against} · {turns.length} messages
          </p>
        </div>
        {autoRevealMs > 0 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={step}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10"
            >
              Next turn
            </button>
            <button
              type="button"
              onClick={showAll}
              className="rounded-lg border border-accent/30 bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent-glow hover:bg-accent/25"
            >
              Reveal all
            </button>
          </div>
        )}
      </div>
      <ol className="mt-4 space-y-3">
        {turns.slice(0, visible).map((t) => {
          const isA = t.side === "A";
          return (
            <li
              key={t.index}
              className={`rounded-xl border px-4 py-3 ${
                isA
                  ? "border-teal-glow/20 bg-teal-glow/5"
                  : "border-accent/20 bg-accent/5"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-mist">
                <span className="font-mono text-[10px] text-white/40">#{t.index + 1}</span>
                <span className="font-semibold text-slate-200">{t.modelName}</span>
                <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                  {t.role}
                </span>
                <span className="text-white/30">temp {t.temperature}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">{t.text}</p>
            </li>
          );
        })}
      </ol>
      {visible < turns.length && (
        <p className="mt-3 text-center text-xs text-mist">
          {visible} / {turns.length} shown
        </p>
      )}
    </div>
  );
}
