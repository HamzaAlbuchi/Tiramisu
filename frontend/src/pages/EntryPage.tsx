import { useMemo } from "react";
import { ArbiterHeader } from "@/components/ArbiterHeader";
import type { Space } from "@/state/spaceAuth";
import { readAuth, setPendingSpace, writeSpace } from "@/state/spaceAuth";

const SHELL = "mx-auto w-full max-w-6xl px-4 sm:px-6";

const spaces: Array<{ key: Space; title: string; desc: string }> = [
  { key: "explore", title: "Explore", desc: "Debate anything—fun, opinions, everyday questions." },
  { key: "research", title: "Research", desc: "Structured debates for analysis and hypothesis testing." },
  { key: "enterprise", title: "Enterprise", desc: "Prepare and validate decisions before real-world impact." },
];

export function EntryPage() {
  const authed = useMemo(() => readAuth() !== null, []);

  const go = (space: Space) => {
    writeSpace(space);
    if (space === "enterprise" && !readAuth()) {
      setPendingSpace(space);
      window.__TIRAMISU_NAVIGATE__?.("/login");
      return;
    }
    window.__TIRAMISU_NAVIGATE__?.("/");
  };

  return (
    <div className="relative min-h-screen pb-20">
      <ArbiterHeader />
      <main>
        <section className={`${SHELL} pt-10 pb-8 sm:pt-14 sm:pb-10`}>
          <h1 className="max-w-4xl font-bebas text-6xl leading-[0.95] tracking-wide text-arb-text sm:text-7xl">
            Arbiter
          </h1>
          <p className="mt-3 max-w-2xl font-mono text-xs uppercase leading-relaxed tracking-[0.12em] text-arb-muted">
            AI Debate Engine for Research, Exploration, and Enterprise
          </p>
          <p className="mt-6 max-w-2xl font-serif text-lg italic leading-relaxed text-arb-muted">
            Challenge ideas, validate assumptions, and generate structured verdicts.
          </p>
        </section>

        <section className={`${SHELL} pb-16`}>
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-arb-muted">Choose your space</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {spaces.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => go(s.key)}
                className="group text-left border border-arb-border bg-arb-surface p-5 transition hover:border-arb-muted hover:bg-arb-bg/40"
              >
                <p className="font-bebas text-3xl tracking-wide text-arb-text">{s.title}</p>
                <p className="mt-2 font-mono text-xs leading-relaxed text-arb-muted">{s.desc}</p>
                {s.key === "enterprise" && !authed ? (
                  <p className="mt-4 inline-flex border border-arb-accent/50 bg-arb-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-arb-accent">
                    Login required
                  </p>
                ) : null}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

