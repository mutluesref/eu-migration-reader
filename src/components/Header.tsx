import { memo } from 'react';

interface Props {
  showSearch: boolean;
  showInspector: boolean;
  hasInspectedRef: boolean;
  bookmarked: boolean;
  theme: string;
  isDark: boolean;
  fontSize: number;
  onToggleSidebar: () => void;
  onPrevArticle: () => void;
  onNextArticle: () => void;
  onDecreaseFontSize: () => void;
  onIncreaseFontSize: () => void;
  onToggleSearch: () => void;
  onToggleInspector: () => void;
  onToggleBookmark: () => void;
  onCycleTheme: () => void;
}

function Header({
  showSearch,
  showInspector,
  hasInspectedRef,
  bookmarked,
  theme,
  isDark,
  fontSize,
  onToggleSidebar,
  onPrevArticle,
  onNextArticle,
  onDecreaseFontSize,
  onIncreaseFontSize,
  onToggleSearch,
  onToggleInspector,
  onToggleBookmark,
  onCycleTheme,
}: Props) {
  const themeIcon = isDark ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );

  return (
    <header className="glass dark:bg-surface-900/80 border-b border-surface-200/60 dark:border-surface-700/60 flex-shrink-0 z-20 transition-colors">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="btn-icon" title="Toggle sidebar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 6h16M4 12h16M4 18h16"
              />
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
          <div className="flex items-center gap-0.5 bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
            <button
              onClick={onPrevArticle}
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-surface-700 text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-all duration-150"
              title="Previous article"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={onNextArticle}
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-surface-700 text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-all duration-150"
              title="Next article"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-0.5 bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
            <button
              onClick={onDecreaseFontSize}
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
              onClick={onIncreaseFontSize}
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-surface-700 text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-all duration-150"
              title="Increase font size"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={onToggleSearch}
              className={`btn-icon ${showSearch ? 'btn-icon-active' : ''}`}
              title="Search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            {hasInspectedRef && (
              <button
                onClick={onToggleInspector}
                className={`btn-icon ${showInspector ? 'btn-icon-active' : ''}`}
                title="Toggle reference inspector"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={onToggleBookmark}
              className={`btn-icon ${bookmarked ? 'text-accent-amber' : ''}`}
              title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {bookmarked ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              )}
            </button>
            <button onClick={onCycleTheme} className="btn-icon" title={`Theme: ${theme}`}>
              {themeIcon}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default memo(Header);
