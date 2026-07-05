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
      'Navigate and cross-reference EU migration regulations with linked articles and recitals.',
    target: '',
  },
  {
    title: 'Document Sidebar',
    description:
      'Browse all available regulations in the sidebar. Click any document to expand its article list.',
    target: 'sidebar',
  },
  {
    title: 'Article Navigation',
    description:
      'Click an article to read it. Use the breadcrumbs to jump between parts, chapters, and sections.',
    target: 'article',
  },
  {
    title: 'Cross-References',
    description:
      'Click a blue reference link to inspect it in the side panel. Double-click to navigate directly to that article.',
    target: 'references',
  },
  {
    title: 'You\'re All Set',
    description:
      'Start exploring the regulations. Use the search bar to quickly find articles across all documents.',
    target: '',
  },
];

function Onboarding({ show, step, onNext, onPrev, onDismiss }: Props) {
  if (!show || step < 0 || step >= steps.length) return null;

  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onDismiss}
      />
      <div className="relative z-10 card max-w-md mx-4 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-6 bg-blue-600'
                    : i < step
                    ? 'w-1.5 bg-blue-300'
                    : 'w-1.5 bg-slate-200'
                }`}
              />
            ))}
          </div>
          <button
            onClick={onDismiss}
            className="btn-icon"
            title="Skip tutorial"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-2">
          {current.title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          {current.description}
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={onPrev}
            disabled={isFirst}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              isFirst
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Back
          </button>
          <div className="flex items-center gap-2">
            {!isLast && (
              <button
                onClick={onDismiss}
                className="text-sm text-slate-400 hover:text-slate-600 px-3 py-2 transition-colors"
              >
                Skip
              </button>
            )}
            <button
              onClick={isLast ? onDismiss : onNext}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {isLast ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(Onboarding);
