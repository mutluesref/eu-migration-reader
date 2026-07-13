import { memo } from 'react';
import type { DocumentData } from '../types';
import ArticleViewer from './ArticleViewer';
import ErrorBoundary from './ErrorBoundary';
import { DOC_BADGE_COLORS } from '../constants/docColors';

interface Props {
  compareRef: { documentId: string; articleNumber: string } | null;
  showCompare: boolean;
  documents: DocumentData[];
  onLoadDocument: (docId: string) => Promise<DocumentData | undefined>;
  onReferenceClick: (docId: string, articleNumber: string) => void;
  onReferenceNavigate: (docId: string, articleNumber: string) => void;
  onClose: () => void;
}

function ComparePane({
  compareRef,
  showCompare,
  documents,
  onLoadDocument,
  onReferenceClick,
  onReferenceNavigate,
  onClose,
}: Props) {
  if (!showCompare || !compareRef) return null;

  const compareDoc = documents.find((d) => d.id === compareRef.documentId);
  const compareArticle = compareDoc?.articles.find(
    (a) => String(a.number) === compareRef.articleNumber,
  );
  if (!compareDoc || !compareArticle) return null;

  return (
    <div className="w-1/2 border-l border-slate-200 dark:border-slate-700 overflow-y-auto custom-scrollbar relative flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${DOC_BADGE_COLORS[compareRef.documentId] || 'bg-slate-100 text-slate-600'}`}
          >
            {compareDoc.shortName}
          </span>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
            {compareArticle.title}
          </span>
        </div>
        <button onClick={onClose} className="btn-icon ml-2 flex-shrink-0" title="Close comparison">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ErrorBoundary>
          <div>
            <ArticleViewer
              document={compareDoc}
              articleNumber={compareRef.articleNumber}
              documents={documents}
              onLoadDocument={onLoadDocument}
              onReferenceClick={onReferenceClick}
              onReferenceNavigate={onReferenceNavigate}
            />
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default memo(ComparePane);
