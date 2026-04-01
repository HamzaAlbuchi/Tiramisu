import { useMemo, useState } from "react";
import { isInviteKeyRequired, readInviteKey, readInviteRemainingRuns, writeInviteKey } from "@/state/inviteKey";

const field =
  "w-full border border-arb-border bg-arb-bg px-3 py-2 font-mono text-xs text-arb-text outline-none transition focus:border-arb-muted focus:ring-1 focus:ring-arb-border";
const labelMono = "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-arb-muted";

export function InviteKeyGate({ onUnlocked }: { onUnlocked?: () => void }) {
  const required = useMemo(() => isInviteKeyRequired(), []);
  const existing = useMemo(() => (typeof window === "undefined" ? null : readInviteKey()), []);
  const [key, setKey] = useState(existing ?? "");
  const [err, setErr] = useState<string | null>(null);
  const remaining = useMemo(() => (typeof window === "undefined" ? 0 : readInviteRemainingRuns()), []);

  if (!required) {
    return null;
  }

  return (
    <div className="mb-6 border border-arb-border bg-arb-surface/50 p-4 sm:p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-arb-muted">Beta access</p>
      <p className="mt-2 font-mono text-xs leading-relaxed text-arb-muted">
        Enter an invitation key to unlock 3 debate runs.
      </p>

      <form
        className="mt-4 grid gap-3 sm:grid-cols-[1fr,auto]"
        onSubmit={(e) => {
          e.preventDefault();
          setErr(null);
          const t = key.trim();
          if (t.length < 4) {
            setErr("Enter a valid invitation key.");
            return;
          }
          writeInviteKey(t);
          onUnlocked?.();
        }}
      >
        <div>
          <label className={labelMono} htmlFor="invite-key">
            Invitation key
          </label>
          <input
            id="invite-key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className={field}
            placeholder="e.g. ARBITRE-BETA-XXXX"
            autoComplete="off"
          />
          {err ? (
            <p className="mt-2 border border-red-900/40 bg-red-950/25 px-3 py-2 font-mono text-xs text-red-200/90">
              {err}
            </p>
          ) : null}
        </div>
        <div className="sm:pt-[18px]">
          <button
            type="submit"
            className="w-full border border-arb-accent/70 bg-arb-accent/10 px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.2em] text-arb-accent transition hover:-translate-y-px hover:bg-arb-accent/20"
          >
            Unlock
          </button>
        </div>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <a
          href="/contact"
          onClick={(e) => {
            e.preventDefault();
            window.__TIRAMISU_NAVIGATE__?.("/contact");
          }}
          className="font-mono text-[10px] uppercase tracking-wider text-arb-accent hover:opacity-90"
        >
          Request a key →
        </a>
        <span className="font-mono text-[10px] text-arb-border">|</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-arb-muted">
          Runs remaining: {remaining}
        </span>
      </div>
    </div>
  );
}

