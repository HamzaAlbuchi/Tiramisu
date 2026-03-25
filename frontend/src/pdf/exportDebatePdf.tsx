import { createElement } from "react";
import { pdf } from "@react-pdf/renderer";
import type { DebateResponse } from "@/types/debate";
import { DebateAuditPdfDocument } from "@/pdf/DebateAuditPdfDocument";
import { buildPdfFilename } from "@/pdf/debateAuditPdfHelpers";
import { ensurePdfFonts } from "@/pdf/registerPdfFonts";

export async function buildDebatePdfBlob(result: DebateResponse): Promise<Blob> {
  ensurePdfFonts();
  const generatedAt = new Date().toISOString();
  const element = createElement(DebateAuditPdfDocument, { result, generatedAt });
  return pdf(element).toBlob();
}

export function triggerPdfDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportDebatePdf(result: DebateResponse): Promise<void> {
  const blob = await buildDebatePdfBlob(result);
  triggerPdfDownload(blob, buildPdfFilename(result));
}
