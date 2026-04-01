import { useMemo, useState } from "react";
import { ArbitreHeader } from "@/components/ArbitreHeader";

const SHELL = "mx-auto w-full max-w-6xl px-4 sm:px-6";

const field =
  "w-full border border-arb-border bg-arb-bg px-3 py-2 font-mono text-xs text-arb-text outline-none transition focus:border-arb-muted focus:ring-1 focus:ring-arb-border";
const labelMono = "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-arb-muted";

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [err, setErr] = useState<string | null>(null);

  const canSend = useMemo(() => {
    const e = email.trim();
    return e.includes("@") && message.trim().length >= 10;
  }, [email, message]);

  const submit = () => {
    setErr(null);
    const e = email.trim();
    const m = message.trim();
    if (!e.includes("@") || m.length < 10) {
      setErr("Enter a valid email and a message.");
      return;
    }
    const subject = "arbitre beta invite request";
    const lines = [
      "New beta invite request",
      "",
      name.trim() ? `Name: ${name.trim()}` : null,
      `Email: ${e}`,
      "",
      m,
    ].filter(Boolean) as string[];
    const body = lines.join("\n");
    // Reuse the existing mailto approach used by "Contact sales" on /plans.
    window.location.href = `mailto:support@arbitre.io?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus("sent");
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
            {status === "sent" ? (
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
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (canSend) submit();
                }}
              >
                <div>
                  <label className={labelMono} htmlFor="name">
                    Name (optional)
                  </label>
                  <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
                </div>
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
                  <label className={labelMono} htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={field}
                    placeholder="Tell us what you’re trying to evaluate, and who you are."
                  />
                </div>
                {err ? (
                  <p className="border border-red-900/40 bg-red-950/25 px-3 py-2 font-mono text-xs text-red-200/90">
                    {err}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={!canSend}
                  className="w-full border border-arb-accent/70 bg-arb-accent/10 px-6 py-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-arb-accent transition enabled:hover:-translate-y-px enabled:hover:bg-arb-accent/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Request key
                </button>
                <p className="font-mono text-[10px] uppercase tracking-wider text-arb-muted">
                  This opens your email client with a prefilled message.
                </p>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

