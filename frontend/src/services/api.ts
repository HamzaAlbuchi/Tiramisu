import type { DebateRequestBody, DebateResponse } from "@/types/debate";

function baseUrl(): string {
  const v = import.meta.env.VITE_API_BASE_URL;
  if (typeof v === "string" && v.length > 0) {
    return v.replace(/\/$/, "");
  }
  return "";
}

const MISSING_API_URL_MSG =
  "Production build has no API URL. Set VITE_API_BASE_URL to your backend (e.g. https://your-api.up.railway.app) in Railway variables, then redeploy the frontend so Vite can embed it at build time.";

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
