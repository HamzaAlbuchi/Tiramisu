/**
 * /plans — pricing, tiers, comparison, waitlist (public).
 * Uses arb-* tokens + shared typography; no new CSS variables.
 */

import { useCallback, useEffect, useState } from "react";
import { useTiramisuPath } from "@/hooks/useTiramisuPath";

const SURFACE2 = "#161618";
const BORDER2 = "#2a2a2f";
const MUTED2 = "#90909a";
const GREEN = "#4cdc8c";
const MUTED_TOP = "#6a6a72";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function PlansSiteHeader() {
  const path = useTiramisuPath();

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
          <span className="text-arb-accent">ar</span>
          <span className="text-arb-text">bitre</span>
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
            onClick={(e) => {
              e.preventDefault();
              window.__TIRAMISU_NAVIGATE__?.("/byom");
            }}
            className={
              path === "/byom"
                ? "border-b border-[var(--purple)] pb-0.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--purple)]"
                : "border-b border-transparent pb-0.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-arb-muted transition hover:border-[var(--purple)] hover:text-[var(--purple)]"
            }
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

function BetaBanner() {
  return (
    <div
      className="flex flex-col gap-4 border px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
      style={{
        background: "rgba(232,255,71,0.06)",
        borderColor: "rgba(232,255,71,0.2)",
        padding: "1rem 1.5rem",
      }}
    >
      <p className="flex items-start gap-2 font-mono text-[0.72rem] leading-relaxed text-arb-text sm:max-w-[70%]">
        <span
          className="landing-live-dot mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
          style={{ background: GREEN }}
          aria-hidden
        />
        <span>
          Currently in open beta. All features are free while we validate the product. Waitlist members get early access +
          locked-in pricing when Pro launches.
        </span>
      </p>
      <span className="shrink-0 self-start border border-arb-accent/40 bg-arb-accent/15 px-3 py-1 font-mono text-[0.58rem] uppercase tracking-wider text-arb-accent sm:self-center">
        Open Beta
      </span>
    </div>
  );
}

type PlanFeature = { ok: boolean; text: string };

function PlanCardExplorer() {
  const feats: PlanFeature[] = [
    { ok: true, text: "3 debates per day" },
    { ok: true, text: "1 model available" },
    { ok: true, text: "Structured judge verdict" },
    { ok: true, text: "Bias heatmap (overview)" },
    { ok: true, text: "PDF export" },
    { ok: false, text: "Debate history" },
    { ok: false, text: "Multi-model debates" },
    { ok: false, text: "Per-turn fallacy scan" },
  ];
  return (
    <div
      className="flex h-full flex-col border border-arb-border bg-arb-surface p-8"
      style={{ borderTopWidth: 2, borderTopColor: MUTED_TOP }}
    >
      <span className="mb-4 inline-flex w-fit border border-arb-border bg-arb-bg px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-wider text-arb-muted">
        Free · Beta
      </span>
      <h3 className="font-bebas text-[2rem] tracking-wide" style={{ color: MUTED_TOP }}>
        Explorer
      </h3>
      <p className="mt-2 font-serif text-base italic text-arb-muted">Try arbitre. No commitment, no card.</p>
      <div className="my-6 space-y-2 border-y py-6" style={{ borderColor: BORDER2 }}>
        <p className="font-mono text-[0.58rem] uppercase tracking-wider text-arb-muted">Pricing</p>
        <p className="font-bebas text-2xl text-arb-text">Always Free</p>
        <p className="font-mono text-[0.68rem] leading-relaxed text-arb-muted">
          Limited to core features. No credit card required.
        </p>
      </div>
      <ul className="flex-1 space-y-2 font-mono text-[0.68rem]">
        {feats.map((f) => (
          <li key={f.text} className={f.ok ? "text-arb-text" : "text-arb-muted/45"}>
            {f.ok ? "✓" : "—"} {f.text}
          </li>
        ))}
      </ul>
      <a
        href="/debate"
        onClick={(e) => {
          e.preventDefault();
          window.__TIRAMISU_NAVIGATE__?.("/debate");
        }}
        className="mt-8 border py-3 text-center font-mono text-[0.65rem] uppercase tracking-wider text-arb-muted transition hover:border-arb-muted hover:text-arb-text"
        style={{ borderColor: BORDER2, background: "transparent" }}
      >
        Start Debating →
      </a>
    </div>
  );
}

function PlanCardDeveloper() {
  const feats: PlanFeature[] = [
    { ok: true, text: "Unlimited debates" },
    { ok: true, text: "2 models available" },
    { ok: true, text: "Full debate history" },
    { ok: true, text: "Per-turn bias flags" },
    { ok: true, text: "Per-turn fallacy scan" },
    { ok: true, text: "PDF + CSV export" },
    { ok: true, text: "Stats & leaderboard access" },
    { ok: true, text: "BYO model endpoints" },
    { ok: false, text: "Private workspace" },
  ];
  return (
    <div className="flex h-full flex-col border border-arb-border bg-arb-surface p-8" style={{ borderTopWidth: 2, borderTopColor: "var(--arb-pro)" }}>
      <span className="mb-4 inline-flex w-fit border border-arb-pro/35 bg-arb-pro/10 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-wider text-arb-pro">
        Paid · Soon
      </span>
      <h3 className="font-bebas text-[2rem] tracking-wide text-arb-pro">Developer</h3>
      <p className="mt-2 font-serif text-base italic text-arb-muted">For teams studying AI reasoning and bias patterns at scale.</p>
      <div className="my-6 space-y-2 border-y py-6" style={{ borderColor: BORDER2 }}>
        <p className="font-mono text-[0.58rem] uppercase tracking-wider text-arb-muted">Pricing</p>
        <p className="font-bebas text-2xl text-arb-pro">Waitlist</p>
        <p className="font-mono text-[0.68rem] leading-relaxed text-arb-muted">
          Join the waitlist to be first notified when this tier launches.
        </p>
      </div>
      <ul className="flex-1 space-y-2 font-mono text-[0.68rem] text-arb-text">
        {feats.map((f) => (
          <li key={f.text} className={f.ok ? "" : "text-arb-muted/45"}>
            {f.ok ? "✓" : "—"} {f.text}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => scrollToId("waitlist")}
        className="mt-8 border py-3 font-mono text-[0.65rem] uppercase tracking-wider text-arb-pro transition hover:border-arb-pro/60"
        style={{ background: "rgba(71,200,255,0.1)", borderColor: "rgba(71,200,255,0.3)" }}
      >
        Join Waitlist →
      </button>
    </div>
  );
}

function SoonBadge() {
  return (
    <span className="ml-1 rounded-sm border border-orange-900/45 bg-orange-950/25 px-1.5 py-px font-mono text-[0.5rem] uppercase tracking-wider text-orange-200/85">
      Soon
    </span>
  );
}

const ENTERPRISE_MAIL = "mailto:enterprise@arbitre.app?subject=arbitre%20Enterprise%20inquiry";

function PlanCardEnterprise() {
  return (
    <div
      className="relative flex h-full flex-col overflow-hidden border border-arb-border p-8"
      style={{
        borderTopWidth: 2,
        borderTopColor: "var(--arb-accent)",
        background: SURFACE2,
      }}
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, rgba(232,255,71,0.12) 0%, transparent 70%)" }}
      />
      <div className="relative z-[1]">
        <span className="mb-4 inline-flex w-fit border border-arb-accent/40 bg-arb-accent/15 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-wider text-arb-accent">
          Enterprise
        </span>
        <h3 className="font-bebas text-[2rem] tracking-wide text-arb-accent">Enterprise</h3>
        <p className="mt-2 font-serif text-base italic text-arb-muted">For compliance teams that need defensible, documented AI evaluation.</p>
        <div className="my-6 space-y-2 border-y py-6" style={{ borderColor: BORDER2 }}>
          <p className="font-mono text-[0.58rem] uppercase tracking-wider text-arb-muted">Pricing</p>
          <p className="font-bebas text-2xl text-arb-accent">Waitlist</p>
          <p className="font-mono text-[0.68rem] leading-relaxed text-arb-muted">
            Priority access for compliance & audit teams. Enterprise pricing available separately.
          </p>
        </div>
        <ul className="flex-1 space-y-2 font-mono text-[0.68rem] text-arb-text">
          <li>✓ Everything in Developer</li>
          <li>
            ✓ 3+ models available
            <SoonBadge />
          </li>
          <li>✓ Private workspace</li>
          <li>
            ✓ Batch debate mode
            <SoonBadge />
          </li>
          <li>
            ✓ Custom judge rubric
            <SoonBadge />
          </li>
          <li>✓ Timestamped audit trail</li>
          <li>
            ✓ API access
            <SoonBadge />
          </li>
          <li>
            ✓ White-label PDF reports
            <SoonBadge />
          </li>
        </ul>
        <a
          href={ENTERPRISE_MAIL}
          className="mt-8 flex w-full items-center justify-center bg-arb-accent py-3 font-bebas text-lg tracking-[0.12em] text-black transition hover:-translate-y-px"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#d4eb3a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--arb-accent)";
          }}
        >
          Contact sales →
        </a>
      </div>
    </div>
  );
}

