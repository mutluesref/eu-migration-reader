import { useState } from 'react';
import type { DocumentData } from '../types';
import { getDocumentShortName, getRegulationNumber } from '../data/documents';
import useBookmarks from '../hooks/useBookmarks';
import { useAnnotations } from '../hooks/useAnnotations';
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
  const { hasAnnotation } = useAnnotations();
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
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100 dark:border-surface-700/50">
        <h2 className="text-[11px] font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">Documents</h2>
        <span className="text-[10px] text-surface-300 dark:text-surface-600 font-mono">{documents.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-2 px-2.5">
        {/* Documents list */}
        {documents.map(doc => {
          const isExpanded = expandedDocs.has(doc.id);
          const isActive = doc.id === currentDocId;

          return (
            <div key={doc.id} className="mb-1">
              <div
                className={`sidebar-item flex items-center gap-2.5 ${isActive ? 'sidebar-item-active' : ''}`}
                onClick={() => toggleDoc(doc.id)}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-colors ${isActive ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-sm' : 'bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400'}`}>
                  {DOC_ICONS[doc.id] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-medium truncate text-surface-700 dark:text-surface-300">{getDocumentShortName(doc.id)}</span>
                  </div>
                  <span
                    className="text-[10px] text-surface-400 dark:text-surface-500 font-mono cursor-context-menu"
                    title="Right-click to copy"
                    onContextMenu={e => {
                      e.preventDefault();
                      copyRegNumber(doc.id, getRegulationNumber(doc.id));
                    }}
                  >
                    {getRegulationNumber(doc.id)}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-surface-400 transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
                {copiedId === doc.id && (
                  <span className="text-[10px] text-accent-emerald font-medium flex-shrink-0 animate-fade-in">Copied!</span>
                )}
              </div>

              {isExpanded && (
                <div className="ml-4 border-l border-surface-200 dark:border-surface-700 pl-3 mt-1 mb-2">
                  {doc.recitals.length > 0 && (
                    <div
                      className={`article-list-item ${isActive && currentArticleNumber === 'recitals' ? 'article-list-item-active' : ''}`}
                      onClick={() => onNavigate(doc.id, 'recitals')}
                    >
                      Recitals
                    </div>
                  )}
                  {renderArticleList(doc, isActive, currentArticleNumber, onNavigate, hasAnnotation)}
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
  hasAnnotationFn: (docId: string, articleNumber: string) => boolean,
) {
  const items: React.ReactNode[] = [];

  for (const article of doc.articles) {
    const artNum = String(article.number);
    const label = formatArticleLabel(article.title, article.subject);
    const isActiveArt = isActive && artNum === currentArticleNumber;
    const hasNote = hasAnnotationFn(doc.id, artNum);
    items.push(
      <div
        key={artNum}
        className={`article-list-item flex items-center gap-1.5 ${isActiveArt ? 'article-list-item-active' : ''}`}
        onClick={() => onNavigate(doc.id, artNum)}
        title={label}
      >
        {isActiveArt && <span className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0 active-dot" />}
        {hasNote && !isActiveArt && <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />}
        <span className="truncate">
          {label.length > 50 ? label.substring(0, 47) + '...' : label}
        </span>
      </div>
    );
  }

  return items;
}
