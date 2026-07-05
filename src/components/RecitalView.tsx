import { memo } from 'react';
import type { DocumentData } from '../types';
import { getRegulationNumber } from '../data/documents';

interface Props {
  doc: DocumentData;
  regulationNumber?: string;
}

function RecitalView({ doc }: Props) {
  const regNumber = getRegulationNumber(doc.id);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="card overflow-hidden">
        <div className="px-5 sm:px-6 pt-6 pb-5 border-b border-surface-100 dark:border-surface-700/50">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="text-[11px] uppercase tracking-wider text-brand-600 dark:text-brand-400 font-semibold">
              {doc.shortName}
            </span>
            <span className="text-[10px] text-surface-400 dark:text-surface-500 font-mono">
              {regNumber}
            </span>
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50 tracking-tight">
            Recitals
          </h2>
          <p className="text-xs text-surface-400 dark:text-surface-500 mt-1.5 font-medium">
            {doc.recitals.length} recitals
          </p>
        </div>
        <div className="px-5 sm:px-6 py-5 space-y-4">
          {doc.recitals.map(recital => (
            <div
              key={recital.number}
              className="flex gap-3 text-sm leading-relaxed text-surface-600 dark:text-surface-400"
            >
              <span className="text-surface-300 dark:text-surface-600 font-mono text-xs mt-0.5 select-none flex-shrink-0">
                ({recital.number})
              </span>
              <p className="flex-1">{recital.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(RecitalView);
