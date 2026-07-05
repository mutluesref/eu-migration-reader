import { useState } from 'react';
import type { DocumentData, Article } from '../types';
import { getRegulationNumber } from '../data/documents';

interface Props {
  document: DocumentData;
  article: Article;
  onClose: () => void;
  onNavigate: (docId: string, articleNumber: string) => void;
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

export default function ReferenceInspector({ document: doc, article, onClose, onNavigate }: Props) {
  const cleanContent = stripSubject(article.content, article.subject);
  const paragraphs = splitIntoParagraphs(cleanContent);
  const [copiedReg, setCopiedReg] = useState(false);

  const copyRegNum = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReg(true);
    setTimeout(() => setCopiedReg(false), 1500);
  };

  return (
    <div className="flex flex-col h-full">
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
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4">
        <div className="text-sm leading-relaxed text-slate-600 space-y-3">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
