const STORAGE_KEY = "arbiter.inviteKey";
const STORAGE_REMAINING = "arbiter.inviteRemainingRuns";
const DEFAULT_RUNS = 3;

export function isInviteKeyRequired(): boolean {
  // Must stay in sync with backend APP_INVITE_REQUIRED: if the API requires X-Invite-Key,
  // the UI must show the gate. Previously any VITE_REQUIRE_INVITE_KEY value other than
  // "true" hid the gate in prod while the API still returned 403.
  const flag = import.meta.env.VITE_REQUIRE_INVITE_KEY;
  const explicitOff = typeof flag === "string" && flag.toLowerCase() === "false";
  const explicitOn = typeof flag === "string" && flag.toLowerCase() === "true";

  if (typeof window !== "undefined") {
    const w = (window as unknown as { __TIRAMISU_REQUIRE_INVITE__?: string }).__TIRAMISU_REQUIRE_INVITE__;
    if (typeof w === "string") {
      if (w.toLowerCase() === "false") return false;
      if (w.toLowerCase() === "true") return true;
    }
  }

  if (import.meta.env.PROD) {
    return !explicitOff;
  }
  return explicitOn;
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

