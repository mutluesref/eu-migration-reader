import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HistoryEntry } from './types';

export interface Bookmark {
  docId: string;
  articleNumber: string;
  label: string;
  timestamp: number;
}

export interface RecentArticle {
  docId: string;
  articleNumber: string;
  timestamp: number;
}

export type Theme = 'light' | 'dark' | 'system';

interface AppState {
  currentDocId: string;
  currentArticleNumber: string;
  inspectedRef: { documentId: string; articleNumber: string } | null;
  showSearch: boolean;
  searchQuery: string;
  showSidebar: boolean;
  sidebarWidth: number;
  showInspector: boolean;
  history: HistoryEntry[];
  historyIndex: number;
  theme: Theme;
  fontSize: number;
  bookmarks: Bookmark[];
  recentArticles: RecentArticle[];
  showOnboarding: boolean;
  _onboardingStep: number;

  navigateTo: (docId: string, articleNumber: string) => void;
  goToPrevArticle: (orderedArticles: string[]) => void;
  goToNextArticle: (orderedArticles: string[]) => void;
  setInspectedRef: (ref: { documentId: string; articleNumber: string } | null) => void;
  toggleSearch: () => void;
  setShowSearch: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  setShowSidebar: (show: boolean) => void;
  setSidebarWidth: (width: number) => void;
  toggleInspector: () => void;
  setShowInspector: (show: boolean) => void;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  addBookmark: (docId: string, articleNumber: string, label: string) => void;
  removeBookmark: (docId: string, articleNumber: string) => void;
  addRecentArticle: (docId: string, articleNumber: string) => void;
  dismissOnboarding: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentDocId: 'ammr',
      currentArticleNumber: '1',
      inspectedRef: null,
      showSearch: false,
      searchQuery: '',
      showSidebar: true,
      sidebarWidth: 280,
      showInspector: false,
      history: [{ documentId: 'ammr', articleNumber: '1' }],
      historyIndex: 0,
      theme: 'system',
      fontSize: 15,
      bookmarks: [],
      recentArticles: [],
      showOnboarding: !localStorage.getItem('eu-reader-onboarded'),
      _onboardingStep: 0,

      navigateTo: (docId, articleNumber) =>
        set((state) => {
          const newEntry: HistoryEntry = { documentId: docId, articleNumber };
          const trimmed = state.history.slice(0, state.historyIndex + 1);
          const newRecent = [
            { docId, articleNumber, timestamp: Date.now() },
            ...state.recentArticles.filter(
              (r) => !(r.docId === docId && r.articleNumber === articleNumber)
            ),
          ].slice(0, 20);
          return {
            currentDocId: docId,
            currentArticleNumber: articleNumber,
            inspectedRef: null,
            showInspector: false,
            history: [...trimmed, newEntry],
            historyIndex: trimmed.length,
            recentArticles: newRecent,
          };
        }),

      goToPrevArticle: (orderedArticles) =>
        set((state) => {
          const idx = orderedArticles.indexOf(state.currentArticleNumber);
          const prevIdx =
            idx === -1
              ? orderedArticles.length - 1
              : (idx - 1 + orderedArticles.length) % orderedArticles.length;
          const prev = orderedArticles[prevIdx];
          if (!prev) return {};
          const trimmed = state.history.slice(0, state.historyIndex + 1);
          return {
            currentArticleNumber: prev,
            history: [
              ...trimmed,
              { documentId: state.currentDocId, articleNumber: prev },
            ],
            historyIndex: trimmed.length,
          };
        }),

      goToNextArticle: (orderedArticles) =>
        set((state) => {
          const idx = orderedArticles.indexOf(state.currentArticleNumber);
          const nextIdx = idx === -1 ? 0 : (idx + 1) % orderedArticles.length;
          const next = orderedArticles[nextIdx];
          if (!next) return {};
          const trimmed = state.history.slice(0, state.historyIndex + 1);
          return {
            currentArticleNumber: next,
            history: [
              ...trimmed,
              { documentId: state.currentDocId, articleNumber: next },
            ],
            historyIndex: trimmed.length,
          };
        }),

      setInspectedRef: (ref) => set({ inspectedRef: ref }),

      toggleSearch: () => set((state) => ({ showSearch: !state.showSearch })),

      setShowSearch: (show) => set({ showSearch: show }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),

      setShowSidebar: (show) => set({ showSidebar: show }),

      setSidebarWidth: (width) => set({ sidebarWidth: width }),

      toggleInspector: () =>
        set((state) => ({ showInspector: !state.showInspector })),

      setShowInspector: (show) => set({ showInspector: show }),

      setTheme: (theme) => set({ theme }),

      setFontSize: (size) => set({ fontSize: Math.min(22, Math.max(12, size)) }),

      addBookmark: (docId, articleNumber, label) =>
        set((state) => {
          const exists = state.bookmarks.some(
            (b) => b.docId === docId && b.articleNumber === articleNumber
          );
          if (exists) return {};
          return {
            bookmarks: [
              { docId, articleNumber, label, timestamp: Date.now() },
              ...state.bookmarks,
            ],
          };
        }),

      removeBookmark: (docId, articleNumber) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter(
            (b) => !(b.docId === docId && b.articleNumber === articleNumber)
          ),
        })),

      addRecentArticle: (docId, articleNumber) =>
        set((state) => ({
          recentArticles: [
            { docId, articleNumber, timestamp: Date.now() },
            ...state.recentArticles.filter(
              (r) => !(r.docId === docId && r.articleNumber === articleNumber)
            ),
          ].slice(0, 20),
        })),

      dismissOnboarding: () => {
        localStorage.setItem('eu-reader-onboarded', '1');
        set({ showOnboarding: false });
      },
    }),
    {
      name: 'eu-migration-reader',
      partialize: (state) => ({
        theme: state.theme,
        fontSize: state.fontSize,
        bookmarks: state.bookmarks,
        recentArticles: state.recentArticles,
        showOnboarding: state.showOnboarding,
        showSidebar: state.showSidebar,
        sidebarWidth: state.sidebarWidth,
      }),
    }
  )
);
