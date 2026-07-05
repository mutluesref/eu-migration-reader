import { memo } from 'react';

export interface PopupInfo {
  x: number;
  y: number;
  content: string;
  docName: string;
  articleTitle: string;
  subject: string;
  refDocId: string;
  refArticleNumber: string;
}

interface Props {
  popup: PopupInfo;
  popupRef: React.RefObject<HTMLDivElement | null>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClickInspect: () => void;
  onClose: () => void;
  copyRegNum: (text: string) => void;
  regulationNumber: string;
}

function ReferencePopup({
  popup,
  popupRef,
  onMouseEnter,
  onMouseLeave,
  onClickInspect,
  onClose,
  copyRegNum,
  regulationNumber,
}: Props) {
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  if (isTouchDevice) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <div
          ref={popupRef as React.RefObject<HTMLDivElement>}
          className="relative w-full max-w-md bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-surface-200/60 dark:border-surface-700/60 overflow-hidden animate-slide-up"
        >
          <div className="px-4 pt-4 pb-3 border-b border-surface-100 dark:border-surface-700/50">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold uppercase tracking-wider">
                {popup.docName}
              </span>
              <span className="text-xs text-surface-300 dark:text-surface-600">·</span>
              <span className="text-xs font-medium text-surface-700 dark:text-surface-300 truncate">
                {popup.articleTitle}
              </span>
            </div>
            {popup.subject && (
              <p className="text-xs font-medium text-surface-500 dark:text-surface-400 italic truncate">
                {popup.subject}
              </p>
            )}
          </div>
          <div className="px-4 py-3 max-h-48 overflow-y-auto">
            <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
              {popup.content}
            </p>
          </div>
          <div className="px-4 py-3 border-t border-surface-100 dark:border-surface-700/50 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-700 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onClickInspect}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors"
            >
              Open in inspector
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
      <div
        ref={popupRef as React.RefObject<HTMLDivElement>}
        className="reference-popup cursor-pointer z-50"
        style={{ position: 'fixed', left: popup.x, top: popup.y }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClickInspect}
      >
        <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-surface-200/60 dark:border-surface-700/60">
          <span
            className="text-xs text-brand-600 dark:text-brand-400 font-semibold uppercase tracking-wider truncate"
            title="Right-click to copy"
            onContextMenu={e => {
              e.preventDefault();
              copyRegNum(regulationNumber);
            }}
          >
            {popup.docName}
          </span>
          <span className="text-xs text-surface-300 dark:text-surface-600">·</span>
          <span className="text-xs font-medium text-surface-700 dark:text-surface-300 truncate">
            {popup.articleTitle}
          </span>
        </div>
        {popup.subject && (
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400 italic mb-1.5 truncate">
            {popup.subject}
          </p>
        )}
        <div className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
          {popup.content}
        </div>
        <div className="mt-2 pt-2 border-t border-surface-200/60 dark:border-surface-700/60">
          <p className="text-[10px] text-surface-400 dark:text-surface-500">
            Click to inspect · Click outside to close
          </p>
        </div>
      </div>
    </>
  );
}

export default memo(ReferencePopup);
