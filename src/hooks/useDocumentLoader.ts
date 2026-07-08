import { useMemo } from 'react';
import { getAllDocuments } from '../data/documents';
import { useStore } from '../store';
import { buildReverseIndex } from '../utils/reverseReferences';

const allDocuments = getAllDocuments();
const allReverseIndex = buildReverseIndex(allDocuments);

export function useDocumentLoader() {
  const currentDocId = useStore((s) => s.currentDocId);

  const currentDoc = useMemo(() => allDocuments.find((d) => d.id === currentDocId), [currentDocId]);

  const reverseIndex = useMemo(() => allReverseIndex, []);

  return { documents: allDocuments, loading: false, currentDoc, reverseIndex };
}
