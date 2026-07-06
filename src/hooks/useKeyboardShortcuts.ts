import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  onToggleSearch: () => void;
  onToggleSidebar: () => void;
  onCloseSearch: () => void;
  onCloseInspector: () => void;
  onClearInspectedRef: () => void;
  onPrevArticle: () => void;
  onNextArticle: () => void;
}

export function useKeyboardShortcuts({
  onToggleSearch,
  onToggleSidebar,
  onCloseSearch,
  onCloseInspector,
  onClearInspectedRef,
  onPrevArticle,
  onNextArticle,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
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
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onToggleSearch, onToggleSidebar, onCloseSearch, onCloseInspector, onClearInspectedRef, onPrevArticle, onNextArticle]);
}
