import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DebateTurn } from "@/types/debate";

interface Props {
  turns: DebateTurn[];
  models: { pro: string; against: string; custom?: boolean };
  /** When true, model names use BYO (purple) styling and a CUSTOM badge. */
  modelsCustom?: boolean;
  staggerMs?: number;
  thinkingMs?: number;
  tone?: "default" | "secondary";
  onDebateComplete?: () => void;
  /** When false, do not call {@link onDebateComplete} (e.g. SSE adds turns until the parent gets `complete`). */
  notifyOnComplete?: boolean;
  /** Shown below the list while more turns are still expected from the server. */
  awaitingMore?: boolean;
  /** Optional label for the awaited responder (e.g. "Gemini (Against)"). */
  awaitingLabel?: string;
  /** Optional per-turn bias flags from judge turn analysis, keyed by turn index. */
  biasFlagsByIndex?: Record<number, string[]>;
}

function tagForBiasFlag(flag: string): { label: string; className: string } | null {
  const f = (flag ?? "").toUpperCase();
  if (f === "FRAMING") {
    return { label: "Framing bias", className: "border-red-900/45 bg-red-950/25 text-red-200/75" };
  }
  if (f === "OMISSION") {
    return { label: "Omission bias", className: "border-amber-900/40 bg-amber-950/20 text-amber-200/75" };
  }
  if (f === "AUTHORITY") {
    return { label: "Authority bias", className: "border-sky-900/45 bg-sky-950/25 text-sky-200/75" };
  }
  if (f === "RECENCY") {
    return { label: "Recency bias", className: "border-fuchsia-900/40 bg-fuchsia-950/20 text-fuchsia-200/70" };
  }
  if (f === "FALSE_EQUIVALENCE") {
    return { label: "False equivalence", className: "border-orange-900/40 bg-orange-950/20 text-orange-200/75" };
  }
  return null;
}

export function TurnTimeline({
  turns,
  models,
  modelsCustom = false,
  staggerMs = 520,
  thinkingMs = 780,
  onDebateComplete,
  notifyOnComplete = true,
  awaitingMore = false,
  awaitingLabel,
  biasFlagsByIndex,
}: Props) {
  const showCustom = modelsCustom || !!models.custom;
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
      if (notifyOnComplete) {
        queueMicrotask(notifyDebateComplete);
      }
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
          notifyDebateComplete();
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
  }, [turns, staggerMs, thinkingMs, notifyOnComplete, notifyDebateComplete]);

  const liveMode = staggerMs > 0 || thinkingMs > 0;
  const roundsCount = Math.max(1, Math.ceil(turns.length / 2));

  const showAll = () => {
    clearTimersRef.current();
    setThinking(false);
    setVisible(turns.length);
    notifyDebateComplete();
  };

  const Dots = () => (
    <span className="ml-2 inline-flex items-center gap-1 align-middle">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-2 w-2 rounded-full bg-arb-accent animate-bounce"
          style={{
            animationDelay: `${i * 140}ms`,
            opacity: 0.9,
          }}
        />
      ))}
    </span>
  );

  return (
    <section className="border border-arb-border bg-arb-surface">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-arb-border px-4 py-4 sm:px-5">
        <div>
          <h3 className="font-bebas text-2xl tracking-wide text-arb-text">TRANSCRIPT</h3>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-arb-muted">
            <span className={showCustom ? "text-purple-400" : ""}>{models.pro}</span>{" "}
            <span className="text-arb-border">·</span>{" "}
            <span className={showCustom ? "text-purple-400" : ""}>{models.against}</span> · {turns.length} turns ·{" "}
            {roundsCount} round{roundsCount === 1 ? "" : "s"} · newest first
          </p>
        </div>
        {liveMode && visible < turns.length && (
          <button
            type="button"
            onClick={showAll}
            className="border border-arb-border bg-arb-bg px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-arb-muted transition hover:border-arb-muted hover:text-arb-text"
          >
            Show all
          </button>
        )}
      </div>

      {/* Status blocks should be at the top because the feed is newest-first. */}
      {awaitingMore && !thinking && (
        <div className="border-b border-arb-border px-4 py-5 sm:px-5" aria-live="polite" aria-busy="true">
          <div className="flex max-w-md items-center gap-2 font-mono text-xs text-arb-muted">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-arb-accent/50 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-arb-accent/70" />
            </span>
            Waiting for {awaitingLabel ?? "next turn"}
            <Dots />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-1 max-w-md bg-arb-border" style={{ width: "52%" }} />
            <div className="h-1 max-w-lg bg-arb-border/80" style={{ width: "70%" }} />
          </div>
        </div>
      )}

      {thinking && visible < turns.length && (
        <div className="border-b border-arb-border px-4 py-5 sm:px-5" aria-live="polite" aria-busy="true">
          <div className="flex max-w-md items-center gap-2 font-mono text-xs text-arb-muted">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-arb-muted opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-arb-muted" />
            </span>
            EVALUATING RESPONSE…
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-1 max-w-md bg-arb-border" style={{ width: "58%" }} />
            <div className="h-1 max-w-lg bg-arb-border/80" style={{ width: "78%" }} />
            <div className="h-1 max-w-xs bg-arb-border/80" style={{ width: "42%" }} />
          </div>
        </div>
      )}

      {liveMode && visible < turns.length && !thinking && (
        <p className="border-b border-arb-border py-3 text-center font-mono text-[10px] tabular-nums text-arb-muted">
          {visible} / {turns.length} revealed
        </p>
      )}

      <div className="divide-y divide-arb-border">
        {displayed.map((t, j) => {
          const isA = t.side === "A";
          const origIdx = turns.length - 1 - j;
          const roundNum = Math.floor(origIdx / 2) + 1;
          const borderColor = isA ? "border-l-arb-pro" : "border-l-arb-against";
          const nameColor = showCustom ? "text-purple-400" : isA ? "text-arb-pro" : "text-arb-against";
          const tags =
            (biasFlagsByIndex?.[t.index] ?? [])
              .map(tagForBiasFlag)
              .filter((x): x is { label: string; className: string } => x !== null);

          return (
            <article
              key={t.index}
              className={`opacity-0 animate-fade-up border-l-[3px] ${borderColor} bg-arb-bg/40 transition-colors hover:bg-arb-bg/55`}
              style={{ animationDelay: `${Math.min(j, 12) * 48}ms` }}
            >
              <div className="flex gap-4 px-4 py-5 sm:px-5">
                <div className="w-[120px] shrink-0">
                  <p className={`font-mono text-xs font-medium leading-tight ${nameColor}`}>
                    {t.modelName}
                    {showCustom ? (
                      <span className="ml-2 inline-flex align-middle rounded border border-purple-500/45 bg-purple-950/35 px-1.5 py-px font-mono text-[8px] uppercase tracking-wider text-purple-200/90">
                        Custom
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-arb-muted">{t.role}</p>
                  <p className="mt-3 font-mono text-[10px] tabular-nums text-arb-muted">R{roundNum}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-lg italic leading-relaxed text-arb-text/95 sm:text-[1.125rem]">{t.text}</p>
                  {tags.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag.label}
                          className={`border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${tag.className}`}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
