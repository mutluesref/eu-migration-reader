import { useState } from 'react';
import type { DocumentData } from '../types';
import { getDocumentShortName, getRegulationNumber } from '../data/documents';
import useBookmarks from '../hooks/useBookmarks';
import { useStore } from '../store';

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
  ammr: 'A', apr: 'P', rbpr: 'B', cfmr: 'C',
  eurodac: 'E', sr: 'S', qr: 'Q', rcd: 'D', urfa: 'R',
};

export default function Sidebar({ documents, currentDocId, currentArticleNumber, onNavigate }: Props) {
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set([currentDocId]));
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const { bookmarks, removeBookmark } = useBookmarks();
  const recentArticles = useStore(s => s.recentArticles);

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

  const getDocName = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    return doc?.shortName ?? docId;
  };

  const getArticleTitle = (docId: string, artNum: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return `Article ${artNum}`;
    const art = doc.articles.find(a => String(a.number) === artNum);
    return art ? formatArticleLabel(art.title, art.subject) : `Article ${artNum}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 dark:border-slate-700">
        <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Documents</h2>
        <span className="text-[10px] text-slate-300 dark:text-slate-600">{documents.length} regulations</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-1.5 px-2">
        {/* Documents list */}
        {documents.map(doc => {
          const isExpanded = expandedDocs.has(doc.id);
          const isActive = doc.id === currentDocId;

          return (
            <div key={doc.id} className="mb-0.5">
              <div
                className={`sidebar-item flex items-center gap-2 ${isActive ? 'sidebar-item-active' : ''}`}
                onClick={() => toggleDoc(doc.id)}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                  {DOC_ICONS[doc.id] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium truncate">{getDocumentShortName(doc.id)}</span>
                    <span
                      className="text-[10px] text-slate-400 dark:text-slate-500 cursor-context-menu flex-shrink-0"
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
                <div className="ml-3 border-l-2 border-slate-100 dark:border-slate-700 pl-2 mt-0.5 mb-1">
                  {doc.recitals.length > 0 && (
                    <div
                      className={`article-list-item ${isActive && currentArticleNumber === 'recitals' ? 'article-list-item-active' : ''}`}
                      onClick={() => onNavigate(doc.id, 'recitals')}
                    >
                      Recitals
                    </div>
                  )}
                  {renderArticleList(doc, isActive, currentArticleNumber, onNavigate)}
                </div>
              )}
            </div>
          );
        })}

        {/* Divider */}
        {(bookmarks.length > 0 || recentArticles.length > 0) && (
          <div className="my-2 border-t border-slate-100 dark:border-slate-700" />
        )}

        {/* Bookmarks section */}
        {bookmarks.length > 0 && (
          <div className="mb-1">
            <button
              onClick={() => setShowBookmarks(!showBookmarks)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              <span className="text-amber-500">★</span>
              <span>Bookmarks</span>
              <span className="ml-auto text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">{bookmarks.length}</span>
              <svg
                className={`w-3 h-3 text-slate-400 transition-transform ${showBookmarks ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {showBookmarks && (
              <div className="px-1 pb-1">
                {bookmarks.map((b: { docId: string; articleNumber: string; label: string }, i: number) => (
                  <div
                    key={`${b.docId}-${b.articleNumber}-${i}`}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 group cursor-pointer transition-colors"
                    onClick={() => onNavigate(b.docId, b.articleNumber)}
                  >
                    <span className="text-amber-400 text-xs">★</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium truncate">{getDocName(b.docId)}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{getArticleTitle(b.docId, b.articleNumber)}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeBookmark(b.docId, b.articleNumber); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                      title="Remove bookmark"
                    >
                      <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent articles - hidden when bookmarks is open */}
        {recentArticles.length > 0 && !showBookmarks && (
          <div>
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 px-2">Recent</div>
            {recentArticles.slice(0, 5).map((r: { docId: string; articleNumber: string }, i: number) => (
              <div
                key={`${r.docId}-${r.articleNumber}-${i}`}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                onClick={() => onNavigate(r.docId, r.articleNumber)}
              >
                <div className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex-shrink-0">
                  {DOC_ICONS[r.docId] || '?'}
                </div>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 truncate">
                  {getArticleTitle(r.docId, r.articleNumber)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function renderArticleList(
  doc: DocumentData,
  isActive: boolean,
  currentArticleNumber: string,
  onNavigate: (docId: string, articleNumber: string) => void,
) {
  const items: React.ReactNode[] = [];

  for (const article of doc.articles) {
    const artNum = String(article.number);
    const label = formatArticleLabel(article.title, article.subject);
    const isActiveArt = isActive && artNum === currentArticleNumber;
    items.push(
      <div
        key={artNum}
        className={`article-list-item flex items-center gap-1.5 ${isActiveArt ? 'article-list-item-active' : ''}`}
        onClick={() => onNavigate(doc.id, artNum)}
        title={label}
      >
        {isActiveArt && <span className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0 active-dot" />}
        <span className="truncate">
          {label.length > 50 ? label.substring(0, 47) + '...' : label}
        </span>
      </div>
    );
  }

  return items;
}
