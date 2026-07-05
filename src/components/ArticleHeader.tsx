import { memo } from 'react';
import type { DocumentData, Article } from '../types';
import { getRegulationNumber } from '../data/documents';

interface Props {
  doc: DocumentData;
  article: Article;
  copiedReg: boolean;
  onCopyReg: (text: string) => void;
}

function ArticleHeader({ doc, article, copiedReg, onCopyReg }: Props) {
  const regNumber = getRegulationNumber(doc.id);

  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-100 rounded-t-xl">
      <div className="px-4 sm:px-6 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-wider text-blue-600 font-semibold">
            {doc.shortName}
          </span>
          <span
            className="text-[10px] text-slate-400 cursor-context-menu"
            title="Right-click to copy"
            onContextMenu={e => {
              e.preventDefault();
              onCopyReg(regNumber);
            }}
          >
            {regNumber}
          </span>
          {copiedReg && (
            <span className="text-[10px] text-emerald-600 font-medium">Copied!</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          {article.part && (
            <span className="font-medium text-slate-500">
              {article.part.replace(/^(\w+):\s*/, 'Part $1 — ')}
            </span>
          )}
          {article.chapter && (
            <>
              <span className="text-slate-300">|</span>
              <span className="font-medium text-slate-500">
                {article.chapter.replace(/^(\w+):\s*/, 'Chapter $1 — ')}
              </span>
            </>
          )}
          {article.section && (
            <>
              <span className="text-slate-300">|</span>
              <span className="font-medium text-slate-500">
                {article.section.replace(/^(\w+):\s*/, 'Section $1 — ')}
              </span>
            </>
          )}
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          {article.title}
        </h2>
        {article.subject && (
          <p className="text-sm font-medium text-slate-500 mt-1 italic">
            {article.subject}
          </p>
        )}
      </div>
    </div>
  );
}

export default memo(ArticleHeader);
