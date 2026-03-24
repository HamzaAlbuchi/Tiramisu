import type { DebateRequestBody, DebateResponse } from "@/types/debate";

function normalizeBase(raw: string): string {
  return raw.replace(/\/$/, "");
}

/**
 * 1) Vite build-time: VITE_API_BASE_URL (e.g. local file or CI).
 * 2) Production Docker on Railway: `public/api-config.js` overwritten at container start from env VITE_API_BASE_URL.
 * 3) Dev: empty → relative `/api` (Vite proxy).
 */
function baseUrl(): string {
  const fromVite = import.meta.env.VITE_API_BASE_URL;
  if (typeof fromVite === "string" && fromVite.length > 0) {
    return normalizeBase(fromVite);
  }
  if (typeof window !== "undefined" && typeof window.__TIRAMISU_API_BASE__ === "string" && window.__TIRAMISU_API_BASE__.length > 0) {
    return normalizeBase(window.__TIRAMISU_API_BASE__);
  }
  return "";
}

const MISSING_API_URL_MSG =
  "Set VITE_API_BASE_URL on the frontend Railway service to your API origin (e.g. https://backend-production-4ceb.up.railway.app — no trailing slash). With Docker, it is applied when the container starts; redeploy after changing it. Also allow this site in APP_CORS_ORIGINS on the API.";

export async function runDebate(body: DebateRequestBody): Promise<DebateResponse> {
  const apiBase = baseUrl();
  if (import.meta.env.PROD && !apiBase) {
    throw new Error(MISSING_API_URL_MSG);
  }

  const url = `${apiBase}/api/debate`;
  const res = await fetch(url, {
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
      "The server returned a web page instead of JSON — the request likely hit the frontend, not the API. " +
        "Set VITE_API_BASE_URL to your Spring Boot service URL and redeploy the frontend."
    );
  }

  try {
    return JSON.parse(text) as DebateResponse;
  } catch {
    throw new Error("API response was not valid JSON.");
  }
}
