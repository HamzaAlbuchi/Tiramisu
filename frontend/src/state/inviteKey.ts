const STORAGE_KEY = "arbiter.inviteKey";

export function isInviteKeyRequired(): boolean {
  // Beta lock-down: require in production by default.
  const flag = import.meta.env.VITE_REQUIRE_INVITE_KEY;
  if (typeof flag === "string") {
    return flag.toLowerCase() === "true";
  }
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
}

export function clearInviteKey(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

