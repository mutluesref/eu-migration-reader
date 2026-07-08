import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  onToggleSearch: () => void;
  onToggleSidebar: () => void;
  onCloseSearch: () => void;
  onCloseInspector: () => void;
  onClearInspectedRef: () => void;
  onPrevArticle: () => void;
  onNextArticle: () => void;
  onToggleShortcuts: () => void;
}

export function useKeyboardShortcuts({
  onToggleSearch,
  onToggleSidebar,
  onCloseSearch,
  onCloseInspector,
  onClearInspectedRef,
  onPrevArticle,
  onNextArticle,
  onToggleShortcuts,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.metaKey || e.ctrlKey) && (e.key === 'f' || e.key === 'k')) {
        e.preventDefault();
        onToggleSearch();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        onToggleSidebar();
      }
      if (e.key === 'Escape') {
        onCloseSearch();
        onCloseInspector();
        onClearInspectedRef();
      }
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrevArticle();
      }
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        onNextArticle();
      }
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        onToggleShortcuts();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    onToggleSearch,
    onToggleSidebar,
    onCloseSearch,
    onCloseInspector,
    onClearInspectedRef,
    onPrevArticle,
    onNextArticle,
    onToggleShortcuts,
  ]);
}
