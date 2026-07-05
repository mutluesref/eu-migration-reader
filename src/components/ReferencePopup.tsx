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
  copyRegNum: (text: string) => void;
  regulationNumber: string;
}

function ReferencePopup({
  popup,
  popupRef,
  onMouseEnter,
  onMouseLeave,
  onClickInspect,
  copyRegNum,
  regulationNumber,
}: Props) {
  return (
    <div
      ref={popupRef as React.RefObject<HTMLDivElement>}
      className="reference-popup cursor-pointer"
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
          Tap to inspect · Double-tap to navigate
        </p>
      </div>
    </div>
  );
}

export default memo(ReferencePopup);
