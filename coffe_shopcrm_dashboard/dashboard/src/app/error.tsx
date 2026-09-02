"use client";

import { useEffect } from "react";

/**
 * Route-level error boundary. Without this, a single component throwing during
 * render blanks the whole page — a real risk during a live demo. This catches
 * it and offers a one-click recovery instead of a white screen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in the console for debugging; not shown raw to the user.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c2703d]/10 text-[#c2703d]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="16.5" r="1.1" fill="currentColor" />
            <path
              d="M12 3l9 16H3L12 3z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">Something went wrong on this view</h2>
        <p className="mt-1.5 text-sm text-foreground/55">
          The rest of the dashboard is fine. Reload this section to continue.
        </p>
        <button
          onClick={reset}
          className="mt-5 rounded-lg bg-[#c2703d] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Reload this view
        </button>
      </div>
    </div>
  );
}
