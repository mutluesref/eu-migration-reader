import { memo } from 'react';
import { getRegulationNumber } from '../data/documents';

export interface PopupInfo {
  x: number;
  y: number;
  content: string;
  docName: string;
  articleTitle: string;
  subject: string;
}

interface Props {
  popup: PopupInfo;
  popupRef: React.RefObject<HTMLDivElement | null>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  copyRegNum: (text: string) => void;
  regulationNumber: string;
}

function ReferencePopup({
  popup,
  popupRef,
  onMouseEnter,
  onMouseLeave,
  copyRegNum,
  regulationNumber,
}: Props) {
  return (
    <div
      ref={popupRef as React.RefObject<HTMLDivElement>}
      className="reference-popup"
      style={{ position: 'fixed', left: popup.x, top: popup.y }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-slate-100">
        <span
          className="text-xs text-blue-600 font-semibold uppercase tracking-wider truncate cursor-context-menu"
          title="Right-click to copy"
          onContextMenu={e => {
            e.preventDefault();
            copyRegNum(regulationNumber);
          }}
        >
          {popup.docName}
        </span>
        <span className="text-xs text-slate-300">|</span>
        <span className="text-xs font-medium text-slate-700 truncate">
          {popup.articleTitle}
        </span>
      </div>
      {popup.subject && (
        <p className="text-xs font-medium text-slate-500 italic mb-1.5 truncate">
          {popup.subject}
        </p>
      )}
      <div className="text-sm text-slate-600 leading-relaxed">
        {popup.content}
      </div>
    </div>
  );
}

export default memo(ReferencePopup);
