import { useEffect } from "react";
import { createPortal } from "react-dom";
import { EvaluationCard } from "@/components/EvaluationCard";
import { MetricsPanel } from "@/components/MetricsPanel";
import type { DebateResponse } from "@/types/debate";

interface Props {
  open: boolean;
  onClose: () => void;
  result: DebateResponse | null;
}

export function EvaluationModal({ open, onClose, result }: Props) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !result) {
    return null;
  }

  const { evaluation } = result;
  const { analysis } = evaluation;

  const modal = (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-10 sm:px-6 sm:py-14">
      <button
        type="button"
        className="fixed inset-0 bg-black/60 backdrop-blur-[1px] transition-opacity duration-200"
        onClick={onClose}
        aria-label="Dismiss evaluation"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="eval-modal-title"
        className="animate-eval-modal-in relative z-10 w-full max-w-lg rounded-xl border border-white/[0.1] bg-[#0f1117] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)] sm:max-w-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-5 py-4 sm:px-6">
          <div>
            <p id="eval-modal-title" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Evaluation
            </p>
            <p className="mt-1 text-xs text-slate-600">Subject: {result.topic}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/10 px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:border-white/15 hover:text-slate-300"
          >
            Close
          </button>
        </div>

        <div className="max-h-[min(78dvh,720px)] overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
          <div className="border-b border-white/[0.08] pb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Outcome</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">{evaluation.winnerLabel}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-xs text-slate-400">
                {evaluation.verdictType.replace(/_/g, " ")}
              </span>
              <span className="text-sm tabular-nums text-slate-500">
                Confidence{" "}
                <span className="font-medium text-slate-200">{(evaluation.confidence * 100).toFixed(0)}%</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">{analysis.summary}</p>
          </div>

          <div className="mt-6">
            <MetricsPanel models={result.models} metrics={evaluation.metrics} />
          </div>

          <div className="mt-6 border-t border-white/[0.08] pt-2">
            <EvaluationCard evaluation={evaluation} variant="default" omitVerdict />
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
