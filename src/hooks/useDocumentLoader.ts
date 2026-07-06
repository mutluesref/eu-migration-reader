import { useState, useEffect, useMemo } from 'react';
import type { DocumentData } from '../types';
import { getAllDocuments } from '../data/documents';
import { useStore } from '../store';

export function useDocumentLoader() {
  const currentDocId = useStore(s => s.currentDocId);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDoc = useMemo(
    () => documents.find(d => d.id === currentDocId),
    [documents, currentDocId]
  );

  useEffect(() => {
    const docs = getAllDocuments();
    setDocuments(docs);
    setLoading(false);
  }, []);

  return { documents, loading, currentDoc };
}
