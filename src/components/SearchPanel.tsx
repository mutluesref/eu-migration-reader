import { useState, useRef, useEffect, type ReactNode } from 'react';
import type { DocumentData } from '../types';
import { searchDocuments, type SearchResult } from '../utils/search';

interface Props {
  documents: DocumentData[];
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
      ? <mark key={i} className="bg-yellow-200 text-stone-800 rounded px-0.5">{p}</mark>
      : p
  );
}

export default function SearchPanel({ documents, onResultClick, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim().length >= 2) {
      const res = searchDocuments(documents, query);
      setResults(res);
      setSelectedIdx(-1);
    } else {
      setResults([]);
    }
  }, [query, documents]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectedIdx >= 0 && results[selectedIdx]) {
      const r = results[selectedIdx];
      onResultClick(r.documentId, r.articleNumber);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="border-b border-stone-200 bg-white">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="relative">
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search articles by number or keyword..."
            className="w-full pl-10 pr-10 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
              title="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {results.length > 0 && (
          <div className="mt-2 max-h-60 overflow-y-auto custom-scrollbar">
            <p className="text-xs text-stone-400 mb-1">{results.length} result{results.length !== 1 ? 's' : ''}</p>
            {results.slice(0, 30).map((r, i) => (
              <div
                key={`${r.documentId}-${r.articleNumber}`}
                className={`px-3 py-2 rounded cursor-pointer text-sm ${i === selectedIdx ? 'bg-blue-50' : 'hover:bg-stone-50'}`}
                onClick={() => onResultClick(r.documentId, r.articleNumber)}
                onMouseEnter={() => setSelectedIdx(i)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-600 uppercase">{r.documentName}</span>
                  <span className="text-xs text-stone-400">|</span>
                  <span className="text-xs font-medium text-stone-700">{r.articleTitle}</span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  {highlightSnippet(r.snippet, query)}
                </p>
              </div>
            ))}
          </div>
        )}

        {query.trim().length >= 2 && results.length === 0 && (
          <p className="text-sm text-stone-400 mt-2">No results found</p>
        )}
      </div>
    </div>
  );
}
