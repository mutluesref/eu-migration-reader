import { memo } from 'react';

interface Props {
  show: boolean;
  step: number;
  onNext: () => void;
  onPrev: () => void;
  onDismiss: () => void;
}

const steps = [
  {
    title: 'Welcome to EU Migration Reader',
    description:
      'Read, search, and cross-reference the 9 EU Pact regulations on migration and asylum. Articles are interlinked for easy navigation.',
    icon: (
      <svg className="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    title: 'Browse Documents',
    description:
      'The sidebar lists all 9 regulations. Click any document to expand its article list. Use the hamburger menu to toggle the sidebar.',
    icon: (
      <svg className="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    ),
  },
  {
    title: 'Cross-References',
    description:
      'Blue underlined text links to other regulations. On desktop: hover to preview, click to inspect. On mobile: tap to preview, then tap "Open in inspector".',
    icon: (
      <svg className="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    ),
  },
  {
    title: 'Bookmarks & History',
    description:
      'Star any article to bookmark it. Your reading history is tracked automatically. Both are accessible in the sidebar below the documents list.',
    icon: (
      <svg className="w-8 h-8 text-accent-amber" fill="currentColor" viewBox="0 0 24 24">
        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
  {
    title: 'Customize Your View',
    description:
      'Toggle dark mode, adjust font size, and use ⌘F to search across all documents. Keyboard shortcuts: ⌥←/→ to navigate articles.',
    icon: (
      <svg className="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

function Onboarding({ show, step, onNext, onPrev, onDismiss }: Props) {
  if (!show || step < 0 || step >= steps.length) return null;

  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-md" onClick={onDismiss} />
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white dark:bg-surface-800 rounded-3xl shadow-2xl border border-surface-200/60 dark:border-surface-700/60 overflow-hidden">
          {/* Header with icon */}
          <div className="px-6 pt-8 pb-4 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mb-4">
              {current.icon}
            </div>
            <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50 mb-2">
              {current.title}
            </h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
              {current.description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-center gap-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === step
                      ? 'w-6 h-2 bg-brand-500'
                      : i < step
                        ? 'w-2 h-2 bg-brand-300 dark:bg-brand-600'
                        : 'w-2 h-2 bg-surface-200 dark:bg-surface-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="px-6 pb-6 flex items-center gap-3">
            {!isFirst && (
              <button
                onClick={onPrev}
                className="flex-1 px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-700 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={isFirst ? onNext : isLast ? onDismiss : onNext}
              className={`flex-1 px-4 py-3 text-sm font-medium text-white rounded-xl transition-colors ${
                isLast
                  ? 'bg-accent-emerald hover:bg-emerald-600'
                  : 'bg-brand-600 hover:bg-brand-700'
              }`}
            >
              {isFirst ? 'Get Started' : isLast ? 'Start Reading' : 'Next'}
            </button>
          </div>

          {/* Skip link */}
          {!isLast && (
            <div className="px-6 pb-6 -mt-3">
              <button
                onClick={onDismiss}
                className="w-full text-center text-xs text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
              >
                Skip tutorial
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(Onboarding);
