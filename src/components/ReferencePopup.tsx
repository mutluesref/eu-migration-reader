import { memo, useEffect, useMemo } from 'react';
import { splitIntoParagraphs } from '../utils/text';

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
  isTouchDevice: boolean;
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
  isTouchDevice,
}: Props) {
  const paragraphs = useMemo(() => splitIntoParagraphs(popup.content), [popup.content]);

  // Focus the popup container on mount for keyboard accessibility
  useEffect(() => {
    if (popupRef.current) {
      popupRef.current.focus();
    }
  }, [popupRef]);

  if (isTouchDevice) {
    return (
      <>
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          onTouchEnd={onClose}
        />
        <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4">
          <div
            ref={popupRef as React.RefObject<HTMLDivElement>}
            role="dialog"
            aria-label={`${popup.docName} - ${popup.articleTitle}`}
            aria-modal="true"
            tabIndex={-1}
            className="w-full max-w-lg max-h-[80vh] bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200/60 dark:border-surface-700/60 flex flex-col overflow-hidden pointer-events-auto animate-scale-in outline-none"
          >
            <div className="px-5 pt-5 pb-3 border-b border-surface-100 dark:border-surface-700/50 flex-shrink-0">
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
            <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4">
              <div className="space-y-3">
                {paragraphs.map((p, i) => (
                  <p key={i} className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </div>
            <div className="px-5 py-4 border-t border-surface-100 dark:border-surface-700/50 flex gap-3 flex-shrink-0">
              <button
                onClick={onClose}
                onTouchEnd={onClose}
                className="flex-1 px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-700 rounded-xl active:scale-95 transition-transform"
              >
                Close
              </button>
              <button
                onClick={onClickInspect}
                onTouchEnd={onClickInspect}
                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-brand-600 rounded-xl active:scale-95 transition-transform"
              >
                Open in inspector
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        ref={popupRef as React.RefObject<HTMLDivElement>}
        role="tooltip"
        aria-label={`${popup.docName} - ${popup.articleTitle}`}
        tabIndex={-1}
        className="reference-popup cursor-pointer z-50 outline-none"
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
        <div className="max-h-64 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                {p}
              </p>
            ))}
          </div>
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
