import { memo, useMemo } from 'react';
import type { DocumentData } from '../types';
import { getDocumentShortName, getRegulationNumber } from '../data/documents';

interface Props {
  docId: string;
  articleNumber: string;
  documents: DocumentData[];
}

function Breadcrumbs({ docId, articleNumber, documents }: Props) {
  const doc = useMemo(
    () => documents.find(d => d.id === docId),
    [documents, docId]
  );

  const article = useMemo(
    () => doc?.articles.find(a => String(a.number) === articleNumber),
    [doc, articleNumber]
  );

  const shortName = getDocumentShortName(docId);
  const regNumber = getRegulationNumber(docId);

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0">
      <span className="truncate font-medium text-slate-500" title={shortName}>
        {shortName}
      </span>
      {regNumber && (
        <span className="text-slate-300 flex-shrink-0">{regNumber}</span>
      )}
      {articleNumber !== 'recitals' && article && (
        <>
          <svg
            className="w-3 h-3 flex-shrink-0 text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          {article.part && (
            <span className="text-slate-400 truncate">{article.part}</span>
          )}
          {article.chapter && (
            <>
              <span className="text-slate-300 flex-shrink-0">/</span>
              <span className="text-slate-400 truncate">{article.chapter}</span>
            </>
          )}
          {article.section && (
            <>
              <span className="text-slate-300 flex-shrink-0">/</span>
              <span className="text-slate-400 truncate">{article.section}</span>
            </>
          )}
          <svg
            className="w-3 h-3 flex-shrink-0 text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="font-medium text-slate-600 truncate">
            Article {article.number}
          </span>
        </>
      )}
      {articleNumber === 'recitals' && (
        <>
          <svg
            className="w-3 h-3 flex-shrink-0 text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="font-medium text-slate-600">Recitals</span>
        </>
      )}
    </nav>
  );
}

export default memo(Breadcrumbs);
