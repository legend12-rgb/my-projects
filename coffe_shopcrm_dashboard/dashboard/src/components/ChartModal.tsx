"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/lib/useFocusTrap";

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
  const [rendered, setRendered] = useState(false);
  const [shown, setShown] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => setMounted(true), []);
  useFocusTrap(rendered, panelRef);

  useEffect(() => {
    if (open) {
      setRendered(true);
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    const t = setTimeout(() => setRendered(false), 180);
    return () => clearTimeout(t);
  }, [open]);

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

  if (!mounted || !rendered) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 overflow-y-auto bg-black/55 p-4 backdrop-blur-sm transition-opacity duration-200 ease-out sm:p-10 ${
        shown ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`mx-auto w-full max-w-3xl origin-top overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl outline-none transition-[opacity,transform] duration-200 ease-out dark:border-white/10 dark:bg-neutral-900 ${
          shown ? "translate-y-0 scale-100 opacity-100" : "-translate-y-2 scale-[0.98] opacity-0"
        }`}
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
              <div id={titleId} className="text-sm font-semibold leading-tight">{title}</div>
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
