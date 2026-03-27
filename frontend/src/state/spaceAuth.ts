export type Space = "research" | "explore" | "audit";

export interface AuthSession {
  email: string;
  createdAt: string;
}

const SPACE_KEY = "arbiter.space";
const AUTH_KEY = "arbiter.auth";
const PENDING_SPACE_KEY = "arbiter.pendingSpace";

export function readSpace(): Space | null {
  try {
    const raw = window.localStorage.getItem(SPACE_KEY);
    if (raw === "research" || raw === "explore" || raw === "audit") return raw;
    return null;
  } catch {
    return null;
  }
}

export function writeSpace(s: Space): void {
  window.localStorage.setItem(SPACE_KEY, s);
}

export function readAuth(): AuthSession | null {
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeAuth(email: string): void {
  const v: AuthSession = { email, createdAt: new Date().toISOString() };
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(v));
}

export function clearAuth(): void {
  window.localStorage.removeItem(AUTH_KEY);
}

export function setPendingSpace(s: Space): void {
  window.localStorage.setItem(PENDING_SPACE_KEY, s);
}

export function popPendingSpace(): Space | null {
  try {
    const raw = window.localStorage.getItem(PENDING_SPACE_KEY);
    window.localStorage.removeItem(PENDING_SPACE_KEY);
    if (raw === "research" || raw === "explore" || raw === "audit") return raw;
    return null;
  } catch {
    return null;
  }
}

