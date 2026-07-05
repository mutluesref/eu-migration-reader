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
      <div className="card p-4 sm:p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider text-blue-600 font-semibold">
              {doc.shortName}
            </span>
            <span className="text-[10px] text-slate-400">{regNumber}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Recitals</h2>
          <p className="text-xs text-slate-400 mt-1">
            {doc.recitals.length} recitals
          </p>
        </div>
        <div className="space-y-4">
          {doc.recitals.map(recital => (
            <div
              key={recital.number}
              className="text-sm leading-relaxed text-slate-600 pl-6 border-l-2 border-slate-100 relative"
            >
              <span className="font-semibold text-slate-400 absolute -ml-6">
                ({recital.number})
              </span>
              {recital.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(RecitalView);
