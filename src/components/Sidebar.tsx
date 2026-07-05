import { useState } from 'react';
import type { DocumentData } from '../types';
import { getRegulationNumber } from '../data/documents';

interface Props {
  documents: DocumentData[];
  currentDocId: string;
  currentArticleNumber: string;
  onNavigate: (docId: string, articleNumber: string) => void;
  onClose: () => void;
}

function formatArticleLabel(articleTitle: string, subject: string): string {
  const num = articleTitle.replace('Article ', 'Art. ');
  if (subject) return `${num} — ${subject}`;
  return num;
}

const DOC_ICONS: Record<string, string> = {
  ammr: 'A',
  apr: 'P',
  rbpr: 'B',
  cfmr: 'C',
  eurodac: 'E',
  sr: 'S',
  qr: 'Q',
  rcd: 'D',
  urfa: 'R',
};

export default function Sidebar({ documents, currentDocId, currentArticleNumber, onNavigate, onClose }: Props) {
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set([currentDocId]));
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyRegNumber = (docId: string, regNum: string) => {
    navigator.clipboard.writeText(regNum);
    setCopiedId(docId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const toggleDoc = (id: string) => {
    setExpandedDocs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Documents</h2>
        <span className="text-[10px] text-slate-300">{documents.length} regulations</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-1.5 px-2">
        {documents.map(doc => {
          const isExpanded = expandedDocs.has(doc.id);
          const isActive = doc.id === currentDocId;

          return (
            <div key={doc.id} className="mb-0.5">
              <div
                className={`sidebar-item flex items-center gap-2 ${isActive ? 'sidebar-item-active' : ''}`}
                onClick={() => toggleDoc(doc.id)}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {DOC_ICONS[doc.id] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium truncate">{doc.shortName}</span>
                    <span
                      className="text-[10px] text-slate-400 cursor-context-menu flex-shrink-0"
                      title="Right-click to copy"
                      onContextMenu={e => {
                        e.preventDefault();
                        copyRegNumber(doc.id, getRegulationNumber(doc.id));
                      }}
                    >
                      {getRegulationNumber(doc.id)}
                    </span>
                  </div>
                </div>
                <svg
                  className={`w-3 h-3 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {copiedId === doc.id && (
                  <span className="text-[10px] text-emerald-600 font-medium flex-shrink-0">Copied!</span>
                )}
              </div>

              {isExpanded && (
                <div className="ml-3 border-l-2 border-slate-100 pl-2 mt-0.5 mb-1">
                  {doc.recitals.length > 0 && (
                    <div
                      className={`article-list-item ${isActive && currentArticleNumber === 'recitals' ? 'article-list-item-active' : ''}`}
                      onClick={() => onNavigate(doc.id, 'recitals')}
                    >
                      Recitals
                    </div>
                  )}
                  {doc.articles.map(article => {
                    const label = formatArticleLabel(article.title, article.subject);
                    const isActiveArt = isActive && String(article.number) === currentArticleNumber;
                    return (
                      <div
                        key={String(article.number)}
                        className={`article-list-item flex items-center gap-1.5 ${isActiveArt ? 'article-list-item-active' : ''}`}
                        onClick={() => onNavigate(doc.id, String(article.number))}
                        title={label}
                      >
                        {isActiveArt && <span className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0 active-dot" />}
                        <span className="truncate">
                          {label.length > 50 ? label.substring(0, 47) + '...' : label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
