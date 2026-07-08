import { useState, useCallback, useRef, useEffect } from 'react';
import { useStore } from './store';
import useTheme from './hooks/useTheme';
import useOnboarding from './hooks/useOnboarding';
import useBookmarks from './hooks/useBookmarks';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useArticleNavigation } from './hooks/useArticleNavigation';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useDocumentLoader } from './hooks/useDocumentLoader';
import Header from './components/Header';
import Footer from './components/Footer';
import SidebarPanel from './components/SidebarPanel';
import SearchPanel from './components/SearchPanel';
import ReaderPane from './components/ReaderPane';
import ComparePane from './components/ComparePane';
import InspectorPanel from './components/InspectorPanel';
import ProgressBar from './components/ProgressBar';
import Onboarding from './components/Onboarding';
import ShortcutsHelp from './components/ShortcutsHelp';
import Toast from './components/Toast';
import SkeletonLoader from './components/SkeletonLoader';

export default function App() {
  const currentDocId = useStore((s) => s.currentDocId);
  const currentArticleNumber = useStore((s) => s.currentArticleNumber);
  const inspectedRef = useStore((s) => s.inspectedRef);
  const showSearch = useStore((s) => s.showSearch);
  const searchQuery = useStore((s) => s.searchQuery);
  const showSidebar = useStore((s) => s.showSidebar);
  const showInspector = useStore((s) => s.showInspector);
  const sidebarWidth = useStore((s) => s.sidebarWidth);
  const fontSize = useStore((s) => s.fontSize);
  const theme = useStore((s) => s.theme);
  const compareRef = useStore((s) => s.compareRef);
  const showCompare = useStore((s) => s.showCompare);
  const showShortcuts = useStore((s) => s.showShortcuts);

  const navigateTo = useStore((s) => s.navigateTo);
  const setInspectedRef = useStore((s) => s.setInspectedRef);
  const toggleSearch = useStore((s) => s.toggleSearch);
  const setShowSearch = useStore((s) => s.setShowSearch);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const setShowSidebar = useStore((s) => s.setShowSidebar);
  const setSidebarWidth = useStore((s) => s.setSidebarWidth);
  const toggleInspector = useStore((s) => s.toggleInspector);
  const setShowInspector = useStore((s) => s.setShowInspector);
  const setShowShortcuts = useStore((s) => s.setShowShortcuts);
  const setCompareRef = useStore((s) => s.setCompareRef);
  const setShowCompare = useStore((s) => s.setShowCompare);
  const setFontSize = useStore((s) => s.setFontSize);

  const { isDark, setTheme: setThemeFn } = useTheme();
  const { showOnboarding, dismissOnboarding, stepIndex, nextStep, prevStep } = useOnboarding();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const articleScrollRef = useRef<HTMLDivElement>(null);

  const { documents, loading, currentDoc, reverseIndex } = useDocumentLoader();
  const { handlePrevArticle, handleNextArticle } = useArticleNavigation(documents);
  const { scrollProgress, showScrollTop, scrollToTop, handleScroll } =
    useScrollProgress(articleScrollRef);

  const handleCloseSearch = useCallback(() => setShowSearch(false), [setShowSearch]);
  const handleCloseInspector = useCallback(() => {
    setShowInspector(false);
    setInspectedRef(null);
  }, [setShowInspector, setInspectedRef]);
  const handleClearInspectedRef = useCallback(() => setInspectedRef(null), [setInspectedRef]);
  const handleToggleShortcuts = useCallback(
    () => setShowShortcuts(!showShortcuts),
    [showShortcuts, setShowShortcuts],
  );

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

  const handleReferenceClick = useCallback(
    (docId: string, articleNumber: string) => {
      setInspectedRef({ documentId: docId, articleNumber });
      setShowInspector(true);
    },
    [setInspectedRef, setShowInspector],
  );

  const handleCompare = useCallback(
    (docId: string, articleNumber: string) => {
      setCompareRef({ documentId: docId, articleNumber });
      setShowCompare(true);
    },
    [setCompareRef, setShowCompare],
  );

  const handleReferenceNavigate = useCallback(
    (docId: string, articleNumber: string) => {
      navigateTo(docId, articleNumber);
    },
    [navigateTo],
  );

  const handleSearchResultClick = useCallback(
    (docId: string, articleNumber: string) => {
      setInspectedRef({ documentId: docId, articleNumber });
      setShowInspector(true);
    },
    [setInspectedRef, setShowInspector],
  );

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
    ? documents.find((d) => d.id === inspectedRef.documentId)
    : undefined;
  const inspectedArticle =
    inspectedDoc && inspectedRef
      ? inspectedDoc.articles.find((a) => String(a.number) === inspectedRef.articleNumber)
      : undefined;

  const bookmarked = isBookmarked(currentDocId, currentArticleNumber);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors">
      <Onboarding
        show={showOnboarding}
        step={stepIndex}
        onNext={nextStep}
        onPrev={prevStep}
        onDismiss={dismissOnboarding}
      />
      <ShortcutsHelp show={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ProgressBar scrollProgress={scrollProgress} />

      <Header
        showSearch={showSearch}
        showInspector={showInspector}
        hasInspectedRef={!!inspectedRef}
        bookmarked={bookmarked}
        theme={theme}
        isDark={isDark}
        fontSize={fontSize}
        onToggleSidebar={toggleSidebar}
        onPrevArticle={handlePrevArticle}
        onNextArticle={handleNextArticle}
        onDecreaseFontSize={() => setFontSize(fontSize - 1)}
        onIncreaseFontSize={() => setFontSize(fontSize + 1)}
        onToggleSearch={toggleSearch}
        onToggleInspector={toggleInspector}
        onToggleBookmark={handleToggleBookmark}
        onCycleTheme={cycleTheme}
      />

      {showSearch && (
        <SearchPanel
          documents={documents}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onResultClick={handleSearchResultClick}
          onClose={() => setShowSearch(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <SidebarPanel
          showSidebar={showSidebar}
          sidebarWidth={sidebarWidth}
          documents={documents}
          currentDocId={currentDocId}
          currentArticleNumber={currentArticleNumber}
          onNavigate={navigateTo}
          onClose={() => setShowSidebar(false)}
          onResize={setSidebarWidth}
        />

        <div className="flex-1 overflow-hidden flex">
          <ReaderPane
            currentDoc={currentDoc}
            currentDocId={currentDocId}
            currentArticleNumber={currentArticleNumber}
            documents={documents}
            showCompare={showCompare}
            showScrollTop={showScrollTop}
            articleScrollRef={articleScrollRef}
            onReferenceClick={handleReferenceClick}
            onReferenceNavigate={handleReferenceNavigate}
            onScroll={handleScroll}
            onScrollToTop={scrollToTop}
          />

          <ComparePane
            compareRef={compareRef}
            showCompare={showCompare}
            documents={documents}
            onReferenceClick={handleReferenceClick}
            onReferenceNavigate={handleReferenceNavigate}
            onClose={() => {
              setShowCompare(false);
              setCompareRef(null);
            }}
          />

          <InspectorPanel
            showInspector={showInspector}
            inspectedRef={inspectedRef}
            inspectedDoc={inspectedDoc}
            inspectedArticle={inspectedArticle}
            reverseIndex={reverseIndex}
            onClose={handleCloseInspector}
            onNavigate={handleReferenceNavigate}
            onCompare={handleCompare}
          />
        </div>
      </div>

      <Footer
        currentDocId={currentDocId}
        currentArticleNumber={currentArticleNumber}
        currentDocShortName={currentDoc?.shortName}
      />
    </div>
  );
}
