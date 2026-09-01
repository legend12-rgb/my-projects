"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 3L13 13M13 3L3 13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path
        d="M6 2H2v4M10 2h4v4M2 10v4h4M14 10v4h-4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export { ExpandIcon };

export default function ChartModal({
  open,
  onClose,
  title,
  hint,
  headerExtra,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  hint?: string;
  headerExtra?: ReactNode;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/55 p-4 backdrop-blur-sm sm:p-10"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* app-window chrome */}
        <div className="flex items-center justify-between border-b border-black/6 px-5 py-3 dark:border-white/8">
          <div className="flex items-center gap-3">
            <span className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ec6a5f]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#f4bf50]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#61c454]" />
            </span>
            <div className="ml-1">
              <div className="text-sm font-semibold leading-tight">{title}</div>
              {hint ? <div className="text-xs text-foreground/45">{hint}</div> : null}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-foreground/45 transition-colors hover:bg-foreground/8 hover:text-foreground/80"
          >
            <CloseIcon />
          </button>
        </div>

        {headerExtra ? (
          <div className="border-b border-black/6 px-5 py-3 dark:border-white/8">{headerExtra}</div>
        ) : null}

        <div className="max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