type Cell = { type: "check" | "dash" | "text" | "soon"; v?: string };

function ComparisonTable() {
  const sections: Array<{
    title: string;
    rows: Array<{ label: string; e: Cell; a: Cell; u: Cell }>;
  }> = [
    {
      title: "DEBATES",
      rows: [
        { label: "Daily limit", e: { type: "text", v: "3 / day" }, a: { type: "text", v: "Unlimited" }, u: { type: "text", v: "Unlimited" } },
        { label: "Rounds per debate", e: { type: "text", v: "Up to 3" }, a: { type: "text", v: "Up to 6" }, u: { type: "text", v: "Up to 10" } },
        { label: "Debate styles", e: { type: "text", v: "Balanced" }, a: { type: "text", v: "All" }, u: { type: "text", v: "All" } },
        { label: "Batch mode", e: { type: "dash" }, a: { type: "dash" }, u: { type: "soon" } },
      ],
    },
    {
      title: "MODELS",
      rows: [
        { label: "Models available", e: { type: "text", v: "1 model" }, a: { type: "text", v: "2 models" }, u: { type: "text", v: "3+ models" } },
        { label: "Model selection UI", e: { type: "dash" }, a: { type: "check" }, u: { type: "check" } },
        { label: "Custom judge model", e: { type: "dash" }, a: { type: "dash" }, u: { type: "soon" } },
      ],
    },
    {
      title: "EVALUATION & VERDICT",
      rows: [
        { label: "Structured verdict", e: { type: "check" }, a: { type: "check" }, u: { type: "check" } },
        { label: "Rubric scores 0–10", e: { type: "check" }, a: { type: "check" }, u: { type: "check" } },
        { label: "Bias heatmap", e: { type: "check" }, a: { type: "check" }, u: { type: "check" } },
        { label: "Per-turn bias flags", e: { type: "dash" }, a: { type: "check" }, u: { type: "check" } },
        { label: "Per-turn fallacy", e: { type: "dash" }, a: { type: "check" }, u: { type: "check" } },
        { label: "Custom rubric", e: { type: "dash" }, a: { type: "dash" }, u: { type: "soon" } },
      ],
    },
    {
      title: "EXPORT & DATA",
      rows: [
        { label: "PDF export", e: { type: "check" }, a: { type: "check" }, u: { type: "check" } },
        { label: "JSON export", e: { type: "check" }, a: { type: "check" }, u: { type: "check" } },
        { label: "CSV export", e: { type: "dash" }, a: { type: "check" }, u: { type: "check" } },
        { label: "White-label PDF", e: { type: "dash" }, a: { type: "dash" }, u: { type: "soon" } },
        { label: "Debate history", e: { type: "dash" }, a: { type: "check" }, u: { type: "check" } },
        { label: "API access", e: { type: "dash" }, a: { type: "dash" }, u: { type: "soon" } },
      ],
    },
    {
      title: "WORKSPACE & PRIVACY",
      rows: [
        { label: "Public leaderboard", e: { type: "check" }, a: { type: "check" }, u: { type: "check" } },
        { label: "Private workspace", e: { type: "dash" }, a: { type: "dash" }, u: { type: "check" } },
        { label: "Team seats", e: { type: "text", v: "1" }, a: { type: "text", v: "1" }, u: { type: "soon" } },
      ],
    },
  ];

  const renderCell = (c: Cell, col: "e" | "a" | "u") => {
    const colClass = col === "e" ? "text-arb-muted" : col === "a" ? "text-arb-pro" : "text-arb-accent";
    if (c.type === "check") {
      return (
        <span className="font-mono text-sm" style={{ color: GREEN }}>
          ✓
        </span>
      );
    }
    if (c.type === "dash") {
      return <span className="font-mono text-arb-muted">—</span>;
    }
    if (c.type === "soon") {
      return (
        <span className="rounded-sm border border-orange-900/45 bg-orange-950/25 px-1.5 py-px font-mono text-[0.52rem] uppercase text-orange-200/85">
          Soon
        </span>
      );
    }
    return <span className={`font-mono text-[0.65rem] ${colClass}`}>{c.v ?? ""}</span>;
  };

  return (
    <div className="mt-20 border-t border-arb-border pt-16">
      <h2 className="font-bebas text-3xl tracking-wide text-arb-text sm:text-4xl">Feature comparison</h2>
      <div className="mt-8 overflow-x-auto sm:overflow-visible">
        <div className="min-w-[640px]">
          <div
            className="grid border-b border-arb-border pb-3 font-mono text-[0.58rem] uppercase tracking-wider"
            style={{ gridTemplateColumns: "1fr 110px 130px 130px" }}
          >
            <span className="text-arb-muted">Feature</span>
            <span className="text-center text-arb-muted">Explorer</span>
            <span className="text-center text-arb-pro">Developer</span>
            <span className="text-center text-arb-accent">Enterprise</span>
          </div>
          {sections.map((sec) => (
            <div key={sec.title} className="mt-6">
              <div className="mb-2 bg-arb-bg py-2 pl-3 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-arb-muted">
                {sec.title}
              </div>
              {sec.rows.map((row) => (
                <div
                  key={row.label}
                  className="grid border-b border-arb-border py-3 text-sm"
                  style={{ gridTemplateColumns: "1fr 110px 130px 130px" }}
                >
                  <span className="pr-4 font-mono text-[0.68rem] text-arb-text">{row.label}</span>
                  <span className="flex justify-center">{renderCell(row.e, "e")}</span>
                  <span className="flex justify-center">{renderCell(row.a, "a")}</span>
                  <span className="flex justify-center">{renderCell(row.u, "u")}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type WaitlistTier = "developer" | "enterprise";

function WaitlistSection() {
  const [tier, setTier] = useState<WaitlistTier>("developer");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = useCallback(() => {
    const e = email.trim();
    if (!e.includes("@")) {
      return;
    }
    // TODO: POST email + tier to /api/waitlist or integrate with Resend / Mailchimp when email service is configured.
    setDone(true);
  }, [email]);

  return (
    <section
      id="waitlist"
      className="relative overflow-hidden border-t border-arb-border text-center"
      style={{ padding: "6rem 2.5rem" }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(232,255,71,0.05) 0%, transparent 70%)" }}
      />
      <div className="relative z-[1] mx-auto max-w-[560px]">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-arb-accent">Early access</p>
        <h2 className="mt-4 font-bebas leading-[0.95] tracking-wide text-arb-text" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
          <span className="block">GET NOTIFIED</span>
          <span className="block">
            WHEN <span className="font-serif italic text-arb-accent">pro</span> LAUNCHES
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-[480px] font-mono text-[0.78rem] leading-[1.8] text-arb-muted">
          Join the waitlist for your chosen tier. Waitlist members get early access, input into the roadmap, and locked-in pricing
          before public launch.
        </p>

        {done ? (
          <p className="mt-10 font-mono text-[0.85rem]" style={{ color: GREEN }}>
            You&apos;re on the list. We&apos;ll be in touch.
          </p>
        ) : (
          <div
            className="mx-auto mt-10 flex max-w-full flex-col border sm:flex-row"
            style={{ borderColor: BORDER2, background: "var(--arb-surface)" }}
          >
            <label className="sr-only" htmlFor="waitlist-tier">
              Tier
            </label>
            <select
              id="waitlist-tier"
              value={tier}
              onChange={(ev) => setTier(ev.target.value as WaitlistTier)}
              className="border-b font-mono text-[0.65rem] text-arb-text outline-none sm:w-[130px] sm:border-b-0 sm:border-r"
              style={{ borderColor: BORDER2, background: "var(--arb-bg)", padding: "0.75rem 0.5rem", appearance: "none" }}
            >
              <option value="developer">Developer</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <input
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="your@email.com"
              className="min-w-0 flex-1 border-b border-arb-border bg-arb-bg px-3 py-3 font-mono text-[0.72rem] text-arb-text outline-none placeholder:text-arb-muted sm:border-b-0"
            />
            <button
              type="button"
              onClick={submit}
              className="bg-arb-accent px-6 py-3 font-bebas text-[0.9rem] tracking-[0.15em] text-black transition sm:px-6"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#d4eb3a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--arb-accent)";
              }}
            >
              JOIN
            </button>
          </div>
        )}

        <p className="mx-auto mt-6 max-w-md font-mono text-[0.58rem] leading-relaxed" style={{ color: MUTED2 }}>
          No spam. No commitment. Unsubscribe anytime. We&apos;ll email you when your tier is ready.
        </p>
        <p className="mx-auto mt-4 flex items-center justify-center gap-2 font-mono text-[0.58rem] text-arb-muted">
          <span className="landing-live-dot inline-block h-2 w-2 rounded-full" style={{ background: GREEN }} />
          47 people already on the waitlist
        </p>
      </div>
    </section>
  );
}

const FAQ_ITEMS: Array<{ q: string; a: string }> = [
  {
    q: "Is arbitre really free right now?",
    a: "Yes — during open beta, all core features are free with no credit card required. The daily limit applies to prevent abuse while infrastructure scales.",
  },
  {
    q: "What does Waitlist pricing mean?",
    a: "Paid tiers aren't live yet. Join the waitlist and we'll notify you before launch — waitlist members get first access and early pricing.",
  },
  {
    q: "What does '1 model / 2 models / 3+ models' mean?",
    a: "During beta, debates run on a single model taking both positions. As we add providers, Developer gets 2 distinct models debating each other, and Enterprise gets full model selection across all providers.",
  },
  {
    q: "Can I use arbitre for EU AI Act compliance?",
    a: "arbitre generates structured bias and accuracy reports aligned with EU AI Act evaluation criteria. These are pre-audit documentation tools — not legally accredited audits.",
  },
  {
    q: "What is a private workspace?",
    a: "By default, debates contribute to the public leaderboard. Enterprise workspaces are fully private — your debates, topics, and results are never visible publicly.",
  },
  {
    q: "Do you offer enterprise plans?",
    a: "Yes — for larger compliance teams or custom integrations, reach out directly. Enterprise plans include API access, SLA, and white-label reports.",
  },
];

function FaqSection() {
  return (
    <section className="border-t border-arb-border px-6 py-20 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-bebas text-3xl tracking-wide text-arb-text sm:text-4xl">FAQ</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {FAQ_ITEMS.map((item) => (
            <div
              key={item.q}
              className="border border-arb-border bg-arb-surface p-6 transition-colors hover:bg-[#161618]"
              style={{ padding: "1.5rem" }}
            >
              <h3 className="font-bebas text-xl text-arb-text">{item.q}</h3>
              <p className="mt-3 font-mono text-[0.72rem] leading-relaxed text-arb-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlansFooter() {
  const path = useTiramisuPath();

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
          <span className="text-arb-accent">ar</span>
          <span className="text-arb-text">bitre</span>
        </a>
        <nav className="flex flex-wrap justify-center gap-6">
          {(
            [
              { href: "/", label: "Home", byom: false },
              { href: "/debate", label: "Debate", byom: false },
              { href: "/stats", label: "Stats", byom: false },
              { href: "/byom", label: "BYO Model", byom: true },
              { href: "/plans", label: "Plans", byom: false },
            ] as const
          ).map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                window.__TIRAMISU_NAVIGATE__?.(item.href);
              }}
              className={
                item.byom
                  ? path === "/byom"
                    ? "font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--purple)]"
                    : "font-mono text-[0.62rem] uppercase tracking-[0.16em] text-arb-muted hover:text-[var(--purple)]"
                  : "font-mono text-[0.62rem] uppercase tracking-[0.16em] text-arb-muted hover:text-arb-text"
              }
            >
              {item.label}
            </a>
          ))}
          <a href="#" className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-arb-muted hover:text-arb-text">
            Privacy
          </a>
        </nav>
        <p className="max-w-xs text-center font-mono text-[0.55rem] uppercase tracking-wider text-arb-muted sm:text-left">
          Open beta · Evaluation tooling, not legal advice
        </p>
      </div>
    </footer>
  );
}

export function PricingPage() {
  useEffect(() => {
    if (window.location.hash === "#waitlist") {
      const t = window.setTimeout(() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" }), 0);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, []);

  return (
    <div className="min-h-screen bg-arb-bg text-arb-text">
      <PlansSiteHeader />
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:px-10">
        <div className="flex items-center gap-4">
          <span className="h-px w-7 shrink-0 bg-arb-accent" style={{ width: 28 }} aria-hidden />
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-arb-accent">Plans & Access</p>
        </div>
        <h1 className="mt-6 font-bebas leading-[0.92] tracking-wide text-arb-text" style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}>
          <span className="block">CHOOSE YOUR</span>
          <span className="block font-serif italic text-arb-accent">evaluation mode</span>
        </h1>
        <p className="mt-8 max-w-[520px] font-mono text-[0.78rem] leading-[1.8] text-arb-muted">
          arbitre is free while in beta. Early access plans are forming now — join the waitlist to lock in your tier before pricing goes live. All
          plans include core debate evaluation and PDF export.
        </p>

        <div className="mt-12">
          <BetaBanner />
        </div>

        <div className="mt-16 grid gap-px bg-arb-border md:grid-cols-3 md:items-stretch">
          <div className="h-full min-h-0 bg-arb-bg">
            <PlanCardExplorer />
          </div>
          <div className="h-full min-h-0 bg-arb-bg">
            <PlanCardDeveloper />
          </div>
          <div className="h-full min-h-0 bg-arb-bg">
            <PlanCardEnterprise />
          </div>
        </div>

        <ComparisonTable />
      </main>
      <WaitlistSection />
      <FaqSection />
      <PlansFooter />
    </div>
  );
}
