const STORAGE_KEY = "arbiter.inviteKey";
const STORAGE_REMAINING = "arbiter.inviteRemainingRuns";
const DEFAULT_RUNS = 3;

export function isInviteKeyRequired(): boolean {
  // Runtime wins: inject-api-base.cjs sets this from Railway **container** env when the app starts
  // (same as __TIRAMISU_API_BASE__). Vite only bakes VITE_* at `vite build`, so changing
  // VITE_REQUIRE_INVITE_KEY on Railway without rebuild used to leave the wrong value in the bundle.
  if (typeof window !== "undefined") {
    const w = (window as unknown as { __TIRAMISU_REQUIRE_INVITE__?: string }).__TIRAMISU_REQUIRE_INVITE__;
    if (w === "true") return true;
    if (w === "false") return false;
  }

  const flag = import.meta.env.VITE_REQUIRE_INVITE_KEY;
  if (typeof flag === "string") {
    const f = flag.toLowerCase();
    if (f === "true") return true;
    if (f === "false") return false;
  }

  // Default: require in production builds when nothing else decided.
  return import.meta.env.PROD;
}

export function readInviteKey(): string | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    const t = (v ?? "").trim();
    return t.length > 0 ? t : null;
  } catch {
    return null;
  }
}

export function writeInviteKey(key: string): void {
  const t = key.trim();
  if (!t) return;
  window.localStorage.setItem(STORAGE_KEY, t);
  // New key grants 3 debate runs.
  window.localStorage.setItem(STORAGE_REMAINING, String(DEFAULT_RUNS));
}

export function clearInviteKey(): void {
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(STORAGE_REMAINING);
  window.dispatchEvent(new Event("tiramisu:invite-cleared"));
}

export function readInviteRemainingRuns(): number {
  try {
    const raw = window.localStorage.getItem(STORAGE_REMAINING);
    const n = raw ? Number(raw) : 0;
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.floor(n);
  } catch {
    return 0;
  }
}

export function decrementInviteRemainingRuns(): number {
  const next = Math.max(0, readInviteRemainingRuns() - 1);
  window.localStorage.setItem(STORAGE_REMAINING, String(next));
  return next;
}

