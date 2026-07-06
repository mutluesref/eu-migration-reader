import { useState, useMemo } from 'react';
import type { DocumentData, Article } from '../types';
import { getRegulationNumber, getDocumentShortName } from '../data/documents';
import { getReverseReferences, type ReverseReference } from '../utils/reverseReferences';
import { DOC_BADGE_COLORS } from '../constants/docColors';

interface Props {
  document: DocumentData;
  article: Article;
  onClose: () => void;
  onNavigate: (docId: string, articleNumber: string) => void;
  onCompare: (docId: string, articleNumber: string) => void;
  reverseIndex: Map<string, ReverseReference[]>;
  documents: DocumentData[];
}

function splitIntoParagraphs(text: string): string[] {
  const paragraphs: string[] = [];
  const parts = text.split('\n\n');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed) {
      paragraphs.push(trimmed);
    }
  }
  if (paragraphs.length === 0 && text.trim()) {
    paragraphs.push(text.trim());
  }
  return paragraphs;
}

function stripSubject(content: string, subject: string): string {
  if (subject && content.startsWith(subject + '\n')) {
    return content.substring(subject.length + 1);
  }
  return content;
}

export default function ReferenceInspector({ document: doc, article, onClose, onNavigate, onCompare, reverseIndex, documents }: Props) {
  const cleanContent = stripSubject(article.content, article.subject);
  const paragraphs = splitIntoParagraphs(cleanContent);
  const [copiedReg, setCopiedReg] = useState(false);
  const [showReverse, setShowReverse] = useState(false);

  const reverseRefs = useMemo(
    () => getReverseReferences(reverseIndex, doc.id, String(article.number)),
    [reverseIndex, doc.id, article.number]
  );

  const copyRegNum = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReg(true);
    setTimeout(() => setCopiedReg(false), 1500);
  };

  return (
    <div className="flex flex-col h-full" role="region" aria-label={`Inspector: ${article.title}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider truncate flex items-center gap-1.5">
            <span
              className="cursor-context-menu"
              title="Right-click to copy"
              onContextMenu={e => {
                e.preventDefault();
                copyRegNum(getRegulationNumber(doc.id));
              }}
            >{doc.shortName}</span>
            <span className="text-[10px] text-blue-400 font-normal">{getRegulationNumber(doc.id)}</span>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </button>
          <button
            onClick={() => onNavigate(doc.id, String(article.number))}
            className="btn-icon"
            title="Open in main view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
          <button onClick={onClose} className="btn-icon">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Referenced by ({reverseRefs.length})
            </button>
            {showReverse && (
              <div className="mt-3 space-y-2">
                {reverseRefs.map((ref, i) => (
                  <div
                    key={`${ref.sourceDocId}-${ref.sourceArticleNumber}-${i}`}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => onNavigate(ref.sourceDocId, ref.sourceArticleNumber)}
                  >
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${DOC_BADGE_COLORS[ref.sourceDocId] || 'bg-slate-100 text-slate-600'}`}>
                      {ref.sourceDocName}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">Article {ref.sourceArticleNumber} — {ref.sourceArticleTitle}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">"{ref.displayText}"</p>
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
