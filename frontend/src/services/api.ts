import type { DebateRequestBody, DebateResponse, DebateTurn } from "@/types/debate";

export type DebateStreamMeta = Pick<DebateResponse, "topic" | "style" | "rounds" | "exchangeCount" | "models">;

export interface StatsResponse {
  totalDebates: number;
  totalDebatesLast30Days: number;
  leaderboard: Array<{
    modelLabel: string;
    totalDebates: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    avgAccuracy: number;
    avgLogic: number;
    avgEvidence: number;
    avgConsistency: number;
    avgRhetoric: number;
  }>;
  headToHead: Array<{
    proModel: string;
    againstModel: string;
    proWins: number;
    againstWins: number;
    draws: number;
  }>;
  verdictDistribution: {
    decisive: { count: number; percentage: number };
    narrow: { count: number; percentage: number };
    draw: { count: number; percentage: number };
  };
  biasStats: {
    framingHigh: number;
    framingMedium: number;
    omissionHigh: number;
    omissionMedium: number;
    authorityHigh: number;
    authorityMedium: number;
    recencyHigh: number;
    recencyMedium: number;
  };
  topTopics: Array<{
    topic: string;
    debateCount: number;
    avgConfidence: number;
    mostCommonWinner: string;
  }>;
  recentDebates: Array<{
    recordId: string;
    topic: string;
    proModel: string;
    againstModel: string;
    winner: string;
    winnerLabel: string;
    confidence: number;
    verdictType: string;
    createdAt: string;
  }>;
}

/** Railway users often paste host only; fetch needs an absolute URL with a scheme or it hits the SPA origin. */
function normalizeApiOrigin(raw: string): string {
  let s = raw.trim();
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) {
    if (s.startsWith("//")) {
      s = `https:${s}`;
    } else if (/^(localhost|127\.0\.0\.1)(:|\/|$)/i.test(s)) {
      s = `http://${s}`;
    } else {
      s = `https://${s}`;
    }
  }
  return s.replace(/\/$/, "");
}

/**
 * 1) Vite build-time: VITE_API_BASE_URL (e.g. local file or CI).
 * 2) Production Docker on Railway: `public/api-config.js` overwritten at container start from env VITE_API_BASE_URL.
 * 3) Dev: empty → relative `/api` (Vite proxy).
 */
function baseUrl(): string {
  const fromVite = import.meta.env.VITE_API_BASE_URL;
  if (typeof fromVite === "string" && fromVite.length > 0) {
    return normalizeApiOrigin(fromVite);
  }
  if (typeof window !== "undefined" && typeof window.__TIRAMISU_API_BASE__ === "string" && window.__TIRAMISU_API_BASE__.length > 0) {
    return normalizeApiOrigin(window.__TIRAMISU_API_BASE__);
  }
  return "";
}

const MISSING_API_URL_MSG =
  "Set VITE_API_BASE_URL on the frontend service (host or full https:// URL is fine). Redeploy after changing it. Set APP_CORS_ORIGINS on the API to this frontend URL.";

function hintForNetworkFailure(url: string): string {
  // Browsers collapse many network problems into TypeError: Failed to fetch
  // (CORS blocked, mixed-content, DNS, server down, etc).
  return [
    `Network error calling API (request was: ${url}).`,
    `Likely causes:`,
    `- VITE_API_BASE_URL points to the wrong host, or the API service is down`,
    `- CORS blocked: set APP_CORS_ORIGINS on the API to your frontend URL (https://…) and redeploy`,
    `- Mixed content: frontend is https but API base is http`,
  ].join("\n");
}

async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (typeof msg === "string" && msg.toLowerCase().includes("failed to fetch")) {
      throw new Error(hintForNetworkFailure(url));
    }
    throw new Error(`${hintForNetworkFailure(url)}\n\nOriginal error: ${msg}`);
  }
}

export async function testCustomLlmConnection(body: {
  endpointUrl: string;
  apiKey?: string;
  modelId?: string;
}): Promise<{ ok: boolean; message: string }> {
  const apiBase = baseUrl();
  if (import.meta.env.PROD && !apiBase) {
    throw new Error(MISSING_API_URL_MSG);
  }
  const path = "/api/debate/custom/test";
  const url = apiBase ? `${apiBase}${path}` : path;
  const res = await safeFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpointUrl: body.endpointUrl.trim(),
      apiKey: body.apiKey ?? "",
      modelId: body.modelId ?? "",
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    return { ok: false, message: text?.slice(0, 400) || `HTTP ${res.status}` };
  }
  try {
    return JSON.parse(text) as { ok: boolean; message: string };
  } catch {
    return { ok: false, message: "Invalid response from server." };
  }
}

