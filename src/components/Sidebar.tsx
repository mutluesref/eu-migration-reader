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
  if (subject) return `${num} - ${subject}`;
  return num;
}

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
      <div className="flex items-center justify-between px-3 py-2 border-b border-stone-100">
        <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Documents</h2>
        <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded text-stone-400">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-1">
        {documents.map(doc => {
          const isExpanded = expandedDocs.has(doc.id);
          const isActive = doc.id === currentDocId;

          return (
            <div key={doc.id} className="mb-1">
              <div
                className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
                onClick={() => toggleDoc(doc.id)}
              >
                <div className="flex items-center gap-1.5">
                  <svg
                    className={`w-3 h-3 text-stone-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-xs">{doc.shortName}</span>
                  <span
                    className="text-[10px] text-stone-400 cursor-context-menu"
                    title="Right-click to copy"
                    onContextMenu={e => {
                      e.preventDefault();
                      copyRegNumber(doc.id, getRegulationNumber(doc.id));
                    }}
                  >
                    {getRegulationNumber(doc.id)}
                  </span>
                  {copiedId === doc.id && (
                    <span className="text-[10px] text-green-600 ml-0.5">Copied!</span>
                  )}
                  <span className="text-[10px] text-stone-400 ml-auto">{doc.articles.length}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="ml-1 border-l border-stone-100 pl-1 mt-0.5">
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
                    return (
                      <div
                        key={String(article.number)}
                        className={`article-list-item ${isActive && String(article.number) === currentArticleNumber ? 'article-list-item-active' : ''}`}
                        onClick={() => onNavigate(doc.id, String(article.number))}
                        title={label}
                      >
                        {label.length > 55 ? label.substring(0, 52) + '...' : label}
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
