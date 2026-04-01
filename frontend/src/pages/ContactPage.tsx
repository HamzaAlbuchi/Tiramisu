import { useState } from "react";
import { ArbitreHeader } from "@/components/ArbitreHeader";

const SHELL = "mx-auto w-full max-w-6xl px-4 sm:px-6";

export function ContactPage() {
  const [sent, setSent] = useState(false);

  const submit = () => {
    const subject = "arbitre beta invite request";
    const body = ["New beta invite request", "", "Please send me an invitation key."].join("\n");
    window.location.href = `mailto:support@arbitre.io?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <div className="relative min-h-screen pb-20">
      <ArbitreHeader />
      <main>
        <section className={`${SHELL} pt-10 pb-8 sm:pt-14 sm:pb-10`}>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-arb-accent">——— Contact</p>
          <h1 className="mt-3 max-w-4xl font-bebas text-6xl leading-[0.95] tracking-wide text-arb-text sm:text-7xl">
            Request beta access
          </h1>
          <p className="mt-4 max-w-2xl font-mono text-xs uppercase leading-relaxed tracking-[0.12em] text-arb-muted">
            Send a note and we&apos;ll email you an invitation key.
          </p>
        </section>

        <section className={`${SHELL} pb-16`}>
          <div className="max-w-xl border border-arb-border bg-arb-surface p-5 sm:p-8">
            {sent ? (
              <div className="border border-emerald-900/40 bg-emerald-950/20 px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-200/90">Request sent</p>
                <p className="mt-2 font-mono text-xs leading-relaxed text-emerald-200/80">
                  Thanks — we&apos;ll email you an invitation key shortly.
                </p>
                <button
                  type="button"
                  onClick={() => window.__TIRAMISU_NAVIGATE__?.("/debate")}
                  className="mt-3 border border-arb-border bg-arb-bg px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-arb-muted transition hover:border-arb-muted hover:text-arb-text"
                >
                  Back to debate
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="font-mono text-xs leading-relaxed text-arb-muted">
                  Beta keys are issued manually. Click below to email us a request.
                </p>
                <button
                  type="button"
                  onClick={submit}
                  className="w-full border border-arb-accent/70 bg-arb-accent/10 px-6 py-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-arb-accent transition hover:-translate-y-px hover:bg-arb-accent/20"
                >
                  Request key via email
                </button>
                <p className="font-mono text-[10px] uppercase tracking-wider text-arb-muted">
                  This opens your email client with a prefilled message.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

