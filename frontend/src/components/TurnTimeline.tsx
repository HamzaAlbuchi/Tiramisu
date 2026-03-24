import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DebateTurn } from "@/types/debate";

interface Props {
  turns: DebateTurn[];
  models: { pro: string; against: string };
  /** Pause (ms) after each message before the next “thinking” phase. 0 = show all at once. */
  staggerMs?: number;
  /** Duration (ms) of the thinking placeholder before a message appears. */
  thinkingMs?: number;
  tone?: "default" | "secondary";
  /** Fired once per `turns` run when every message is visible and not thinking (including after “Show all”). */
  onDebateComplete?: () => void;
}

export function TurnTimeline({
  turns,
  models,
  staggerMs = 520,
  thinkingMs = 780,
  tone = "default",
  onDebateComplete,
}: Props) {
  const [visible, setVisible] = useState(0);
  const [thinking, setThinking] = useState(false);
  const clearTimersRef = useRef<() => void>(() => {});
  const completeFiredRef = useRef(false);
  const onDebateCompleteRef = useRef(onDebateComplete);
  onDebateCompleteRef.current = onDebateComplete;

  const notifyDebateComplete = useCallback(() => {
    if (completeFiredRef.current) {
      return;
    }
    const cb = onDebateCompleteRef.current;
    if (!cb) {
      return;
    }
    completeFiredRef.current = true;
    cb();
  }, []);

  const displayed = useMemo(() => {
    if (visible <= 0 || turns.length === 0) {
      return [];
    }
    return turns.slice(-visible).reverse();
  }, [turns, visible]);

  useEffect(() => {
    completeFiredRef.current = false;
  }, [turns]);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (turns.length === 0) {
      setVisible(0);
      setThinking(false);
      return;
    }

    if ((staggerMs <= 0 && thinkingMs <= 0) || reduceMotion) {
      setVisible(turns.length);
      setThinking(false);
      queueMicrotask(notifyDebateComplete);
      return;
    }

    setVisible(0);
    setThinking(false);
    let cancelled = false;
    let v = 0;
    const timeouts: number[] = [];

    const clearAll = () => {
      timeouts.forEach((id) => window.clearTimeout(id));
      timeouts.length = 0;
    };

    const step = () => {
      if (cancelled || v >= turns.length) {
        return;
      }
      setThinking(true);
      const tReveal = window.setTimeout(() => {
        if (cancelled) {
          return;
        }
        setThinking(false);
        v += 1;
        setVisible(v);
        if (v >= turns.length) {
          fireComplete();
          return;
        }
        const tPause = window.setTimeout(step, staggerMs);
        timeouts.push(tPause);
      }, thinkingMs);
      timeouts.push(tReveal);
    };

    clearTimersRef.current = clearAll;
    step();
    return () => {
      cancelled = true;
      clearAll();
      clearTimersRef.current = () => {};
    };
  }, [turns, staggerMs, thinkingMs, notifyDebateComplete]);

  const panel =
    tone === "secondary"
      ? "rounded-xl border border-white/[0.07] bg-[#0c0d11]/80 p-5 md:p-6"
      : "rounded-xl border border-white/10 bg-ink-800/40 p-5 shadow-panel backdrop-blur";

  const liveMode = staggerMs > 0 || thinkingMs > 0;

  const showAll = () => {
    clearTimersRef.current();
    setThinking(false);
    setVisible(turns.length);
    notifyDebateComplete();
  };

  return (
    <section className={panel}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-slate-100">Live exchange</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {models.pro} <span className="text-slate-600">vs</span> {models.against} · {turns.length}{" "}
            turns · newest first
          </p>
        </div>
        {liveMode && visible < turns.length && (
          <button
            type="button"
            onClick={showAll}
            className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-white/15 hover:text-slate-300"
          >
            Show all
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {displayed.map((t, j) => {
          const isA = t.side === "A";
          const origIdx = turns.length - 1 - j;
          const roundBreak = origIdx > 0 && origIdx % 2 === 0;
          return (
            <article
              key={t.index}
              className={`flex w-full ${isA ? "justify-start" : "justify-end"} ${roundBreak ? "mt-2 border-t border-white/[0.06] pt-6" : ""}`}
            >
              <div
                className={`w-full max-w-[min(100%,28rem)] rounded-2xl border px-4 py-3.5 sm:px-5 ${
                  isA
                    ? "border-violet-500/20 bg-violet-500/[0.06] text-left"
                    : "border-teal-400/15 bg-teal-400/[0.05] text-left sm:text-right"
                }`}
              >
                <header
                  className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${isA ? "" : "sm:flex-row-reverse sm:justify-end"}`}
                >
                  <span className="text-sm font-semibold text-slate-100">{t.modelName}</span>
                  <span className="rounded border border-white/[0.08] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    {t.role}
                  </span>
                  <span className="text-[10px] font-medium tabular-nums text-slate-600">Turn {origIdx + 1}</span>
                </header>
                <p
                  className={`mt-3 text-[15px] leading-[1.65] text-slate-300 ${isA ? "" : "sm:ml-0 sm:text-right"}`}
                >
                  {t.text}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {thinking && visible < turns.length && (
        <div
          className="mt-2 flex justify-center sm:justify-start"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="w-full max-w-[min(100%,28rem)] rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] px-4 py-5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slate-500 opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-slate-500" />
              </span>
              Thinking…
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-2.5 max-w-md rounded bg-white/[0.06]" style={{ width: "58%" }} />
              <div className="h-2.5 max-w-lg rounded bg-white/[0.04]" style={{ width: "78%" }} />
              <div className="h-2.5 max-w-xs rounded bg-white/[0.04]" style={{ width: "42%" }} />
            </div>
          </div>
        </div>
      )}

      {liveMode && visible < turns.length && !thinking && (
        <p className="mt-4 text-center text-xs text-slate-600">
          {visible} / {turns.length} revealed
        </p>
      )}
    </section>
  );
}
