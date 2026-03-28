/**
 * Public B2B marketing homepage for Arbiter.
 * Uses existing Tailwind arb-* tokens and fonts only.
 */

const GREEN = "#4cdc8c";

const fade = (delaySec: number) => ({
  animationDelay: `${delaySec}s`,
});

function scrollToSection(hash: string) {
  if (!hash.startsWith("#")) return;
  const id = hash.slice(1);
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  window.history.replaceState({}, "", hash);
}

function LandingHeader() {
  return (
    <header
      className="fixed left-0 right-0 top-0 z-[100] flex h-14 w-full items-center border-b border-arb-border px-6 sm:px-10"
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
        <nav className="flex max-w-[55vw] items-center gap-3 overflow-x-auto md:max-w-none md:gap-6">
          {(
            [
              ["#how", "How it works"],
              ["#features", "Features"],
              ["#use-cases", "Use cases"],
            ] as const
          ).map(([href, label]) => (
            <a
              key={href}
              href={href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(href);
              }}
              className="shrink-0 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-arb-muted transition hover:text-arb-text"
            >
              {label}
            </a>
          ))}
          <a
            href="/stats"
            onClick={(e) => {
              e.preventDefault();
              window.__TIRAMISU_NAVIGATE__?.("/stats");
            }}
            className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-arb-muted transition hover:text-arb-text"
          >
            Stats
          </a>
          <button
            type="button"
            onClick={() => window.__TIRAMISU_NAVIGATE__?.("/debate")}
            className="shrink-0 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-black transition hover:-translate-y-px"
            style={{
              padding: "7px 16px",
              background: "var(--arb-accent)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#d4eb3a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--arb-accent)";
            }}
          >
            <span className="hidden sm:inline">Start Debating</span>
            <span className="sm:hidden">Start</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

function LiveTicker() {
  const items = [
    <>
      <span className="inline-flex items-center gap-1.5">
        <span className="landing-live-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: GREEN }} />
        <span style={{ color: GREEN }}>LIVE</span>
      </span>{" "}
      Gemini wins on AI ethics · Confidence 82%
    </>,
    <>347 debates run · 44% decisive verdicts</>,
    <>Top performer: Gemini (Pro) · 67% win rate</>,
    <>
      Latest: Should immigration be stopped? → Against wins · 80% confidence
    </>,
    <>Framing bias most common · detected in 43% of debates</>,
  ];

  const sep = (
    <span
      className="mx-5 inline-block h-1 w-1 shrink-0 rounded-full bg-arb-accent"
      style={{ width: 4, height: 4 }}
      aria-hidden
    />
  );

  const row = (
    <>
      {items.map((content, i) => (
        <span key={i} className="inline-flex items-center whitespace-nowrap">
          {i > 0 ? sep : null}
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.15em] text-arb-muted">{content}</span>
        </span>
      ))}
    </>
  );

  return (
    <div
      className="relative z-50 overflow-hidden border-b border-arb-border bg-arb-surface"
      style={{ marginTop: 56, height: 32 }}
    >
      <div className="landing-ticker-track items-center py-2">
        <div className="flex items-center pr-16">{row}</div>
        <div className="flex items-center pr-16" aria-hidden>
          {row}
        </div>
      </div>
    </div>
  );
}

