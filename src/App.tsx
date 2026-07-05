import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { DocumentData } from './types';
import { getAllDocuments, getRegulationNumber } from './data/documents';
import { isExternalDoc, getExternalCelex, getExternalName, getEurlexUrl } from './utils/referenceDetection';
import { useStore } from './store';
import useTheme from './hooks/useTheme';
import useOnboarding from './hooks/useOnboarding';
import useBookmarks from './hooks/useBookmarks';
import Sidebar from './components/Sidebar';
import ArticleViewer from './components/ArticleViewer';
import ReferenceInspector from './components/ReferenceInspector';
import SearchPanel from './components/SearchPanel';
import Onboarding from './components/Onboarding';
import Toast from './components/Toast';
import SkeletonLoader from './components/SkeletonLoader';
import ErrorBoundary from './components/ErrorBoundary';

const DOC_ACCENT: Record<string, string> = {
  ammr: 'border-l-violet-500',
  apr: 'border-l-blue-500',
  rbpr: 'border-l-amber-500',
  cfmr: 'border-l-red-500',
  eurodac: 'border-l-emerald-500',
  sr: 'border-l-cyan-500',
  qr: 'border-l-indigo-500',
  rcd: 'border-l-pink-500',
  urfa: 'border-l-teal-500',
};

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
    <div className="flex flex-col h-full dark:bg-slate-800">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider truncate">
            External Reference
          </p>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate mt-0.5">
            {displayName}
          </p>
          {articleNumber !== '1' && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Article {articleNumber}</p>
          )}
        </div>
        <button onClick={onClose} className="btn-icon ml-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
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

  const currentDocId = useStore(s => s.currentDocId);
  const currentArticleNumber = useStore(s => s.currentArticleNumber);
  const inspectedRef = useStore(s => s.inspectedRef);
  const showSearch = useStore(s => s.showSearch);
  const searchQuery = useStore(s => s.searchQuery);
  const showSidebar = useStore(s => s.showSidebar);
  const showInspector = useStore(s => s.showInspector);
  const sidebarWidth = useStore(s => s.sidebarWidth);
  const fontSize = useStore(s => s.fontSize);

  const navigateTo = useStore(s => s.navigateTo);
  const goToPrevArticle = useStore(s => s.goToPrevArticle);
  const goToNextArticle = useStore(s => s.goToNextArticle);
  const setInspectedRef = useStore(s => s.setInspectedRef);
  const toggleSearch = useStore(s => s.toggleSearch);
  const setShowSearch = useStore(s => s.setShowSearch);
  const setSearchQuery = useStore(s => s.setSearchQuery);
  const toggleSidebar = useStore(s => s.toggleSidebar);
  const setShowSidebar = useStore(s => s.setShowSidebar);
  const setSidebarWidth = useStore(s => s.setSidebarWidth);
  const toggleInspector = useStore(s => s.toggleInspector);
  const setShowInspector = useStore(s => s.setShowInspector);
  const setFontSize = useStore(s => s.setFontSize);

  const { isDark, setTheme: setThemeFn } = useTheme();
  const { showOnboarding, dismissOnboarding, stepIndex, nextStep, prevStep } = useOnboarding();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const articleScrollRef = useRef<HTMLDivElement>(null);
  const sidebarResizing = useRef(false);

  const currentDoc = useMemo(() => documents.find(d => d.id === currentDocId), [documents, currentDocId]);

  const orderedArticles = useMemo(() => {
    if (!currentDoc) return [];
    const articles = currentDoc.articles;
    const hasRecitals = currentDoc.recitals && currentDoc.recitals.length > 0;
    const articleNums = articles
      .map(a => String(a.number))
      .sort((a, b) => {
        const na = parseInt(a, 10);
        const nb = parseInt(b, 10);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return a.localeCompare(b);
      });
    return hasRecitals ? ['recitals', ...articleNums] : articleNums;
  }, [currentDoc]);

  useEffect(() => {
    const docs = getAllDocuments();
    setDocuments(docs);
    setLoading(false);
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  useEffect(() => {
    if (articleScrollRef.current) {
      articleScrollRef.current.scrollTop = 0;
      setScrollProgress(0);
      setShowScrollTop(false);
    }
  }, [currentDocId, currentArticleNumber]);

  const handlePrevArticle = useCallback(() => {
    goToPrevArticle(orderedArticles);
  }, [goToPrevArticle, orderedArticles]);

  const handleNextArticle = useCallback(() => {
    goToNextArticle(orderedArticles);
  }, [goToNextArticle, orderedArticles]);

  const handleScroll = useCallback(() => {
    const el = articleScrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const progress = maxScroll > 0 ? (el.scrollTop / maxScroll) * 100 : 0;
    setScrollProgress(progress);
    setShowScrollTop(el.scrollTop > 300);
  }, []);

  const scrollToTop = useCallback(() => {
    articleScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        toggleSearch();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowInspector(false);
        setInspectedRef(null);
      }
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevArticle();
      }
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextArticle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleSearch, toggleSidebar, setShowSearch, setShowInspector, setInspectedRef, handlePrevArticle, handleNextArticle]);

  const handleReferenceClick = useCallback((docId: string, articleNumber: string) => {
    setInspectedRef({ documentId: docId, articleNumber });
    setShowInspector(true);
  }, [setInspectedRef, setShowInspector]);

  const handleReferenceNavigate = useCallback((docId: string, articleNumber: string) => {
    navigateTo(docId, articleNumber);
  }, [navigateTo]);

  const handleSearchResultClick = useCallback((docId: string, articleNumber: string) => {
    setInspectedRef({ documentId: docId, articleNumber });
    setShowInspector(true);
  }, [setInspectedRef, setShowInspector]);

  const handleToggleBookmark = useCallback(() => {
    const label = currentDoc
      ? `${currentDoc.shortName} — ${currentArticleNumber === 'recitals' ? 'Recitals' : `Article ${currentArticleNumber}`}`
      : currentArticleNumber;
    if (isBookmarked(currentDocId, currentArticleNumber)) {
      removeBookmark(currentDocId, currentArticleNumber);
      setToast({ message: 'Bookmark removed', type: 'info' });
    } else {
      addBookmark(currentDocId, currentArticleNumber, label);
      setToast({ message: 'Bookmark added', type: 'success' });
    }
  }, [currentDocId, currentArticleNumber, currentDoc, isBookmarked, addBookmark, removeBookmark]);

  const cycleTheme = useCallback(() => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const store = useStore.getState();
    const idx = themes.indexOf(store.theme);
    setThemeFn(themes[(idx + 1) % themes.length]);
  }, [setThemeFn]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <SkeletonLoader type="article" />
      </div>
    );
  }

  const inspectedDoc = inspectedRef
    ? documents.find(d => d.id === inspectedRef.documentId)
    : null;
  const inspectedArticle = inspectedDoc && inspectedRef
    ? inspectedDoc.articles.find(a => String(a.number) === inspectedRef.articleNumber)
    : null;

  const bookmarked = isBookmarked(currentDocId, currentArticleNumber);

  const themeIcon = isDark ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors">
      <Onboarding
        show={showOnboarding}
        step={stepIndex}
        onNext={nextStep}
        onPrev={prevStep}
        onDismiss={dismissOnboarding}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Reading progress bar */}
      {scrollProgress > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full bg-blue-500 transition-[width] duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 shadow-sm z-20 transition-colors">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="btn-icon"
              title="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-600 mx-1" />
            <h1 className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:block tracking-tight">
              EU Pact on Migration and Asylum Reader
            </h1>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
            <button
              onClick={handlePrevArticle}
              className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 transition-all duration-150"
              title="Previous article"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNextArticle}
              className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 transition-all duration-150"
              title="Next article"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-500 mx-0.5" />

            {/* Font size controls */}
            <button
              onClick={() => setFontSize(fontSize - 1)}
              className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 transition-all duration-150"
              title="Decrease font size"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 w-6 text-center select-none">
              {fontSize}
            </span>
            <button
              onClick={() => setFontSize(fontSize + 1)}
              className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100 transition-all duration-150"
              title="Increase font size"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            <div className="w-px h-4 bg-slate-300 dark:bg-slate-500 mx-0.5" />

            <button
              onClick={toggleSearch}
              className={`btn-icon ${showSearch ? 'btn-icon-active' : ''}`}
              title="Search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            {inspectedRef && (
              <button
                onClick={toggleInspector}
                className={`btn-icon ${showInspector ? 'btn-icon-active' : ''}`}
                title="Toggle reference inspector"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            )}

            <div className="w-px h-4 bg-slate-300 dark:bg-slate-500 mx-0.5" />

            {/* Bookmark button */}
            <button
              onClick={handleToggleBookmark}
              className={`btn-icon ${bookmarked ? 'text-amber-500' : ''}`}
              title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {bookmarked ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              )}
            </button>

            <div className="w-px h-4 bg-slate-300 dark:bg-slate-500 mx-0.5" />

            {/* Theme toggle */}
            <button
              onClick={cycleTheme}
              className="btn-icon"
              title={`Theme: ${useStore.getState().theme}`}
            >
              {themeIcon}
            </button>
          </div>
        </div>
      </header>

      {/* Search panel */}
      {showSearch && (
        <SearchPanel
          documents={documents}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onResultClick={handleSearchResultClick}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <>
            {/* Mobile backdrop */}
            <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setShowSidebar(false)} />
            <div
              className={`flex flex-col overflow-hidden sidebar-enter fixed inset-y-0 left-0 z-40 bg-white dark:bg-slate-800 shadow-xl md:relative md:z-auto md:shadow-none md:border-r md:border-slate-200 dark:md:border-slate-700 transition-colors`}
            >
              <div className="flex-1 flex flex-col overflow-hidden" style={{ width: sidebarWidth, minWidth: sidebarWidth }}>
                <Sidebar
                  documents={documents}
                  currentDocId={currentDocId}
                  currentArticleNumber={currentArticleNumber}
                  onNavigate={navigateTo}
                  onClose={() => setShowSidebar(false)}
                />
              </div>
              <div
                className="hidden md:block absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400/30 active:bg-blue-400/50 transition-colors"
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
          </>
        )}

        {/* Article content */}
        <div className="flex-1 overflow-hidden flex">
          <div
            ref={articleScrollRef}
            className="flex-1 overflow-y-auto custom-scrollbar relative"
            onScroll={handleScroll}
          >
            <ErrorBoundary>
              <div className={`border-l-4 ${DOC_ACCENT[currentDocId] || ''}`}>
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
            </ErrorBoundary>

            {/* Scroll to top button */}
            {showScrollTop && (
              <button
                onClick={scrollToTop}
                className="fixed bottom-20 right-6 z-40 w-10 h-10 rounded-full bg-white dark:bg-slate-700 shadow-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200"
                title="Scroll to top"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Reference inspector */}
          {showInspector && inspectedRef && (
            <>
              {/* Mobile backdrop */}
              <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => { setShowInspector(false); setInspectedRef(null); }} />
              <div className={`flex flex-col panel-transition fixed inset-y-0 right-0 z-40 bg-white dark:bg-slate-800 shadow-xl w-96 max-w-[92vw] md:static md:z-auto md:shadow-none md:border-l md:border-slate-200 dark:md:border-slate-700 md:flex-shrink-0 overflow-hidden transition-colors`}>
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
                  <div className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">
                    Article not found in this document.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-4 py-1.5 text-xs text-slate-400 dark:text-slate-500 flex-shrink-0 flex items-center justify-between transition-colors">
        <span className="flex items-center gap-2">
          <span className="font-medium text-slate-500 dark:text-slate-400">{currentDoc?.shortName}</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span>{getRegulationNumber(currentDocId)}</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span>{currentArticleNumber === 'recitals' ? 'Recitals' : `Article ${currentArticleNumber}`}</span>
        </span>
        <span className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-medium text-slate-500 dark:text-slate-400">⌘F</kbd> Search</span>
          <span className="hidden sm:inline-flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-medium text-slate-500 dark:text-slate-400">⌥←→</kbd> Navigate</span>
          <span className="inline-flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-medium text-slate-500 dark:text-slate-400">Esc</kbd> Close</span>
        </span>
      </footer>
    </div>
  );
}
