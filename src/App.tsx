import { useState, useEffect, useCallback, useRef } from 'react';
import type { DocumentData, HistoryEntry } from './types';
import { getDocumentIndex, getAllDocuments, getRegulationNumber } from './data/documents';
import { isExternalDoc, getExternalCelex, getExternalName, getEurlexUrl } from './utils/referenceDetection';
import Sidebar from './components/Sidebar';
import ArticleViewer from './components/ArticleViewer';
import ReferenceInspector from './components/ReferenceInspector';
import SearchPanel from './components/SearchPanel';

function ExternalReferencePanel({ docId, articleNumber, onClose }: {
  docId: string;
  articleNumber: string;
  onClose: () => void;
}) {
  const celex = getExternalCelex(docId);
  const extName = getExternalName(celex);
  const displayName = extName
    ? `${extName} (${celex.substring(1, 5)}/${parseInt(celex.substring(6))})`
    : docId;
  const url = getEurlexUrl(celex);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider truncate">
            External Reference
          </p>
          <p className="text-sm font-medium text-slate-700 truncate mt-0.5">
            {displayName}
          </p>
          {articleNumber !== '1' && (
            <p className="text-xs text-slate-400 mt-0.5">Article {articleNumber}</p>
          )}
        </div>
        <button onClick={onClose} className="btn-icon ml-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
        <p className="text-sm text-slate-500 text-center">
          This document is not loaded in the reader.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-150 active:scale-95 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open on EUR-Lex
        </a>
      </div>
    </div>
  );
}

