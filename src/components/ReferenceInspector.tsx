import { useState, useMemo, useEffect, useRef } from 'react';
import type { DocumentData, Article } from '../types';
import { getRegulationNumber } from '../data/documents';
import { getReverseReferences, type ReverseReference } from '../utils/reverseReferences';
import { DOC_BADGE_COLORS } from '../constants/docColors';
import { splitIntoParagraphs } from '../utils/text';
import { copyToClipboard } from '../utils/clipboard';

interface Props {
  document: DocumentData;
  article: Article;
  onClose: () => void;
  onNavigate: (docId: string, articleNumber: string) => void;
  onCompare: (docId: string, articleNumber: string) => void;
  reverseIndex: Map<string, ReverseReference[]>;
}

function stripSubject(content: string, subject: string): string {
  if (subject && content.startsWith(subject + '\n')) {
    return content.substring(subject.length + 1);
  }
  return content;
}

export default function ReferenceInspector({
  document: doc,
  article,
  onClose,
  onNavigate,
  onCompare,
  reverseIndex,
}: Props) {
  const cleanContent = stripSubject(article.content, article.subject);
  const paragraphs = splitIntoParagraphs(cleanContent);
  const [copiedReg, setCopiedReg] = useState(false);
  const [showReverse, setShowReverse] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus the inspector on mount, return focus on unmount
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    containerRef.current?.focus();
    return () => {
      const el = previousFocusRef.current;
      if (el) {
        requestAnimationFrame(() => el.focus());
      }
    };
  }, []);

  const reverseRefs = useMemo(
    () => getReverseReferences(reverseIndex, doc.id, String(article.number)),
    [reverseIndex, doc.id, article.number],
  );

  const groupedRefs = useMemo(() => {
    const groups = new Map<string, { docName: string; refs: typeof reverseRefs }>();
    for (const ref of reverseRefs) {
      const existing = groups.get(ref.sourceDocId);
      if (existing) {
        existing.refs.push(ref);
      } else {
        groups.set(ref.sourceDocId, { docName: ref.sourceDocName, refs: [ref] });
      }
    }
    return groups;
  }, [reverseRefs]);

  function highlightRef(snippet: string, displayText: string) {
    const escaped = displayText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = snippet.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((p, i) =>
      p.toLowerCase() === displayText.toLowerCase() ? (
        <mark
          key={i}
          className="bg-yellow-200 dark:bg-yellow-700/40 text-inherit rounded-sm px-0.5 font-medium"
        >
          {p}
        </mark>
      ) : (
        p
      ),
    );
  }

  const copyRegNum = async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedReg(true);
      setTimeout(() => setCopiedReg(false), 1500);
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="flex flex-col h-full outline-none"
      role="region"
      aria-label={`Inspector: ${article.title}`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider truncate flex items-center gap-1.5">
            <span
              className="cursor-context-menu"
              title="Right-click to copy"
              onContextMenu={(e) => {
                e.preventDefault();
                copyRegNum(getRegulationNumber(doc.id));
              }}
            >
              {doc.shortName}
            </span>
            <span className="text-[10px] text-blue-400 font-normal">
              {getRegulationNumber(doc.id)}
            </span>
            {copiedReg && <span className="text-[10px] text-emerald-600 font-medium">Copied!</span>}
          </p>
          <p className="text-sm font-medium text-slate-700 truncate mt-0.5">{article.title}</p>
          {article.subject && (
            <p className="text-xs text-slate-500 italic mt-0.5">{article.subject}</p>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          <button
            onClick={() => onCompare(doc.id, String(article.number))}
            className="btn-icon"
            title="Compare side by side"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
          </button>
          <button
            onClick={() => onNavigate(doc.id, String(article.number))}
            className="btn-icon"
            title="Open in main view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </button>
          <button onClick={onClose} className="btn-icon">
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
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Article content */}
        <div className="px-4 py-4">
          <div className="text-sm leading-relaxed text-slate-600 space-y-3">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        {/* Reverse references section */}
        {reverseRefs.length > 0 && (
          <div className="border-t border-slate-200 px-4 py-4">
            <button
              onClick={() => setShowReverse(!showReverse)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors w-full text-left"
            >
              <svg
                className={`w-3 h-3 transition-transform ${showReverse ? 'rotate-90' : ''}`}
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
              Referenced by ({reverseRefs.length})
            </button>
            {showReverse && (
              <div className="mt-3 space-y-4">
                {Array.from(groupedRefs.entries()).map(([docId, group]) => (
                  <div key={docId}>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${DOC_BADGE_COLORS[docId] || 'bg-slate-100 text-slate-600'}`}
                      >
                        {group.docName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {group.refs.length}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {group.refs.map((ref, i) => (
                        <div
                          key={`${ref.sourceArticleNumber}-${i}`}
                          className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                          onClick={() => onNavigate(ref.sourceDocId, ref.sourceArticleNumber)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onNavigate(ref.sourceDocId, ref.sourceArticleNumber);
                            }
                          }}
                        >
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Article {ref.sourceArticleNumber}
                            {ref.sourceArticleSubject ? ` — ${ref.sourceArticleSubject}` : ''}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {highlightRef(ref.snippet, ref.displayText)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
