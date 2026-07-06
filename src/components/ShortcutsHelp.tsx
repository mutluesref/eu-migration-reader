import { memo } from 'react';
import { useManagedFocus } from '../hooks/useManagedFocus';

interface Props {
  show: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ['⌘', 'F'], description: 'Toggle search' },
  { keys: ['⌘', 'B'], description: 'Toggle sidebar' },
  { keys: ['Esc'], description: 'Close panels' },
  { keys: ['⌥', '←'], description: 'Previous article' },
  { keys: ['⌥', '→'], description: 'Next article' },
  { keys: ['?'], description: 'Show this help' },
];

function ShortcutsHelp({ show, onClose }: Props) {
  const focusRef = useManagedFocus(show, { trapFocus: true });

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-surface-900/50 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        ref={focusRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-sm outline-none"
        role="dialog"
        aria-label="Keyboard shortcuts"
        aria-modal="true"
      >
        <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200/60 dark:border-surface-700/60 overflow-hidden">
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50">
                Keyboard Shortcuts
              </h3>
              <button
                onClick={onClose}
                className="btn-icon"
                title="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {shortcuts.map((shortcut, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-surface-600 dark:text-surface-400">
                    {shortcut.description}
                  </span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, j) => (
                      <kbd
                        key={j}
                        className="px-2 py-1 text-xs font-medium bg-surface-100 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded text-surface-600 dark:text-surface-300"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="px-5 py-3 border-t border-surface-100 dark:border-surface-700/50 bg-surface-50 dark:bg-surface-750">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ShortcutsHelp);