function DebatePreviewCard() {
  return (
    <div
      className="landing-float-only pointer-events-none absolute right-6 top-1/2 z-10 hidden w-[380px] max-w-[42vw] -translate-y-1/2 min-[900px]:block"
      aria-hidden
    >
      <div className="landing-fade-up overflow-hidden rounded-sm border border-arb-border bg-arb-surface shadow-panel" style={fade(0.35)}>
        <div className="flex items-center justify-between border-b border-arb-border px-4 py-2.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-arb-muted">Live debate</span>
          <span className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: GREEN }}>
            <span className="landing-live-dot inline-block h-1.5 w-1.5 rounded-full" style={{ background: GREEN }} />
            Running
          </span>
        </div>
        <div className="border-b border-arb-border px-4 py-3">
          <p className="font-serif text-[0.85rem] italic leading-snug text-arb-text">
            AI will cause more harm than good in the next decade
          </p>
        </div>
        <div className="space-y-3 px-4 py-4">
          <div className="flex gap-3">
            <div className="w-24 shrink-0 font-mono text-[9px] uppercase leading-tight tracking-wider">
              <div className="text-arb-pro">Gemini (Pro)</div>
              <div className="text-arb-muted">Pro · R1</div>
            </div>
            <p className="font-mono text-[11px] leading-relaxed text-arb-muted">
              Algorithmic bias in hiring and deepfake proliferation are already documented harms scaling faster th…
            </p>
          </div>
          <div className="flex gap-3 border-t border-arb-border pt-3">
            <div className="w-24 shrink-0 font-mono text-[9px] uppercase leading-tight tracking-wider">
              <div className="text-arb-against">Gemini (Against)</div>
              <div className="text-arb-muted">Against · R1</div>
            </div>
            <p className="font-mono text-[11px] leading-relaxed text-arb-muted">
              Historical productivity gains from prior tech waves suggest net benefit when governance catches up…
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative flex min-h-[100vh] items-center overflow-hidden px-10 py-24 sm:px-10">
      {/* Grid + glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(var(--arb-border) 1px, transparent 1px),
            linear-gradient(90deg, var(--arb-border) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "rgba(232,255,71,0.04)" }}
      />

      <div className="relative z-[1] mx-auto flex w-full max-w-[1100px] flex-col min-[900px]:max-w-[min(1100px,calc(100%-420px))] min-[900px]:pr-4">
        <p
          className="landing-fade-up font-mono text-[0.62rem] uppercase tracking-[0.22em] text-arb-accent"
          style={fade(0.1)}
        >
          ——— Multi-model debate evaluation
        </p>
        <h1 className="mt-4">
          <span
            className="landing-fade-up block font-bebas leading-[0.88] text-arb-text"
            style={{ fontSize: "clamp(5rem, 12vw, 10rem)", ...fade(0.2) }}
          >
            TRUST REQUIRES
          </span>
          <span
            className="landing-fade-up block font-serif italic text-arb-accent"
            style={{ fontSize: "clamp(4.5rem, 10.8vw, 9rem)", lineHeight: 0.88, ...fade(0.2) }}
          >
            proof.
          </span>
        </h1>
        <p
          className="landing-fade-up mt-4 font-bebas tracking-wide text-arb-muted"
          style={{ fontSize: "clamp(3rem, 7vw, 6rem)", lineHeight: 0.95, ...fade(0.3) }}
        >
          NOT CONFIDENCE. EVIDENCE.
        </p>
        <p
          className="landing-fade-up mt-8 max-w-[460px] font-mono text-[0.78rem] leading-[1.8] text-arb-muted"
          style={fade(0.4)}
        >
          Adversarial evaluation for AI teams that need more than confidence — they need evidence. Stress-test any model on
          any topic and get a structured verdict with bias scores, fallacy detection, and auditable accuracy ratings.
        </p>
        <div className="landing-fade-up mt-10 flex flex-wrap items-center gap-4" style={fade(0.5)}>
          <a
            href="/debate"
            onClick={(e) => {
              e.preventDefault();
              window.__TIRAMISU_NAVIGATE__?.("/debate");
            }}
            className="inline-flex items-center justify-center bg-arb-accent font-bebas text-[1.1rem] tracking-[0.15em] text-black transition hover:-translate-y-0.5"
            style={{ padding: "0.85rem 2.5rem" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#d4eb3a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--arb-accent)";
            }}
          >
            ⚡ Run a Debate
          </a>
          <a
            href="#how"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#how");
            }}
            className="font-mono text-[0.65rem] text-arb-muted transition hover:text-arb-text"
          >
            See how it works →
          </a>
        </div>

        <div
          className="landing-fade-up mt-14 grid max-w-3xl grid-cols-2 gap-8 border-t border-arb-border pt-10 sm:grid-cols-4"
          style={fade(0.6)}
        >
          {[
            { v: "347", label: "Debates run", c: "var(--arb-accent)" },
            { v: "67%", label: "Top win rate", c: "var(--arb-pro)" },
            { v: "82%", label: "Peak confidence", c: "var(--arb-against)" },
            { v: "44%", label: "Decisive verdicts", c: GREEN },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-bebas text-[2rem] leading-none" style={{ color: s.c }}>
                {s.v}
              </p>
              <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-arb-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <DebatePreviewCard />
    </section>
  );
}

function SectionHow() {
  return (
    <section id="how" className="scroll-mt-32 border-t border-arb-border bg-arb-bg px-6 py-20 sm:px-10">
      <div className="mx-auto max-w-4xl">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-arb-accent">How it works</p>
        <h2 className="mt-3 font-bebas text-4xl tracking-wide text-arb-text sm:text-5xl">From topic to verdict</h2>
        <ol className="mt-12 space-y-10">
          {[
            {
              n: "01",
              t: "Define the question",
              d: "Set a resolution, stance, and round count. Arbiter runs a structured Gemini vs. Gemini debate with clear roles.",
            },
            {
              n: "02",
              t: "Watch evidence emerge",
              d: "Streaming turns show each side as it is generated — no black-box batch run. The judge scores bias, accuracy, and rhetoric.",
            },
            {
              n: "03",
              t: "Export the record",
              d: "Download an audit-ready PDF with the topic, transcript, verdict, and metrics for compliance or research archives.",
            },
          ].map((step) => (
            <li key={step.n} className="flex gap-6 border-b border-arb-border pb-10 last:border-0">
              <span className="font-bebas text-3xl text-arb-accent">{step.n}</span>
              <div>
                <h3 className="font-bebas text-2xl text-arb-text">{step.t}</h3>
                <p className="mt-2 max-w-xl font-mono text-sm leading-relaxed text-arb-muted">{step.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function SectionFeatures() {
  const feats = [
    { title: "Structured verdicts", body: "Winner, confidence, and verdict type with judge narrative — not a vibe score." },
    { title: "Bias & fallacy signals", body: "Framing, authority, omission, and recency tracked across turns for governance review." },
    { title: "Stats & persistence", body: "PostgreSQL-backed aggregates when enabled — leaderboards, distributions, recent debates." },
    { title: "SSE streaming", body: "See each turn as the API returns it; failures surface with retry instead of silent drops." },
  ];
  return (
    <section id="features" className="scroll-mt-32 border-t border-arb-border px-6 py-20 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-arb-accent">Features</p>
        <h2 className="mt-3 font-bebas text-4xl tracking-wide text-arb-text sm:text-5xl">Built for evaluation, not chat</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {feats.map((f) => (
            <div key={f.title} className="border border-arb-border bg-arb-surface p-6">
              <h3 className="font-bebas text-2xl text-arb-text">{f.title}</h3>
              <p className="mt-2 font-mono text-sm leading-relaxed text-arb-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionUseCases() {
  const cases = [
    {
      title: "AI & research teams",
      body: "Compare reasoning quality on safety, policy, and technical topics before you ship or publish.",
    },
    {
      title: "Compliance & risk",
      body: "Retain PDF-ready transcripts and verdicts for audits — structured outputs, not informal chat logs.",
    },
    {
      title: "Policy & social science",
      body: "Stress-test controversial resolutions with explicit bias metrics and judge commentary.",
    },
  ];
  return (
    <section id="use-cases" className="scroll-mt-32 border-t border-arb-border bg-arb-surface/50 px-6 py-20 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-arb-accent">Use cases</p>
        <h2 className="mt-3 font-bebas text-4xl tracking-wide text-arb-text sm:text-5xl">Who Arbiter is for</h2>
        <ul className="mt-12 grid gap-6 sm:grid-cols-3">
          {cases.map((c) => (
            <li key={c.title} className="border border-arb-border bg-arb-bg/80 p-6">
              <h3 className="font-bebas text-xl text-arb-text">{c.title}</h3>
              <p className="mt-2 font-mono text-xs leading-relaxed text-arb-muted">{c.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => window.__TIRAMISU_NAVIGATE__?.("/debate")}
            className="bg-arb-accent font-bebas text-lg tracking-[0.12em] text-black transition hover:-translate-y-0.5"
            style={{ padding: "0.75rem 2rem" }}
          >
            Start Debating
          </button>
          <a
            href="/stats"
            onClick={(e) => {
              e.preventDefault();
              window.__TIRAMISU_NAVIGATE__?.("/stats");
            }}
            className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-arb-muted hover:text-arb-text"
          >
            View stats →
          </a>
        </div>
      </div>
    </section>
  );
}

export function HomeLandingPage() {
  return (
    <div className="min-h-screen bg-arb-bg text-arb-text">
      <LandingHeader />
      <LiveTicker />
      <main>
        <HeroSection />
        <SectionHow />
        <SectionFeatures />
        <SectionUseCases />
      </main>
      <footer className="border-t border-arb-border py-10 text-center font-mono text-[0.58rem] uppercase tracking-[0.14em] text-arb-muted">
        © {new Date().getFullYear()} Arbiter · Adversarial AI evaluation
      </footer>
    </div>
  );
}
