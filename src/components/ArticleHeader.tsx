import { memo } from 'react';
import type { DocumentData, Article } from '../types';
import { getRegulationNumber } from '../data/documents';

interface Props {
  doc: DocumentData;
  article: Article;
  copiedReg: boolean;
  onCopyReg: (text: string) => void;
  hasNote: boolean;
  onToggleNote: () => void;
}

function ArticleHeader({ doc, article, copiedReg, onCopyReg, hasNote, onToggleNote }: Props) {
  const regNumber = getRegulationNumber(doc.id);

  return (
    <div className="sticky top-0 z-10 glass dark:bg-surface-900/90 border-b border-surface-200/60 dark:border-surface-700/60 rounded-t-2xl">
      <div className="px-5 sm:px-6 pt-6 pb-5">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-[11px] uppercase tracking-wider text-brand-600 dark:text-brand-400 font-semibold">
            {doc.shortName}
          </span>
          <span
            className="text-[10px] text-surface-400 dark:text-surface-500 font-mono cursor-context-menu"
            title="Right-click to copy"
            onContextMenu={(e) => {
              e.preventDefault();
              onCopyReg(regNumber);
            }}
          >
            {regNumber}
          </span>
          {copiedReg && (
            <span className="text-[10px] text-accent-emerald font-medium animate-fade-in">
              Copied!
            </span>
          )}
          <div className="flex-1" />
          <button
            onClick={onToggleNote}
            className={`p-1.5 rounded-lg transition-colors ${hasNote ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800'}`}
            title={hasNote ? 'Edit note' : 'Add note'}
          >
            <svg
              className="w-4 h-4"
              fill={hasNote ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        </div>

        {(article.part || article.chapter || article.section) && (
          <div className="flex items-center gap-2 text-[11px] text-surface-400 dark:text-surface-500 mb-2">
            {article.part && (
              <span className="font-medium text-surface-500 dark:text-surface-400">
                {article.part.replace(/^(\w+):\s*/, 'Part $1 — ')}
              </span>
            )}
            {article.chapter && (
              <>
                {article.part && <span className="text-surface-300 dark:text-surface-600">›</span>}
                <span className="font-medium text-surface-500 dark:text-surface-400">
                  {article.chapter.replace(/^(\w+):\s*/, 'Ch. $1 — ')}
                </span>
              </>
            )}
            {article.section && (
              <>
                {(article.part || article.chapter) && (
                  <span className="text-surface-300 dark:text-surface-600">›</span>
                )}
                <span className="font-medium text-surface-500 dark:text-surface-400">
                  {article.section.replace(/^(\w+):\s*/, '§ $1 — ')}
                </span>
              </>
            )}
          </div>
        )}

        <h2 className="text-[1.625rem] font-bold text-surface-900 dark:text-surface-50 tracking-tight leading-tight">
          {article.title}
        </h2>

        {article.subject && (
          <p className="text-sm font-medium text-surface-500 dark:text-surface-400 mt-2 leading-relaxed">
            {article.subject}
          </p>
        )}
      </div>
    </div>
  );
}

export default memo(ArticleHeader);
