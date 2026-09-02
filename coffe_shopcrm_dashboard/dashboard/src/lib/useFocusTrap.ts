import { useEffect, type RefObject } from "react";

/**
 * Basic modal a11y: when `active`, moves focus into `ref`, keeps Tab/Shift+Tab
 * cycling inside it, and restores focus to the previously-focused element on
 * close. Pair with role="dialog" + aria-modal + aria-labelledby on the element.
 */
export function useFocusTrap(active: boolean, ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = () =>
      container
        ? Array.from(
            container.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((el) => el.offsetParent !== null)
        : [];

    (focusables()[0] ?? container)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const els = focusables();
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [active, ref]);
}
