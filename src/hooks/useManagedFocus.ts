import { useEffect, useRef } from 'react';

/**
 * Manages focus for modal/panel components:
 * - Stores the element that had focus when the panel opened
 * - Focuses the panel container on mount
 * - Returns focus to the stored element when the panel closes
 * - Optionally traps Tab/Shift+Tab within the container
 */
export function useManagedFocus(
  show: boolean,
  options?: { trapFocus?: boolean }
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus the container when it first appears
  useEffect(() => {
    if (show && containerRef.current) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      containerRef.current.focus();
    }
  }, [show]);

  // Return focus when panel closes
  useEffect(() => {
    if (!show && previousFocusRef.current) {
      const el = previousFocusRef.current;
      previousFocusRef.current = null;
      // Defer to next frame so DOM has settled after panel removal
      requestAnimationFrame(() => {
        el.focus();
      });
    }
  }, [show]);

  // Focus trap: keep Tab/Shift+Tab cycling within the container
  useEffect(() => {
    if (!show || !options?.trapFocus || !containerRef.current) return;

    const container = containerRef.current;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [show, options?.trapFocus]);

  return containerRef;
}
