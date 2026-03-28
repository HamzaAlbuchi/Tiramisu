/**
 * /byom — Bring your own model (marketing). Static content; purple accent via --purple.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";

const GREEN = "var(--arb-green)";

function fade(delaySec: number): { opacity?: number; animationDelay?: string } {
  return { animationDelay: `${delaySec}s` };
}

function SectionReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
        }
      },
      { rootMargin: "0px 0px -48px 0px", threshold: 0.06 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`byom-reveal ${visible ? "byom-reveal-visible" : ""}${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}

function ByomSiteHeader() {
  return (
    <header
      className="sticky top-0 z-[100] flex h-14 w-full items-center border-b border-arb-border px-6 sm:px-10"
      style={{ background: "rgba(10,10,11,0.88)", backdropFilter: "blur(20px)" }}
    >
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.__TIRAMISU_NAVIGATE__?.("/");
          }}
          className="font-bebas text-[1.6rem] tracking-[0.1em]"
        >
          <span className="text-arb-accent">ARB</span>
          <span className="text-arb-text">ITER</span>
        </a>
        <nav className="flex flex-wrap items-center justify-end gap-3 sm:gap-5">
          {(
            [
              ["/", "Home"],
              ["/debate", "Debate"],
              ["/stats", "Stats"],
            ] as const
          ).map(([href, label]) => (
            <a
              key={href}
              href={href}
              onClick={(e) => {
                e.preventDefault();
                window.__TIRAMISU_NAVIGATE__?.(href);
              }}
              className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-arb-muted transition hover:text-arb-text"
            >
              {label}
            </a>
          ))}
          <a
            href="/byom"
            onClick={(e) => e.preventDefault()}
            className="relative font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--purple)] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:rounded-[2px] after:bg-[var(--purple)] after:content-['']"
            aria-current="page"
          >
            BYO Model
          </a>
          <a
            href="/plans"
            onClick={(e) => {
              e.preventDefault();
              window.__TIRAMISU_NAVIGATE__?.("/plans");
            }}
            className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-arb-muted transition hover:text-arb-text"
          >
            Plans
          </a>
        </nav>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-6 py-24 sm:px-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: `
            linear-gradient(var(--arb-border) 1px, transparent 1px),
            linear-gradient(90deg, var(--arb-border) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="pointer-events-none absolute right-0 top-1/2 h-[500px] w-[700px] max-w-[90vw] -translate-y-1/2 rounded-[50%]"
        style={{ background: "rgba(180,124,255,0.06)" }}
      />

      <div className="relative z-[1] mx-auto w-full max-w-[1100px] min-[900px]:max-w-[min(1100px,calc(100%-26rem))] min-[900px]:pr-6">
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-[2px] border px-3 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[var(--purple)] landing-fade-up"
          style={{
            background: "rgba(180,124,255,0.1)",
            borderColor: "rgba(180,124,255,0.25)",
            ...fade(0.1),
          }}
        >
          <span className="byom-purple-dot inline-block h-2 w-2 shrink-0 rounded-full bg-[var(--purple)]" />
          Coming to Developer &amp; Enterprise
        </div>

        <h1 className="mt-2">
          <span
            className="landing-fade-up block font-bebas leading-[0.88] text-arb-text"
            style={{ fontSize: "clamp(3.5rem,8vw,7rem)", ...fade(0.2) }}
          >
            BRING YOUR OWN
          </span>
          <span
            className="landing-fade-up block font-serif italic text-[var(--purple)]"
            style={{ fontSize: "clamp(3.15rem,7.2vw,6.3rem)", lineHeight: 0.88, ...fade(0.2) }}
          >
            model.
          </span>
        </h1>

        <p
          className="landing-fade-up mt-8 max-w-[460px] font-mono text-[0.78rem] leading-[1.8] text-arb-muted"
          style={fade(0.3)}
        >
          Test your locally trained or fine-tuned AI against top foundation models in a structured adversarial debate. Get
          objective bias scores, fallacy detection, and accuracy ratings — without deploying to production.
        </p>

        <div className="landing-fade-up mt-8 flex flex-wrap gap-2" style={fade(0.35)}>
          {(
            [
              ["Ollama", true],
              ["LM Studio", true],
              ["vLLM", true],
              ["OpenAI-compatible", true],
              ["Any REST endpoint", false],
            ] as const
          ).map(([label, active]) => (
            <span
              key={label}
              className="rounded-[2px] border px-2 py-1 font-mono text-[0.58rem] uppercase tracking-wider"
              style={
                active
                  ? {
                      background: "rgba(180,124,255,0.08)",
                      borderColor: "rgba(180,124,255,0.3)",
                      color: "var(--purple)",
                    }
                  : {
                      background: "var(--arb-surface)",
                      borderColor: "var(--arb-border2)",
                      color: "var(--arb-muted)",
                    }
              }
            >
              {label}
            </span>
          ))}
        </div>

        <div className="landing-fade-up mt-10" style={fade(0.4)}>
          <a
            href="/plans#waitlist"
            onClick={(e) => {
              e.preventDefault();
              window.__TIRAMISU_NAVIGATE__?.("/plans#waitlist");
            }}
            className="inline-flex items-center justify-center bg-arb-accent font-bebas text-[1rem] tracking-[0.15em] text-black transition hover:-translate-y-0.5"
            style={{ padding: "0.85rem 2rem", borderRadius: 2 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#d4eb3a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--arb-accent)";
            }}
          >
            Join Developer Waitlist →
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute right-10 top-1/2 z-[2] hidden w-[380px] max-w-[calc(100%-2rem)] min-[900px]:block -translate-y-1/2">
        <div className="landing-fade-up" style={fade(0.3)}>
          <div className="byom-float-card overflow-hidden rounded-[2px] border border-arb-border shadow-panel">
          <div className="flex items-center justify-between border-b border-arb-border bg-arb-bg px-4 py-2.5">
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-arb-muted">Custom Model Endpoint</span>
            <span className="flex items-center gap-1.5 font-mono text-[0.55rem]" style={{ color: GREEN }}>
              <span className="landing-live-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: GREEN }} />
              Connected
            </span>
          </div>
          <div className="space-y-3 bg-arb-surface p-5">
            <div>
              <p className="mb-1 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-arb-muted">Endpoint URL</p>
                <div
                  className="rounded-[2px] border bg-arb-bg px-3 py-2 font-mono text-[0.68rem] text-[var(--purple)]"
                  style={{ borderColor: "rgba(180,124,255,0.45)" }}
                >
                  http://localhost:11434/v1/chat/completions
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-arb-muted">Model name</p>
                <div
                  className="rounded-[2px] border bg-arb-bg px-3 py-2 font-mono text-[0.65rem] text-[var(--purple)]"
                  style={{ borderColor: "rgba(180,124,255,0.45)" }}
                >
                  legal-reasoning-v2
                </div>
              </div>
              <div>
                <p className="mb-1 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-arb-muted">API key</p>
                <div className="rounded-[2px] border border-arb-border bg-arb-bg px-3 py-2 font-mono text-[0.65rem] text-arb-muted">
                  optional
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-arb-muted">Format</p>
                <div className="rounded-[2px] border border-arb-border bg-arb-bg px-3 py-2 font-mono text-[0.62rem] text-arb-text">
                  OpenAI compatible
                </div>
              </div>
              <div>
                <p className="mb-1 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-arb-muted">Timeout</p>
                <div className="rounded-[2px] border border-arb-border bg-arb-bg px-3 py-2 font-mono text-[0.62rem] text-arb-text">
                  30s
                </div>
              </div>
            </div>
            <div className="border-t border-arb-border pt-3">
              <button
                type="button"
                className="w-full rounded-[2px] border py-2.5 font-bebas text-[0.9rem] tracking-[0.12em] text-[var(--purple)]"
                style={{
                  background: "rgba(180,124,255,0.1)",
                  borderColor: "rgba(180,124,255,0.3)",
                }}
              >
                ⚡ Test Connection
              </button>
              <p className="mt-3 flex items-center gap-2 font-mono text-[0.62rem]" style={{ color: GREEN }}>
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: GREEN }} />
                Endpoint responding · 847ms · Model ready
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-arb-border bg-arb-bg px-4 py-2.5">
            <span className="font-mono text-[0.55rem] uppercase tracking-wider text-arb-muted">Protocol</span>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-[2px] border px-2 py-0.5 font-mono text-[0.52rem] uppercase"
                style={{ borderColor: "rgba(76,220,140,0.35)", color: GREEN }}
              >
                OpenAI v1
              </span>
              <span
                className="rounded-[2px] border px-2 py-0.5 font-mono text-[0.52rem] uppercase"
                style={{ borderColor: "rgba(76,220,140,0.35)", color: GREEN }}
              >
                Chat Completions
              </span>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const STEP_ITEMS = [
  {
    n: "01",
    icon: "🔌",
    title: "Connect Your Model",
    desc: "Paste your local endpoint URL. Arbiter sends a test ping to verify it is responding. Works with any OpenAI-compatible API.",
    tag: "Ollama · vLLM · LM Studio",
    tagStyle: "purple" as const,
  },
  {
    n: "02",
    icon: "⚔",
    title: "Set the Debate",
    desc: "Assign your model to Pro or Against. Pick a baseline opponent — any available hosted model. Choose rounds and topic.",
    tag: "Your model vs baseline",
    tagStyle: "blue" as const,
  },
  {
    n: "03",
    icon: "💬",
    title: "Watch It Argue",
    desc: "Arbiter streams turns in real time. Your model receives full debate history and must directly respond to the opponent — genuine adversarial pressure.",
    tag: "Real interaction · No isolated prompts",
    tagStyle: "green" as const,
  },
  {
    n: "04",
    icon: "⚖",
    title: "Get the Verdict",
    desc: "A neutral judge scores both models on accuracy, logic, evidence, and bias. Export the full report as PDF — your model's performance, documented.",
    tag: "Auditable · Exportable · Repeatable",
    tagStyle: "yellow" as const,
  },
];

function HowItWorksSection() {
  return (
    <section className="border-t border-arb-border px-6 py-24 sm:px-10" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
      <div className="mx-auto max-w-[1100px]">
        <SectionReveal>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-arb-accent">——— How it works</p>
          <h2 className="mt-4 font-bebas text-[clamp(2rem,5vw,3.2rem)] leading-[0.95] tracking-wide text-arb-text">
            FOUR STEPS TO AN{" "}
            <span className="font-serif italic text-arb-accent">objective verdict</span>
          </h2>
        </SectionReveal>
        <div className="mt-12 grid grid-cols-1 gap-px border border-arb-border bg-arb-border min-[400px]:grid-cols-2 lg:grid-cols-4">
          {STEP_ITEMS.map((s) => (
            <SectionReveal key={s.n}>
              <div
                className="group h-full bg-arb-surface p-7 transition-colors hover:bg-[var(--arb-surface2)]"
                style={{ padding: "1.75rem" }}
              >
                <p className="font-bebas text-[3rem] leading-none text-[var(--arb-border2)] transition-colors duration-300 ease-out group-hover:text-[var(--purple)]">
                  {s.n}
                </p>
                <span className="mt-3 mb-3 block text-[1.25rem]">{s.icon}</span>
                <h3 className="font-bebas text-[1.1rem] tracking-wide text-arb-text">{s.title}</h3>
                <p className="mt-2 font-mono text-[0.62rem] leading-[1.75] text-arb-muted">{s.desc}</p>
                <span
                  className="mt-4 inline-block rounded-[2px] border px-2 py-1 font-mono text-[0.52rem] uppercase tracking-wider"
                  style={
                    s.tagStyle === "purple"
                      ? { borderColor: "rgba(180,124,255,0.35)", background: "rgba(180,124,255,0.06)", color: "var(--purple)" }
                      : s.tagStyle === "blue"
                        ? { borderColor: "rgba(71,200,255,0.35)", background: "rgba(71,200,255,0.06)", color: "var(--arb-pro)" }
                        : s.tagStyle === "green"
                          ? { borderColor: "rgba(76,220,140,0.35)", background: "rgba(76,220,140,0.06)", color: GREEN }
                          : { borderColor: "rgba(232,255,71,0.35)", background: "rgba(232,255,71,0.08)", color: "var(--arb-accent)" }
                  }
                >
                  {s.tag}
                </span>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function DebatePreviewSection() {
  return (
    <section className="border-t border-arb-border px-6 py-24 sm:px-10" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
      <div className="mx-auto max-w-[1100px]">
        <SectionReveal>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-arb-accent">——— In the debate interface</p>
          <h2 className="mt-4 font-bebas text-[clamp(2rem,5vw,3.2rem)] leading-[0.95] tracking-wide text-arb-text">
            YOUR MODEL IN THE <span className="font-serif italic text-[var(--purple)]">arena</span>
          </h2>
          <p className="mt-6 max-w-[640px] font-mono text-[0.78rem] leading-[1.8] text-arb-muted">
            The debate page stays the same — your custom model appears exactly like any other, clearly labelled with a Custom badge in
            purple.
          </p>
        </SectionReveal>

        <div className="mt-12 grid grid-cols-1 gap-px border border-arb-border bg-arb-border lg:grid-cols-2">
          <SectionReveal>
            <div className="h-full bg-arb-surface p-5">
              <div className="mb-4 flex items-start justify-between gap-2">
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-arb-muted">Session parameters</p>
                <button
                  type="button"
                  className="rounded-[2px] border border-arb-border bg-arb-bg px-2 py-1 font-mono text-[0.55rem] uppercase tracking-wider text-arb-muted"
                >
                  Export JSON
                </button>
              </div>
              <label className="mb-1 block font-mono text-[0.55rem] uppercase text-arb-muted">Topic</label>
              <div className="mb-4 rounded-[2px] border border-arb-border bg-arb-bg p-3 font-serif text-[0.95rem] italic leading-snug text-arb-text">
                Fine-tuned legal models outperform GPT-4o on contract analysis
              </div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="mb-1 font-mono text-[0.5rem] uppercase text-arb-pro">Pro</p>
                  <div
                    className="relative rounded-[2px] border bg-arb-bg px-3 py-2 font-mono text-[0.72rem] text-[var(--purple)]"
                    style={{ borderColor: "rgba(180,124,255,0.45)" }}
                  >
                    legal-reasoning-v2
                    <span
                      className="absolute -right-1 -top-1 rounded-[2px] px-1 font-mono text-[0.45rem] uppercase text-[var(--purple)]"
                      style={{ background: "rgba(180,124,255,0.2)", border: "1px solid rgba(180,124,255,0.35)" }}
                    >
                      Custom
                    </span>
                  </div>
                </div>
                <span className="shrink-0 font-bebas text-lg text-[var(--arb-muted2)]">VS</span>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 font-mono text-[0.5rem] uppercase text-arb-against">Against</p>
                  <div className="rounded-[2px] border border-arb-border bg-arb-bg px-3 py-2 font-mono text-[0.72rem] text-arb-text">
                    Gemini 2.0 Flash
                  </div>
                </div>
              </div>
              <div className="mb-4 grid grid-cols-3 gap-2">
                {[
                  ["Rounds", "3"],
                  ["Style", "Technical"],
                  ["Judge", "Gemini"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-[2px] border border-arb-border bg-arb-bg px-2 py-2">
                    <p className="font-mono text-[0.5rem] uppercase text-arb-muted">{k}</p>
                    <p className="font-mono text-[0.65rem] text-arb-text">{v}</p>
                  </div>
                ))}
              </div>
              <div className="w-full rounded-[2px] border border-arb-accent/80 bg-arb-accent py-2.5 text-center font-mono text-[0.72rem] font-medium uppercase tracking-[0.14em] text-black">
                ⚡ Run Debate
              </div>
            </div>
          </SectionReveal>

          <SectionReveal>
            <div className="h-full bg-arb-surface p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-arb-border pb-3">
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-arb-muted">
                  Transcript · 2 Turns · Round 1
                </p>
                <span className="flex items-center gap-1.5 font-mono text-[0.55rem] uppercase text-arb-muted">
                  <span className="landing-live-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: GREEN }} />
                  Live
                </span>
              </div>

              <div className="flex gap-3 border-b border-arb-border pb-4">
                <div className="w-[90px] shrink-0">
                  <p className="font-mono text-xs font-medium text-[var(--purple)]">
                    legal-v2
                    <span
                      className="ml-1 inline-block rounded-[2px] border px-1 align-middle font-mono text-[7px] uppercase"
                      style={{ borderColor: "rgba(180,124,255,0.4)", color: "var(--purple)" }}
                    >
                      Custom
                    </span>
                  </p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-arb-muted">Pro</p>
                  <p className="mt-1 font-mono text-[10px] text-[var(--arb-muted2)]">R1</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-[0.82rem] leading-[1.65] text-arb-text/95">
                    Fine-tuned models trained on domain-specific corpora demonstrably outperform generalist models on precision tasks —
                    our internal benchmarks show 34% higher clause identification accuracy on ISDA Master Agreements specifically.
                  </p>
                  <div className="mt-3">
                    <span className="rounded-[2px] border border-orange-900/45 bg-orange-950/25 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-orange-200/75">
                      Authority bias
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <div className="w-[90px] shrink-0">
                  <p className="font-mono text-xs font-medium text-arb-pro">Gemini</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-arb-muted">Against</p>
                  <p className="mt-1 font-mono text-[10px] text-[var(--arb-muted2)]">R1</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-[0.82rem] leading-[1.65] text-arb-text/95">
                    Internal benchmarks without external validation are not reproducible evidence. Generalist models maintain robustness
                    across contract types — a specialised model&apos;s edge on ISDA may become a liability on M&amp;A or employment
                    contracts.
                  </p>
                  <div className="mt-3">
                    <span
                      className="rounded-[2px] border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                      style={{ borderColor: "rgba(76,220,140,0.35)", color: GREEN }}
                    >
                      No bias flagged
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}

function ScoreBar({
  label,
  pct,
  value,
  fill,
}: {
  label: string;
  pct: number;
  value: string;
  fill: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-[90px] shrink-0 font-mono text-[0.6rem] text-arb-muted">{label}</span>
      <div className="h-1 flex-1 rounded-[2px] bg-[var(--arb-border2)]">
        <div className="h-1 rounded-[2px]" style={{ width: `${pct}%`, background: fill }} />
      </div>
      <span className="w-7 shrink-0 text-right font-mono text-[0.65rem] text-arb-text">{value}</span>
    </div>
  );
}

function VerdictSection() {
  return (
    <section className="border-t border-arb-border px-6 py-24 sm:px-10" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
      <div className="mx-auto max-w-[1100px]">
        <SectionReveal>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-arb-accent">——— The verdict</p>
          <h2 className="mt-4 font-bebas text-[clamp(2rem,5vw,3.2rem)] leading-[0.95] tracking-wide text-arb-text">
            SEE EXACTLY WHERE YOUR <span className="font-serif italic text-[var(--purple)]">model stands</span>
          </h2>
          <p className="mt-6 max-w-[640px] font-mono text-[0.78rem] leading-[1.8] text-arb-muted">
            Side-by-side scores tell you precisely where your model is stronger, weaker, or biased compared to the baseline. Every
            number is explainable.
          </p>
        </SectionReveal>

        <div className="mt-12 grid grid-cols-1 gap-px border border-arb-border bg-arb-border lg:grid-cols-2">
          <SectionReveal>
            <div className="h-full bg-arb-surface p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bebas text-[1.3rem] tracking-wide text-[var(--purple)]">legal-reasoning-v2</h3>
                <span
                  className="rounded-[2px] border px-2 py-0.5 font-mono text-[0.52rem] uppercase"
                  style={{ borderColor: "rgba(180,124,255,0.35)", color: "var(--purple)" }}
                >
                  Your Model
                </span>
              </div>
              <div className="space-y-3">
                <ScoreBar label="Accuracy" pct={88} value="8.8" fill="var(--purple)" />
                <ScoreBar label="Logic" pct={75} value="7.5" fill="var(--purple)" />
                <ScoreBar label="Evidence" pct={91} value="9.1" fill="var(--purple)" />
                <ScoreBar label="Consistency" pct={70} value="7.0" fill="var(--purple)" />
                <ScoreBar label="Bias score" pct={62} value="6.2" fill="var(--purple)" />
              </div>
              <div
                className="mt-6 rounded-[2px] border px-3 py-2 font-mono text-[0.62rem]"
                style={{
                  background: "rgba(232,255,71,0.06)",
                  borderColor: "rgba(232,255,71,0.15)",
                  color: "var(--arb-accent)",
                }}
              >
                🏆 Winner · Decisive · Confidence 81%
              </div>
            </div>
          </SectionReveal>
          <SectionReveal>
            <div className="h-full bg-arb-surface p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bebas text-[1.3rem] tracking-wide text-arb-pro">Gemini 2.0 Flash</h3>
                <span
                  className="rounded-[2px] border px-2 py-0.5 font-mono text-[0.52rem] uppercase"
                  style={{ borderColor: "rgba(71,200,255,0.35)", color: "var(--arb-pro)" }}
                >
                  Baseline
                </span>
              </div>
              <div className="space-y-3">
                <ScoreBar label="Accuracy" pct={72} value="7.2" fill="var(--arb-pro)" />
                <ScoreBar label="Logic" pct={80} value="8.0" fill="var(--arb-pro)" />
                <ScoreBar label="Evidence" pct={65} value="6.5" fill="var(--arb-pro)" />
                <ScoreBar label="Consistency" pct={83} value="8.3" fill="var(--arb-pro)" />
                <ScoreBar label="Bias score" pct={78} value="7.8" fill="var(--arb-pro)" />
              </div>
              <div className="mt-6 rounded-[2px] border border-[var(--arb-border2)] bg-arb-bg px-3 py-2 font-mono text-[0.62rem] text-arb-muted">
                Strong logic · Weaker domain evidence
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}

const RUNTIME_CARDS = [
  {
    icon: "🦙",
    name: "Ollama",
    desc: "Run Llama, Mistral, Gemma and hundreds of open models locally. Most popular local runtime.",
    endpoint: "localhost:11434/v1/chat/completions",
  },
  {
    icon: "🎨",
    name: "LM Studio",
    desc: "GUI-based local model runner. GGUF models, easy setup, OpenAI-compatible server built in.",
    endpoint: "localhost:1234/v1/chat/completions",
  },
  {
    icon: "⚡",
    name: "vLLM",
    desc: "High-throughput inference server for production fine-tunes. GPU-optimised, OpenAI API compatible.",
    endpoint: "localhost:8000/v1/chat/completions",
  },
  {
    icon: "🔧",
    name: "Any Endpoint",
    desc: "Custom Flask, FastAPI, or any server following the OpenAI chat completions spec works directly.",
    endpoint: "your-server.com/v1/chat/completions",
  },
];

function RuntimesSection() {
  return (
    <section className="border-t border-arb-border px-6 py-24 sm:px-10" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
      <div className="mx-auto max-w-[1100px]">
        <SectionReveal>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-arb-accent">——— Compatible runtimes</p>
          <h2 className="mt-4 font-bebas text-[clamp(2rem,5vw,3.2rem)] leading-[0.95] tracking-wide text-arb-text">
            IF IT SPEAKS <span className="font-serif italic text-arb-accent">OpenAI,</span> IT WORKS
          </h2>
          <p className="mt-6 max-w-[640px] font-mono text-[0.78rem] leading-[1.8] text-arb-muted">
            Any runtime exposing an OpenAI-compatible chat completions endpoint works out of the box. No custom integration needed.
          </p>
        </SectionReveal>
        <div className="mt-12 grid grid-cols-1 gap-px border border-arb-border bg-arb-border min-[480px]:grid-cols-2 lg:grid-cols-4">
          {RUNTIME_CARDS.map((c) => (
            <SectionReveal key={c.name}>
              <div className="h-full bg-arb-surface p-6">
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-[2px] border text-lg"
                  style={{ background: "var(--arb-bg)", borderColor: "var(--arb-border2)" }}
                >
                  {c.icon}
                </div>
                <h3 className="font-bebas text-[1.1rem] text-arb-text">{c.name}</h3>
                <p className="mt-2 font-mono text-[0.62rem] leading-[1.75] text-arb-muted">{c.desc}</p>
                <div
                  className="mt-4 break-all rounded-[2px] border px-2.5 py-1.5 font-mono text-[0.58rem] text-[var(--purple)]"
                  style={{
                    background: "rgba(180,124,255,0.06)",
                    borderColor: "rgba(180,124,255,0.15)",
                  }}
                >
                  {c.endpoint}
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TerminalSection() {
  return (
    <section className="border-t border-arb-border bg-arb-surface px-6 py-24 sm:px-10" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
        <SectionReveal>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[var(--purple)]">——— For model builders</p>
          <h2 className="mt-4 font-bebas text-[clamp(2rem,5vw,3.5rem)] leading-[0.92] tracking-wide text-arb-text">
            YOUR MODEL.
            <br />
            OUR <span className="font-serif italic text-[var(--purple)]">arena.</span>
          </h2>
          <p className="mt-6 font-mono text-[0.78rem] leading-[1.8] text-arb-muted">
            Stop eyeballing outputs. Stress-test your fine-tuned or locally trained model against a baseline in a structured adversarial
            debate — and get a verdict you can actually show someone.
          </p>
          <ul className="mt-8 space-y-4">
            {(
              [
                ["⚔", "Real adversarial pressure", "Your model faces direct rebuttals — not curated prompts."],
                ["📊", "Objective scores", "Accuracy, logic, bias, and evidence — every number explained."],
                ["📄", "Exportable proof", "PDF report with Record ID — show your stakeholders exactly how the model performed."],
                ["🔁", "Repeatable", "Run the same topic 10 times across model versions. Track improvement."],
              ] as const
            ).map(([ic, t, d]) => (
              <li key={t} className="flex gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[2px] text-sm"
                  style={{ background: "rgba(180,124,255,0.12)", border: "1px solid rgba(180,124,255,0.25)" }}
                >
                  {ic}
                </span>
                <div>
                  <p className="font-mono text-[0.68rem] text-arb-text">{t}</p>
                  <p className="mt-0.5 font-mono text-[0.6rem] leading-relaxed text-arb-muted">{d}</p>
                </div>
              </li>
            ))}
          </ul>
          <a
            href="/plans#waitlist"
            onClick={(e) => {
              e.preventDefault();
              window.__TIRAMISU_NAVIGATE__?.("/plans#waitlist");
            }}
            className="mt-10 inline-flex items-center justify-center rounded-[2px] border px-6 py-2.5 font-bebas text-[0.95rem] tracking-[0.12em] text-[var(--purple)] transition hover:bg-[rgba(180,124,255,0.06)]"
            style={{ borderColor: "rgba(180,124,255,0.45)" }}
          >
            Join Developer Waitlist →
          </a>
        </SectionReveal>
        <SectionReveal>
          <div className="overflow-hidden rounded-[2px] border border-arb-border bg-arb-bg">
            <div className="flex items-center gap-2 border-b border-arb-border px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-red-500/80" />
              <span className="h-2 w-2 rounded-full bg-amber-400/90" />
              <span className="h-2 w-2 rounded-full" style={{ background: GREEN }} />
              <span className="ml-2 font-mono text-[0.55rem] uppercase tracking-wider text-arb-muted">ngrok · Expose local model</span>
            </div>
            <div className="space-y-1 p-5 font-mono text-[0.68rem] leading-relaxed">
              <p className="text-arb-muted"># Step 1 — Start your local model</p>
              <p>
                <span className="text-[var(--purple)]">$</span> <span className="text-arb-text">ollama serve</span>
              </p>
              <p style={{ color: GREEN }}>✓ Ollama running on :11434</p>
              <p className="h-3" />
              <p className="text-arb-muted"># Step 2 — Expose with ngrok (free)</p>
              <p>
                <span className="text-[var(--purple)]">$</span> <span className="text-arb-text">ngrok http 11434</span>
              </p>
              <p>
                → <span className="text-arb-pro">https://abc123.ngrok.io</span>
              </p>
              <p className="h-3" />
              <p className="text-arb-muted"># Step 3 — Paste into Arbiter</p>
              <p>
                <span className="text-[var(--purple)]">$</span> <span className="text-arb-text">arbiter.app/debate</span>
              </p>
              <p className="pl-2 text-arb-muted">→ Custom endpoint field</p>
              <p className="pl-2 text-arb-pro">→ https://abc123.ngrok.io/v1/...</p>
              <p className="h-3" />
              <p style={{ color: GREEN }}>✓ Model connected · Ready to debate</p>
              <p>
                <span className="text-[var(--purple)]">$</span>{" "}
                <span
                  className="byom-terminal-cursor inline-block align-middle bg-arb-accent"
                  style={{ width: 8, height: 14, borderRadius: 2 }}
                />
              </p>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}

function PlansIntegrationSection() {
  return (
    <section className="border-t border-arb-border px-6 py-24 sm:px-10" style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
      <div className="mx-auto max-w-[1100px]">
        <SectionReveal>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-arb-accent">——— Where it fits</p>
          <h2 className="mt-4 font-bebas text-[clamp(2rem,5vw,3.2rem)] leading-[0.95] tracking-wide text-arb-text">
            BYO MODEL ACROSS <span className="font-serif italic text-arb-accent">tiers</span>
          </h2>
          <p className="mt-6 max-w-[640px] font-mono text-[0.78rem] leading-[1.8] text-arb-muted">
            Custom endpoint support is a Developer and Enterprise feature. Here&apos;s how each plan relates to local model testing.
          </p>
        </SectionReveal>

        <div className="mt-12 grid grid-cols-1 gap-px border border-arb-border bg-arb-border md:grid-cols-3">
          <SectionReveal>
            <div className="h-full border-t-2 bg-arb-surface p-6" style={{ borderTopColor: "var(--arb-muted2)" }}>
              <span className="inline-block rounded-[2px] border border-arb-border bg-arb-bg px-2 py-0.5 font-mono text-[0.55rem] uppercase text-arb-muted">
                Free · Beta
              </span>
              <h3 className="mt-3 font-bebas text-[1.5rem] text-[var(--arb-muted2)]">Explorer</h3>
              <p className="mt-1 font-serif text-sm italic text-arb-muted">Try Arbiter with hosted models.</p>
              <div className="mt-4 flex gap-2 rounded-[2px] border border-arb-border bg-arb-bg p-3">
                <span className="text-lg">🔌</span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[0.65rem] text-arb-muted">Custom endpoint</p>
                  <p className="font-mono text-[0.58rem] text-arb-muted">Not available on free tier</p>
                </div>
                <span className="shrink-0 rounded-[2px] border border-arb-border px-1.5 py-0.5 font-mono text-[0.5rem] uppercase text-arb-muted">
                  Not included
                </span>
              </div>
              <ul className="mt-4 space-y-1.5 font-mono text-[0.62rem] text-arb-text">
                <li>✓ 1 hosted model</li>
                <li>✓ 3 debates / day</li>
                <li>✓ PDF export</li>
                <li className="text-arb-muted/50">— Custom endpoint</li>
              </ul>
            </div>
          </SectionReveal>
          <SectionReveal>
            <div className="h-full border-t-2 bg-arb-surface p-6" style={{ borderTopColor: "var(--purple)" }}>
              <span
                className="inline-block rounded-[2px] border px-2 py-0.5 font-mono text-[0.55rem] uppercase text-[var(--purple)]"
                style={{ borderColor: "rgba(180,124,255,0.35)", background: "rgba(180,124,255,0.06)" }}
              >
                Developer
              </span>
              <h3 className="mt-3 font-bebas text-[1.5rem] text-[var(--purple)]">Developer</h3>
              <p className="mt-1 font-serif text-sm italic text-arb-muted">Test your own models against the best.</p>
              <div
                className="mt-4 flex gap-2 rounded-[2px] border p-3"
                style={{ background: "rgba(180,124,255,0.04)", borderColor: "rgba(180,124,255,0.3)" }}
              >
                <span className="text-lg text-[var(--purple)]">🔌</span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[0.65rem] text-[var(--purple)]">Custom endpoint</p>
                  <p className="font-mono text-[0.58rem] text-arb-muted">Included in this tier</p>
                </div>
                <span
                  className="shrink-0 rounded-[2px] border px-1.5 py-0.5 font-mono text-[0.5rem] uppercase text-[var(--purple)]"
                  style={{ borderColor: "rgba(180,124,255,0.35)" }}
                >
                  Included
                </span>
              </div>
              <ul className="mt-4 space-y-1.5 font-mono text-[0.62rem] text-arb-text">
                <li>✓ 3+ hosted models</li>
                <li className="font-medium text-[var(--purple)]">✓ Custom endpoint</li>
                <li>✓ Unlimited debates</li>
                <li>✓ Per-turn bias flags</li>
                <li>✓ CSV + API access</li>
              </ul>
            </div>
          </SectionReveal>
          <SectionReveal>
            <div className="h-full border-t-2 bg-arb-surface p-6" style={{ borderTopColor: "var(--arb-accent)" }}>
              <span className="inline-block rounded-[2px] border border-arb-accent/35 bg-arb-accent/10 px-2 py-0.5 font-mono text-[0.55rem] uppercase text-arb-accent">
                Enterprise
              </span>
              <h3 className="mt-3 font-bebas text-[1.5rem] text-arb-accent">Enterprise</h3>
              <p className="mt-1 font-serif text-sm italic text-arb-muted">Full control for compliance and governance teams.</p>
              <div
                className="mt-4 flex gap-2 rounded-[2px] border border-arb-border p-3"
                style={{ background: "rgba(232,255,71,0.03)" }}
              >
                <span className="text-lg text-arb-accent">🔌</span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[0.65rem] text-arb-accent">Custom endpoint</p>
                  <p className="font-mono text-[0.58rem] text-arb-muted">Included + private workspace</p>
                </div>
                <span className="shrink-0 rounded-[2px] border border-arb-accent/40 px-1.5 py-0.5 font-mono text-[0.5rem] uppercase text-arb-accent">
                  Included
                </span>
              </div>
              <ul className="mt-4 space-y-1.5 font-mono text-[0.62rem] text-arb-text">
                <li>✓ Everything in Developer</li>
                <li>✓ Custom endpoint</li>
                <li>✓ Private workspace</li>
                <li>✓ Audit trail</li>
                <li>✓ White-label PDF</li>
              </ul>
            </div>
          </SectionReveal>
        </div>

        <div className="mt-12 text-center">
          <a
            href="/plans"
            onClick={(e) => {
              e.preventDefault();
              window.__TIRAMISU_NAVIGATE__?.("/plans");
            }}
            className="font-mono text-[0.65rem] text-arb-muted transition hover:text-arb-text"
          >
            See full plan comparison →
          </a>
        </div>
      </div>
    </section>
  );
}

function ByomFooter() {
  return (
    <footer className="border-t border-arb-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.__TIRAMISU_NAVIGATE__?.("/");
          }}
          className="font-bebas text-2xl tracking-[0.08em]"
        >
          <span className="text-arb-accent">ARB</span>
          <span className="text-arb-text">ITER</span>
        </a>
        <nav className="flex flex-wrap justify-center gap-6">
          {(
            [
              ["/", "Home"],
              ["/debate", "Debate"],
              ["/stats", "Stats"],
              ["/byom", "BYO Model"],
              ["/plans", "Plans"],
            ] as const
          ).map(([href, label]) => (
            <a
              key={href}
              href={href}
              onClick={(e) => {
                e.preventDefault();
                window.__TIRAMISU_NAVIGATE__?.(href);
              }}
              className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-arb-muted hover:text-arb-text"
            >
              {label}
            </a>
          ))}
        </nav>
        <p className="max-w-xs text-center font-mono text-[0.55rem] uppercase tracking-wider text-arb-muted sm:text-left">
          BYO models · OpenAI-compatible endpoints
        </p>
      </div>
    </footer>
  );
}

export function ByomPage() {
  return (
    <div className="byom-page min-h-screen bg-arb-bg text-arb-text">
      <ByomSiteHeader />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <DebatePreviewSection />
        <VerdictSection />
        <RuntimesSection />
        <TerminalSection />
        <PlansIntegrationSection />
      </main>
      <ByomFooter />
    </div>
  );
}
