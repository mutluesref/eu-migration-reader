import { useState, useEffect, useMemo } from 'react';
import type { DocumentData } from '../types';
import { getAllDocuments } from '../data/documents';
import { useStore } from '../store';
import { buildReverseIndex, type ReverseReference } from '../utils/reverseReferences';

export function useDocumentLoader() {
  const currentDocId = useStore(s => s.currentDocId);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDoc = useMemo(
    () => documents.find(d => d.id === currentDocId),
    [documents, currentDocId]
  );

  const reverseIndex = useMemo(
    () => documents.length > 0 ? buildReverseIndex(documents) : new Map<string, ReverseReference[]>(),
    [documents]
  );

  useEffect(() => {
    const docs = getAllDocuments();
    setDocuments(docs);
    setLoading(false);
  }, []);

  return { documents, loading, currentDoc, reverseIndex };
}
