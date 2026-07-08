import { memo, type UIEventHandler } from 'react';
import type { DocumentData } from '../types';
import ArticleViewer from './ArticleViewer';
import ErrorBoundary from './ErrorBoundary';
import { DOC_BORDER_COLORS } from '../constants/docColors';

interface Props {
  currentDoc: DocumentData | undefined;
  currentDocId: string;
  currentArticleNumber: string;
  documents: DocumentData[];
  showCompare: boolean;
  showScrollTop: boolean;
  articleScrollRef: { current: HTMLDivElement | null };
  onReferenceClick: (docId: string, articleNumber: string) => void;
  onReferenceNavigate: (docId: string, articleNumber: string) => void;
  onScroll: UIEventHandler<HTMLDivElement>;
  onScrollToTop: () => void;
}

function ReaderPane({
  currentDoc,
  currentDocId,
  currentArticleNumber,
  documents,
  showCompare,
  showScrollTop,
  articleScrollRef,
  onReferenceClick,
  onReferenceNavigate,
  onScroll,
  onScrollToTop,
}: Props) {
  return (
    <div
      ref={articleScrollRef}
      className={`${showCompare ? 'w-1/2' : 'w-full'} overflow-y-auto custom-scrollbar relative transition-[width] duration-300`}
      onScroll={onScroll}
    >
      <ErrorBoundary>
        <div className={`border-l-4 ${DOC_BORDER_COLORS[currentDocId] || ''}`}>
          {currentDoc && (
            <ArticleViewer
              document={currentDoc}
              articleNumber={currentArticleNumber}
              documents={documents}
              onReferenceClick={onReferenceClick}
              onReferenceNavigate={onReferenceNavigate}
            />
          )}
        </div>
      </ErrorBoundary>

      {showScrollTop && (
        <button
          onClick={onScrollToTop}
          className="fixed bottom-20 right-6 z-40 w-10 h-10 rounded-full bg-white dark:bg-slate-700 shadow-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200"
          title="Scroll to top"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default memo(ReaderPane);
