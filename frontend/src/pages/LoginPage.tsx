import { useMemo, useState } from "react";
import { ArbiterHeader } from "@/components/ArbiterHeader";
import { popPendingSpace, readSpace, writeAuth, writeSpace } from "@/state/spaceAuth";

const SHELL = "mx-auto w-full max-w-6xl px-4 sm:px-6";

const field =
  "w-full border border-arb-border bg-arb-bg px-3 py-2 font-mono text-xs text-arb-text outline-none transition focus:border-arb-muted focus:ring-1 focus:ring-arb-border";
const labelMono = "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-arb-muted";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const redirectTo = useMemo(() => {
    const pending = popPendingSpace();
    return pending ?? readSpace() ?? "explore";
  }, []);

  const submit = () => {
    setErr(null);
    const e = email.trim();
    if (!e.includes("@") || pw.trim().length < 6) {
      setErr("Enter a valid email and a password (min 6 chars).");
      return;
    }
    writeAuth(e);
    writeSpace(redirectTo);
    window.__TIRAMISU_NAVIGATE__?.("/");
  };

  return (
    <div className="relative min-h-screen pb-20">
      <ArbiterHeader />
      <main>
        <section className={`${SHELL} pt-10 pb-8 sm:pt-14 sm:pb-10`}>
          <h1 className="max-w-4xl font-bebas text-6xl leading-[0.95] tracking-wide text-arb-text sm:text-7xl">
            Create your space
          </h1>
          <p className="mt-4 max-w-2xl font-serif text-lg italic leading-relaxed text-arb-muted">
            Save debates, track decisions, and generate audit-ready reports.
          </p>
        </section>

        <section className={`${SHELL} pb-16`}>
          <div className="max-w-xl border border-arb-border bg-arb-surface p-5 sm:p-8">
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <div>
                <label className={labelMono} htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={field}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className={labelMono} htmlFor="pw">
                  Password
                </label>
                <input
                  id="pw"
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className={field}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              {err ? (
                <p className="border border-red-900/40 bg-red-950/25 px-3 py-2 font-mono text-xs text-red-200/90">
                  {err}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="border border-arb-accent/70 bg-arb-accent/10 px-6 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.2em] text-arb-accent transition hover:-translate-y-px hover:bg-arb-accent/20"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={() => window.__TIRAMISU_NAVIGATE__?.("/entry")}
                  className="border border-arb-border bg-arb-bg px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-arb-muted transition hover:border-arb-muted hover:text-arb-text"
                >
                  Back
                </button>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-arb-muted">
                Lightweight login: stored locally for now.
              </p>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

