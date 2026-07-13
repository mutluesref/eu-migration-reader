import { memo, useRef, type MouseEvent } from 'react';
import type { DocumentData, DocumentIndex } from '../types';
import Sidebar from './Sidebar';

interface Props {
  showSidebar: boolean;
  sidebarWidth: number;
  documents: DocumentData[];
  documentIndex: DocumentIndex[];
  currentDocId: string;
  currentArticleNumber: string;
  onNavigate: (docId: string, articleNumber: string) => void;
  onLoadDocument: (docId: string) => Promise<DocumentData | undefined>;
  onClose: () => void;
  onResize: (width: number) => void;
}

function SidebarPanel({
  showSidebar,
  sidebarWidth,
  documents,
  documentIndex,
  currentDocId,
  currentArticleNumber,
  onNavigate,
  onLoadDocument,
  onClose,
  onResize,
}: Props) {
  const sidebarResizing = useRef(false);

  if (!showSidebar) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={onClose} />
      <div className="flex flex-col overflow-hidden sidebar-enter fixed inset-y-0 left-0 z-40 bg-white dark:bg-slate-800 shadow-xl md:relative md:z-auto md:shadow-none md:border-r md:border-slate-200 dark:md:border-slate-700 transition-colors">
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{ width: sidebarWidth, minWidth: sidebarWidth }}
        >
          <Sidebar
            documents={documents}
            documentIndex={documentIndex}
            currentDocId={currentDocId}
            currentArticleNumber={currentArticleNumber}
            onNavigate={onNavigate}
            onLoadDocument={onLoadDocument}
            onClose={onClose}
          />
        </div>
        <div
          className="hidden md:block absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400/30 active:bg-blue-400/50 transition-colors"
          onMouseDown={(e: MouseEvent) => {
            e.preventDefault();
            sidebarResizing.current = true;
            const startX = e.clientX;
            const startW = sidebarWidth;
            const onMove = (ev: globalThis.MouseEvent) => {
              if (!sidebarResizing.current) return;
              const newW = Math.max(200, Math.min(500, startW + ev.clientX - startX));
              onResize(newW);
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
  );
}

export default memo(SidebarPanel);
