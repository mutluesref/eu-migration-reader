import { useState, useRef, useEffect, type ReactNode } from 'react';
import type { DocumentData } from '../types';
import { searchDocuments, type SearchResult, type SearchFilters, type ContentType } from '../utils/search';
import { getDocumentIndex } from '../data/documents';
import { DOC_BADGE_COLORS } from '../constants/docColors';

interface Props {
  documents: DocumentData[];
  query: string;
  onQueryChange: (q: string) => void;
  onResultClick: (docId: string, articleNumber: string) => void;
  onClose: () => void;
}

function highlightSnippet(snippet: string, query: string): ReactNode[] {
  const trimmed = query.trim();
  if (!trimmed) return [snippet];
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = snippet.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((p, i) =>
    p.toLowerCase() === trimmed.toLowerCase()
      ? <mark key={i} className="bg-yellow-100 text-slate-800 rounded-sm px-0.5 font-medium">{p}</mark>
      : p
  );
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  articles: 'Articles',
  recitals: 'Recitals',
  both: 'Both',
};

export default function SearchPanel({ documents, query, onQueryChange, onResultClick, onClose }: Props) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [documentFilter, setDocumentFilter] = useState<string>('');
  const [contentType, setContentType] = useState<ContentType>('articles');
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const docIndex = getDocumentIndex();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim().length >= 2) {
      const filters: SearchFilters = {
        documentId: documentFilter || undefined,
        contentType,
      };
      const res = searchDocuments(documents, query, filters);
      setResults(res);
      setSelectedIdx(-1);
    } else {
      setResults([]);
    }
  }, [query, documents, documentFilter, contentType]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectedIdx >= 0 && results[selectedIdx]) {
      const r = results[selectedIdx];
      onResultClick(r.documentId, r.articleNumber.replace('Recital ', 'recitals:'));
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="border-b border-slate-200 bg-white shadow-sm z-10">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="relative">
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search articles by number or keyword..."
            className="w-full pl-10 pr-20 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-shadow"
          />
          <div className="absolute right-3 top-2 flex items-center gap-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1 rounded transition-colors ${showFilters ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
              title="Filters"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
            {query && (
              <button
                onClick={() => onQueryChange('')}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                title="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filter controls */}
        {showFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">Document:</label>
              <select
                value={documentFilter}
                onChange={e => setDocumentFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All documents</option>
                {docIndex.map(d => (
                  <option key={d.id} value={d.id}>{d.shortName}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">Show:</label>
              <div className="flex bg-white border border-slate-200 rounded overflow-hidden">
                {(['articles', 'recitals', 'both'] as ContentType[]).map(ct => (
                  <button
                    key={ct}
                    onClick={() => setContentType(ct)}
                    className={`px-2.5 py-1 text-xs font-medium transition-colors ${contentType === ct ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {CONTENT_TYPE_LABELS[ct]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-3 max-h-72 overflow-y-auto custom-scrollbar">
            <p className="text-xs text-slate-400 mb-2 font-medium">{results.length} result{results.length !== 1 ? 's' : ''}</p>
            <div className="space-y-1">
              {results.slice(0, 30).map((r, i) => (
                <div
                  key={`${r.documentId}-${r.articleNumber}-${r.source}`}
                  className={`px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-all duration-150 ${i === selectedIdx ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-slate-50'}`}
                  onClick={() => {
                    if (r.source === 'recital') {
                      onResultClick(r.documentId, 'recitals');
                    } else {
                      onResultClick(r.documentId, r.articleNumber);
                    }
                  }}
                  onMouseEnter={() => setSelectedIdx(i)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${DOC_BADGE_COLORS[r.documentId] || 'bg-slate-100 text-slate-600'}`}>
                      {r.documentName}
                    </span>
                    <span className="text-xs text-slate-300">|</span>
                    <span className="text-xs font-medium text-slate-700">{r.articleTitle}</span>
                    {r.source === 'recital' && (
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1 py-0.5 rounded">recital</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {highlightSnippet(r.snippet, query)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {query.trim().length >= 2 && results.length === 0 && (
          <div className="mt-3 text-center py-6">
            <p className="text-sm text-slate-400">No results found</p>
          </div>
        )}
      </div>
    </div>
  );
}
