import { memo } from 'react';
import type { DocumentData, Article } from '../types';
import type { ReverseReference } from '../utils/reverseReferences';
import { isExternalDoc } from '../services/references';
import ReferenceInspector from './ReferenceInspector';
import ExternalReferencePanel from './ExternalReferencePanel';

interface Props {
  showInspector: boolean;
  inspectedRef: { documentId: string; articleNumber: string } | null;
  inspectedDoc: DocumentData | undefined;
  inspectedArticle: Article | undefined;
  reverseIndex: Map<string, ReverseReference[]>;
  onClose: () => void;
  onNavigate: (docId: string, articleNumber: string) => void;
  onCompare: (docId: string, articleNumber: string) => void;
}

function InspectorPanel({
  showInspector,
  inspectedRef,
  inspectedDoc,
  inspectedArticle,
  reverseIndex,
  onClose,
  onNavigate,
  onCompare,
}: Props) {
  if (!showInspector || !inspectedRef) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={onClose} />
      <div className="flex flex-col panel-transition fixed inset-y-0 right-0 z-40 bg-white dark:bg-slate-800 shadow-xl w-96 max-w-[92vw] md:static md:z-auto md:shadow-none md:border-l md:border-slate-200 dark:md:border-slate-700 md:flex-shrink-0 overflow-hidden transition-colors">
        {inspectedDoc && inspectedArticle ? (
          <ReferenceInspector
            document={inspectedDoc}
            article={inspectedArticle}
            onClose={onClose}
            onNavigate={onNavigate}
            onCompare={onCompare}
            reverseIndex={reverseIndex}
          />
        ) : isExternalDoc(inspectedRef.documentId) ? (
          <ExternalReferencePanel
            docId={inspectedRef.documentId}
            articleNumber={inspectedRef.articleNumber}
            onClose={onClose}
          />
        ) : (
          <div className="p-8 text-center text-sm text-slate-400 dark:text-slate-500">
            Article not found in this document.
          </div>
        )}
      </div>
    </>
  );
}

export default memo(InspectorPanel);
