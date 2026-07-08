import { memo } from 'react';
import { getRegulationNumber } from '../data/documents';

interface Props {
  currentDocId: string;
  currentArticleNumber: string;
  currentDocShortName: string | undefined;
}

function Footer({ currentDocId, currentArticleNumber, currentDocShortName }: Props) {
  return (
    <footer className="glass dark:bg-surface-900/80 border-t border-surface-200/60 dark:border-surface-700/60 px-4 py-2 text-xs text-surface-400 dark:text-surface-500 flex-shrink-0 flex items-center justify-between transition-colors">
      <span className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse-subtle" />
        <span className="font-medium text-surface-600 dark:text-surface-300">
          {currentDocShortName}
        </span>
        <span className="text-surface-300 dark:text-surface-600">·</span>
        <span>{getRegulationNumber(currentDocId)}</span>
        <span className="text-surface-300 dark:text-surface-600">·</span>
        <span>
          {currentArticleNumber === 'recitals' ? 'Recitals' : `Article ${currentArticleNumber}`}
        </span>
      </span>
      <span className="flex items-center gap-3">
        <span className="hidden sm:inline-flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-md text-[10px] font-medium text-surface-500 dark:text-surface-400">
            ⌘F
          </kbd>
          <span>Search</span>
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-md text-[10px] font-medium text-surface-500 dark:text-surface-400">
            ⌥←→
          </kbd>
          <span>Navigate</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-md text-[10px] font-medium text-surface-500 dark:text-surface-400">
            Esc
          </kbd>
          <span>Close</span>
        </span>
      </span>
    </footer>
  );
}

export default memo(Footer);
