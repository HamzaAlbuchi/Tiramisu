import { useEffect, useMemo, useState } from "react";
import { ArbiterHeader } from "@/components/ArbiterHeader";
import { getStats, type StatsResponse } from "@/services/api";

const SHELL = "mx-auto w-full max-w-6xl px-4 sm:px-6";

function pct(x: number): string {
  return `${Math.round(Math.max(0, Math.min(1, x)) * 100)}%`;
}

function scoreDotClass(v: number): string {
  if (v >= 8) return "bg-emerald-400";
  if (v >= 6) return "bg-arb-accent";
  return "bg-red-400";
}

function truncate(s: string, n: number): string {
  const t = (s ?? "").trim();
  if (t.length <= n) return t;
  return `${t.slice(0, Math.max(0, n - 1))}…`;
}

export function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const s = await getStats();
        if (!cancelled) {
          setStats(s);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load stats");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedLeaderboard = useMemo(() => {
    if (!stats) return [];
    return [...stats.leaderboard].sort((a, b) => b.winRate - a.winRate);
  }, [stats]);

  const mostWins = useMemo(() => {
    if (!stats || stats.leaderboard.length === 0) return "n/a";
    const best = [...stats.leaderboard].sort((a, b) => b.wins - a.wins)[0];
    return best?.modelLabel ?? "n/a";
  }, [stats]);

  const mostDecisiveTopic = useMemo(() => {
    if (!stats || stats.topTopics.length === 0) return "n/a";
    // Best-effort: pick the most frequent topic (already sorted by count).
    return stats.topTopics[0]?.topic ?? "n/a";
  }, [stats]);

  return (
    <div className="relative min-h-screen pb-20">
      <ArbiterHeader />

      <main>
        <section className={`${SHELL} pt-10 pb-8 sm:pt-14 sm:pb-10`}>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-arb-accent">——— GLOBAL STATISTICS</p>
          <h1 className="mt-3 max-w-4xl font-bebas text-[clamp(3.0rem,7vw,5.5rem)] leading-[0.92] text-arb-text">
            MODEL <span className="font-serif italic text-arb-accent">performance</span>
            <br />
            SNAPSHOT
          </h1>
          <p className="mt-4 max-w-xl font-mono text-xs uppercase leading-relaxed tracking-[0.12em] text-arb-muted">
            Aggregate outcomes across all recorded debates.
          </p>
        </section>

        <section className={`${SHELL} pb-12`}>
          {error ? (
            <p className="mb-6 border border-red-900/40 bg-red-950/25 px-3 py-2 font-mono text-xs text-red-200/90">
              {error}
            </p>
          ) : null}

          {loading ? (
            <div className="border border-dashed border-arb-border bg-arb-surface/50 px-6 py-24 text-center">
              <p className="font-serif text-lg italic text-arb-muted">Loading statistics…</p>
              <p className="mt-2 font-mono text-xs text-arb-muted">Fetching leaderboard and recent debates.</p>
            </div>
          ) : stats ? (
            <>
              {/* SECTION 1: OVERVIEW CARDS */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Total Debates", value: String(stats.totalDebates) },
                  { label: "Last 30 Days", value: String(stats.totalDebatesLast30Days) },
                  { label: "Most Wins", value: mostWins },
                  { label: "Most Decisive Topic", value: truncate(mostDecisiveTopic, 38) },
                ].map((c) => (
                  <div key={c.label} className="border border-arb-border bg-arb-surface p-4 sm:p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-arb-muted">{c.label}</p>
                    <p className="mt-2 font-bebas text-4xl leading-none tracking-wide text-arb-accent">{c.value}</p>
                  </div>
                ))}
              </div>

              {/* SECTION 2: MODEL LEADERBOARD TABLE */}
              <div className="mt-10 border border-arb-border bg-arb-surface">
                <div className="border-b border-arb-border px-4 py-4 sm:px-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-arb-muted">Model leaderboard</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-[760px] w-full border-collapse">
                    <thead>
                      <tr className="border-b border-arb-border bg-arb-bg/40">
                        {["Rank", "Model", "Debates", "Win Rate", "Accuracy", "Logic", "Evidence", "Consistency"].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-arb-muted"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedLeaderboard.map((m, i) => (
                        <tr
                          key={m.modelLabel}
                          className={`border-b border-arb-border ${i === 0 ? "border-l-4 border-l-arb-accent" : ""}`}
                        >
                          <td className="px-4 py-3 font-mono text-xs text-arb-muted tabular-nums">{i + 1}</td>
                          <td className="px-4 py-3 font-mono text-xs text-arb-text">{m.modelLabel}</td>
                          <td className="px-4 py-3 font-mono text-xs text-arb-muted tabular-nums">{m.totalDebates}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs text-arb-text tabular-nums">{pct(m.winRate)}</span>
                              <div className="h-px w-24 bg-arb-border">
                                <div className="h-full bg-arb-accent" style={{ width: pct(m.winRate) }} />
                              </div>
                            </div>
                          </td>
                          {[
                            m.avgAccuracy,
                            m.avgLogic,
                            m.avgEvidence,
                            m.avgConsistency,
                          ].map((v, j) => (
                            <td key={j} className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${scoreDotClass(v)}`} />
                                <span className="font-mono text-xs text-arb-muted tabular-nums">{v.toFixed(1)}</span>
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 3: TWO COLUMN ROW */}
              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                <div className="border border-arb-border bg-arb-surface">
                  <div className="border-b border-arb-border px-4 py-4 sm:px-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-arb-muted">Verdict distribution</p>
                  </div>
                  <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
                    {[
                      { key: "decisive", label: "Decisive", tone: "text-arb-accent" },
                      { key: "narrow", label: "Narrow", tone: "text-arb-text" },
                      { key: "draw", label: "Draw", tone: "text-arb-muted" },
                    ].map((v) => {
                      const b = stats.verdictDistribution[v.key as "decisive" | "narrow" | "draw"];
                      return (
                        <div key={v.key} className="border border-arb-border bg-arb-bg/30 p-4">
                          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-arb-muted">{v.label}</p>
                          <p className={`mt-2 font-bebas text-4xl leading-none tracking-wide ${v.tone}`}>{b.count}</p>
                          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-arb-muted">{pct(b.percentage)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border border-arb-border bg-arb-surface">
                  <div className="border-b border-arb-border px-4 py-4 sm:px-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-arb-muted">Bias frequency</p>
                  </div>
                  <div className="space-y-4 p-4 sm:p-5">
                    {[
                      { label: "Framing", high: stats.biasStats.framingHigh, med: stats.biasStats.framingMedium },
                      { label: "Omission", high: stats.biasStats.omissionHigh, med: stats.biasStats.omissionMedium },
                      { label: "Authority", high: stats.biasStats.authorityHigh, med: stats.biasStats.authorityMedium },
                      { label: "Recency", high: stats.biasStats.recencyHigh, med: stats.biasStats.recencyMedium },
                    ].map((row) => {
                      const max = Math.max(1, row.high, row.med);
                      return (
                        <div key={row.label}>
                          <div className="mb-2 flex items-baseline justify-between">
                            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-arb-muted">{row.label}</p>
                            <p className="font-mono text-[10px] tabular-nums text-arb-muted">
                              HIGH {row.high} · MED {row.med}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <div className="h-1 w-full bg-arb-border">
                              <div className="h-full bg-red-400" style={{ width: `${(row.high / max) * 100}%` }} />
                            </div>
                            <div className="h-1 w-full bg-arb-border">
                              <div className="h-full bg-orange-400" style={{ width: `${(row.med / max) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION 4: RECENT DEBATES TABLE */}
              <div className="mt-10 border border-arb-border bg-arb-surface">
                <div className="border-b border-arb-border px-4 py-4 sm:px-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-arb-muted">Recent debates</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-[980px] w-full border-collapse">
                    <thead>
                      <tr className="border-b border-arb-border bg-arb-bg/40">
                        {["Date", "Topic", "Pro", "Against", "Winner", "Confidence", "Type"].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-arb-muted"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentDebates.map((d) => {
                        const winnerTone =
                          d.winner === "pro" ? "text-arb-pro" : d.winner === "against" ? "text-arb-against" : "text-arb-muted";
                        const badge =
                          d.verdictType === "decisive"
                            ? "border-arb-accent/50 bg-arb-accent/10 text-arb-accent"
                            : d.verdictType === "narrow"
                              ? "border-arb-border bg-arb-bg/30 text-arb-text"
                              : "border-arb-border bg-arb-bg/20 text-arb-muted";
                        return (
                          <tr
                            key={d.recordId}
                            className="cursor-pointer border-b border-arb-border hover:bg-arb-bg/30"
                            onClick={() => {
                              // TODO: navigate to /debate/{recordId} when detail page is implemented
                              console.log("clicked debate", d.recordId);
                            }}
                          >
                            <td className="px-4 py-3 font-mono text-xs text-arb-muted tabular-nums">
                              {new Date(d.createdAt).toISOString().slice(0, 10)}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-arb-text">{truncate(d.topic, 40)}</td>
                            <td className="px-4 py-3 font-mono text-xs text-arb-pro">{truncate(d.proModel, 18)}</td>
                            <td className="px-4 py-3 font-mono text-xs text-arb-against">{truncate(d.againstModel, 18)}</td>
                            <td className={`px-4 py-3 font-mono text-xs ${winnerTone}`}>{truncate(d.winnerLabel, 20)}</td>
                            <td className="px-4 py-3 font-mono text-xs text-arb-muted tabular-nums">
                              {pct(d.confidence)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${badge}`}>
                                {d.verdictType}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TODOs per spec */}
              <div className="mt-8 border border-dashed border-arb-border bg-arb-surface/30 px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-arb-muted">
                {/* TODO: Add date range picker filter */}
                {/* TODO: Add model filter dropdown */}
                {/* TODO: Add CSV export button (Pro feature) */}
                {/* TODO: Add radar chart per model showing score profile */}
                Stats is public for now. Future: filters, exports, and per-model charts.
              </div>
            </>
          ) : null}
        </section>
      </main>
    </div>
  );
}

