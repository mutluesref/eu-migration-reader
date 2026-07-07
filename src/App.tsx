import { useState, useCallback, useRef, useEffect } from 'react';
import { getRegulationNumber } from './data/documents';
import { isExternalDoc, getExternalCelex, getExternalName, getEurlexUrl } from './utils/referenceDetection';
import { useStore } from './store';
import useTheme from './hooks/useTheme';
import useOnboarding from './hooks/useOnboarding';
import useBookmarks from './hooks/useBookmarks';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useArticleNavigation } from './hooks/useArticleNavigation';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useDocumentLoader } from './hooks/useDocumentLoader';
import Sidebar from './components/Sidebar';
import ArticleViewer from './components/ArticleViewer';
import ReferenceInspector from './components/ReferenceInspector';
import SearchPanel from './components/SearchPanel';
import Onboarding from './components/Onboarding';
import ShortcutsHelp from './components/ShortcutsHelp';
import Toast from './components/Toast';
import SkeletonLoader from './components/SkeletonLoader';
import ErrorBoundary from './components/ErrorBoundary';
import { DOC_BORDER_COLORS, DOC_BADGE_COLORS } from './constants/docColors';

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
  const articleScrollRef = useRef<HTMLDivElement>(null);
  const sidebarResizing = useRef(false);

  const { documents, loading, currentDoc, reverseIndex } = useDocumentLoader();
  const { handlePrevArticle, handleNextArticle } = useArticleNavigation(documents);
  const { scrollProgress, showScrollTop, scrollToTop, handleScroll } = useScrollProgress(articleScrollRef);

  const compareRef = useStore(s => s.compareRef);
  const showCompare = useStore(s => s.showCompare);
  const showShortcuts = useStore(s => s.showShortcuts);
  const setShowShortcuts = useStore(s => s.setShowShortcuts);
  const setCompareRef = useStore(s => s.setCompareRef);
  const setShowCompare = useStore(s => s.setShowCompare);

  const handleCloseSearch = useCallback(() => setShowSearch(false), [setShowSearch]);
  const handleCloseInspector = useCallback(() => setShowInspector(false), [setShowInspector]);
  const handleClearInspectedRef = useCallback(() => setInspectedRef(null), [setInspectedRef]);
  const handleToggleShortcuts = useCallback(() => setShowShortcuts(!showShortcuts), [showShortcuts, setShowShortcuts]);

  useKeyboardShortcuts({
    onToggleSearch: toggleSearch,
    onToggleSidebar: toggleSidebar,
    onCloseSearch: handleCloseSearch,
    onCloseInspector: handleCloseInspector,
    onClearInspectedRef: handleClearInspectedRef,
    onPrevArticle: handlePrevArticle,
    onNextArticle: handleNextArticle,
    onToggleShortcuts: handleToggleShortcuts,
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const handleReferenceClick = useCallback((docId: string, articleNumber: string) => {
    setInspectedRef({ documentId: docId, articleNumber });
    setShowInspector(true);
  }, [setInspectedRef, setShowInspector]);

  const handleCompare = useCallback((docId: string, articleNumber: string) => {
    setCompareRef({ documentId: docId, articleNumber });
    setShowCompare(true);
  }, [setCompareRef, setShowCompare]);

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

      <ShortcutsHelp
        show={showShortcuts}
        onClose={() => setShowShortcuts(false)}
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
        <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-surface-200/50 dark:bg-surface-700/50">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-violet-500 transition-[width] duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}

      {/* Header */}
      <header className="glass dark:bg-surface-900/80 border-b border-surface-200/60 dark:border-surface-700/60 flex-shrink-0 z-20 transition-colors">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="btn-icon"
              title="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="w-px h-6 bg-surface-200 dark:bg-surface-700" />
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">EU</span>
              </div>
              <h1 className="text-sm font-semibold text-surface-700 dark:text-surface-200 tracking-tight">
                Migration & Asylum Reader
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Navigation */}
            <div className="flex items-center gap-0.5 bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
              <button
                onClick={handlePrevArticle}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-surface-700 text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-all duration-150"
                title="Previous article"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNextArticle}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-surface-700 text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-all duration-150"
                title="Next article"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Font size */}
            <div className="flex items-center gap-0.5 bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
              <button
                onClick={() => setFontSize(fontSize - 1)}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-surface-700 text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-all duration-150"
                title="Decrease font size"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-[10px] font-semibold text-surface-400 dark:text-surface-500 w-6 text-center select-none">
                {fontSize}
              </span>
              <button
                onClick={() => setFontSize(fontSize + 1)}
                className="p-2 rounded-lg hover:bg-white dark:hover:bg-surface-700 text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-all duration-150"
                title="Increase font size"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-0.5">
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

              <button
                onClick={handleToggleBookmark}
                className={`btn-icon ${bookmarked ? 'text-accent-amber' : ''}`}
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

              <button
                onClick={cycleTheme}
                className="btn-icon"
                title={`Theme: ${useStore.getState().theme}`}
              >
                {themeIcon}
              </button>
            </div>
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
            className={`${showCompare ? 'w-1/2' : 'w-full'} overflow-y-auto custom-scrollbar relative transition-[width] duration-300`}
            onScroll={handleScroll}
          >
            <ErrorBoundary>
              <div className={`border-l-4 ${DOC_BORDER_COLORS[currentDocId] || ''}`}>
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

          {/* Compare pane */}
          {showCompare && compareRef && (() => {
            const compareDoc = documents.find(d => d.id === compareRef.documentId);
            const compareArticle = compareDoc?.articles.find(a => String(a.number) === compareRef.articleNumber);
            if (!compareDoc || !compareArticle) return null;
            return (
              <div className="w-1/2 border-l border-slate-200 dark:border-slate-700 overflow-y-auto custom-scrollbar relative flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${DOC_BADGE_COLORS[compareRef.documentId] || 'bg-slate-100 text-slate-600'}`}>
                      {compareDoc.shortName}
                    </span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                      {compareArticle.title}
                    </span>
                  </div>
                  <button
                    onClick={() => { setShowCompare(false); setCompareRef(null); }}
                    className="btn-icon ml-2 flex-shrink-0"
                    title="Close comparison"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <ErrorBoundary>
                    <div className={`border-l-4 ${DOC_BADGE_COLORS[compareRef.documentId] ? '' : ''}`}>
                      <ArticleViewer
                        document={compareDoc}
                        articleNumber={compareRef.articleNumber}
                        documents={documents}
                        onReferenceClick={handleReferenceClick}
                        onReferenceNavigate={handleReferenceNavigate}
                      />
                    </div>
                  </ErrorBoundary>
                </div>
              </div>
            );
          })()}

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
                    onCompare={handleCompare}
                    reverseIndex={reverseIndex}
                    documents={documents}
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
      <footer className="glass dark:bg-surface-900/80 border-t border-surface-200/60 dark:border-surface-700/60 px-4 py-2 text-xs text-surface-400 dark:text-surface-500 flex-shrink-0 flex items-center justify-between transition-colors">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse-subtle" />
          <span className="font-medium text-surface-600 dark:text-surface-300">{currentDoc?.shortName}</span>
          <span className="text-surface-300 dark:text-surface-600">·</span>
          <span>{getRegulationNumber(currentDocId)}</span>
          <span className="text-surface-300 dark:text-surface-600">·</span>
          <span>{currentArticleNumber === 'recitals' ? 'Recitals' : `Article ${currentArticleNumber}`}</span>
        </span>
        <span className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-md text-[10px] font-medium text-surface-500 dark:text-surface-400">⌘F</kbd>
            <span>Search</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-md text-[10px] font-medium text-surface-500 dark:text-surface-400">⌥←→</kbd>
            <span>Navigate</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-md text-[10px] font-medium text-surface-500 dark:text-surface-400">Esc</kbd>
            <span>Close</span>
          </span>
        </span>
      </footer>
    </div>
  );
}
