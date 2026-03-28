import type { DebateEvaluation, DebateMetrics, DebateModels, DebateResponse, DebateTurn } from "@/types/debate";

export type Band = "LOW" | "MED" | "HIGH";

export function bandFrom01(x: number): Band {
  const v = Math.min(1, Math.max(0, x));
  if (v < 0.34) return "LOW";
  if (v < 0.67) return "MED";
  return "HIGH";
}

export function resolveWinningModel(evaluation: DebateEvaluation, models: DebateModels): string {
  const wl = evaluation.winnerLabel.toLowerCase();
  const w = evaluation.winner.toLowerCase();
  if (wl.includes("against") || w.includes("against") || w === "b") {
    return models.against;
  }
  if (wl.includes("pro") || w.includes("pro") || w === "a") {
    return models.pro;
  }
  const proHint = models.pro.toLowerCase().slice(0, 8);
  const againstHint = models.against.toLowerCase().slice(0, 8);
  if (proHint && wl.includes(proHint)) {
    return models.pro;
  }
  if (againstHint && wl.includes(againstHint)) {
    return models.against;
  }
  return evaluation.winnerLabel;
}

export const METRIC_ROWS: { key: keyof DebateMetrics; label: string }[] = [
  { key: "clarity", label: "Accuracy" },
  { key: "logicalConsistency", label: "Logic" },
  { key: "argumentStrength", label: "Evidence" },
  { key: "rebuttalQuality", label: "Consistency" },
];

export function deriveFallacyPills(analysis: DebateEvaluation["analysis"]): { detected: string[]; clean: boolean } {
  const pool = [...analysis.weaknessesPro, ...analysis.weaknessesAgainst]
    .map((s) => s.trim())
    .filter(Boolean);
  const keywords = /fallac|straw|ad hominem|circular|false dichot|slippery|appeal to|hasty general/i;
  const hits = pool.filter((s) => keywords.test(s)).slice(0, 12);
  return { detected: hits, clean: hits.length === 0 };
}

/** Chronological transcript for legal/audit trail (UI may show newest-first). */
export function orderedTurns(turns: DebateTurn[]): DebateTurn[] {
  return [...turns].sort((a, b) => a.index - b.index);
}

export function paginateTranscript(turns: DebateTurn[], maxCharsPerPage = 4500): DebateTurn[][] {
  const sorted = orderedTurns(turns);
  if (sorted.length === 0) {
    return [];
  }
  const pages: DebateTurn[][] = [];
  let current: DebateTurn[] = [];
  let size = 0;
  for (const t of sorted) {
    const header = `${t.role} · ${t.modelName} (turn ${t.index + 1})\n`;
    const block = header + t.text + "\n\n";
    if (size + block.length > maxCharsPerPage && current.length > 0) {
      pages.push(current);
      current = [];
      size = 0;
    }
    current.push(t);
    size += block.length;
  }
  if (current.length > 0) {
    pages.push(current);
  }
  return pages;
}

export function slugifyTopic(topic: string, maxLen = 48): string {
  const s = topic
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return (s || "debate").slice(0, maxLen);
}

export function buildPdfFilename(result: DebateResponse): string {
  const day = new Date().toISOString().slice(0, 10);
  return `arbitre-formal-record-${slugifyTopic(result.topic)}-${day}.pdf`;
}

export function recordFingerprint(result: DebateResponse, generatedAt: string): string {
  const raw = `${result.topic}|${result.exchangeCount}|${result.turns.length}|${generatedAt}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) {
    h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0;
  }
  return `REC-${Math.abs(h).toString(16).toUpperCase().padStart(8, "0").slice(0, 8)}`;
}
