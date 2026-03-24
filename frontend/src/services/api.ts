import type { DebateRequestBody, DebateResponse } from "@/types/debate";

function baseUrl(): string {
  const v = import.meta.env.VITE_API_BASE_URL;
  if (typeof v === "string" && v.length > 0) {
    return v.replace(/\/$/, "");
  }
  return "";
}

export async function runDebate(body: DebateRequestBody): Promise<DebateResponse> {
  const url = `${baseUrl()}/api/debate`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<DebateResponse>;
}