export async function runDebate(body: DebateRequestBody): Promise<DebateResponse> {
  const apiBase = baseUrl();
  if (import.meta.env.PROD && !apiBase) {
    throw new Error(MISSING_API_URL_MSG);
  }

  const url = `${apiBase}/api/debate`;
  const res = await safeFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text?.slice(0, 500) || `HTTP ${res.status}`);
  }

  const trimmed = text.trimStart();
  if (trimmed.startsWith("<") || trimmed.toLowerCase().startsWith("<!doctype")) {
    throw new Error(
      `Expected JSON from API but got HTML (request was: ${url}). Use a full API URL (https://…); host-only values are auto-fixed. Check CORS (APP_CORS_ORIGINS on API).`
    );
  }

  try {
    return JSON.parse(text) as DebateResponse;
  } catch {
    throw new Error("API response was not valid JSON.");
  }
}

export async function getStats(): Promise<StatsResponse> {
  const apiBase = baseUrl();
  if (import.meta.env.PROD && !apiBase) {
    throw new Error(MISSING_API_URL_MSG);
  }
  const path = "/api/stats";
  const url = apiBase ? `${apiBase}${path}` : path;
  const res = await safeFetch(url);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text?.slice(0, 500) || `HTTP ${res.status}`);
  }
  try {
    return JSON.parse(text) as StatsResponse;
  } catch {
    throw new Error("Stats response was not valid JSON.");
  }
}

function parseSseBlock(block: string): { event: string; data: string } | null {
  const lines = block.split(/\r?\n/);
  let eventName = "message";
  const dataLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      const rest = line.slice(5);
      dataLines.push(rest.startsWith(" ") ? rest.slice(1) : rest);
    }
  }
  if (dataLines.length === 0) {
    return null;
  }
  return { event: eventName, data: dataLines.join("\n") };
}

/**
 * Runs a debate with Server-Sent Events: each model turn is pushed as it is generated, then a final
 * `complete` payload matches {@link runDebate}.
 */
export async function runDebateStream(
  body: DebateRequestBody,
  options: {
    signal?: AbortSignal;
    onMeta?: (m: DebateStreamMeta) => void;
    onTurn?: (t: DebateTurn) => void;
    onComplete?: (r: DebateResponse) => void;
  } = {},
): Promise<DebateResponse> {
  const apiBase = baseUrl();
  if (import.meta.env.PROD && !apiBase) {
    throw new Error(MISSING_API_URL_MSG);
  }

  const path = "/api/debate/stream";
  const url = apiBase ? `${apiBase}${path}` : path;
  const res = await safeFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(body),
    signal: options.signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text?.slice(0, 500) || `HTTP ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("No response body (streaming not supported in this browser).");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let completePayload: DebateResponse | undefined;

  const handleBlock = (block: string) => {
    const trimmed = block.trim();
    if (!trimmed) {
      return;
    }
    const parsed = parseSseBlock(trimmed);
    if (!parsed || !parsed.data.trim()) {
      return;
    }
    const payload = JSON.parse(parsed.data) as unknown;
    switch (parsed.event) {
      case "meta":
        options.onMeta?.(payload as DebateStreamMeta);
        break;
      case "turn":
        options.onTurn?.(payload as DebateTurn);
        break;
      case "complete":
        completePayload = payload as DebateResponse;
        options.onComplete?.(completePayload);
        break;
      case "error": {
        const msg =
          typeof payload === "object" && payload !== null && "message" in payload
            ? String((payload as { message: string }).message)
            : "Debate stream error";
        throw new Error(msg);
      }
      default:
        break;
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split(/\r?\n\r?\n/);
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      handleBlock(part);
    }
  }

  if (buffer.trim()) {
    handleBlock(buffer);
  }

  if (!completePayload) {
    throw new Error("Stream ended before the debate completed.");
  }

  return completePayload;
}
