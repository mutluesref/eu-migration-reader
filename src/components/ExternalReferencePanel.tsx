import { memo } from 'react';
import { getExternalCelex, getExternalName, getEurlexUrl } from '../services/references';

interface Props {
  docId: string;
  articleNumber: string;
  onClose: () => void;
}

function ExternalReferencePanel({ docId, articleNumber, onClose }: Props) {
  const celex = getExternalCelex(docId);
  const extName = getExternalName(celex);
  const displayName = extName
    ? `${extName} (${celex.substring(1, 5)}/${parseInt(celex.substring(6))})`
    : docId;
  const url = getEurlexUrl(celex);

  return (
    <div className="flex flex-col h-full dark:bg-slate-800">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider truncate">
            External Reference
          </p>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate mt-0.5">
            {displayName}
          </p>
          {articleNumber !== '1' && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Article {articleNumber}
            </p>
          )}
        </div>
        <button onClick={onClose} className="btn-icon ml-2">
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
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          This document is not loaded in the reader.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-150 active:scale-95 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Open on EUR-Lex
        </a>
      </div>
    </div>
  );
}

export default memo(ExternalReferencePanel);
