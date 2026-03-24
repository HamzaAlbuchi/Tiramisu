import { useEffect } from "react";
import { createPortal } from "react-dom";
import { VerdictPanel } from "@/components/VerdictPanel";
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

  const modal = (
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto px-3 py-8 sm:px-6 sm:py-12">
      <button
        type="button"
        className="fixed inset-0 bg-arb-bg/85 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Dismiss evaluation"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="eval-modal-title"
        className="animate-eval-modal-in relative z-10 w-full max-w-3xl border border-arb-border bg-arb-surface shadow-panel"
      >
        <div className="flex items-start justify-between gap-4 border-b border-arb-border px-4 py-3 sm:px-5">
          <div>
            <p id="eval-modal-title" className="font-mono text-[10px] uppercase tracking-[0.16em] text-arb-muted">
              Sealed evaluation
            </p>
            <p className="mt-1 font-serif text-sm italic text-arb-text/90">{result.topic}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-arb-border bg-arb-bg px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-arb-muted transition hover:border-arb-muted hover:text-arb-text"
          >
            Close
          </button>
        </div>

        <div className="max-h-[min(82dvh,880px)] overflow-y-auto overscroll-contain">
          <VerdictPanel result={result} />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