export default function App() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDocId, setCurrentDocId] = useState<string>('ammr');
  const [currentArticleNumber, setCurrentArticleNumber] = useState<string>('1');
  const [inspectedRef, setInspectedRef] = useState<{ documentId: string; articleNumber: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showSearch, setShowSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showInspector, setShowInspector] = useState(false);
  const articleScrollRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const sidebarResizing = useRef(false);
  const historyRef = useRef(history);
  const historyIdxRef = useRef(historyIndex);

  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { historyIdxRef.current = historyIndex; }, [historyIndex]);

  useEffect(() => {
    const docs = getAllDocuments();
    setDocuments(docs);
    setLoading(false);
    const entry: HistoryEntry = { documentId: 'ammr', articleNumber: '1' };
    setHistory([entry]);
    setHistoryIndex(0);
  }, []);

  const navigateTo = useCallback((docId: string, articleNumber: string) => {
    setCurrentDocId(docId);
    setCurrentArticleNumber(articleNumber);
    setInspectedRef(null);
    setShowInspector(false);
    const newEntry: HistoryEntry = { documentId: docId, articleNumber };
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIdxRef.current + 1);
      return [...trimmed, newEntry];
    });
    setHistoryIndex(prev => prev + 1);
  }, []);

  const goBack = useCallback(() => {
    const idx = historyIdxRef.current;
    const hist = historyRef.current;
    if (idx > 0) {
      const entry = hist[idx - 1];
      setCurrentDocId(entry.documentId);
      setCurrentArticleNumber(entry.articleNumber);
      setHistoryIndex(idx - 1);
    }
  }, []);

  const goForward = useCallback(() => {
    const idx = historyIdxRef.current;
    const hist = historyRef.current;
    if (idx < hist.length - 1) {
      const entry = hist[idx + 1];
      setCurrentDocId(entry.documentId);
      setCurrentArticleNumber(entry.articleNumber);
      setHistoryIndex(idx + 1);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(s => !s);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setShowSidebar(s => !s);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowInspector(false);
        setInspectedRef(null);
      }
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
      }
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        goForward();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goBack, goForward]);

  const handleReferenceClick = useCallback((docId: string, articleNumber: string) => {
    setInspectedRef({ documentId: docId, articleNumber });
    setShowInspector(true);
  }, []);

  const handleReferenceNavigate = useCallback((docId: string, articleNumber: string) => {
    navigateTo(docId, articleNumber);
  }, [navigateTo]);

  const handleSearchResultClick = useCallback((docId: string, articleNumber: string) => {
    navigateTo(docId, articleNumber);
    setShowSearch(false);
  }, [navigateTo]);

  useEffect(() => {
    if (articleScrollRef.current) {
      articleScrollRef.current.scrollTop = 0;
    }
  }, [currentDocId, currentArticleNumber]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading documents...</p>
        </div>
      </div>
    );
  }

  const currentDoc = documents.find(d => d.id === currentDocId);
  const inspectedDoc = inspectedRef
    ? documents.find(d => d.id === inspectedRef.documentId)
    : null;
  const inspectedArticle = inspectedDoc && inspectedRef
    ? inspectedDoc.articles.find(a => String(a.number) === inspectedRef.articleNumber)
    : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 flex-shrink-0 shadow-sm z-20">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="btn-icon"
              title="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="w-px h-5 bg-slate-200 mx-1" />
            <h1 className="text-sm font-semibold text-slate-700 hidden sm:block tracking-tight">
              EU Pact on Migration and Asylum Reader
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={goBack}
              disabled={historyIndex <= 0}
              className="btn-icon disabled:text-slate-300 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              title="Back"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goForward}
              disabled={historyIndex >= history.length - 1}
              className="btn-icon disabled:text-slate-300 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              title="Forward"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="w-px h-5 bg-slate-200 mx-1" />
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`btn-icon ${showSearch ? 'btn-icon-active' : ''}`}
              title="Search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            {inspectedRef && (
              <button
                onClick={() => setShowInspector(!showInspector)}
                className={`btn-icon ${showInspector ? 'btn-icon-active' : ''}`}
                title="Toggle reference inspector"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Search panel */}
      {showSearch && (
        <SearchPanel
          documents={documents}
          onResultClick={handleSearchResultClick}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <div
            className="border-r border-slate-200 bg-white flex-shrink-0 overflow-hidden flex flex-col relative sidebar-enter"
            style={{ width: sidebarWidth }}
          >
            <Sidebar
              documents={documents}
              currentDocId={currentDocId}
              currentArticleNumber={currentArticleNumber}
              onNavigate={navigateTo}
              onClose={() => setShowSidebar(false)}
            />
            <div
              className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400/30 active:bg-blue-400/50 transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                sidebarResizing.current = true;
                const startX = e.clientX;
                const startW = sidebarWidth;
                const onMove = (ev: MouseEvent) => {
                  const newW = Math.max(200, Math.min(500, startW + ev.clientX - startX));
                  setSidebarWidth(newW);
                };
                const onUp = () => {
                  sidebarResizing.current = false;
                  document.removeEventListener('mousemove', onMove);
                  document.removeEventListener('mouseup', onUp);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
              }}
            />
          </div>
        )}

        {/* Article content */}
        <div className="flex-1 overflow-hidden flex">
          <div ref={articleScrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
            {currentDoc && (
              <ArticleViewer
                document={currentDoc}
                articleNumber={currentArticleNumber}
                documents={documents}
                onReferenceClick={handleReferenceClick}
                onReferenceNavigate={handleReferenceNavigate}
              />
            )}
          </div>

          {/* Reference inspector */}
          {showInspector && inspectedRef && (
            <div className="w-96 border-l border-slate-200 bg-white overflow-y-auto custom-scrollbar panel-transition flex-shrink-0">
              {inspectedDoc && inspectedArticle ? (
                <ReferenceInspector
                  document={inspectedDoc}
                  article={inspectedArticle}
                  onClose={() => { setShowInspector(false); setInspectedRef(null); }}
                  onNavigate={handleReferenceNavigate}
                />
              ) : isExternalDoc(inspectedRef.documentId) ? (
                <ExternalReferencePanel
                  docId={inspectedRef.documentId}
                  articleNumber={inspectedRef.articleNumber}
                  onClose={() => { setShowInspector(false); setInspectedRef(null); }}
                />
              ) : (
                <div className="p-8 text-center text-sm text-slate-400">
                  Article not found in this document.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-4 py-1.5 text-xs text-slate-400 flex-shrink-0 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="font-medium text-slate-500">{currentDoc?.shortName}</span>
          <span className="text-slate-300">|</span>
          <span>{getRegulationNumber(currentDocId)}</span>
          <span className="text-slate-300">|</span>
          <span>{currentArticleNumber === 'recitals' ? 'Recitals' : `Article ${currentArticleNumber}`}</span>
        </span>
        <span className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-500">⌘F</kbd> Search</span>
          <span className="hidden sm:inline-flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-500">⌥←→</kbd> Navigate</span>
          <span className="inline-flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-500">Esc</kbd> Close</span>
        </span>
      </footer>
    </div>
  );
}
