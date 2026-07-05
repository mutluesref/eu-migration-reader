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
      ? <mark key={i} className="bg-yellow-100 text-slate-800 rounded-sm px-0.5 font-medium">{p}</mark>
      : p
  );
}

const DOC_COLORS: Record<string, string> = {
  ammr: 'bg-violet-100 text-violet-700',
  apr: 'bg-blue-100 text-blue-700',
  rbpr: 'bg-amber-100 text-amber-700',
  cfmr: 'bg-red-100 text-red-700',
  eurodac: 'bg-emerald-100 text-emerald-700',
  sr: 'bg-cyan-100 text-cyan-700',
  qr: 'bg-indigo-100 text-indigo-700',
  rcd: 'bg-pink-100 text-pink-700',
  urfa: 'bg-teal-100 text-teal-700',
};

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
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search articles by number or keyword..."
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-shadow"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {results.length > 0 && (
          <div className="mt-3 max-h-72 overflow-y-auto custom-scrollbar">
            <p className="text-xs text-slate-400 mb-2 font-medium">{results.length} result{results.length !== 1 ? 's' : ''}</p>
            <div className="space-y-1">
              {results.slice(0, 30).map((r, i) => (
                <div
                  key={`${r.documentId}-${r.articleNumber}`}
                  className={`px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-all duration-150 ${i === selectedIdx ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-slate-50'}`}
                  onClick={() => onResultClick(r.documentId, r.articleNumber)}
                  onMouseEnter={() => setSelectedIdx(i)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${DOC_COLORS[r.documentId] || 'bg-slate-100 text-slate-600'}`}>
                      {r.documentName}
                    </span>
                    <span className="text-xs text-slate-300">|</span>
                    <span className="text-xs font-medium text-slate-700">{r.articleTitle}</span>
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
